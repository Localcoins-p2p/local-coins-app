'use client';

import { useContext, useState } from 'react';
import Dropdown from '../Elements/Dropdown';
import ShadowBox from '../Elements/ShadowBox';
import { LoaderCircle, PlusCircle } from 'lucide-react';
import fdtojson from '@/utils/fdtojson';
import { deposit } from '@/utils/base-calls';
import { gql, useMutation, useQuery } from 'urql';
import { useRouter } from 'next/navigation';
import { AppContext } from '@/utils/context';
import Link from 'next/link';

export const CREATE_TRANSACTION = gql`
  mutation CreateTransaction(
    $blockchain: String!
    $amount: Float!
    $currency: String!
    $tx: String!
  ) {
    createTransaction(
      blockchain: $blockchain
      amount: $amount
      currency: $currency
      tx: $tx
    ) {
      id
    }
  }
`;

export const PAYMENT_METHOD = gql`
  query Query {
    paymentMethods {
      accountName
      accountNumber
      id
      name
    }
  }
`;

const OffRamp = ({
  setNewOffRampState,
}: {
  setNewOffRampState: (value: boolean) => void;
}) => {
  const router = useRouter();

  const {
    context: { user },
  } = useContext(AppContext);

  const paymentMethods = user?.paymentMethods;

  console.log(user, 'userAccount');
 

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [{ fetching: fetchingPaymentMethods, data: viewPaymentMethods }] =
    useQuery({
      query: PAYMENT_METHOD,
    });
  const [{ fetching: creatingTransaction }, createTransaction] =
    useMutation(CREATE_TRANSACTION);
  const [selectedPaymentMehodOffRamp, setSelectedPaymentMehodOffRamp] =
    useState('eth');
  const [offRamp, setOffRamp] = useState({
    amount: 0.0,
    currency: 'php',
    userName: '',
    number: '',
  });

  const paymentMethod = [
    { value: 'ETH', label: 'ETH', image: '/rampz/eth.png' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { amount } = fdtojson(new FormData(e.target as HTMLFormElement));
    if (parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    const { tx } = await deposit(amount);
    createTransaction({
      blockchain: 'base',
      amount: parseFloat(amount),
      currency: 'eth',
      tx: tx.hash,
    });
  };

  return (
    <>
      <div className="flex items-center justify-center min-h-screen">
        <form onSubmit={handleSubmit}>
          <ShadowBox className="w-[444px] bg-secondary bg-opacity-70 p-4 ">
            <ShadowBox className="bg-[#D2E1D9] flex flex-col gap-4 p-4">
              <div className="flex items-center justify-between gap-4 ">
                <h3 className="text-primary text-custom-font-16 whitespace-nowrap">
                  {' '}
                  Off ramp
                </h3>
                {/* <button
                  type="button"
                  onClick={() => {
                    router.push('/payment-method');
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <PlusCircle size={20} />
                  Add New Method
                </button> */}
              </div>
              <ShadowBox className="flex flex-col gap-4 p-4 bg-secondary text-cool-grey">
              <ShadowBox className="bg-green-cyan rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <p className="text-cool-grey text-sm">Off ramp amount</p>
                      <input
                        type="number"
                        name="amount"
                        value={offRamp.amount}
                        onChange={(e) =>
                          setOffRamp({
                            ...offRamp,
                            amount: Number(e.target.value),
                          })
                        }
                        className="bg-transparent text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <Dropdown
                        options={paymentMethod}
                        value={selectedPaymentMethod}
                        onChange={setSelectedPaymentMethod}
                        className="bg-secondary "
                      />
                    </div>
                  </div>
                </ShadowBox>

                <div className="flex gap-1 items-center">
                  <p className=" ">You can receive fiat in your</p>
                  <p>({' '}
                    {paymentMethods?.map((paymentMethod: any) =>
                      paymentMethod.name
                    ).join(", ")} 
                  {' '})</p>
                </div>
                <div>
                  You can manage your payment methods{' '}
                  <Link href="/payment-methods" className='underline text-blue-500 cursor-pointer'>here</Link>
                </div>
            
                {/* <ShadowBox className="rounded-lg">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-cool-grey whitespace-nowrap">
                      Payment method
                    </p>

                    <div>
                      {fetchingPaymentMethods ? (
                        <LoaderCircle className=" animate-spin text-white w-8 h-8" />
                      ) : viewPaymentMethods?.paymentMethods ? (
                        <Dropdown
                          options={viewPaymentMethods?.paymentMethods?.map(
                            (paymentMethod: any) => ({
                              value: paymentMethod.id,
                              label: paymentMethod.name,
                            })
                          )}
                          value={selectedPaymentMehodOffRamp}
                          onChange={setSelectedPaymentMehodOffRamp}
                          className="bg-secondary border min-w-[140px]"
                        />
                      ) : (
                        <p className="text-cool-grey  text-right text-sm">
                          No payment method available
                        </p>
                      )}
                    </div>
                  </div>
                </ShadowBox>
                
                <ShadowBox className="flex items-center justify-between bg-green-cyan rounded-lg">
                  <h3 className="font-normal text-sm leading-[100%] text-cool-grey">
                    Telegram Username
                  </h3>
                  <input
                    type="text"
                    placeholder="Enter your Username"
                    value={offRamp.userName}
                    onChange={(e) =>
                      setOffRamp({ ...offRamp, userName: e.target.value })
                    }
                    className="font-normal text-sm leading-[100%] rounded-md bg-secondary px-3 py-2 text-white placeholder:text-white focus:outline-none"
                  />
                </ShadowBox>
                
                <ShadowBox className="flex items-center justify-between bg-green-cyan rounded-lg">
                  <h3 className="font-normal text-sm leading-[100%] text-cool-grey">
                    GCASH Number
                  </h3>
                  <input
                    type="text"
                    placeholder="Enter your number"
                    value={offRamp.number}
                    onChange={(e) =>
                      setOffRamp({ ...offRamp, number: e.target.value })
                    }
                    className="font-normal text-sm leading-[100%] rounded-md bg-secondary px-3 py-2 text-white placeholder:text-white focus:outline-none"
                  />
                </ShadowBox> */}
              </ShadowBox>
              <button className="bg-primary hover:bg-secondary hover:text-white px-4 py-2 rounded-lg text-custom-font-16 w-full transition-colors duration-200">
                Off ramp
              </button>
            </ShadowBox>
          </ShadowBox>
        </form>
      </div>
    </>
  );
};

export default OffRamp;
