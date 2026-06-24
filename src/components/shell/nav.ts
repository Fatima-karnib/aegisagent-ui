import {
  LayoutDashboard,
  Bot,
  ScrollText,
  Swords,
  ShieldCheck,
  Radar,
  Inbox,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  match?: (path: string) => boolean;
  badgeKey?: "reviews" | "shadow";
}

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard, match: (p) => p === "/" },
  { label: "Agents", href: "/agents", icon: Bot },
  { label: "Policy Studio", href: "/policies", icon: ScrollText },
  { label: "Red Team", href: "/red-team", icon: Swords },
  { label: "Compliance", href: "/compliance", icon: ShieldCheck },
  { label: "Shadow Radar", href: "/shadow-radar", icon: Radar, badgeKey: "shadow" },
  { label: "Review Queue", href: "/reviews", icon: Inbox, badgeKey: "reviews" },
  { label: "Settings", href: "/settings", icon: Settings },
];
