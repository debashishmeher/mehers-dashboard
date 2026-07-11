import React, { useState } from "react";
import { getCookie } from "../../../utils/auth";
import { FaFilePdf, FaFileImage } from "react-icons/fa";

export default function UploadBrochureModal({
  cardId,
  role,
  onClose,
  onSubmit,
}) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    // ✅ Only allow image or PDF
    if (
      !selected.type.startsWith("image/") &&
      selected.type !== "application/pdf"
    ) {
      setErrorMessage("Only images (JPG/PNG) or PDF files are allowed.");
      setFile(null);
      setPreviewUrl(null);
      return;
    }

    setFile(selected);
    setErrorMessage("");

    // Preview only if it's an image
    if (selected.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(selected);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setErrorMessage("Please select a file to upload.");
      return;
    }

    const authToken = getCookie("authToken");
    setIsSubmitting(true);
    setErrorMessage("");

    let url =`${import.meta.env.VITE_API_URL}/api/user/card/${cardId}/update-brochures`;

    try {
      const formData = new FormData();
      formData.append("brochures", file);

      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          Authorization: `${authToken}`,
        },
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.message || "Failed to upload brochure");
      }

      const result = await response.json();
      const uploadedFile = result?.data?.brochures;

      if (onSubmit) onSubmit(uploadedFile);
      onClose();
    } catch (err) {
      console.error("Error uploading brochure:", err.message);
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
          <h2 className="text-lg font-semibold text-gray-800">
            Upload Brochure
          </h2>
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
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-50 file:text-[#2563EB] hover:file:bg-purple-100 cursor-pointer"
            />
            {errorMessage && (
              <p className="text-xs text-red-500 mt-1">{errorMessage}</p>
            )}
          </div>

          {/* Preview */}
          {file && (
            <div className="mt-4 p-3 border rounded-lg bg-gray-50 flex items-center gap-4">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-20 h-20 object-cover rounded-md border"
                />
              ) : (
                <FaFilePdf className="text-red-600 text-4xl" />
              )}
              <div>
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
              className={`px-6 py-2 rounded-lg font-medium text-white bg-purple-600 transition ${
                isSubmitting
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-purple-700"
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
