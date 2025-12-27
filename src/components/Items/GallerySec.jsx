import { useState, useRef, useEffect } from "react";
import { ChevronDown, Plus, Image, ExternalLink } from "lucide-react";
import { FaImages } from "react-icons/fa";

export default function GallerySec({ cardData, openModal }) {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef(null);
  const [height, setHeight] = useState(0);

  const gallery = cardData?.gallery || [];

  useEffect(() => {
    if (contentRef.current) {
      setHeight(isOpen ? contentRef.current.scrollHeight : 0);
    }
  }, [isOpen, gallery]);

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-900/20 rounded-xl border border-gray-200 dark:border-gray-700 w-full overflow-hidden transition-all duration-300 hover:shadow-xl dark:hover:shadow-gray-900/30">
      {/* Header */}
      <div
        className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
            <FaImages className="text-purple-600 dark:text-purple-400 text-xl" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Gallery
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {gallery.length} photo{gallery.length !== 1 ? 's' : ''} uploaded
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
        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {/* Gallery Items */}
            {gallery.length > 0 ? (
              gallery.map((url, idx) => (
                <div
                  key={idx}
                  className="group cursor-pointer border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-purple-300 dark:hover:border-purple-500 transition-all duration-200"
                  onClick={() => window.open(url, "_blank")}
                  title={url}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={url}
                      alt={`Gallery ${idx + 1}`}
                      className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Cpath d='M30 40 L50 60 L70 40' stroke='%239ca3af' stroke-width='2' fill='none'/%3E%3C/svg%3E";
                      }}
                    />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <ExternalLink className="w-4 h-4 text-white bg-purple-600 rounded-full p-0.5" />
                    </div>
                  </div>
                  <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                    <span className="text-xs text-gray-600 dark:text-gray-400 truncate block">
                      {url.split("/").pop() || `Image ${idx + 1}`}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  <Image className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Photos
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Upload photos to showcase your business
                </p>
              </div>
            )}

            {/* Add Photo Tile */}
            <div
              className="cursor-pointer border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex flex-col items-center justify-center hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200 group min-h-[136px]"
              onClick={() => openModal("gallery", "Gallery")}
            >
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                Add Photo
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                JPG, PNG, WEBP
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}