import React from "react";

const PresetToggle = ({ 
  presetToDelete, 
  setShowDeleteModal, 
  handleDeletePreset,
  title = "Delete Coupon",
  message = "Are you sure you want to delete this coupon?"
}) => {
  if (!presetToDelete) return null;

  const handleCancel = () => {
    setShowDeleteModal(false);
  };

  const handleConfirmDelete = async () => {

    console.log(presetToDelete);
    
    await handleDeletePreset(presetToDelete.crossBrand);
    setShowDeleteModal(false);
  };

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">{title}</h2>
        <p className="text-sm text-gray-700 mb-6">
          {message}
        </p>
        {presetToDelete && (
          <div className="bg-gray-50 p-3 rounded-md mb-4">
            <p className="text-sm font-medium text-gray-800">
              {presetToDelete.preset.presetName || presetToDelete.name || "Untitled Coupon"}
            </p>
          </div>
        )}
        <div className="flex justify-end gap-4">
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg shadow-sm transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmDelete}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default PresetToggle;