'use client';

import 'react-phone-number-input/style.css';
import PhoneInput, { type PhoneInputProps } from 'react-phone-number-input';
import { cn } from '@/lib/utils';

const CustomPhoneInput = (props: PhoneInputProps) => {
  return (
    <PhoneInput
      className={cn(
        'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        // This is the key change: ensure the actual input element is also full-width
        '[&_input]:w-full [&_input]:bg-transparent [&_input]:border-0 [&_input]:outline-none [&_input]:ring-0 [&_input]:p-0',
        '[&_.PhoneInputCountry]:mr-2'
      )}
      {...props}
    />
  );
};

export { CustomPhoneInput as PhoneInput };
