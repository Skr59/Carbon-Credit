import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function randomPassword(len = 12) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

async function main() {
  const [emailArg, phoneArg, passArg] = process.argv.slice(2);
  const email = (emailArg || "admin@kisan.com").trim().toLowerCase();
  const phone = (phoneArg || "9000000000").replace(/[^\d]/g, "");
  const password = passArg || randomPassword();

  if (!/^\d{10}$/.test(phone)) {
    console.error("Phone must be a 10-digit mobile number");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { phone }] },
  });

  let user;
  if (existing) {
    user = await prisma.user.update({
      where: { id: existing.id },
      data: { role: "admin", emailVerified: true, phoneVerified: true, passwordHash, phone, email },
    });
    console.log(`Admin UPDATED: ${user.email}`);
  } else {
    user = await prisma.user.create({
      data: {
        name: "System Admin",
        email,
        phone,
        passwordHash,
        role: "admin",
        emailVerified: true,
        phoneVerified: true,
      },
    });
    console.log(`Admin CREATED: ${user.email}`);
  }

  console.log(`Login:  ${user.email}`);
  console.log(`Phone:  ${user.phone}`);
  console.log(`Role:   ${user.role}`);
  if (!process.argv.slice(2)[2]) {
    console.log(`Password: ${password}   <-- GENERATED, save it now`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());