"use client"

import Image from "next/image"
import { useState } from "react"

interface ListingImageProps {
  src: string
  alt: string
  fallbackSrc: string
}

export default function ListingImage({ src, alt, fallbackSrc }: ListingImageProps) {
  const [imgSrc, setImgSrc] = useState(src)

  return (
    <Image
      src={imgSrc || "/placeholder.svg"}
      alt={alt}
      fill
      className="object-cover"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      onError={() => setImgSrc(fallbackSrc)}
    />
  )
}
