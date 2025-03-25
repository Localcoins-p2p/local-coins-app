'use client';

import React, { useEffect, useState } from 'react';
import P2PTableRow from './P2PTableRow';
import { gql, useQuery } from 'urql';
import Loading from './Loading';
import { getUserReputation } from '@/utils/getUserReputation';

const GET_SALES = gql`
  query Sales($skip: Int!, $take: Int!) {
    sales(skip: $skip, take: $take) {
      sales {
        amount
        buyer {
          id
          publicKey
        }
        createdAt
        id
        tx
        onChainSaleId
        blockchain
        currency
        seller {
          name
          publicKey
          id
          paymentMethods {
            id
            name
            accountName
            accountNumber
          }
        }
        screenshotMehtods
        unitPrice
      }
      count
    }
  }
`;

export const GET_BUYER_SALES = gql`
  query BuyerSales {
    buyerSales {
      amount
      buyer {
        id
        name
        publicKey
      }
      canceledAt
      createdAt
      finishedAt
      id
      onChainSaleId
      paidAt
      screenshotMehtods
      seller {
        id
        name
        publicKey
        paymentMethods {
          id
          name
          accountNumber
          accountName
        }
      }
      unitPrice
    }
  }
`;

export const GET_SELLER_SALES = gql`
  query SellerSales {
    sellerSales {
      amount
      buyer {
        id
        name
        publicKey
      }
      seller {
        id
        name
        publicKey
      }
      canceledAt
      createdAt
      finishedAt
      id
      onChainSaleId
      paidAt
      screenshotMehtods
      seller {
        id
        name
        publicKey
        paymentMethods {
          id
          name
          accountNumber
          accountName
        }
      }
      unitPrice
    }
  }
`;

interface P2PTableProps {
  type?: 'ALL' | 'BUYER' | 'SELLER';
}

const itemsPerPage = 10;

const queries = {
  ALL: GET_SALES,
  BUYER: GET_BUYER_SALES,
  SELLER: GET_SELLER_SALES,
};

const P2PTable: React.FC<P2PTableProps> = ({ type }) => {
  const query = type ? queries[type] : GET_SALES;
  const [page, setPage] = useState(1);

  console.log('Skip:', (page - 1) * itemsPerPage);
  const [{ data, fetching, error }] = useQuery({
    query,
    variables: { skip: (page - 1) * itemsPerPage, take: itemsPerPage },
  });

  const [reputation, setReputation] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  console.log('res data:', data);

  useEffect(() => {
    async function fetchReputation() {
      const score = await getUserReputation(
        'FRXbHF8z3UEiNRG1r6ubYGTbNGjZ6g7j2WDSjjqjxNCF'
      );
      setReputation(score);
    }
    fetchReputation();
  }, []);
  console.log('><>>>', data?.sales);
  const sales =
    data?.sales?.sales || data?.sellerSales || data?.buyerSales || [];
  const totalCount = data?.sales?.count || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  if (fetching) {
    return (
      <div className="h-44 flex justify-center items-center">
        <Loading height="[24px]" width="[24px]" color="#333333" />
      </div>
    );
  }

  if (sales.length === 0) {
    return (
      <div className="text-white text-opacity-70 text-center flex justify-center items-center h-44">
        You don&apos;t have any sales
      </div>
    );
  }

  return (
    <div>
      <table className="table-auto w-full text-left">
        <thead className="hidden md:table-header-group text-[#A6A6A6] text-[14px] font-[400]">
          <tr>
            <th className="py-2 text-[#A6A6A6] text-[14px] font-[400]">
              Advertisers
            </th>
            <th className="py-2 text-[#A6A6A6] text-[14px] font-[400]">
              Price
            </th>
            <th className="py-2 text-[#A6A6A6] text-[14px] font-[400]">
              Available/Order Limit
            </th>
            <th className="py-2 text-[#A6A6A6] text-[14px] font-[400]">
              Payment
            </th>
            <th className="py-2 text-end text-[#A6A6A6] text-[14px] font-[400]">
              Trade
            </th>
          </tr>
        </thead>
        <tbody>
          {sales.map((row: any, index: number) => (
            <P2PTableRow
              key={index}
              reputation={reputation}
              sale={row}
              advertiser={row.seller}
              price={row.unitPrice}
              available={row.amount}
              limit={row.amount}
              paymentMethods={row.seller?.paymentMethods || []}
              type={type}
            />
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="flex justify-center gap-2 mt-6">
        {/* Previous Page Button */}
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
          className="w-[100px] py-1 bg-[#F3AA05] text-white rounded-2xl disabled:bg-gray-500"
        >
          Previous
        </button>

        {/* Page Number Buttons */}
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={`px-3 py-1 rounded-[50vh] ${
              page === i + 1
                ? 'bg-[#F3AA05] text-white'
                : 'bg-[#393939] text-[#f0f0f0]'
            }`}
          >
            {i + 1}
          </button>
        ))}

        {/* Next Page Button */}
        <button
          onClick={() => setPage(page + 1)}
          disabled={page === totalPages}
          className="w-[100px] py-1 bg-[#F3AA05] text-white rounded-2xl disabled:bg-gray-500"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default P2PTable;
