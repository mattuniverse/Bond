import Link from "next/link";

import { SignOutButton } from "@/components/navigation/SignOutButton";

const NAV = [
  { href: "/home", label: "Home" },
  { href: "/affection", label: "Affection" },
  { href: "/history", label: "History" },
  { href: "/avatar", label: "Avatar" },
  { href: "/connection", label: "Connect" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-[#E8DACE] bg-[#FAF7F2]/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-3">
          <Link href="/home" className="text-lg font-light tracking-widest text-[#2C1A0E]">
            Bond
          </Link>
          <nav className="flex items-center gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-3 py-1.5 text-sm font-medium text-[#7A6355] transition-colors hover:bg-[#F0E6D8] hover:text-[#2C1A0E]"
              >
                {item.label}
              </Link>
            ))}
            <SignOutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8">
        {children}
      </main>
    </div>
  );
}
