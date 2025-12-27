import React, { useState } from "react";
import Cookies from "js-cookie";
import { useUser } from "../../Context/ContextApt";

export default function UpdateAddressForm({ onClose, onSubmit }) {
    const { userData,setUserData, loading, error } = useUser();
  const [address, setAddress] = useState(userData?.user.address || "");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const accountToken = Cookies.get("accountToken");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/account/upadateprofile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${accountToken}`,
        },
        credentials: "include",
        body: JSON.stringify({
          address,
        }),
      });

      if (!response.ok) throw new Error("Failed to update address");

      const result = await response.json();
      
      setUserData((prev) => ({
        ...prev,
        user: {
          ...prev.user,
          address: result.data.address, 
        },
      }));
    
      if (onSubmit) onSubmit({ address });
    } catch (err) {
      console.error("Error updating address:", err.message);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-[9999]">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Update Your Address</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black text-xl font-bold">
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-500 block mb-1">Your address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="text-[#2563EB] hover:underline font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 transition"
            >
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
