import { useState } from 'react';
import { FaCoins, FaFacebook, FaInstagram, FaLinkedin, FaShareAlt, FaTwitter, FaWhatsapp, FaYoutube, FaGlobe, FaTimes, FaSpinner } from "react-icons/fa";
import { FaThreads, FaXTwitter } from "react-icons/fa6";
import { ChevronRight } from "lucide-react";

export default function SocialMediaRewardsSection({ settings, onUpdateRewards }) {
    const [selectedPlatform, setSelectedPlatform] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const platforms = [
        { name: 'facebook', icon: FaFacebook, color: 'blue' },
        { name: 'instagram', icon: FaInstagram, color: 'pink' },
        { name: 'x', icon: FaXTwitter, color: 'black', displayName: 'Twitter (X)' },
        { name: 'whatsapp', icon: FaWhatsapp, color: 'green' },
        { name: 'linkedin', icon: FaLinkedin, color: 'blue' },
        { name: 'youtube', icon: FaYoutube, color: 'red' },
        { name: 'threads', icon: FaThreads, color: 'black' },
        { name: 'other', icon: FaGlobe, color: 'purple' }
    ];

    // Helper functions for platform icons and colors
    const getPlatformIcon = (platformName) => {
        const platform = platformName.toLowerCase();
        const size = 20;

        switch (platform) {
            case 'facebook': return <FaFacebook className="text-white" size={size} />;
            case 'instagram': return <FaInstagram className="text-white" size={size} />;
            case 'x':
            case 'twitter': return <FaXTwitter className="text-white" size={size} />;
            case 'whatsapp': return <FaWhatsapp className="text-white" size={size} />;
            case 'linkedin': return <FaLinkedin className="text-white" size={size} />;
            case 'youtube': return <FaYoutube className="text-white" size={size} />;
            case 'threads': return <FaThreads className="text-white" size={size} />;
            default: return <FaGlobe className="text-white" size={size} />;
        }
    };

    const getPlatformBgColor = (platformName) => {
        const platform = platformName.toLowerCase();

        switch (platform) {
            case 'facebook': return 'bg-blue-600';
            case 'instagram': return 'bg-gradient-to-r from-purple-500 to-pink-500';
            case 'x':
            case 'twitter': return 'bg-black';
            case 'whatsapp': return 'bg-green-500';
            case 'linkedin': return 'bg-blue-700';
            case 'youtube': return 'bg-red-600';
            case 'threads': return 'bg-black';
            default: return 'bg-purple-600';
        }
    };

    const handlePlatformClick = (platform) => {
        setSelectedPlatform(platform);
        setIsModalOpen(true);
    };

    const handleSave = async (newValue) => {
        setIsSaving(true);
        try {
            await onUpdateRewards(selectedPlatform.name, newValue);
            setIsModalOpen(false);
        } catch (error) {
            console.error("Failed to update rewards:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="py-4 border-t">
            {/* Enhanced Heading */}
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
                    <FaShareAlt className="text-white text-lg" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">Social Media Rewards</h3>
                    <p className="text-sm text-gray-500">Manage rewards for different platforms</p>
                </div>
            </div>

            {/* Rewards List */}
            <div className="divide-y divide-gray-200 border rounded-lg overflow-hidden">
                {platforms.map((platform) => (
                    <div
                        key={platform.name}
                        onClick={() => handlePlatformClick(platform)}
                        className="cursor-pointer flex items-center justify-between py-4 px-4 hover:bg-gray-50 transition-colors bg-white"
                    >
                        <div className="flex-1 flex items-center gap-4 flex-wrap">
                            <div className="flex items-center gap-3 flex-1 basis-[100px]">
                                <div className={`p-2 bg-${platform.color}-100 rounded-lg`}>
                                    <platform.icon className={`text-${platform.color}-600 text-lg`} />
                                </div>
                                <span className="text-gray-600 font-medium">
                                    {platform.displayName || platform.name.charAt(0).toUpperCase() + platform.name.slice(1)}
                                </span>
                            </div>
                            <div className="flex-1 basis-[100px]">
                                <span className={`inline-block px-3 py-1 bg-${platform.color}-50 text-${platform.color}-700 rounded-full text-sm font-medium`}>
                                    {settings.socialMediaRewards[platform.name]} coins
                                </span>
                            </div>
                        </div>
                        <div className="pl-4">
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Update Rewards Modal */}
            {isModalOpen && selectedPlatform && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl w-full max-w-md overflow-hidden shadow-2xl transition-all">
                        {/* Modal Header */}
                        <div className="flex justify-between items-start p-6 border-b border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-lg ${getPlatformBgColor(selectedPlatform.name)}`}>
                                    {getPlatformIcon(selectedPlatform.name)}
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900">
                                        Update {selectedPlatform.displayName || selectedPlatform.name} Rewards
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">Adjust coin rewards for this platform</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-500 transition-colors p-1 rounded-full hover:bg-gray-100"
                                disabled={isSaving}
                                aria-label="Close modal"
                            >
                                <FaTimes className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6">
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700">
                                    Current Reward Value
                                </label>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-bold text-gray-800">
                                        {settings.socialMediaRewards[selectedPlatform.name]}
                                    </span>
                                    <span className="text-gray-500">coins</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="newValue" className="block text-sm font-medium text-gray-700">
                                    New Reward Value
                                </label>
                                <div className="relative rounded-lg shadow-sm">
                                    <input
                                        type="number"
                                        id="newValue"
                                        min="0"
                                        defaultValue={settings.socialMediaRewards[selectedPlatform.name]}
                                        className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                        placeholder="Enter amount"
                                        disabled={isSaving}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-gray-50 px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                disabled={isSaving}
                                className="px-5 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={(e) => {
                                    const newValue = parseInt(e.target.parentElement.parentElement.querySelector('#newValue').value);
                                    handleSave(newValue);
                                }}
                                disabled={isSaving}
                                className={`px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors ${isSaving
                                        ? 'bg-indigo-400 cursor-not-allowed'
                                        : 'bg-indigo-600 hover:bg-indigo-700 shadow-sm'
                                    }`}
                            >
                                {isSaving ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <FaSpinner className="animate-spin" />
                                        Updating...
                                    </span>
                                ) : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
