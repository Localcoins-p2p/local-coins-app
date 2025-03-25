'use client';

import { useState } from 'react';
import ShadowBox from '../Elements/ShadowBox';
import Image from 'next/image';
import NewOffRamp from './OffRamp';
import { gql, useQuery } from 'urql';
import Link from 'next/link';
import BuyButton from '../Elements/BuyButton';

export const BUYER_SALES = gql`
  query BuyerSales {
    buyerSales {
      id
      amount
      blockchain
      currency
      tx
      unitPrice
      createdAt
      paidAt
      finishedAt
      canceledAt
      isDisputed
      hasScreenshots
      profitPercentage
      onChainSaleId
      seller {
        name
      }
      screenshots {
        imageUrl
      }
    }
  }
`;

export const SELLER_SALES = gql`
  query SellerSales {
    sellerSales {
      id
      amount
      blockchain
      currency
      tx
      unitPrice
      createdAt
      paidAt
      finishedAt
      canceledAt
      isDisputed
      hasScreenshots
      profitPercentage
      onChainSaleId
      buyer {
        name
      }
      seller {
        id
        name
        publicKey
      }
      screenshots {
        imageUrl
      }
    }
  }
`;

const Sales = () => {
  const [activeTab, setActiveTab] = useState('seller');
  const [newOffRampState, setNewOffRampState] = useState<boolean>(false);

  const [{ data: SellerSales }] = useQuery({ query: SELLER_SALES });
  const [{ data: BuyerSales }] = useQuery({ query: BUYER_SALES });

  console.log(SellerSales, 'SellerSales');
  console.log(BuyerSales, 'BuyerSales');

  const getStatus = (txn: any) => {
    if (txn.canceledAt) return 'Canceled';
    if (txn.finishedAt) return 'Finished';
    if (txn.paidAt) return 'Paid';
    return 'Pending';
  };

  return (
    <>
      {/* {newOffRampState ? (
        <NewOffRamp setNewOffRampState={setNewOffRampState} />
      ) : ( */}
        <div className="flex items-center justify-center min-h-screen">
          <ShadowBox className="bg-secondary bg-opacity-70 w-[722px] p-4">
            <ShadowBox className="bg-[#D2E1D9] flex flex-col gap-4 p-4 ">
              <div className="flex items-center justify-between">
                <h4 className="text-custom-font-16 text-secondary">Sales</h4>
                {/* <button
                  onClick={() => setNewOffRampState(true)}
                  className="px-4 py-2 rounded-lg bg-primary bg-opacity-50 border border-primary font-medium text-base leading-[100%]"
                >
                  + New off ramp
                </button> */}
              </div>
              <ShadowBox className="bg-secondary p-4">
                <div className="h-[395px] overflow-y-auto">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <button
                        className={`px-2 py-1 rounded-md text-white border border-primary font-normal text-xs leading-4 ${
                          activeTab === 'seller'
                            ? 'bg-primary '
                            : 'border-white'
                        }`}
                        onClick={() => setActiveTab('seller')}
                      >
                        Sales Order
                      </button>
                      <button
                        className={`px-2 py-1 rounded-md border border-primary text-white font-normal text-xs leading-4 ${
                          activeTab === 'buyer' ? 'bg-primary ' : 'border-white'
                        }`}
                        onClick={() => setActiveTab('buyer')}
                      >
                        Purchase Order
                      </button>
                    </div>
                  </div>

                  <div className="mt-4">
                    {[
                      { type: 'seller', data: SellerSales?.sellerSales },
                      { type: 'buyer', data: BuyerSales?.buyerSales },
                    ].map(
                      ({ type, data }) =>
                        activeTab === type && (
                          <>
                            {data?.length > 0 ? (
                              <div className="rounded-xl overflow-x-auto">
                                <table className="min-w-full divide-y divide-black">
                                  <thead className="whitespace-nowrap">
                                    <tr className="bg-primary text-xs font-normal leading-4">
                                      <th className="px-4 py-4 text-left">
                                        {type === 'seller' ? 'Buyer' : 'Seller'}
                                      </th>
                                      <th className="px-4 py-4 text-left">
                                        Payment Method
                                      </th>
                                      <th className="px-4 py-4 text-left">
                                        Amount
                                      </th>
                                      <th className="px-4 py-4 text-left">
                                        Currency
                                      </th>
                                      <th className="px-4 py-4 text-left">
                                        Action
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-primary divide-y divide-black whitespace-nowrap">
                                    {data?.map((txn: any, index: number) => (
                                      <tr
                                        key={index}
                                        className="text-xs font-bold leading-4"
                                      >
                                        <td className="px-4 py-4 text-left font-semibold">
                                          {type === 'seller'
                                            ? txn.buyer?.name
                                            : txn.seller?.name}
                                        </td>
                                        <td className="px-4 py-4 text-left font-semibold">
                                          {txn.blockchain}
                                        </td>
                                        <td className="px-4 py-4 text-left font-semibold">
                                          {txn.amount}
                                        </td>
                                        <td className="px-4 py-4 text-left font-semibold">
                                          {txn.currency}
                                        </td>
                                        <td className="px-4 py-4 text-left font-semibold">
                                          <Link
                                            href={`/sale-detail?id=${txn.id}`}
                                          >
                                            <button className="bg-secondary text-white px-4 py-2 rounded-lg">
                                              Open
                                            </button>
                                          </Link>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center w-full h-[300px] ">
                                <div className="flex flex-col items-center gap-2 ">
                                  <Image
                                    src={'/rampz/search-data.png'}
                                    alt="No Data"
                                    width={57}
                                    height={56}
                                  />
                                  <p className=" text-white">
                                    No{' '}
                                    {type === 'saleOrder'
                                      ? 'Sales'
                                      : 'Purchase'}{' '}
                                    Orders Found.
                                  </p>
                                </div>
                              </div>
                            )}
                          </>
                        )
                    )}
                  </div>
                </div>
              </ShadowBox>
            </ShadowBox>
          </ShadowBox>
        </div>
      {/* )} */}
    </>
  );
};

export default Sales;
