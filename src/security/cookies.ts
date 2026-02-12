import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import type { Context } from "hono";

export function setTransactionCookie(c: Context, cookieName: string, value: string, maxAge: number): void {
  setCookie(c, cookieName, value, {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    maxAge
  });
}

export function getTransactionCookie(c: Context, cookieName: string): string | undefined {
  return getCookie(c, cookieName);
}

export function clearTransactionCookie(c: Context, cookieName: string): void {
  deleteCookie(c, cookieName, {
    path: "/",
    secure: true,
    sameSite: "Lax"
  });
}
