'use client';
import React from 'react';
import Image from 'next/image';
import saleBannerImg from '../../../../public/products/sale-banner.jpg';

const SaleBanner = () => {
  return (
    <div className="w-full mb-6 lg:mb-8">
      <div className="relative overflow-hidden shadow-lg">
        {/* Background Image */}
        <Image
          src={saleBannerImg}
          alt="Summer Sale Banner"
          className="w-full h-48 md:h-64 lg:h-80 object-cover"
          priority
        />
      </div>
    </div>
  );
};

export default SaleBanner;
