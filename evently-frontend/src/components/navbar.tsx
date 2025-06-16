"use client";

import { Bell, Compass, Github, LogIn, Search, Ticket, User } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { Avatar } from "./ui/avatar";
import { AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";

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
            <Button variant="ghost" className="font-bold px-0 text-gray-300">Create Event</Button>
            <Search className="size-5 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
            <NotificationMenu>
              <Bell className="size-5 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
            </NotificationMenu>
            <UserMenu>
              <Avatar className="cursor-pointer">
                <AvatarFallback>CN</AvatarFallback>
                <AvatarImage src="/images/avatar1.jpg" alt="avatar" />
              </Avatar>
            </UserMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}

const UserMenu = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent overlay={false} close={false} className="w-70 h-fit absolute right-5 top-16 border rounded-xl bg-background/80">
        <SheetTitle className="hidden">
          User Menu
        </SheetTitle>

        <div className="flex flex-col items-start p-1 gap-1">
          <div className="flex items-center gap-3 w-full p-2 hover:bg-foreground/10 rounded-xl cursor-pointer">
            <Avatar className="cursor-pointer h-10 w-10">
              <AvatarFallback>CN</AvatarFallback>
              <AvatarImage src="/images/avatar1.jpg" alt="avatar" />
            </Avatar>
            <div className="flex flex-col">
              <span className="font-bold">John Doe</span>
              <span className="text-xs text-gray-300 font-semibold">john.doe@gmail.com</span>
            </div>
          </div>
          <Separator />
          <div className="flex flex-col w-full">
            <Link href="/profile" className="flex text-sm font-semibold items-center gap-2 p-2 hover:bg-foreground/10 rounded-md">
              <span>View Profile</span>
            </Link>
            <Link href="/settings" className="flex text-sm font-semibold items-center gap-2 p-2 hover:bg-foreground/10 rounded-md">
              <span>Settings</span>
            </Link>
            <div className="flex text-sm font-semibold items-center gap-2 p-2 hover:bg-foreground/10 rounded-md">
              <span>Logout</span>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

const NotificationMenu = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent overlay={false} close={false} className="w-70 h-fit absolute right-5 top-16 border rounded-xl bg-background/80">
        <SheetTitle className="hidden">
          Notification Menu
        </SheetTitle>

        <div className="flex flex-col items-start">
          <div className="flex items-center gap-3 w-full hover:bg-foreground/10 cursor-pointer rounded-t-xl">
            <div className="flex items-center gap-3 w-full p-2">
              <Avatar className="cursor-pointer h-10 w-10">
                <AvatarFallback>CN</AvatarFallback>
                <AvatarImage src="/images/avatar1.jpg" alt="avatar" />
              </Avatar>
              <div className="flex flex-col gap-1">
                <span className="font-bold text-sm">Santosa <span className="font-medium">sent a message to</span><span>Base Batch Workshop - Yogyakarta, Indonesia</span></span>
                <span className="text-xs font-semibold">Updated <span className="text-gray-400">May 30</span></span>
              </div>
            </div>
          </div>
          <Separator />
          <div className="flex items-center gap-3 w-full hover:bg-foreground/10 cursor-pointer">
            <div className="flex items-center gap-3 w-full p-2">
              <Avatar className="cursor-pointer h-10 w-10">
                <AvatarFallback>CN</AvatarFallback>
                <AvatarImage src="/images/avatar1.jpg" alt="avatar" />
              </Avatar>
              <div className="flex flex-col gap-1">
                <span className="font-bold text-sm">Santosa <span className="font-medium">sent a message to</span><span>Base Batch Workshop - Yogyakarta, Indonesia</span></span>
                <span className="text-xs font-semibold">Updated <span className="text-gray-400">May 30</span></span>
              </div>
            </div>
          </div>
          <Separator />
          <div className="flex items-center gap-3 w-full hover:bg-foreground/10 cursor-pointer rounded-b-xl">
            <div className="flex items-center gap-3 w-full p-2">
              <Avatar className="cursor-pointer h-10 w-10">
                <AvatarFallback>CN</AvatarFallback>
                <AvatarImage src="/images/avatar1.jpg" alt="avatar" />
              </Avatar>
              <div className="flex flex-col gap-1">
                <span className="font-bold text-sm">Santosa <span className="font-medium">sent a message to</span><span>Base Batch Workshop - Yogyakarta, Indonesia</span></span>
                <span className="text-xs font-semibold">Updated <span className="text-gray-400">May 30</span></span>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
