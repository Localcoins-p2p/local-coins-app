// 'use client';

// import { useState, useEffect } from 'react';
// import ShadowBox from '../Elements/ShadowBox';
// import { gql, useQuery } from 'urql';
// export const mockSales = [
//   {
//     id: '1',
//     amount: 75.0,
//     blockchain: 'ETH',
//     currency: 'PHP',
//     unitPrice: 156132,
//     seller: { name: 'Muhammad Umar Farooq' },
//     buyer: { name: 'John Doe' },
//     createdAt: new Date().toISOString(),
//     canceledAt: null,
//     disputedBy: null,
//     finishedAt: null,
//     hasScreenshots: false,
//     isDisputed: false,
//     isFloating: false,
//     onChainSaleId: null,
//     profitPercentage: 5,
//     screenshotMehtods: null,
//     screenshots: [],
//     tx: null,
//   },
//   {
//     id: '2',
//     amount: 0.0,
//     blockchain: 'SOL',
//     currency: 'PHP',
//     unitPrice: 12797.39,
//     seller: { name: 'ali nauroze' },
//     buyer: { name: 'Jane Smith' },
//     createdAt: new Date().toISOString(),
//     canceledAt: null,
//     disputedBy: null,
//     finishedAt: null,
//     hasScreenshots: false,
//     isDisputed: false,
//     isFloating: false,
//     onChainSaleId: null,
//     profitPercentage: 3,
//     screenshotMehtods: null,
//     screenshots: [],
//     tx: null,
//   },
//   {
//     id: '3',
//     amount: 0.1,
//     blockchain: 'SOL',
//     currency: 'PHP',
//     unitPrice: 100,
//     seller: { name: 'ali nauroze' },
//     buyer: { name: 'Alex Johnson' },
//     createdAt: new Date().toISOString(),
//     canceledAt: null,
//     disputedBy: null,
//     finishedAt: null,
//     hasScreenshots: false,
//     isDisputed: false,
//     isFloating: false,
//     onChainSaleId: null,
//     profitPercentage: 2,
//     screenshotMehtods: null,
//     screenshots: [],
//     tx: null,
//   },
// ];

// // Types based on the GraphQL query
// interface Sale {
//   amount: number;
//   blockchain: string;
//   buyer: {
//     name: string;
//   };
//   canceledAt: string | null;
//   createdAt: string;
//   currency: string;
//   disputedBy: string | null;
//   finishedAt: string | null;
//   hasScreenshots: boolean;
//   id: string;
//   isDisputed: boolean;
//   isFloating: boolean;
//   onChainSaleId: string | null;
//   profitPercentage: number;
//   screenshotMehtods: string[] | null;
//   screenshots: {
//     imageUrl: string;
//   }[];
//   seller: {
//     name: string;
//   };
//   tx: string | null;
//   unitPrice: number;
// }

// interface SalesData {
//   sales: {
//     count: number;
//     sales: Sale[];
//   };
// }

// export const SALE_LISTING = gql`
//   query Sales($salesId: String, $filters: SaleFilters, $skip: Int, $take: Int) {
//     sales(id: $salesId, filters: $filters, skip: $skip, take: $take) {
//       count
//       sales {
//         amount
//         blockchain
//         buyer {
//           name
//         }
//         canceledAt
//         createdAt
//         currency
//         disputedBy
//         finishedAt
//         hasScreenshots
//         id
//         isDisputed
//         isFloating
//         onChainSaleId
//         profitPercentage
//         screenshotMehtods
//         screenshots {
//           imageUrl
//         }
//         seller {
//           name
//         }
//         tx
//         unitPrice
//       }
//     }
//   }
// `;

// export default function Sales() {
//   const [{ data: salesListing, fetching }] = useQuery({ query: SALE_LISTING });
//   console.log(salesListing, 'salesListing');

//   const [salesData, setSalesData] = useState<Sale[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [skip, setSkip] = useState(0);
//   const [take, setTake] = useState(10);
//   const [totalCount, setTotalCount] = useState(0);
//   //   const [filters, setFilters] = useState<SaleFilters>({})

//   //   useEffect(() => {
//   //     const loadSales = async () => {
//   //       try {
//   //         setLoading(true)
//   //         const data = (await fetchSales(undefined, filters, skip, take)) as SalesData
//   //         setSalesData(data.sales.sales)
//   //         setTotalCount(data.sales.count)
//   //       } catch (err) {
//   //         setError("Failed to fetch sales data")
//   //         console.error(err)
//   //       } finally {
//   //         setLoading(false)
//   //       }
//   //     }

//   //     loadSales()
//   //   }, [skip, take, filters])

//   const handleBuy = (saleId: string) => {
//     console.log(`Buying sale with ID: ${saleId}`);
//     // Implement buy functionality here
//   };

//   //   if (loading) return <div className="flex justify-center p-8">Loading sales data...</div>
//   //   if (error) return <div className="text-red-500 p-8">{error}</div>

//   return (
//     <div className="flex items-center justify-center min-h-screen">
//       <ShadowBox className="bg-secondary bg-opacity-70 w-[722px] p-4">
//         <ShadowBox className="bg-[#D2E1D9] flex flex-col gap-4 p-4">
//           <h1 className="">Sales Listings</h1>

//           <ShadowBox className="bg-secondary p-4 h-[395px] overflow-y-auto">
//             <table className="min-w-full divide-y divide-black">
//               <thead className="whitespace-nowrap">
//                 <tr className="bg-primary text-xs font-normal leading-4 ">
//                   <th className="px-4 py-4 text-left">Advertisers</th>
//                   <th className="px-4 py-4 text-left">Price</th>
//                   <th className="px-4 py-4 text-left">Available/Order Limit</th>
//                   <th className="px-4 py-4 text-left">Payment</th>
//                   <th className="px-4 py-4 text-left">Trade</th>
//                 </tr>
//               </thead>
//               <tbody className="bg-primary divide-y divide-black whitespace-nowrap">
//                 {mockSales.map((sale) => (
//                   <tr key={sale.id} className="text-xs font-bold leading-4">
//                     <td className="px-4 py-4 text-left font-semibold">
//                       <div className="flex items-center gap-3">
//                         <div className="w-10 h-10 rounded-full bg-secondary text-white flex items-center justify-center text-lg font-semibold capitalize">
//                           {sale.seller.name.charAt(0)}
//                         </div>
//                         <div>
//                           <div>{sale.seller.name}</div>
//                           <div>orders | completion</div>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-4 py-4 text-left font-semibold">
//                       <div>
//                         {sale.unitPrice.toLocaleString()} {sale.currency}
//                       </div>
//                     </td>
//                     <td className="px-4 py-4 text-left font-semibold">
//                       <div>
//                         {sale.amount.toFixed(sale.blockchain === 'SOL' ? 2 : 4)}{' '}
//                         {sale.blockchain}
//                       </div>
//                       <div>
//                         {sale.amount.toFixed(sale.blockchain === 'SOL' ? 2 : 4)}{' '}
//                         {sale.blockchain}
//                       </div>
//                     </td>
//                     <td className="px-4 py-4 text-left font-semibold">
//                       <div>BPI</div>
//                     </td>
//                     <td className="px-4 py-4 text-left font-semibold">
//                       <button
//                         onClick={() => handleBuy(sale.id)}
//                         className="bg-secondary text-white font-medium py-2 px-6 rounded-lg transition-colors"
//                       >
//                         Buy
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </ShadowBox>

//           {/* Pagination controls */}
//           {totalCount > take && (
//             <div className="flex justify-between items-center mt-6">
//               <div className="text-sm text-gray-400">
//                 Showing {skip + 1} to {Math.min(skip + take, totalCount)} of{' '}
//                 {totalCount} entries
//               </div>
//               <div className="flex gap-2">
//                 <button
//                   onClick={() => setSkip(Math.max(0, skip - take))}
//                   disabled={skip === 0}
//                   className="px-3 py-1 bg-gray-800 rounded disabled:opacity-50"
//                 >
//                   Previous
//                 </button>
//                 <button
//                   onClick={() => setSkip(skip + take)}
//                   disabled={skip + take >= totalCount}
//                   className="px-3 py-1 bg-gray-800 rounded disabled:opacity-50"
//                 >
//                   Next
//                 </button>
//               </div>
//             </div>
//           )}
//         </ShadowBox>
//       </ShadowBox>
//     </div>
//   );
// }
