import { useState, useRef, useEffect } from "react";
import { FaTags } from "react-icons/fa";
import { ChevronDown, ChevronRight, Tag } from "lucide-react";

export default function CategorySec({ cardData, openModal }) {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef(null);
  const [height, setHeight] = useState(0);

  const category = cardData?.category || "Not set";

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
          <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
            <FaTags className="text-green-600 dark:text-green-400 text-xl" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Category
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Business classification
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
          <div
            className="cursor-pointer flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 group"
            onClick={() => openModal("category", "Category")}
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg group-hover:bg-green-100 dark:group-hover:bg-green-900/30 transition-colors">
                  <Tag className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                    Category
                  </span>
                  <span className="text-gray-900 dark:text-white font-medium truncate block mt-1">
                    {category}
                  </span>
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-green-600 dark:group-hover:text-green-400 transform transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </div>

        {/* Empty State */}
        {category === "Not set" && (
          <div className="text-center py-8 px-6">
            <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <Tag className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Category Set
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Add a category to classify your business
            </p>
          </div>
        )}
      </div>
    </div>
  );
}