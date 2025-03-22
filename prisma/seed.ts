import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create an admin user
  const password = await hash('Admin123!', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@metricshub.com' },
    update: {},
    create: {
      email: 'admin@metricshub.com',
      name: 'Admin User',
      password,
    },
  });
  
  console.log({ admin });
  
  // Create a sample project
  const project = await prisma.project.upsert({
    where: { apiKey: 'sample-api-key-for-testing' },
    update: {},
    create: {
      name: 'Demo Project',
      apiKey: 'sample-api-key-for-testing',
    },
  });
  
  console.log({ project });
  
  // Create some sample page views
  const now = new Date();
  
  // Generate sample data for the past 7 days
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(now.getDate() - i);
    
    // Random number of views between 5 and 30
    const viewCount = Math.floor(Math.random() * 25) + 5;
    
    for (let j = 0; j < viewCount; j++) {
      await prisma.pageView.create({
        data: {
          projectId: project.id,
          page: ['/home', '/about', '/contact', '/pricing', '/blog'][Math.floor(Math.random() * 5)],
          referrer: ['https://google.com', 'https://twitter.com', 'https://facebook.com', null][Math.floor(Math.random() * 4)],
          sessionId: `test-session-${Math.floor(Math.random() * 1000)}`,
          deviceType: ['desktop', 'mobile', 'tablet'][Math.floor(Math.random() * 3)],
          createdAt: date,
        },
      });
    }
  }
  
  console.log('Sample data created!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });