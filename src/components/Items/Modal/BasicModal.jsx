import React, { useState, useEffect } from "react";
import { getCookie } from "../../../utils/auth";

export default function UpdateFieldModal({ 
  field,        // e.g. "name", "email", "phone", "bio", "desc"
  label,        // e.g. "Name", "Email", "Phone", "Bio"
  cardData,     // object containing current field values
  cardId, 
  onClose, 
  onSubmit 
}) {
  const [value, setValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // ✅ configurable limits per field
  const charLimits = {
    name: 50,
    email: 100,
    phone: 20,
    bio: 300,
    desc: 500,
  };
  const maxChars = charLimits[field] || 200;

  // preload field value
  useEffect(() => {
    if (cardData?.[field]) {
      setValue(cardData[field]);
    }
  }, [cardData, field]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const authToken = getCookie("authToken");
    setIsSubmitting(true);
    setErrorMessage(""); // clear old error

    const url = `${import.meta.env.VITE_API_URL}/api/user/card/${cardId}/update-basic`;
    
    try {
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${authToken}`,
        },
        credentials: "include",
        body: JSON.stringify({ [field]: value }),
      });

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
            Update Your {label}
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
            <label className="text-sm text-gray-500 block mb-2">{label}</label>

            {field === "bio" || field === "desc" ? (
              <textarea
                value={value}
                onChange={(e) => setValue(e.target.value.slice(0, maxChars))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                rows={5}
                required
              />
            ) : (
              <input
                type={field === "email" ? "email" : "text"}
                value={value}
                onChange={(e) => setValue(e.target.value.slice(0, maxChars))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            )}

            {/* Character counter */}
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-red-500">{errorMessage}</span>
              <span className="text-xs text-gray-500">
                {value.length}/{maxChars} characters
              </span>
            </div>
          </div>

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
                isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:bg-purple-700"
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
