import { getCurrentAuthAccount } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import type { PrismaClient } from "../../../../generated/prisma";

async function findOwnedBloodBank(accountId: string, fallbackName: string) {
  return prisma.bloodBank.findFirst({
    where: {
      OR: [
        { authAccountId: accountId },
        { authAccountId: null, hospitalName: fallbackName },
      ],
    },
  });
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ requestId: string }> },
) {
  const auth = await getCurrentAuthAccount();

  if (!auth || auth.session.role !== "blood-bank") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { requestId } = await context.params;
    const id = Number(requestId);
    const body = await req.json();
    const action = String(body?.action ?? "").trim().toLowerCase();

    if (!id || !["approved", "rejected"].includes(action)) {
      return Response.json({ error: "Invalid request action." }, { status: 400 });
    }

    const bloodBank = await findOwnedBloodBank(auth.account.id, auth.account.name);

    if (!bloodBank) {
      return Response.json({ error: "Blood bank profile not found." }, { status: 404 });
    }

    const requestRecord = await prisma.bloodRequest.findFirst({
      where: {
        id,
        bloodBankId: bloodBank.id,
      },
    });

    if (!requestRecord) {
      return Response.json({ error: "Request not found." }, { status: 404 });
    }

    if (requestRecord.status !== "pending") {
      return Response.json({ error: "This request has already been reviewed." }, { status: 409 });
    }

    if (action === "rejected") {
      const updatedRequest = await prisma.bloodRequest.update({
        where: { id: requestRecord.id },
        data: {
          status: "rejected",
          reviewedAt: new Date(),
        },
      });

      return Response.json({ ok: true, request: updatedRequest });
    }

    const result = await prisma.$transaction(async (tx: PrismaClient) => {
      const inventory = await tx.bloodInventory.findFirst({
        where: {
          bloodBankId: bloodBank.id,
          type: requestRecord.bloodType,
          component: requestRecord.component,
        },
      });

      if (!inventory || !inventory.available || inventory.units < requestRecord.requestedUnits) {
        throw new Error("INSUFFICIENT_UNITS");
      }

      const remainingUnits = inventory.units - requestRecord.requestedUnits;

      await tx.bloodInventory.update({
        where: { id: inventory.id },
        data: {
          units: remainingUnits,
          available: remainingUnits > 0,
          lastUpdated: new Date(),
        },
      });

      return tx.bloodRequest.update({
        where: { id: requestRecord.id },
        data: {
          status: "approved",
          reviewedAt: new Date(),
        },
      });
    });

    return Response.json({ ok: true, request: result });
  } catch (error) {
    if (error instanceof Error && error.message === "INSUFFICIENT_UNITS") {
      return Response.json({ error: "Not enough units are available to approve this request." }, { status: 409 });
    }

    console.error("Failed to update blood request:", error);
    return Response.json({ error: "Failed to update blood request." }, { status: 500 });
  }
}
