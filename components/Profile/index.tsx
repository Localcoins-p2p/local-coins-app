'use client';
import { AppContext } from '@/utils/context';
import { useRouter } from 'next/navigation';
import { useContext, useState } from 'react';
import toast from 'react-hot-toast';
import { gql, useMutation } from 'urql';
import Footer from '../Footer/Footer';
import NewHeader from '../NewHeader/NewHeader';
import Loading from '../Elements/Loading';
import Select from 'react-select';

const UPDATE_USER = gql`
  mutation UpdateUser($name: String, $email: String) {
    updateUser(name: $name, email: $email) {
      id
    }
  }
`;

// todo: fix this page
// add loading, <Loading /> component is already there
// add. header footer
// change button styles according to website

const Profile = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState<CountryOption | null>(null);
  const [{ fetching }, updateUser] = useMutation(UPDATE_USER);
  const router = useRouter();

  const {
    context: { user },
  } = useContext(AppContext);

  const handleSubmit = () => {
    updateUser({ name, email }).then(() => {
      toast.success('Account updated successfully');
      router.push('/');
    });
  };

  if (fetching) {
    return <Loading height="50" width="50" />;
  }
  interface CountryOption {
    label: string;
    value: string;
  }
  const countries:CountryOption[] = [
    { label: 'Australia', value: 'AUSTRALIA' },
    { label: 'Singapore', value: 'SINGAPORE' },
    { label: 'Japan', value: 'JAPAN' },
    { label: 'South Korea', value: 'SOUTHKOREA' },
    { label: 'Philippines', value: 'PHILIPPINES' },
    { label: 'Hong Kong', value: 'HONGKONG' },
    { label: 'Thailand', value: 'THAILAND' },
    { label: 'Malaysia', value: 'MALAYSIA' },
    { label: 'Indonesia', value: 'INDONESIA' },
    { label: 'Vietnam', value: 'VIETNAM' },
    { label: 'India', value: 'INDIA' },
    { label: 'New Zealand', value: 'NEWZEALAND' },
    { label: 'Pakistan', value: 'PAKISTAN' },
    { label: 'Bangladesh', value: 'BANGLADESH' },
    { label: 'Sri Lanka', value: 'SRILANKA' },
  ];
console.log(country)
  return (
    <div>
      <div className="px-10">
        <NewHeader />
      </div>
      <div className=" mt-20 mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white p-8 rounded shadow-md">
          <h2 className="text-2xl font-semibold mb-6">Profile</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              value={name}
              placeholder="Enter Name"
              onChange={(e) => setName(e.target.value)}
              defaultValue={user?.name}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              placeholder="Enter Email"
              defaultValue={user?.email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
         
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">
              Country
            </label>
            <Select
              options={countries}
              value={country}
              onChange={(selectedOption) => setCountry(selectedOption ? { label: selectedOption.label, value: selectedOption.value.toUpperCase() } : null)}
              placeholder="Select a country"
              className="mt-1"
            />
          </div>
          <button
            onClick={handleSubmit}
            className="w-full px-4 py-2 bg-[#f3aa05] text-white text-sm font-medium rounded hover:bg-[#c99b38]"
          >
            Submit
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
