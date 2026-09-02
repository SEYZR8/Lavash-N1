import crypto from 'crypto';
import { cookies } from 'next/headers';
export const ADMIN_COOKIE='lavash_n1_admin';
export function adminToken(){const secret=process.env.ADMIN_SESSION_SECRET||'dev-secret-change-me';const user=process.env.ADMIN_USERNAME||'Daler';const pass=process.env.ADMIN_PASSWORD||'Daler';return crypto.createHmac('sha256',secret).update(`${user}:${pass}`).digest('hex')}
export async function isAdmin(){const store=await cookies();const token=store.get(ADMIN_COOKIE)?.value||'';const expected=adminToken();if(!token||token.length!==expected.length)return false;return crypto.timingSafeEqual(Buffer.from(token),Buffer.from(expected))}
export function validCredentials(username:string,password:string){const u=process.env.ADMIN_USERNAME||'Daler';const p=process.env.ADMIN_PASSWORD||'Daler';return username===u&&password===p}
