import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create a demo project
  const demoProject = await prisma.project.upsert({
    where: { apiKey: 'demo-analytics-key-123' },
    update: {},
    create: {
      name: 'Demo Project',
      apiKey: 'demo-analytics-key-123',
    },
  });

  console.log('Seed data created:', { demoProject });

  // You can add some sample page views if you want
  await prisma.pageView.createMany({
    skipDuplicates: true,
    data: [
      {
        page: '/home',
        sessionId: 'seed-session-1',
        projectId: demoProject.id,
        deviceType: 'desktop',
        referrer: 'https://google.com',
      },
      {
        page: '/about',
        sessionId: 'seed-session-1',
        projectId: demoProject.id,
        deviceType: 'desktop',
        referrer: 'https://google.com',
      },
      {
        page: '/home',
        sessionId: 'seed-session-2',
        projectId: demoProject.id,
        deviceType: 'mobile',
        referrer: 'https://twitter.com',
      },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });