import React, { useState } from "react";
import { getCookie } from "../../utils/auth";
import { useUser } from "../../Context/ContextApt";

export default function UpdatePasswordModal({ onClose, onSubmit }) {
  const { userData, loading, error } = useUser();
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: "", isError: false });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const authToken = getCookie("authToken");

    // Validation
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ text: "Passwords don't match", isError: true });
      return;
    }

    if (formData.newPassword.length < 8) {
      setMessage({ text: "Password must be at least 8 characters", isError: true });
      return;
    }

    setSubmitting(true);
    setMessage({ text: "", isError: false });

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/updatemypassword`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${authToken}`,
        },
        credentials: "include",
        body: JSON.stringify({ 
          currentPassword: formData.currentPassword,
          password: formData.newPassword,
          confirmPassword: formData.confirmPassword
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update password");
      }

      setMessage({ text: "Password updated successfully!", isError: false });
      
      // Clear form and close modal on success
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      
      if (onSubmit) onSubmit();
      if (onClose) onClose();
      
    } catch (err) {
      console.error("Error updating password:", err.message);
      setMessage({ text: err.message, isError: true });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-4">Loading...</div>;
  if (error || !userData?.user) return <div className="text-center py-4 text-red-600">Error loading user data.</div>;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-[9999]">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Update Your Password</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold transition"
            disabled={submitting}
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
              disabled={submitting}
              minLength="8"
            />
          </div>
          
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
              disabled={submitting}
              minLength="8"
              placeholder="At least 8 characters"
            />
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
              disabled={submitting}
              minLength="8"
            />
          </div>
          
          {message.text && (
            <div className={`p-3 rounded-md ${message.isError ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
              {message.text}
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-[#2563EB] font-medium rounded-lg hover:bg-purple-50 transition"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-6 py-2 text-white font-medium rounded-lg transition ${
                submitting ? "bg-purple-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"
              }`}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="inline-block animate-spin mr-2">↻</span>
                  Updating...
                </>
              ) : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}