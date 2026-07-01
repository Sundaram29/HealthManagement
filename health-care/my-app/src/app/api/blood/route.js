import { prisma } from "../../../lib/prisma";

export async function GET() {
    try {
        
        const data = await prisma.bloodBank.findMany({
            include: {
                bloodGroups: true,
            },
        });
        return Response.json(data);

    } catch {
        return Response.json({error: "Failed to fetch"}, {status: 500});
    }
}
