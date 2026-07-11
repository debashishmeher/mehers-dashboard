import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Edit2, Loader2, Sparkles, AlertTriangle, ShieldCheck, Box, Tag, Award, DollarSign } from "lucide-react";
import api from "../../utils/api";
import { useToast } from "../../Context/ToastContext";

export default function ProductDetail() {
    const { productId } = useParams();
    const toast = useToast();
    const [selectedImage, setSelectedImage] = useState("");

    // Fetch product details
    const { data: productData, isLoading, isError, error } = useQuery({
        queryKey: ["product", productId],
        queryFn: () => api.get(`/api/product/${productId}`),
        onSuccess: (res) => {
            if (res.status === "success" && res.data.product?.mainphoto) {
                setSelectedImage(res.data.product.mainphoto);
            }
        },
        onError: (err) => {
            toast.error(err.message || "Failed to retrieve product details.");
        }
    });

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                <span className="text-sm text-gray-500">Loading product details...</span>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center max-w-md mx-auto my-12">
                <AlertTriangle className="w-12 h-12 text-red-500 mb-3" />
                <h3 className="text-base font-bold text-red-800 dark:text-red-400">Failed to Load Details</h3>
                <p className="text-xs text-red-600 dark:text-red-500/80 mt-1 mb-4">{error?.message || "Something went wrong."}</p>
                <Link
                    to="/products"
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs px-4 py-2 rounded-lg transition"
                >
                    Go Back to Catalog
                </Link>
            </div>
        );
    }

    const prod = productData?.data?.product || {};
    const discountedPrice = prod.price - (prod.price * (prod.discount || 0)) / 100;
    const profitMargin = discountedPrice - (prod.purchase || 0);
    const profitPercentage = ((profitMargin / (prod.purchase || 1)) * 100).toFixed(1);

    const allImages = [];
    if (prod.mainphoto) {
        allImages.push(prod.mainphoto);
    }
    if (prod.photo && Array.isArray(prod.photo)) {
        prod.photo.forEach((ph) => {
            allImages.push(ph);
        });
    }

    // Set fallback if selectedImage is empty
    const currentViewImage = selectedImage || allImages[0] || "/default-avatar.png";

    return (
        <div className="max-w-7xl mx-auto py-6 px-4">
            {/* Top Navigation */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100 dark:border-gray-700/50">
                <div className="flex items-center gap-4">
                    <Link
                        to="/products"
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition text-gray-500 hover:text-gray-800 dark:hover:text-white"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Product Profile</h1>
                        <p className="text-xs text-gray-500 mt-0.5">Catalog record: {prod.name}</p>
                    </div>
                </div>

                <Link
                    to={`/products/edit/${prod._id}`}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow transition-all duration-200 flex items-center gap-2"
                >
                    <Edit2 className="w-4 h-4" /> Edit Details
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Side Image Gallery */}
                <div className="space-y-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden flex items-center justify-center p-4 aspect-[4/5]">
                        {allImages.length > 0 ? (
                            <img
                                src={currentViewImage}
                                alt={prod.name}
                                className="w-full h-full object-contain rounded-xl"
                            />
                        ) : (
                            <div className="text-gray-400">No Image Uploaded</div>
                        )}
                    </div>

                    {/* Thumbnails */}
                    {allImages.length > 1 && (
                        <div className="flex items-center gap-3 overflow-x-auto py-2">
                            {allImages.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImage(img)}
                                    className={`w-20 h-24 bg-white dark:bg-gray-800 rounded-xl border-2 overflow-hidden flex items-center justify-center p-1 transition-all ${
                                        currentViewImage === img ? "border-purple-600" : "border-gray-200 dark:border-gray-700"
                                    }`}
                                >
                                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover rounded-lg" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Side Detail Summary */}
                <div className="space-y-6">
                    {/* Basic specs info */}
                    <div className="bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-900/20 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 space-y-4">
                        <div className="flex items-center justify-between gap-4">
                            <span className="bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900 text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
                                {prod.catagory}
                            </span>
                            <span className="text-xs font-mono text-gray-400">
                                CODE: {prod.code || "N/A"}
                            </span>
                        </div>

                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                            {prod.name}
                        </h2>

                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                            {prod.desc || "No description provided for this product."}
                        </p>

                        <div className="flex items-center gap-2 pt-2 text-sm text-yellow-500 font-semibold">
                            {"★".repeat(prod.rateing || 1)}
                            {"☆".repeat(5 - (prod.rateing || 1))}
                            <span className="text-xs text-gray-400 dark:text-gray-500 font-normal ml-2">
                                ({prod.rateing || 1} out of 5 stars)
                            </span>
                        </div>
                    </div>

                    {/* Pricing, Profit Margins & Sales Analysis */}
                    <div className="bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-900/20 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 space-y-4">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 border-b dark:border-gray-700/50 pb-3">
                            <DollarSign className="w-4 h-4 text-purple-600" /> Catalog Financial Audit
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Cost Price */}
                            <div className="p-4 bg-gray-50 dark:bg-gray-900/30 rounded-xl border border-gray-100 dark:border-gray-700">
                                <span className="text-xs text-gray-400 dark:text-gray-500">Cost Purchase Price</span>
                                <span className="block text-xl font-bold text-gray-800 dark:text-white mt-1">
                                    ₹{(prod.purchase || 0).toLocaleString("en-IN")}
                                </span>
                            </div>

                            {/* Selling Price */}
                            <div className="p-4 bg-gray-50 dark:bg-gray-900/30 rounded-xl border border-gray-100 dark:border-gray-700">
                                <span className="text-xs text-gray-400 dark:text-gray-500">Final Selling Price</span>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xl font-bold text-gray-800 dark:text-white">
                                        ₹{discountedPrice.toLocaleString("en-IN")}
                                    </span>
                                    {prod.discount > 0 && (
                                        <span className="text-xs text-gray-400 line-through">
                                            ₹{prod.price.toLocaleString("en-IN")}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Net Profit Margin Card */}
                        <div className="p-4 bg-green-50/50 dark:bg-green-950/20 rounded-xl border border-green-100 dark:border-green-950 flex items-center justify-between">
                            <div>
                                <span className="text-xs text-green-700 dark:text-green-400 font-semibold">Net Profit Margin</span>
                                <span className="block text-2xl font-black text-green-600 dark:text-green-400 mt-1">
                                    ₹{profitMargin.toLocaleString("en-IN")}
                                </span>
                            </div>
                            <span className="bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 font-extrabold text-sm px-4 py-2 rounded-xl border border-green-200 dark:border-green-800">
                                +{profitPercentage}%
                            </span>
                        </div>
                    </div>

                    {/* Stock Status Specs */}
                    <div className="bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-900/20 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 space-y-4">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 border-b dark:border-gray-700/50 pb-3">
                            <Box className="w-4 h-4 text-purple-600" /> Inventory & Logistics
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <Box className="w-5 h-5 text-gray-400" />
                                <div>
                                    <span className="text-xs text-gray-400 dark:text-gray-500 block">Quantity in Stock</span>
                                    <span className={`text-sm font-bold ${prod.quantity > 0 ? "text-green-600" : "text-red-500"}`}>
                                        {prod.quantity > 0 ? `${prod.quantity} units` : "Out of stock"}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Tag className="w-5 h-5 text-gray-400" />
                                <div>
                                    <span className="text-xs text-gray-400 dark:text-gray-500 block">Unit Weight</span>
                                    <span className="text-sm font-bold text-gray-800 dark:text-white">
                                        {prod.weight ? `${prod.weight} g` : "Not provided"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Security check */}
                        <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 dark:bg-gray-900/30 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                            <ShieldCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span>This product is listed live. Deleting it will release all buyer cart reserves instantly.</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
