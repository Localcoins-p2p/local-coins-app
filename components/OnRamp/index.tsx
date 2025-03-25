'use client';

import { useEffect, useState } from 'react';
import Dropdown from '../Elements/Dropdown';
import ShadowBox from '../Elements/ShadowBox';
import { ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { gql, useMutation } from 'urql';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { BLOCKCHAIN_BASE, CURRENCY_ETH } from '@/constants';
import { createEscrow } from '@/utils/base-calls';
import { CREATE_SALE } from '../Elements/FilterPanel';
import Payment from '../OnOffRamp/Payment';

export const RAMP_AMOUNT = gql`
  mutation Mutation($amount: Float!) {
    matchSeller(amount: $amount) {
      publicKey
    }
  }
`;

const OnRamp = () => {
  const router = useRouter();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('php');
  const [selectedPaymentMehodToSend, setSelectedPaymentMehodToSend] =
    useState('php');
  const [selectedPaymentMehodToRecieve, setSelectedPaymentMehodToRecieve] =
    useState('ETH');
  const [isChecked, setIsChecked] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [amountTo, setAmountTo] = useState({
    amountToSend: 0,
    amountToReceive: 0,
  });
  const [{ fetching: creatingSale }, createSale] = useMutation(CREATE_SALE);

  const getCryptoPrice = async (currency: string) => {
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${currency}&vs_currencies=php`
      );
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      return { php: data?.[currency]?.php };
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  };

  const [conversionRate, setConversionRate] = useState<number | null>(null); // ETH to PHP conversion rate
  const [lastUpdatedField, setLastUpdatedField] = useState<'send' | 'receive'>(
    'send'
  ); // Track which field was last updated

  // Fetch the ETH-to-PHP conversion rate when the component mounts
  useEffect(() => {
    const fetchConversionRate = async () => {
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=php'
        );
        if (!response.ok) {
          throw new Error('Failed to fetch conversion rate.');
        }
        const data = await response.json();
        const rate = data.ethereum.php; // ETH to PHP rate
        setConversionRate(rate);
      } catch (error) {
        console.error('Error fetching conversion rate:', error);
        toast.error('Failed to fetch conversion rate. Please try again.');
      }
    };

    fetchConversionRate();
  }, []);

  // Convert PHP to ETH or ETH to PHP based on the last updated field
  useEffect(() => {
    if (conversionRate !== null) {
      if (lastUpdatedField === 'send') {
        // Convert PHP to ETH
        const ethAmount = amountTo.amountToSend / conversionRate;
        setAmountTo((prev) => ({
          ...prev,
          amountToReceive: ethAmount,
        }));
      } else {
        // Convert ETH to PHP
        const phpAmount = amountTo.amountToReceive * conversionRate;
        setAmountTo((prev) => ({
          ...prev,
          amountToSend: phpAmount,
        }));
      }
    }
  }, [
    amountTo.amountToSend,
    amountTo.amountToReceive,
    conversionRate,
    lastUpdatedField,
  ]);

  const handleOnRamp = async () => {
    if (!isChecked) {
      toast.error('Please agree to the terms and conditions.');
      return;
    }

    try {
      const result = await mutateRampAmount({
        amount: amountTo.amountToReceive,
      });
      console.log('>>>', result);

      if (result.error) {
        toast.error('Error occurred while on-ramping.');
        return;
      } else {
      }

      if (result.data?.matchSeller?.publicKey) {
        const sellerKey = result.data?.matchSeller?.publicKey;
        await createEscrow(sellerKey, amountTo.amountToReceive + '');
        // security issue: take unit price from backend
        const prices = await getCryptoPrice('ethereum');
        const response = await createSale({
          amount: amountTo.amountToReceive,
          unitPrice: prices?.php,
          isFloating: false,
          profitPercentage: 0,
          screenshotMethods: [],
          onChainSaleId: 0,
          tx: '',
          blockchain: BLOCKCHAIN_BASE,
          currency: CURRENCY_ETH,
          sellerPublicKey: sellerKey,
        });
        router.push('/on-ramp/proof?saleId=' + response.data.createSale.id);
      }
    } catch (error) {
      console.log('ERROR', error);
      toast.error('Error occurred while on-ramping.');
    }
  };

  const [
    {
      fetching: fetchingRampAmount,
      error: errorRampAmount,
      data: dataRampAmount,
    },
    mutateRampAmount,
  ] = useMutation(RAMP_AMOUNT);

  const paymentMethod = [
    { value: 'GCASH', label: 'GCASH', icon: 'G' },
    { value: 'Maya', label: 'Maya', icon: 'M' },
    { value: 'Coins.ph', label: 'Coins.ph', icon: 'C' },
    { value: 'GoTyme Bank', label: 'GoTyme Bank', icon: 'GB' },
  ];
  const paymentMethodSend = [
    { value: 'PHP', label: 'PHP', image: '/rampz/php.png' },
  ];
  const paymentMethodRecieve = [
    { value: 'ETH', label: 'ETH', image: '/rampz/eth.png' },
  ];

  return (
    <>
      <div className="flex items-center justify-center min-h-screen">
        <ShadowBox className="w-[444px] bg-secondary bg-opacity-70 p-4 ">
          <ShadowBox className="bg-[#D2E1D9] p-4 ">
            <h3 className="text-primary text-custom-font-16 pb-4">On ramp</h3>
            <ShadowBox className="flex flex-col gap-4 bg-secondary p-4 ">
              <ShadowBox className="rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="">
                    <p className="text-cool-grey">Payment method</p>
                  </div>
                  <div>
                    <Dropdown
                      options={paymentMethod}
                      value={selectedPaymentMethod}
                      onChange={setSelectedPaymentMethod}
                      className="bg-secondary border min-w-[140px]"
                    />
                  </div>
                </div>
              </ShadowBox>
              <ShadowBox className="bg-green-cyan rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <p className="text-cool-grey text-sm">You send</p>
                    <input
                      type="number"
                      value={amountTo.amountToSend}
                      onChange={(e) => {
                        const newAmountToSend = Number(e.target.value);
                        setAmountTo((prev) => ({
                          ...prev,
                          amountToSend: newAmountToSend,
                        }));
                        setLastUpdatedField('send');
                      }}
                      className="bg-transparent text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <Dropdown
                      options={paymentMethodSend}
                      value={selectedPaymentMehodToSend}
                      onChange={setSelectedPaymentMehodToSend}
                      className="bg-secondary"
                    />
                  </div>
                </div>
              </ShadowBox>
              <ShadowBox className="bg-green-cyan rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <p className="text-cool-grey text-sm">You receive</p>
                    <input
                      type="number"
                      value={amountTo.amountToReceive.toFixed(7)}
                      onChange={(e) => {
                        const newAmountToReceive = Number(e.target.value);
                        setAmountTo((prev) => ({
                          ...prev,
                          amountToReceive: newAmountToReceive,
                        }));
                        setLastUpdatedField('receive');
                      }}
                      className="bg-transparent text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <Dropdown
                      options={paymentMethodRecieve}
                      value={selectedPaymentMehodToRecieve}
                      onChange={setSelectedPaymentMehodToRecieve}
                      className="bg-secondary"
                    />
                  </div>
                </div>
              </ShadowBox>
              <div className="overflow-hidden">
                {/* Header - Always visible */}
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-cool-grey font-normal text-xs">
                      {amountTo?.amountToSend} {selectedPaymentMehodToSend}
                    </span>
                    <ArrowRight className="w-3 h-3 text-white" />
                    <span className="text-cool-grey font-normal text-xs">
                      {amountTo?.amountToReceive}{' '}
                      {selectedPaymentMehodToRecieve}
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>

                {/* Collapsible content */}
                {isExpanded && (
                  <div className="text-cool-grey font-normal text-xs border-t border-cool-grey pt-2">
                    <div className="flex justify-between ">
                      <span className="">ETH Price</span>
                      <span>{amountTo.amountToReceive}</span>
                    </div>
                    <div className="flex justify-between ">
                      <span className="">Platform Fees</span>
                      <span>0%</span>
                    </div>
                  </div>
                )}
              </div>
            </ShadowBox>
            <div className="flex items-center gap-2 py-2">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
              />
              <p>
                I agree with{' '}
                <span className="underline">term & conditions</span>
              </p>
            </div>
            <button
              onClick={handleOnRamp} // onClick handler add karein
              className="bg-primary hover:bg-secondary hover:text-white disabled:bg-gray-500 disabled:cursor-not-allowed disabled:hover:text-secondary px-4 py-2 rounded-lg text-custom-font-16 w-full transition-colors duration-200"
              disabled={
                fetchingRampAmount ||
                amountTo.amountToReceive <= 0 ||
                !isChecked
              } // Disable button during fetching
            >
              {fetchingRampAmount ? 'Processing...' : 'On ramp'}
            </button>
          </ShadowBox>
        </ShadowBox>
      </div>
    </>
  );
};

export default OnRamp;
