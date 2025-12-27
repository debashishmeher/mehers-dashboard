import React, { useState } from "react";
import Cookies from "js-cookie";
import { useUser } from "../../Context/ContextApt";

export default function UpdatePhoneModal({ onClose, onSubmit }) {
  const { userData, setUserData, loading, error } = useUser();
  const [phone, setPhone] = useState(userData?.user?.phone || "");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const authToken = Cookies.get("authToken");

    setSubmitting(true);
    setMessage("");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/updateuser`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${authToken}`,
        },
        credentials: "include",
        body: JSON.stringify({ phone }),
      });

     if (!response.ok) throw new Error("Failed to update name");

      const result = await response.json();
      const updatedPhone = result?.user?.phone;
      console.log(result?.user?.phone, "this is phone model");
      
      if (updatedPhone) {
        setUserData((prev) => ({
          ...prev,
          user: {
            ...prev?.user,
            phone: updatedPhone,
          },
        }));
      }

      if (onSubmit) onSubmit({ phone });
      setMessage("Phone number updated successfully!");
    } catch (err) {
      console.error("Error updating phone:", err.message);
      setMessage(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error || !userData?.user) return <div>Error loading user data.</div>;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-[9999]">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Update Your Phone Number</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black text-xl font-bold">
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-500 block mb-1">Phone number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
              disabled={submitting}
            />
          </div>
          {message && (
            <div className="text-sm text-green-600 font-medium">{message}</div>
          )}
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="text-[#2563EB] hover:underline font-medium"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`bg-purple-600 text-white px-6 py-2 rounded-lg font-medium transition ${
                submitting ? "opacity-50 cursor-not-allowed" : "hover:bg-purple-700"
              }`}
              disabled={submitting}
            >
              {submitting ? "Saving..." : "Continue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
