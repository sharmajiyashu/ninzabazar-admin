import prisma from '@/lib/prisma';

function hasLandingModels() {
  return typeof (prisma as { landingSection?: { findMany?: unknown } }).landingSection?.findMany === 'function';
}

export { hasLandingModels };

export async function adminFetchLandingSections() {
  if (hasLandingModels()) {
    return prisma.landingSection.findMany({ orderBy: { sortOrder: 'asc' } });
  }
  return prisma.$queryRaw`
    SELECT id, key, title, subtitle, "isVisible", "sortOrder", config
    FROM "LandingSection"
    ORDER BY "sortOrder" ASC
  `;
}

export async function adminUpdateLandingSection(
  id: string,
  data: { title?: string; subtitle?: string | null; isVisible?: boolean; config?: unknown }
) {
  if (hasLandingModels()) {
    return prisma.landingSection.update({ where: { id }, data });
  }
  const sets: string[] = [];
  const values: unknown[] = [];
  let i = 1;
  if (data.title !== undefined) { sets.push(`title = $${i++}`); values.push(data.title); }
  if (data.subtitle !== undefined) { sets.push(`subtitle = $${i++}`); values.push(data.subtitle); }
  if (data.isVisible !== undefined) { sets.push(`"isVisible" = $${i++}`); values.push(data.isVisible); }
  if (data.config !== undefined) { sets.push(`config = $${i++}::jsonb`); values.push(JSON.stringify(data.config)); }
  if (sets.length === 0) return;
  sets.push(`"updatedAt" = NOW()`);
  values.push(id);
  await prisma.$executeRawUnsafe(
    `UPDATE "LandingSection" SET ${sets.join(', ')} WHERE id = $${i}`,
    ...values
  );
}

export async function adminFetchLandingDeals() {
  if (hasLandingModels()) {
    return prisma.landingDeal.findMany({ orderBy: { sortOrder: 'asc' } });
  }
  return prisma.$queryRaw`
    SELECT id, title, description, "imageUrl", "bgColor", "linkUrl", "sortOrder", "isActive"
    FROM "LandingDeal"
    ORDER BY "sortOrder" ASC
  `;
}

export async function adminCreateLandingDeal(data: {
  title: string;
  description: string;
  imageUrl: string;
  bgColor: string;
  linkUrl: string | null;
  sortOrder: number;
  isActive: boolean;
}) {
  if (hasLandingModels()) {
    return prisma.landingDeal.create({ data });
  }
  const id = crypto.randomUUID();
  await prisma.$executeRaw`
    INSERT INTO "LandingDeal" (id, title, description, "imageUrl", "bgColor", "linkUrl", "sortOrder", "isActive", "createdAt", "updatedAt")
    VALUES (${id}, ${data.title}, ${data.description}, ${data.imageUrl}, ${data.bgColor}, ${data.linkUrl}, ${data.sortOrder}, ${data.isActive}, NOW(), NOW())
  `;
  return { id, ...data };
}

export async function adminUpdateLandingDeal(
  id: string,
  data: {
    title: string;
    description: string;
    imageUrl: string;
    bgColor: string;
    linkUrl: string | null;
    sortOrder?: number;
    isActive: boolean;
  }
) {
  if (hasLandingModels()) {
    return prisma.landingDeal.update({ where: { id }, data });
  }
  await prisma.$executeRaw`
    UPDATE "LandingDeal"
    SET title = ${data.title}, description = ${data.description}, "imageUrl" = ${data.imageUrl},
        "bgColor" = ${data.bgColor}, "linkUrl" = ${data.linkUrl}, "isActive" = ${data.isActive},
        "sortOrder" = ${data.sortOrder ?? 0}, "updatedAt" = NOW()
    WHERE id = ${id}
  `;
  return { id, ...data };
}

export async function adminDeleteLandingDeal(id: string) {
  if (hasLandingModels()) {
    return prisma.landingDeal.delete({ where: { id } });
  }
  await prisma.$executeRaw`DELETE FROM "LandingDeal" WHERE id = ${id}`;
}

export async function adminFetchCategorySlots(slotType?: string) {
  if (hasLandingModels()) {
    return prisma.landingCategorySlot.findMany({
      where: slotType ? { slotType } : undefined,
      include: { Category: { select: { id: true, name: true, imageUrl: true, isActive: true } } },
      orderBy: { sortOrder: 'asc' },
    });
  }
  const slots = slotType
    ? await prisma.$queryRaw<{ id: string; categoryId: string; slotType: string; sortOrder: number; isActive: boolean }[]>`
        SELECT id, "categoryId", "slotType", "sortOrder", "isActive" FROM "LandingCategorySlot"
        WHERE "slotType" = ${slotType} ORDER BY "sortOrder" ASC
      `
    : await prisma.$queryRaw`
        SELECT id, "categoryId", "slotType", "sortOrder", "isActive" FROM "LandingCategorySlot"
        ORDER BY "sortOrder" ASC
      `;
  const categories = await prisma.category.findMany({
    select: { id: true, name: true, imageUrl: true, isActive: true },
  });
  const map = Object.fromEntries(categories.map((c) => [c.id, c]));
  return (slots as { categoryId: string }[]).map((s) => ({ ...s, Category: map[s.categoryId] }));
}

export async function adminReplaceCategorySlots(slotType: string, categoryIds: string[]) {
  if (hasLandingModels()) {
    await prisma.landingCategorySlot.deleteMany({ where: { slotType } });
    if (categoryIds.length > 0) {
      await prisma.landingCategorySlot.createMany({
        data: categoryIds.map((categoryId, index) => ({
          categoryId,
          slotType,
          sortOrder: index,
          isActive: true,
        })),
      });
    }
    return adminFetchCategorySlots(slotType);
  }
  await prisma.$executeRaw`DELETE FROM "LandingCategorySlot" WHERE "slotType" = ${slotType}`;
  for (let i = 0; i < categoryIds.length; i++) {
    const id = crypto.randomUUID();
    await prisma.$executeRaw`
      INSERT INTO "LandingCategorySlot" (id, "categoryId", "slotType", "sortOrder", "isActive", "createdAt", "updatedAt")
      VALUES (${id}, ${categoryIds[i]}, ${slotType}, ${i}, true, NOW(), NOW())
    `;
  }
  return adminFetchCategorySlots(slotType);
}

export async function adminFetchProductSlots(sectionKey?: string) {
  if (hasLandingModels()) {
    return prisma.landingProductSlot.findMany({
      where: sectionKey ? { sectionKey } : undefined,
      include: {
        Product: {
          select: {
            id: true,
            name: true,
            status: true,
            isActive: true,
            basePrice: true,
            ProductImage: { where: { isDefault: true }, take: 1 },
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }
  const slots = sectionKey
    ? await prisma.$queryRaw<{ productId: string }[]>`
        SELECT id, "productId", "sectionKey", "sortOrder", "isActive" FROM "LandingProductSlot"
        WHERE "sectionKey" = ${sectionKey} ORDER BY "sortOrder" ASC
      `
    : await prisma.$queryRaw`SELECT id, "productId", "sectionKey", "sortOrder", "isActive" FROM "LandingProductSlot" ORDER BY "sortOrder" ASC`;
  const productIds = [...new Set((slots as { productId: string }[]).map((s) => s.productId))];
  if (productIds.length === 0) return [];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: {
      id: true,
      name: true,
      status: true,
      isActive: true,
      basePrice: true,
      ProductImage: { where: { isDefault: true }, take: 1 },
    },
  });
  const map = Object.fromEntries(products.map((p) => [p.id, p]));
  return (slots as { productId: string }[]).map((s) => ({ ...s, Product: map[s.productId] }));
}

export async function adminReplaceProductSlots(sectionKey: string, productIds: string[]) {
  if (hasLandingModels()) {
    await prisma.landingProductSlot.deleteMany({ where: { sectionKey } });
    if (productIds.length > 0) {
      await prisma.landingProductSlot.createMany({
        data: productIds.map((productId, index) => ({
          productId,
          sectionKey,
          sortOrder: index,
          isActive: true,
        })),
      });
    }
    return adminFetchProductSlots(sectionKey);
  }
  await prisma.$executeRaw`DELETE FROM "LandingProductSlot" WHERE "sectionKey" = ${sectionKey}`;
  for (let i = 0; i < productIds.length; i++) {
    const id = crypto.randomUUID();
    await prisma.$executeRaw`
      INSERT INTO "LandingProductSlot" (id, "productId", "sectionKey", "sortOrder", "isActive", "createdAt", "updatedAt")
      VALUES (${id}, ${productIds[i]}, ${sectionKey}, ${i}, true, NOW(), NOW())
    `;
  }
  return adminFetchProductSlots(sectionKey);
}
