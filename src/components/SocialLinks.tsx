'use client'

import Link from 'next/link'
import { FaFacebookF, FaTwitter, FaInstagram, FaPinterest, FaLinkedinIn } from 'react-icons/fa'
import { SiGoogle } from 'react-icons/si'

export default function SocialLinks() {
  const links = [
    { icon: <FaFacebookF />, label: 'FACEBOOK', href: '#' },
    { icon: <FaTwitter />, label: 'TWITTER', href: '#' },
    { icon: <FaInstagram />, label: 'INSTAGRAM', href: '#' },
    { icon: <SiGoogle />, label: 'GOOGLE +', href: '#' },
    { icon: <FaPinterest />, label: 'PINTEREST', href: '#' },
    { icon: <FaLinkedinIn />, label: 'LINKEDIN', href: '#' },
  ]

  return (
    <div className="flex flex-wrap justify-center items-center py-6 text-gray-400 text-sm">
      {links.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <Link
            href={item.href}
            className="flex items-center gap-2 hover:text-green-600 transition-colors"
          >
            <span className="w-8 h-8 flex items-center justify-center border border-gray-400 rounded-full">
              {item.icon}
            </span>
            <span className="font-semibold">{item.label}</span>
          </Link>

          {index !== links.length - 1 && (
            <span className="mx-3 text-gray-300 select-none">/</span>
          )}
        </div>
      ))}
    </div>
  )
}
