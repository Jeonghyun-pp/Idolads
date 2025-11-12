"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Menu, User, LogOut, Calendar, MapPin, Megaphone, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

export default function Header() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur supports-[backdrop-filter]:bg-black/60">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              FanPlace
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/events"
              className="text-sm font-medium text-zinc-300 hover:text-white transition-colors flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              이벤트
            </Link>
            <Link
              href="/places"
              className="text-sm font-medium text-zinc-300 hover:text-white transition-colors flex items-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              장소
            </Link>
            <Link
              href="/ads"
              className="text-sm font-medium text-zinc-300 hover:text-white transition-colors flex items-center gap-2"
            >
              <Megaphone className="w-4 h-4" />
              광고
            </Link>
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="w-4 h-4" />
                    <span className="hidden md:inline">{session.user?.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/account" className="flex items-center gap-2 cursor-pointer">
                      <User className="w-4 h-4" />
                      내 계정
                    </Link>
                  </DropdownMenuItem>
                  {(session.user as any)?.role === "ADMIN" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="flex items-center gap-2 cursor-pointer">
                        <Settings className="w-4 h-4" />
                        관리자
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex items-center gap-2 cursor-pointer text-red-400"
                  >
                    <LogOut className="w-4 h-4" />
                    로그아웃
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/auth/signin">로그인</Link>
                </Button>
                <Button size="sm" asChild className="hidden md:inline-flex">
                  <Link href="/auth/signup">회원가입</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-white/10">
            <div className="flex flex-col space-y-3">
              <Link
                href="/events"
                className="text-sm font-medium text-zinc-300 hover:text-white transition-colors flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Calendar className="w-4 h-4" />
                이벤트
              </Link>
              <Link
                href="/places"
                className="text-sm font-medium text-zinc-300 hover:text-white transition-colors flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <MapPin className="w-4 h-4" />
                장소
              </Link>
              <Link
                href="/ads"
                className="text-sm font-medium text-zinc-300 hover:text-white transition-colors flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Megaphone className="w-4 h-4" />
                광고
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

