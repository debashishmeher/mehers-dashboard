import { useState, useCallback } from "react";
import Cookies from "js-cookie";
import { useUser } from "../../Context/ContextApt";

export default function ChangePhotoModal({ onClose }) {
  const { setUserData } = useUser();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewURL, setPreviewURL] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Image size should be less than 2MB');
      return;
    }

    setError(null);
    setSelectedFile(file);
    setPreviewURL(URL.createObjectURL(file));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append("photo", selectedFile);

    const token = Cookies.get("accountToken");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/user/updateuser`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          Authorization: `${token}`,
        },
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to upload photo");
      }
      console.log(result.user.photo);

      // Safely access the photo property
      if (!result?.user.photo) {
        throw new Error("No photo URL returned from server");
      }
      
      setUserData((prev) => ({
        ...prev,
        user: {
          ...prev.user,
          photo: result.user.photo,
        },
      }));

      onClose();
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message || "An error occurred during upload");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-[9999] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Change Profile Photo</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center">
            <div className="relative w-24 h-24 mb-3">
              {previewURL ? (
                <img
                  src={previewURL}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-full border-2 border-gray-200 shadow-sm"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-full border-2 border-dashed border-gray-300 text-sm text-gray-500">
                  No image selected
                </div>
              )}
            </div>
            
            <label className="cursor-pointer bg-purple-50 text-[#2563EB] hover:bg-purple-100 px-4 py-2 rounded-lg font-medium transition text-sm">
              Select Image
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                required
              />
            </label>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center mt-2">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium text-sm"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded-lg font-medium text-sm ${
                isSubmitting
                  ? "bg-purple-400 cursor-not-allowed"
                  : "bg-purple-600 text-white hover:bg-purple-700"
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