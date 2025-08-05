'use client'
import Link from 'next/link'

export default function AboutSection() {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-2 text-gray-800 text-center">VỀ CHÚNG TÔI</h2>

      <div className="flex justify-center mb-5">
        <div className="relative w-40 h-4 flex items-center justify-center">
          <div className="absolute top-1/2 left-0 w-full h-px bg-gray-300"></div>

          <div className="relative z-10 bg-white px-2 flex gap-1">
            <span className="text-gray-500 text-sm">////</span>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-600">GIỚI THIỆU CHUNG VỀ MỸ PHẨM HANDMADE MANDALA</p>
      <p className="mt-4 text-sm text-gray-600 text-justify">
        Hi, chào các nàng… sau nhiều lời hứa hão thì hôm nay tớ quay lại hâm nóng cái Blog này vào một ngày đầu hè
        nóng oi bức, khi mà dân tình xô nhai đi tắm Free để giải nhiệt. Hi, chào các nàng,... sau khá nhiều lời hứa hõa 
        thì hôm nay tớ quay lại hâm nóng cái Blog này vào một ngày đầu hè nóng oi bức, khi mà dân tình xô nhai đi tắm Free để giải nhiệt.
        sau khá nhiều lời hứa hão thì hôm nay tớ quay lại hâm nóng cái Blog này vào một ngày đầu hè nóng oi bức, khi mà dân tình xô nhai đi tắm Free để giải nhiệt.
      </p>
      <Link href="/aboutus" className="text-sm text-gray-800 hover:underline mt-2 inline-block">
        Xem thêm
      </Link>
    </div>
  )
}
