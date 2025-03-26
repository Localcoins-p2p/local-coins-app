import prisma from '@/prisma/prisma';
import { IGqlContext } from '@/types';
import { isLoggedIn } from '../../wrappers';

export const user = (_: unknown, args: unknown, { user }: IGqlContext) => {
  return user;
};

export const paymentMethods = isLoggedIn(
  (_1: unknown, _2: unknown, { user }: IGqlContext) => {
    return prisma.paymentMethod.findMany({
      where: { userId: user?.id as string },
    });
  }
);

export const sellerSales = isLoggedIn(
  async (_1: unknown, _2: unknown, { user }: IGqlContext) => {
    return prisma.sale.findMany({
      where: { sellerId: user?.id as string },
      orderBy: { canceledAt: 'desc' },
      include: { buyer: true, seller: true },
    });
  }
);

export const buyerSales = isLoggedIn(
  async (_1: unknown, _2: unknown, { user }: IGqlContext) => {
    return prisma.sale.findMany({
      where: { buyerId: user?.id as string },
      orderBy: { canceledAt: 'desc' },
      include: { seller: true, buyer: true },
    });
  }
);

export const getUserReputation = () => {
  const publicKey = 'FRXbHF8z3UEiNRG1r6ubYGTbNGjZ6g7j2WDSjjqjxNCF';
};

export const getActivitiesStatus = isLoggedIn(
  async (_: unknown, __: unknown, { user }: IGqlContext) => {
    const publicKey = user?.publicKey as string;

    const lastHourActivities = await prisma.onChainTransactionsHistory.findMany(
      {
        where: {
          publicKey,
          createdAt: {
            gte: new Date(new Date().setHours(new Date().getHours() - 1)),
          },
        },
      }
    );
    const max = parseInt(process.env.MAX_TRANSACTION_ALLOWED_IN_HOUR as string);
    const score =
      ((max - Math.min(lastHourActivities.length, max)) / max) * 100;
    return { score };
  }
);

export const transactions = isLoggedIn(
  async (_: unknown, __: unknown, { user }: IGqlContext) => {
    return prisma.transaction.findMany({
      where: {
        userId: user?.id as string,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
);
