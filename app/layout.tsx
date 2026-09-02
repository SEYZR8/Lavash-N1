import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Lavash N1 — Mazali taomlar, tez yetkazib berish', description: 'Lavash N1 — taom buyurtma qilishning zamonaviy va qulay usuli.' };

export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="uz"><body>{children}</body></html>}