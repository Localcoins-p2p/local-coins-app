import { gql, useMutation } from 'urql';
import useSolana from '@/utils/useSolana';
import { getMasterAddress, SALE_SEED } from '@/utils/program';
import { BN } from '@project-serum/anchor';
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addBuyer as addEthBuyer } from '@/utils/base-calls';

interface IProps {
  saleId: string;
  onChainSaleId: number;
  sale: any;
}

export const addRemoveBuyerMutation = gql`
  mutation AddRemoveBuyer($id: String!, $command: String!) {
    addRemoveBuyer(id: $id, command: $command) {
      id
    }
  }
`;

function BuyButton({ saleId, onChainSaleId: _onChainSaleId, sale }: IProps) {
  const [{ fetching }, addBuyer] = useMutation(addRemoveBuyerMutation);
  const router = useRouter();
  const { connection, program, programId, publicKey, sendTransaction } =
    useSolana();
  const [loading, setLoading] = useState(false);

  const handleAddBuyer = async () => {
    try {
      setLoading(true);
      if (sale.currency === 'ETH') {
        await addEthBuyer(_onChainSaleId);
      } else {
        const masterPda = await getMasterAddress();
        const onChainSaleId = new BN(_onChainSaleId);
        const [salePda, saleBump] = await PublicKey.findProgramAddress(
          [Buffer.from(SALE_SEED), onChainSaleId.toArrayLike(Buffer, 'le', 4)],
          programId
        );
        const authority = publicKey;
        const transaction = new Transaction().add(
          (program as any).instruction.addBuyer(onChainSaleId, {
            accounts: {
              sale: salePda,
              master: masterPda,
              authority: authority as PublicKey,
              systemProgram: SystemProgram.programId,
            },
          })
        );
        const txHash = await sendTransaction(transaction, connection);
      }
      await addBuyer({ id: saleId, command: 'ADD' });
      router.push(`/my-order?sale=${saleId}`);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className="bg-[#3AA53E] text-white text-[16px] font-[600] px-4 py-2 rounded-[5px]"
      onClick={handleAddBuyer}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-[#3AA53E]"></div>
      ) : (
        'Buy'
      )}
    </button>
  );
}

export default BuyButton;
