/**
 * Seed script for default templates
 * 
 * Run with: bun run seed:templates
 */
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../prisma/generated/client';
import { DEFAULT_TEMPLATES } from './templates';

// Load env from web app
const dotenv = await import('dotenv');
dotenv.config({ path: '../../apps/web/.env' });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function seedTemplates() {
  console.log('🌱 Seeding default templates...');

  for (const template of DEFAULT_TEMPLATES) {
    const existing = await prisma.template.findUnique({
      where: { id: template.id },
    });

    if (existing) {
      console.log(`  ⏭️  Template "${template.name}" already exists, skipping...`);
      continue;
    }

    await prisma.template.create({
      data: {
        id: template.id,
        name: template.name,
        description: template.description,
        previewImage: null, // Will be generated later
        colorScheme: JSON.stringify(template.colorScheme),
        structure: JSON.stringify(template.structure),
        isDefault: true,
        isPublic: true,
        usageCount: 0,
        userId: null, // System template
      },
    });

    console.log(`  ✅ Created template: ${template.name}`);
  }

  console.log('✨ Template seeding complete!');
}

seedTemplates()
  .catch((e) => {
    console.error('❌ Error seeding templates:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
