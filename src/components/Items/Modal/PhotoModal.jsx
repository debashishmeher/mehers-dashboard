import React, { useState } from "react";
import Cookies from "js-cookie";

export default function UploadPhotoModal({ cardId, role, onClose, onSubmit }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    if (!selected.type.startsWith("image/")) {
      setErrorMessage("Only image files (JPG/PNG) are allowed.");
      setFile(null);
      setPreviewUrl(null);
      return;
    }

    setFile(selected);
    setErrorMessage("");

    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(selected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setErrorMessage("Please select an image to upload.");
      return;
    }

    const authToken = Cookies.get("authToken");
    setIsSubmitting(true);
    setErrorMessage("");

    let url =
      role === "admin"
        ? `${import.meta.env.VITE_API_URL}/api/admin/card/${cardId}/image`
        : `${import.meta.env.VITE_API_URL}/api/user/card/${cardId}/image`;

    try {
      const formData = new FormData();
      formData.append("photo", file);

      const response = await fetch(url, {
        method: "PATCH",
        headers: { Authorization: `${authToken}` },
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.message || "Failed to upload photo");
      }

      const result = await response.json();
      const uploadedFile = result?.data?.photo;

      if (onSubmit) onSubmit(uploadedFile);
      onClose();
    } catch (err) {
      console.error("Error uploading photo:", err.message);
      setErrorMessage(err.message || "Something went wrong, please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-[9999] backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-fadeIn">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b pb-3">
          <h2 className="text-lg font-semibold text-gray-800">Upload Photo</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            &times;
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="file"
              accept=".png,.jpg,.jpeg"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-50 file:text-[#2563EB] hover:file:bg-green-100 cursor-pointer"
            />
            {errorMessage && (
              <p className="text-xs text-red-500 mt-1">{errorMessage}</p>
            )}
          </div>

          {/* Full-width Preview */}
          {file && previewUrl && (
            <div className="mt-4 border rounded-lg bg-gray-50 overflow-hidden">
              <img
                src={previewUrl}
                alt="Photo Preview"
                className="w-full h-auto object-contain bg-white"
              />
              <div className="p-3 border-t bg-gray-100">
                <p className="text-sm font-medium text-gray-700">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-[#2563EB] font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-6 py-2 rounded-lg font-medium text-white bg-[#2563EB] transition ${
                isSubmitting
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-blue-700"
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Uploading..." : "Upload"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
