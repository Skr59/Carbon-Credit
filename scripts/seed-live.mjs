import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function upsertUser(data) {
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: data.email }, { phone: data.phone }] },
  });
  if (existing) {
    const user = await prisma.user.update({
      where: { id: existing.id },
      data,
    });
    console.log(`UPDATED: ${user.email} (${user.role})`);
    return user;
  }
  const user = await prisma.user.create({ data });
  console.log(`CREATED: ${user.email} (${user.role})`);
  return user;
}

async function main() {
  const admin = await upsertUser({
    name: "System Admin",
    email: "admin@kisan.com",
    phone: "9000000000",
    passwordHash: await bcrypt.hash("B2cEj#%mh75K", 10),
    role: "admin",
    emailVerified: true,
    phoneVerified: true,
    village: "New Delhi",
    state: "Delhi",
  });
  console.log(`Admin login: ${admin.email}`);

  const farmer = await upsertUser({
    name: "Ramesh Kumar",
    email: "ramesh@farm.com",
    phone: "9876543210",
    passwordHash: await bcrypt.hash("hello123", 10),
    role: "farmer",
    emailVerified: true,
    phoneVerified: true,
    village: "Barabanki",
    state: "Uttar Pradesh",
  });
  console.log(`Demo farmer login: ${farmer.email} / hello123`);

  const landCount = await prisma.land.count({ where: { userId: farmer.id } });
  if (landCount === 0) {
    const areaHa = 5 * 0.404686;
    const creditsPerHa = 33.0;
    const totalCredits = areaHa * creditsPerHa;
    const price = 21.4;
    await prisma.land.create({
      data: {
        userId: farmer.id,
        ownerName: farmer.name,
        title: "5 acre soybean farm",
        village: "Barabanki",
        district: "Barabanki",
        state: "Uttar Pradesh",
        areaHa,
        areaAcres: 5,
        lat: 26.8503,
        lng: 81.1952,
        vegetationType: "cropland",
        cropType: "soybean",
        soilType: "alluvial",
        waterSource: "well",
        estCreditsPerHa: creditsPerHa,
        estTotalCredits: Math.round(totalCredits * 10) / 10,
        estValueINR: Math.round(totalCredits * price),
      },
    });
    console.log("Seeded demo land: 5 acre soybean farm (Barabanki, UP)");
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());