"use client";

import { LINKS } from "@/lib/data";
import { ANIMATION_DELAY, cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";
import { useActiveContext } from "./provider/active-section-context";

export default function Header() {
  const { activeSection, setActiveSection, setTimeOfLastClick } =
    useActiveContext();

  return (
    <header className="z-[999] relative">
      <motion.div
        initial={{ y: -100, x: "-50%", opacity: 0 }}
        animate={{ y: 0, x: "-50%", opacity: 1 }}
        transition={{ delay: ANIMATION_DELAY }}
        className="fixed top-0 left-1/2 h-[4.5rem] rounded-xl border-opacity-40 bg-[#292929] bg-opacity-50 shadow-lg shadow-black/[0.03] backdrop-blur-[0.5rem] sm:top-6 sm:h-[3.25rem] sm:w-[28rem] sm:rounded-xl"
      />

      <nav className="flex fixed top-[0.15rem] left-1/2 h-12 -translate-x-1/2 py-2 sm:top-[1.7rem] sm:h-[initial] sm:py-0 z-[999]">
        <ul className="flex w-[22rem] flex-wrap items-center justify-center gap-1 text-[0.9rem] font-normal text-[#e3dfd3] sm:w-[initial] sm:flex-nowrap sm:gap-2">
          {LINKS.map((link, index) => (
            <motion.li
              key={index}
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: ANIMATION_DELAY, staggerChildren: 0.2 }}
              className="h-3/4 flex items-center justify-center relative"
            >
              <Link
                className={cn(
                  "flex w-full items-center justify-center px-4 sm:px-3 py-3 hover:text-[#d1a366] transition",
                  {
                    "text-[#ffffe3b9]": activeSection === link.name,
                  }
                )}
                href={link.href}
                onClick={() => {
                  setActiveSection(link.name);
                  setTimeOfLastClick(Date.now());
                }}
              >
                {link.name}

                {link.name === activeSection && (
                  <motion.span
                    className="mx-3 absolute inset-0 -z-10 border-[#e3dfd3] border-b-2 sm:mb-1"
                    layoutId="activeSection"
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                    }}
                  />
                )}
              </Link>
            </motion.li>
          ))}
        </ul>
      </nav>
    </header>
  );
}