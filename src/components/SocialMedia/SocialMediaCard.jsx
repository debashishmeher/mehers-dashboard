import React, { useState, useRef, useEffect } from 'react';
import { FaTag, FaEllipsisV, FaEdit, FaTrash } from 'react-icons/fa';
import MessagePopup from '../Common/MessagePopup';
import { FaDeleteLeft } from 'react-icons/fa6';

const SocialMediaCard = ({
    media,
    getPlatformIcon,
    index,
    openMenuIndex,
    toggleMenu,
    onEdit,
    onDelete,
    setMediaToDelete,
    setShowDeleteModal,
    menuRefs
}) => {
    const [message, setMessage] = useState('');

    const handleEdit = () => {
        onEdit(media);
        toggleMenu(index);
    };

    // Check if media has rewards data
    const hasRewards = media.rewards && Object.keys(media.rewards).length > 0;

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100 relative">
            {message && (
                <MessagePopup
                    message={message}
                    type={message.includes('✅') ? 'success' : 'error'}
                    onClose={() => setMessage('')}
                />
            )}

            {/* Three-dot menu button */}
            <div className="absolute top-4 right-4" ref={el => menuRefs.current[index] = el}>
                <button
                    onClick={() => toggleMenu(index)}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <FaEllipsisV />
                </button>

                {/* Dropdown menu */}
                {openMenuIndex === index && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200 overflow-hidden">
                    <div className="py-1">
                        <button
                            onClick={handleEdit}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                            <FaEdit className="w-4 h-4 mr-3 text-gray-500" />
                            Edit
                        </button>
                        <button
                            onClick={() => onDelete(media)}  // Just call onDelete with the media
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors"
                        >
                            <FaDeleteLeft className="w-4 h-4 mr-3 text-red-500" />
                            Delete
                        </button>
                    </div>
                </div>
            )}
            </div>

            {/* Card content */}
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center">
                        <div className="p-3 bg-gray-100 rounded-lg mr-4">
                            {getPlatformIcon(media.mediaType)}
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 capitalize">
                                {media.mediaType.toLowerCase()}
                            </h3>
                            <a
                                href={media.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline text-sm"
                            >
                                Visit Page
                            </a>
                        </div>
                    </div>
                </div>

                {/* Reward display section - conditional rendering */}
                {hasRewards ? (
                    <div className="rounded-lg p-3 mb-4 bg-gradient-to-r from-yellow-100 via-yellow-50 to-yellow-100 border border-yellow-200 shadow-sm">
                        <h4 className="text-xs font-semibold text-yellow-800 mb-1 flex items-center tracking-wide">
                            <FaTag className="mr-2 text-yellow-700" /> DISCOUNT OFFER
                        </h4>
                        <div className="space-y-2">
                            <p className="text-lg font-bold text-yellow-900 text-center">
                                {media.rewards.discountType === 'percentage' && `${media.rewards.discountAmount}% Off`}
                                {media.rewards.discountType === 'fixed' && `₹${media.rewards.discountAmount} Off`}
                                {media.rewards.discountType === 'custom' && media.rewards.discountAmount}
                            </p>
                            {media.rewards.minPurchase && (
                                <p className="text-xs text-yellow-700 text-center">
                                    On min. purchase of ₹{media.rewards.minPurchase}
                                </p>
                            )}
                            {media.rewards.maxDiscount && (
                                <p className="text-xs text-yellow-700 text-center">
                                    Max. discount: ₹{media.rewards.maxDiscount}
                                </p>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="rounded-lg p-3 mb-4 bg-gradient-to-r from-yellow-100 via-yellow-50 to-yellow-100 border border-yellow-200 shadow-sm">
                        <h4 className="text-xs font-semibold text-yellow-800 mb-1 flex items-center tracking-wide">
                            <FaTag className="mr-2 text-yellow-700" /> DISCOUNT OFFER
                        </h4>
                        <p className="text-2xl font-bold text-yellow-900 text-center">
                            100 coins
                        </p>
                    </div>
                )}

                {media.conditions && media.conditions.length > 0 && (
                    <div className="mb-5">
                        <div className="flex items-center mb-3">
                            <div className="w-4 h-0.5 bg-gray-300 mr-3"></div>
                            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500">
                                TERMS & CONDITIONS
                            </h4>
                        </div>
                        <ul className="space-y-3">
                            {media.conditions.map((condition, index) => (
                                <li key={index} className="flex items-start">
                                    <div className="flex-shrink-0 mt-0.5">
                                        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 border border-gray-200">
                                            <span className="text-xs font-bold text-gray-600">{index + 1}</span>
                                        </div>
                                    </div>
                                    <span className="ml-3 text-sm font-medium text-gray-800 leading-tight">
                                        {condition}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <p className="text-xs text-gray-500 italic flex items-center my-2">
                    <span className="text-yellow-500 mr-1">★</span>
                    This reward is set by Thryvoo
                </p>

                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors duration-300 font-medium">
                    Follow For Updates
                </button>
            </div>
        </div>
    );
};

export default SocialMediaCard;