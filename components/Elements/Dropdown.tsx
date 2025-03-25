'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import Image from 'next/image';

interface DropdownOption {
  value: string;
  label: string;
  icon?: string;
  image?: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  parentClassName?: string;
}

export default function Dropdown({
  options,
  value,
  onChange,
  className = '',
  parentClassName = '',
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption: typeof options[0] | undefined =
    options?.find((option) => option.value === value) || options[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={dropdownRef} className={`relative ${parentClassName}`}>
      <button
        type="button"
        className={`flex items-center justify-between min-w-[116px]  px-2 py-1 text-white bg-primary rounded-md focus:outline-none ${className}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          {selectedOption?.icon && (
            <div className="flex items-center justify-center w-6 h-6 mr-2 rounded-full bg-primary">
              <span className="text-white font-bold">
                {selectedOption.icon}
              </span>
            </div>
          )}
          {selectedOption?.image && (
            <div className="flex items-center justify-center w-6 h-6 mr-2 rounded-full ">
              <Image
                src={selectedOption.image}
                alt={selectedOption?.label}
                width={20}
                height={20}
              />
            </div>
          )}
          <span className="text-sm font-medium">{selectedOption?.label}</span>
        </div>
        <ChevronDown
          className={`ml-2 h-5 w-5 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-primary text-white rounded-md shadow-lg">
          <ul className="py-1 max-h-60 overflow-auto">
            {options.map((option) => (
              <li key={option.value}>
                <button
                  type="button"
                  className={`flex items-center w-full px-4 py-2 text-left text-white hover:bg-secondary ${
                    option.value === value ? 'bg-secondary/90' : ''
                  }`}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                >
                  {option.icon && (
                    <div className="flex items-center justify-center w-8 h-8 mr-2 p-3 rounded-full bg-primary">
                      <span className="text-white font-bold">
                        {option.icon}
                      </span>
                    </div>
                  )}
                  {option?.image && (
                    <div className="flex items-center justify-center w-8 h-8 mr-2 rounded-full">
                      <Image
                        src={option.image}
                        alt={option.label}
                        width={20}
                        height={20}
                      />
                    </div>
                  )}
                  <span>{option.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
