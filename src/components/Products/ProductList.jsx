import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus, Search, Edit2, Trash2, Eye, Loader2, Sparkles, Filter, AlertTriangle, LayoutGrid, List } from "lucide-react";
import api from "../../utils/api";
import { useToast } from "../../Context/ToastContext";
import ProductCard from "./ProductCard";

export default function ProductList() {
    const queryClient = useQueryClient();
    const toast = useToast();

    // Filters and state
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [page, setPage] = useState(1);
    const [viewMode, setViewMode] = useState("grid"); // "grid" or "table"

    // Fetch products
    const { data: productData, isLoading, isError, refetch } = useQuery({
        queryKey: ["products", { search, category, page }],
        queryFn: async () => {
            const params = {
                page,
                limit: 10,
                search: search.trim() || undefined,
                category: category || undefined,
            };
            return api.get("/api/product", { params });
        },
        keepPreviousData: true,
    });

    // Fetch dynamic categories
    const { data: categoriesData } = useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            const res = await api.get("/api/category");
            return res.data || {};
        }
    });

    const categories = categoriesData?.categories || [];

    // Delete product mutation
    const deleteMutation = useMutation({
        mutationFn: (productId) => api.delete(`/api/product/${productId}`),
        onSuccess: (data) => {
            if (data.status === "success") {
                toast.success("Product deleted successfully!");
                queryClient.invalidateQueries(["products"]);
            } else {
                toast.error(data.message || "Failed to delete product.");
            }
        },
        onError: (err) => {
            toast.error(err.message || "An error occurred while deleting the product.");
        }
    });

    const handleDelete = (productId, name) => {
        const confirmDelete = window.confirm(`Are you absolutely sure you want to delete "${name}"? This will also remove the item from active customer shopping carts.`);
        if (confirmDelete) {
            deleteMutation.mutate(productId);
        }
    };

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setPage(1); // Reset to first page
    };

    const handleCategoryChange = (e) => {
        setCategory(e.target.value);
        setPage(1); // Reset to first page
    };

    const responseData = productData?.data || {};
    const products = responseData.products || [];
    const totalPages = responseData.totalPages || 1;

    return (
        <div className="max-w-7xl mx-auto py-6 px-4">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-gray-100 dark:border-gray-700/50">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Store Catalog</h1>
                    <p className="text-xs text-gray-500 mt-0.5">Manage product inventory, pricing, catalog photos, and details</p>
                </div>
                <Link
                    to="/products/new"
                    className="self-start sm:self-center bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow transition duration-200 flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Add Product
                </Link>
            </div>

            {/* Filter Bar */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 mb-6 shadow-sm flex flex-col md:flex-row items-center gap-4 transition-all duration-300">
                {/* Search */}
                <div className="relative w-full md:flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search products by name, code or category..."
                        value={search}
                        onChange={handleSearchChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition"
                    />
                </div>

                {/* Category Dropdown */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Filter className="text-gray-400 w-4 h-4 flex-shrink-0" />
                    <select
                        value={category}
                        onChange={handleCategoryChange}
                        className="w-full md:w-48 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition capitalize"
                    >
                        <option value="">All Categories</option>
                        {categories.length === 0 ? (
                            <>
                                <option value="saree">Saree</option>
                                <option value="kurti">Kurti</option>
                                <option value="lehenga">Lehenga</option>
                                <option value="suit">Suit</option>
                                <option value="dress">Dress</option>
                            </>
                        ) : (
                            categories.map((cat) => (
                                <option key={cat._id} value={cat.name.toLowerCase()}>
                                    {cat.name}
                                </option>
                            ))
                        )}
                    </select>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl p-1 bg-gray-50/50 dark:bg-gray-900 w-full md:w-auto justify-center select-none">
                    <button
                        onClick={() => setViewMode("grid")}
                        className={`flex items-center justify-center p-2 rounded-lg transition-all duration-200 ${
                            viewMode === "grid"
                                ? "bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 shadow-sm"
                                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        }`}
                        title="Grid View"
                    >
                        <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewMode("table")}
                        className={`flex items-center justify-center p-2 rounded-lg transition-all duration-200 ${
                            viewMode === "table"
                                ? "bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 shadow-sm"
                                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        }`}
                        title="Table View"
                    >
                        <List className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Loading / Error States */}
            {isLoading ? (
                <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                    <span className="text-sm text-gray-500">Loading catalog items...</span>
                </div>
            ) : isError ? (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center max-w-md mx-auto my-12">
                    <AlertTriangle className="w-12 h-12 text-red-500 mb-3" />
                    <h3 className="text-base font-bold text-red-800 dark:text-red-400">Failed to Load Catalog</h3>
                    <p className="text-xs text-red-600 dark:text-red-500/80 mt-1 mb-4">Could not retrieve the product inventory list from the server.</p>
                    <button
                        onClick={refetch}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs px-4 py-2 rounded-lg transition"
                    >
                        Retry Connection
                    </button>
                </div>
            ) : products.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-12 text-center shadow-sm max-w-lg mx-auto">
                    <p className="text-sm text-gray-500 dark:text-gray-400">No products found matching your catalog filters.</p>
                    <button
                        onClick={() => { setSearch(""); setCategory(""); setPage(1); }}
                        className="text-purple-600 dark:text-purple-400 text-xs font-semibold mt-2 hover:underline"
                    >
                        Reset Catalog Filters
                    </button>
                </div>
            ) : (
                <div>
                    {viewMode === "grid" ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
                            {products.map((product) => (
                                <ProductCard
                                    key={product._id}
                                    product={product}
                                    onDelete={handleDelete}
                                    deleteLoading={deleteMutation.isPending}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm transition-all duration-300">
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-left">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            <th className="p-4 pl-6">Product Details</th>
                                            <th className="p-4">Category / Code</th>
                                            <th className="p-4">Stock Status</th>
                                            <th className="p-4">Selling Price (₹)</th>
                                            <th className="p-4 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm text-gray-700 dark:text-gray-200">
                                        {products.map((product) => {
                                            const discountedPrice = product.price - (product.price * (product.discount || 0)) / 100;
                                            const hasDiscount = product.discount > 0;
                                            return (
                                                <tr key={product._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                                                    {/* Photo & Name */}
                                                    <td className="p-4 pl-6 flex items-center gap-4">
                                                        <div className="w-12 h-15 bg-gray-100 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                            {product.mainphoto ? (
                                                                <img
                                                                    src={product.mainphoto}
                                                                    alt={product.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <span className="text-gray-400 text-[10px]">No Photo</span>
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <span className="font-semibold text-gray-800 dark:text-white block truncate max-w-xs hover:text-purple-600 transition-colors">
                                                                {product.name}
                                                            </span>
                                                            <span className="text-xs text-gray-400 dark:text-gray-500 line-clamp-1 mt-0.5">
                                                                {product.desc || "No description provided."}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {/* Cat / Code */}
                                                    <td className="p-4">
                                                        <span className="inline-block bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900 text-purple-600 dark:text-purple-400 text-xs px-2.5 py-0.5 rounded-full font-medium">
                                                            {product.catagory}
                                                        </span>
                                                        <span className="block text-[10px] font-mono text-gray-400 mt-1 uppercase">
                                                            {product.code || "No Code"}
                                                        </span>
                                                    </td>

                                                    {/* Stock */}
                                                    <td className="p-4">
                                                        <span className={`text-xs font-semibold ${product.quantity > 0 ? "text-green-600" : "text-red-500"}`}>
                                                            {product.quantity > 0 ? `${product.quantity} units` : "Out of Stock"}
                                                        </span>
                                                        <span className="block text-[10px] text-gray-400 mt-0.5">
                                                            Rating: {product.rateing} / 5 ★
                                                        </span>
                                                    </td>

                                                    {/* Price */}
                                                    <td className="p-4 font-mono font-medium">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-semibold text-gray-800 dark:text-white">
                                                                ₹{discountedPrice.toLocaleString("en-IN")}
                                                            </span>
                                                            {hasDiscount && (
                                                                <span className="text-xs text-gray-400 line-through">
                                                                    ₹{product.price.toLocaleString("en-IN")}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {hasDiscount && (
                                                            <span className="inline-flex items-center gap-0.5 text-[10px] text-red-500 font-semibold bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900 px-1.5 py-0.5 rounded mt-1">
                                                                <Sparkles className="w-2.5 h-2.5" /> {product.discount}% OFF
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="p-4">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <Link
                                                                to={`/products/${product._id}`}
                                                                className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-lg transition"
                                                                title="View Details"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </Link>
                                                            <Link
                                                                to={`/products/edit/${product._id}`}
                                                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-500 dark:text-gray-300 rounded-lg transition"
                                                                title="Edit Product"
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                            </Link>
                                                            <button
                                                                onClick={() => handleDelete(product._id, product.name)}
                                                                className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 dark:text-red-400 rounded-lg transition"
                                                                title="Delete Product"
                                                                disabled={deleteMutation.isPending}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className={`p-4 flex items-center justify-between text-xs text-gray-500 ${
                            viewMode === "table" 
                                ? "bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 rounded-b-2xl" 
                                : "bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm mt-6"
                        }`}>
                            <span>Page {page} of {totalPages}</span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
