'use client';

import { useState, useEffect } from 'react';
import {
  CreditCard,
  User,
  Ban as Bank,
  PlusCircle,
  Pencil,
  Trash2,
  X,
  LoaderCircle,
  MoveLeft,
} from 'lucide-react';
import ShadowBox from '../Elements/ShadowBox';
import { gql, useMutation, useQuery } from 'urql';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export const ADD_PAYMENT_METHOD = gql`
  mutation Mutation(
    $name: String!
    $accountNumber: String!
    $accountName: String!
  ) {
    addPaymentMethod(
      name: $name
      accountNumber: $accountNumber
      accountName: $accountName
    ) {
      id
      name
    }
  }
`;

export const UPDATE_PAYMENT_METHOD = gql`
  mutation UpdatePaymentMethod(
    $updatePaymentMethodId: String!
    $name: String
    $accountNumber: String
    $accountName: String
  ) {
    updatePaymentMethod(
      id: $updatePaymentMethodId
      name: $name
      accountNumber: $accountNumber
      accountName: $accountName
    ) {
      id
      name
    }
  }
`;
export const DELETE_PAYMENT_METHOD = gql`
  mutation Mutation($deletePaymentMethodId: String!) {
    deletePaymentMethod(id: $deletePaymentMethodId) {
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

function AddUpdatePaymentMethod() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<{
    id: string;
    name: string;
    accountNumber: string;
    accountName: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    accountNumber: '',
    accountName: '',
  });

  const [{ fetching: fetchingPaymentMethods, data: viewPaymentMethods }] =
    useQuery({
      query: PAYMENT_METHOD,
    });

  console.log(viewPaymentMethods, 'viewPaymentMethods');

  const [{ fetching: fetchingAddPaymentMethod }, addPaymentMethod] =
    useMutation(ADD_PAYMENT_METHOD);
  const [{ fetching: fetchingUpdatePaymentMethod }, updatePaymentMethod] =
    useMutation(UPDATE_PAYMENT_METHOD);
  const [{ fetching: fetchingDeletePaymentMethod }, deletePaymentMethod] =
    useMutation(DELETE_PAYMENT_METHOD);

  useEffect(() => {
    if (editingMethod) {
      setFormData({
        name: editingMethod.name,
        accountNumber: editingMethod.accountNumber,
        accountName: editingMethod.accountName,
      });
    } else {
      setFormData({ name: '', accountNumber: '', accountName: '' });
    }
  }, [editingMethod]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMethod) {
        const result = await updatePaymentMethod({
          updatePaymentMethodId: editingMethod.id,
          ...formData,
        });
        if (result.data) {
          toast.success('Payment method updated successfully!');
        } else {
          toast.error('Failed to update payment method.');
        }
      } else {
        const result = await addPaymentMethod(formData);
        if (result.data) {
          toast.success('Payment method added successfully!');
        } else {
          toast.error('Failed to add payment method.');
        }
      }
      // Close the modal and reset the form
      setIsModalOpen(false);
      setEditingMethod(null);
      setFormData({ name: '', accountNumber: '', accountName: '' });
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    }
  };

  const handleDelete = async (methodId: string) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this payment method?'
    );
    if (confirmDelete) {
      try {
        const result = await deletePaymentMethod({
          deletePaymentMethodId: methodId,
        });
        if (result.data) {
          toast.success('Payment method deleted successfully!');
        } else {
          toast.error('Failed to delete payment method.');
        }
      } catch (error) {
        toast.error('An error occurred while deleting the payment method.');
      }
    }
  };

  return (
     
      <div className="min-h-screen flex items-center justify-center">
        <ShadowBox className="w-full lg:w-[767px] mx-auto my-auto bg-secondary bg-opacity-70 p-4 text-cool-grey ">
          <ShadowBox className="bg-[#D2E1D9] p-4 ">
            <div className="flex items-center gap-2 mb-2">
              <MoveLeft
                className="w-6 h-6 cursor-pointer"
                onClick={() => router.back()}
              />
              Go Back
            </div>
            <ShadowBox className="bg-secondary p-4 ">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-base font-semibold ">Payment Methods</h1>
                <button
                  onClick={() => {
                    setEditingMethod(null);
                    setIsModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <PlusCircle size={20} />
                  Add Method
                </button>
              </div>
              <div className="space-y-4 h-[360px] overflow-y-auto">
                {fetchingPaymentMethods ? (
                  <div className="flex items-center justify-center h-32">
                    <LoaderCircle className=" animate-spin text-white w-8 h-8" />
                  </div>
                ) : viewPaymentMethods?.paymentMethods?.length > 0 ? (
                  viewPaymentMethods?.paymentMethods?.map((method: any) => (
                    <div
                      key={method.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3 bg-[#E8F3EE] py-2 px-3 rounded-lg border border-[#B2D4C3]">
                          <CreditCard className="w-5 h-5 text-primary" />
                          <h3 className="font-semibold text-gray-700">
                            <span className="text-sm text-gray-500">Name:</span>{' '}
                            <span className="text-primary">{method.name}</span>
                          </h3>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2">
                          <div className="flex items-center gap-3 bg-[#E8F3EE] py-2 px-3 rounded-lg border border-[#B2D4C3]">
                            <Bank className="w-5 h-5 text-primary" />
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500">
                                Account Number
                              </span>
                              <span className="font-medium text-gray-700">
                                {method.accountNumber}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 bg-[#E8F3EE] py-2 px-3 rounded-lg border border-[#B2D4C3]">
                            <User className="w-5 h-5 text-primary" />
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500">
                                Account Name
                              </span>
                              <span className="font-medium text-gray-700">
                                {method.accountName}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingMethod(method);
                            setIsModalOpen(true);
                          }}
                          className="p-2 text-white hover:text-indigo-600 transition-colors"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(method.id)}
                          className="p-2 text-white hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-cool-grey">
                    No payment methods found.
                  </div>
                )}
              </div>
            </ShadowBox>
          </ShadowBox>
        </ShadowBox>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <ShadowBox className="w-full max-w-md bg-secondary bg-opacity-70 p-4">
              <ShadowBox className="bg-[#D2E1D9] p-4">
                <h2 className="text-xl font-semibold text-secondary mb-4 flex items-center justify-between">
                  {editingMethod ? 'Edit Payment Method' : 'Add Payment Method'}
                  <X
                    className="cursor-pointer"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingMethod(null);
                      setFormData({
                        name: '',
                        accountNumber: '',
                        accountName: '',
                      });
                    }}
                  />
                </h2>
                <form
                  onSubmit={handleSubmit}
                  className="space-y-4 bg-secondary p-4 rounded-2xl text-cool-grey"
                >
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Method Name
                    </label>
                    <div className="relative">
                      <CreditCard
                        className="absolute left-3 top-1/2 -translate-y-1/2"
                        size={20}
                      />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="pl-10 w-full p-2 border border-gray-300 text-cool-grey focus:ring-0 focus:outline-none rounded-lg bg-green-cyan"
                        placeholder="e.g. Personal Account"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Account Number
                    </label>
                    <div className="relative">
                      <Bank
                        className="absolute left-3 top-1/2 -translate-y-1/2"
                        size={20}
                      />
                      <input
                        type="text"
                        value={formData.accountNumber}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            accountNumber: e.target.value,
                          })
                        }
                        className="pl-10 w-full p-2 border border-gray-300 text-cool-grey focus:ring-0 focus:outline-none rounded-lg bg-green-cyan"
                        placeholder="Enter account number"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Account Name
                    </label>
                    <div className="relative">
                      <User
                        className="absolute left-3 top-1/2 -translate-y-1/2"
                        size={20}
                      />
                      <input
                        type="text"
                        value={formData.accountName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            accountName: e.target.value,
                          })
                        }
                        className="pl-10 w-full p-2 border border-gray-300 focus:outline-none text-cool-grey rounded-lg bg-green-cyan"
                        placeholder="Enter account holder name"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      disabled={
                        fetchingAddPaymentMethod || fetchingUpdatePaymentMethod
                      }
                      type="submit"
                      className="bg-primary hover:bg-primary/90 hover:text-white disabled:bg-gray-500 disabled:cursor-not-allowed disabled:hover:text-secondary px-4 py-2 rounded-lg text-custom-font-16 w-full transition-colors duration-200"
                    >
                      {editingMethod ? 'Update' : 'Add'} Method
                    </button>
                  </div>
                </form>
              </ShadowBox>
            </ShadowBox>
          </div>
        )}
      </div>
    
  );
}

export default AddUpdatePaymentMethod;
