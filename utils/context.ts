import { createContext } from 'react';

interface PaymentMethod {
  accountName: string;
  id: string;
  name: string;
  accountNumber: string;
}

export interface IUser {
  id: string;
  name: string;
  publicKey: string;
  email: string;
  country?: string;
  points: number;
  isAdmin?: boolean;
  paymentMethods?: PaymentMethod[];
  balance?: number;
  availableForWithdrawal?: number;
}
export interface IAppContext {
  context: {
    user?: IUser;
    fetching?: boolean;
  };
  setUser?: (user: IUser) => void;
  setFetching?: (fetching: boolean) => void;
}

export const AppContext = createContext<IAppContext>({ context: {} });
