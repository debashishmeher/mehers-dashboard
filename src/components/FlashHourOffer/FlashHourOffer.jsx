import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import MessagePopup from '../Common/MessagePopup';
import PresetForm from './presetForm';
import PresetToggle from './PresetToggle';
import PresetCard from './PresetCard';
import { useUser } from '../../Context/ContextApt';

const FlashHourOffer = () => {
    const [presets, setPresets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [openMenuIndex, setOpenMenuIndex] = useState(null);
    const [presetToDelete, setPresetToDelete] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingPresetId, setEditingPresetId] = useState(null);

    const menuRefs = useRef([]);
    const { userData } = useUser();
    const { userId } = useParams();
    
    const userRole = userData?.user?.role || '';
    
    // Memoize API URLs to prevent recalculations on every render
    const apiUrls = useMemo(() => {
        const baseUrl = import.meta.env.VITE_API_URL;
        return {
            getUrl: userRole === 'admin' 
                ? `${baseUrl}/api/admin/user/${userId}/getDiscount`
                : `${baseUrl}/api/user/getCoupon`,
            setUrl: userRole === 'admin'
                ? `${baseUrl}/api/admin/user/${userId}/setDiscount`
                : `${baseUrl}/api/user/setCoupon`,
            editUrl: (id) => userRole === 'admin'
                ? `${baseUrl}/api/admin/user/${userId}/presets/${id}`
                : `${baseUrl}/api/user/coupon/presets/${id}`,
            toggleUrl: (id) => userRole === 'admin'
                ? `${baseUrl}/api/admin/user/${userId}/presets/${id}/setActive`
                : `${baseUrl}/api/user/coupon/presets/${id}/setActive`
        };
    }, [userRole, userId]);

    const initialFormState = useMemo(() => ({
        discountType: 'percentage',
        presetName: '',
        discountAmount: '',
        maxDiscount: '',
        minPurchase: '',
        day: '',
        usageLimit: '',
        type: 'offer'
    }), []);

    const [form, setForm] = useState(initialFormState);

    // Fetch only offer presets
    const fetchPresets = useCallback(async () => {
        try {
            const res = await fetch(apiUrls.getUrl, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                // Filter to only show offer presets
                const offerPresets = data.discount?.filter(preset => preset.type === 'offer') || [];
                setPresets(offerPresets);
            }
        } catch (err) {
            console.error("Failed to fetch presets:", err);
        }
    }, [apiUrls.getUrl]);

    useEffect(() => {
        fetchPresets();
    }, [fetchPresets]);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    }, []);

    const resetForm = useCallback(() => {
        setForm(initialFormState);
    }, [initialFormState]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!form.presetName || !form.discountAmount) {
            setMessage('❌ Please fill in all required fields');
            return;
        }
        
        setLoading(true);
        setMessage('');

        const {
            discountType, presetName, discountAmount,
            maxDiscount, minPurchase, usageLimit, startAt, expireAt
        } = form;

        try {
            const method = isEditing ? 'PATCH' : 'POST';
            const url = isEditing ? apiUrls.editUrl(editingPresetId) : apiUrls.setUrl;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    discountType,
                    presetName,
                    discountAmount,
                    maxDiscount: maxDiscount ? parseFloat(maxDiscount) : undefined,
                    minPurchase: minPurchase ? parseFloat(minPurchase) : undefined,
                    usageLimit: usageLimit ? parseInt(usageLimit) : undefined,
                    startAt: startAt ? new Date(startAt).toISOString() : undefined,
                    expireAt: expireAt ? new Date(expireAt).toISOString() : undefined,
                    type: 'offer'
                })
            });

            const data = await res.json();

            if (res.ok) {
                setMessage(isEditing ? '✅ Offer updated!' : '✅ Offer created successfully!');
                resetForm();
                fetchPresets();
                setShowForm(false);
                setIsEditing(false);
                setEditingPresetId(null);
            } else {
                setMessage(data.message || '❌ Failed to save offer.');
            }
        } catch (err) {
            console.error(err);
            setMessage('❌ Error saving offer.');
        } finally {
            setLoading(false);
        }
    };

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

    const handleDeletePreset = useCallback(async (preset) => {
        try {
            const deleteUrl = `${import.meta.env.VITE_API_URL}/api/user/coupon/presets/${preset._id}`;
            const res = await fetch(deleteUrl, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (res.ok) {
                setMessage('✅ Offer deleted successfully!');
                setPresets(prev => prev.filter(p => p._id !== preset._id));
            } else {
                const data = await res.json();
                setMessage(data.message || '❌ Failed to delete offer.');
            }
        } catch (err) {
            console.error("Delete failed:", err);
            setMessage('❌ Error deleting offer.');
        }
    }, []);

    const handleToggleActive = useCallback(async (preset) => {
        try {
            const res = await fetch(apiUrls.toggleUrl(preset._id), {
                method: 'PATCH',
                credentials: 'include',
            });

            const data = await res.json();

            if (res.ok) {
                // Optimistically update UI
                setPresets((prevPresets) =>
                    prevPresets.map((p) => ({
                        ...p,
                        isActive: p._id === preset._id ? !p.isActive : p.isActive,
                    }))
                );
                
                // Refresh data to ensure consistency
                setTimeout(() => fetchPresets(), 300);
            } else {
                setMessage(data.message || '❌ Failed to update status.');
            }
        } catch (err) {
            console.error("Toggle error:", err);
            setMessage('❌ Error updating status.');
        }
    }, [apiUrls, fetchPresets]);

    const handleEditPreset = useCallback((preset) => {
        setForm({
            discountType: preset.discountType || 'percentage',
            presetName: preset.presetName || '',
            discountAmount: preset.discountAmount || '',
            maxDiscount: preset.maxDiscount || '',
            minPurchase: preset.minPurchase || '',
            day: preset.day || '',
            usageLimit: preset.usageLimit || '',
            type: preset.type || 'offer',
            startAt: preset.startAt || '',
            expireAt: preset.expireAt || ''
        });

        setIsEditing(true);
        setEditingPresetId(preset._id);
        setShowForm(true);
    }, []);

    const closeForm = useCallback(() => {
        setShowForm(false);
        setIsEditing(false);
        setEditingPresetId(null);
        resetForm();
    }, [resetForm]);

    return (
        <div className="p-6 max-w-7xl mx-auto bg-white rounded-lg shadow-md min-h-screen">
            {message && (
                <MessagePopup 
                    message={message} 
                    type={`${message.includes('✅') ? 'success' : 'error'}`} 
                    onClose={() => setMessage('')} 
                />
            )}

            <div className="flex justify-between mb-6 items-center flex-wrap gap-4">
                <h1 className="text-3xl font-bold text-gray-900">Special Offers</h1>
                <button
                    onClick={() => setShowForm(true)}
                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-md shadow transition"
                >
                    + Create Offer
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 my-6">
                {presets.length > 0 ? (
                    presets.map((preset, index) => (
                        <PresetCard
                            key={preset._id || index}
                            preset={preset}
                            index={index}
                            openMenuIndex={openMenuIndex}
                            toggleMenu={setOpenMenuIndex}
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
                        No offers found. Create your first offer!
                    </div>
                )}
            </div>

            {/* Backdrop Overlay */}
            {showForm && (
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
                    onClick={closeForm}
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
                title={isEditing ? "Edit Offer" : "Create New Offer"}
                onClose={closeForm}
            />

            {showDeleteModal && (
                <PresetToggle
                    presetToDelete={presetToDelete}
                    setShowDeleteModal={setShowDeleteModal}
                    handleDeletePreset={handleDeletePreset}
                    setPresetToDelete={setPresetToDelete}
                    title="Delete Offer"
                    message="Are you sure you want to delete this offer?"
                />
            )}
        </div>
    );
};

export default React.memo(FlashHourOffer);