require("dotenv").config();
const express=require("express");
const cors=require("cors");
const path=require("path");
const db=require("./db");
const authRoutes=require("./routes/auth");
const productRoutes=require("./routes/products");
const promoRoutes=require("./routes/promos");
const {requireAuth,optionalAuth,requireAdmin}=require("./middleware/auth");

const app=express();
const PORT=Number(process.env.PORT)||3000;

app.disable("x-powered-by");
app.use(cors({origin:true,credentials:true}));
app.use(express.json({limit:"2mb"}));

app.get("/api/health",async(_req,res)=>{
    try{await db.query("SELECT 1");res.json({success:true,server:"online",database:"online"});}
    catch(e){res.status(503).json({success:false,server:"online",database:"offline"});}
});
app.use("/api/auth",authRoutes);
app.use("/api/products",productRoutes);
app.use("/api/promos",promoRoutes);

app.get("/api/me",requireAuth,async(req,res)=>{
    const r=await db.query("SELECT id,name,phone,role,created_at FROM users WHERE id=$1",[req.user.id]);
    if(!r.rows.length)return res.status(404).json({success:false,message:"Foydalanuvchi topilmadi."});
    res.json({success:true,data:r.rows[0]});
});

app.post("/api/orders",optionalAuth,async(req,res)=>{
    const client=await db.connect();
    try{
        const {customer_name,phone,address,note,items,promo_code}=req.body;
        if(!String(customer_name||"").trim()||!String(phone||"").trim()||!String(address||"").trim()||!Array.isArray(items)||!items.length)
            return res.status(400).json({success:false,message:"Buyurtma ma’lumotlari to‘liq emas."});
        await client.query("BEGIN");
        let subtotal=0; const prepared=[];
        for(const raw of items.slice(0,50)){
            const quantity=Math.min(99,Math.max(1,Math.floor(Number(raw.quantity))));
            if(!Number.isFinite(quantity)) throw new Error("Mahsulot miqdori noto‘g‘ri.");
            const r=await client.query("SELECT id,name,price FROM products WHERE id=$1 AND available=true",[Number(raw.product_id)]);
            if(!r.rows.length)throw new Error("Mahsulot mavjud emas.");
            const p=r.rows[0], line=Number(p.price)*quantity;
            subtotal+=line; prepared.push({product_id:p.id,product_name:p.name,price:p.price,quantity,subtotal:line});
        }
        let discount=0, appliedPromo=null;
        if(promo_code){
            const r=await client.query(`SELECT * FROM promo_codes WHERE UPPER(code)=UPPER($1) AND active=true AND (expires_at IS NULL OR expires_at>NOW()) AND (max_uses IS NULL OR used_count<max_uses) FOR UPDATE`,[String(promo_code).trim()]);
            if(r.rows.length){
                const promo=r.rows[0];
                if(subtotal>=Number(promo.min_order)){
                    discount=promo.discount_type==="percent"?Math.floor(subtotal*Number(promo.discount_value)/100):Number(promo.discount_value);
                    discount=Math.min(discount,subtotal); appliedPromo=promo.code;
                }
            }
        }
        const deliveryFee=subtotal>=100000?0:10000;
        const total=Math.max(0,subtotal-discount+deliveryFee);
        const orderR=await client.query(
            `INSERT INTO orders(user_id,customer_name,phone,address,note,subtotal,discount,delivery_fee,total,promo_code,status) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'new') RETURNING *`,
            [req.user?.id||null,String(customer_name).trim(),String(phone).trim(),String(address).trim(),String(note||"").trim(),subtotal,discount,deliveryFee,total,appliedPromo]
        );
        const order=orderR.rows[0];
        for(const item of prepared) await client.query(
            `INSERT INTO order_items(order_id,product_id,product_name,price,quantity,subtotal) VALUES($1,$2,$3,$4,$5,$6)`,
            [order.id,item.product_id,item.product_name,item.price,item.quantity,item.subtotal]
        );
        if(appliedPromo) await client.query("UPDATE promo_codes SET used_count=used_count+1 WHERE code=$1",[appliedPromo]);
        await client.query("COMMIT");
        res.status(201).json({success:true,data:{...order,items:prepared}});
    }catch(e){
        await client.query("ROLLBACK").catch(()=>{});
        console.error(e);
        res.status(500).json({success:false,message:e.message||"Buyurtma berishda xato."});
    }finally{client.release();}
});

app.get("/api/my/orders",requireAuth,async(req,res)=>{
    try{
        const orders=await db.query(`SELECT * FROM orders WHERE user_id=$1 ORDER BY created_at DESC LIMIT 100`,[req.user.id]);
        for(const order of orders.rows){
            const items=await db.query(`SELECT product_id,product_name,price,quantity,subtotal FROM order_items WHERE order_id=$1 ORDER BY id`,[order.id]);
            order.items=items.rows;
        }
        res.json({success:true,data:orders.rows});
    }catch(e){console.error(e);res.status(500).json({success:false,message:"Buyurtmalarni olishda xato."});}
});

app.get("/api/admin/orders",requireAdmin,async(req,res)=>{
    try{
        const allowed=["new","preparing","delivering","completed","cancelled"];
        const status=allowed.includes(req.query.status)?req.query.status:null;
        const params=[]; let where="";
        if(status){params.push(status);where="WHERE status=$1";}
        const r=await db.query(`SELECT * FROM orders ${where} ORDER BY created_at DESC LIMIT 300`,params);
        for(const o of r.rows){const it=await db.query("SELECT * FROM order_items WHERE order_id=$1 ORDER BY id",[o.id]);o.items=it.rows;}
        res.json({success:true,data:r.rows});
    }catch(e){console.error(e);res.status(500).json({success:false,message:"Buyurtmalarni olishda xato."});}
});

app.patch("/api/admin/orders/:id/status",requireAdmin,async(req,res)=>{
    const allowed=["new","preparing","delivering","completed","cancelled"];
    if(!allowed.includes(req.body.status))return res.status(400).json({success:false,message:"Noto‘g‘ri status."});
    const r=await db.query("UPDATE orders SET status=$1,updated_at=NOW() WHERE id=$2 RETURNING *",[req.body.status,Number(req.params.id)]);
    if(!r.rows.length)return res.status(404).json({success:false,message:"Buyurtma topilmadi."});
    res.json({success:true,data:r.rows[0]});
});

app.get("/api/admin/customers",requireAdmin,async(_req,res)=>{
    try{
        const r=await db.query(`SELECT u.id,u.name,u.phone,u.role,u.created_at,COUNT(o.id)::int AS order_count,COALESCE(SUM(o.total),0)::bigint AS spent FROM users u LEFT JOIN orders o ON o.user_id=u.id WHERE u.role='customer' GROUP BY u.id ORDER BY u.created_at DESC`);
        res.json({success:true,data:r.rows.map(x=>({...x,spent:Number(x.spent)}))});
    }catch(e){console.error(e);res.status(500).json({success:false,message:"Mijozlarni olishda xato."});}
});

app.get("/api/admin/stats",requireAdmin,async(_req,res)=>{
    try{
        const [orders,products,customers,today]=await Promise.all([
            db.query("SELECT COUNT(*)::int count,COALESCE(SUM(total),0)::bigint sales FROM orders"),
            db.query("SELECT COUNT(*)::int count FROM products WHERE available=true"),
            db.query("SELECT COUNT(*)::int count FROM users WHERE role='customer'"),
            db.query("SELECT COUNT(*)::int count,COALESCE(SUM(total),0)::bigint sales FROM orders WHERE created_at::date=CURRENT_DATE")
        ]);
        res.json({success:true,data:{
            orders:orders.rows[0].count,sales:Number(orders.rows[0].sales),
            products:products.rows[0].count,customers:customers.rows[0].count,
            todayOrders:today.rows[0].count,todaySales:Number(today.rows[0].sales)
        }});
    }catch(e){console.error(e);res.status(500).json({success:false,message:"Statistikani olishda xato."});}
});

const frontendPath=path.join(__dirname,"../frontend");
app.use(express.static(frontendPath));
app.get("/",(_req,res)=>res.sendFile(path.join(frontendPath,"index.html")));
app.get("/admin",(_req,res)=>res.sendFile(path.join(frontendPath,"admin","index.html")));
app.get("/account",(_req,res)=>res.sendFile(path.join(frontendPath,"account","index.html")));

app.listen(PORT,"0.0.0.0",()=>console.log(`Lavash N1 server: http://localhost:${PORT}`));
