export async function POST() {
  return Response.json(
    {
      error: "Blood order requests are not created from the blood availability page yet. This request flow will be available from hospitals later.",
    },
    { status: 501 },
  );
}
