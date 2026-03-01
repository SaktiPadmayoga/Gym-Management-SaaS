'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Tab = {
  label: string;
  value: string;
};

interface TabsProps {
  tabs: Tab[];
  defaultValue?: string;
  onChange: (value: string) => void;
  fullWidth?: boolean;
  basePath?: string;
}

export default function Tabs({
  tabs,
  defaultValue,
  onChange,
  fullWidth = true,
  basePath,
}: TabsProps) {
  const [active, setActive] = useState(defaultValue || tabs[0].value);
  const router = useRouter();

  const handleClick = (value: string) => {
    setActive(value);
    if (onChange) onChange(value);
    if (basePath) {
      router.push(`${basePath}/${value}`);
    }
  };

  return (
    <div className="bg-geonet-primary-bg flex h-12.5 w-full space-x-2 rounded-md p-2">
      {tabs.map((tab) => (
        <a
          key={tab.value}
          className={`flex cursor-pointer items-center justify-center rounded-md px-3 py-2 text-sm ${fullWidth ? 'flex-1' : ''} ${
            active === tab.value
              ? 'text-geonet-black bg-white'
              : 'text-geonet-gray hover:text-geonet-black transform duration-300 hover:bg-white'
          }`}
          onClick={() => handleClick(tab.value)}
        >
          {tab.label}
        </a>
      ))}
    </div>
  );
}
