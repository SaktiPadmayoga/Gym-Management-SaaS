'use client';

import { Icon, type IconName } from '@/components/icon'; // Import IconName dari sini (adjust path kalau beda)
import { ReactNode } from 'react';

interface CustomButtonProps {
  children?: ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  iconName?: IconName;
  iconClassName?: string;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  size?: 'sm' | 'md' | 'lg';
}

export default function CustomButton({
  children,
  onClick,
  iconName,
  iconClassName = 'h-5 w-5',
  className = '',
  disabled = false,
  type = 'button',
}: CustomButtonProps) {
  const baseClasses = `border border-aksen-secondary bg-aksen-secondary flex items-center justify-center gap-1 rounded-lg text-sm font-medium hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`;
  const iconElement = iconName ? <Icon name={iconName} className={iconClassName} /> : null;

  return (
    <button
      type={type}
      className={`${baseClasses} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {iconElement}
      {children}
    </button>
  );
}
