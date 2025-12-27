import { useState, useRef, useEffect } from "react";
import { FaFilePdf } from "react-icons/fa";
import { ChevronDown, Plus, FileText, ExternalLink } from "lucide-react";

export default function BrochuresSec({ cardData, openModal }) {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef(null);
  const [height, setHeight] = useState(0);

  const brochures = cardData?.brochures || [];

  useEffect(() => {
    if (contentRef.current) {
      setHeight(isOpen ? contentRef.current.scrollHeight : 0);
    }
  }, [isOpen, brochures]);

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-900/20 rounded-xl border border-gray-200 dark:border-gray-700 w-full overflow-hidden transition-all duration-300 hover:shadow-xl dark:hover:shadow-gray-900/30">
      {/* Header */}
      <div
        className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
            <FaFilePdf className="text-red-600 dark:text-red-400 text-xl" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Brochures
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {brochures.length} brochure{brochures.length !== 1 ? 's' : ''} uploaded
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Brochure Items */}
            {brochures.length > 0 ? (
              brochures.map((url, idx) => (
                <div
                  key={idx}
                  className="group cursor-pointer border border-gray-200 dark:border-gray-600 rounded-xl p-4 flex flex-col items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-500 transition-all duration-200 shadow-sm hover:shadow-md"
                  onClick={() => window.open(url, "_blank")}
                  title={url}
                >
                  <div className="relative">
                    <FileText className="text-red-600 dark:text-red-400 text-3xl mb-3 group-hover:scale-110 transition-transform" />
                    <ExternalLink className="w-4 h-4 text-white bg-red-600 rounded-full p-0.5 absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white truncate w-full text-center mb-1">
                    Brochure {idx + 1}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 truncate w-full text-center">
                    {url.split("/").pop() || `Document ${idx + 1}`}
                  </span>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Brochures
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Upload brochures to share with your contacts
                </p>
              </div>
            )}

            {/* Add Brochure Tile */}
            <div
              className="cursor-pointer border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 flex flex-col items-center justify-center hover:border-red-400 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 group"
              onClick={() => openModal("brochures", "Brochures")}
            >
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <span className="text-sm font-medium text-red-600 dark:text-red-400">
                Add Brochure
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                PDF, DOC, PPT
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}