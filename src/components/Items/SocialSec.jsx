import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { FaFacebook, FaInstagram, FaWhatsapp, FaYoutube, FaXTwitter, FaLinkedin, FaGlobe } from "react-icons/fa6";

export default function SocialSec({ cardData, openModal }) {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef(null);
  const [height, setHeight] = useState(0);

  const socials = [
    { field: "facebook", label: "Facebook", value: cardData?.social?.facebook || "Not available", icon: FaFacebook, color: "text-blue-600" },
    { field: "insta", label: "Instagram", value: cardData?.social?.insta || "Not available", icon: FaInstagram, color: "text-pink-500" },
    { field: "whatsapp", label: "WhatsApp", value: cardData?.social?.whatsapp || "Not available", icon: FaWhatsapp, color: "text-green-500" },
    { field: "youtube", label: "YouTube", value: cardData?.social?.youtube || "Not available", icon: FaYoutube, color: "text-red-600" },
    { field: "twitter", label: "X (Twitter)", value: cardData?.social?.twitter || "Not available", icon: FaXTwitter, color: "text-black dark:text-white" },
    { field: "linkedin", label: "LinkedIn", value: cardData?.social?.linkedin || "Not available", icon: FaLinkedin, color: "text-blue-700" },
    { field: "website", label: "Website", value: cardData?.social?.website || "Not available", icon: FaGlobe, color: "text-blue-600" },
  ];

  const handleSocialClick = (item) => {
    const value = cardData?.social?.[item.field];
    if (value && value !== "Not available") {
      window.open(value, "_blank", "noopener,noreferrer");
    } else {
      openModal(item.field, item.label);
    }
  };

  const renderRow = (item) => {
    const IconComponent = item.icon;
    return (
      <div
        key={item.field}
        className="cursor-pointer flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 group"
        onClick={() => handleSocialClick(item)}
        title={item.value}
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
              <IconComponent className={`w-4 h-4 ${item.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                {item.label}
              </span>
              <span className="text-gray-900 dark:text-white font-medium truncate block mt-1">
                {item.value}
              </span>
            </div>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transform transition-transform duration-300 group-hover:translate-x-1" />
      </div>
    );
  };

  useEffect(() => {
    if (contentRef.current) {
      setHeight(isOpen ? contentRef.current.scrollHeight : 0);
    }
  }, [isOpen]);

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-900/20 rounded-xl border border-gray-200 dark:border-gray-700 w-full overflow-hidden transition-all duration-300 hover:shadow-xl dark:hover:shadow-gray-900/30">
      {/* Header */}
      <div
        className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
            <FaGlobe className="text-blue-600 dark:text-blue-400 text-xl" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Social Media
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Connect through social platforms
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {isOpen ? "Hide" : "Show"}
          </span>
          <ChevronDown
            className={`w-5 h-5 text-gray-400 dark:text-gray-500 transform transition-transform duration-300 ${
              isOpen ? "rotate-180" : "rotate-0"
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
        <div className="p-2">
          {socials.map(renderRow)}
        </div>
      </div>
    </div>
  );
}