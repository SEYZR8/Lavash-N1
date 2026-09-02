import './globals.css';
import type { Metadata } from 'next';
export const metadata:Metadata={title:'Lavash N1 — Mazali. Tez. N1.',description:'Lavash N1 — lavash, burger, setlar va tez yetkazib berish.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="uz"><body>{children}</body></html>}
