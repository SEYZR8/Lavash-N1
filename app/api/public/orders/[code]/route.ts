import {NextResponse} from 'next/server';import {prisma} from '@/lib/prisma';
export async function GET(_:Request,{params}:{params:Promise<{code:string}>}){const {code}=await params;const o=await prisma.order.findUnique({where:{code},include:{items:true}});return o?NextResponse.json(o,{headers:{'Cache-Control':'no-store'}}):NextResponse.json({error:'Buyurtma topilmadi'},{status:404})}
