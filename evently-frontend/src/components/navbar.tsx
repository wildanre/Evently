"use client";

import { useAuth } from "@/contexts/AuthContext";
import { loginUser, registerUser } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import {
  Bell,
  Compass,
  Loader2,
  LogIn,
  LogOut,
  Search,
  Settings,
  Ticket,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { toast } from "sonner";
import { GoogleOAuthButton } from "./auth/GoogleOAuthButton";
import { NotificationMenu } from "./notification-menu";
import { ProfileDialog } from "./profile-menu";
import { SettingsDialog } from "./settings-menu";
import { Avatar } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "./ui/sheet";

export default function Navbar() {
  const [isLogin, setIsLogin] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);
  const [loginForm, setLoginForm] = React.useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = React.useState({
    name: "",
    email: "",
    password: "",
  });
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const {
    user,
    isAuthenticated,
    login,
    logout,
    isLoading: authLoading,
  } = useAuth();
  const pathname = usePathname();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await loginUser(loginForm);
      login(response.token, response.user);
      toast.success("Login successful!");
      setIsDialogOpen(false);
      setLoginForm({ email: "", password: "" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await registerUser(registerForm);
      login(response.token, response.user);
      toast.success("Registration successful!");
      setIsDialogOpen(false);
      setRegisterForm({ name: "", email: "", password: "" });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Registration failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <nav className="shadow-sm w-full sticky top-0 bg-foreground/10 z-50 bg-gradient-to-t from-transparent to-background backdrop-blur-sm dark:border-foreground/20 dark:bg-foreground/10 dark:bg-gradient-to-b dark:from-transparent dark:to-neutral-900">
        <div className="w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-5">
              <div className="h-6 w-6 bg-gray-300 rounded-full animate-pulse" />
            </div>
            <div className="flex items-center gap-4">
              <Loader2 className="h-5 w-5 animate-spin text-gray-300" />
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="shadow-sm w-full flex top-0 bg-foreground/10 z-50 bg-gradient-to-t from-transparent to-background backdrop-blur-sm dark:border-foreground/20 dark:bg-foreground/10 dark:bg-gradient-to-b dark:from-transparent dark:to-neutral-900">
      <div className="w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-5">
            <Link href={"/events"} className="flex-shrink-0">
              <Image
                src="/logo-white.png"
                alt="Logo"
                width={100}
                height={100}
                className="h-6 w-6 rounded-full"
              />
            </Link>
            <div className="flex items-center gap-1">
              <Link href={"/events"} className="text-sm text-foreground">
                <Button
                  variant="ghost"
                  className={cn(
                    "rounded-2xl text-sm px-4 h-8 text-gray-300",
                    pathname === "/events"
                      ? "text-white font-bold"
                      : "font-regular"
                  )}
                >
                  <Ticket />
                  <span>Events</span>
                </Button>
              </Link>
              <Link href={"/discover"} className="text-sm text-foreground">
                <Button
                  variant="ghost"
                  className={cn(
                    "rounded-2xl text-sm px-4 h-8 text-gray-300",
                    pathname === "/discover"
                      ? "text-white font-bold"
                      : "font-regular"
                  )}
                >
                  <Compass />
                  <span>Discover</span>
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href={"/create"}>
              <Button variant="ghost" className="font-bold px-0 text-gray-300">
                Create Event
              </Button>
            </Link>
            <Search className="size-5 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />

            {isAuthenticated ? (
              <>
                <NotificationMenu>
                  <div className="relative">
                    <Bell className="size-5 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
                  </div>
                </NotificationMenu>
                <UserMenu>
                  <Avatar className="cursor-pointer h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Image
                        src={user?.profileImageUrl || "/images/avatar1.jpg"}
                        alt={user?.name || "User Avatar"}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    </AvatarFallback>
                    {user?.profileImageUrl && (
                      <AvatarImage src={user.profileImageUrl} alt={user.name} />
                    )}
                  </Avatar>
                </UserMenu>
              </>
            ) : (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="font-bold px-0 w-16 text-gray-300"
                  >
                    Login
                    <LogIn className="size-5 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  {isLogin ? (
                    <React.Fragment>
                      <DialogHeader>
                        <DialogTitle className="text-lg font-semibold">
                          Login to Your Account
                        </DialogTitle>
                        <DialogDescription className="text-sm text-gray-500">
                          Please enter your email and password to login.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <GoogleOAuthButton />
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                              Or continue with
                            </span>
                          </div>
                        </div>
                        <form
                          onSubmit={handleLogin}
                          className="flex flex-col gap-4"
                        >
                          <Input
                            type="email"
                            placeholder="Email"
                            value={loginForm.email}
                            onChange={(e) =>
                              setLoginForm({
                                ...loginForm,
                                email: e.target.value,
                              })
                            }
                            required
                          />
                          <Input
                            type="password"
                            placeholder="Password"
                            value={loginForm.password}
                            onChange={(e) =>
                              setLoginForm({
                                ...loginForm,
                                password: e.target.value,
                              })
                            }
                            required
                          />
                          <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Signing in...
                              </>
                            ) : (
                              "Login"
                            )}
                          </Button>
                          <span className="text-sm text-center text-gray-300">
                            Don't have an account?{" "}
                            <button
                              type="button"
                              onClick={() => setIsLogin(false)}
                              className="text-white cursor-pointer hover:underline"
                            >
                              Register
                            </button>
                          </span>
                        </form>
                      </div>
                    </React.Fragment>
                  ) : (
                    <React.Fragment>
                      <DialogHeader>
                        <DialogTitle className="text-lg font-semibold">
                          Create Account
                        </DialogTitle>
                        <DialogDescription className="text-sm text-gray-500">
                          Please fill in the details below to create a new
                          account.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <GoogleOAuthButton />
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                              Or continue with
                            </span>
                          </div>
                        </div>
                        <form
                          onSubmit={handleRegister}
                          className="flex flex-col gap-4"
                        >
                          <Input
                            type="text"
                            placeholder="Full Name"
                            value={registerForm.name}
                            onChange={(e) =>
                              setRegisterForm({
                                ...registerForm,
                                name: e.target.value,
                              })
                            }
                            required
                          />
                          <Input
                            type="email"
                            placeholder="Email"
                            value={registerForm.email}
                            onChange={(e) =>
                              setRegisterForm({
                                ...registerForm,
                                email: e.target.value,
                              })
                            }
                            required
                          />
                          <Input
                            type="password"
                            placeholder="Password"
                            value={registerForm.password}
                            onChange={(e) =>
                              setRegisterForm({
                                ...registerForm,
                                password: e.target.value,
                              })
                            }
                            required
                          />
                          <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating account...
                              </>
                            ) : (
                              "Register"
                            )}
                          </Button>
                          <span className="text-sm text-center text-gray-300">
                            Already have an account?{" "}
                            <button
                              type="button"
                              onClick={() => setIsLogin(true)}
                              className="text-white cursor-pointer hover:underline"
                            >
                              Login
                            </button>
                          </span>
                        </form>
                      </div>
                    </React.Fragment>
                  )}
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

const UserMenu = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const [isProfileDialogOpen, setIsProfileDialogOpen] = React.useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
  };

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        overlay={false}
        close={false}
        className="w-70 h-fit absolute right-5 top-16 border rounded-xl bg-background/80"
      >
        <SheetTitle className="hidden">User Menu</SheetTitle>

        <div className="flex flex-col items-start p-1 gap-1">
          <div className="flex items-center gap-3 w-full p-2 hover:bg-foreground/10 rounded-xl cursor-pointer">
            <Avatar className="cursor-pointer h-10 w-10">
              <AvatarFallback className="bg-primary text-primary-foreground">
                <Image
                  src={user?.profileImageUrl || "/images/avatar1.jpg"}
                  alt={user?.name || "User Avatar"}
                  width={32}
                  height={32}
                  className="rounded-full w-full h-full"
                />
              </AvatarFallback>
              {user?.profileImageUrl && (
                <AvatarImage src={user.profileImageUrl} alt={user.name} />
              )}
            </Avatar>
            <div className="flex flex-col">
              <span className="font-bold">{user?.name}</span>
              <span className="text-xs text-gray-300 font-semibold">
                {user?.email}
              </span>
            </div>
          </div>
          <Separator />
          <div className="flex flex-col w-full">
            <button
              onClick={() => setIsProfileDialogOpen(true)}
              className="flex text-sm font-semibold items-center gap-2 p-2 hover:bg-foreground/10 rounded-md w-full text-left"
            >
              <User className="h-4 w-4" />
              <span>View Profile</span>
            </button>
            <button
              onClick={() => setIsSettingsDialogOpen(true)}
              className="flex text-sm font-semibold items-center gap-2 p-2 hover:bg-foreground/10 rounded-md w-full text-left"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex text-sm font-semibold items-center gap-2 p-2 hover:bg-foreground/10 rounded-md w-full text-left"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </SheetContent>

      <ProfileDialog
        open={isProfileDialogOpen}
        onOpenChange={setIsProfileDialogOpen}
        user={user}
      />

      <SettingsDialog
        open={isSettingsDialogOpen}
        onOpenChange={setIsSettingsDialogOpen}
        user={user}
      />
    </Sheet>
  );
};
