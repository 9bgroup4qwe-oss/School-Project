'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, BarChart3, CheckSquare, Clock, Settings, HelpCircle, LogOut, User, Sparkles } from 'lucide-react';
import { SidebarNavItem } from '@/components/ui/SidebarNavItem';
import { createClient } from '@/lib/supabase/client';
import type { NavItem, SidebarUser } from '@/types/sidebar';

interface AuthenticatedSidebarProps {
  activeItem?: string;
}

export function AuthenticatedSidebar({ activeItem = 'dashboard' }: AuthenticatedSidebarProps) {
  const [user, setUser] = useState<SidebarUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          const userData: SidebarUser = {
            name: session.user.user_metadata?.display_name || session.user.user_metadata?.username || 'Student',
            handle: `@${session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'student'}`,
            email: session.user.email || '',
            avatar_url: session.user.user_metadata?.avatar_url || null
          };
          setUser(userData);
        }
      } catch (error) {
        console.error('Error fetching user for sidebar:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const userData: SidebarUser = {
            name: session.user.user_metadata?.display_name || session.user.user_metadata?.username || 'Student',
            handle: `@${session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'student'}`,
            email: session.user.email || '',
            avatar_url: session.user.user_metadata?.avatar_url || null
          };
          setUser(userData);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = '/auth';
    } catch (error) {
      console.error('Error signing out:', error);
      window.location.href = '/auth';
    }
  };

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'home',
      href: '/dashboard',
      isActive: activeItem === 'dashboard'
    },
    {
      id: 'quizzer',
      label: 'Quiz Generator',
      icon: 'check-square',
      href: '/quizzer',
      isActive: activeItem === 'quizzer'
    },
    {
      id: 'timetable',
      label: 'Timetable & Plan',
      icon: 'clock',
      href: '/timetable',
      isActive: activeItem === 'timetable'
    }
  ];

  const bottomNavItems: NavItem[] = [
    {
      id: 'settings',
      label: 'Settings',
      icon: 'settings',
      href: '/settings'
    }
  ];

  if (isLoading) {
    return (
      <aside className="hidden lg:block w-64 sidebar-dark rounded-2xl p-6 mr-6 flex-shrink-0 relative">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-800 rounded mb-2"></div>
          <div className="h-4 bg-gray-800 rounded w-3/4 mb-8"></div>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-800 rounded"></div>
            ))}
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="hidden lg:block w-64 sidebar-dark rounded-2xl p-6 mr-6 flex-shrink-0 relative">
      {/* Brand Header */}
      <div className="mb-8 pb-4 border-b border-gray-800">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-slate-950 font-black shadow-md shadow-yellow-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-slate-950" />
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight group-hover:text-yellow-400 transition-colors">
            GrowMyIQ
          </h1>
        </Link>

        {user && (
          <div className="mt-4 p-2.5 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{user.name}</p>
                <p className="text-[11px] text-gray-400 truncate">{user.handle}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="space-y-1.5">
        {navItems.map((item) => (
          <SidebarNavItem
            key={item.id}
            icon={
              item.icon === 'home' ? Home :
              item.icon === 'bar-chart' ? BarChart3 :
              item.icon === 'check-square' ? CheckSquare :
              Clock
            }
            label={item.label}
            href={item.href}
            isActive={item.isActive}
          />
        ))}
      </nav>

      {/* Bottom Settings & Sign Out */}
      <div className="absolute bottom-0 left-0 w-64 p-6 pt-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200 group"
        >
          <LogOut size={18} className="group-hover:text-red-400 transition-colors" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}