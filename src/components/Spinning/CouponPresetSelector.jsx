import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const CouponPresetSelector = ({ 
  existingPresets = [], 
  onAddSpin, 
  onClose 
}) => {
  const [presets, setPresets] = useState([]);
  const [filteredPresets, setFilteredPresets] = useState([]);
  const [selectedPreset, setSelectedPreset] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Normalize IDs and filter out existing presets
  useEffect(() => {
    const existingIds = existingPresets.map((p) => (typeof p === 'string' ? p : p._id));
    if (presets.length > 0 && existingIds.length > 0) {
      setFilteredPresets(
        presets.filter((preset) => !existingIds.includes(preset._id))
      );
    } else {
      setFilteredPresets(presets);
    }
  }, [presets, existingPresets]);

  // Fetch preset data from API
  const fetchPresets = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = Cookies.get('authToken');
      if (!token) throw new Error('Authentication token not found');

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/user/coupon/presetsName`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `${token}`,
          },
          credentials: 'include',
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch presets');

      setPresets(data.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch presets');
      console.error('Error fetching presets:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle add spin (notify parent only)
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedPreset) {
      setError('Please select a preset');
      return;
    }

    const presetObj = presets.find((p) => p._id === selectedPreset);
    if (presetObj && onAddSpin) {
      onAddSpin(presetObj); // pass full preset object
      setSuccess('Item added successfully');
      setSelectedPreset('');
    } else {
      setError('Invalid preset selected');
    }
  };

  // Fetch presets on mount
  useEffect(() => {
    fetchPresets();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="relative w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Select Coupon Preset
        </h2>

        {loading && !presets.length && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
            {success}
          </div>
        )}

        {filteredPresets.length > 0 ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {filteredPresets.map((preset) => (
                <label
                  key={preset._id}
                  className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <input
                    type="radio"
                    name="preset"
                    value={preset._id}
                    checked={selectedPreset === preset._id}
                    onChange={(e) => setSelectedPreset(e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-gray-700 font-medium">
                    {preset.presetName}
                  </span>
                </label>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || !selectedPreset}
              className={`w-full py-2 px-4 rounded-md text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                loading || !selectedPreset
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? 'Processing...' : 'Add Selected Item'}
            </button>
          </form>
        ) : (
          !loading && (
            <div className="text-center py-4 text-gray-500">
              {presets.length > 0 && existingPresets.length > 0
                ? 'All available presets have already been added'
                : 'No presets available'}
            </div>
          )
        )}

        {presets.length > 0 && (
          <button
            onClick={fetchPresets}
            disabled={loading}
            className="mt-4 w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Refresh Presets
          </button>
        )}
      </div>
    </div>
  );
};

export default CouponPresetSelector;
