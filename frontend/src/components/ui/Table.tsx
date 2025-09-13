import React from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
  className?: string;
}

interface TableProps {
  columns: TableColumn[];
  data: any[];
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (column: string) => void;
  className?: string;
}

export const Table: React.FC<TableProps> = ({
  columns,
  data,
  sortBy,
  sortOrder,
  onSort,
  className = "",
}) => {
  const handleSort = (column: TableColumn) => {
    if (column.sortable && onSort) {
      onSort(column.key);
    }
  };

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                  column.sortable ? "cursor-pointer hover:bg-gray-100" : ""
                } ${column.className || ""}`}
                onClick={() => handleSort(column)}
              >
                <div className="flex items-center space-x-1">
                  <span>{column.label}</span>
                  {column.sortable && (
                    <div className="flex flex-col">
                      <ChevronUp
                        className={`h-3 w-3 ${
                          sortBy === column.key && sortOrder === "asc"
                            ? "text-primary-600"
                            : "text-gray-400"
                        }`}
                      />
                      <ChevronDown
                        className={`h-3 w-3 -mt-1 ${
                          sortBy === column.key && sortOrder === "desc"
                            ? "text-primary-600"
                            : "text-gray-400"
                        }`}
                      />
                    </div>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, index) => (
            <tr key={index} className="hover:bg-gray-50">
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`px-6 py-4 whitespace-nowrap text-sm ${
                    column.className || ""
                  }`}
                >
                  {column.render
                    ? column.render(row[column.key], row)
                    : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
