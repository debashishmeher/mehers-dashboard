import { useState, useEffect } from "react";
import Cookies from 'js-cookie';
import { FaPlus, FaTimes, FaSpinner, FaSave, FaWhatsapp } from 'react-icons/fa';
import {
    FaFacebook,
    FaInstagram,
    FaTwitter,
    FaLinkedin,
    FaYoutube,
    FaTiktok,
    FaGlobe
} from 'react-icons/fa';
import { FaThreads, FaXTwitter } from "react-icons/fa6";

const CreateSocialMedia = ({
    onClose,
    onCreateSuccess,
    onUpdateSuccess,
    editingMedia,
    isEditing
}) => {
    const [formData, setFormData] = useState({
        mediaType: '',
        link: '',
        conditions: [''],
        rewards: '' // Added rewards field
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [couponPresets, setCouponPresets] = useState([]); // State for coupon presets
    const [loadingPresets, setLoadingPresets] = useState(false); // Loading state for presets

    // Fetch coupon presets on component mount
    useEffect(() => {
        const fetchCouponPresets = async () => {
            setLoadingPresets(true);
            const token = Cookies.get('authToken');

            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/coupon/presetsName`, {
                    method: 'GET',
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `${token}`,
                    },
                    credentials: 'include'
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch coupon presets');
                }

                const data = await response.json();
                setCouponPresets(data.data || []);
            } catch (error) {
                console.error('Error fetching coupon presets:', error);
                setError('Failed to load rewardss');
            } finally {
                setLoadingPresets(false);
            }
        };

        fetchCouponPresets();
    }, []);

    // Initialize form with editing data if in edit mode
    useEffect(() => {
        if (isEditing && editingMedia) {
            setFormData({
                mediaType: editingMedia.mediaType || '',
                link: editingMedia.link || '',
                conditions: editingMedia.conditions && editingMedia.conditions.length > 0
                    ? [...editingMedia.conditions]
                    : [''],
                rewards: editingMedia.rewards || '' // Initialize rewards if editing
            });
        } else {
            // Reset form for create mode
            setFormData({
                mediaType: '',
                link: '',
                conditions: [''],
                rewards: '' // Reset rewards field
            });
        }
    }, [isEditing, editingMedia]);

    const mediaTypes = [
        { value: 'facebook', label: 'Facebook', icon: <FaFacebook className="text-blue-600" /> },
        { value: 'instagram', label: 'Instagram', icon: <FaInstagram className="text-pink-600" /> },
        {
            value: 'x',
            label: 'X',
            icon: <FaXTwitter className="text-black" />
        },
        {
            value: 'threads',
            label: 'Threads',
            icon: <FaThreads className="text-black" />
        },
        {
            value: 'whatsapp',
            label: 'WhatsApp',
            icon: <FaWhatsapp className="text-green-500" />
        },
        { value: 'youtube', label: 'YouTube', icon: <FaYoutube className="text-red-600" /> },
        { value: 'linkedin', label: 'LinkedIn', icon: <FaLinkedin className="text-blue-700" /> },
        { value: 'other', label: 'Other', icon: <FaGlobe className="text-gray-600" /> }
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleConditionChange = (index, value) => {
        const newConditions = [...formData.conditions];
        newConditions[index] = value;
        setFormData(prev => ({
            ...prev,
            conditions: newConditions
        }));
    };

    const addCondition = () => {
        setFormData(prev => ({
            ...prev,
            conditions: [...prev.conditions, '']
        }));
    };

    const removeCondition = (index) => {
        const newConditions = formData.conditions.filter((_, i) => i !== index);
        setFormData(prev => ({
            ...prev,
            conditions: newConditions.length > 0 ? newConditions : ['']
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Filter out empty conditions
        const filteredConditions = formData.conditions
            .map(condition => condition.trim())
            .filter(condition => condition !== '');

        // Validation
        if (!formData.mediaType) {
            setError('Please select a social media platform');
            setLoading(false);
            return;
        }

        if (!formData.link) {
            setError('Please provide a valid link');
            setLoading(false);
            return;
        }

        if (filteredConditions.length === 0) {
            setError('Please add at least one condition');
            setLoading(false);
            return;
        }

        if (!formData.rewards) {
            setError('Please select a rewards');
            setLoading(false);
            return;
        }

        const token = Cookies.get('authToken');
        try {
            const url = isEditing && editingMedia
                ? `${import.meta.env.VITE_API_URL}/api/social-media/${editingMedia._id}`
                : `${import.meta.env.VITE_API_URL}/api/social-media`;

            const method = isEditing ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `${token}`,
                },
                body: JSON.stringify({
                    mediaType: formData.mediaType,
                    link: formData.link,
                    conditions: filteredConditions,
                    rewards: formData.rewards // Include rewards in the request
                }),
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to ${isEditing ? 'update' : 'create'} social media offer`);
            }

            const data = await response.json();

            if (isEditing) {
                onUpdateSuccess(data.data.socialMedia);
            } else {
                onCreateSuccess(data.data.socialMedia);
            }

            onClose();
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">
                            {isEditing ? 'Edit Social Media Offer' : 'Create Social Media Offer'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700"
                            disabled={loading}
                        >
                            <FaTimes className="text-xl" />
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
                            <div className="flex items-center">
                                <p className="text-red-700 font-medium">{error}</p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Social Media Platform
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {mediaTypes.map((type) => (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, mediaType: type.value }))}
                                        className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 ${formData.mediaType === type.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                                        disabled={loading}
                                    >
                                        <span className="text-2xl mb-1">{type.icon}</span>
                                        <span className="text-sm">{type.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mb-6">
                            <label htmlFor="link" className="block text-sm font-medium text-gray-700 mb-2">
                                Profile/Page URL
                            </label>
                            <input
                                type="url"
                                id="link"
                                name="link"
                                value={formData.link}
                                onChange={handleChange}
                                placeholder="https://example.com/your-page"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                required
                                disabled={loading}
                            />
                        </div>

<div className="mb-6">
    <label htmlFor="rewards" className="block text-sm font-medium text-gray-700 mb-2">
        Rewards
    </label>
    <select
        id="rewards"
        name="rewards"
        value={typeof formData.rewards === 'object' ? formData.rewards._id : formData.rewards}
        onChange={handleChange}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
        required
        disabled={loading || loadingPresets}
    >
        <option value="">Select a reward</option>
        {/* Show current value first if it exists and isn't in the preset list */}
        {formData.rewards && !couponPresets.some(preset => 
            preset._id === (typeof formData.rewards === 'object' ? formData.rewards._id : formData.rewards)
        ) && (
            <option 
                key={typeof formData.rewards === 'object' ? formData.rewards._id : formData.rewards} 
                value={typeof formData.rewards === 'object' ? formData.rewards._id : formData.rewards}
            >
                {typeof formData.rewards === 'object' ? formData.rewards.presetName : formData.rewards}
            </option>
        )}
        {couponPresets.map((preset) => (
            <option key={preset._id} value={preset._id}>
                {preset.presetName}
            </option>
        ))}
    </select>
    {loadingPresets && (
        <div className="mt-2 flex items-center text-sm text-gray-500">
            <FaSpinner className="animate-spin mr-2" />
            Loading rewards...
        </div>
    )}
</div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Terms & Conditions
                            </label>
                            <div className="space-y-3">
                                {formData.conditions.map((condition, index) => (
                                    <div key={index} className="flex items-center">
                                        <input
                                            type="text"
                                            value={condition}
                                            onChange={(e) => handleConditionChange(index, e.target.value)}
                                            placeholder={`Condition ${index + 1}`}
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                            disabled={loading}
                                        />
                                        {formData.conditions.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeCondition(index)}
                                                className="ml-2 p-2 text-red-500 hover:text-red-700"
                                                disabled={loading}
                                            >
                                                <FaTimes />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addCondition}
                                    className="flex items-center text-sm text-blue-600 hover:text-blue-800 mt-2"
                                    disabled={loading}
                                >
                                    <FaPlus className="mr-1" /> Add Condition
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center min-w-[100px]"
                                disabled={loading || loadingPresets}
                            >
                                {loading ? (
                                    <>
                                        <FaSpinner className="animate-spin mr-2" />
                                        {isEditing ? 'Saving...' : 'Creating...'}
                                    </>
                                ) : (
                                    <>
                                        {isEditing ? (
                                            <>
                                                <FaSave className="mr-2" />
                                                Save Changes
                                            </>
                                        ) : 'Create Offer'}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateSocialMedia;