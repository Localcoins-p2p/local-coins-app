import Image from 'next/image';
import Link from 'next/link';
import { PiTelegramLogoLight } from "react-icons/pi";


const Footer = () => {
  return (
    <footer className="border-t border-[#393939] mt-14 py-14">
      <div className="container mx-auto flex justify-between items-center">
       
        <div className="flex items-center space-x-4">

          <div className="flex items-center space-x-2">
            <Image
              src="/assets/common/logooo.svg" 
              alt="Local Coins Logo"
              width={233}
              height={40}
              className="inline-block"
            />
            
          </div>

    
          <div className="flex items-center space-x-4">
            <Link href="" target='_blank' passHref>
              <Image
                src="/assets/common/facebookicon.svg" 
                alt="Facebook"
                width={10}
                height={5}
              />
            </Link>
            <Link href="https://x.com/Localcoinsp2p" target='_blank' passHref>
              <Image
                src="/assets/common/twiter (2).svg" 
                alt="Twitter"
                width={15}
                height={13}
              />
            </Link>
            <Link  href="https://t.me/localcoinscommunity" target='_blank' passHref>
             
              <PiTelegramLogoLight className='w-[16px] h-[15px] text-white'/>

            </Link>
          </div>
        </div>

        <div className="text-white font-[400] text-[16px]">
          © Local Coins 2024
        </div>
      </div>
    </footer>
  );
};

export default Footer;
