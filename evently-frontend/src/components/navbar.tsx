"use client";

import { Bell, Github, LogIn } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { Avatar } from "./ui/avatar";
import { AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

export default function Navbar() {
  return (
    <nav className="shadow-sm w-full sticky top-0 bg-foreground/10 z-50">
      <div className="w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link
              href={"/"}
              className="flex-shrink-0"
            >
              <h1 className="font-black text-xl sm:text-2xl text-primary">
                Evently
              </h1>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Bell className="size-5 text-muted-foreground hover:text-primary transition-colors" />
            <Avatar>
              <AvatarFallback>CN</AvatarFallback>
              <AvatarImage src="/images/avatar1.jpg" alt="avatar" />
            </Avatar>
          </div>
        </div>
      </div>
    </nav>
  );
}