import {
  Home,
  Briefcase,
  FolderOpen,
  Wallet,
  BarChart2,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Receipt,
  DollarSign,
  PiggyBank,
  Tags,
  MessageSquare,
  Megaphone,
  Users,
} from "lucide-react";
import type { NavItem } from "../components/Sidebar";

export const navItems: NavItem[] = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    {
      name: "Project Management",
      icon: FolderOpen,
      hasSubmenu: true,
      requiredGroups: ["Project Managers", "Admin"],
      submenu: [
        { name: "Projects", href: "/projects", icon: Briefcase },
        { name: "Portfolio Admin", href: "/admin/portfolio", icon: Briefcase },
        { name: "Public Portfolio", href: "/portfolio", icon: FolderOpen },
      ],
    },
    {
      name: "Finance",
      icon: Wallet,
      hasSubmenu: true,
      requiredGroups: ["Finance Managers", "Finance Viewers", "Admin"],
      submenu: [
        { name: "Overview", href: "/wallet/dashboard", icon: BarChart2 },
        { name: "Wallets", href: "/wallet/accounts", icon: CreditCard },
        { name: "Income", href: "/wallet/income", icon: TrendingUp },
        { name: "Expenses", href: "/wallet/expenses", icon: TrendingDown },
        { name: "Subscriptions", href: "/wallet/subscriptions", icon: Receipt },
        { name: "Budgets", href: "/wallet/budgets", icon: DollarSign },
        { name: "Savings Goals", href: "/wallet/goals", icon: PiggyBank },
        { name: "Categories", href: "/wallet/categories", icon: Tags },
      ],
    },
    {
      name: "Messages",
      href: "/messages",
      icon: MessageSquare,
      disabled: true,
    },
    { name: "Bulletin", href: "/bulletin", icon: Megaphone, disabled: true },
    { name: "Team", href: "/team", icon: Users, disabled: true },
  ];
