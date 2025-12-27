import { useEffect, useState, useRef } from "react";
import Cookies from 'js-cookie';
import {
    FaSpinner,
    FaExclamationTriangle,
    FaFacebook,
    FaInstagram,
    FaLinkedin,
    FaYoutube,
    FaGlobe,
    FaWhatsapp,
} from 'react-icons/fa';
import { FaThreads, FaXTwitter } from "react-icons/fa6";
import CreateSocialMedia from "./CreateSocialMedia";
import SocialMediaCard from "./SocialMediaCard";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

const SocialMedia = () => {
    // State management
    const [socialMediaList, setSocialMediaList] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Form and editing states
    const [editingMedia, setEditingMedia] = useState(null);
    const [mediaToDelete, setMediaToDelete] = useState(null);

    // Menu management
    const [openMenuIndex, setOpenMenuIndex] = useState(null);
    const menuRefs = useRef([]);

    // Fetch social media data
    const fetchSocialMedia = async () => {
        const token = Cookies.get('authToken');
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/social-media`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `${token}`,
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error("Failed to fetch social media");
            }

            const data = await response.json();
            setSocialMediaList(data.data.socialMedia);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSocialMedia();
    }, []);

    // Handle click outside menu
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (openMenuIndex !== null &&
                menuRefs.current[openMenuIndex] &&
                !menuRefs.current[openMenuIndex].contains(event.target)) {
                setOpenMenuIndex(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [openMenuIndex]);

    const toggleMenu = (index) => {
        setOpenMenuIndex(openMenuIndex === index ? null : index);
    };

    // Handle successful creation
    const handleCreateSuccess = (newMedia) => {
        setSocialMediaList(prev => [...prev, newMedia]);
        setShowCreateModal(false);
        setMessage('✅ Social media added successfully!');
        setTimeout(() => setMessage(''), 3000);
    };

    // Handle edit action
    const handleEditMedia = (media) => {
        setEditingMedia(media);
        setShowCreateModal(true);
    };

    // Handle successful update
    const handleUpdateSuccess = (updatedMedia) => {
        setSocialMediaList(prev =>
            prev.map(media =>
                media._id === updatedMedia._id ? updatedMedia : media
            )
        );
        setShowCreateModal(false);
        setMessage('✅ Social media updated successfully!');
        setTimeout(() => setMessage(''), 3000);
    };

    // Handle delete confirmation
    const handleDeleteClick = (media) => {
        setMediaToDelete(media);
        setShowDeleteModal(true); // This must be called
    };

    // Handle actual deletion
    const handleConfirmDelete = async () => {
        if (!mediaToDelete) return;

        const token = Cookies.get('authToken');
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/social-media/${mediaToDelete._id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `${token}`,
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error("Failed to delete social media");
            }

            setSocialMediaList(prev => prev.filter(media => media._id !== mediaToDelete._id));
            setMessage('✅ Social media deleted successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('❌ Error deleting social media');
        } finally {
            setShowDeleteModal(false);
            setMediaToDelete(null);
        }
    };

    // Get platform icon
    const getPlatformIcon = (mediaType) => {
        const platform = mediaType.toLowerCase();
        switch (platform) {
            case 'facebook':
                return <FaFacebook className="text-blue-600 text-2xl" />;
            case 'instagram':
                return <FaInstagram className="text-pink-600 text-2xl" />;
            case 'x':
                return <FaXTwitter className="text-black text-2xl" />;
            case 'threads':
                return <FaThreads className="text-black text-2xl" />;
            case 'whatsapp':
                return <FaWhatsapp className="text-green-500 text-2xl" />;
            case 'youtube':
                return <FaYoutube className="text-red-600 text-2xl" />;
            case 'linkedin':
                return <FaLinkedin className="text-blue-700 text-2xl" />;
            default:
                return <FaGlobe className="text-gray-600 text-2xl" />;
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* Header Section */}
            <div className="flex justify-between mb-6 items-center flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Social Media Offers</h1>
                    <p className="text-gray-600">Exclusive discounts from your favorite platforms</p>
                </div>
                <button
                    onClick={() => {
                        setEditingMedia(null);
                        setShowCreateModal(true);
                    }}
                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-md shadow transition"
                >
                    + Create Offer
                </button>
            </div>

            {/* Message Alert */}
            {message && (
                <div className={`mb-4 p-3 rounded-md ${message.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message}
                </div>
            )}

            {/* Loading State */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <FaSpinner className="animate-spin text-4xl text-blue-500" />
                </div>
            ) : error ? (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
                    <div className="flex items-center">
                        <FaExclamationTriangle className="text-red-500 mr-2" />
                        <p className="text-red-700 font-medium">{error}</p>
                    </div>
                </div>
            ) : (
                /* Social Media Cards Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {socialMediaList.length > 0 ? (
                        socialMediaList.map((media, index) => (
                            <SocialMediaCard
                                key={media._id}
                                media={media}
                                index={index}
                                getPlatformIcon={getPlatformIcon}
                                openMenuIndex={openMenuIndex}
                                toggleMenu={toggleMenu}
                                onEdit={() => handleEditMedia(media)}
                                onDelete={() => handleDeleteClick(media)} // This should trigger the modal
                                menuRefs={menuRefs}
                            />
                        ))
                    ) : (
                        /* Empty State */
                        <div className="col-span-full text-center py-12">
                            <div className="text-gray-400 mb-4">
                                <FaGlobe className="text-5xl mx-auto" />
                            </div>
                            <h3 className="text-xl font-medium text-gray-600 mb-2">No Social Media Accounts Found</h3>
                            <p className="text-gray-500">Connect your social media accounts to view offers</p>
                            <button
                                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-full transition-colors duration-300"
                                onClick={() => setShowCreateModal(true)}
                            >
                                Connect Account
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Create/Edit Modal */}
            {showCreateModal && (
                <CreateSocialMedia
                    onClose={() => {
                        setShowCreateModal(false);
                        setEditingMedia(null);
                    }}
                    onCreateSuccess={handleCreateSuccess}
                    onUpdateSuccess={handleUpdateSuccess}
                    editingMedia={editingMedia}
                    isEditing={!!editingMedia}
                />
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <DeleteConfirmationModal
                    mediaToDelete={mediaToDelete}
                    onClose={() => {
                        setShowDeleteModal(false);
                        setMediaToDelete(null);
                    }}
                    onConfirm={handleConfirmDelete}
                />
            )}
        </div>
    );
};

export default SocialMedia;