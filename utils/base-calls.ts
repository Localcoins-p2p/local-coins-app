import { ethers } from 'ethers';
import { contractAddress, escrowABI } from './base';
import Web3Modal from 'web3modal';
import web3 from 'web3';

export const getConnection = async () => {
  const web3Modal = new Web3Modal();
  const connection = await web3Modal.connect();
  const provider = new ethers.providers.Web3Provider(connection);
  const signer = provider.getSigner();
  const accounts = await provider.listAccounts();
  return { signer, provider, connection, web3Modal, accounts };
};

export const fetchAllEscrows = async () => {
  try {
    const { signer } = await getConnection();
    const escrowFactoryContract = new ethers.Contract(
      contractAddress,
      {} as any,
      signer
    );

    const nextEscrowId = await escrowFactoryContract.nextEscrowId();
    const fetchedEscrows = [];

    for (let i = 0; i < nextEscrowId; i++) {
      const escrowAddress = await escrowFactoryContract.escrows(i);
      fetchedEscrows.push({ id: i, address: escrowAddress });
    }
    return fetchedEscrows;
  } catch (error) {
    console.log('>>', error);
    return { error };
  }
};

export const createEscrowLC = async (amount: string) => {
  if (!amount || Number(amount) <= 0) {
    return { err: 'Please enter a valid amount' };
  }

  try {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const escrowFactoryContract = new ethers.Contract(
      contractAddress,
      {} as any,
      signer
    );

    const tx = await escrowFactoryContract.createEscrow({
      value: ethers.utils.parseEther(amount),
    });
    const receipt = await tx.wait();
    console.log('Receipt', receipt);

    const event = receipt.events.find(
      (event: any) => event.event === 'EscrowCreated'
    );
    console.log('Event', event);
    const createdEscrowId = event.args.escrowId.toNumber();

    return { onChainSaleId: createdEscrowId, txHash: '' };
  } catch (err) {
    console.log('ERROR', err);
    return { err };
  }
};

export const addBuyer = async (escrowId: number) => {
  const { signer, accounts } = await getConnection();
  const buyerAddress = accounts[0];
  if (!buyerAddress) {
    return { error: 'Please enter a valid buyer address' };
  }

  try {
    const escrows: any = await fetchAllEscrows();
    if (escrows.error) {
      return escrows;
    }

    const escrowAddress = await escrows?.find((e: any) => e.id === escrowId)
      ?.address;

    const escrowContract = new ethers.Contract(
      escrowAddress,
      escrowABI,
      signer
    );
    const tx = await escrowContract.addBuyer(buyerAddress);
    const receipt = await tx.wait();
    return receipt;
  } catch (err) {
    console.error(err);
    return { error: 'Failed to add buyer' };
  }
};

export const markPaid = async (escrowId: string) => {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const escrows: any = await fetchAllEscrows();

    if (escrows.error) {
      return escrows;
    }

    const escrowAddress = escrows?.find(
      (escrow: { id: string }) => escrow.id === escrowId
    )?.address;

    if (!escrowAddress) {
      return { error: 'Invalid escrow ID' };
      return;
    }

    const escrowContract = new ethers.Contract(
      escrowAddress,
      escrowABI,
      signer
    );
    const tx = await escrowContract.markPaid();
    await tx.wait();
  } catch (err) {
    console.error(err);
    return { error: 'Failed to mark payment as paid' };
  }
};

export const confirmPayment = async (escrowId: string) => {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const escrows: any = await fetchAllEscrows();

    if (escrows.error) {
      return escrows;
    }

    const escrowAddress = escrows?.find(
      (escrow: { id: string }) => escrow.id === escrowId
    )?.address;

    if (!escrowAddress) {
      return { error: 'Invalid escrow ID' };
      return;
    }

    const escrowContract = new ethers.Contract(
      escrowAddress,
      escrowABI,
      signer
    );
    const tx = await escrowContract.confirmPayment();
    const receipt = await tx.wait();
  } catch (err) {
    console.error(err);
    return { error: 'Failed to confirm payment' };
  }
};

export const raiseSellerDispute = async (escrowId: string) => {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const escrows: any = await fetchAllEscrows();
    if (escrows.error) {
      return escrows;
    }

    const escrowAddress = escrows?.find(
      (escrow: { id: string }) => escrow.id === escrowId
    )?.address;

    if (!escrowAddress) {
      return { error: 'Invalid escrow ID' };
      return;
    }

    const escrowContract = new ethers.Contract(
      escrowAddress,
      escrowABI,
      signer
    );
    const tx = await escrowContract.sellerDispute();
    const receipt = await tx.wait();
    return receipt;
  } catch (err) {
    console.log(err);
    return { error: 'Failed to confirm payment' };
  }
};

export const raiseBuyerDispute = async (escrowId: string) => {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const escrows: any = await fetchAllEscrows();
    if (escrows.error) {
      return escrows;
    }

    const escrowAddress = escrows?.find(
      (escrow: { id: string }) => escrow.id === escrowId
    )?.address;

    if (!escrowAddress) {
      return { error: 'Invalid escrow ID' };
      return;
    }

    const escrowContract = new ethers.Contract(
      escrowAddress,
      escrowABI,
      signer
    );
    const tx = await escrowContract.buyerDispute();
    const receipt = await tx.wait();
    return receipt;
  } catch (err) {
    console.log(err);
    return { error: 'Failed to confirm payment' };
  }
};

export const releasePaymentToSeller = async (escrowId: string) => {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const escrows: any = await fetchAllEscrows();
    if (escrows.error) {
      return escrows;
    }
    console.log('>>>', escrowId, escrows);
    const escrowAddress = escrows?.find(
      (escrow: { id: string }) => escrow.id === escrowId
    )?.address;

    if (!escrowAddress) {
      return { error: 'Invalid escrow ID' };
      return;
    }

    const escrowContract = new ethers.Contract(
      escrowAddress,
      escrowABI,
      signer
    );
    console.log('>>>', escrowContract);
    const tx = await escrowContract.releaseFundsToSeller();
    const receipt = await tx.wait();
    return receipt;
  } catch (err) {
    console.log(err);
    return { error: 'Failed to confirm payment' };
  }
};

export const releasePaymentToBuyer = async (escrowId: string) => {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const escrows: any = await fetchAllEscrows();
    if (escrows.error) {
      return escrows;
    }

    const escrowAddress = escrows?.find(
      (escrow: { id: string }) => escrow.id === escrowId
    )?.address;

    if (!escrowAddress) {
      return { error: 'Invalid escrow ID' };
      return;
    }

    const escrowContract = new ethers.Contract(
      escrowAddress,
      escrowABI,
      signer
    );
    const tx = await escrowContract.releaseFundsBuyer();
    const receipt = await tx.wait();
    return receipt;
  } catch (err) {
    console.log(err);
    return { error: 'Failed to confirm payment' };
  }
};

export const deposit = async (amount: string) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const escrowContract = new ethers.Contract(
    contractAddress,
    escrowABI,
    signer
  );
  const tx = await escrowContract.deposit({
    value: ethers.utils.parseEther(amount),
  });
  const receipt = await tx.wait();
  return {
    receipt,
    tx,
  };
};

export const createEscrow = async (seller: string, amount: string) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const escrowContract = new ethers.Contract(
    contractAddress,
    escrowABI,
    signer
  );
  const tx = await escrowContract.createEscrow(
    seller,
    parseInt('' + parseFloat(amount) * 1e18)
  );

  const receipt = await tx.wait();

  const event = receipt.events?.find((e: any) => e.event === 'EscrowCreated');
  let escrowId;
  if (event) {
    escrowId = event.args?.[0].toNumber();
    escrowId;
  } else {
    console.error('EscrowCreated event not found in receipt.');
  }

  return {
    receipt,
    tx,
    escrowId,
  };
};

export async function withdraw(amountInEth: string) {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, escrowABI, signer);

    const amountInWei = ethers.utils.parseEther(amountInEth);

    const tx = await contract.withdraw(amountInWei);
    await tx.wait();

    console.log(`Withdrawal of ${amountInEth} ETH successful!`);
  } catch (error) {
    console.error("Error withdrawing:", error);
  }
}

export async function getUserBalance(userAddress: string) {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(
    contractAddress,
    escrowABI,
    signer
  );
      const balance = await contract.userBalances(userAddress);
      return web3.utils.fromWei(balance, "ether");
  } catch (error) {
      console.error("Error fetching user balance:", error);
  }
}

export async function completeEscrow(escrowId: number) {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, escrowABI, signer);

    // Send transaction to complete the escrow
    const tx = await contract.completeEscrow(escrowId);
    await tx.wait(); // Wait for transaction confirmation

    console.log(`Escrow ID ${escrowId} completed successfully!`);
  } catch (error) {
    console.error("Error completing escrow:", error);
  }
}
