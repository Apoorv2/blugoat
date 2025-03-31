/* eslint-disable react/no-children-map */
/* eslint-disable react/no-clone-element */
'use client';

import React from 'react';

import { cn } from '@/lib/utils';

type RadioGroupProps = {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  children: React.ReactNode;
};

export const RadioGroup: React.FC<RadioGroupProps> = ({
  value,
  onValueChange,
  className,
  children,
}) => {
  return (
    <div className={cn('grid gap-2', className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          // Pass the selected value and change handler to each RadioGroupItem
          return React.cloneElement(child, {
            checked: child.props.value === value,
            onChange: () => onValueChange(child.props.value),
          } as React.InputHTMLAttributes<HTMLInputElement>);
        }
        return child;
      })}
    </div>
  );
};

type RadioGroupItemProps = {
  value: string;
  id: string;
  className?: string;
  checked?: boolean;
  onChange?: () => void;
};

export const RadioGroupItem: React.FC<RadioGroupItemProps> = ({
  className,
  id,
  value,
  checked,
  onChange,
  ...props
}) => {
  return (
    <input
      type="radio"
      id={id}
      value={value}
      checked={checked}
      onChange={onChange}
      className={cn(
        'h-4 w-4 cursor-pointer rounded-full border border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500',
        className,
      )}
      {...props}
    />
  );
};
