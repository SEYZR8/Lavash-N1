# Lavash N1 🍔

Lavash N1 — o‘zbek tilidagi zamonaviy food-delivery web ilovasi. Sayt, savat, checkout, PostgreSQL bazasi, buyurtma tracking va himoyalangan admin panel bir loyihada.

## Nimalar ishlaydi

- Premium orange / black / white responsive UI
- PostgreSQL + Prisma bilan haqiqiy ma’lumotlar bazasi
- Saytdan tushgan har bir zakaz DB'ga saqlanadi
- Admin panelda yangi buyurtmalar avtomatik ravishda har 10 soniyada ko‘rinadi
- Buyurtma statuslari: Yangi → Tasdiqlandi → Tayyorlanmoqda → Yo‘lda → Yetkazildi / Bekor qilindi
- Mijozga buyurtma kodi va live tracking sahifasi
- Savat, miqdor boshqaruvi, checkout va promo-kod
- Mahsulot, kategoriya, promo, banner va sayt sozlamalari CRUD
- Admin paneldan mahsulot/banner rasmini fayl sifatida yuklash
- Mahsulot o‘chirilganda eski zakazlar buzilmasligi uchun xavfsiz deaktivatsiya
- O‘zbek so‘mida narxlar

## Admin

Maxsus yo‘l: `/n1-control-8472/login`

Boshlang‘ich demo credentials: `Daler` / `Daler`.

**Productionga chiqishda `ADMIN_USERNAME`, `ADMIN_PASSWORD` va `ADMIN_SESSION_SECRET` ni `.env` orqali o‘zgartiring.** Parolni GitHub'ga commit qilmang.

## Local ishga tushirish

Node.js 20.9+ tavsiya etiladi. Next.js App Router full-stack ilovalar, Route Handlers va PostgreSQL bilan ishlash uchun mos. urlNext.js full-stack guidehttps://nextjs.org/learn/dashboard-app

```bash
cp .env.example .env
npm install
docker compose up -d
npm run db:push
npm run db:seed
npm run dev
```

Sayt: `http://localhost:3000`

Admin: `http://localhost:3000/n1-control-8472/login`

## Environment

`.env.example` dagi `DATABASE_URL`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` qiymatlarini sozlang. `.env` Git'ga kirmasligi kerak.

## Production

Production PostgreSQL ulanishini `DATABASE_URL` ga qo‘ying, environment secrets'ni hosting panelida saqlang va `npm run build && npm start` bilan ishga tushiring. Next.js'ning rasmiy database/deployment qo‘llanmasi GitHub bilan Postgres ulash va deploy qilish oqimini ham ko‘rsatadi. urlNext.js database/deployment guidehttps://nextjs.org/learn/dashboard-app/setting-up-the-database

Rasm fayllari hozir kichik restoran menyusi uchun DB ichida data URL sifatida saqlanadi. Katta production katalog uchun object storage ishlatish ma’qul.
