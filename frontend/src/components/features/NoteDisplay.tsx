import React from "react";
import { AtSign } from "lucide-react";
import type { User, ProjectNote } from "../../types/project";

interface NoteDisplayProps {
  note: ProjectNote & {
    image?: string;
    mentioned_users?: User[];
  };
  formatDate: (dateString: string) => string;
}

export const NoteDisplay: React.FC<NoteDisplayProps> = ({
  note,
  formatDate,
}) => {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-xs font-medium text-primary-700 mr-3">
            {note.author.first_name[0]}
            {note.author.last_name[0]}
          </div>
          <div>
            <span className="font-medium text-gray-900">
              {note.author.first_name} {note.author.last_name}
            </span>
            <span className="text-sm text-gray-500 ml-2">
              {formatDate(note.created_at)}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {note.is_internal && (
            <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
              Internal
            </span>
          )}
        </div>
      </div>

      {/* Note Content */}
      {note.content && (
        <div className="text-gray-700 whitespace-pre-wrap mb-3">
          {note.content}
        </div>
      )}

      {/* Image */}
      {note.image && (
        <div className="mb-3">
          <img
            src={note.image}
            alt="Note attachment"
            className="max-w-full h-auto rounded-lg border max-h-64 object-cover cursor-pointer"
            onClick={() => {
              // Open image in new tab for full view
              window.open(note.image, "_blank");
            }}
          />
        </div>
      )}

      {/* Mentioned Users */}
      {note.mentioned_users && note.mentioned_users.length > 0 && (
        <div className="border-t pt-3 mt-3">
          <div className="text-sm text-gray-600 mb-2">Mentioned:</div>
          <div className="flex flex-wrap gap-2">
            {note.mentioned_users.map((user) => (
              <span
                key={user.id}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700"
              >
                <AtSign className="h-3 w-3 mr-1" />
                {user.first_name} {user.last_name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
