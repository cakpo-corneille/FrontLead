import React from 'react';
import Image from 'next/image';
import { placeholderImages } from '@/lib/placeholder-images';

export const FormPreview = ({ children }: { children: React.ReactNode }) => {
  const captivePortalImage = placeholderImages.find(
    (img) => img.id === 'form-templates-background'
  );

  return (
    <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[11px] rounded-[2rem] h-[450px] w-[260px] shadow-xl">
      <div className="w-[118px] h-[14px] bg-gray-800 top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute"></div>
      <div className="h-[37px] w-[2px] bg-gray-800 absolute -left-[13px] top-[99px] rounded-l-lg"></div>
      <div className="h-[37px] w-[2px] bg-gray-800 absolute -left-[13px] top-[142px] rounded-l-lg"></div>
      <div className="h-[51px] w-[2px] bg-gray-800 absolute -right-[13px] top-[114px] rounded-r-lg"></div>
      <div className="rounded-[1.6rem] overflow-hidden w-full h-full bg-white dark:bg-gray-800 relative">
        {captivePortalImage ? (
          <Image
            src={captivePortalImage.imageUrl}
            alt={captivePortalImage.description}
            fill
            sizes="260px"
            className="z-0 object-cover"
            data-ai-hint={captivePortalImage.imageHint}
          />
        ) : (
          <div className="absolute inset-0 bg-gray-200" />
        )}
        <div className="absolute inset-0 flex items-center justify-center z-10 p-px sm:p-4">
            {children}
        </div>
      </div>
    </div>
  );
};
