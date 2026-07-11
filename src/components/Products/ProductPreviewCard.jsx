import React from "react";
import { Sparkles, ShoppingBag, Star } from "lucide-react";

export default function ProductPreviewCard({ product, mainPhotoPreview }) {
    const nameVal = product.name || "New Exquisite Saree";
    const priceVal = Number(product.price) || 2999;
    const discountVal = Number(product.discount) || 0;
    const categoryVal = product.catagory || "Saree";
    const codeVal = product.code || "SAREE-001";
    const quantityVal = product.quantity !== undefined && product.quantity !== "" ? Number(product.quantity) : 5;
    const descVal = product.desc || "Timeless elegance crafted with precision. An aesthetic masterpiece featuring intricate designs and premium fabric.";
    const ratingVal = Number(product.rateing) || 5;

    const discountAmount = (priceVal * (discountVal || 0)) / 100;
    const finalPrice = priceVal - discountAmount;
    const hasDiscount = discountVal > 0;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700/50 overflow-hidden w-full max-w-sm mx-auto transition-all duration-300 hover:shadow-xl group flex flex-col h-full">
            {/* Card Image Wrapper */}
            <div className="relative aspect-[4/5] bg-gray-50 dark:bg-gray-900/50 overflow-hidden flex items-center justify-center border-b border-gray-100 dark:border-gray-700/50 flex-shrink-0">
                {mainPhotoPreview ? (
                    <img
                        src={mainPhotoPreview}
                        alt={nameVal}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center p-6 text-gray-400 dark:text-gray-600">
                        <ShoppingBag className="w-12 h-12 mb-3 stroke-[1.2]" />
                        <span className="text-xs font-medium uppercase tracking-wider">No Main Photo</span>
                    </div>
                )}

                {/* Badges Overlay */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                    <span className="bg-purple-600 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm capitalize">
                        {categoryVal}
                    </span>
                    {hasDiscount && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1">
                            <Sparkles className="w-3 h-3 animate-pulse" /> {discountVal}% OFF
                        </span>
                    )}
                </div>

                {/* Rating Overlay */}
                <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md text-yellow-500 dark:text-yellow-400 text-[10px] font-bold px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1 border border-gray-100/10">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{ratingVal} ★</span>
                </div>

                {/* Code Overlay */}
                <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-md text-white text-[10px] px-2 py-0.5 rounded font-mono">
                    {codeVal}
                </div>
            </div>

            {/* Content Details */}
            <div className="p-5 flex flex-col flex-grow justify-between">
                <div>
                    <h3 className="text-base font-semibold text-gray-800 dark:text-white line-clamp-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" title={nameVal}>
                        {nameVal}
                    </h3>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 line-clamp-2 h-8 leading-relaxed">
                        {descVal}
                    </p>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-700/50 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-gray-800 dark:text-white font-mono">
                                ₹{Math.round(finalPrice).toLocaleString("en-IN")}
                            </span>
                            {hasDiscount && (
                                <span className="text-xs text-gray-400 dark:text-gray-500 line-through font-mono">
                                    ₹{priceVal.toLocaleString("en-IN")}
                                </span>
                            )}
                        </div>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                            Stock: <span className={quantityVal > 0 ? "text-green-600 font-medium" : "text-red-500 font-semibold"}>{quantityVal > 0 ? `${quantityVal} units` : "Out of Stock"}</span>
                        </p>
                    </div>

                    <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold uppercase tracking-wider bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                        Live Preview
                    </span>
                </div>
            </div>
        </div>
    );
}
