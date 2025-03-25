'use client';

import { useState } from 'react';
import ShadowBox from '../Elements/ShadowBox';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface TransactionConfirmationProps {
  amount: string;
  currency: string;
  message: string;
  type: string;
}

export default function TransactionConfirmation({
  amount,
  currency,
  message,
  type,
}: TransactionConfirmationProps) {

  const router = useRouter();
  const [isDone, setIsDone] = useState(false);

  const handleDone = () => {
    // setIsDone(true); 
    toast.success('Transaction completed');
    router.push("/")
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <ShadowBox className="w-[444px]  bg-secondary bg-opacity-70 p-4">
        <ShadowBox className="bg-[#D2E1D9] flex flex-col gap-4 p-4 min-h-[466px]">
          <ShadowBox className="rounded-lg bg-secondary bg-opacity-70 p-4 text-white shadow-lg ">
            <button className="text-sm font-medium leading-[100%] text-[#F5FFFA] mb-2 p-2 bg-primary bg-opacity-70 rounded-lg">
              {type}
            </button>
            <div className="flex flex-col gap-4 items-center justify-center">
              <div className="bg-primary bg-opacity-50 rounded-full  w-12 h-12 flex items-center justify-center">
                <div className="bg-primary rounded-full w-9 h-9 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="white"
                    className="w-7 h-7"
                  >
                    <path
                      fillRule="evenodd"
                      d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>

              <h1 className="text-xl font-semibold leading-[100%]">
                {amount} {currency}
              </h1>
              <p className="text-base font-normal leading-[100%]">{message}</p>
            </div>
          </ShadowBox>

          <button
            onClick={handleDone}
            className="w-full bg-primary hover:bg-secondary hover:text-white text-secondary font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Done
          </button>
        </ShadowBox>
      </ShadowBox>
    </div>
  );
}
