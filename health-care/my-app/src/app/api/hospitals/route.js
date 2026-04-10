import { prisma } from "../../../lib/prisma";

function serializeHospital(hospital) {
  return {
    id: hospital.id,
    name: hospital.name,
    city: hospital.city || "",
    state: hospital.state || "",
    address: hospital.address || "",
    pincode: hospital.pincode || "",
    phone: hospital.phone || "",
    email: hospital.email,
    website: hospital.website || "",
    rating: hospital.rating ?? 0,
    specialties: hospital.specialties || [],
    isOpen24Hours: hospital.isOpen24Hours,
    description: hospital.description || "",
    profileCompleted: Boolean(hospital.profileCompleted),
    doctorCount: hospital._count?.doctors ?? 0,
    doctors: hospital.doctors ?? [],
  };
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const hospitalIdParam = searchParams.get("hospitalId");

    if (hospitalIdParam) {
      const hospitalId = Number(hospitalIdParam);

      if (Number.isNaN(hospitalId)) {
        return Response.json({ error: "Invalid hospital id" }, { status: 400 });
      }

      const hospital = await prisma.hospital.findUnique({
        where: { id: hospitalId },
        include: {
          doctors: {
            orderBy: [{ specialty: "asc" }, { name: "asc" }],
          },
          _count: {
            select: { doctors: true },
          },
        },
      });

      if (!hospital) {
        return Response.json({ error: "Hospital not found" }, { status: 404 });
      }

      return Response.json({ hospital: serializeHospital(hospital) });
    }

    const hospitals = await prisma.hospital.findMany({
      include: {
        _count: {
          select: { doctors: true },
        },
      },
      orderBy: [{ rating: "desc" }, { name: "asc" }],
    });

    return Response.json({
      hospitals: hospitals.map(serializeHospital),
    });
  } catch (error) {
    console.error("Hospitals API error:", error);
    return Response.json(
      { error: "Failed to fetch hospitals" },
      { status: 500 }
    );
  }
}
