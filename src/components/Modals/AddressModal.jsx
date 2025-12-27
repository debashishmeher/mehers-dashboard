import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useUser } from "../../Context/ContextApt";

export default function AddressModal({ onClose, onSubmit }) {
  const { userData, setUserData } = useUser();
  const user = userData?.user || {};
  const [form, setForm] = useState({
    addressLine: "",
    city: "",
    state: "",
    country: "",
    pin: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.address) {
      // If address is stored as separate fields in user object
      if (typeof user.address === 'object') {
        setForm({
          addressLine: user.address.addressLine || "",
          city: user.address.city || "",
          state: user.address.state || "",
          country: user.address.country || "",
          pin: user.address.pin || ""
        });
      } 
      // If address is stored as a comma-separated string (legacy format)
      else {
        const [addressLine = "", city = "", state = "", country = "", pin = ""] = 
          user.address.split(",").map((x) => x.trim());
        setForm({ addressLine, city, state, country, pin });
      }
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate PIN code
    if (!/^[1-9][0-9]{5}$/.test(form.pin)) {
      return setError("PIN code must be a valid 6-digit number (starting from 1–9).");
    }

    // Validate all required fields
    if (!form.addressLine || !form.city || !form.state || !form.country || !form.pin) {
      return setError("All address fields are required");
    }

    setIsSubmitting(true);
    const authToken = Cookies.get("authToken");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/user/updatelocation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${authToken}`,
        },
        credentials: "include",
        body: JSON.stringify({
          addressLine: form.addressLine,
          city: form.city,
          state: form.state,
          country: form.country,
          pin: form.pin
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update address.");

      // Update user data in context
      setUserData((prev) => ({
        ...prev,
        user: {
          ...prev.user,
          address: data.data?.address || {
            addressLine: form.addressLine,
            city: form.city,
            state: form.state,
            country: form.country,
            pin: form.pin
          }
        },
      }));

      if (onSubmit) onSubmit(data.data?.address || form);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-[9999]">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Update Your Address</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black text-xl font-bold">
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="text-sm text-gray-500 block mb-1">Address Line</label>
              <input
                type="text"
                name="addressLine"
                value={form.addressLine}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500 block mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-500 block mb-1">State</label>
                <input
                  type="text"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500 block mb-1">Country</label>
                <input
                  type="text"
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-500 block mb-1">PIN Code</label>
                <input
                  type="text"
                  name="pin"
                  value={form.pin}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}
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
              disabled={isSubmitting}
              className={`bg-purple-600 text-white px-6 py-2 rounded-lg font-medium transition ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:bg-purple-700"
              }`}
            >
              {isSubmitting ? "Updating..." : "Continue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}