'use client';

import { useState, useEffect, useContext, useMemo } from 'react';
import {
  ArrowLeft,
  Layers,
  Copy,
  ExternalLink,
  Clock,
  User,
  DollarSign,
  CreditCard,
  PlusIcon,
  BrickWall,
  ChevronDown,
  Eye,
} from 'lucide-react';

import Image from 'next/image';
import toast from 'react-hot-toast';
import ShadowBox from '../Elements/ShadowBox';
import { gql, useMutation, useQuery } from 'urql';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppContext } from '@/utils/context';
import Select from 'react-select';
import { addRemoveBuyerMutation } from '../Elements/BuyButton';
import saveImages from '@/utils/saveImages';
import { getFromCurrency, getToCurrencyv2 } from '@/utils/getCurrency';
import customStyles from '../Elements/reactSelectStyles';

import { getMasterAddress, SALE_SEED } from '@/utils/program';
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { BN } from '@project-serum/anchor';
import useSolana from '@/utils/useSolana';
import Loading from '../Elements/Loading';
import {
  confirmPayment,
  markPaid,
  raiseBuyerDispute,
  raiseSellerDispute,
  releasePaymentToSeller,
} from '@/utils/base-calls';
import AppLoading from '../Elements/AppLoading';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import CryptoReleaseTime from './CryptoReleaseTime';

export const GET_SALE = gql`
  query Sales($salesId: String) {
    sales(id: $salesId) {
      count
      sales {
        amount
        blockchain
        buyer {
          id
          publicKey
        }
        createdAt
        id
        tx
        onChainSaleId
        currency
        seller {
          name
          publicKey
          id
          paymentMethods {
            id
            name
            accountNumber
            accountName
          }
        }
        screenshotMehtods
        screenshots {
          id
          imageUrl
        }
        unitPrice
      }
    }
  }
`;
const ADD_SCREENSHOT = gql`
  mutation AddScreenshot(
    $saleId: String!
    $imageUrl: String!
    $method: String!
    $referenceId: String!
  ) {
    addScreenshot(
      saleId: $saleId
      imageUrl: $imageUrl
      method: $method
      referenceId: $referenceId
    ) {
      id
      imageUrl
      method
      paidById
    }
  }
`;
export const MATCH_SELLER_AND_SCREENSHOT_MUTATION = gql`
  mutation Mutation(
    $saleId: String!
    $imageUrl: String!
    $method: String!
    $referenceId: String!
  ) {
    addScreenshot(
      saleId: $saleId
      imageUrl: $imageUrl
      method: $method
      referenceId: $referenceId
    ) {
      id
      imageUrl
    }
  }
`;

const IS_REFERENCE_ID_CORRECT = gql`
  mutation IsReferenceIdCorrect($saleId: String!, $referenceId: String!) {
    isReferenceIdCorrect(id: $saleId, referenceId: $referenceId) {
      status
    }
  }
`;

const MARK_PAID = gql`
  mutation MarkPaid($saleId: String!, $referenceId: String!) {
    markSalePaid(id: $saleId, referenceId: $referenceId) {
      id
      paidAt
    }
  }
}
`;

export const CANCEL_SALE = gql`
  mutation CancelSale($cancelSaleId: String!) {
    cancelSale(id: $cancelSaleId) {
      id
    }
  }
`;

const MARK_FINISHED = gql`
  mutation MarkSaleFinished($markSaleFinishedId: String!) {
    markSaleFinished(id: $markSaleFinishedId) {
      id
    }
  }
`;

const MARK_DISPUTED = gql`
  mutation Mutation($saleId: String!) {
    markDisputed(saleId: $saleId) {
      id
    }
  }
`;

const SaleDetail = () => {
  const searchParams = useSearchParams();
  const salesId = searchParams.get('id');
  const [sale, setSale] = useState<any>();
  const [image, setImage] = useState('');
  const [referenceId, setReferenceId] = useState();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  // console.log("img",image)
  const [{ fetching, data, error: getSaleError }, fetchSale] = useQuery({
    query: GET_SALE,
    variables: { salesId },
    pause: !salesId,
  });
  console.log(sale, 'sale by wajid');
  const [{}, checkIsReferenceIdCorrect] = useMutation(IS_REFERENCE_ID_CORRECT);
  const [{ fetching: addScreenshotFetching }, addScreenshotMutation] =
    useMutation(ADD_SCREENSHOT);
  const [{ fetching: fetchingRemoveBuyer }, removeBuyer] = useMutation(
    addRemoveBuyerMutation
  );
  const [disputeLoading, setDisputeLoading] = useState(false);
  const [{ fetching: _markingDisputed }, markDisputedMutation] =
    useMutation(MARK_DISPUTED);
  const [{ fetching: canceling }, cancelSale] = useMutation(CANCEL_SALE);
  const [{}, markPaidMutation] = useMutation(MARK_PAID);
  const [{}, markFinished] = useMutation(MARK_FINISHED);
  const [selectedPaymentMethodIndex, setSelectedPaymentMethodIndex] =
    useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const { connection, program, programId, publicKey, sendTransaction } =
    useSolana();
  const [referenceNumber, setReferenceNumber] = useState('');
  console.log(referenceNumber, 'referenceNumber');

  const paymentMethods = sale?.seller?.paymentMethods || [];

  const [_sale] = data?.sales?.sales || [];
  const {
    context: { user },
  } = useContext(AppContext);

  const toCurrency = useMemo(() => {
    if (sale && sale.currency) {
      return getToCurrencyv2(sale.currency) as { name: string; x: number };
    }

    if (sale && !sale.currency) {
      return getToCurrencyv2('SOL') as { name: string; x: number };
    }

    return { name: '', x: 1 };
  }, [sale]);

  useEffect(() => {
    setSale(_sale);
    const refetch = _sale && !_sale?.paidAt && !_sale?.canceledAt;
    if (refetch) {
      setTimeout(() => {
        fetchSale({ requestPolicy: 'network-only' });
      }, 3000);
    }
  }, [_sale]);

  const firstTimeLoading = !sale && fetching;

  const isSeller = user?.id === sale?.seller?.id;
  const isBuyer = false;
  // const isBuyer = user?.id === sale?.buyer?.id;

  console.log(isSeller, 'isSeller');
  console.log(isBuyer, 'isBuyer');

  const counterparty = isSeller ? sale?.buyer : sale?.seller; // 'seller' or 'buyer'

  const showConfirmPaymentReceivedButton =
    isSeller && !sale?.paidAt && !sale?.canceledAt;
  const hideConfirmButtonShowDisputes =
    showConfirmPaymentReceivedButton && !sale?.hasScreenshots;
  console.log('<<<<', showConfirmPaymentReceivedButton, sale?.hasScreenshots);
  const showConfirmPaymentSentButton =
    isBuyer && !sale?.paidAt && !sale?.isCanceled;
  const showClaimPaymentButton = isBuyer && sale?.paidAt && !sale.finishedAt;

  const showSellerDisputeButton =
    isSeller &&
    sale?.screenshots?.length > 0 &&
    !sale.isDisputed &&
    !sale.isCanceled &&
    !sale.isFinished;
  const showBuyerDisputeButton =
    isBuyer &&
    sale?.screenshots?.length > 0 &&
    !sale.isDisputed &&
    !sale.isCanceled &&
    !sale.isFinished;

  const router = useRouter();

  const getStatus = (txn: any) => {
    if (txn?.canceledAt)
      return { label: 'Canceled', color: 'bg-red-500/20 text-red-900' };
    if (txn?.finishedAt)
      return { label: 'Finished', color: 'bg-green-500/20 text-green-900' };
    if (txn?.paidAt)
      return { label: 'Paid', color: 'bg-blue-500/20 text-blue-900' };
    return { label: 'Pending', color: 'bg-yellow-500/50 text-yellow-900' };
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  // upload screenShort
  const [
    {
      fetching: fetchingMatchSeller,
      error: errorMatchSeller,
      data: dataMatchSeller,
    },
    mutateMatchSeller,
  ] = useMutation(MATCH_SELLER_AND_SCREENSHOT_MUTATION);
  // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   if (e.target.files && e.target.files[0]) {
  //     setFile(e.target.files[0]);
  //   }
  // };

  // const handleSubmit = async () => {
  //   if (!file) {
  //     toast.error('Please upload a proof of payment.');
  //     return;
  //   }

  //   const reader = new FileReader();
  //   reader.readAsDataURL(file);
  //   reader.onloadend = async () => {
  //     const base64Image = reader.result as string;

  //     try {
  //       // Upload image to Vercel Blob and get URL
  //       const [imageUrl] = await saveImages([base64Image]);

  //       if (!imageUrl) {
  //         toast.error('Failed to upload image.');
  //         return;
  //       }

  //       // Send the uploaded image URL to the backend
  //       const result = await mutateMatchSeller({
  //         saleId: salesId, // Replace with actual saleId
  //         imageUrl, // Use uploaded image URL
  //         method: '66fb0f0fc2a69f59952e04ed', // Replace with actual method
  //         referenceId: referenceNumber, // Replace with actual referenceId
  //       });

  //       if (result.error) {
  //         toast.error('Proof not submitted.');
  //         console.error('Error Proof not submitted:', result.error);
  //       } else {
  //         toast.success('Proof submitted successfully!');
  //       }
  //     } catch (error) {
  //       console.error('Error occurred while submitting the proof', error);
  //       toast.error('Error occurred while submitting the proof.');
  //     }
  //   };

  //   reader.onerror = () => {
  //     toast.error('Failed to read the file.');
  //   };
  // };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64String = (e.target as any).result;
      setImage(base64String);
    };
    reader.readAsDataURL(file as File);
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
    }
  };

  useEffect(() => {
    if (sale?.screenshots?.[0]) {
      setSelectedImage(sale.screenshots[0].imageUrl);
    }
  }, [sale]);

  // const takeReferenceNumber = async (image: string) => {
  //   confirmAlert({
  //     title: 'Enter the reference number',
  //     message:
  //       'Please enter the reference number. Make sure you are transferring the funds to the correct account and same bank',
  //     buttons: [
  //       {
  //         label: 'Submit',
  //         onClick: async () => {
  //           if (referenceNumber === '') {
  //             toast.error('Please enter a valid reference number');
  //             return;
  //           }
  //           await handleAddScreenshot(image, '');
  //         },
  //       },
  //     ],
  //     customUI: ({ onClose }) => {
  //       return (
  //         <div className="rounded-xl p-4 p-1 bg-secondary text-white w-[75vw] md:w-[400px]">
  //           <h1 className="font-bold text-xl">Enter the reference number</h1>
  //           <p className="text-sm opacity-90">
  //             Please enter the reference number. Make sure you are transferring
  //             the funds to the correct account and same bank
  //           </p>

  //           <input
  //             type="text"
  //             className="w-full p-2 mt-2 rounded-md"
  //             placeholder="Reference Number"
  //             // value={referenceNumber}
  //             onChange={(e) => setReferenceNumber(e.target.value)}
  //           />
  //           <div className="flex justify-between mt-2">
  //             <button className="text-white" onClick={onClose}>
  //               Cancel
  //             </button>
  //             <button
  //               onClick={async () => {
  //                 await handleAddScreenshot(image, '');
  //                 onClose();
  //               }}
  //               className="float-right p-2 font-medium rounded-md bg-primary text-secondary hover:bg-primary/90 hover:text-white transition-colors"
  //             >
  //               Add Screenshot
  //             </button>
  //           </div>
  //         </div>
  //       );
  //     },
  //   });
  // };

  const confirmPaymentReceived = async () => {
    confirmAlert({
      title: 'Confirm Payment Received',
      message:
        'Are you sure you want to confirm payment received? If received, kindly enter the reference id of the payment. We ask for payments to ensure that the seller receives the payment and avoid any mistake.',
      customUI: ({ onClose }) => {
        return (
          <div className="rounded-xl p-4 p-1 bg-secondary text-white w-[75vw] md:w-[400px]">
            <h1 className="font-bold text-xl">Confirm Payment Received</h1>
            <p className="text-sm opacity-90">
              Are you sure you want to confirm payment received? If received,
              kindly enter the reference id of the payment. We ask for payments
              to ensure that the seller receives the payment and avoid any
              mistake.
            </p>

            <input
              type="text"
              className="w-full p-2 mt-2 rounded-md"
              placeholder="Reference Number"
              // value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
            />
            <div className="flex justify-between mt-2">
              <button className="text-white" onClick={onClose}>
                Cancel
              </button>
              <button
                onClick={async () => {
                  await handlePaymentReceived();
                  onClose();
                }}
                className="float-right p-2 font-medium rounded-md  bg-primary text-secondary hover:bg-primary/90 hover:text-white transition-colors"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        );
      },
    });
  };

  const handleAddScreenshot = async (imageUrl: string, method: string) => {
    try {
      if (toCurrency.name === 'ETH' || toCurrency.name === 'eth') {
        await markPaid(sale.onChainSaleId);
      }
      if (imageUrl.indexOf('vercel') === -1) {
        await addScreenshotMutation({
          saleId: sale.id,
          imageUrl,
          referenceId: '',
          method: '',
        });
      }
      toast.success('Screenshot added successfully');
    } catch (error) {
      toast.error('Failed to add screenshot');
    }
  };

  // console.log("handleAddScreenshot",handleAddScreenshot)

  const handlePaymentReceived = async () => {
    try {
      const isReferenceIdCorrect = await checkIsReferenceIdCorrect({
        saleId: sale.id,
        referenceId: referenceNumber,
      });
      if (
        isReferenceIdCorrect?.data?.isReferenceIdCorrect?.status === 'WRONG'
      ) {
        toast.error('Reference number is incorrect');
        return;
      }
      if (toCurrency.name === 'ETH' || toCurrency.name === 'eth') {
        await confirmPayment(sale?.onChainSaleId);
        await markPaidMutation({
          saleId: sale?.id,
          refenceId: referenceNumber,
        });
        await markFinished({ saleId: sale?.id });
      } else {
        const masterPda = await getMasterAddress();
        const onChainSaleId = new BN(sale.onChainSaleId);
        const [salePda, saleBump] = await PublicKey.findProgramAddress(
          [Buffer.from(SALE_SEED), onChainSaleId.toArrayLike(Buffer, 'le', 4)],
          programId
        );
        const authority = publicKey;
        const transaction = new Transaction().add(
          (program as any).instruction.markPaid(onChainSaleId, {
            accounts: {
              sale: salePda,
              master: masterPda,
              authority: authority as PublicKey,
              systemProgram: SystemProgram.programId,
            },
          })
        );
        const txHash = await sendTransaction(transaction, connection);
        await markPaidMutation({
          saleId: sale?.id,
          referenceId: referenceNumber,
        });
      }
    } catch (err) {
    } finally {
    }
  };

  const handleClaimPayment = async () => {
    try {
      const masterPda = await getMasterAddress();
      const onChainSaleId = new BN(sale.onChainSaleId);
      const [salePda, saleBump] = await PublicKey.findProgramAddress(
        [Buffer.from(SALE_SEED), onChainSaleId.toArrayLike(Buffer, 'le', 4)],
        programId
      );
      const authority = publicKey;
      const transaction = new Transaction().add(
        (program as any).instruction.claimPayment(onChainSaleId, {
          accounts: {
            sale: salePda,
            master: masterPda,
            authority: authority as PublicKey,
            systemProgram: SystemProgram.programId,
          },
        })
      );
      const txHash = await sendTransaction(transaction, connection);
      await markFinished({ markSaleFinishedId: sale?.id });
      toast.success('Amount received');
    } catch (err) {
    } finally {
    }
  };

  const handleBuyerCancel = async () => {
    try {
      const masterPda = await getMasterAddress();
      const onChainSaleId = new BN(sale.onChainSaleId);
      const [salePda, saleBump] = await PublicKey.findProgramAddress(
        [Buffer.from(SALE_SEED), onChainSaleId.toArrayLike(Buffer, 'le', 4)],
        programId
      );
      const authority = publicKey;
      const transaction = new Transaction().add(
        (program as any).instruction.removeBuyer(onChainSaleId, {
          accounts: {
            sale: salePda,
            master: masterPda,
            authority: authority as PublicKey,
            systemProgram: SystemProgram.programId,
          },
        })
      );
      const txHash = await sendTransaction(transaction, connection);
      await removeBuyer({
        id: sale.id,
        command: 'REMOVE',
      });
      toast.success('Purchase canceled');
    } catch (err) {
    } finally {
    }
  };

  const handleSellerCancel = async () => {
    try {
      const masterPda = await getMasterAddress();
      const onChainSaleId = new BN(sale.onChainSaleId);
      const [salePda, saleBump] = await PublicKey.findProgramAddress(
        [Buffer.from(SALE_SEED), onChainSaleId.toArrayLike(Buffer, 'le', 4)],
        programId
      );
      const authority = publicKey;

      if (sale.buyer) {
        return toast.error('Buyer is already connected to this sale');
      }

      const transaction = new Transaction().add(
        (program as any).instruction.cancelSale(onChainSaleId, {
          accounts: {
            sale: salePda,
            master: masterPda,
            authority: authority as PublicKey,
            systemProgram: SystemProgram.programId,
          },
        })
      );
      const txHash = await sendTransaction(transaction, connection);
      const response = await cancelSale({
        cancelSaleId: sale.id,
      });
      // console.log('Response', response);
      toast.success('Sale canceled');
    } catch (err) {
      console.log(err);
    } finally {
    }
  };

  const handleSellerDispute = async () => {
    try {
      setDisputeLoading(true);
      if (true) {
        await raiseSellerDispute(sale?.onChainSaleId);
        await markDisputedMutation({ saleId: sale?.id });
      }
    } catch (err) {
    } finally {
      setDisputeLoading(false);
      toast.success('Marked disputed. Admins will check this sale order');
    }
  };

  const handleBuyerDispute = async () => {
    try {
      setDisputeLoading(true);
      if (true) {
        await raiseBuyerDispute(sale?.onChainSaleId);
        await markDisputedMutation({ saleId: sale?.id });
      }
    } catch (err) {
    } finally {
      setDisputeLoading(false);
      toast.success('Marked disputed. Admins will check this sale order');
    }
  };

  const handleReleaseFundsToSeller = async () => {
    try {
      setDisputeLoading(true);
      if (true) {
        // console.log('>>>Sale', sale);
        await releasePaymentToSeller(sale?.onChainSaleId);
        //await markDisputedMutation({ saleId: sale?.id });
      }
    } catch (err) {
      console.log('ERROR', err);
    } finally {
      setDisputeLoading(false);
      toast.success('Funds released to seller');
    }
  };

  const options = paymentMethods.map((method: any) => ({
    value: method.name,
    label: method.name,
  }));

  const handleChangeClick = () => {
    setDropdownVisible(!isDropdownVisible);
  };

  const handleChangePaymentMethod = (selectedOption: any) => {
    const selectedIndex = paymentMethods.findIndex(
      (method: any) => method.name === selectedOption.value
    );
    setSelectedPaymentMethodIndex(selectedIndex);
    // setDropdownVisible(false);
  };

  const markingDisputed = _markingDisputed || disputeLoading;

  if (firstTimeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-10 w-40 bg-custom-green-medium/30 rounded mb-4"></div>
          <div className="h-64 w-96 bg-custom-green-medium/20 rounded"></div>
        </div>
      </div>
    );
  }

  if (getSaleError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary">
        <div className="text-red-500">Error fetching sale details</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-center min-h-screen">
        <ShadowBox className="bg-secondary bg-opacity-70 w-[722px] p-4">
          <ShadowBox className="bg-[#D2E1D9] flex flex-col gap-4 p-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-secondary transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>

            <ShadowBox className="bg-secondary flex flex-col gap-4 p-4 ">
              {/* <CryptoReleaseTime
                title={
                  isSeller
                    ? 'Please Release Crypto'
                    : isBuyer
                    ? 'Your crypto will be released in'
                    : 'Released crypto in'
                }
                className="bg-primary"
              /> */}
              {/* <ShadowBox className="flex items-center justify-between  text-secondary bg-primary rounded-lg">
                <div>
                  <div className="text-xs uppercase mb-1">Transaction ID</div>
                  <div className="flex items-center gap-2">
                    <h1 className=" font-medium ">{sale?.id || 'N/A'}</h1>
                    <button
                      onClick={() =>
                        copyToClipboard(sale?.id || '', 'Transaction ID')
                      }
                      className="hover:text-white transition-all"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
                <span
                  className={`py-1 px-3 rounded-full text-xs font-medium ${
                    getStatus(sale)?.color || 'bg-gray-500/20 text-gray-900'
                  }`}
                >
                  {getStatus(sale)?.label || 'Unknown'}
                </span>
              </ShadowBox> */}

              <div className="flex gap-4">
                {/* Left side - Sale info */}
                <div className="flex-1 flex flex-col gap-4 max-w-[19rem] ">
                  <ShadowBox className="bg-primary text-secondary p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="text-xs flex-col gap-1">
                        <div className=" uppercase ">Fiat Amount</div>
                        <div className="flex items-center gap-2">
                          <DollarSign size={16} className="" />
                          <span className=" font-medium">
                            {(sale?.amount * sale?.unitPrice) / toCurrency?.x}{' '}
                            {getFromCurrency().name}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs flex-col gap-1">
                        <div className=" uppercase ">Unit Price</div>
                        <div className="flex items-center gap-2">
                          <CreditCard size={16} className="" />
                          <span className=" font-medium">
                            {sale?.unitPrice} {getFromCurrency().name}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs flex-col gap-1">
                        <div className=" uppercase ">Payment Method</div>
                        <div className="flex items-center gap-2">
                          <Layers size={16} className="" />
                          <span className=" font-medium capitalize">
                            {sale?.blockchain || 'N/A'}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs flex flex-col gap-1">
                        <div className=" uppercase ">Receive Quantity</div>
                        <div className="flex items-center gap-2">
                          <BrickWall size={16} className="" />
                          <span className=" font-medium capitalize">
                            {sale?.amount / toCurrency?.x} {toCurrency?.name}
                          </span>
                        </div>
                      </div>
                    </div>
                  </ShadowBox>

                  <div className="flex flex-col gap-4">
                    {isSeller && (
                      <div className="flex flex-col gap-1 text-xs text-white">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-primary rounded-full" />
                          <h2 className=" font-medium">
                            {(sale?.amount * sale?.unitPrice) / toCurrency?.x}{' '}
                            PHP transfer to{' '}
                            {paymentMethods[selectedPaymentMethodIndex]?.name}
                          </h2>
                        </div>

                        <p className="">
                          Funds will be transfered to one of the payment methods
                          below.
                        </p>
                      </div>
                    )}
                    {isBuyer && (
                      <div className="flex flex-col gap-1 text-xs text-white">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-primary rounded-full" />
                          <h2 className=" font-medium">
                            Open{' '}
                            {paymentMethods[selectedPaymentMethodIndex]?.name}{' '}
                            to transfer{' '}
                            {(sale?.amount * sale?.unitPrice) / toCurrency?.x}{' '}
                            PHP
                          </h2>
                        </div>
                        <p className="">
                          Transfer the funds to the seller&apos;s account
                          provided below.
                        </p>
                      </div>
                    )}
                    <ShadowBox className="bg-primary text-secondary p-4 rounded-lg">
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex flex-col gap-1 text-xs">
                              <p className="uppercase">Payment Method Name</p>
                              <span className="">
                                {paymentMethods[selectedPaymentMethodIndex]
                                  ?.name || 'N/A'}
                              </span>
                            </div>

                            {isDropdownVisible ? (
                              <div className="flex items-center border justify-center border-[#4D4D4D] rounded-[5px] px-1 ">
                                <Select
                                  className="w-[100px]"
                                  options={options}
                                  styles={customStyles}
                                  isSearchable={false}
                                  components={{
                                    DropdownIndicator: () => (
                                      <ChevronDown
                                        size={14}
                                        className="text-secondary"
                                      />
                                    ),
                                  }}
                                  onChange={handleChangePaymentMethod}
                                />
                              </div>
                            ) : (
                              <button
                                className="text-secondary"
                                onClick={handleChangeClick}
                              >
                                Change
                              </button>
                            )}
                          </div>
                          <div className="text-xs  uppercase ">
                            Account Name
                          </div>
                          <div className="text-xs ">
                            {paymentMethods[selectedPaymentMethodIndex]
                              ?.accountName || 'N/A'}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs  uppercase ">
                            Account Number
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-xs ">
                              {paymentMethods[selectedPaymentMethodIndex]
                                ?.accountNumber || 'N/A'}
                            </div>
                            <button
                              onClick={() =>
                                copyToClipboard(
                                  paymentMethods?.accountNumber || '',
                                  'Account Number'
                                )
                              }
                              className=" hover:text-white transition-all"
                            >
                              <Copy size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </ShadowBox>
                  </div>
                </div>

                {/* Right side - Payment proof */}
                <div className="flex-1 flex flex-col gap-4 max-w-[19rem] ">
                  <ShadowBox className="bg-primary text-secondary p-4 rounded-lg">
                    <p className="text-xs uppercase ">Transaction Hash</p>
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="font-mono text-sm truncate max-w-[300px]">
                          {sale?.tx || 'N/A'}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              copyToClipboard(
                                sale?.tx || '',
                                'Transaction Hash'
                              )
                            }
                            className=" hover:text-white transition-all"
                          >
                            <Copy size={14} />
                          </button>
                          <a
                            href={`https://etherscan.io/tx/${sale?.tx}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className=" hover:text-white transition-all"
                          >
                            <ExternalLink size={14} />
                          </a>
                        </div>
                      </div>
                    </div>
                  </ShadowBox>

                  <ShadowBox className="bg-primary text-secondary p-4 rounded-lg">
                    <div className="text-xs  uppercase mb-0.5">
                      Counterparty
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full border border-secondary flex items-center justify-center">
                        <User size={18} className="" />
                      </div>
                      <div>
                        <div className="font-medium">
                          {counterparty?.name || 'N/A'}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-mono ">
                          <p className="max-w-[170px] overflow-hidden truncate">
                            {counterparty?.publicKey || 'N/A'}{' '}
                          </p>
                          <button
                            onClick={() =>
                              copyToClipboard(
                                counterparty?.publicKey || '',
                                'Counterparty Public Key'
                              )
                            }
                            className="hover:text-white transition-all"
                          >
                            <Copy size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </ShadowBox>

                  <div className="flex flex-col gap-3">
                    <h2 className="font-medium text-white ">Payment Proof</h2>

                    {isSeller && (
                      <>
                        <h2 className="text-xs text-white">
                          Check the proof sent from the buyer.
                        </h2>
                        <div
                          className="relative w-full h-[180px] rounded-lg  cursor-pointer"
                          onClick={() => setIsModalOpen(true)}
                        >
                          <Image
                            src={
                              sale?.screenshots?.[0]?.imageUrl ||
                              '/rampz/wait.png'
                            }
                            alt="ETH"
                            width={100}
                            height={180}
                            className="object-fill w-full h-full rounded-lg"
                          />
                          <div className="absolute inset-0 flex items-center justify-center text-white gap-3">
                            <Eye className="w-6 h-6 " />
                            <h3 className="text-base font-medium leading-[100%]">
                              {' '}
                              See Proof
                            </h3>
                          </div>
                        </div>
                      </>
                    )}
                    {isBuyer && (
                      <>
                        <h2 className="text-xs text-white">
                          Upload the image and notify the seller
                        </h2>
                        <label
                          htmlFor="proof-upload"
                          className="relative bg-primary  text-white rounded-lg h-[180px] w-full flex items-center justify-center cursor-pointer transition-colors"
                        >
                          <div className="absolute inset-0 flex items-center justify-center text-white gap-3">
                            <PlusIcon />
                            <span className="font-medium">Upload Proof</span>
                          </div>
                          <input
                            id="proof-upload"
                            type="file"
                            className="hidden"
                            onChange={handleImageChange}
                            accept="image/*"
                          />
                          {selectedImage && ( // Display the selected image if available
                            <Image
                              src={selectedImage} // Create a URL for the selected file
                              alt="Selected Proof"
                              width={169} // Set width to fit the button
                              height={169} // Set height to fit the button
                              className="object-fill w-full h-full rounded-lg" // Style the image
                            />
                          )}
                          {/* Display selected file name if any */}
                          {/* {selectedImage && (
                            <div className="absolute bottom-2 px-2 text-sm text-secondary max-w-sm truncate">
                              {selectedImage.name}
                            </div>
                          )} */}
                        </label>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 ">
                <div className="w-3 h-3 bg-primary rounded-full" />
                <p className="text-white">
                  {isSeller ? 'Check your accounts' : 'Notify Seller'}
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <p className="text-white text-xs">
                  {isSeller &&
                    'Please check your account to confirm the payment. Once the buyer has uploaded the screenshot, you will see Confirm Payment button. Click on that button and enter reference id.'}
                  {isBuyer &&
                    'After payment, remember to click the &apos;Transferred, Notify Seller&apos; button to facilitate the crypto release by the seller.'}
                </p>
                {showConfirmPaymentSentButton && (
                  <div className="flex justify-between ">
                    <button
                      disabled={addScreenshotFetching}
                      className="bg-primary text-secondary hover:bg-primary/90 hover:text-white py-2 px-4 pr-10 flex gap-2 rounded-lg transition-colors"
                      onClick={
                        // () => {
                        //   takeReferenceNumber(image);
                        // }
                        () => {
                          selectedImage
                            ? handleAddScreenshot(image, '')
                            : toast.error(
                                'Please upload the proof image first.'
                              );
                        }
                      }
                    >
                      {/* <div>
                                {loading ? (
                                  <Loading width="5" height="5" color="#333" />
                                ) : (
                                  <div className="w-5 h-5" />
                                )}
                              </div> */}
                      <span>Transfered, Notify Seller</span>
                    </button>
                    <div className="flex justify-between  gap-4">
                      {showBuyerDisputeButton && (
                        <button
                          className=" bg-primary text-secondary hover:bg-primary/90 hover:text-white py-2 px-4 rounded-lg transition-colors"
                          onClick={handleBuyerDispute}
                        >
                          Dispute
                        </button>
                      )}
                      <button
                        className="bg-red-500 hover:bg-red-600 text-white  py-2 px-4 rounded-lg transition-colors"
                        onClick={handleBuyerCancel}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                {showConfirmPaymentReceivedButton && (
                  <div className="flex flex-wrap justify-between gap-4">
                    {hideConfirmButtonShowDisputes ? (
                      <p className="text-white text-xs max-w-sm">
                        Waiting for buyer to send you payment screenshot. Once
                        you receive the payment, you will see the confirm button
                        here.
                      </p>
                    ) : (
                      <button
                        className="bg-primary hover:bg-primary/90 text-secondary hover:text-white py-2 px-4 rounded-lg flex gap-2 transition-colors"
                        onClick={confirmPaymentReceived}
                      >
                        <div>
                          {fetching ? (
                            <Loading width="5" height="5" color="#333" />
                          ) : (
                            <div className="w-5 h-5" />
                          )}
                        </div>
                        <span>Confirm Payment Received</span>
                      </button>
                    )}
                    <div className="flex gap-4">
                      {showSellerDisputeButton && (
                        <button
                          className=" bg-primary hover:bg-primary/90 text-secondary hover:text-white py-2 px-4 rounded-lg  transition-colors"
                          onClick={handleSellerDispute}
                        >
                          Dispute
                        </button>
                      )}
                      <button
                        className="bg-red-500 hover:bg-red-600 text-white  py-2 px-4 rounded-lg transition-colors"
                        onClick={handleSellerCancel}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                {showClaimPaymentButton && (
                  <div className="flex justify-between ">
                    <button
                      className="bg-primary text-secondary hover:bg-primary/90 hover:text-white py-2 px-4 pr-10 flex gap-2 rounded-lg transition-colors"
                      onClick={handleClaimPayment}
                    >
                      {/* <div>
                                {loading ? (
                                  <Loading width="5" height="5" color="#333" />
                                ) : (
                                  <div className="w-5 h-5" />
                                )}
                              </div> */}
                      <span>Claim Payment</span>
                    </button>
                  </div>
                )}
              </div>

              {user?.isAdmin && sale?.isDisputed && (
                <div className="flex gap-4">
                  <button
                    className="bg-primary text-secondary hover:bg-primary/90 hover:text-white py-2 px-4 rounded-lg transition-colors"
                    onClick={handleReleaseFundsToSeller}
                  >
                    Release Payment to Seller
                  </button>
                  <button
                    className="bg-primary text-secondary hover:bg-primary/90 hover:text-white py-2 px-4  rounded-lg transition-colors"
                    onClick={handleClaimPayment}
                  >
                    Release Payment to Buyer
                  </button>
                </div>
              )}
            </ShadowBox>
          </ShadowBox>
        </ShadowBox>
      </div>
      {markingDisputed && <AppLoading />}

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
          <div className="relative">
            <Image
              src={selectedImage || '/rampz/wait.png'}
              alt="ETH"
              width={500} // Adjust width for full screen
              height={500} // Adjust height for full screen
              className="object-cover rounded-lg"
            />
            <button
              className="absolute top-2 right-2 text-white text-2xl"
              onClick={() => setIsModalOpen(false)} // Close modal
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SaleDetail;
