import React, { useEffect, useState, useRef } from 'react';
import MessagePopup from '../Common/MessagePopup';
import PresetToggle from './PresetToggle';
import PresetCard from './presetCard';
import Cookies from "js-cookie";

const MyPreset = () => {
  const [presets, setPresets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const [presetToDelete, setPresetToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const menuRefs = useRef([]);
  const API_URL = import.meta.env.VITE_API_URL;
  const token = Cookies.get("authToken");

  // Fetch cross brand presets
  const fetchPresets = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/cross-brand`, {
        method: "GET",
        credentials: "include",
        headers: {
          Authorization: `${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setPresets(data?.data.crossbrands || []);
      } else {
        setMessage('❌ Failed to fetch coupons.');
      }
    } catch (err) {
      console.error('Failed to fetch presets:', err);
      setMessage('❌ Error loading coupons.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPresets();
  }, []);

  // Handle outside click for menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuIndex !== null &&
        menuRefs.current[openMenuIndex] &&
        !menuRefs.current[openMenuIndex].contains(event.target)) {
        setOpenMenuIndex(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuIndex]);

  // Delete preset
  const handleDeletePreset = async (id) => {
    
    try {
      const res = await fetch(`${API_URL}/api/cross-brand/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        setMessage('✅ Coupon deleted successfully!');
        setPresets(presets.filter(p => p.id !== id));
      } else {
        setMessage('❌ Failed to delete coupon.');
      }
    } catch (err) {
      console.error('Delete failed:', err);
      setMessage('❌ Error deleting coupon.');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-white rounded-lg shadow-md min-h-screen">
      {message && (
        <MessagePopup
          message={message}
          type={message.includes('✅') ? 'success' : 'error'}
          onClose={() => setMessage('')}
        />
      )}

      <div className="flex justify-between mb-6 items-center flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Cross-Brand Coupons</h1>
        <button
          onClick={fetchPresets}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-md shadow transition"
        >
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-600">Loading coupons...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 my-6">
          {presets.length > 0 ? (
            presets.map((preset, index) => (
              <PresetCard
                key={preset._id}
                preset={preset}
                index={index}
                openMenuIndex={openMenuIndex}  // Changed from setOpenMenuIndex to openMenuIndex
                setOpenMenuIndex={setOpenMenuIndex}
                setPresetToDelete={setPresetToDelete}
                setShowDeleteModal={setShowDeleteModal}
                menuRefs={menuRefs}
              />
            ))
          ) : (
            <div className="text-gray-500 col-span-full text-center py-10">
              No coupons available
            </div>
          )}
        </div>
      )}

      {showDeleteModal && (
        <PresetToggle
          presetToDelete={presetToDelete}
          setShowDeleteModal={setShowDeleteModal}
          handleDeletePreset={handleDeletePreset}
          title="Delete Coupon"
          message="Are you sure you want to delete this coupon?"
        />
      )}
    </div>
  );
};

export default MyPreset;