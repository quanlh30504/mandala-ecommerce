import Link from "next/link";

interface FooterLinkColumnProps {
  title: string;
  links: { href: string; text: string }[];
}

export default function FooterLinkColumn({ title, links }: FooterLinkColumnProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-6 text-[#8BC34A] uppercase">{title}</h3>
      <ul className="space-y-3 text-sm text-gray-300">
        {links.map((link) => (
          <li key={link.text}>
            <Link href={link.href} className="hover:text-primary transition-colors">
              {link.text}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
