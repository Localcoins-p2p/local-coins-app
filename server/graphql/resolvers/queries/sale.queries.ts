import prisma from '@/prisma/prisma';
import { IGqlContext } from '@/types';
import * as Prisma from '@prisma/client';

export const sales = async (
  _: unknown,
  {
    id,
    filters,
    take = 10,
    skip = 0,
  }: {
    id?: string;
    take?: number;
    filters?: { isDisputed?: boolean };
    skip: number;
  },
  { user }: IGqlContext
) => {
  const sales: any = await prisma.sale.findMany({
    where: {
      id,
      ...(!id && {
        ...(filters ? filters : { buyer: { is: null } }),
      }),
    },
    include: {
      seller: {
        include: {
          paymentMethods: true,
        },
      },
      buyer: true,
      screenshots: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: take * 10,
    skip,
  });
  const count = await prisma.sale.count({
    where: {
      id,
      ...(!id && {
        buyer: { is: null },
        canceledAt: { not: null },
      }),
    },
  });
  if (id && sales[0].screenshots[0]) {
    sales[0].screenshots[0].method = await prisma.paymentMethod.findFirst({
      where: { userId: sales[0].sellerId },
    });
  }

  if (!id) {
    return {
      sales: sales
        .filter((sale: Prisma.Sale) => !sale.canceledAt)
        .slice(0, take),
      count,
    };
  }

  if (id && sales[0].buyerId !== user?.id) {
    sales[0].hasScreenshots = sales[0].screenshots.length > 0;
    // No Reference Requirement
    // delete sales[0].screenshots;
    return { sales };
  } else if (id) {
    return { sales };
  }

  return { sales: sales.slice(0, take), count };
};
