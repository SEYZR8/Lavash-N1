const TOKEN_KEY="lavash_admin_token";
const $=id=>document.getElementById(id);
const money=n=>Number(n||0).toLocaleString("uz-UZ")+" so'm";
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
async function api(url,opt={}){
 const token=localStorage.getItem(TOKEN_KEY);
 const r=await fetch(url,{...opt,headers:{"Content-Type":"application/json",...(token?{Authorization:"Bearer "+token}:{}),...(opt.headers||{})}});
 const d=await r.json().catch(()=>({}));
 if(!r.ok)throw new Error(d.message||"Server xatosi");
 return d;
}
function modal(title,body){$("modalTitle").textContent=title;$("modalBody").innerHTML=body;$("modal").classList.remove("hidden");}
$("closeModal").onclick=()=>$("modal").classList.add("hidden");
$("modal").onclick=e=>{if(e.target===$("modal"))$("modal").classList.add("hidden");};

$("loginForm").onsubmit=async e=>{
 e.preventDefault();$("loginMessage").textContent="Kirilmoqda...";
 try{const d=await api("/api/auth/login",{method:"POST",body:JSON.stringify({phone:$("login").value,password:$("password").value})});
 if(d.user.role!=="admin"&&d.user.role!=="manager")throw new Error("Admin huquqi yo‘q.");
 localStorage.setItem(TOKEN_KEY,d.token);showAdmin();
 }catch(err){$("loginMessage").textContent=err.message;}
};
async function showAdmin(){ $("loginScreen").classList.add("hidden");$("adminApp").classList.remove("hidden");await loadDashboard(); }
$("logoutButton").onclick=()=>{localStorage.removeItem(TOKEN_KEY);location.reload();};

const titles={dashboard:"Dashboard",orders:"Buyurtmalar",products:"Mahsulotlar",promos:"Promo kodlar",customers:"Mijozlar"};
document.querySelectorAll(".nav-button").forEach(btn=>btn.onclick=async()=>{
 document.querySelectorAll(".nav-button").forEach(x=>x.classList.remove("active"));btn.classList.add("active");
 document.querySelectorAll(".page").forEach(x=>x.classList.add("hidden"));$(btn.dataset.page+"Page").classList.remove("hidden");$("pageTitle").textContent=titles[btn.dataset.page];
 const p=btn.dataset.page;
 if(p==="dashboard")loadDashboard(); if(p==="orders")loadOrders(); if(p==="products")loadProducts(); if(p==="promos")loadPromos(); if(p==="customers")loadCustomers();
});
async function loadDashboard(){
 try{const d=await api("/api/admin/stats"),x=d.data;$("ordersCount").textContent=x.orders;$("productsCount").textContent=x.products;$("customersCount").textContent=x.customers;$("salesTotal").textContent=money(x.sales);$("todayStats").innerHTML=`<h3>Bugungi natija</h3><p style="margin-top:8px">${x.todayOrders} ta buyurtma · <b>${money(x.todaySales)}</b></p>`;}
 catch(e){$("todayStats").innerHTML=`<p>${esc(e.message)}</p>`;}
}
async function loadProducts(){
 const box=$("productsContainer");box.innerHTML="Yuklanmoqda...";
 try{const d=await api("/api/products/admin/all");box.innerHTML=d.data.map(p=>`<article class="data-card"><h3>${esc(p.name)}</h3><p class="muted">${esc(p.category)}</p><div class="price">${money(p.price)}</div><p>${p.available?"🟢 Sotuvda":"🔴 Yopiq"}</p><div class="actions"><button class="action-button" data-edit="${p.id}">✏️ Tahrirlash</button><button class="action-button light" data-toggle="${p.id}" data-value="${p.available}">${p.available?"🔴 Yopish":"🟢 Ochish"}</button></div></article>`).join("")||"<p>Mahsulot yo‘q.</p>";}
 catch(e){box.innerHTML=`<p>${esc(e.message)}</p>`;}
}
function productForm(p={}){
 modal(p.id?"Mahsulotni tahrirlash":"Yangi mahsulot",`<form id="productForm" class="admin-form"><input id="pn" required placeholder="Nomi" value="${esc(p.name)}"><input id="pc" placeholder="Kategoriya" value="${esc(p.category||"Lavash")}"><input id="pp" type="number" min="0" required placeholder="Narxi" value="${p.price??""}"><textarea id="pd" placeholder="Tavsif">${esc(p.description)}</textarea><input id="pi" placeholder="Rasm URL" value="${esc(p.image)}"><label><input id="pa" type="checkbox" ${p.available!==false?"checked":""}> Sotuvda</label><button class="form-submit">Saqlash</button></form>`);
 $("productForm").onsubmit=async e=>{e.preventDefault();const body={name:$("pn").value.trim(),category:$("pc").value.trim(),price:Number($("pp").value),description:$("pd").value.trim(),image:$("pi").value.trim(),available:$("pa").checked};try{await api(p.id?`/api/products/${p.id}`:"/api/products",{method:p.id?"PUT":"POST",body:JSON.stringify(body)});$("modal").classList.add("hidden");loadProducts();}catch(err){alert(err.message);}};
}
$("addProductButton").onclick=()=>productForm();
$("productsContainer").onclick=async e=>{
 const edit=e.target.closest("[data-edit]"),tog=e.target.closest("[data-toggle]");if(edit){const d=await api("/api/products/admin/all");const p=d.data.find(x=>String(x.id)===edit.dataset.edit);if(p)productForm(p);}
 if(tog){try{await api("/api/products/"+tog.dataset.toggle,{method:"PUT",body:JSON.stringify({available:tog.dataset.value!=="true"})});loadProducts();}catch(err){alert(err.message);}}
};
async function loadOrders(){
 const box=$("ordersContainer");box.innerHTML="Yuklanmoqda...";
 try{const d=await api("/api/admin/orders");box.innerHTML=d.data.map(o=>`<article class="data-card"><div style="display:flex;justify-content:space-between;gap:10px"><h3>#${o.id}</h3><b>${money(o.total)}</b></div><p>${esc(o.customer_name)} · ${esc(o.phone)}</p><p>📍 ${esc(o.address)}</p><small>${o.items.map(i=>`${esc(i.product_name)} × ${i.quantity}`).join(", ")}</small><div class="actions" style="margin-top:12px"><select data-status="${o.id}"><option value="new" ${o.status==="new"?"selected":""}>Yangi</option><option value="preparing" ${o.status==="preparing"?"selected":""}>Tayyorlanmoqda</option><option value="delivering" ${o.status==="delivering"?"selected":""}>Yo‘lda</option><option value="completed" ${o.status==="completed"?"selected":""}>Yetkazildi</option><option value="cancelled" ${o.status==="cancelled"?"selected":""}>Bekor</option></select></div></article>`).join("")||"<p>Buyurtma yo‘q.</p>";}
 catch(e){box.innerHTML=`<p>${esc(e.message)}</p>`;}
}
$("refreshOrders").onclick=loadOrders;
$("ordersContainer").onchange=async e=>{if(e.target.dataset.status){try{await api("/api/admin/orders/"+e.target.dataset.status+"/status",{method:"PATCH",body:JSON.stringify({status:e.target.value})});}catch(err){alert(err.message);}}};
async function loadPromos(){
 const box=$("promosContainer");try{const d=await api("/api/promos");box.innerHTML=d.data.map(p=>`<article class="data-card"><h3>${esc(p.code)}</h3><p>${p.discount_type==="percent"?p.discount_value+"%":money(p.discount_value)} chegirma</p><p>Min: ${money(p.min_order)} · Ishlatilgan: ${p.used_count}</p><button class="action-button danger" data-del-promo="${p.id}">O‘chirish</button></article>`).join("")||"<p>Promo yo‘q.</p>";}catch(e){box.innerHTML=`<p>${esc(e.message)}</p>`;}
}
$("addPromoButton").onclick=()=>modal("Yangi promo",`<form id="promoForm" class="admin-form"><input id="promoCode" placeholder="KOD" required><select id="promoType"><option value="percent">Foiz</option><option value="fixed">Summa</option></select><input id="promoValue" type="number" min="1" placeholder="Chegirma" required><input id="promoMin" type="number" min="0" placeholder="Minimal buyurtma"><input id="promoMax" type="number" min="1" placeholder="Maksimal foydalanish"><button class="form-submit">Yaratish</button></form>`);
document.addEventListener("submit",async e=>{if(e.target.id!=="promoForm")return;e.preventDefault();try{await api("/api/promos",{method:"POST",body:JSON.stringify({code:$("promoCode").value,discount_type:$("promoType").value,discount_value:Number($("promoValue").value),min_order:Number($("promoMin").value||0),max_uses:$("promoMax").value?Number($("promoMax").value):null})});$("modal").classList.add("hidden");loadPromos();}catch(err){alert(err.message);}});
$("promosContainer").onclick=async e=>{const b=e.target.closest("[data-del-promo]");if(b&&confirm("Promo o‘chirilsinmi?")){await api("/api/promos/"+b.dataset.delPromo,{method:"DELETE"});loadPromos();}};
async function loadCustomers(){try{const d=await api("/api/admin/customers");$("customersContainer").innerHTML=d.data.map(c=>`<article class="data-card"><h3>${esc(c.name)}</h3><p>📞 ${esc(c.phone)}</p><p>${c.order_count} ta buyurtma · ${money(c.spent)}</p></article>`).join("")||"<p>Mijoz yo‘q.</p>";}catch(e){$("customersContainer").innerHTML=`<p>${esc(e.message)}</p>`;}}
if(localStorage.getItem(TOKEN_KEY))showAdmin();
