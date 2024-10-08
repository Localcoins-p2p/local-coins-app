'use client';
import React, { useMemo, useState } from 'react';
import { TiArrowSortedDown } from 'react-icons/ti';
import { CiGlobe } from 'react-icons/ci';
import Image from 'next/image';
import Select from 'react-select';
import ModalComponent from './ModalComponent';
import StepProgress from './StepProgress';
import SellToSetPrice from './SellToSetPrice';
import SellToSetAmountPayMeth from './SellToSetAmountPayMeth';
import RemarksAndAutoRes from './RemarksAndAutoRes';
import { createSale } from '@/utils/escrowClient';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { BN, web3 } from '@project-serum/anchor';
import { getMasterAddress, getProgram, SALE_SEED } from '@/utils/program';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { gql, useMutation } from 'urql';
import { useRouter } from 'next/navigation';
import customStyles from '../../components/Elements/reactSelectStyles';
import { getToCurrency, getFromCurrency } from '@/utils/getCurrency';
import toast from 'react-hot-toast';

const paymentOptions = [{ value: 'All Payments', label: 'All Payments' }];
const regionOptions = [{ value: 'All Regions', label: 'All Regions' }];

const currencyOptions = [
  {
    value: 'USD',
    label: (
      <span>
        <span className="text-[#F3AA05] mr-2">$</span>PHP
      </span>
    ),
  },
];

export const CREATE_SALE = gql`
  mutation Mutation(
    $amount: Float
    $unitPrice: Float
    $screenshotMethods: [String]
    $tx: String
    $onChainSaleId: Int
  ) {
    createSale(
      amount: $amount
      unitPrice: $unitPrice
      screenshotMethods: $screenshotMethods
      tx: $tx
      onChainSaleId: $onChainSaleId
    ) {
      amount
      buyer {
        id
        name
        publicKey
      }
      createdAt
      id
      screenshotMehtods
      tx
      unitPrice
    }
  }
`;

const FilterPanel = () => {
  const { connection } = useConnection();
  const [selectedPayment, setSelectedPayment] = useState<any>(
    paymentOptions[0]
  );
  const [{ fetching: creatingSale }, createSaleMutation] =
    useMutation(CREATE_SALE);
  const [data, setData] = useState<any>({});
  const [selectedRegion, setSelectedRegion] = useState<any>(regionOptions[0]);
  const [selectedCurrency, setSelectedCurrency] = useState<any>(
    currencyOptions[0]
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const { publicKey, sendTransaction, connected } = useWallet();

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const program = useMemo(() => {
    if (connection) {
      return getProgram(connection, { publicKey, sendTransaction });
    }
    return null;
  }, [connection, publicKey, sendTransaction]);
  const router = useRouter();

  const handleCreateSale = async ({ amount }: { amount: number }) => {
    const programId = new web3.PublicKey(
      process.env.NEXT_PUBLIC_PROGRAM_ID as string
    );
    if (!program) {
      return;
    }
    const masterPda = await getMasterAddress();
    const onChainSaleId =
      (await program.account.master.fetch(masterPda)).lastId + 1;
    const saleId = new BN(
      (await program.account.master.fetch(masterPda)).lastId + 1
    );

    const [salePda, saleBump] = await PublicKey.findProgramAddress(
      [Buffer.from(SALE_SEED), saleId.toArrayLike(Buffer, 'le', 4)],
      programId
    );
    const authority = publicKey;

    const transaction = new web3.Transaction().add(
      program.instruction.createSale(new BN(amount), {
        accounts: {
          sale: salePda,
          master: masterPda,
          authority: authority as PublicKey,
          systemProgram: SystemProgram.programId,
        },
      })
    );
    const txHash = await sendTransaction(transaction, connection);
    return { txHash, onChainSaleId };
  };

  const handleNext = async () => {
    let response: any = {};
    if (currentStep == 3) {
      setData({ ...data, loading: true });
      try {
        response =
          (await handleCreateSale({ amount: data.amount * 1000000000 })) || {};
      } catch (err) {
      } finally {
        setData({ ...data, loading: false });
      }
      setData({ ...data, loading: true });
      createSaleMutation({
        amount: data.amount * getToCurrency().x,
        tx: response.txHash,
        onChainSaleId: response.onChainSaleId,
        unitPrice: data.unitPrice,
        screenshotMethods: [],
      }).then((data) => {
        router.push(`/my-order?sale=${data?.data?.createSale?.id}`);
        setData({ ...data, loading: false });
        setIsModalOpen(false);
        toast.success('Sale created');
      });
      return;
    }
    setCurrentStep(currentStep + 1);
  };
  const handleBack = async () => {
    setCurrentStep(currentStep - 1);
  };

  return (
    <div className=" text-white flex justify-center sm:justify-between items-center overflow-x-auto">
      <div className="grid-cols-3 gap-2 hidden md:grid">
        <div className="flex items-center border justify-center border-[#4D4D4D] rounded-[5px] px-4 py-1">
          <input
            type="text"
            className="text-[#DCDCDC] text-[16px] placeholder-[#DCDCDC] font-[500] bg-transparent border-none outline-none"
            placeholder="Transaction amount"
          />
          <Select
            menuPosition="fixed"
            className="w-[100px] border-l border-[#393939]"
            value={selectedCurrency}
            onChange={setSelectedCurrency}
            options={currencyOptions}
            styles={customStyles}
            isSearchable={false}
            components={{
              DropdownIndicator: () => (
                <TiArrowSortedDown className="text-white" />
              ),
            }}
          />
        </div>

        <div className=" hidden md:block border  border-[#4D4D4D] rounded-[5px] px-2 py-1 w-[350px] ">
          <Select
            menuPosition="fixed"
            value={selectedPayment}
            onChange={setSelectedPayment}
            options={paymentOptions}
            components={{
              DropdownIndicator: () => (
                <TiArrowSortedDown className="text-white" />
              ),
            }}
            styles={customStyles}
            isSearchable={false}
          />
        </div>

        <div className=" border hidden md:flex border-[#4D4D4D] rounded-[5px] px-2 py-1 w-[350px] items-center ">
          <CiGlobe className="h-[24px] w-[26px] font-bold text-[#fff]" />
          <Select
            menuPosition="fixed"
            className="w-full"
            value={selectedRegion}
            onChange={setSelectedRegion}
            options={regionOptions}
            components={{
              DropdownIndicator: () => (
                <TiArrowSortedDown className="text-white" />
              ),
            }}
            styles={customStyles}
            isSearchable={false}
          />
        </div>
      </div>
      <div>
        <button
          onClick={handleOpenModal}
          className="flex items-center justify-center border border-[#4D4D4D] rounded-md px-3 py-3.5 hover:bg-gray-700"
        >
          Sell {getToCurrency().name}
        </button>
      </div>

      <ModalComponent
        title="Filter Options"
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        header={<div>Modal Header</div>}
      >
        <div className="max-h-[90vh] overflow-auto no-scrollbar">
          <StepProgress currentStep={currentStep} />

          {currentStep === 1 && (
            <SellToSetPrice onNext={handleNext} data={data} setData={setData} />
          )}
          {currentStep === 2 && (
            <SellToSetAmountPayMeth
              onNext={handleNext}
              onBack={handleBack}
              data={data}
              setData={setData}
            />
          )}
          {currentStep === 3 && (
            <RemarksAndAutoRes
              onNext={handleNext}
              data={data}
              onBack={handleBack}
              setData={setData}
            />
          )}
        </div>
      </ModalComponent>
    </div>
  );
};

export default FilterPanel;
