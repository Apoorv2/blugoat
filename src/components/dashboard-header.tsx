/* eslint-disable react-dom/no-missing-button-type */
'use client';

import { Menu } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

type ClerkUser = {
  id?: string;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string;
  primaryEmailAddress?: {
    emailAddress?: string;
  } | null;
  primaryPhoneNumber?: {
    phoneNumber?: string;
  } | null;
};

// Define a simplified router interface:
type Router = {
  push: (path: string) => void;
};

type DashboardHeaderProps = {
  locale: string;
  user: ClerkUser | null | undefined;
  signOut: any;
  router: Router; // Use the simplified interface
};

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  locale,
  user,
  signOut,
  router,
}) => {
  const handleSignOut = () => {
    signOut?.();
    router.push(`/${locale}/sign-in`);
  };

  const userInitials = user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`
    : user?.firstName?.[0] || 'U';

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-white">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center">
          <Link href="/" className="mr-4">
            <Image
              src="/blugoatLogo.png"
              alt="Bluegoat Logo"
              width={180}
              height={180}
              className="h-12 w-auto"
            />
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <nav className="hidden md:flex">
            <ul className="flex space-x-4">
              <li>
                <Link href={`/${locale}/audience-query`} className="px-3 py-2 text-sm font-medium text-blue-600">
                  Find Audience
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/support`} className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600">
                  Support
                </Link>
              </li>
            </ul>
          </nav>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative size-8 rounded-full">
                <Avatar className="size-8">
                  <AvatarImage src={user?.imageUrl} alt="Profile" />
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href="#" className="flex w-full items-center">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="#" className="flex w-full items-center">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="ghost" className="md:hidden">
                <Menu className="size-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="grid gap-6 text-lg font-medium">
                <Link href={`/${locale}/audience-query`} className="hover:text-blue-600">
                  Find Audience
                </Link>
                <Link href={`/${locale}/support`} className="hover:text-blue-600">
                  Support
                </Link>
                <Link href="#" className="hover:text-blue-600">
                  Profile
                </Link>
                <Link href="#" className="hover:text-blue-600">
                  Settings
                </Link>
                <button onClick={handleSignOut} className="text-left text-red-600 hover:text-red-700">
                  Log out
                </button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
