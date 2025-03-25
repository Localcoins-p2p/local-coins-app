'use client';

import client from '@/client';
import './globals.css';
import { Inter } from 'next/font/google';
import { Provider } from 'urql';
import { SessionProvider } from 'next-auth/react';
import { useEffect, useMemo, useState } from 'react';
import Cookies from 'js-cookie';
import { Toaster } from 'react-hot-toast';
import Header from '@/components/Header/Header';
import { AppContext, IAppContext, IUser } from '@/utils/context';
import SetContext from '@/components/Elements/SetContext';
import AppLoading from '@/components/Elements/AppLoading';
import { decodeJwt } from '@/utils/decode-jwt';
import NewHeader from '@/components/NewHeader/NewHeader';
import BackgroundImage from '@/components/Elements/BackgroundImage';
require('@solana/wallet-adapter-react-ui/styles.css');

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [context, setContext] = useState<any>({ fetching: true });

  const setFetching = (fetching: boolean) => {
    (context as any).fetching = fetching;
    setContext({ ...context });
  };

  const setUser = (user: IUser) => {
    setContext({ ...context, user });
  };

  const endpoint = 'https://api.devnet.solana.com';
  const wallet = useMemo(() => {
    const data = decodeJwt(Cookies.get('token') || '');
    return data.w;
  }, []);

  // const wallets = useMemo(
  //   () => (wallet === 'phantom' ? [new PhantomWalletAdapter()] : []),
  //   [wallet]
  // );

  if (wallet === 'metamask') {
    return (
      <html lang="en">
        <body className={inter.className + ' bg-black'}>
          <Toaster />
          <SessionProvider>
            <AppContext.Provider value={{ context, setUser, setFetching }}>
              {
                <Provider value={client}>
                  <NewHeader />
                  {/* <BackgroundImage /> */}
                  <SetContext />
                  {children}
                  {(context as any).fetching && <AppLoading />}
                </Provider>
              }
            </AppContext.Provider>
          </SessionProvider>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body className={inter.className + ' '}>
        <Toaster />
        <SessionProvider>
          <AppContext.Provider value={{ context, setUser, setFetching }}>
            {
              <Provider value={client}>
                <NewHeader />
                <BackgroundImage />
                <SetContext />
                {children}
                {(context as any).fetching && <AppLoading />}
              </Provider>
            }
          </AppContext.Provider>
        </SessionProvider>
      </body>
    </html>
  );
}
