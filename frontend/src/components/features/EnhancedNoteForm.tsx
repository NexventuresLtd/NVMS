import React, { useState } from "react";
import { Plus, Image as ImageIcon, AtSign } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { ImageUpload } from "../../components/ui/ImageUpload";
import { UserMention } from "../../components/ui/UserMention";
import type { User } from "../../types/project";

interface EnhancedNoteFormProps {
  onSubmit: (noteData: {
    content: string;
    image?: File;
    mentionedUsers: User[];
  }) => Promise<void>;
  users: User[];
  isSubmitting?: boolean;
  placeholder?: string;
}

export const EnhancedNoteForm: React.FC<EnhancedNoteFormProps> = ({
  onSubmit,
  users,
  isSubmitting = false,
  placeholder = "Add a note...",
}) => {
  const [noteContent, setNoteContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>("");
  const [mentionedUsers, setMentionedUsers] = useState<User[]>([]);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showUserMention, setShowUserMention] = useState(false);

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreviewUrl(previewUrl);
  };

  const handleImageRemove = () => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setSelectedImage(null);
    setImagePreviewUrl("");
    setShowImageUpload(false);
  };

  const handleUserMention = (user: User) => {
    if (!mentionedUsers.find((u) => u.id === user.id)) {
      setMentionedUsers([...mentionedUsers, user]);
    }
  };

  const handleRemoveUser = (userId: number) => {
    setMentionedUsers(mentionedUsers.filter((u) => u.id !== userId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!noteContent.trim() && !selectedImage) {
      return;
    }

    try {
      await onSubmit({
        content: noteContent.trim(),
        image: selectedImage || undefined,
        mentionedUsers,
      });

      // Reset form
      setNoteContent("");
      handleImageRemove();
      setMentionedUsers([]);
      setShowImageUpload(false);
      setShowUserMention(false);
    } catch (error) {
      console.error("Failed to submit note:", error);
    }
  };

  const isFormValid = noteContent.trim() || selectedImage;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Main textarea */}
      <div>
        <textarea
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
        />
      </div>

      {/* User Mention */}
      {showUserMention && (
        <UserMention
          users={users}
          onMention={handleUserMention}
          selectedUsers={mentionedUsers}
          onRemoveUser={handleRemoveUser}
          placeholder="Type @ to mention users..."
        />
      )}

      {/* Image Upload */}
      {showImageUpload && (
        <ImageUpload
          onImageSelect={handleImageSelect}
          onImageRemove={handleImageRemove}
          previewUrl={imagePreviewUrl}
          className="mt-3"
        />
      )}

      {/* Action buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowImageUpload(!showImageUpload)}
            className={showImageUpload ? "bg-primary-50 text-primary-600" : ""}
          >
            <ImageIcon className="h-4 w-4 mr-1" />
            Image
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowUserMention(!showUserMention)}
            className={showUserMention ? "bg-primary-50 text-primary-600" : ""}
          >
            <AtSign className="h-4 w-4 mr-1" />
            Mention
          </Button>
        </div>

        <Button type="submit" disabled={isSubmitting || !isFormValid} size="sm">
          {isSubmitting ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-1" />
              Add Note
            </>
          )}
        </Button>
      </div>

      {/* Show mentioned users summary */}
      {mentionedUsers.length > 0 && !showUserMention && (
        <div className="text-sm text-gray-600">
          Will notify:{" "}
          {mentionedUsers
            .map((u) => `${u.first_name} ${u.last_name}`)
            .join(", ")}
        </div>
      )}
    </form>
  );
};
