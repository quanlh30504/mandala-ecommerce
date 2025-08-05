'use client';
import React from 'react';
import { FaStar, FaStarHalfAlt } from 'react-icons/fa';

interface StarRatingProps {
    rating: number;
    maxStars?: number;
    size?: 'xs' | 'sm' | 'md' | 'lg';
    showValue?: boolean;
    reviewCount?: number;
}

const StarRating: React.FC<StarRatingProps> = ({
    rating,
    maxStars = 5,
    size = 'sm',
    showValue = false,
    reviewCount = 0
}) => {
    const sizeClasses = {
        xs: 'text-xs',
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg'
    };

    const renderStar = (index: number) => {
        const starValue = index + 1;
        const difference = rating - index;

        if (difference >= 1) {
            // Full star
            return (
                <FaStar
                    key={index}
                    className={`${sizeClasses[size]} text-yellow-400`}
                />
            );
        } else if (difference >= 0.5) {
            // Half star
            return (
                <FaStarHalfAlt
                    key={index}
                    className={`${sizeClasses[size]} text-yellow-400`}
                />
            );
        } else {
            // Empty star
            return (
                <FaStar
                    key={index}
                    className={`${sizeClasses[size]} text-gray-300`}
                />
            );
        }
    };

    return (
        <div className="flex items-center gap-1">
            <div className="flex">
                {[...Array(maxStars)].map((_, index) => renderStar(index))}
            </div>
            {showValue && (
                <span className={`text-gray-600 ${sizeClasses[size]}`}>
                    ({rating.toFixed(1)})
                    {reviewCount > 0 && (
                        <span className="text-gray-500"> • {reviewCount} đánh giá</span>
                    )}
                </span>
            )}
        </div>
    );
};

export default StarRating;
