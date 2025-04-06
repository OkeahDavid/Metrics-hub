/* eslint-disable @typescript-eslint/no-require-imports */
// src/scripts/setup-admin.ts
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

async function setupAdmin() {
  console.log('Starting setup admin process...');
  console.log('Admin username:', process.env.ADMIN_USERNAME || 'not set');
  console.log('Database URL exists:', !!process.env.DATABASE_URL);
  
  let prisma;
  try {
    console.log('Initializing Prisma client...');
    prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
    console.log('Prisma client initialized successfully');
    
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (!adminUsername || !adminPassword) {
      console.error("Admin credentials not found in environment variables");
      return;
    }
    
    console.log('Checking if admin already exists...');
    // Try a simpler query first to test connection
    try {
      await prisma.$queryRaw`SELECT 1 as test`;
      console.log('Database connection test successful');
    } catch (e) {
      console.error('Database connection test failed:', e);
      return;
    }
    
    // Now try the actual query
    try {
      const existingAdmin = await prisma.user.findUnique({
        where: { username: adminUsername }
      });
      
      if (existingAdmin) {
        console.log("Admin already exists");
        return;
      }
      
      console.log('Creating admin user...');
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      const newAdmin = await prisma.user.create({
        data: {
          username: adminUsername,
          password: hashedPassword,
          isSuperUser: true
        }
      });
      
      console.log("Admin user created successfully:", newAdmin.id);
    } catch (e) {
      console.error('Error during admin check/creation:', e);
    }
  } catch (e) {
    console.error('Error initializing Prisma:', e);
  } finally {
    if (prisma) {
      console.log('Disconnecting from database...');
      await prisma.$disconnect();
    }
  }
}

setupAdmin()
  .catch(e => {
    console.error('Unhandled error in setup script:', e);
    process.exit(1);
  });