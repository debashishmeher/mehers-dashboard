import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Upload, ArrowLeft, Loader2, Plus, Sparkles, FileText, Image as ImageIcon } from "lucide-react";
import api from "../../utils/api";
import { useToast } from "../../Context/ToastContext";
import ProductPreviewCard from "./ProductPreviewCard";

export default function ProductForm() {
    const { productId } = useParams();
    const isEditMode = !!productId;
    const navigate = useNavigate();
    const toast = useToast();

    // Form inputs
    const [form, setForm] = useState({
        name: "",
        price: "",
        purchase: "",
        discount: 0,
        catagory: "saree",
        code: "",
        quantity: 1,
        weight: "",
        desc: "",
        rateing: 5,
    });

    // File selections
    const [mainPhoto, setMainPhoto] = useState(null);
    const [mainPhotoUrl, setMainPhotoUrl] = useState("");
    const [galleryPhotos, setGalleryPhotos] = useState([]);
    const [galleryPreviews, setGalleryPreviews] = useState([]);

    // Fetch product details if in Edit Mode
    const { data: productData, isLoading: isFetching } = useQuery({
        queryKey: ["product", productId],
        queryFn: () => api.get(`/api/product/${productId}`),
        enabled: isEditMode,
        onError: (err) => {
            toast.error(err.message || "Failed to load product data.");
            navigate("/products");
        }
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

    // Populate form fields on edit mode load
    useEffect(() => {
        if (isEditMode && productData && productData.status === "success") {
            const prod = productData.data.product;
            setForm({
                name: prod.name || "",
                price: prod.price || "",
                purchase: prod.purchase || "",
                discount: prod.discount || 0,
                catagory: prod.catagory || "saree",
                code: prod.code || "",
                quantity: prod.quantity || 1,
                weight: prod.weight || "",
                desc: prod.desc || "",
                rateing: prod.rateing || 5,
            });
            if (prod.mainphoto) {
                setMainPhotoUrl(prod.mainphoto);
            }
            if (prod.photo && Array.isArray(prod.photo)) {
                setGalleryPreviews(prod.photo);
            }
        }
    }, [isEditMode, productData]);

    const handleTextChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: ["discount", "price", "purchase", "quantity", "weight", "rateing"].includes(name)
                ? (value === "" ? "" : Number(value))
                : value
        }));
    };

    const handleMainPhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setMainPhoto(file);
            setMainPhotoUrl(URL.createObjectURL(file));
        }
    };

    const handleGalleryChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + galleryPhotos.length > 3) {
            toast.error("You can upload a maximum of 3 gallery photos.");
            return;
        }

        const newPhotos = [...galleryPhotos, ...files].slice(0, 3);
        setGalleryPhotos(newPhotos);

        const newPreviews = newPhotos.map(file => URL.createObjectURL(file));
        setGalleryPreviews(newPreviews);
    };

    const removeGalleryPhoto = (index) => {
        const updatedPhotos = galleryPhotos.filter((_, i) => i !== index);
        setGalleryPhotos(updatedPhotos);

        const updatedPreviews = updatedPhotos.map(file => URL.createObjectURL(file));
        setGalleryPreviews(updatedPreviews);
    };

    // Form submission mutation
    const productMutation = useMutation({
        mutationFn: (formData) => {
            if (isEditMode) {
                return api.patch(`/api/product/${productId}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
            } else {
                return api.post("/api/product", formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
            }
        },
        onSuccess: (data) => {
            if (data.status === "success") {
                toast.success(isEditMode ? "Product updated successfully!" : "Product created successfully!");
                navigate("/products");
            } else {
                toast.error(data.message || "Failed to save product.");
            }
        },
        onError: (err) => {
            toast.error(err.message || "An error occurred while saving the product.");
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validations
        if (!isEditMode && !mainPhoto) {
            toast.error("Please upload a main theme photo.");
            return;
        }

        const formData = new FormData();
        Object.entries(form).forEach(([key, val]) => {
            formData.append(key, val);
        });

        if (mainPhoto) {
            formData.append("mainphoto", mainPhoto);
        }

        galleryPhotos.forEach((file) => {
            formData.append("photo", file);
        });

        productMutation.mutate(formData);
    };

    if (isEditMode && isFetching) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                <span className="text-sm text-gray-500">Loading product details...</span>
            </div>
        );
    }

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
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                            {isEditMode ? "Edit Product" : "Add New Product"}
                        </h1>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {isEditMode ? "Update existing store catalog information" : "Add a premium product to your inventory"}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Editor Section */}
                <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
                    {/* General Section */}
                    <div className="bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-900/20 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 space-y-4">
                        <h2 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-2">
                            <FileText className="w-4 h-4 text-purple-600" /> General Details
                        </h2>

                        <div>
                            <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 block mb-1">Product Name</label>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleTextChange}
                                required
                                placeholder="Enter item name (e.g. Designer Silk Saree)"
                                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 block mb-1">Category</label>
                                <select
                                    name="catagory"
                                    value={form.catagory}
                                    onChange={handleTextChange}
                                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm capitalize"
                                >
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

                            <div>
                                <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 block mb-1">Product Code</label>
                                <input
                                    type="text"
                                    name="code"
                                    value={form.code}
                                    onChange={handleTextChange}
                                    placeholder="e.g. KANJ-009"
                                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 block mb-1">Description</label>
                            <textarea
                                name="desc"
                                value={form.desc}
                                onChange={handleTextChange}
                                rows={4}
                                placeholder="Write details about fabric, work style, weave patterns, or care instructions..."
                                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm resize-none"
                            />
                        </div>
                    </div>

                    {/* Pricing & Inventory */}
                    <div className="bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-900/20 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 space-y-4">
                        <h2 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-2">
                            <Sparkles className="w-4 h-4 text-purple-600" /> Pricing & Inventory
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 block mb-1">Selling Price (₹)</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={form.price}
                                    onChange={handleTextChange}
                                    required
                                    min={0}
                                    placeholder="Selling Price"
                                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 block mb-1">Cost Price (₹)</label>
                                <input
                                    type="number"
                                    name="purchase"
                                    value={form.purchase}
                                    onChange={handleTextChange}
                                    required
                                    min={0}
                                    placeholder="Cost price"
                                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 block mb-1">Discount (%)</label>
                                <input
                                    type="number"
                                    name="discount"
                                    value={form.discount}
                                    onChange={handleTextChange}
                                    min={0}
                                    max={100}
                                    placeholder="0"
                                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 block mb-1">Quantity Stock</label>
                                <input
                                    type="number"
                                    name="quantity"
                                    value={form.quantity}
                                    onChange={handleTextChange}
                                    min={0}
                                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 block mb-1">Weight (g)</label>
                                <input
                                    type="number"
                                    name="weight"
                                    value={form.weight}
                                    onChange={handleTextChange}
                                    placeholder="Weight in grams"
                                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 block mb-1">Default Rating</label>
                                <input
                                    type="number"
                                    name="rateing"
                                    value={form.rateing}
                                    onChange={handleTextChange}
                                    min={1}
                                    max={5}
                                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Photos Upload Section */}
                    <div className="bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-900/20 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 space-y-6">
                        <h2 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2 border-b dark:border-gray-700/50 pb-3">
                            <ImageIcon className="w-4 h-4 text-purple-600" /> Media Uploads
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* Main Theme Photo */}
                            <div>
                                <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 block mb-2">Main Catalog Photo (Required)</label>
                                <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-400 rounded-2xl p-4 flex flex-col items-center justify-center bg-gray-50/50 dark:bg-gray-900/30 transition relative cursor-pointer min-h-[140px]">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleMainPhotoChange}
                                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                    />
                                    <Upload className="w-6 h-6 text-gray-400 mb-2" />
                                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Choose main cover photo</span>
                                    <span className="text-[10px] text-gray-400 mt-1">Accepts PNG, JPG (Max 5MB)</span>
                                </div>
                            </div>

                            {/* Gallery Photos */}
                            <div>
                                <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 block mb-2">Additional Gallery Photos (Max 3)</label>
                                <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-400 rounded-2xl p-4 flex flex-col items-center justify-center bg-gray-50/50 dark:bg-gray-900/30 transition relative cursor-pointer min-h-[140px]">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleGalleryChange}
                                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                        disabled={galleryPreviews.length >= 3}
                                    />
                                    <Plus className="w-6 h-6 text-gray-400 mb-2" />
                                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Add gallery images</span>
                                    <span className="text-[10px] text-gray-400 mt-1">{galleryPreviews.length}/3 uploaded</span>
                                </div>
                            </div>
                        </div>

                        {/* Gallery Previews Container */}
                        {galleryPreviews.length > 0 && (
                            <div className="space-y-2">
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Uploaded Gallery Images</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    {galleryPreviews.map((preview, index) => (
                                        <div key={index} className="relative aspect-square bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden group/item border border-gray-200 dark:border-gray-700">
                                            <img src={preview} alt="Gallery item" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeGalleryPhoto(index)}
                                                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow transition opacity-0 group-hover/item:opacity-100"
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Submit Actions */}
                    <div className="flex justify-end gap-4 pt-4">
                        <Link
                            to="/products"
                            className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={productMutation.isLoading}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-2.5 rounded-xl text-sm font-semibold shadow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {productMutation.isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {isEditMode ? "Save Changes" : "Create Product"}
                        </button>
                    </div>
                </form>

                {/* Right Side Live Card Preview */}
                <div className="lg:col-span-1 space-y-4">
                    <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Live Card Preview</h3>
                    <ProductPreviewCard
                        product={form}
                        mainPhotoPreview={mainPhotoUrl}
                    />
                </div>
            </div>
        </div>
    );
}
