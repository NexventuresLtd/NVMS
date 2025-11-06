import type { NavItem, SubmenuItem } from "../components/Sidebar";
import type { User } from "../contexts/AuthContext";

interface hasGroupParams {
  user: User
  groupName: string;
}

export function hasGroup({user, groupName}: hasGroupParams): boolean | undefined {
  return user?.groupNames?.includes(groupName);
}

export function filterNavigationByGroups(
  navigation: NavItem[],
  userGroups: string[]
): NavItem[] | SubmenuItem[] {
  return navigation
    .filter(
      (item) =>
        !item.requiredGroups ||
        item.requiredGroups.some((group) => userGroups.includes(group))
    )
    .map((item) => ({
      ...item,
      submenu: item.submenu
        ? filterNavigationByGroups(item.submenu, userGroups)
        : undefined,
    }));
}

