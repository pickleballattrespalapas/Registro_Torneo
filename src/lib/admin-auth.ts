import crypto from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "admin_session";

function getSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "dev-secret";
}

function sign(value: string) {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("hex");
}

export function createSessionToken() {
  const payload = `admin:${Date.now()}`;
  return `${payload}.${sign(payload)}`;
}

export function isValidSession(token?: string) {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  return sign(payload) === signature;
}

export function setAdminSession() {
  cookies().set(COOKIE_NAME, createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

export function clearAdminSession() {
  cookies().delete(COOKIE_NAME);
}

export function requireAdmin() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!isValidSession(token)) {
    redirect("/admin/login");
  }
}

export function isAdminAuthenticated() {
  const token = cookies().get(COOKIE_NAME)?.value;
  return isValidSession(token);
}
