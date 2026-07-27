import React from 'react';
import { cn } from '@/lib/utils';
import {
  Home,
  BarChart3,
  CheckSquare,
  Clock,
  Settings,
  HelpCircle,
  LucideIcon
} from 'lucide-react';

interface SidebarNavItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
  isActive?: boolean;
  isBottom?: boolean;
}

const iconMap = {
  home: Home,
  'bar-chart': BarChart3,
  'check-square': CheckSquare,
  clock: Clock,
  settings: Settings,
  'help-circle': HelpCircle,
};

export function SidebarNavItem({
  icon: Icon,
  label,
  href,
  isActive = false,
  isBottom = false
}: SidebarNavItemProps) {
  return (
    <a
      href={href}
      className={cn(
        'flex items-center p-3 rounded-lg transition-all',
        isActive
          ? 'bg-secondary text-primary font-semibold shadow-md'
          : isBottom
          ? 'text-muted-foreground hover:text-foreground'
          : 'text-foreground hover:bg-accent'
      )}
    >
      <Icon className="w-5 h-5 mr-3" />
      {label}
    </a>
  );
}