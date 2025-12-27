import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { FaSpinner } from "react-icons/fa";

export default function UpdateFieldModal({
  field,
  label,
  settings = {},
  onClose,
  onSubmit,
  isOpen = true,
}) {
  const [value, setValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // preload field value
  useEffect(() => {
    if (settings?.[field] !== undefined) {
      setValue(settings[field]);
    }
  }, [settings, field]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const authToken = Cookies.get("authToken");
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/settings`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${authToken}`,
          },
          credentials: "include",
          body: JSON.stringify({ [field]: value }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.message || `Failed to update ${field}`);
      }

      const result = await response.json();
      const updatedValue = result?.data?.[field];

      if (onSubmit) onSubmit({ [field]: updatedValue });
      onClose();
    } catch (err) {
      console.error(`Error updating ${field}:`, err.message);
      setErrorMessage(err.message || "Something went wrong, please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-[9999] backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-fadeIn">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b pb-3">
          <h2 className="text-lg font-semibold text-gray-800">
            Update {label}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            disabled={isSubmitting}
          >
            &times;
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-500 block mb-2">{label}</label>

            {/* Decide input type */}
            {field === "bio" || field === "desc" ? (
              <textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                rows={5}
                required
              />
            ) : (
              <input
                type={
                  field === "email"
                    ? "email"
                    : field === "coins"
                    ? "number"
                    : "text"
                }
                min={field === "coins" ? "0" : undefined}
                value={value}
                onChange={(e) =>
                  setValue(field === "coins" ? Number(e.target.value) : e.target.value)
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            )}

            {/* Error only (no char counter) */}
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-red-500">{errorMessage}</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-purple-600 font-medium transition"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-6 py-2 rounded-lg font-medium text-white bg-purple-600 transition ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:bg-purple-700"
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <FaSpinner className="animate-spin" /> Updating...
                </span>
              ) : (
                "Save"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
