import React, { useState } from 'react';

interface GoogleMapEmbedProps {
    src: string;
    width?: string;
    height?: string;
    title?: string;
    className?: string;
    allowFullScreen?: boolean;
    loading?: 'lazy' | 'eager';
    enableZoomControls?: boolean;
}

const GoogleMapEmbed: React.FC<GoogleMapEmbedProps> = ({
    src,
    width = '100%',
    height = '450',
    title = 'Google Maps',
    className = '',
    allowFullScreen = true,
    loading = 'lazy',
    enableZoomControls = true
}) => {
    const [isFullscreen, setIsFullscreen] = useState(false);

    if (!src) {
        return (
            <div
                className={`flex items-center justify-center bg-gray-200 rounded-lg ${className}`}
                style={{ width, height: `${height}px` }}
            >
                <p className="text-gray-500">No map source provided</p>
            </div>
        );
    }

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    return (
        <div className={`map-container relative ${className}`}>
            {/* Map Container - Removed zoom controls */}
            <div className={`map-responsive rounded-lg overflow-hidden shadow-lg transition-all duration-300 ${isFullscreen ? 'fixed inset-4 z-50 rounded-xl' : ''
                }`}>
                <iframe
                    src={src}
                    width="100%"
                    height={isFullscreen ? '100%' : height}
                    style={{ border: 0, display: 'block' }}
                    allowFullScreen={allowFullScreen}
                    loading={loading}
                    referrerPolicy="no-referrer-when-downgrade"
                    title={title}
                    className="w-full h-full"
                />
            </div>

            {/* Fullscreen Overlay */}
            {isFullscreen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={toggleFullscreen}
                />
            )}
        </div>
    );
};

export default GoogleMapEmbed;
