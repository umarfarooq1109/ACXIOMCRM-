import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { APP_CONFIG } from "@/lib/config";

const SECRET_KEY = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "super-secret-random-key-change-in-production-32chars"
);

export interface UserSessionPayload {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Manager" | "SalesExecutive";
  mustChangePassword: boolean;
}

export async function createSessionToken(payload: UserSessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(SECRET_KEY);
}

export async function verifySessionToken(token: string): Promise<UserSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as UserSessionPayload;
  } catch (error) {
    return null;
  }
}

export async function setSessionCookie(payload: UserSessionPayload) {
  const token = await createSessionToken(payload);
  const cookieStore = await cookies();

  cookieStore.set("acxiom_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: APP_CONFIG.sessionMaxAgeSeconds,
  });
}

export async function getSession(): Promise<UserSessionPayload | null> {
  let cookieStore;
  try {
    cookieStore = await cookies();
  } catch (err: any) {
    if (err?.digest?.includes("DYNAMIC_SERVER_USAGE") || err?.name === "DynamicServerError") {
      throw err;
    }
    return null;
  }

  const token = cookieStore.get("acxiom_session")?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("acxiom_session");
}
