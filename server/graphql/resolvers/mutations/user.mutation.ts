import prisma from '@/prisma/prisma';
import type * as Prisma from '@prisma/client';
import {
  isEmail,
  isNameValid,
  isPasswordValid,
} from '../../../utils/validation';
import jwt from 'jsonwebtoken';
import {
  ERROR,
  INCORRECT_OTP,
  PHONE_DOES_NOT_EXIST,
  RESET_PASSWORD_RESPONSE,
  SUCCESS,
  URL_EXPIRED_OR_INVALID,
  VERIFICATION_EMAIL_SENT,
} from '@/constants';
import {
  sendForgetPasswordEmail,
  sendVerificationEmail as sendVerification,
} from '@/server/services/email';
import { getPayload } from '@/server/services/token';
import { adminOnly, isLoggedIn } from '../../wrappers';
import { getRandomNumber } from '@/utils/generator';
import { PublicKey } from '@solana/web3.js';
import nacl from 'tweetnacl'; // For signature verification
import { IGqlContext } from '@/types';
import saveImages from '@/utils/saveImages';
import { ethers } from 'ethers';
import { tracker } from '@/server/utils/track';

type RegisterUserInput = Prisma.User & { password: string };
export const registerUser = async (_: unknown, args: RegisterUserInput) => {
  const password = args.password;

  if (args.email) isEmail(args.email);
  isPasswordValid(args.password);
  isNameValid(args.name || '');

  const { password: _p, ...data } = args;

  return prisma.user.create({
    data: {
      ...data,
    },
  });
};

type LoginUserInput = {
  publicKey: string;
  signedMessage: string;
  nonce: string;
  wallet: string;
};
export const login = async (
  _: unknown,
  { publicKey, signedMessage, nonce, wallet }: LoginUserInput
) => {
  try {
    const user = await prisma.user.findUnique({ where: { publicKey, nonce } });
    if (!user) {
      return {
        error: 'User not found',
      };
    }
    let isVerified = false;
    if (wallet === 'phantom') {
      const parsedSignedMessage: any = JSON.parse(signedMessage);
      const message = new TextEncoder().encode(nonce);
      const signature = new Uint8Array(parsedSignedMessage.data);
      const publicKeyDecoded = new PublicKey(publicKey);

      isVerified = nacl.sign.detached.verify(
        message,
        signature,
        publicKeyDecoded.toBytes()
      );
    } else {
      const recoveredAddress = ethers.utils.verifyMessage(
        `${nonce}`,
        signedMessage
      );
      isVerified = recoveredAddress.toLowerCase() === publicKey.toLowerCase();
    }

    if (isVerified) {
      const token = jwt.sign(
        { id: user.id, w: wallet || 'phantom' },
        process.env.JWT_SECRET as string
      );
      return {
        user,
        token,
      };
    } else {
      return {
        error: 'Incorrect email or password',
      };
    }
  } catch (err) {
    console.log('ERROR', err);
  }
};

export const generateNonce = async (
  _: unknown,
  { publicKey }: { publicKey: string }
) => {
  const nonce = Math.random().toString(36).substring(2);
  await prisma.user.upsert({
    where: { publicKey },
    create: {
      nonce,
      publicKey,
    },
    update: {
      nonce,
    },
  });
  return { nonce };
};

export const deleteUser = adminOnly(async (_: unknown, { id }) => {
  return prisma.user.delete({ where: { id } });
});

export const updateProfile = isLoggedIn(
  (
    _: unknown,
    { name, email, termsAccepted }: Prisma.User,
    { user }: IGqlContext
  ) => {
    tracker.track('PROFILE_UPDATED', null, user as Prisma.User);
    return prisma.user.update({
      where: { id: user?.id },
      data: { name, email, termsAccepted },
    });
  }
);

export const updateUser = isLoggedIn(
  async (
    _: unknown,
    {
      email,
      name,
      image,
      phone,
      termsAccepted,
      country,
    }: Prisma.User & {
      image: string;
    },
    { user }: IGqlContext
  ) => {
    const data: any = { email, name, phone, termsAccepted, country };
    tracker.track('PROFILE_UPDATED', null, user as Prisma.User);
    let profileImage;
    if (image) {
      [profileImage] = await saveImages([image]);
    }
    if (profileImage) {
      data.profileImage = profileImage;
    }

    return prisma.user.update({
      where: { id: user?.id },
      data,
    });
  }
);

export const addPaymentMethod = isLoggedIn(
  async (
    _: unknown,
    { name, accountNumber, accountName }: Prisma.PaymentMethod,
    { user }: IGqlContext
  ) => {
    tracker.track('PAYMENT_METHOD_ADDED', null, user as Prisma.User);
    return prisma.paymentMethod.create({
      data: {
        name,
        accountNumber,
        accountName,
        userId: user?.id as string,
      },
    });
  }
);

export const updatePaymentMethod = isLoggedIn(
  async (
    _: unknown,
    { id, name, accountNumber, accountName }: Prisma.PaymentMethod,
    { user }: IGqlContext
  ) => {
    return prisma.paymentMethod.update({
      where: { id, userId: user?.id },
      data: { name, accountNumber, accountName },
    });
  }
);

export const deletePaymentMethod = isLoggedIn(
  async (_: unknown, { id }: Prisma.PaymentMethod, { user }: IGqlContext) => {
    return prisma.paymentMethod.delete({ where: { id, userId: user?.id } });
  }
);
