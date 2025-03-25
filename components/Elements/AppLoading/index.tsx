import React from 'react';
// import appLoading from '@/public/assets/app-loading.svg';
import Image from 'next/image';

const AppLoading = () => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#fff',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
      }}
      className="bg-secondary"
    >
      <span className="w-[60px] h-[60px] border-[7px] border-[#0DCE71] border-b-[#002B14] inline-block box-border border-solid rounded-full  animate-spin">
        {/* <Image src={appLoading} alt="" width={200} height={200} /> */}
      </span>
    </div>
  );
};

export default AppLoading;
