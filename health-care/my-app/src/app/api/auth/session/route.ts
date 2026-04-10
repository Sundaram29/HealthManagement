import { getAuthSession } from "../../../../lib/auth";

export async function GET() {
  const session = await getAuthSession();
  return Response.json({ session });
}
