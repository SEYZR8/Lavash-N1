import {NextResponse} from 'next/server';import {prisma} from '@/lib/prisma';
export async function GET(){return NextResponse.json(await prisma.order.findMany({include:{items:true},orderBy:{createdAt:'desc'},take:200}),{headers:{'Cache-Control':'no-store'}})}
