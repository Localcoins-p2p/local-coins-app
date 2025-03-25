import React, { useContext, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { TiArrowSortedDown } from 'react-icons/ti';
import customStyles from '../../components/Elements/reactSelectStyles';
import { gql, useMutation } from 'urql';
import { getMasterAddress, SALE_SEED } from '@/utils/program';
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { BN } from '@project-serum/anchor';
import useSolana from '@/utils/useSolana';
import Loading from '../Elements/Loading';
import Select from 'react-select';
import { getFromCurrency, getToCurrencyv2 } from '@/utils/getCurrency';
import { addRemoveBuyerMutation } from '../Elements/BuyButton';
import {
  confirmPayment,
  markPaid,
  raiseBuyerDispute,
  raiseSellerDispute,
  releasePaymentToSeller,
} from '@/utils/base-calls';
import AppLoading from '../Elements/AppLoading';
import { AppContext } from '@/utils/context';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

interface OrderComponentProps {
  sale: any;
  showConfirmPaymentReceivedButton: boolean;
  showConfirmPaymentSentButton: boolean;
  showClaimPaymentButton: boolean;
  loading: boolean;
  image: string;
  isSeller?: boolean;
  isBuyer?: boolean;
  showBuyerDisputeButton: boolean;
  showSellerDisputeButton: boolean;
  hideConfirmButtonShowDisputes: boolean;
  referenceId: any;
}

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

const OrderComponent: React.FC<OrderComponentProps> = ({
  sale,
  showConfirmPaymentReceivedButton,
  showConfirmPaymentSentButton,
  showClaimPaymentButton,
  loading,
  image,
  isSeller,
  isBuyer,
  showSellerDisputeButton,
  showBuyerDisputeButton,
  hideConfirmButtonShowDisputes,
  referenceId,
}) => {
  const [{}, addScreenshotMutation] = useMutation(ADD_SCREENSHOT);
  const [{ fetching }, removeBuyer] = useMutation(addRemoveBuyerMutation);
  const [disputeLoading, setDisputeLoading] = useState(false);
  const [{ fetching: _markingDisputed }, markDisputedMutation] =
    useMutation(MARK_DISPUTED);
  const [{ fetching: canceling }, cancelSale] = useMutation(CANCEL_SALE);
  const [{}, markPaidMutation] = useMutation(MARK_PAID);
  const [selectedPaymentMethodIndex, setSelectedPaymentMethodIndex] =
    useState(0);
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [{}, markFinished] = useMutation(MARK_FINISHED);
  const { connection, program, programId, publicKey, sendTransaction } =
    useSolana();
  const [referenceNumber, setReferenceNumber] = useState('');
  const [{}, checkIsReferenceIdCorrect] = useMutation(IS_REFERENCE_ID_CORRECT);

  const paymentMethods = sale?.seller?.paymentMethods || [];
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

  const takeReferenceNumber = async (image: string) => {
    confirmAlert({
      title: 'Enter the reference number',
      message:
        'Please enter the reference number. Make sure you are transferring the funds to the correct account and same bank',
      buttons: [
        {
          label: 'Submit',
          onClick: async () => {
            if (referenceNumber === '') {
              toast.error('Please enter a valid reference number');
              return;
            }
            await handleAddScreenshot(image, '');
          },
        },
      ],
      customUI: ({ onClose }) => {
        return (
          <div className="rounded-xl p-4 p-1 bg-black text-white w-[75vw] md:w-[400px]">
            <h1 className="font-bold text-xl">Enter the reference number</h1>
            <p className="text-sm opacity-90">
              Please enter the reference number. Make sure you are transferring
              the funds to the correct account and same bank
            </p>

            <input
              type="text"
              className="w-full p-2 mt-2 rounded-md"
              placeholder="Reference Number"
              onChange={(e) => setReferenceNumber(e.target.value)}
            />
            <div className="flex justify-between mt-2">
              <button className="text-white" onClick={onClose}>
                Cancel
              </button>
              <button
                onClick={async () => {
                  await handleAddScreenshot(image, '');
                  onClose();
                }}
                className="float-right p-2 font-medium rounded-md bg-white text-black"
              >
                Add Screenshot
              </button>
            </div>
          </div>
        );
      },
    });
  };

  const confirmPaymentReceived = async () => {
    confirmAlert({
      title: 'Confirm Payment Received',
      message:
        'Are you sure you want to confirm payment received? If received, kindly enter the reference id of the payment. We ask for payments to ensure that the seller receives the payment and avoid any mistake.',
      customUI: ({ onClose }) => {
        return (
          <div className="rounded-xl p-4 p-1 bg-black text-white w-[75vw] md:w-[400px]">
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
                className="float-right p-2 font-medium rounded-md bg-white text-black"
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
      if (toCurrency.name === 'ETH') {
        await markPaid(sale.onChainSaleId);
      }
      if (imageUrl.indexOf('vercel') === -1) {
        await addScreenshotMutation({
          saleId: sale.id,
          imageUrl,
          referenceId: referenceNumber,
          method: '66fb0f0fc2a69f59952e04ed',
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
      if (toCurrency.name === 'ETH') {
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

  return (
    <>
      <div className="p-6 text-white max-w-[612px] w-full">
        <div className="border-l-2 border-white relative pl-4">
          <div>
            <div className="flex items-center mb-4">
              <div className="w-6 h-6 absolute left-[-13px] top-0 rounded-full bg-white text-black font-bold flex items-center justify-center">
                1
              </div>
              <h2 className="ml-4 text-[23px] font-semibold">Order Created</h2>
            </div>
            <div className="border border-[#4D4D4D] p-4 rounded-[5px]">
              <div className="flex justify-between">
                <span className="text-[#A6A6A6] text-[18px]">Fiat Amount</span>
                <span className="text-[#0ECB81] text-[18px] font-bold">
                  {(sale?.amount * sale?.unitPrice) / toCurrency?.x}{' '}
                  {getFromCurrency().name}
                </span>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[#A6A6A6] text-[18px] font-[500]">
                  Price
                </span>
                <span className="text-[#FFFFFF] text-[18px] font-[600]">
                  {sale?.unitPrice} {getFromCurrency().name}
                </span>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[#A6A6A6] text-[18px] font-[500]">
                  Receive Quantity
                </span>
                <span className="text-[#FFFFFF] text-[18px] font-[600]">
                  {sale?.amount / toCurrency?.x} {toCurrency?.name}
                </span>
              </div>
            </div>
          </div>

          <div>
            {isSeller && (
              <>
                <div className="flex items-center my-4">
                  <div className="w-6 h-6 absolute left-[-13px] rounded-full bg-white text-black font-bold flex items-center justify-center">
                    2
                  </div>
                  <h2 className="ml-4 text-xl font-semibold">
                    {(sale?.amount * sale?.unitPrice) / toCurrency?.x} PHP
                    transfer to{' '}
                    {paymentMethods[selectedPaymentMethodIndex]?.name}
                  </h2>
                </div>
                <p className="text-[#FFFFFF] text-[18px] ml-4 mb-4">
                  Funds will be transfered to one of the payment methods below.
                </p>
              </>
            )}
            {isBuyer && (
              <>
                <div className="flex items-center my-4">
                  <div className="w-6 h-6 absolute left-[-13px] rounded-full bg-white text-black font-bold flex items-center justify-center">
                    2
                  </div>
                  <h2 className="ml-4 text-xl font-semibold">
                    Open {paymentMethods[selectedPaymentMethodIndex]?.name} to
                    transfer {(sale?.amount * sale?.unitPrice) / toCurrency?.x}{' '}
                    PHP
                  </h2>
                </div>
                <p className="text-[#FFFFFF] text-[18px] ml-4 mb-4">
                  Transfer the funds to the seller&apos;s account provided
                  below.
                </p>
              </>
            )}
            <div className="border border-[#4D4D4D] p-4 rounded-[5px]">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-1">
                  <div className="h-2  w-2 rounded-full bg-[#00B2FF]"></div>
                  <span className="text-[#FFFFFF] font-bold">
                    {paymentMethods[selectedPaymentMethodIndex]?.name}
                  </span>
                </div>

                {isDropdownVisible ? (
                  <div className="flex items-center border justify-center border-[#4D4D4D] rounded-[5px] px-1 ">
                    <Select
                      className="w-[100px] border-l border-[#393939]"
                      options={options}
                      styles={customStyles}
                      isSearchable={false}
                      components={{
                        DropdownIndicator: () => (
                          <TiArrowSortedDown className="text-white" />
                        ),
                      }}
                      onChange={handleChangePaymentMethod}
                    />
                  </div>
                ) : (
                  <button
                    className="text-yellow-400"
                    onClick={handleChangeClick}
                  >
                    Change
                  </button>
                )}
              </div>
              <div className="mb-2 flex justify-between">
                <span className="text-[#A6A6A6] text-[18px] font-[500]">
                  Recipient
                </span>
                <p className="text-[#FFFFFF] text-[18px] font-[600]">
                  {paymentMethods[selectedPaymentMethodIndex]?.accountName}
                </p>
              </div>
              <div className="mb-2 flex justify-between">
                <span className="text-[#A6A6A6] text-[18px] font-[500]">
                  Mobile Number
                </span>
                <p className="text-[#FFFFFF] text-[18px] font-[600]">
                  {paymentMethods[selectedPaymentMethodIndex]?.accountNumber}
                </p>
              </div>
              <div>
                <span className="text-[#A6A6A6] text-[18px] font-[500]">
                  QR Code
                </span>
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center my-4">
              <div className="w-6 absolute h-6 left-[-13px] bottom-0 rounded-full bg-white text-black font-bold flex items-center justify-center">
                3
              </div>
              <h2 className="ml-4 text-xl font-semibold">
                {isSeller ? 'Check your accounts' : 'Notify Seller'}
              </h2>
            </div>
          </div>
        </div>
        <div className="pl-4">
          <p className="text-[#FFFFFF] text-[18px] font-[400] mb-4 ml-4">
            {isSeller
              ? 'Please check your account to confirm the payment. Once the buyer has uploaded the screenshot, you will see Confirm Payment button. Click on that button and enter reference id.'
              : 'After payment, remember to click the &apos;Transferred, Notify Seller&apos; button to facilitate the crypto release by the seller.'}
            {
              isSeller
              ? <button>Release Payment</button> : null
            }
          </p>
          {showConfirmPaymentSentButton && (
            <div className="flex justify-between ml-4">
              <button
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 px-4 pr-10 flex gap-2 rounded-lg"
                onClick={() => {
                  takeReferenceNumber(image);
                }}
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
              <div className="flex justify-between ml-4 gap-4">
                {showBuyerDisputeButton && (
                  <button
                    className="text-[#F3AA05] font-semibold "
                    onClick={handleBuyerDispute}
                  >
                    Dispute
                  </button>
                )}
                <button
                  className="text-[#F3AA05] font-semibold "
                  onClick={handleBuyerCancel}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          {showConfirmPaymentReceivedButton && (
            <div className="flex justify-between ml-4">
              {hideConfirmButtonShowDisputes ? (
                <p>
                  Waiting for buyer to send you payment screenshot. Once you
                  receive the payment, you will see the confirm button here.
                </p>
              ) : (
                <button
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 px-4 rounded-lg flex gap-2"
                  onClick={confirmPaymentReceived}
                >
                  <div>
                    {loading ? (
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
                    className="text-[#F3AA05] font-semibold "
                    onClick={handleSellerDispute}
                  >
                    Dispute
                  </button>
                )}
                <button
                  className="text-[#F3AA05] font-semibold "
                  onClick={handleSellerCancel}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          {showClaimPaymentButton && (
            <div className="flex justify-between ml-4">
              <button
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 px-4 flex gap-2 rounded-lg"
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
          <div className="flex gap-4 ml-8 mt-8">
            <button
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 px-4 flex gap-2 rounded-lg"
              onClick={handleReleaseFundsToSeller}
            >
              Release Payment to Seller
            </button>
            <button
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 px-4 flex gap-2 rounded-lg"
              onClick={handleClaimPayment}
            >
              Release Payment to Buyer
            </button>
          </div>
        )}
      </div>
      {markingDisputed && <AppLoading />}
    </>
  );
};

export default OrderComponent;
