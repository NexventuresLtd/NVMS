import React, { useState, useRef, useEffect } from "react";
import { AtSign, X } from "lucide-react";
import type { User } from "../../types/project";

interface UserMentionProps {
  users: User[];
  onMention: (user: User) => void;
  selectedUsers: User[];
  onRemoveUser: (userId: number) => void;
  placeholder?: string;
  className?: string;
}

export const UserMention: React.FC<UserMentionProps> = ({
  users,
  onMention,
  selectedUsers,
  onRemoveUser,
  placeholder = "Type @ to mention users...",
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter users based on search term and exclude already selected users
  useEffect(() => {
    const selectedUserIds = selectedUsers.map((u) => u.id);
    const availableUsers = users.filter(
      (user) => !selectedUserIds.includes(user.id)
    );

    if (searchTerm.length > 0) {
      const filtered = availableUsers.filter(
        (user) =>
          user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(availableUsers.slice(0, 10)); // Show first 10 users
    }
    setSelectedIndex(0);
  }, [searchTerm, users, selectedUsers]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.includes("@")) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          Math.min(prev + 1, filteredUsers.length - 1)
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (filteredUsers[selectedIndex]) {
          handleUserSelect(filteredUsers[selectedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  const handleUserSelect = (user: User) => {
    onMention(user);
    setSearchTerm("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleFocus = () => {
    if (searchTerm.includes("@")) {
      setIsOpen(true);
    }
  };

  const handleBlur = () => {
    // Delay closing to allow for clicks on dropdown items
    setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Selected Users Tags */}
      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedUsers.map((user) => (
            <span
              key={user.id}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700"
            >
              <AtSign className="h-3 w-3 mr-1" />
              {user.first_name} {user.last_name}
              <button
                type="button"
                onClick={() => onRemoveUser(user.id)}
                className="ml-1 text-primary-500 hover:text-primary-700"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />

        {/* Dropdown */}
        {isOpen && filteredUsers.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto"
          >
            {filteredUsers.map((user, index) => (
              <button
                key={user.id}
                type="button"
                onClick={() => handleUserSelect(user)}
                className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center ${
                  index === selectedIndex ? "bg-primary-50" : ""
                }`}
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-xs font-medium text-primary-700 mr-3">
                    {user.first_name[0]}
                    {user.last_name[0]}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {user.first_name} {user.last_name}
                    </div>
                    {user.email && (
                      <div className="text-sm text-gray-500">{user.email}</div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
