import { useState, useEffect, useContext, useMemo } from 'react';
import toast from 'react-hot-toast';
import { gql, useMutation } from 'urql';
import Loading from '../Elements/Loading';
import { AppContext } from '@/utils/context';
import { paymentMethodsByCountry } from '@/data/paymentMethods';
import ReactSelect from 'react-select';
import customStyles from '../Elements/reactSelectStyles';
import Select from 'react-select';

interface PaymentFormProps {
  onSubmit: () => void;
  selectedUser: any;
}

const ADD_PAYMENT_METHOD = gql`
  mutation AddPaymentMethod(
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
    }
  }
`;

const UPDATE_PAYMENT_METHOD = gql`
  mutation UpdatePaymentMethod(
    $id: String!
    $name: String
    $accountNumber: String
    $accountName: String
  ) {
    updatePaymentMethod(
      id: $id
      name: $name
      accountNumber: $accountNumber
      accountName: $accountName
    ) {
      id
    }
  }
`;

const PaymentForm: React.FC<PaymentFormProps> = ({
  onSubmit,
  selectedUser,
}) => {
  const [{ fetching: adding }, addPaymentMethod] =
    useMutation(ADD_PAYMENT_METHOD);
  const [{ fetching: updating }, updatePaymentMethod] = useMutation(
    UPDATE_PAYMENT_METHOD
  );
  const {
    context: { user },
  } = useContext(AppContext);

  const [paymentMethod, setPaymentMethod] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');

  const { id, name, phone, heading } = selectedUser || {};
  const loading = adding || updating;

  useEffect(() => {
    if (phone) {
      setAccountNumber(phone);
    }
  }, [phone]);

  useEffect(() => {
    if (heading) {
      setPaymentMethod(heading);
    }
  }, [phone]);

  useEffect(() => {
    if (name) {
      setAccountName(name);
    }
  }, [phone]);

  const handleSubmit = async () => {
    //onSubmit(paymentMethod, accountNumber, accountName);
    if (!id) {
      await addPaymentMethod({
        name: paymentMethod,
        accountName,
        accountNumber,
      });
    } else {
      await updatePaymentMethod({
        id,
        name: paymentMethod,
        accountName,
        accountNumber,
      });
    }
    toast.success('Payment info updated successfully');
    onSubmit();
  };

  const paymentMethods = useMemo(() => {
    const methods = paymentMethodsByCountry();
    return methods[user?.country as 'PAKISTAN'];
  }, [user]);

  const isEdit = !!id;

  return (
    <div className="p-4">
      {/* <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Payment Method
        </label>
        <ReactSelect
          className="w-[100px] border-l border-[#393939]"
          onChange={(option) => {
            console.log(option);
          }}
          options={paymentMethods?.map((p) => ({ value: p, label: p }))}
          styles={customStyles}
          isSearchable={false}
        />
      </div> */}

      <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
            Payment Method
            </label>
            <Select
            onChange={(option) => {
              console.log(option);
            }}
            options={paymentMethods?.map((p) => ({ value: p, label: p }))}   
            isSearchable={false}       
             
              placeholder="Select a payment method"
              className="mt-1"
            />
          </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Account Name
        </label>
        <input
          type="text"
          placeholder="Enter Account Name"
          value={accountName}
          onChange={(e) => setAccountName(e.target.value)}
          className="mt-1 block px-3 py-2 w-64 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          type="text"
          placeholder="Enter Account Number"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
          className="mt-1 block px-3 py-2 w-64 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <button
        onClick={handleSubmit}
        className="w-full px-4 py-2 bg-[#f3aa05] text-white text-sm font-medium rounded hover:bg-blue-600"
      >
        {loading ? (
          <div className="flex justify-center items-center">
            <Loading width="5" height="5" />
          </div>
        ) : isEdit ? (
          'Update Payment Method'
        ) : (
          'Add Payment Method'
        )}
      </button>
    </div>
  );
};

export default PaymentForm;
