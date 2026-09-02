export const money=(v:number)=>`${new Intl.NumberFormat('uz-UZ').format(v)} so‘m`;
export const slugify=(s:string)=>s.toLowerCase().trim().replace(/[‘’']/g,'').replace(/[^a-z0-9а-яёқғҳў]+/gi,'-').replace(/^-|-$/g,'');
export const orderCode=()=>`N1-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,7).toUpperCase()}`;
export const statusLabel:Record<string,string>={NEW:'Yangi',CONFIRMED:'Tasdiqlandi',PREPARING:'Tayyorlanmoqda',ON_THE_WAY:'Yo‘lda',DELIVERED:'Yetkazildi',CANCELLED:'Bekor qilindi'};
