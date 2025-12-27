import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";

export default function UpdateCategoryModal({
  cardData,
  cardId,
  role,
  onClose,
  onSubmit,
}) {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(cardData?.category || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/settings/category`,
          { headers: { Accept: "application/json" } }
        );
        if (!response.ok) throw new Error("Failed to fetch categories");
        const data = await response.json();
        setCategories(data?.data?.category || []);
      } catch (error) {
        console.error("Error fetching categories:", error.message);
        setErrorMessage("Failed to load categories");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async () => {
    if (!selectedCategory) {
      setErrorMessage("Please select a category");
      return;
    }

    const authToken = Cookies.get("authToken");
    setIsSubmitting(true);
    setErrorMessage("");

    const url =
      role === "admin"
        ? `${import.meta.env.VITE_API_URL}/api/admin/card/${cardId}/updatebasic`
        : `${import.meta.env.VITE_API_URL}/api/user/card/${cardId}/updatebasic`;

    try {
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${authToken}`,
        },
        credentials: "include",
        body: JSON.stringify({ category: selectedCategory }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.message || "Failed to update category");
      }

      const result = await response.json();
      onSubmit?.({ category: result?.data?.category });
      onClose();
    } catch (err) {
      console.error("Error updating category:", err.message);
      setErrorMessage(err.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-[9999] backdrop-blur-sm px-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 animate-fadeIn">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b pb-3">
          <h2 className="text-2xl font-bold text-gray-800">Update Category</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-3xl font-bold transition"
          >
            &times;
          </button>
        </div>

        {/* Categories grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto">
          {isLoading ? (
            <p className="text-gray-500 text-sm col-span-full">Loading categories...</p>
          ) : categories.length ? (
            categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`w-full text-center px-4 py-3 rounded-xl font-medium transition border ${
                  selectedCategory === cat
                    ? "bg-purple-600 text-white border-purple-600"
                    : "bg-gray-50 text-gray-800 border-gray-200 hover:bg-gray-100"
                }`}
              >
                {cat}
              </button>
            ))
          ) : (
            <p className="text-gray-500 text-sm col-span-full">No categories available</p>
          )}
        </div>

        {/* Error message */}
        {errorMessage && (
          <p className="text-xs text-red-500 mt-3">{errorMessage}</p>
        )}

        {/* Action buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-[#2563EB] font-medium transition rounded-lg"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting || isLoading || !selectedCategory}
            onClick={handleSubmit}
            className={`px-6 py-2 rounded-lg font-medium text-white bg-purple-600 transition ${
              isSubmitting || isLoading || !selectedCategory
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-purple-700"
            }`}
          >
            {isSubmitting ? "Updating..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
