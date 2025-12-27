import { useState, useRef, useEffect } from "react";
import { FaMapMarkedAlt } from "react-icons/fa";
import { ChevronDown, ChevronRight } from "lucide-react";

export default function MetaDataSec({ cardData, openModal }) {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef(null);
  const [height, setHeight] = useState(0);

  // Define map field
  const mapField = {
    field: "map",
    label: "Google Map",
    value: cardData?.map || "--",
    icon: <FaMapMarkedAlt className="text-green-600 dark:text-green-400" />,
  };

  const renderRow = (item) => (
    <div
      key={item.field}
      className="cursor-pointer flex items-center justify-between py-4 border-t border-gray-200 dark:border-gray-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors duration-200"
    >
      <div
        className="flex items-center gap-3 flex-1 min-w-0"
        onClick={() => {
          openModal(item.field, item.label);
        }}
      >
        {item.icon}
        <span className="text-gray-600 dark:text-gray-400 w-32 shrink-0">
          {item.label}
        </span>
        <span className="text-gray-800 dark:text-white font-medium truncate whitespace-nowrap overflow-hidden flex-1">
          {item.value}
        </span>
      </div>
      <div className="pl-4">
        <ChevronRight
          className="w-5 h-5 text-[#2563EB] dark:text-blue-400"
          onClick={() => openModal(item.field, item.label)}
        />
      </div>
    </div>
  );

  useEffect(() => {
    if (contentRef.current) {
      setHeight(isOpen ? contentRef.current.scrollHeight : 0);
    }
  }, [isOpen]);

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-900/20 rounded-2xl border border-gray-200 dark:border-gray-700 w-full my-5 overflow-hidden transition-all duration-300 hover:shadow-xl dark:hover:shadow-gray-900/30">
      {/* Header */}
      <div
        className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <FaMapMarkedAlt className="text-green-600 dark:text-green-400 text-xl" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">
              Google Map
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Business location and map integration
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

      {/* Smooth Info List */}
      <div
        ref={contentRef}
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: `${height}px` }}
      >
        <div className="px-6">
          {renderRow(mapField)}
        </div>

        {/* Google Map Live Preview */}
        {cardData?.map && (
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <FaMapMarkedAlt className="w-4 h-4 text-green-600 dark:text-green-400" />
              Map Preview
            </h4>
            <div className="relative aspect-video bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
              <iframe
                src={cardData?.map}
                title="Google Map"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Live preview of your location on Google Maps
            </p>
          </div>
        )}

        {/* Empty State */}
        {!cardData?.map && (
          <div className="text-center py-8 px-6">
            <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <FaMapMarkedAlt className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Map Added
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Add a Google Map location to show your business location
            </p>
          </div>
        )}
      </div>
    </div>
  );
}