import React, { useEffect, useState } from "react";
import { useCard } from "../../Context/CardContext";
import { cardService } from "../../Services/cardService";
import { Upload, User, Building2 } from "lucide-react";

export default function BasicData({ handleNext, handleBack, cardId, role }) {
    const [apperror, setError] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [categories, setCategories] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const { cardData, setCardData } = useCard();

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        bio: "",
        addressLine: "",
        city: "",
        state: "",
        country: "",
        pinCode: "",
        category: "",
        logo: null,
        photo: null,
    });

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setError(null);
                // If you have a categories service, use it here
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/settings/category`, {
                    headers: {
                        'Accept': 'application/json',
                    }
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch categories: ${response.status}`);
                }

                const data = await response.json();
                setCategories(data.data.category || []);
            } catch (err) {
                setError(err.message);
                console.error('Error fetching categories:', err);
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        if (cardData) {
            setFormData((prev) => ({
                ...prev,
                name: cardData.name || "",
                phone: cardData.phone || "",
                email: cardData.email || "",
                bio: cardData.bio || "",
                addressLine: cardData.addressLine || "",
                city: cardData.city || "",
                state: cardData.state || "",
                country: cardData.country || "",
                pinCode: cardData.pinCode || "",
                category: cardData.category || "",
                logo: cardData.logo || null,
                photo: cardData.photo || null,
            }));

            if (cardData.logo && typeof cardData.logo === "string") {
                setLogoPreview(cardData.logo.startsWith('http') ? cardData.logo : `${import.meta.env.VITE_API_URL}/${cardData.logo}`);
            }
            if (cardData.photo && typeof cardData.photo === "string") {
                setPhotoPreview(cardData.photo.startsWith('http') ? cardData.photo : `${import.meta.env.VITE_API_URL}/${cardData.photo}`);
            }
        }
    }, [cardData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        const file = files[0];
        if (file) {
            const previewURL = URL.createObjectURL(file);
            if (name === "logo") setLogoPreview(previewURL);
            if (name === "photo") setPhotoPreview(previewURL);
            setFormData((prev) => ({ ...prev, [name]: file }));
        }
    };

    const handleSubmit = async () => {
        setError(null);
        setSubmitting(true);

        // Validate PIN code
        if (formData.pinCode && !/^[1-9][0-9]{5}$/.test(formData.pinCode)) {
            setError("Please enter a valid 6-digit PIN code (starting with 1-9)");
            setSubmitting(false);
            return;
        }

        try {
            const updateData = new FormData();
            
            // Append only changed fields
            Object.entries(formData).forEach(([key, value]) => {
                if (value !== null && value !== "" && value !== cardData[key]) {
                    updateData.append(key, value);
                }
            });

            // Use cardService to update basic data
            const updatedCard = await cardService.updateCard(cardId, updateData);
            
            // Update context with new data
            setCardData((prev) => ({
                ...prev,
                ...updatedCard,
            }));
            
            handleNext();
        } catch (err) {
            setError(err.message || "Failed to update basic information");
            console.error("Error updating basic data:", err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Basic Information
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Add your basic business details and contact information
                </p>
            </div>

            {/* Media Upload Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Logo Upload */}
                <FileUpload
                    label="Company Logo"
                    name="logo"
                    preview={logoPreview}
                    handleFileChange={handleFileChange}
                    icon={<Building2 className="w-8 h-8" />}
                />

                {/* Profile Photo Upload */}
                <FileUpload
                    label="Profile Photo"
                    name="photo"
                    preview={photoPreview}
                    handleFileChange={handleFileChange}
                    icon={<User className="w-8 h-8" />}
                />
            </div>

            {/* Basic Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TextInput 
                    label="Full Name *" 
                    name="name" 
                    value={formData.name} 
                    handleChange={handleChange} 
                    placeholder="John Doe" 
                />
                <TextInput 
                    label="Phone Number *" 
                    name="phone" 
                    value={formData.phone} 
                    handleChange={handleChange} 
                    placeholder="+1 234 567 890" 
                />
            </div>

            <TextInput 
                label="Email Address *" 
                name="email" 
                value={formData.email} 
                handleChange={handleChange} 
                placeholder="john@example.com" 
                type="email"
            />

            {/* Category */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Business Category
                </label>
                <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                        <option key={category} value={category}>
                            {category}
                        </option>
                    ))}
                </select>
            </div>

            {/* Bio */}
            <TextArea 
                label="Bio" 
                name="bio" 
                value={formData.bio} 
                handleChange={handleChange} 
                placeholder="Tell us about your business..." 
            />

            {/* Address Section */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Address Information
                </h3>
                <div className="space-y-4">
                    <TextInput 
                        label="Address Line" 
                        name="addressLine" 
                        value={formData.addressLine} 
                        handleChange={handleChange} 
                        placeholder="Apartment, studio, or floor" 
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <TextInput 
                            label="City" 
                            name="city" 
                            value={formData.city} 
                            handleChange={handleChange} 
                            placeholder="City" 
                        />
                        <TextInput 
                            label="State" 
                            name="state" 
                            value={formData.state} 
                            handleChange={handleChange} 
                            placeholder="State" 
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <TextInput 
                            label="Country" 
                            name="country" 
                            value={formData.country} 
                            handleChange={handleChange} 
                            placeholder="Country" 
                        />
                        <TextInput
                            label="PIN Code"
                            name="pinCode"
                            value={formData.pinCode}
                            handleChange={handleChange}
                            placeholder="6-digit code"
                            pattern="[1-9][0-9]{5}"
                            title="6-digit PIN code starting with 1-9"
                        />
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {apperror && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-red-700 dark:text-red-400 text-sm">{apperror}</p>
                </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                <button 
                    type="button" 
                    onClick={handleBack}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                    Back
                </button>
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                    {submitting ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Updating...
                        </>
                    ) : (
                        "Save & Continue"
                    )}
                </button>
            </div>
        </div>
    );
}

// Enhanced FileUpload Component
function FileUpload({ label, name, preview, handleFileChange, icon }) {
    return (
        <div className="text-center">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                {label}
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer">
                <input
                    type="file"
                    name={name}
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id={name}
                />
                <label htmlFor={name} className="cursor-pointer">
                    {preview ? (
                        <div className="space-y-3">
                            <img 
                                src={preview} 
                                alt={`${name} Preview`} 
                                className="w-24 h-24 rounded-lg object-cover mx-auto border border-gray-200 dark:border-gray-600"
                            />
                            <p className="text-sm text-gray-600 dark:text-gray-400">Click to change</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-500">
                                {icon}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    Upload {name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    PNG, JPG up to 5MB
                                </p>
                            </div>
                        </div>
                    )}
                </label>
            </div>
        </div>
    );
}

// Enhanced TextInput Component
function TextInput({ label, name, value, handleChange, placeholder, type = "text", pattern, title }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {label}
            </label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder={placeholder}
                pattern={pattern}
                title={title}
            />
        </div>
    );
}

// Enhanced TextArea Component
function TextArea({ label, name, value, handleChange, placeholder }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {label}
            </label>
            <textarea
                name={name}
                value={value}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                placeholder={placeholder}
            />
        </div>
    );
}