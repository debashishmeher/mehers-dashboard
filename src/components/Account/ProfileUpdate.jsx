import React, { useState } from "react";
import Cookies from "js-cookie";

export default function ProfileUpdate({ handleNext, handleBack }) {
    const [error, setError] = useState(null);
    const [preview, setPreview] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        password: "",
        confirmPassword: "",
        photo: null,
    });

    const handleChange = (e) => {
        const { name, value } = e.target; // ✅ fixed here
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async () => {
        setError(null);
        const authToken = Cookies.get("authToken");

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        const data = new FormData();
        data.append("name", formData.name); // ✅ fixed
        data.append("phone", formData.phone); // ✅ fixed
        data.append("password", formData.password);
        if (formData.photo) {
            data.append("photo", formData.photo);
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/account/onboard`, {
                method: "PATCH",
                body: data,
                headers: {
                    Authorization: authToken || "", // only if your server uses it
                },
                credentials: "include", // ✅ ensures cookies are sent
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to update profile");
            }

            const result = await response.json();
            console.log("Success:", result);
            handleNext();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Upload Profile Picture
                </label>
                {preview && (
                    <div className="mt-2 flex justify-start">
                        <img
                            src={preview}
                            alt="Profile Preview"
                            className="h-24 w-24 rounded-full object-cover border"
                        />
                    </div>
                )}
                <input
                    type="file"
                    name="photo"
                    accept="image/*"
                    onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                            setPreview(URL.createObjectURL(file));
                            setFormData((prev) => ({ ...prev, photo: file }));
                        }
                    }}
                    className="mt-1 w-full border px-4 py-2 rounded-md"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 w-full border px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="John Doe"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="mt-1 w-full border px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="+1 234 567 890"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="mt-1 w-full border px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="mt-1 w-full border px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••"
                />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex justify-between mt-6">
                <button
                    type="button"
                    className="text-gray-600 hover:underline"
                    onClick={handleBack}
                >
                    Back
                </button>
                <button
                    type="button"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                    onClick={handleSubmit}
                >
                    Next
                </button>
            </div>
        </div>
    );
}