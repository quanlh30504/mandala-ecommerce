'use client';
import React from 'react';
import Image from 'next/image';
import advertisementImg from '../../../../public/products/advertisement.jpg';

const Advertisement = () => {
    return (
        <div className="relative rounded-lg overflow-hidden shadow-sm hidden lg:block">
            <Image
                src={advertisementImg}
                alt="Advertisement"
                className="w-full h-auto object-cover"
                priority
            />
        </div>
    );
};

export default Advertisement;
