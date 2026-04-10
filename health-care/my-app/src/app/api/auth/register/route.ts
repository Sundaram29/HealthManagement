import { prisma } from "../../../../lib/prisma";
import { hashPassword, setAuthSession, type SessionPayload } from "../../../../lib/auth";

function normalizeRole(role: string) {
  return role === "blood-bank" ? "blood_bank" : role;
}

export async function POST(req: Request) {
  try {
    const { role, name, email, password, extra } = await req.json();

    if (!role || !name || !email || !password) {
      return Response.json({ error: "Required fields are missing." }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedRole = normalizeRole(String(role).trim());

    const existing = await prisma.authAccount.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (existing) {
      return Response.json({ error: "Account already exists with this email." }, { status: 409 });
    }

    const passwordHash = await hashPassword(String(password));

    const account = await prisma.authAccount.create({
      data: {
        role: normalizedRole,
        name: String(name).trim(),
        email: normalizedEmail,
        passwordHash,
        extra: extra ? String(extra).trim() : null,
      },
    });

    if (normalizedRole === "user") {
      await prisma.user.create({
        data: {
          id: account.id,
          email: account.email,
          name: account.name,
        },
      });
    }

    const session: SessionPayload = {
      id: account.id,
      role: String(role).trim() as SessionPayload["role"],
      email: account.email,
      name: account.name,
      extra: account.extra,
    };

    await setAuthSession(session);

    return Response.json({ ok: true, session });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to register account." }, { status: 500 });
  }
}
