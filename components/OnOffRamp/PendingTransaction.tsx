'use client';

import { useState, useEffect } from 'react';
import ShadowBox from '../Elements/ShadowBox';
import TransactionConfirmation from './TransactionConfirmation';
import { useRouter } from 'next/navigation';

interface PendingTransactionProps {
  amount: string;
  currency: string;
  initialMinutes: number;
  initialSeconds: number;
}

export default function PendingTransaction({
  amount,
  currency,
  initialMinutes = 14,
  initialSeconds = 59,
}: any) {
  const router = useRouter();
  const [minutes, setMinutes] = useState(initialMinutes);
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    const interval = setInterval(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1);
      } else if (minutes > 0) {
        setMinutes(minutes - 1);
        setSeconds(59);
      } else {
        clearInterval(interval);
        // Handle timer completion here
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [minutes, seconds]);

  const handleAppeal = () => {
    console.log('Appeal requested');
    // Add your appeal logic here
  };

  return (
    <>
      <div className="flex items-center justify-center min-h-screen ">
        <ShadowBox className="w-[444px] bg-secondary bg-opacity-70 p-4">
          <ShadowBox className="bg-[#D2E1D9] flex flex-col gap-4 p-4 min-h-[442px]">
            <div className="">
              <div className="flex justify-between items-center mb-2 text-secondary font-normal text-base leading-[100%]">
                <span>Pending amount</span>
                <span>
                  {amount} {currency}
                </span>
              </div>
              <div className="h-px bg-secondary w-full" />
            </div>
            {/* Header with timer */}
            <ShadowBox className="bg-secondary bg-opacity-70 p-4 rounded-md flex justify-between items-center">
              <h2 className="text-[#F5FFFA] text-base font-medium leading-[100%] max-w-[200px]">
                Your crypto will be released in
              </h2>
              <ShadowBox className="flex items-center gap-6 bg-secondary text-white px-6">
                <div className=" flex flex-col gap-2 items-center justify-center">
                  <span className="font-semibold text-sm leading-[100%]">
                    {minutes.toString().padStart(2, '0')}
                  </span>
                  <span className="font-light text-xs leading-[100%]">Min</span>
                </div>
                <div className="h-[30px] w-px bg-primary" />
                <div className="flex flex-col gap-2 items-center justify-center">
                  <span className="font-semibold text-sm leading-[100%]">
                    {seconds.toString().padStart(2, '0')}
                  </span>
                  <span className="font-light text-xs leading-[100%]">Sec</span>
                </div>
              </ShadowBox>
            </ShadowBox>
            {/* Appeal buttons */}
            <button
              onClick={handleAppeal}
              className=" text-base leading-[100%] bg-primary bg-opacity-50 hover:bg-secondary text-secondary hover:text-white rounded-md py-3 px-4 font-medium"
            >
              Appeal
            </button>
          </ShadowBox>
        </ShadowBox>
      </div>
    </>
  );
}
