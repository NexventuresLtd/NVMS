import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { hasGroup } from "../utils/auth";

interface GroupPermissionProps {
  group: string;
  children: React.ReactNode;
}

export const GroupPermission: React.FC<GroupPermissionProps> = ({
  group,
  children,
}) => {
  const { user } = useAuth();

  if (
    !hasGroup({ user: user, groupName: group }) &&
    !hasGroup({ user: user, groupName: "Admin" })
  )
    return null;

  return <>{children}</>;
};
