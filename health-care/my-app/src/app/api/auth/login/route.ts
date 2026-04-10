import { prisma } from "../../../../lib/prisma";
import { setAuthSession, verifyPassword, type SessionPayload } from "../../../../lib/auth";

function mapRole(role: string) {
  return role === "blood-bank" ? "blood_bank" : role;
}

export async function POST(req: Request) {
  try {
    const { role, email, password } = await req.json();

    if (!role || !email || !password) {
      return Response.json({ error: "Email and password required." }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedRole = mapRole(String(role).trim());

    const account = await prisma.authAccount.findFirst({
      where: {
        email: normalizedEmail,
        role: normalizedRole,
      },
    });

    if (!account) {
      return Response.json({ error: "Invalid login credentials." }, { status: 401 });
    }

    const validPassword = await verifyPassword(String(password), account.passwordHash);

    if (!validPassword) {
      return Response.json({ error: "Invalid login credentials." }, { status: 401 });
    }

    if (normalizedRole === "user") {
      await prisma.user.upsert({
        where: { id: account.id },
        update: {
          email: account.email,
          name: account.name,
        },
        create: {
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
    return Response.json({ error: "Failed to login." }, { status: 500 });
  }
}
