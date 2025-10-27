import React from "react";
import type { RouteObject } from "react-router-dom";
import WalletDashboard from "../features/wallet/pages/WalletDashboard";
import WalletAccounts from "../features/wallet/pages/WalletAccounts";
import Income from "../features/wallet/pages/Income";
import Expenses from "../features/wallet/pages/Expenses";
import Subscriptions from "../features/wallet/pages/Subscriptions";
import Budgets from "../features/wallet/pages/Budgets";
import SavingsGoals from "../features/wallet/pages/SavingsGoals";
import Categories from "../features/wallet/pages/Categories";

export const walletRoutes: RouteObject[] = [
  {
    path: "/wallet/dashboard",
    element: <WalletDashboard />,
  },
  {
    path: "/wallet/accounts",
    element: <WalletAccounts />,
  },
  {
    path: "/wallet/income",
    element: <Income />,
  },
  {
    path: "/wallet/expenses",
    element: <Expenses />,
  },
  {
    path: "/wallet/subscriptions",
    element: <Subscriptions />,
  },
  {
    path: "/wallet/budgets",
    element: <Budgets />,
  },
  {
    path: "/wallet/goals",
    element: <SavingsGoals />,
  },
  {
    path: "/wallet/categories",
    element: <Categories />,
  },
];
