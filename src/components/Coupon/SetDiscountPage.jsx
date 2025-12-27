import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import MessagePopup from '../Common/MessagePopup';
import PresetForm from './presetForm';
import PresetToggle from './PresetToggle';
import PresetCard from './PresetCard';
import { useUser } from '../../Context/ContextApt';

const SetDiscountPage = () => {
    const [presets, setPresets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [openMenuIndex, setOpenMenuIndex] = useState(null);
    const [presetToDelete, setPresetToDelete] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingPresetId, setEditingPresetId] = useState(null);
    const [activeTab, setActiveTab] = useState("Own");

    const menuRefs = useRef([]);
    const { userData } = useUser();
    const user = userData.user.role;


    const toggleMenu = (i) => {
        setOpenMenuIndex(openMenuIndex === i ? null : i);
    };

    const [form, setForm] = useState({
        discountType: 'percentage',
        presetName: '',
        discountAmount: '',
        maxDiscount: '',
        minPurchase: '',
        day: '',
        usageLimit: '',
        type: 'own'
    });

    const tabs = ["Own", "Cross Brand"]

    const { userId } = useParams();
    const getUrl = user === 'admin'
        ? `${import.meta.env.VITE_API_URL}/api/admin/user/${userId}/getDiscount`
        : `${import.meta.env.VITE_API_URL}/api/user/getCoupon`;

    const setUrl = user === 'admin'
        ? `${import.meta.env.VITE_API_URL}/api/admin/user/${userId}/setDiscount`
        : `${import.meta.env.VITE_API_URL}/api/user/setCoupon`;


    // fetch all presets data
    const fetchPresets = async () => {
        try {
            const res = await fetch(getUrl, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setPresets(data.discount || []);
            }
        } catch (err) {
            console.error("Failed to fetch presets:", err);
        }
    };



    useEffect(() => {
        fetchPresets();
    }, []);





    // handle change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setForm({
            discountType: 'percentage',
            presetName: '',
            discountAmount: '',
            maxDiscount: '',
            minPurchase: '',
            day: '',
            usageLimit: '',
            type: 'own'
        });
    };


    // handle submit 
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const {
            discountType, presetName, discountAmount,
            maxDiscount, minPurchase, day, usageLimit, type, conditions, link, startAt,
            expireAt
        } = form;

        try {
            const method = isEditing ? 'PATCH' : 'POST';
            let url;

            if (isEditing) {
                url = user === 'admin'
                    ? `${import.meta.env.VITE_API_URL}/api/admin/user/${userId}/presets/${editingPresetId}`
                    : `${import.meta.env.VITE_API_URL}/api/user/coupon/presets/${editingPresetId}`;
            } else {
                url = setUrl;
            }
            console.log({
                discountType,
                presetName,
                discountAmount,
                maxDiscount: parseFloat(maxDiscount),
                minPurchase: parseFloat(minPurchase),
                day: parseInt(day),
                usageLimit: parseInt(usageLimit),
                type
            });

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    discountType,
                    presetName,
                    discountAmount,
                    maxDiscount: parseFloat(maxDiscount),
                    minPurchase: parseFloat(minPurchase),
                    day: parseInt(day),
                    usageLimit: parseInt(usageLimit),
                    type,
                    conditions,
                    link,
                    startAt,
                    expireAt
                })
            });

            const data = await res.json();

            if (res.ok) {
                setMessage(isEditing ? '✅ Preset updated!' : '✅ Coupon set successfully!');
                resetForm();
                fetchPresets();
                setShowForm(false);
                setIsEditing(false);
                setEditingPresetId(null);
            } else {
                setMessage(data.message || '❌ Failed to save preset.');
            }
        } catch (err) {
            console.error(err);
            setMessage('❌ Error saving preset.');
        } finally {
            setLoading(false);
        }
    };




    // 3 dots menu action
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                openMenuIndex !== null &&
                menuRefs.current[openMenuIndex] &&
                !menuRefs.current[openMenuIndex].contains(event.target)
            ) {
                setOpenMenuIndex(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [openMenuIndex]);

    // delete preset
    const handleDeletePreset = async (preset) => {

        try {
            const deleteUrl = `${import.meta.env.VITE_API_URL}/api/user/coupon/presets/${preset._id}`;
            const res = await fetch(deleteUrl, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (res.ok) {
                setMessage('✅ Preset deleted successfully!');
                setPresets(prev => prev.filter(p => p._id !== preset._id));
                // Refresh the list
            } else {
                const data = await res.json();
                setMessage(data.message || '❌ Failed to delete preset.');
            }
        } catch (err) {
            console.error("Delete failed:", err);
            setMessage('❌ Error deleting preset.');
        }
    };


    // set active status
    const handleToggleActive = async (preset) => {
        try {
            let toggleUrl;
            if (user === "admin") {
                toggleUrl = `${import.meta.env.VITE_API_URL}/api/admin/user/${userId}/presets/${preset._id}/setActive`;
            } else {
                toggleUrl = `${import.meta.env.VITE_API_URL}/api/user/coupon/presets/${preset._id}/setActive`;
            }
            const res = await fetch(toggleUrl, {
                method: 'PATCH', // Assuming PATCH is used for partial updates
                credentials: 'include',
            });

            const data = await res.json();

            if (res.ok) {
                // Update local state

                setPresets((prevPresets) =>
                    prevPresets.map((p) => ({
                        ...p,
                        isActive: p._id === preset._id, // Only one active at a time
                    }))
                );

                // ✅ Optional: ensure consistency with server
                fetchPresets();

            } else {
                setMessage(data.message || '❌ Failed to update status.');
            }
        } catch (err) {
            console.error("Toggle error:", err);
            setMessage('❌ Error updating status.');
        }
    };

    // edit preset
    const handleEditPreset = (preset) => {
        setForm({
            discountType: preset.discountType || 'percentage',
            presetName: preset.presetName || '',
            discountAmount: preset.discountAmount || '',
            maxDiscount: preset.maxDiscount || '',
            minPurchase: preset.minPurchase || '',
            day: preset.day || '',
            usageLimit: preset.usageLimit || '',
            type: preset.type || 'own'
        });

        setIsEditing(true);
        setEditingPresetId(preset._id);
        setShowForm(true);
    };



    const filteredPresets = presets.filter(preset => {
        if (activeTab === 'Own') return preset.type === 'own';
        if (activeTab === 'Cross Brand') return preset.type === 'cross';
        if (activeTab === 'Offer') return preset.type === 'offer';
        return false;
    });

    return (
        <div className="p-6 max-w-7xl mx-auto bg-white rounded-lg shadow-md min-h-screen">

            {message && (
                <MessagePopup message={message} type={`${message.includes('✅') ? 'success' : 'error'}`} onClose={() => setMessage('')} />
            )}

            <div className="flex justify-between mb-6 items-center flex-wrap gap-4">
                <h1 className="text-3xl font-bold text-gray-900">Coupon Presets</h1>
                <button
                    onClick={() => setShowForm(true)}
                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-md shadow transition"
                >
                    + Create Coupon
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 -mb-px text-sm font-medium border-b-2 transition-colors duration-200 ${activeTab === tab
                            ? "border-indigo-600 text-indigo-600"
                            : "border-transparent text-gray-500 hover:text-indigo-500 hover:border-gray-300"
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>



            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 my-6">
                {filteredPresets.length > 0 ? (
                    filteredPresets.map((preset, index) => (
                        <PresetCard
                            key={index}
                            preset={preset}
                            index={index}
                            openMenuIndex={openMenuIndex}
                            toggleMenu={toggleMenu}
                            handleEditPreset={handleEditPreset}
                            handleDeletePreset={handleDeletePreset}
                            setPresetToDelete={setPresetToDelete}
                            setShowDeleteModal={setShowDeleteModal}
                            handleToggleActive={handleToggleActive}
                            menuRefs={menuRefs}
                        />
                    ))
                ) : (
                    <div className="text-gray-500 col-span-full text-center py-10">
                        No {activeTab} presets found.
                    </div>
                )}

            </div>


            {/* Backdrop Overlay */}
            {showForm && (
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
                    onClick={() => setShowForm(false)}
                />
            )}

            {/* Slide-In Form Drawer */}
            <PresetForm
                showForm={showForm}
                setShowForm={setShowForm}
                form={form}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                resetForm={resetForm}
                loading={loading}
                isEditing={isEditing}
            />

            {showDeleteModal && (
                <PresetToggle
                    presetToDelete={presetToDelete}
                    setShowDeleteModal={setShowDeleteModal}
                    handleDeletePreset={handleDeletePreset}
                    setPresetToDelete={setPresetToDelete}
                />
            )}
        </div>
    );
};

export default SetDiscountPage;
