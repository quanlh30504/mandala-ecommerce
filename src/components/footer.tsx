import FooterLinkColumn from "./footers/FooterLinkColumn";
import ContactItem from "./footers/ContactItem";
import Image from "next/image";
import { MapPin, Phone, Mail, type LucideIcon } from "lucide-react";
import {
  shippingLinks,
  supportLinks,
  informationLinks,
  accountLinks,
  paymentMethods
} from "@/constants/footerLinks";

export default function Footer() {
  const footerLinkColumns = [
    { title: "Chuyển hàng", links: shippingLinks },
    { title: "Hỗ trợ", links: supportLinks },
    { title: "Thông tin", links: informationLinks },
    { title: "Tài khoản", links: accountLinks },
  ];

  return (
    <footer className="bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold mb-6 text-[#8BC34A] uppercase">
              Liên hệ với chúng tôi
            </h3>
            <div className="space-y-4">
              <ContactItem icon={MapPin}>
                Tầng 4, Tòa nhà Hanoi Group Số 442 Đội Cấn, <br />
                P. Cống Vị, Q. Ba Đình, Hà Nội
              </ContactItem>
              <ContactItem icon={Phone}>
                <div>(04) 6674 2332</div>
                <div>(04) 3786 8904</div>
              </ContactItem>
              <ContactItem icon={Mail}>
                <div>(08) 6680 9686</div>
                <div>Support@bizweb.vn</div>
              </ContactItem>
            </div>
          </div>

          {footerLinkColumns.map((column) => (
            <FooterLinkColumn
              key={column.title}
              title={column.title}
              links={column.links}
            />
          ))}
        </div>

        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-400 mb-4 md:mb-0">
              © Copyright 2008-2014 DKT Technology JSC
            </div>
            <div className="flex items-center space-x-4">
              {paymentMethods.map((payment) => (
                <Image
                  key={payment.alt}
                  src={payment.src}
                  alt={payment.alt}
                  width={32}
                  height={20}
                  className="h-5 w-auto"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
