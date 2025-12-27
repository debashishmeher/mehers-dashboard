import { useState, useRef, useEffect } from "react";
import { MapPin, ChevronDown, ChevronRight, Navigation, Building, Map, Globe, Hash } from "lucide-react";

export default function AddressSec({ cardData, openModal }) {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef(null);
  const [height, setHeight] = useState(0);

  const addressLine = cardData?.addressLine || "Not set";
  const city = cardData?.city || "Not set";
  const state = cardData?.state || "Not set";
  const country = cardData?.country || "Not set";
  const pinCode = cardData?.pinCode || "Not set";

  const addressFields = [
    { label: "Address Line", value: addressLine, field: "addressLine", icon: Navigation },
    { label: "City", value: city, field: "city", icon: Building },
    { label: "State", value: state, field: "state", icon: Map },
    { label: "Country", value: country, field: "country", icon: Globe },
    { label: "Pin Code", value: pinCode, field: "pinCode", icon: Hash },
  ];

  const renderRow = (label, value, field, IconComponent) => (
    <div
      key={field}
      className="cursor-pointer flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 group last:border-b-0"
      onClick={() => openModal(field, label)}
      title={value}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
            <IconComponent className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
              {label}
            </span>
            <span className="text-gray-900 dark:text-white font-medium truncate block mt-1">
              {value}
            </span>
          </div>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transform transition-transform duration-300 group-hover:translate-x-1" />
    </div>
  );

  useEffect(() => {
    if (contentRef.current) {
      setHeight(isOpen ? contentRef.current.scrollHeight : 0);
    }
  }, [isOpen]);

  const hasAddressData = addressFields.some(field => field.value !== "Not set");

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-900/20 rounded-xl border border-gray-200 dark:border-gray-700 w-full overflow-hidden transition-all duration-300 hover:shadow-xl dark:hover:shadow-gray-900/30">
      {/* Header */}
      <div
        className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
            <MapPin className="text-blue-600 dark:text-blue-400 text-xl" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Address Information
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Business location details
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {isOpen ? "Hide" : "Show"}
          </span>
          <ChevronDown
            className={`w-5 h-5 text-gray-400 dark:text-gray-500 transform transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"
              }`}
          />
        </div>
      </div>

      {/* Collapsible Content */}
      <div
        ref={contentRef}
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: `${height}px` }}
      >
        {/* {hasAddressData ? ( */}
        <div className="p-2">
          {addressFields.map(({ label, value, field, icon: IconComponent }) =>
            renderRow(label, value, field, IconComponent)
          )}
        </div>

      </div>
    </div>
  );
}