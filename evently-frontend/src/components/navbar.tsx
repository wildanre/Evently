"use client";

import { Bell, Compass, Github, LogIn, Search, Ticket } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { Avatar } from "./ui/avatar";
import { AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="shadow-sm w-full sticky top-0 bg-foreground/10 z-50 bg-gradient-to-t from-transparent to-background backdrop-blur-sm dark:border-foreground/20 dark:bg-foreground/10 dark:bg-gradient-to-b dark:from-transparent dark:to-background">
      <div className="w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-5">
            <Link
              href={"/events"}
              className="flex-shrink-0"
            >
              <Image
                src="/logo-white.png"
                alt="Logo"
                width={100}
                height={100}
                className="h-6 w-6 rounded-full"
              />
            </Link>
            <div className="flex items-center gap-1">
              <Link
                href={"/events"}
                className="text-sm text-foreground"
              >
                <Button variant="ghost" className={cn("rounded-2xl text-sm px-4 h-8 text-gray-300", pathname === "/events" ? "text-white font-bold" : "font-regular")}>
                  <Ticket />
                  <span>
                    Events
                  </span>
                </Button>
              </Link>
              <Link
                href={"/discover"}
                className="text-sm text-foreground"
              >
                <Button variant="ghost" className={cn("rounded-2xl text-sm px-4 h-8 text-gray-300", pathname === "/discover" ? "text-white font-bold" : "font-regular")}>
                  <Compass />
                  <span>
                    Discover
                  </span>
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" className="font-bold px-0">Create Event</Button>
            <Search className="size-5 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
            <Bell className="size-5 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
            <Avatar className="cursor-pointer">
              <AvatarFallback>CN</AvatarFallback>
              <AvatarImage src="/images/avatar1.jpg" alt="avatar" />
            </Avatar>
          </div>
        </div>
      </div>
    </nav>
  );
}