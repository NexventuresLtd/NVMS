import React, { useState, useRef, useEffect } from "react";
import { Search, X, ChevronDown, Loader2 } from "lucide-react";
import { api } from "../lib/api";

interface Option {
  id: string | number;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  emptyLabel?: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
  searchUrl?: string;
  onSearchResults?: (results: Option[]) => void;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Search...",
  emptyLabel = "No selection",
  disabled = false,
  className = "",
  required = false,
  searchUrl = "/projects/",
  onSearchResults,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get selected option label
  const [selectedOption, setSelectedOption] = useState(
    options.find((opt) => opt.id.toString() === value.toString())
  );
  const selectedLabel = selectedOption ? selectedOption.label : emptyLabel;

  useEffect(() => {
    const fetchSelectedOption = async () => {
      if (!selectedOption && value) {
        const response = await api.get(`${searchUrl}${value}`);
        filteredOptions.push({
          id: value,
          label:
            response.data.title || response.data.name || response.data.label,
        });
        setFilteredOptions([...filteredOptions]);
        setSelectedOption({
          id: value,
          label:
            response.data.title || response.data.name || response.data.label,
        });
      }
    };
    fetchSelectedOption();
  });

  // Filter options based on search query
  useEffect(() => {
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim() === "") {
      setFilteredOptions(options);
      setIsSearching(false);
      return;
    }

    const query = searchQuery.toLowerCase();
    const localFiltered = options.filter((option) =>
      option.label.toLowerCase().includes(query)
    );

    // If we have local results, show them immediately
    if (localFiltered.length > 0) {
      setFilteredOptions(localFiltered);
      setIsSearching(false);
      return;
    }

    // No local results, search via API with debounce
    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await api.get(
          `${searchUrl}?search=${encodeURIComponent(searchQuery)}`
        );

        const data = response.data;
        const apiResults: Option[] = data.results.map((item: any) => ({
          id: item.id,
          label: item.title || item.name || item.label,
        }));

        setFilteredOptions(apiResults);

        // Notify parent component of new options if callback provided
        if (onSearchResults && apiResults.length > 0) {
          onSearchResults(apiResults);
        }
      } catch (error) {
        console.error("Search error:", error);
        setFilteredOptions([]);
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms debounce

    // Cleanup timeout on unmount or query change
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, options, searchUrl, onSearchResults]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (optionId: string | number) => {
    onChange(optionId);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setSearchQuery("");
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full px-3 py-2 text-left border border-gray-300 rounded-lg
          focus:ring-primary-500 focus:border-primary-500
          bg-white flex items-center justify-between
          ${
            disabled
              ? "bg-gray-100 cursor-not-allowed"
              : "hover:bg-gray-50 cursor-pointer"
          }
          ${!value && required ? "border-red-300" : ""}
        `}
      >
        <span className={value ? "text-gray-900" : "text-gray-500"}>
          {selectedLabel}
        </span>
        <div className="flex items-center gap-1">
          {value && !disabled && (
            <X
              className="h-4 w-4 text-gray-400 hover:text-gray-600"
              onClick={handleClear}
            />
          )}
          <ChevronDown
            className={`h-4 w-4 text-gray-400 transition-transform ${
              isOpen ? "transform rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-48 overflow-y-auto">
            {isSearching ? (
              <div className="px-3 py-8 flex flex-col items-center justify-center text-sm text-gray-500">
                <Loader2 className="h-5 w-5 animate-spin mb-2" />
                <span>Searching...</span>
              </div>
            ) : filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">
                No results found
              </div>
            ) : (
              <>
                {/* Empty option */}
                {!required && (
                  <button
                    type="button"
                    onClick={() => handleSelect("")}
                    className={`
                      w-full px-3 py-2 text-left text-sm hover:bg-gray-100
                      ${
                        !value
                          ? "bg-primary-50 text-primary-700"
                          : "text-gray-700"
                      }
                    `}
                  >
                    {emptyLabel}
                  </button>
                )}

                {/* Filtered options */}
                {filteredOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelect(option.id)}
                    className={`
                      w-full px-3 py-2 text-left text-sm hover:bg-gray-100
                      ${
                        value.toString() === option.id.toString()
                          ? "bg-primary-50 text-primary-700 font-medium"
                          : "text-gray-700"
                      }
                    `}
                  >
                    {option.label}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
