'use client';

import { useState } from 'react';
import Dropdown from '../Elements/Dropdown';
import ShadowBox from '../Elements/ShadowBox';
import { ArrowRight, ChevronDown, ChevronUp, LoaderCircle, MoveLeft } from 'lucide-react';
import fdtojson from '@/utils/fdtojson';
import { deposit } from '@/utils/base-calls';
import { gql, useMutation, useQuery } from 'urql';

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

const NewOffRamp = ({
  setNewOffRampState,
}: {
  setNewOffRampState: (value: boolean) => void;
}) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('php');
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
              <div className="flex items-center gap-4 ">
                {/* <MoveLeft
                  className="w-6 h-6 cursor-pointer"
                  onClick={() => setNewOffRampState(false)}
                /> */}
                <h3 className="text-primary text-custom-font-16"> Off ramp</h3>
              </div>
              <ShadowBox className="flex flex-col gap-4 p-4 bg-secondary">
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
                <ShadowBox className="rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="">
                      <p className="text-cool-grey">Payment method</p>
                    </div>
                    <div>
                      {fetchingPaymentMethods ? (
                        <LoaderCircle className=" animate-spin text-white w-8 h-8" />
                      ) : viewPaymentMethods?.paymentMethods ? (
                        <Dropdown 
                          options={viewPaymentMethods?.paymentMethods?.map(
                            (paymentMethod: any) => ({
                              value: paymentMethod.id,
                              label: paymentMethod.accountName,
                            })
                          )}
                          value={selectedPaymentMehodOffRamp}
                          onChange={setSelectedPaymentMehodOffRamp}
                          className="bg-secondary border min-w-[140px]"
                        />
                      ) : (
                        <div>No payment method available</div>
                      )}
                    </div>
                  </div>
                </ShadowBox>
                {/* Telegram Username */}
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
                {/* GCASH Number */}
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
                </ShadowBox>
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

export default NewOffRamp;
