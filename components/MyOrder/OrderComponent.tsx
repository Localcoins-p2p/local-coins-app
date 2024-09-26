import React from 'react';

interface OrderComponentProps {
  sale: {
    amount: number;
    unitPrice: number;
  };
  showConfirmPaymentReceivedButton: boolean;
  showConfirmPaymentSentButton: boolean;
  loading: boolean;
}

const OrderComponent: React.FC<OrderComponentProps> = ({
  sale,
  showConfirmPaymentReceivedButton,
  showConfirmPaymentSentButton,
  loading,
}) => {
  return (
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
                {sale.amount * sale.unitPrice}
              </span>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-[#A6A6A6] text-[18px] font-[500]">
                Price
              </span>
              <span className="text-[#FFFFFF] text-[18px] font-[600]">
                ${sale.unitPrice}
              </span>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-[#A6A6A6] text-[18px] font-[500]">
                Receive Quantity
              </span>
              <span className="text-[#FFFFFF] text-[18px] font-[600]">
                {sale.amount}
              </span>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center my-4">
            <div className="w-6 h-6 absolute left-[-13px] rounded-full bg-white text-black font-bold flex items-center justify-center">
              2
            </div>
            <h2 className="ml-4 text-xl font-semibold">
              Open {`{Gcash}`} to transfer 550.10
            </h2>
          </div>
          <p className="text-[#FFFFFF] text-[18px] ml-4 mb-4">
            Transfer the funds to the seller&apos;s account provided below.
          </p>
          <div className="border border-[#4D4D4D] p-4 rounded-[5px]">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-1">
                <div className="h-2  w-2 rounded-full bg-[#00B2FF]"></div>
                <span className="text-[#FFFFFF] font-bold">Gcash</span>
              </div>

              <button className="text-yellow-400">Change</button>
            </div>
            <div className="mb-2 flex justify-between">
              <span className="text-[#A6A6A6] text-[18px] font-[500]">
                Recipient
              </span>
              <p className="text-[#FFFFFF] text-[18px] font-[600]">
                Pedro Stallone
              </p>
            </div>
            <div className="mb-2 flex justify-between">
              <span className="text-[#A6A6A6] text-[18px] font-[500]">
                Mobile Number
              </span>
              <p className="text-[#FFFFFF] text-[18px] font-[600]">
                09987654321
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
            <h2 className="ml-4 text-xl font-semibold">Notify Seller</h2>
          </div>
        </div>
      </div>
      <div className="pl-4">
        <p className="text-[#FFFFFF] text-[18px] font-[400] mb-4 ml-4">
          After payment, remember to click the &apos;Transferred, Notify
          Seller&apos; button to facilitate the crypto release by the seller.
        </p>
        {showConfirmPaymentSentButton && (
          <div className="flex justify-between ml-4">
            <button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 px-4 rounded-lg">
              {loading && '...'}
              Transferred, Notify Seller
            </button>
            <button className="text-[#F3AA05] font-semibold ">Cancel</button>
          </div>
        )}
        {showConfirmPaymentReceivedButton && (
          <div className="flex justify-between ml-4">
            <button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 px-4 rounded-lg">
              {loading && '...'}
              Payment Received
            </button>
            <button className="text-[#F3AA05] font-semibold ">Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderComponent;
