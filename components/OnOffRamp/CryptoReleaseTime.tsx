import React, { useEffect, useState } from 'react';
import ShadowBox from '../Elements/ShadowBox';

// Define the props type
interface CryptoReleaseTimeProps {
  initialMinutes?: number;
  initialSeconds?: number;
  className?: string;
  title?: string;
}

const CryptoReleaseTime: React.FC<CryptoReleaseTimeProps> = React.memo(
  ({
    initialMinutes = 14,
    initialSeconds = 59,
    className = '',
    title = '',
  }) => {
    const [minutes, setMinutes] = useState<number>(initialMinutes);
    const [seconds, setSeconds] = useState<number>(initialSeconds);

    useEffect(() => {
      const timer = setInterval(() => {
        setSeconds((prevSeconds) => {
          if (prevSeconds > 0) {
            return prevSeconds - 1;
          } else {
            if (minutes > 0) {
              setMinutes((prevMinutes) => prevMinutes - 1);
              return 59;
            } else {
              clearInterval(timer);
              return 0; // Stop the timer
            }
          }
        });
      }, 1000);

      return () => clearInterval(timer);
    }, [minutes]);

    return (
      <ShadowBox
        className={` p-4 rounded-lg flex justify-between items-center ${className}`}
      >
        <h2 className="text-[#F5FFFA] text-base font-medium leading-[100%]">
          {title}
        </h2>
        <ShadowBox className="flex items-center gap-6 bg-secondary text-white px-6">
          <div className="flex flex-col gap-2 items-center justify-center">
            <span className="font-semibold text-sm leading-[100%]">
              {minutes.toString().padStart(2, '0')}
            </span>
            <span className="font-light text-xs leading-[100%]">Min</span>
          </div>
          <div className="h-[30px] w-px bg-primary" />
          <div className="flex flex-col gap-2 items-center justify-center">
            <span className="font-semibold text-sm leading-[100%]">
              {seconds.toString().padStart(2, '0')}
            </span>
            <span className="font-light text-xs leading-[100%]">Sec</span>
          </div>
        </ShadowBox>
      </ShadowBox>
    );
  }
);

// Set a display name for the component
CryptoReleaseTime.displayName = 'CryptoReleaseTime';

export default CryptoReleaseTime;
