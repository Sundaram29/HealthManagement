import { clearAuthSession } from "../../../../lib/auth";

export async function POST() {
  await clearAuthSession();
  return Response.json({ ok: true });
}
