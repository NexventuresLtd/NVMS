import type { NavItem, SubmenuItem } from "../components/Sidebar";
import type { User } from "../contexts/AuthContext";

interface hasGroupParams {
  user: User | null | undefined;
  groupName: string;
}

export function hasGroup({user, groupName}: hasGroupParams): boolean | undefined {
  return user?.groupNames?.includes(groupName);
}

export function filterNavigationByGroups(
  navigation: NavItem[],
  userGroups: string[]
): NavItem[] {
  return navigation
    .filter(
      (item) =>
        !item.requiredGroups ||
        item.requiredGroups.some((group) => userGroups.includes(group))
    )
    .map((item) => ({
      ...item,
      submenu: item.submenu
        ? filterSubmenu(item.submenu, userGroups)
        : undefined,
    }));
}

function filterSubmenu(
  submenu: SubmenuItem[],
  userGroups: string[]
): SubmenuItem[] {
  return submenu.filter(
    (item) =>
      !item.requiredGroups ||
      item.requiredGroups.some((group) => userGroups.includes(group))
  );
}

