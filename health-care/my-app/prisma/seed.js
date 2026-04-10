const path = require("node:path");
const { config: loadEnv } = require("dotenv");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("../src/generated/prisma");

loadEnv({ path: path.resolve(process.cwd(), ".env.local") });
loadEnv({ path: path.resolve(process.cwd(), ".env") });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not configured");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  }),
});

const hospitals = [
  {
    name: "City Care Hospital",
    city: "Delhi",
    state: "Delhi",
    address: "Saket, New Delhi",
    pincode: "110017",
    phone: "1234567890",
    email: "citycare@gmail.com",
    website: "https://citycare.example.com",
    rating: 4.5,
    specialties: ["Cardiology", "General Medicine", "Dermatology"],
    isOpen24Hours: true,
  },
  {
    name: "Apollo Hospital",
    city: "Delhi",
    state: "Delhi",
    address: "Sarita Vihar, New Delhi",
    pincode: "110076",
    phone: "9999999999",
    email: "apollo@gmail.com",
    website: "https://apollo.example.com",
    rating: 4.8,
    specialties: ["Oncology", "Cardiology", "Neurology"],
    isOpen24Hours: true,
  },
  {
    name: "Fortis Hospital",
    city: "Gurgaon",
    state: "Haryana",
    address: "Sector 44, Gurgaon",
    pincode: "122002",
    phone: "8888888888",
    email: "fortis@gmail.com",
    website: "https://fortis.example.com",
    rating: 4.6,
    specialties: ["Orthopedic", "Neurology", "Pediatrics"],
    isOpen24Hours: true,
  },
];

const doctorSeedData = {
  "City Care Hospital": [
    {
      name: "Dr. Rajesh Sharma",
      specialty: "Cardiology",
      experience: "18 years",
      rating: 5,
      reviews: 284,
      qualification: "MBBS, MD, DM Cardiology",
      college: "AIIMS Delhi",
      tags: ["Angioplasty", "Heart Failure"],
      available: "Available Today",
      conditions: ["Chest Pain", "Cardiac Care"],
    },
    {
      name: "Dr. Neha Gupta",
      specialty: "Dermatology",
      experience: "10 years",
      rating: 4,
      reviews: 150,
      qualification: "MBBS, MD Dermatology",
      college: "CMC Vellore",
      tags: ["Acne", "Laser"],
      available: "Available Tomorrow",
      conditions: ["Skin Care", "Acne"],
    },
    {
      name: "Dr. Anil Kapoor",
      specialty: "General Medicine",
      experience: "20 years",
      rating: 5,
      reviews: 300,
      qualification: "MBBS, MD Medicine",
      college: "Delhi University",
      tags: ["Fever", "Diabetes"],
      available: "Available Today",
      conditions: ["General Checkup", "Fever"],
    },
  ],
  "Apollo Hospital": [
    {
      name: "Dr. Vikram Rao",
      specialty: "Oncology",
      experience: "17 years",
      rating: 5,
      reviews: 220,
      qualification: "MBBS, DM Oncology",
      college: "Tata Memorial",
      tags: ["Cancer"],
      available: "Available Today",
      conditions: ["Cancer Care"],
    },
    {
      name: "Dr. Pooja Mehta",
      specialty: "Cardiology",
      experience: "12 years",
      rating: 4,
      reviews: 178,
      qualification: "MBBS, MD Cardiology",
      college: "PGIMER",
      tags: ["ECG", "Hypertension"],
      available: "Available Today",
      conditions: ["Heart Checkup", "Hypertension"],
    },
    {
      name: "Dr. Karan Singh",
      specialty: "Neurology",
      experience: "14 years",
      rating: 5,
      reviews: 175,
      qualification: "MBBS, DM Neurology",
      college: "PGI Chandigarh",
      tags: ["Stroke", "Migraine"],
      available: "Available Tomorrow",
      conditions: ["Brain Health", "Stroke"],
    },
  ],
  "Fortis Hospital": [
    {
      name: "Dr. Amit Verma",
      specialty: "Orthopedic",
      experience: "12 years",
      rating: 4,
      reviews: 190,
      qualification: "MBBS, MS Orthopedics",
      college: "KGMU",
      tags: ["Fracture", "Joint Pain"],
      available: "Available Today",
      conditions: ["Bone Care", "Fracture"],
    },
    {
      name: "Dr. Ritu Agarwal",
      specialty: "Pediatrics",
      experience: "9 years",
      rating: 4,
      reviews: 130,
      qualification: "MBBS, MD Pediatrics",
      college: "CMC Vellore",
      tags: ["Child Care", "Vaccination"],
      available: "Available Today",
      conditions: ["Kids Health", "Vaccination"],
    },
    {
      name: "Dr. Sunil Das",
      specialty: "Neurology",
      experience: "11 years",
      rating: 4,
      reviews: 140,
      qualification: "MBBS, DM Neurology",
      college: "JIPMER",
      tags: ["Stroke", "Headache"],
      available: "Available Tomorrow",
      conditions: ["Brain Health", "Migraine"],
    },
  ],
};

async function main() {
  console.log("Seeding started...");

  await prisma.appointment.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.bloodInventory.deleteMany();
  await prisma.bloodBank.deleteMany();
  await prisma.hospital.deleteMany();

  for (const hospital of hospitals) {
    const createdHospital = await prisma.hospital.create({ data: hospital });
    const doctors = (doctorSeedData[hospital.name] || []).map((doctor) => ({
      ...doctor,
      hospitalId: createdHospital.id,
    }));

    if (doctors.length > 0) {
      await prisma.doctor.createMany({ data: doctors });
    }
  }

  console.log("Seed complete: hospitals and doctors inserted successfully.");

  // 🩸 Blood Bank Seeding
await prisma.bloodBank.createMany({
  data: [
    {
      id: 1,
      state: "Bihar",
      district: "Patna",
      hospitalName: "PMCH Blood Bank",
      address: "Ashok Rajpath, Patna",
      contact: "9876543210",
    },
    {
      id: 2,
      state: "Delhi",
      district: "New Delhi",
      hospitalName: "AIIMS Blood Bank",
      address: "Ansari Nagar, Delhi",
      contact: "9999999991",
    },
  ],
});

await prisma.bloodInventory.createMany({
  data: [
    {
      type: "B+",
      available: true,
      units: 5,
      component: "Packed Red Blood Cells",
      lastUpdated: new Date(),
      bloodBankId: 1,
    },
    {
      type: "O+",
      available: false,
      units: 0,
      component: "Whole Blood",
      lastUpdated: new Date(),
      bloodBankId: 1,
    },
    {
      type: "A+",
      available: true,
      units: 3,
      component: "Platelets",
      lastUpdated: new Date(),
      bloodBankId: 2,
    },
  ],
  skipDuplicates: true
});

  console.log("✅ All seeding done (hospital + doctor + blood bank)");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
