import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const svg = (emoji: string, bg: string) => `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="900" height="650"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${bg}"/><stop offset="1" stop-color="#191919"/></linearGradient></defs><rect width="100%" height="100%" rx="44" fill="url(#g)"/><text x="50%" y="52%" text-anchor="middle" dominant-baseline="middle" font-size="260">${emoji}</text></svg>`)}`;

async function main() {
  const cats = [['Lavash', 'lavash', '🌯'], ['Burger', 'burger', '🍔'], ['Setlar', 'setlar', '🍱'], ['Ichimliklar', 'ichimliklar', '🥤'], ['Desert', 'desert', '🍰']];
  for (let i = 0; i < cats.length; i++) {
    await prisma.category.upsert({ where: { slug: cats[i][1] }, update: { name: cats[i][0], icon: cats[i][2], sortOrder: i, active: true }, create: { name: cats[i][0], slug: cats[i][1], icon: cats[i][2], sortOrder: i } });
  }

  const all = await prisma.category.findMany();
  const id = (s: string) => all.find(c => c.slug === s)!.id;
  const products = [
    ['Lavash N1','lavash-n1','Katta lavash, mol go‘shti, kartoshka fri, yangi sabzavot va maxsus N1 sous.',32000,'🌯','#ff5a00','lavash',true,true],
    ['Tovuqli lavash','tovuqli-lavash','Yumshoq tovuq filesi, sabzavotlar va mayin sarimsoqli sous.',29000,'🌯','#ff7a00','lavash',true,false],
    ['Mini lavash','mini-lavash','Yengil porsiya: go‘sht, kartoshka, karam va sous.',23000,'🌯','#f97316','lavash',false,false],
    ['N1 Burger','n1-burger','Mol go‘shtli kotlet, cheddar, pomidor, salat va firma sousi.',35000,'🍔','#ef3d00','burger',true,true],
    ['Chicken Burger','chicken-burger','Qarsildoq tovuq, salat, pishloq va sous.',31000,'🍔','#ff6b00','burger',false,false],
    ['Family Set','family-set','2 lavash, 2 burger, fri va 1L ichimlik.',119000,'🍱','#ff4f00','setlar',true,true],
    ['N1 Combo','n1-combo','Lavash N1, fri va 0.5L ichimlik.',49000,'🍟','#ff6500','setlar',true,false],
    ['Coca-Cola 0.5L','cola-05','Muzdek gazli ichimlik.',10000,'🥤','#db2626','ichimliklar',false,false],
    ['Mojito','mojito','Limon, yalpiz va muz bilan salqin ichimlik.',18000,'🍹','#36a852','ichimliklar',false,false],
    ['San Sebastian','san-sebastian','Kremli pishloqli desert.',26000,'🍰','#d68b44','desert',true,false]
  ];
  for (const p of products) {
    await prisma.product.upsert({ where: { slug: p[1] as string }, update: { name: p[0] as string, description: p[2] as string, price: p[3] as number, image: svg(p[4] as string, p[5] as string), categoryId: id(p[6] as string), popular: p[7] as boolean, featured: p[8] as boolean, active: true }, create: { name: p[0] as string, slug: p[1] as string, description: p[2] as string, price: p[3] as number, image: svg(p[4] as string, p[5] as string), categoryId: id(p[6] as string), popular: p[7] as boolean, featured: p[8] as boolean } });
  }

  await prisma.promo.upsert({ where: { code: 'N1START' }, update: { title: 'Birinchi buyurtmaga 15% chegirma', percent: 15, minOrder: 50000, active: true }, create: { code: 'N1START', title: 'Birinchi buyurtmaga 15% chegirma', percent: 15, minOrder: 50000 } });

  const banner = { title: 'Lavash N1 — ochlikka N1 yechim!', subtitle: 'Issiq, mazali va tez. 30 daqiqada yetkazib berishga harakat qilamiz.', button: 'Hoziroq buyurtma berish', image: svg('🌯', '#ff5a00') };
  const existingBanner = await prisma.banner.findFirst({ orderBy: { id: 'asc' } });
  if (existingBanner) await prisma.banner.update({ where: { id: existingBanner.id }, data: banner });
  else await prisma.banner.create({ data: banner });

  const settings = [['siteName','Lavash N1'],['phone','+998 90 777 11 11'],['address','Toshkent shahri'],['deliveryFee','10000'],['freeDeliveryFrom','150000'],['minOrder','30000'],['workingHours','10:00 — 02:00'],['telegram','@lavashn1']];
  for (const [key, value] of settings) await prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
}

main().catch(console.error).finally(() => prisma.$disconnect());
