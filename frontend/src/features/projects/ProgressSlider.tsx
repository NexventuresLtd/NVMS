import React, { useState } from "react";
import projectsApi from "../../services/projectsApi";

interface ProgressSliderProps {
  projectId: string;
  currentProgress: number;
  manualProgress?: number;
  canEdit: boolean;
  onProgressUpdate: (newProgress: number) => void;
}

export const ProgressSlider: React.FC<ProgressSliderProps> = ({
  projectId,
  currentProgress,
  manualProgress,
  canEdit,
  onProgressUpdate,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditingProgress, setIsEditingProgress] = useState(false);
  const [localProgress, setLocalProgress] = useState(
    manualProgress ?? currentProgress
  );

  const handleProgressChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newProgress = parseInt(e.target.value);
    setLocalProgress(newProgress);
  };

  const handleProgressSubmit = async () => {
    if (!canEdit || localProgress === manualProgress) return;

    try {
      setIsUpdating(true);
      await projectsApi.updateProgress(projectId, localProgress);
      onProgressUpdate(localProgress);
      setIsEditingProgress(false); // Close editing after successful update
    } catch (err) {
      console.error("Failed to update progress:", err);
      // Reset to previous value on error
      setLocalProgress(manualProgress ?? currentProgress);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleProgressBarClick = () => {
    if (canEdit) {
      setIsEditingProgress(true);
    }
  };

  const handleCancelEdit = () => {
    setLocalProgress(manualProgress ?? currentProgress);
    setIsEditingProgress(false);
  };

  const isManuallySet = manualProgress !== null && manualProgress !== undefined;

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div
        className={`w-full bg-gray-200 rounded-full h-3 ${
          canEdit ? "cursor-pointer hover:bg-gray-300 transition-colors" : ""
        }`}
        onClick={handleProgressBarClick}
        title={canEdit ? "Click to edit progress" : undefined}
      >
        <div
          className={`h-3 rounded-full transition-all duration-300 bg-accent-dark`}
          style={{ width: `${localProgress}%` }}
        />
      </div>

      {/* Progress Info */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          {localProgress}%
          {isManuallySet && (
            <span className="text-xs text-gray-500 ml-1">(manual)</span>
          )}
        </span>
        {canEdit && !isEditingProgress && (
          <button
            onClick={() => setIsEditingProgress(true)}
            className="text-xs text-primary-600 hover:text-primary-700"
          >
            Edit Progress
          </button>
        )}
      </div>

      {/* Editing Controls - Only show when editing */}
      {isEditingProgress && canEdit ? (
        <div className="space-y-3 p-4 bg-gray-50 rounded-lg border">
          {/* Range Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Adjust Progress
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={localProgress}
              onChange={handleProgressChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              disabled={isUpdating}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Progress will be updated to {localProgress}%
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleCancelEdit}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                disabled={isUpdating}
              >
                Cancel
              </button>
              <button
                onClick={handleProgressSubmit}
                disabled={
                  isUpdating ||
                  localProgress === (manualProgress ?? currentProgress)
                }
                className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {isUpdating ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Status Message - Only show when not editing */
        !canEdit && (
          <p className="text-sm text-gray-500">
            {isManuallySet
              ? "Progress manually set by supervisor or assignee"
              : "Progress auto-calculated based on project status"}
          </p>
        )
      )}
    </div>
  );
};
