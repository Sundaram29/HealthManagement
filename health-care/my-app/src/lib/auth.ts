import crypto from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

export const AUTH_COOKIE_NAME = "health_auth_session";

export type SessionPayload = {
  id: string;
  role: "user" | "hospital" | "doctor" | "blood-bank";
  email: string;
  name: string;
  extra?: string | null;
};

const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function getAuthSecret() {
  return process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "dev-health-auth-secret";
}

export async function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = await new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (error, key) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(key as Buffer);
    });
  });

  return `${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  const [salt, hash] = storedHash.split(":");

  if (!salt || !hash) {
    return false;
  }

  const derivedKey = await new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (error, key) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(key as Buffer);
    });
  });

  const hashBuffer = Buffer.from(hash, "hex");
  return hashBuffer.length === derivedKey.length && crypto.timingSafeEqual(hashBuffer, derivedKey);
}

function encodeSession(payload: SessionPayload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", getAuthSecret()).update(body).digest("base64url");
  return `${body}.${signature}`;
}

function decodeSession(value: string): SessionPayload | null {
  const [body, signature] = value.split(".");

  if (!body || !signature) {
    return null;
  }

  const expectedSignature = crypto.createHmac("sha256", getAuthSecret()).update(body).digest("base64url");

  if (signature !== expectedSignature) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
  } catch {
    return null;
  }
}

export async function setAuthSession(payload: SessionPayload) {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, encodeSession(payload), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearAuthSession() {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function getAuthSession() {
  const cookieStore = await cookies();
  const rawValue = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!rawValue) {
    return null;
  }

  return decodeSession(rawValue);
}

export async function getCurrentAuthAccount() {
  const session = await getAuthSession();

  if (!session) {
    return null;
  }

  const role = session.role === "blood-bank" ? "blood_bank" : session.role;
  const account = await prisma.authAccount.findUnique({
    where: { id: session.id },
  });

  if (!account || account.role !== role) {
    return null;
  }

  return {
    session,
    account,
  };
}
