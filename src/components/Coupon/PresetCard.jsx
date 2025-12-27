import React, { useRef } from "react";
import { Tag, Gift, Crosshair, Calendar, Clock, CheckCircle } from "lucide-react";

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

  // Get icon based on offer type
  const getTypeIcon = (type) => {
    switch (type) {
      case 'cross':
        return <Crosshair className="w-4 h-4 text-blue-500" />;
      case 'own':
        return <Gift className="w-4 h-4 text-green-500" />;
      case 'offer':
      default:
        return <Tag className="w-4 h-4 text-purple-500" />;
    }
  };

  // Get label based on offer type
  const getTypeLabel = (type) => {
    switch (type) {
      case 'cross':
        return 'Cross Promotion';
      case 'own':
        return 'Own Promotion';
      case 'offer':
      default:
        return 'Special Offer';
    }
  };

  // Format date range for display
  const formatDateRange = (startAt, expireAt) => {
    if (!startAt || !expireAt) return "No validity period set";
    
    const start = new Date(startAt);
    const end = new Date(expireAt);
    
    return `${start.toLocaleDateString()} ${start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${end.toLocaleDateString()} ${end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
  };

  // Check if offer is currently active based on validity period
  const isCurrentlyActive = (preset) => {
    if (!preset.startAt || !preset.expireAt) return preset.isActive;
    
    const now = new Date();
    const start = new Date(preset.startAt);
    const end = new Date(preset.expireAt);
    
    return preset.isActive && now >= start && now <= end;
  };

  const currentlyActive = isCurrentlyActive(preset);

  return (
    <div
      key={index}
      className="relative bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-200 shadow-md rounded-2xl p-6 transform hover:scale-[1.02] hover:shadow-xl transition-all duration-300"
    >
      {/* 3-dots menu */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => toggleMenu(index)}
          className="text-gray-500 hover:text-gray-700"
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
            className="absolute right-0 mt-2 w-48 bg-white z-10 bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-200 shadow-md rounded-2xl p-4 transition-all duration-300"
          >
            <button
              onClick={() => handleEditPreset(preset)}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
            >
              ✏️ Edit
            </button>
            <button
              onClick={() => {
                setPresetToDelete(preset);
                setShowDeleteModal(true);
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
            >
              🗑️ Delete
            </button>
            <button
              onClick={() => handleToggleActive(preset)}
              disabled={preset.isActive}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                preset.isActive ? "text-gray-400 cursor-not-allowed" : ""
              }`}
            >
              ✅ Activate
            </button>
          </div>
        )}
      </div>

      {/* Preset Content */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-indigo-600 tracking-wide border-b-2 pb-2 border-indigo-200 flex items-center gap-2">
            {getTypeIcon(preset.type || 'offer')}
            {preset.presetName}
          </h3>
          <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {getTypeLabel(preset.type || 'offer')}
          </span>
        </div>
      </div>

      <div className="text-sm text-gray-700 space-y-2">
        {/* Discount Information */}
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="font-medium text-blue-700">Discount Type</div>
            <div className="capitalize text-blue-900">{preset.discountType}</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="font-medium text-green-700">
              {preset.discountType === 'custom' ? 'Custom Offer' : preset.discountType === 'percentage' ? 'Discount %' : 'Discount Amount'}
            </div>
            <div className="text-green-900">{preset.discountAmount}</div>
          </div>
        </div>

        {/* Additional Details */}
        {[
          { label: "Max Discount", value: preset.maxDiscount || "N/A", bg: "bg-purple-50", text: "text-purple-700" },
          { label: "Min Purchase", value: preset.minPurchase || "N/A", bg: "bg-orange-50", text: "text-orange-700" },
          { label: "Usage Limit", value: preset.usageLimit || "N/A", bg: "bg-red-50", text: "text-red-700" },
        ].map((item, idx) => (
          item.value !== "N/A" && (
            <div key={idx} className={`flex items-center justify-between p-3 rounded-lg ${item.bg}`}>
              <span className={`font-medium ${item.text}`}>{item.label}:</span>
              <span className={item.text.replace('700', '900')}>{item.value}</span>
            </div>
          )
        ))}

        {/* Validity Period */}
        {preset.startAt && preset.expireAt && (
          <div className="bg-indigo-50 p-3 rounded-lg">
            <div className="font-medium text-indigo-700 flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4" />
              Validity Period
            </div>
            <div className="text-indigo-900 text-xs flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDateRange(preset.startAt, preset.expireAt)}
            </div>
          </div>
        )}

        {/* Conditions */}
        {preset.conditions && preset.conditions.length > 0 && preset.conditions[0] !== "" && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="font-medium text-gray-700 mb-1">Conditions</div>
            <div className="text-gray-900 text-xs space-y-1">
              {preset.conditions.map((condition, idx) => (
                <div key={idx} className="flex items-start gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{condition}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Link */}
        {preset.link && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="font-medium text-blue-700">Offer Link</div>
            <a 
              href={preset.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-900 text-xs underline truncate block"
            >
              {preset.link}
            </a>
          </div>
        )}

        {/* Created At */}
        <div className="flex items-center justify-between py-2 border-t border-gray-200 mt-2">
          <span className="font-medium text-gray-600">Created:</span>
          <span className="text-gray-500 text-xs">
            {preset?.createdAt ? new Date(preset.createdAt).toLocaleDateString() : "N/A"}
          </span>
        </div>
      </div>

      {/* Status Badges */}
      <div className="mt-4 flex justify-between items-center">
        {preset.isActive && (
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide shadow-sm ${
            currentlyActive 
              ? "bg-emerald-100 text-emerald-700" 
              : "bg-gray-100 text-gray-700"
          }`}>
            {currentlyActive ? "Currently Active" : "Scheduled"}
          </span>
        )}
        
        {preset.startAt && preset.expireAt && !currentlyActive && preset.isActive && (
          <span className="text-xs text-gray-500">
            {new Date() < new Date(preset.startAt) ? "Starts soon" : "Expired"}
          </span>
        )}
      </div>
    </div>
  );
};

export default PresetCard;