import Link from 'next/link';
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Bell, Calendar, Home, Package, Package2, Settings, ShoppingCart } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

export default function Sidebar() {
  return (
    <div className="hidden border-r bg-white md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Package2 className="h-6 w-6" />
            <span className="">Wellness spa</span>
          </Link>
         
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900"
            >
              <Home className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/dashboard/bookings"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900"
            >
              <ShoppingCart className="h-4 w-4" />
              Bookings
              <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                6
              </Badge>
            </Link>
            <Link
              href="/dashboard/services"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900"
            >
              <Package className="h-4 w-4" />
              Services
            </Link>
            <Link
              href="/dashboard/availability"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900"
            >
              <Calendar className="h-4 w-4" />
              Availability
            </Link>
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </nav>
        </div>
        <div className="mt-auto p-4">
          <Card className='py-2'>
            <CardHeader className="p-2 pt-0 md:p-4">
              <CardTitle>Upgrade to Pro</CardTitle>
              <CardDescription>
                Unlock all features and get unlimited access to our support
                team.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
              <Button size="sm" className="w-full">
                Upgrade
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
