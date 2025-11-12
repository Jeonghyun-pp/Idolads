"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-fuchsia-500/10 to-pink-500/20 pointer-events-none" />
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-black/40" />
        <div className="w-full h-full bg-gradient-to-b from-transparent via-black/50 to-black" />
      </div>

      <div className="relative max-w-[1200px] mx-auto px-4 md:px-6 py-24 md:py-36">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-semibold tracking-tight text-white"
        >
          Celebrate Your Idol,
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
            Together On One Platform
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="mt-5 max-w-2xl text-base md:text-lg text-zinc-200/90"
        >
          생일카페를 찾고, 대관하고, 팬 광고를 집행하세요. 이미지 중심의 세련된 경험을 제공합니다.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mt-8 flex flex-wrap gap-3"
        >
          <Link
            href="/events"
            className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 bg-white/10 border border-white/15 text-white hover:bg-white/15 transition"
          >
            이벤트 보러가기 <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/ads"
            className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md hover:opacity-90 transition"
          >
            광고 알아보기 <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

