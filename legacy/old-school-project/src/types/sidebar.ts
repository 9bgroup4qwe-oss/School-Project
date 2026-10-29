export interface NavItem {
  id: string;
  label: string;
  icon: 'home' | 'bar-chart' | 'check-square' | 'clock' | 'settings' | 'help-circle';
  href: string;
  isActive?: boolean;
}

export interface SidebarUser {
  name: string;
  handle: string;
  email?: string;
  avatar_url?: string | null;
}

export interface SidebarProps {
  activeItem?: string;
  user?: SidebarUser;
}