const express=require("express");
const db=require("../db");
const {requireAdmin}=require("../middleware/auth");
const router=express.Router();

router.get("/",async(req,res)=>{
    try{
        const params=[]; let where="WHERE available=true";
        if(req.query.category && req.query.category!=="all"){params.push(req.query.category);where+=" AND category=$1";}
        const r=await db.query(`SELECT * FROM products ${where} ORDER BY id DESC`,params);
        res.json({success:true,data:r.rows});
    }catch(e){console.error(e);res.status(500).json({success:false,message:"Mahsulotlarni olishda xato."});}
});

router.get("/categories",async(_req,res)=>{
    try{const r=await db.query("SELECT DISTINCT category FROM products WHERE available=true ORDER BY category");res.json({success:true,data:r.rows.map(x=>x.category)});}
    catch(e){res.status(500).json({success:false,message:"Kategoriyalarni olishda xato."});}
});

router.get("/admin/all",requireAdmin,async(_req,res)=>{
    try{const r=await db.query("SELECT * FROM products ORDER BY id DESC");res.json({success:true,data:r.rows});}
    catch(e){console.error(e);res.status(500).json({success:false,message:"Mahsulotlarni olishda xato."});}
});

router.post("/",requireAdmin,async(req,res)=>{
    try{
        const {name,category,description,price,image,available=true}=req.body;
        const n=String(name||"").trim(), p=Number(price);
        if(!n || !Number.isFinite(p) || p<0) return res.status(400).json({success:false,message:"Nom va to‘g‘ri narx kerak."});
        const r=await db.query(
            `INSERT INTO products(name,category,description,price,image,available) VALUES($1,$2,$3,$4,$5,$6) RETURNING *`,
            [n,String(category||"Boshqa").trim(),String(description||""),Math.round(p),String(image||""),available!==false]
        );
        res.status(201).json({success:true,data:r.rows[0]});
    }catch(e){console.error(e);res.status(500).json({success:false,message:"Mahsulot yaratishda xato."});}
});

router.put("/:id",requireAdmin,async(req,res)=>{
    try{
        const {name,category,description,price,image,available}=req.body;
        const p=price===undefined?null:Number(price);
        if(p!==null && (!Number.isFinite(p)||p<0)) return res.status(400).json({success:false,message:"Narx noto‘g‘ri."});
        const r=await db.query(
            `UPDATE products SET name=COALESCE($1,name),category=COALESCE($2,category),description=COALESCE($3,description),price=COALESCE($4,price),image=COALESCE($5,image),available=COALESCE($6,available),updated_at=NOW() WHERE id=$7 RETURNING *`,
            [name===undefined?null:String(name).trim(),category===undefined?null:String(category).trim(),description===undefined?null:String(description),p,image===undefined?null:String(image),available===undefined?null:Boolean(available),Number(req.params.id)]
        );
        if(!r.rows.length)return res.status(404).json({success:false,message:"Mahsulot topilmadi."});
        res.json({success:true,data:r.rows[0]});
    }catch(e){console.error(e);res.status(500).json({success:false,message:"Mahsulotni saqlashda xato."});}
});

router.delete("/:id",requireAdmin,async(req,res)=>{
    try{
        const r=await db.query("UPDATE products SET available=false,updated_at=NOW() WHERE id=$1 RETURNING id",[Number(req.params.id)]);
        if(!r.rows.length)return res.status(404).json({success:false,message:"Mahsulot topilmadi."});
        res.json({success:true,message:"Mahsulot sotuvdan olindi."});
    }catch(e){res.status(500).json({success:false,message:"Mahsulotni o‘chirishda xato."});}
});
module.exports=router;
