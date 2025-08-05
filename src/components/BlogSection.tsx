'use client'

export default function BlogSection() {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-2 text-gray-800 text-center">BLOG</h2>

      <div className="flex justify-center mb-5">
        <div className="relative w-40 h-4 flex items-center justify-center">
          <div className="absolute top-1/2 left-0 w-full h-px bg-gray-300"></div>

          <div className="relative z-10 bg-white px-2 flex gap-1">
            <span className="text-gray-500 text-sm">///////</span>
          </div>
        </div>
      </div>

      <div>
        <img
          src="/blog-section-bourjois-velvet.jpg"
          alt="blog"
          className="w-full h-40 object-cover rounded-md mb-3"
        />
        <p className="text-sm font-semibold text-gray-800 ">Review son kem Bourjois Velvet</p>
        <p className="text-sm text-gray-600 mt-1 text-justify border-t border-gray-300 ">
          Hi, chào các nàng… sau nhiều lời hứa hão thì hôm nay tớ quay lại hâm nóng cái Blog này vào một ngày đầu hè nóng oi bứa, 
          khi mà dân tình đổ xô nhau đi tắm Free để giải nhiệt.
        </p>
        <span className="mt-2 flex justify-between text-xs text-gray-500"> Bởi NamTram (27/05/2015)</span>
        <div className="mt-2 flex justify-between text-xs text-gray-500 border-t border-gray-300">
          <span className="hover:underline cursor-pointer">Đọc thêm </span>
          <span className="hover:underline cursor-pointer">23 Bình luận</span>
        </div>
      </div>
    </div>
  )
}
