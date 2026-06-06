import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import {
  LayoutDashboard, ArrowUpDown, PiggyBank, Target,
  CalendarDays, BarChart3, Wallet, Settings, LogOut,
  Menu, X, ChevronLeft, Plus, Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/transactions', label: 'Transactions', icon: ArrowUpDown },
  { path: '/budgets', label: 'Budgets', icon: PiggyBank },
  { path: '/goals', label: 'Goals', icon: Target },
  { path: '/accounts', label: 'Accounts', icon: Wallet },
  { path: '/calendar', label: 'Calendar', icon: CalendarDays },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
];

function NavContent({ collapsed, onNavigate }) {
  const location = useLocation();
  const { user } = useAuth();
  
  return (
    <div className="flex flex-col h-full">
      <div className={cn("p-4 flex items-center gap-3", collapsed && "justify-center")}>
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
          <span className="text-primary-foreground font-display font-bold text-sm">SF</span>
        </div>
        {!collapsed && <span className="font-display font-bold text-lg text-sidebar-foreground">SmartFinance</span>}
      </div>

      <nav className="flex-1 px-3 py-2 space-y-1">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-primary/20"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                collapsed && "justify-center px-2"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <Link
          to="/settings"
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors",
            collapsed && "justify-center px-2"
          )}
        >
          <Settings className="w-5 h-5" />
          {!collapsed && <span>Settings</span>}
        </Link>
        {!collapsed && user && (
          <div className="flex items-center gap-3 px-3 py-2.5 mt-1">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-sidebar-accent text-sidebar-foreground text-xs">
                {(user.full_name || user.email || '?')[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-sidebar-foreground truncate">{user.full_name || 'User'}</p>
              <p className="text-xs text-sidebar-foreground/50 truncate">{user.email}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <aside className={cn(
        "hidden lg:flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-[68px]" : "w-64"
      )}>
        <NavContent collapsed={collapsed} onNavigate={() => {}} />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute bottom-20 -right-3 w-6 h-6 bg-sidebar-accent border border-sidebar-border rounded-full hidden lg:flex items-center justify-center text-sidebar-foreground/60 hover:text-sidebar-foreground z-10"
          style={{ left: collapsed ? '56px' : '248px' }}
        >
          <ChevronLeft className={cn("w-3.5 h-3.5 transition-transform", collapsed && "rotate-180")} />
        </button>
      </aside>

      {/* Mobile sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-72 bg-sidebar border-sidebar-border">
          <NavContent collapsed={false} onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 border-b border-border flex items-center px-4 gap-3 bg-card/50 backdrop-blur-sm flex-shrink-0">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex-1" />
          <Link to="/transactions/new">
            <Button size="sm" className="gap-1.5 rounded-xl shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Transaction</span>
            </Button>
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}