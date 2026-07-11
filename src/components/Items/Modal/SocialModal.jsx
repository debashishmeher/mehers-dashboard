import React, { useState, useEffect } from "react";
import { getCookie } from "../../../utils/auth";
import {
  FaFacebook,
  FaInstagram,
  FaWhatsapp,
  FaYoutube,
  FaXTwitter,
  FaLinkedin,
  FaGlobe,
} from "react-icons/fa6";

export default function UpdateSocialModal({
  field, // facebook, instagram, whatsapp, etc.
  label,
  cardData,
  cardId,
  role,
  onClose,
  onSubmit,
}) {
  const [value, setValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // ✅ preload current value
useEffect(() => {
  if (cardData?.social?.[field]) {
    setValue(cardData.social[field]);
  } else {
    setValue("");
  }
}, [cardData, field]);

  // ✅ icons map
  const icons = {
    facebook: <FaFacebook className="text-blue-600 text-xl w-8 h-8" />,
    insta: <FaInstagram className="text-pink-500 text-xl w-8 h-8" />,
    whatsapp: <FaWhatsapp className="text-green-500 text-xl w-8 h-8" />,
    youtube: <FaYoutube className="text-red-600 text-xl w-8 h-8" />,
    twitter: <FaXTwitter className="text-black text-xl w-8 h-8" />,
    linkedin: <FaLinkedin className="text-blue-700 text-xl w-8 h-8" />,
    website: <FaGlobe className="text-[#2563EB] text-xl w-8 h-8" />,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const authToken = getCookie("authToken");
    setIsSubmitting(true);
    setErrorMessage("");

    let url = `${import.meta.env.VITE_API_URL}/api/user/card/${cardId}/update-social`;

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
      if (onSubmit) onSubmit(result.data.social);
      onClose();
    } catch (err) {
      console.error(`Error updating ${field}:`, err.message);
      setErrorMessage(err.message || "Something went wrong, please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
<div className="fixed inset-0 flex items-center justify-center bg-black/40 z-[9999] backdrop-blur-sm">
  <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-fadeIn">
    {/* Header */}
    <div className="flex justify-between items-center mb-6 border-b pb-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-purple-100">
          {icons[field]}
        </div>
        <h2 className="text-xl font-bold text-gray-800 tracking-wide">
          Update {label}
        </h2>
      </div>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 text-3xl font-bold transition"
      >
        &times;
      </button>
    </div>

    {/* Form */}
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <input
          type="url"
          placeholder={`Enter your ${label} link`}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        {errorMessage && (
          <p className="text-xs text-red-500 mt-1">{errorMessage}</p>
        )}
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
