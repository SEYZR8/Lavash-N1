const TOKEN_KEY="lavash_token";
const $=id=>document.getElementById(id);
const money=n=>Number(n||0).toLocaleString("uz-UZ")+" so'm";
async function api(url,opt={}){
 const token=localStorage.getItem(TOKEN_KEY);
 const r=await fetch(url,{...opt,headers:{"Content-Type":"application/json",...(token?{Authorization:"Bearer "+token}:{}),...(opt.headers||{})}});
 const d=await r.json().catch(()=>({}));
 if(!r.ok)throw new Error(d.message||"Xatolik");
 return d;
}
function showAccount(user){
 $("auth").classList.add("hidden");$("account").classList.remove("hidden");
 $("welcome").textContent=`Salom, ${user.name}!`;
 $("pname").value=user.name;$("pphone").value=user.phone;loadOrders();
}
async function loadOrders(){
 try{
  const d=await api("/api/my/orders");const box=$("orders");
  box.innerHTML=d.data.length?d.data.map(o=>`<article class="data-card" style="padding:18px"><strong>#${o.id}</strong><span style="float:right">${money(o.total)}</span><p>${o.status}</p><small>${o.items.map(i=>`${i.product_name} × ${i.quantity}`).join(", ")}</small></article>`).join(""):"<p>Hali buyurtma yo‘q.</p>";
 }catch(e){$("orders").innerHTML=`<p>${e.message}</p>`;}
}
$("loginForm").onsubmit=async e=>{e.preventDefault();try{const d=await api("/api/auth/login",{method:"POST",body:JSON.stringify({phone:$("phone").value,password:$("password").value})});localStorage.setItem(TOKEN_KEY,d.token);showAccount(d.user);}catch(e){$("msg").textContent=e.message;}};
$("registerForm").onsubmit=async e=>{e.preventDefault();try{const d=await api("/api/auth/register",{method:"POST",body:JSON.stringify({name:$("name").value,phone:$("rphone").value,password:$("rpassword").value})});localStorage.setItem(TOKEN_KEY,d.token);showAccount(d.user);}catch(e){$("msg").textContent=e.message;}};
$("profileForm").onsubmit=async e=>{e.preventDefault();try{const d=await api("/api/auth/me",{method:"PATCH",body:JSON.stringify({name:$("pname").value,phone:$("pphone").value})});showAccount(d.data);}catch(e){alert(e.message);}};
$("logout").onclick=()=>{localStorage.removeItem(TOKEN_KEY);location.reload();};
(async()=>{if(localStorage.getItem(TOKEN_KEY)){try{const d=await api("/api/auth/me");showAccount(d.data);}catch{localStorage.removeItem(TOKEN_KEY);}}})();
