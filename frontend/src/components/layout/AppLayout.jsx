import React from 'react';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import PageHeader from './PageHeader';

export default function AppLayout({ children }) {
  return (
    <div className="h-screen w-full bg-background flex flex-col md:flex-row antialiased overflow-hidden">
      {/* Desktop Fixed Sidebar: Always 100% height, anchored on the left */}
      <Sidebar />

      {/* Main Content Area: Scrollable internally on desktop and mobile */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto overflow-x-hidden">
        <PageHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-12 max-w-[1100px] w-full mx-auto min-w-0">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
}
