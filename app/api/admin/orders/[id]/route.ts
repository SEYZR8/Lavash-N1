import {NextResponse} from 'next/server';import {prisma} from '@/lib/prisma';
const allowed=['NEW','CONFIRMED','PREPARING','ON_THE_WAY','DELIVERED','CANCELLED'];
export async function PUT(req:Request,{params}:{params:Promise<{id:string}>}){try{const {id}=await params;const b=await req.json();if(!allowed.includes(String(b.status)))return NextResponse.json({error:'Status noto‘g‘ri'},{status:400});return NextResponse.json(await prisma.order.update({where:{id:Number(id)},data:{status:b.status as any}}))}catch{return NextResponse.json({error:'Buyurtma topilmadi'},{status:404})}}
