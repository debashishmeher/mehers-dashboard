import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, Eye, Edit2, Trash2, Star, ShoppingBag } from "lucide-react";

export default function ProductCard({ product, onDelete, deleteLoading }) {
    const {
        _id,
        name = "New Exquisite Saree",
        price = 2999,
        discount = 15,
        catagory = "saree",
        code = "SAREE-001",
        quantity = 5,
        desc = "Timeless elegance crafted with precision. An aesthetic masterpiece featuring intricate designs and premium fabric.",
        rateing = 0,
        mainphoto
    } = product;

    const discountAmount = (price * (discount || 0)) / 100;
    const finalPrice = price - discountAmount;
    const hasDiscount = discount > 0;

    const imageUrl = mainphoto || null;


    console.log(imageUrl);


    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700/50 overflow-hidden w-full max-w-sm mx-auto transition-all duration-300 hover:shadow-xl group flex flex-col h-full">
            {/* Card Image Wrapper */}
            <div className="relative aspect-[4/5] bg-gray-50 dark:bg-gray-900/50 overflow-hidden flex items-center justify-center border-b border-gray-100 dark:border-gray-700/50 flex-shrink-0">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center p-6 text-gray-400 dark:text-gray-600">
                        <ShoppingBag className="w-12 h-12 mb-3 stroke-[1.2]" />
                        <span className="text-xs font-medium uppercase tracking-wider">No Main Photo</span>
                    </div>
                )}

                {/* Badges Overlay */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                    <span className="bg-purple-600 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm">
                        {catagory}
                    </span>
                    {hasDiscount && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1">
                            <Sparkles className="w-3 h-3 animate-pulse" /> {discount}% OFF
                        </span>
                    )}
                </div>

                {/* Rating Overlay */}
                {rateing > 0 && (
                    <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md text-yellow-500 dark:text-yellow-400 text-[10px] font-bold px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1 border border-gray-100/10">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{rateing} ★</span>
                    </div>
                )}

                {/* Code Overlay */}
                <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-md text-white text-[10px] px-2 py-0.5 rounded font-mono">
                    {code}
                </div>
            </div>

            {/* Content Details */}
            <div className="p-5 flex flex-col flex-grow justify-between">
                <div>
                    <h3 className="text-base font-semibold text-gray-800 dark:text-white line-clamp-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" title={name}>
                        {name}
                    </h3>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 line-clamp-2 h-8 leading-relaxed">
                        {desc}
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
                                    ₹{price.toLocaleString("en-IN")}
                                </span>
                            )}
                        </div>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                            Stock: <span className={quantity > 0 ? "text-green-600 font-medium" : "text-red-500 font-semibold"}>{quantity} units</span>
                        </p>
                    </div>

                    {/* Admin Action Buttons */}
                    <div className="flex items-center gap-1.5">
                        <Link
                            to={`/products/${_id}`}
                            className="p-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30 dark:hover:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl transition duration-200 border border-blue-100/50 dark:border-blue-900/20"
                            title="View Details"
                        >
                            <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                            to={`/products/edit/${_id}`}
                            className="p-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700/30 dark:hover:bg-gray-700/60 text-gray-600 dark:text-gray-300 rounded-xl transition duration-200 border border-gray-200/50 dark:border-gray-600/20"
                            title="Edit Product"
                        >
                            <Edit2 className="w-3.5 h-3.5" />
                        </Link>
                        <button
                            onClick={(e) => { e.preventDefault(); onDelete(_id, name); }}
                            disabled={deleteLoading}
                            className="p-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-950/60 text-red-500 dark:text-red-400 rounded-xl transition duration-200 border border-red-100/50 dark:border-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete Product"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
