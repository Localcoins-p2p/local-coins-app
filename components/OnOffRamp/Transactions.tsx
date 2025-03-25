'use client';

import { useContext, useState } from 'react';
import ShadowBox from '../Elements/ShadowBox';
import Image from 'next/image';
import { gql, useQuery } from 'urql';
import NewOffRamp from '../OffRamp/NewOffRamp';
import { AppContext } from '@/utils/context';
import { ArrowRightCircle, Banknote, Wallet } from 'lucide-react';
import Loading from '../Elements/Loading';
import { withdraw } from '@/utils/base-calls';

export const TRANSACTIONS = gql`
  query Query {
    transactions {
      amount
      blockchain
      createdAt
      currency
      id
      size
      tx
    }
  }
`;

const Transactions = () => {
  const {
    context: { user },
  } = useContext(AppContext);

  console.log(user, ':user');

  const [
    {
      data: transactionsData,
      fetching: fetchingTransactions,
      error: transactionsError,
    },
  ] = useQuery({
    query: TRANSACTIONS,
  });

  console.log(transactionsData, 'transactionsData');

  return (
    <>
      <div className="flex items-center justify-center min-h-screen">
        <ShadowBox className="bg-secondary bg-opacity-70 w-[722px] p-4">
          <ShadowBox className="bg-[#D2E1D9] flex flex-col gap-4 p-4 rounded-lg">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h4 className="text-custom-font-16 text-secondary ">
                Transactions
              </h4>
              <ShadowBox className="flex items-center flex-wrap gap-6 bg-secondary px-4 rounded-xl shadow-lg">
                <div className="flex items-center gap-3">
                  <Wallet className="text-primary h-5 w-5" />
                  <p className="text-white text-xs font-medium">
                    Balance:
                    <span className="font-semibold text-sm ml-1">
                      {user?.balance ?? 0}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Banknote className="text-primary h-5 w-5" />
                  <p className="text-white text-xs font-medium">
                    Available For Withdrawal:
                    <span className="font-semibold text-sm ml-1">
                      {user?.availableForWithdrawal ?? 0}
                    </span>
                  </p>
                </div>

                <button
                  onClick={withdraw}
                  className="px-4 py-2 flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-primary/80 border border-primary font-medium text-sm text-white hover:scale-105 transition-all duration-200"
                >
                  Withdrawal <ArrowRightCircle className="h-5 w-5" />
                </button>
              </ShadowBox>
            </div>
            <ShadowBox className="bg-secondary p-4">
              <div className="h-[395px] overflow-y-auto ">
                <div className="mt-4">
                  {transactionsData?.transactions?.length > 0 ? (
                    <div className="rounded-xl overflow-x-auto">
                      <table className="min-w-full divide-y divide-black ">
                        <thead className="whitespace-nowrap">
                          <tr className="bg-primary text-xs font-normal leading-4">
                            <th className="px-4 py-4 text-left">
                              Payment Method
                            </th>
                            <th className="px-4 py-4 text-left">Amount</th>
                            <th className="px-4 py-4 text-left">Quantity</th>
                            {/* <th className="px-4 py-4 text-left">Status</th> */}
                            <th className="px-4 py-4 text-left">Order No</th>
                          </tr>
                        </thead>
                        <tbody className="bg-primary divide-y divide-black whitespace-nowrap">
                          {fetchingTransactions ? (
                            <Loading width="100%" height="100%" />
                          ) : (
                            transactionsData?.transactions.map(
                              (txn: any, index: number) => (
                                <tr
                                  key={index}
                                  className="text-xs font-bold leading-4"
                                >
                                  <td className="px-4 py-4 text-left font-semibold">
                                    {txn.blockchain}
                                  </td>
                                  <td className="px-4 py-4 text-left font-semibold">
                                    {txn.amount}
                                  </td>
                                  <td className="px-4 py-4 text-left font-semibold">
                                    {txn.size}
                                  </td>
                                  {/* <td className="px-4 py-4 text-left font-semibold">
                                    Unfilled
                                  </td> */}
                                  <td className="px-4 py-4 text-left font-semibold">
                                    {txn.id}
                                  </td>
                                </tr>
                              )
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-full h-[300px]">
                      <div className="flex flex-col items-center gap-2 ">
                        <Image
                          src={'/rampz/search-data.png'}
                          alt="No Data"
                          width={57}
                          height={56}
                        />
                        <p className="text-center text-white custom-font-16">
                          You have no transactions.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </ShadowBox>
          </ShadowBox>
        </ShadowBox>
      </div>
    </>
  );
};

export default Transactions;
