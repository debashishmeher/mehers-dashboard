import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";

export default function AddressModal({ cardData, cardId, onClose, onSubmit }) {
  const [form, setForm] = useState({
    addressLine: "",
    city: "",
    state: "",
    country: "",
    pinCode: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // ✅ character limits for fields
  const charLimits = {
    addressLine: 150,
    city: 50,
    state: 50,
    country: 50,
    pinCode: 6,
  };

  useEffect(() => {
    if (cardData) {
      setForm({
        addressLine: cardData.addressLine || "",
        city: cardData.city || "",
        state: cardData.state || "",
        country: cardData.country || "",
        pinCode: cardData.pinCode || "",
      });
    }
  }, [cardData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const max = charLimits[name] || 100;
    setForm({ ...form, [name]: value.slice(0, max) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate PIN code
    if (!/^[1-9][0-9]{5}$/.test(form.pinCode)) {
      return setError("PIN code must be a valid 6-digit number (starting from 1–9).");
    }

    // Validate required fields
    if (!form.addressLine || !form.city || !form.state || !form.country || !form.pinCode) {
      return setError("All address fields are required.");
    }

    setIsSubmitting(true);
    const authToken = Cookies.get("authToken");

 
     const url = `${import.meta.env.VITE_API_URL}/api/user/card/${cardId}/update-address`;
    

    try {
      const res = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${authToken}`,
        },
        credentials: "include",
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update address.");

      if (onSubmit) onSubmit(data.data || form);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInput = (label, name, type = "text") => (
    <div>
      <label className="text-sm text-gray-500 block mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={form[name]}
        onChange={handleChange}
        required
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
      <div className="text-right text-xs text-gray-400 mt-1">
        {form[name].length}/{charLimits[name]} characters
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-[9999] backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 animate-fadeIn">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b pb-3">
          <h2 className="text-lg font-semibold text-gray-800">Update Address</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            &times;
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {renderInput("Address Line", "addressLine")}
          <div className="grid grid-cols-2 gap-4">
            {renderInput("City", "city")}
            {renderInput("State", "state")}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {renderInput("Country", "country")}
            {renderInput("PIN Code", "pinCode", "number")}
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

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
              disabled={isSubmitting}
              className={`px-6 py-2 rounded-lg font-medium text-white bg-purple-600 transition ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:bg-purple-700"
              }`}
            >
              {isSubmitting ? "Updating..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
