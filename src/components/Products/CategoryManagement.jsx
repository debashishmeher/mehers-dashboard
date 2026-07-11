import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit2, Trash2, Loader2, Sparkles, Folder, FolderPlus, X, AlertTriangle, GripVertical, Upload } from "lucide-react";
import api from "../../utils/api";
import { useToast } from "../../Context/ToastContext";

export default function CategoryManagement() {
    const queryClient = useQueryClient();
    const toast = useToast();

    // Form inputs state
    const [name, setName] = useState("");
    const [desc, setDesc] = useState("");
    const [active, setActive] = useState(true);
    
    // Photo upload state
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState("");

    const [editingCategory, setEditingCategory] = useState(null); // category object being edited

    // Fetch all categories
    const { data: categoryData, isLoading, isError, refetch } = useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            const res = await api.get("/api/category");
            return res.data || {};
        }
    });

    const categories = categoryData?.categories || [];

    // Local categories list state for drag and drop reordering
    const [categoriesList, setCategoriesList] = useState([]);
    const [draggedIndex, setDraggedIndex] = useState(null);

    // Sync local list with fetched data
    useEffect(() => {
        if (categories.length > 0) {
            setCategoriesList(categories);
        } else {
            setCategoriesList([]);
        }
    }, [categories]);

    // Create Category Mutation
    const createMutation = useMutation({
        mutationFn: (formData) => api.post("/api/category", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        }),
        onSuccess: (data) => {
            if (data.status === "success") {
                toast.success("Category created successfully!");
                resetForm();
                queryClient.invalidateQueries(["categories"]);
            } else {
                toast.error(data.message || "Failed to create category.");
            }
        },
        onError: (err) => {
            toast.error(err.message || "An error occurred while creating category.");
        }
    });

    // Update Category Mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, formData }) => api.patch(`/api/category/${id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        }),
        onSuccess: (data) => {
            if (data.status === "success") {
                toast.success("Category updated successfully!");
                resetForm();
                queryClient.invalidateQueries(["categories"]);
            } else {
                toast.error(data.message || "Failed to update category.");
            }
        },
        onError: (err) => {
            toast.error(err.message || "An error occurred while updating category.");
        }
    });

    // Delete Category Mutation
    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/api/category/${id}`),
        onSuccess: () => {
            toast.success("Category deleted successfully!");
            queryClient.invalidateQueries(["categories"]);
        },
        onError: (err) => {
            toast.error(err.message || "An error occurred while deleting category.");
        }
    });

    // Reorder Categories Mutation
    const reorderMutation = useMutation({
        mutationFn: (payload) => api.patch("/api/category/reorder", payload),
        onSuccess: (data) => {
            if (data.status === "success") {
                toast.success("Categories display order saved!");
                queryClient.invalidateQueries(["categories"]);
            } else {
                toast.error(data.message || "Failed to reorder categories.");
            }
        },
        onError: (err) => {
            toast.error(err.message || "An error occurred while reordering.");
        }
    });

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhoto(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!name.trim()) {
            toast.error("Category name is required.");
            return;
        }

        const formData = new FormData();
        formData.append("name", name.trim());
        formData.append("desc", desc.trim());
        formData.append("active", active);
        if (photo) {
            formData.append("photo", photo);
        }

        if (editingCategory) {
            updateMutation.mutate({
                id: editingCategory._id,
                formData
            });
        } else {
            createMutation.mutate(formData);
        }
    };

    const handleEditStart = (category) => {
        setEditingCategory(category);
        setName(category.name);
        setDesc(category.desc || "");
        setActive(category.active ?? true);
        setPhoto(null);
        if (category.photo) {
            setPhotoPreview(category.photo);
        } else {
            setPhotoPreview("");
        }
    };

    const handleDelete = (id, catName) => {
        const confirmDelete = window.confirm(`Are you sure you want to delete the category "${catName}"? This will not delete products assigned to this category.`);
        if (confirmDelete) {
            deleteMutation.mutate(id);
        }
    };

    const resetForm = () => {
        setEditingCategory(null);
        setName("");
        setDesc("");
        setActive(true);
        setPhoto(null);
        setPhotoPreview("");
    };

    // HTML5 Drag & Drop handlers
    const handleDragStart = (e, index) => {
        e.dataTransfer.setData("text/plain", index);
        e.dataTransfer.effectAllowed = "move";
        setDraggedIndex(index);
    };

    const handleDragOver = (e, index) => {
        e.preventDefault(); // allow drop
        if (draggedIndex === null || draggedIndex === index) return;

        const newList = [...categoriesList];
        const draggedItem = newList[draggedIndex];
        
        newList.splice(draggedIndex, 1);
        newList.splice(index, 0, draggedItem);
        
        setDraggedIndex(index);
        setCategoriesList(newList);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);

        // Prepare reorder index structure
        const reorderPayload = {
            order: categoriesList.map((cat, idx) => ({
                id: cat._id,
                index: idx
            }))
        };

        reorderMutation.mutate(reorderPayload);
    };

    const isPending = createMutation.isPending || updateMutation.isPending;

    return (
        <div className="max-w-7xl mx-auto py-6 px-4">
            {/* Header */}
            <div className="mb-8 pb-4 border-b border-gray-100 dark:border-gray-700/50">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <Folder className="w-6 h-6 text-purple-600" /> Categories Manager
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">Drag-and-drop items to sort display ordering, configure photos, and manage catalog categories</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700/50 rounded-2xl p-6 sticky top-6">
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-50 dark:border-gray-700/30">
                            <h2 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                {editingCategory ? (
                                    <>
                                        <Edit2 className="w-4 h-4 text-amber-500" /> Edit Category
                                    </>
                                ) : (
                                    <>
                                        <FolderPlus className="w-4 h-4 text-purple-600" /> Add Category
                                    </>
                                )}
                            </h2>
                            {editingCategory && (
                                <button
                                    onClick={resetForm}
                                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Photo Upload Zone */}
                            <div>
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">
                                    Category Cover Photo
                                </label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-2xl hover:border-purple-500 transition-colors cursor-pointer relative bg-gray-50/50 dark:bg-gray-900/20">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        disabled={isPending}
                                    />
                                    <div className="space-y-1.5 text-center pointer-events-none">
                                        {photoPreview ? (
                                            <div className="relative w-20 h-20 mx-auto rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                                                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                            </div>
                                        ) : (
                                            <Upload className="mx-auto h-8 w-8 text-gray-400 stroke-[1.2]" />
                                        )}
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            <span>Upload a cover file</span>
                                        </div>
                                        <p className="text-[10px] text-gray-400">PNG, JPG or JPEG up to 2MB</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">
                                    Category Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Silk Sarees, Summer Kurtis"
                                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                                    disabled={isPending}
                                    maxLength={40}
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={desc}
                                    onChange={(e) => setDesc(e.target.value)}
                                    placeholder="Write a brief overview of this catalog category..."
                                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm resize-none"
                                    rows={3}
                                    disabled={isPending}
                                    maxLength={150}
                                />
                            </div>

                            <div className="flex items-center justify-between py-2">
                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 block">
                                    Active Status
                                </span>
                                <label className="relative inline-flex items-center cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={active}
                                        onChange={(e) => setActive(e.target.checked)}
                                        className="sr-only peer"
                                        disabled={isPending}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={isPending}
                                className={`w-full py-2.5 rounded-xl font-semibold text-sm shadow transition duration-200 flex items-center justify-center gap-2 ${
                                    editingCategory
                                        ? "bg-amber-500 hover:bg-amber-600 text-white"
                                        : "bg-purple-600 hover:bg-purple-700 text-white"
                                } disabled:opacity-50`}
                            >
                                {isPending ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : editingCategory ? (
                                    <>Update Category</>
                                ) : (
                                    <>
                                        <Plus className="w-4 h-4" /> Create Category
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* List Section */}
                <div className="lg:col-span-2">
                    {isLoading ? (
                        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 rounded-2xl shadow-sm">
                            <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                            <span className="text-sm text-gray-500">Loading categories catalog...</span>
                        </div>
                    ) : isError ? (
                        <div className="p-8 text-center bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 rounded-2xl shadow-sm">
                            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                            <h3 className="text-base font-bold text-gray-800 dark:text-white">Failed to Load</h3>
                            <button
                                onClick={refetch}
                                className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl"
                            >
                                Retry Connection
                            </button>
                        </div>
                    ) : categoriesList.length === 0 ? (
                        <div className="p-12 text-center bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 rounded-2xl shadow-sm">
                            <Folder className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">No categories found</h3>
                            <p className="text-xs text-gray-400 mt-1">Create your first catalog category using the panel on the left.</p>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 rounded-2xl p-6 shadow-lg max-h-[calc(100vh-12rem)] flex flex-col">
                            <div className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1.5 px-1 pb-3 border-b border-gray-100 dark:border-gray-700/30 mb-4 flex-shrink-0">
                                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                                <span>Tip: Grab the handle icon and drag vertically to adjust category display order.</span>
                            </div>
                            
                            <div className="space-y-3 overflow-y-auto pr-2 flex-grow sidebar-scrollbar">
                                {categoriesList.map((cat, index) => (
                                    <div
                                        key={cat._id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, index)}
                                        onDragOver={(e) => handleDragOver(e, index)}
                                        onDragEnd={handleDragEnd}
                                        className={`bg-white dark:bg-gray-900 p-4 rounded-xl border ${
                                            draggedIndex === index
                                                ? "border-purple-500 bg-purple-50/20 opacity-50 ring-2 ring-purple-500/20"
                                                : editingCategory?._id === cat._id
                                                ? "border-amber-400 ring-2 ring-amber-400/20"
                                                : "border-gray-100 dark:border-gray-700/30 hover:border-gray-200 dark:hover:border-gray-600"
                                        } flex items-center justify-between gap-4 transition duration-200 select-none`}
                                    >
                                        {/* Drag handle & order index */}
                                        <div className="flex items-center gap-3">
                                            <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 p-1 flex items-center justify-center">
                                                <GripVertical className="w-5 h-5" />
                                            </div>
                                            <span className="w-6 h-6 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 text-xs rounded-full flex items-center justify-center font-bold">
                                                {index + 1}
                                            </span>
                                        </div>

                                        {/* Photo and Details */}
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div className="w-12 h-12 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-150 dark:border-gray-700 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                {cat.photo ? (
                                                    <img
                                                        src={cat.photo}
                                                        alt={cat.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <Folder className="w-5 h-5 text-gray-400 stroke-[1.2]" />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="font-semibold text-gray-800 dark:text-white text-sm capitalize truncate">
                                                        {cat.name}
                                                    </h3>
                                                    <span
                                                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                                            cat.active
                                                                ? "bg-green-50 text-green-600 border border-green-200 dark:bg-green-950/20 dark:border-green-900"
                                                                : "bg-red-50 text-red-500 border border-red-200 dark:bg-red-950/20 dark:border-red-900"
                                                        }`}
                                                    >
                                                        {cat.active ? "Active" : "Inactive"}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate">
                                                    {cat.desc || "No category description provided."}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-1 border-l border-gray-100 dark:border-gray-700/50 pl-3">
                                            <button
                                                onClick={() => handleEditStart(cat)}
                                                className="p-1.5 hover:bg-amber-50 dark:hover:bg-amber-950/20 text-amber-500 rounded-lg transition duration-200"
                                                title="Edit Category"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(cat._id, cat.name)}
                                                className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 rounded-lg transition duration-200"
                                                title="Delete Category"
                                                disabled={deleteMutation.isPending}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
