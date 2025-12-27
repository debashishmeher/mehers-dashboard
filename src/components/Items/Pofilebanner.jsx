import React, { useState, useCallback } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { Image as ImageIcon } from "lucide-react";

const ProfileBanner = ({
  logo,
  photo,
  onOpenLogoModal,
  onOpenPhotoModal,
  onDeleteLogo,
  logoAlt = "Company logo",
  bannerAlt = "Banner image",
}) => {
  const [loaded, setLoaded] = useState({ banner: false, logo: false });

  const onLoad = useCallback((key) => {
    setLoaded((prev) => ({ ...prev, [key]: true }));
  }, []);

  const stop = (e, cb) => {
    e.stopPropagation();
    cb?.();
  };

  return (
    <div className="
      relative w-full rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.15)]
      bg-gradient-to-b from-gray-50 to-gray-100
      dark:from-gray-800 dark:to-gray-900
      transition-all duration-500 mb-14
    ">

      {/* Banner */}
      <div
        className="relative group cursor-pointer"
        role="button"
        tabIndex={0}
        onClick={onOpenPhotoModal}
        onKeyDown={(e) => e.key === "Enter" && onOpenPhotoModal?.()}
      >
        {/* Fallback Banner */}
        {!photo && (
          <div className="w-full h-72 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
            <ImageIcon className="w-20 h-20 text-gray-400 dark:text-gray-500 opacity-50" />
          </div>
        )}

        {/* Loading State */}
        {photo && !loaded.banner && (
          <div className="w-full h-72 flex items-center justify-center bg-gray-200 dark:bg-gray-700 animate-pulse">
            <div className="flex flex-col items-center gap-2">
              <ImageIcon className="w-16 h-16 text-gray-400 dark:text-gray-500 opacity-50" />
              <p className="text-sm text-gray-500 dark:text-gray-400 tracking-wide">
                Loading banner…
              </p>
            </div>
          </div>
        )}

        {/* Banner Image */}
        {photo && (
          <img
            src={photo}
            alt={bannerAlt}
            className={`w-full h-72 object-cover transition-all duration-700 ${
              loaded.banner ? "opacity-100 scale-100" : "opacity-0 scale-105"
            }`}
            onLoad={() => onLoad("banner")}
            loading="lazy"
          />
        )}

        {/* Edit Banner Button */}
        <div className="
          absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent
          opacity-0 group-hover:opacity-100 transition-opacity duration-300
          flex items-end justify-end p-4
        ">
          <button
            className="bg-white dark:bg-gray-900 rounded-full p-3 shadow-lg 
                       hover:bg-blue-100 dark:hover:bg-gray-700 transition-all transform hover:scale-110"
            onClick={(e) => stop(e, onOpenPhotoModal)}
          >
            <FaEdit className="text-blue-600 dark:text-blue-400 text-lg" />
          </button>
        </div>
      </div>

      {/* Center Logo */}
      <div className="absolute inset-0 -bottom-20 flex justify-center items-end pointer-events-none">
        <div
          className="
            relative w-40 h-40 rounded-full 
            backdrop-blur-xl bg-white/60 dark:bg-gray-900/60 
            border border-white/50 dark:border-gray-700/40
            shadow-[0_8px_30px_rgb(0,0,0,0.25)]
            flex items-center justify-center 
            cursor-pointer group pointer-events-auto overflow-hidden 
            transition-all duration-300 hover:scale-105
          "
          role="button"
          tabIndex={0}
          onClick={onOpenLogoModal}
          onKeyDown={(e) => e.key === "Enter" && onOpenLogoModal?.()}
        >
          {/* Logo Fallback */}
          {!logo && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200/40 dark:bg-gray-700/40">
              <ImageIcon className="w-16 h-16 text-gray-400 dark:text-gray-500 opacity-50" />
            </div>
          )}

          {/* Logo Loading */}
          {logo && !loaded.logo && (
            <div className="absolute inset-0 animate-pulse flex items-center justify-center bg-gray-200/30 dark:bg-gray-700/30">
              <ImageIcon className="w-14 h-14 text-gray-400 dark:text-gray-500 opacity-50" />
            </div>
          )}

          {/* Logo Image */}
          {logo && (
            <img
              src={logo}
              alt={logoAlt}
              className={`w-full h-full object-contain transition-opacity duration-700 ${
                loaded.logo ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => onLoad("logo")}
              loading="lazy"
            />
          )}

          {/* Edit Logo Overlay */}
          <div className="
            absolute inset-0 bg-black/40 opacity-0 
            group-hover:opacity-100 transition-opacity duration-300 
            flex items-center justify-center
          ">
            <FaEdit className="text-white text-2xl" />
          </div>

          {/* Delete Logo */}
          {logo && (
            <button
              className="
                absolute -top-3 -right-3 bg-red-600 text-white p-2 
                rounded-full shadow-lg hover:bg-red-700 transition-all transform hover:scale-110
              "
              onClick={(e) => stop(e, onDeleteLogo)}
            >
              <FaTrash className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(ProfileBanner);
