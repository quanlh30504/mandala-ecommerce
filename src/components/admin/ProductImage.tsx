import Image from 'next/image'
import { useState } from 'react'
import { ImageIcon } from 'lucide-react'

interface ProductImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  fallbackClassName?: string
}

export function ProductImage({ 
  src, 
  alt, 
  width = 200, 
  height = 200, 
  className = "",
  fallbackClassName = ""
}: ProductImageProps) {
  const [imageError, setImageError] = useState(false)
  
  if (imageError || !src) {
    return (
      <div className={`bg-muted rounded-md flex items-center justify-center ${fallbackClassName} ${className}`}>
        <ImageIcon className="w-6 h-6 text-muted-foreground" />
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={() => setImageError(true)}
    />
  )
}
