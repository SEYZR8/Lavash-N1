# Lavash N1

Zamonaviy o‘zbek tilidagi fast-food buyurtma sayti va yashirin admin boshqaruv paneli.

## Ishga tushirish

```bash
npm install
npm run dev
```

Brauzerda `http://localhost:3000` ni oching.

## Admin

Maxsus admin yo‘li: `/n1-control-8472/login`

Demo login: `Daler`

Demo parol: `Daler`

> Production uchun login/parolni server-side authentication va database bilan almashtirish tavsiya qilinadi. Hozirgi versiya demo/prototip rejimida localStorage orqali katalog ma’lumotlarini saqlaydi.

## Imkoniyatlar

- O‘zbekcha UI va so‘m formatidagi narxlar
- Responsive mobil/desktop dizayn
- Kategoriya bo‘yicha filter va qidiruv
- Savat va buyurtma oqimi
- Mahsulot CRUD
- Rasm faylini yuklash yoki URL berish
- Kategoriya, narx, tavsif va reyting boshqaruvi
- Buyurtmalar dashboardi
- Sayt sozlamalari
- Yashirin admin route

## Production

Real ko‘p foydalanuvchili ishlash uchun PostgreSQL, server-side authentication, object storage va real buyurtma API ulash kerak. Next.js App Router full-stack ilovalar, Route Handlers, server-side data fetching va authentication uchun mos arxitekturani beradi.
