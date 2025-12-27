import React, { useRef } from "react";

const PresetCard = ({
  preset,
  index,
  openMenuIndex,
  toggleMenu,
  handleEditPreset,
  handleDeletePreset,
  setPresetToDelete,
  setShowDeleteModal,
  handleToggleActive,
  menuRefs,
}) => {
  const ref = useRef();

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Format time for display
  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Check if offer is currently active based on dates
  const isCurrentlyActive = () => {
    if (!preset.startAt || !preset.expireAt) return false;
    const now = new Date();
    const start = new Date(preset.startAt);
    const end = new Date(preset.expireAt);
    return now >= start && now <= end;
  };

  // Check if offer is expired
  const isExpired = () => {
    if (!preset.expireAt) return false;
    const now = new Date();
    const end = new Date(preset.expireAt);
    return now > end;
  };

  // Check if offer is upcoming
  const isUpcoming = () => {
    if (!preset.startAt) return false;
    const now = new Date();
    const start = new Date(preset.startAt);
    return now < start;
  };

  // Get status badge
  const getStatusBadge = () => {
    if (preset.isActive && isCurrentlyActive()) {
      return { text: "Active", color: "bg-emerald-100 text-emerald-700" };
    } else if (isExpired()) {
      return { text: "Expired", color: "bg-rose-100 text-rose-700" };
    } else if (isUpcoming()) {
      return { text: "Upcoming", color: "bg-amber-100 text-amber-700" };
    } else {
      return { text: "Inactive", color: "bg-gray-100 text-gray-700" };
    }
  };

  const status = getStatusBadge();

  return (
    <div
      className="relative bg-gradient-to-br from-white to-gray-50 border border-gray-200/60 shadow-lg rounded-2xl p-6 transform hover:scale-[1.02] hover:shadow-xl transition-all duration-300 group overflow-hidden"
    >
    <div className="absolute top-0 right-0 bg-gradient-to-r from-indigo-400 to-purple-500">{preset.status}</div>

      {/* Decorative gradient accent */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-400 to-purple-500"></div>
      
      {/* 3-dots menu */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => toggleMenu(index)}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
          aria-label="Options"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 3a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm0 5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm0 5a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" />
          </svg>
        </button>

        {openMenuIndex === index && (
          <div
            ref={(el) => (menuRefs.current[index] = el)}
            className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden py-2 transition-all duration-200"
          >
            <button
              onClick={() => handleEditPreset(preset)}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Offer
            </button>
            <button
              onClick={() => {
                setPresetToDelete(preset);
                setShowDeleteModal(true);
              }}
              className="w-full text-left px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Offer
            </button>
            <button
              onClick={() => handleToggleActive(preset)}
              disabled={preset.isActive}
              className={`w-full text-left px-4 py-2.5 text-sm hover:bg-emerald-50 transition-colors flex items-center ${
                preset.isActive ? "text-gray-400 cursor-not-allowed" : "text-emerald-600 hover:text-emerald-700"
              }`}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Activate Offer
            </button>
          </div>
        )}
      </div>

      {/* Preset Content */}
      <div className="mb-5">
        <h3 className="text-xl font-bold text-gray-800 tracking-wide pb-2 flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a1 1 0 00-.894.553L7.382 6H4a1 1 0 000 2h3a1 1 0 00.894-.553L9.618 4H16a1 1 0 100-2h-6z" />
            <path d="M4 10a1 1 0 011-1h10a1 1 0 011 1v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6z" />
          </svg>
          {preset.presetName}
        </h3>
      </div>

      <div className="text-sm text-gray-700 space-y-3">
        {/* Discount Info */}
        <div className="bg-indigo-50 p-3 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium text-indigo-700">Discount</span>
            <span className="font-semibold text-indigo-800">
              {preset.discountType === 'percentage' 
                ? `${preset.discountAmount}% OFF` 
                : preset.discountType === 'fixed' 
                  ? `₹${preset.discountAmount} OFF`
                  : preset.discountAmount}
            </span>
          </div>
          {preset.maxDiscount && preset.discountType !== 'custom' && (
            <div className="text-xs text-indigo-600 mt-1">
              Max discount: ₹ {preset.maxDiscount}
            </div>
          )}
        </div>

        {/* Requirements */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-xs text-gray-500 font-medium">Min Purchase</div>
            <div className="font-semibold">₹{preset.minPurchase || "0"}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-xs text-gray-500 font-medium">Usage Limit</div>
            <div className="font-semibold">{preset.usageLimit || "∞"}</div>
          </div>
        </div>

        {/* Date Information */}
        <div className="border-t border-gray-100 pt-3 space-y-2">
          <div className="flex items-center text-xs text-gray-500">
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="font-medium">Validity Period</span>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <div>
              <div className="text-xs text-gray-500">Starts</div>
              <div className="font-medium">{formatDate(preset.startAt)}</div>
              <div className="text-xs text-gray-500">{formatTime(preset.startAt)}</div>
            </div>
            <div className="text-gray-300 mx-2">→</div>
            <div>
              <div className="text-xs text-gray-500">Ends</div>
              <div className="font-medium">{formatDate(preset.expireAt)}</div>
              <div className="text-xs text-gray-500">{formatTime(preset.expireAt)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mt-5 pt-3 border-t border-gray-100">
        <span className={`inline-block ${status.color} text-xs px-3 py-1.5 rounded-full font-semibold tracking-wide shadow-sm`}>
          {status.text}
        </span>
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"></div>
    </div>
  );
};

export default PresetCard;