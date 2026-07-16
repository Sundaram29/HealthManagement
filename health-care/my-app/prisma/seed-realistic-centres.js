/* eslint-disable @typescript-eslint/no-require-imports */
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
    code: "REAL-HSP-0001",
    slug: "aiims-new-delhi",
    name: "All India Institute of Medical Sciences, New Delhi",
    city: "New Delhi",
    state: "Delhi",
    address: "Sri Aurobindo Marg, Ansari Nagar, New Delhi",
    pincode: "110029",
    phone: "011-26588500",
    email: "seed+aiims@healthmanagement.local",
    website: "https://www.aiims.edu",
    rating: 4.9,
    specialties: ["Cardiology", "Neurology", "Oncology", "Trauma Care", "General Medicine"],
    isOpen24Hours: true,
    profileCompleted: true,
    description: "Large public teaching hospital and tertiary care referral centre in New Delhi.",
  },
  {
    code: "REAL-HSP-0002",
    slug: "safdarjung-hospital-new-delhi",
    name: "Safdarjung Hospital",
    city: "New Delhi",
    state: "Delhi",
    address: "Ansari Nagar West, Ring Road, New Delhi",
    pincode: "110029",
    phone: "011-26707444",
    email: "seed+safdarjung@healthmanagement.local",
    website: "http://vmmc-sjh.nic.in",
    rating: 4.5,
    specialties: ["Emergency Medicine", "General Surgery", "Obstetrics", "Pediatrics", "Medicine"],
    isOpen24Hours: true,
    profileCompleted: true,
    description: "Central government multi-specialty hospital associated with VMMC.",
  },
  {
    code: "REAL-HSP-0003",
    slug: "tata-memorial-hospital-mumbai",
    name: "Tata Memorial Hospital",
    city: "Mumbai",
    state: "Maharashtra",
    address: "Dr. E Borges Road, Parel, Mumbai",
    pincode: "400012",
    phone: "022-24177000",
    email: "seed+tata-memorial@healthmanagement.local",
    website: "https://tmc.gov.in",
    rating: 4.8,
    specialties: ["Oncology", "Radiation Oncology", "Surgical Oncology", "Palliative Care"],
    isOpen24Hours: true,
    profileCompleted: true,
    description: "Specialist cancer hospital and research centre in Parel, Mumbai.",
  },
  {
    code: "REAL-HSP-0004",
    slug: "kem-hospital-mumbai",
    name: "King Edward Memorial Hospital",
    city: "Mumbai",
    state: "Maharashtra",
    address: "Acharya Donde Marg, Parel, Mumbai",
    pincode: "400012",
    phone: "022-24107000",
    email: "seed+kem@healthmanagement.local",
    website: "https://www.kem.edu",
    rating: 4.6,
    specialties: ["Emergency Medicine", "Internal Medicine", "Surgery", "Pediatrics", "Orthopedics"],
    isOpen24Hours: true,
    profileCompleted: true,
    description: "Municipal teaching hospital and medical college in Parel, Mumbai.",
  },
  {
    code: "REAL-HSP-0005",
    slug: "ruby-hall-clinic-pune",
    name: "Ruby Hall Clinic",
    city: "Pune",
    state: "Maharashtra",
    address: "40, Sassoon Road, Pune",
    pincode: "411001",
    phone: "020-66455100",
    email: "seed+ruby-hall@healthmanagement.local",
    website: "https://rubyhall.com",
    rating: 4.5,
    specialties: ["Cardiology", "Neurology", "Oncology", "Critical Care", "Transplant Medicine"],
    isOpen24Hours: true,
    profileCompleted: true,
    description: "Multi-specialty teaching hospital and charitable trust hospital in Pune.",
  },
  {
    code: "REAL-HSP-0006",
    slug: "apollo-hospitals-chennai",
    name: "Apollo Hospitals, Greams Road",
    city: "Chennai",
    state: "Tamil Nadu",
    address: "21 Greams Lane, Off Greams Road, Thousand Lights, Chennai",
    pincode: "600006",
    phone: "044-28293333",
    email: "seed+apollo-chennai@healthmanagement.local",
    website: "https://www.apollohospitals.com",
    rating: 4.7,
    specialties: ["Cardiology", "Oncology", "Transplant Medicine", "Neurology", "Orthopedics"],
    isOpen24Hours: true,
    profileCompleted: true,
    description: "Large private multi-specialty hospital in Chennai.",
  },
  {
    code: "REAL-HSP-0007",
    slug: "nims-hyderabad",
    name: "Nizam's Institute of Medical Sciences",
    city: "Hyderabad",
    state: "Telangana",
    address: "Punjagutta, Hyderabad",
    pincode: "500082",
    phone: "040-23489000",
    email: "seed+nims@healthmanagement.local",
    website: "https://www.nims.edu.in",
    rating: 4.4,
    specialties: ["Cardiology", "Nephrology", "Neurology", "Emergency Medicine"],
    isOpen24Hours: true,
    profileCompleted: true,
    description: "Public medical institute and tertiary care hospital in Hyderabad.",
  },
  {
    code: "REAL-HSP-0008",
    slug: "manipal-hospital-old-airport-road",
    name: "Manipal Hospital, Old Airport Road",
    city: "Bengaluru",
    state: "Karnataka",
    address: "98, HAL Old Airport Road, Bengaluru",
    pincode: "560017",
    phone: "080-22221111",
    email: "seed+manipal-bengaluru@healthmanagement.local",
    website: "https://www.manipalhospitals.com",
    rating: 4.5,
    specialties: ["Emergency Medicine", "Cardiology", "Oncology", "Neurology", "Critical Care"],
    isOpen24Hours: true,
    profileCompleted: true,
    description: "Multi-specialty hospital on Old Airport Road, Bengaluru.",
  },
];

const bloodCentres = [
  {
    hospitalCode: "REAL-HSP-0001",
    centreType: "HOSPITAL",
    hospitalName: "AIIMS New Delhi Blood Centre",
    state: "Delhi",
    district: "New Delhi",
    city: "New Delhi",
    address: "Main Hospital, Ansari Nagar, New Delhi",
    contact: "011-26594438",
    stock: { "A+": 18, "A-": 4, "B+": 21, "B-": 3, "O+": 26, "O-": 5, "AB+": 7, "AB-": 2 },
  },
  {
    hospitalCode: "REAL-HSP-0002",
    centreType: "HOSPITAL",
    hospitalName: "Safdarjung Hospital Blood Bank",
    state: "Delhi",
    district: "New Delhi",
    city: "New Delhi",
    address: "Ansari Nagar West, Ring Road, New Delhi",
    contact: "011-26707444",
    stock: { "A+": 12, "A-": 2, "B+": 16, "B-": 1, "O+": 20, "O-": 4, "AB+": 6, "AB-": 1 },
  },
  {
    centreType: "STANDALONE_BLOOD_BANK",
    hospitalName: "Rotary Blood Centre, New Delhi",
    state: "Delhi",
    district: "South Delhi",
    city: "New Delhi",
    address: "56-57, Tughlakabad Institutional Area, New Delhi",
    contact: "011-29054066",
    stock: { "A+": 24, "A-": 5, "B+": 28, "B-": 4, "O+": 35, "O-": 8, "AB+": 10, "AB-": 2 },
  },
  {
    centreType: "STANDALONE_BLOOD_BANK",
    hospitalName: "Indian Red Cross Society Blood Centre",
    state: "Delhi",
    district: "New Delhi",
    city: "New Delhi",
    address: "1, Red Cross Road, New Delhi",
    contact: "011-23716441",
    stock: { "A+": 15, "A-": 3, "B+": 19, "B-": 2, "O+": 22, "O-": 6, "AB+": 5, "AB-": 1 },
  },
  {
    hospitalCode: "REAL-HSP-0003",
    centreType: "HOSPITAL",
    hospitalName: "Tata Memorial Hospital Blood Bank",
    state: "Maharashtra",
    district: "Mumbai City",
    city: "Mumbai",
    address: "Dr. E Borges Road, Parel, Mumbai",
    contact: "022-24177000",
    stock: { "A+": 10, "A-": 2, "B+": 13, "B-": 2, "O+": 17, "O-": 4, "AB+": 9, "AB-": 1 },
  },
  {
    hospitalCode: "REAL-HSP-0004",
    centreType: "HOSPITAL",
    hospitalName: "KEM Hospital Blood Bank",
    state: "Maharashtra",
    district: "Mumbai City",
    city: "Mumbai",
    address: "Acharya Donde Marg, Parel, Mumbai",
    contact: "022-24107000",
    stock: { "A+": 19, "A-": 4, "B+": 22, "B-": 3, "O+": 29, "O-": 7, "AB+": 8, "AB-": 2 },
  },
  {
    hospitalCode: "REAL-HSP-0005",
    centreType: "HOSPITAL",
    hospitalName: "Ruby Hall Clinic Blood Bank",
    state: "Maharashtra",
    district: "Pune",
    city: "Pune",
    address: "40, Sassoon Road, Pune",
    contact: "020-66455100",
    stock: { "A+": 11, "A-": 2, "B+": 15, "B-": 2, "O+": 18, "O-": 3, "AB+": 6, "AB-": 1 },
  },
  {
    hospitalCode: "REAL-HSP-0006",
    centreType: "HOSPITAL",
    hospitalName: "Apollo Hospitals Blood Bank, Chennai",
    state: "Tamil Nadu",
    district: "Chennai",
    city: "Chennai",
    address: "21 Greams Lane, Off Greams Road, Thousand Lights, Chennai",
    contact: "044-28293333",
    stock: { "A+": 17, "A-": 3, "B+": 18, "B-": 2, "O+": 24, "O-": 5, "AB+": 7, "AB-": 1 },
  },
  {
    hospitalCode: "REAL-HSP-0007",
    centreType: "HOSPITAL",
    hospitalName: "NIMS Blood Bank, Hyderabad",
    state: "Telangana",
    district: "Hyderabad",
    city: "Hyderabad",
    address: "Punjagutta, Hyderabad",
    contact: "040-23489000",
    stock: { "A+": 14, "A-": 3, "B+": 20, "B-": 4, "O+": 23, "O-": 5, "AB+": 8, "AB-": 2 },
  },
  {
    hospitalCode: "REAL-HSP-0008",
    centreType: "HOSPITAL",
    hospitalName: "Manipal Hospital Blood Bank, Bengaluru",
    state: "Karnataka",
    district: "Bengaluru Urban",
    city: "Bengaluru",
    address: "98, HAL Old Airport Road, Bengaluru",
    contact: "080-22221111",
    stock: { "A+": 16, "A-": 2, "B+": 17, "B-": 2, "O+": 21, "O-": 4, "AB+": 6, "AB-": 1 },
  },
];

const componentsByType = {
  "A+": "Packed Red Blood Cells",
  "A-": "Whole Blood",
  "B+": "Packed Red Blood Cells",
  "B-": "Whole Blood",
  "O+": "Packed Red Blood Cells",
  "O-": "Whole Blood",
  "AB+": "Platelets",
  "AB-": "Fresh Frozen Plasma",
};

function inventoryRows(stock) {
  return Object.entries(stock).map(([type, units]) => ({
    type,
    component: componentsByType[type] || "Whole Blood",
    units,
    available: units > 0,
    lastUpdated: new Date(),
  }));
}

async function upsertHospital(hospital) {
  return prisma.hospital.upsert({
    where: { code: hospital.code },
    update: hospital,
    create: hospital,
  });
}

async function upsertBloodCentre(centre, hospitalsByCode) {
  const hospital = centre.hospitalCode ? hospitalsByCode.get(centre.hospitalCode) : null;
  const data = {
    centreType: centre.centreType,
    hospitalName: centre.hospitalName,
    state: centre.state,
    district: centre.district,
    city: centre.city,
    address: centre.address,
    contact: centre.contact,
    hospitalId: hospital?.id ?? null,
  };

  const existing = await prisma.bloodBank.findFirst({
    where: {
      OR: [
        hospital?.id ? { hospitalId: hospital.id } : undefined,
        { hospitalName: centre.hospitalName },
      ].filter(Boolean),
    },
    select: { id: true },
  });

  if (existing) {
    return prisma.bloodBank.update({
      where: { id: existing.id },
      data: {
        ...data,
        bloodGroups: {
          deleteMany: {},
          createMany: { data: inventoryRows(centre.stock) },
        },
      },
    });
  }

  return prisma.bloodBank.create({
    data: {
      ...data,
      bloodGroups: {
        createMany: { data: inventoryRows(centre.stock) },
      },
    },
  });
}

async function main() {
  console.log("Adding realistic hospitals and blood centres...");

  const hospitalsByCode = new Map();

  for (const hospital of hospitals) {
    const savedHospital = await upsertHospital(hospital);
    hospitalsByCode.set(hospital.code, savedHospital);
  }

  for (const centre of bloodCentres) {
    await upsertBloodCentre(centre, hospitalsByCode);
  }

  const [hospitalCount, centreCount, stockCount] = await Promise.all([
    prisma.hospital.count(),
    prisma.bloodBank.count(),
    prisma.bloodInventory.count(),
  ]);

  console.log(`Done. Hospitals: ${hospitalCount}, blood centres: ${centreCount}, stock rows: ${stockCount}`);
}

main()
  .catch((error) => {
    console.error("Realistic seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
