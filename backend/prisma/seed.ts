import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const eventTypes = [
  { key: 'engagement', name_en: 'Engagement', default_color_hex: '#f3b6c0', default_moodboard_enabled: false },
  { key: 'malka', name_en: 'Malka', default_color_hex: '#f3c7c0', default_moodboard_enabled: true },
  { key: 'henna_night', name_en: 'Henna Night', default_color_hex: '#f3d8c0', default_moodboard_enabled: true },
  { key: 'bride_prep', name_en: 'Bride Preparation', default_color_hex: '#c8d6e5', default_moodboard_enabled: true },
  { key: 'wedding_night', name_en: 'Wedding Night', default_color_hex: '#f7b5c0', default_moodboard_enabled: true },
  { key: 'honeymoon', name_en: 'Honeymoon', default_color_hex: '#b2d7f3', default_moodboard_enabled: true }
];

async function main() {
  for (const et of eventTypes) {
    await prisma.event_types.upsert({
      where: { key: et.key },
      update: et,
      create: et
    });
  }
  console.log('Seeded event types');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
