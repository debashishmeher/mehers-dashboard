import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Upload, ArrowLeft, Loader2, Sparkles, FileText, Image as ImageIcon, Calendar } from "lucide-react";
import api from "../../utils/api";
import { useToast } from "../../Context/ToastContext";

export default function BlogForm() {
    const { blogId } = useParams();
    const isEditMode = !!blogId;
    const navigate = useNavigate();
    const toast = useToast();

    // Form inputs state
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [blog, setBlog] = useState("");

    // Photo state
    const [coverPhoto, setCoverPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState("");

    // Fetch blog post details if in Edit Mode
    const { data: blogData, isLoading: isFetching } = useQuery({
        queryKey: ["blog", blogId],
        queryFn: () => api.get(`/api/blogs/${blogId}`),
        enabled: isEditMode,
        onError: (err) => {
            toast.error(err.message || "Failed to load blog data.");
            navigate("/blogs");
        }
    });

    // Populate form fields on edit load
    useEffect(() => {
        if (isEditMode && blogData && blogData.status === "success") {
            const dataObj = blogData.data.blog;
            setTitle(dataObj.title || "");
            setDesc(dataObj.desc || "");
            setBlog(dataObj.blog || "");
            if (dataObj.image) {
                setPhotoPreview(dataObj.image);
            }
        }
    }, [isEditMode, blogData]);

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCoverPhoto(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    // Form submission mutation
    const blogMutation = useMutation({
        mutationFn: (formData) => {
            if (isEditMode) {
                return api.patch(`/api/blogs/${blogId}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
            } else {
                return api.post("/api/blogs", formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
            }
        },
        onSuccess: (data) => {
            if (data.status === "success") {
                toast.success(isEditMode ? "Blog updated successfully!" : "Blog created successfully!");
                navigate("/blogs");
            } else {
                toast.error(data.message || "Failed to save blog post.");
            }
        },
        onError: (err) => {
            toast.error(err.message || "An error occurred while saving the blog.");
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validations
        if (!title.trim()) {
            toast.error("Blog title is required.");
            return;
        }
        if (!desc.trim()) {
            toast.error("Summary is required.");
            return;
        }
        if (!blog.trim()) {
            toast.error("Blog content body is required.");
            return;
        }
        if (!isEditMode && !coverPhoto) {
            toast.error("Please upload a featured cover image.");
            return;
        }

        const formData = new FormData();
        formData.append("title", title.trim());
        formData.append("desc", desc.trim());
        formData.append("blog", blog.trim());
        if (coverPhoto) {
            formData.append("image", coverPhoto);
        }

        blogMutation.mutate(formData);
    };

    if (isEditMode && isFetching) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                <span className="text-sm text-gray-500">Loading blog post details...</span>
            </div>
        );
    }

    // Live preview values
    const previewTitle = title || "Draft Blog Post Title";
    const previewDesc = desc || "Write a brief description that captures readers' attention and appears on listings.";
    const formattedDate = new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });

    const isPending = blogMutation.isPending;

    return (
        <div className="max-w-7xl mx-auto py-6 px-4">
            {/* Top Navigation */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100 dark:border-gray-700/50">
                <div className="flex items-center gap-4">
                    <Link
                        to="/blogs"
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition text-gray-500 hover:text-gray-800 dark:hover:text-white"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                            {isEditMode ? "Edit Blog Post" : "Add New Blog Post"}
                        </h1>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {isEditMode ? "Update existing public blog content and images" : "Write a premium search-engine optimized article"}
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
                            <FileText className="w-4 h-4 text-purple-600" /> Article Details
                        </h2>

                        <div>
                            <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 block mb-1">Blog Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                placeholder="Enter post title (e.g. Benefits of Silk Sarees)"
                                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                                disabled={isPending}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 block mb-1">Short Description (SEO Summary)</label>
                            <textarea
                                value={desc}
                                onChange={(e) => setDesc(e.target.value)}
                                required
                                rows={3}
                                placeholder="Write a catchy 2-3 sentence overview of this post..."
                                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm resize-none"
                                disabled={isPending}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 block mb-1">Blog Content Body</label>
                            <textarea
                                value={blog}
                                onChange={(e) => setBlog(e.target.value)}
                                required
                                rows={12}
                                placeholder="Write your full article body content here..."
                                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm resize-y font-normal"
                                disabled={isPending}
                            />
                        </div>
                    </div>

                    {/* Submit Actions */}
                    <div className="flex justify-end gap-4 pt-4">
                        <Link
                            to="/blogs"
                            className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-2.5 rounded-xl text-sm font-semibold shadow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                            {isEditMode ? "Save Changes" : "Create Post"}
                        </button>
                    </div>
                </form>

                {/* Right Side Live Card Preview & Media */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Media Upload Section */}
                    <div className="bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-900/20 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 space-y-4">
                        <h2 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-purple-600" /> Featured Media
                        </h2>

                        <div>
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-2">Cover Photo (Required)</label>
                            <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-400 rounded-2xl p-4 flex flex-col items-center justify-center bg-gray-50/50 dark:bg-gray-900/30 transition relative cursor-pointer min-h-[140px]">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                    disabled={isPending}
                                />
                                <Upload className="w-6 h-6 text-gray-400 mb-2" />
                                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Choose featured photo</span>
                                <span className="text-[10px] text-gray-400 mt-1">PNG, JPG, JPEG (Max 5MB)</span>
                            </div>
                        </div>
                    </div>

                    {/* Live Preview Card */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Live Card Preview</h3>
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700/50 overflow-hidden w-full max-w-sm mx-auto transition-all duration-300 hover:shadow-xl group flex flex-col h-full">
                            {/* Cover Preview */}
                            <div className="relative aspect-[16/10] bg-gray-50 dark:bg-gray-900/50 overflow-hidden flex items-center justify-center border-b border-gray-100 dark:border-gray-700/50 flex-shrink-0">
                                {photoPreview ? (
                                    <img
                                        src={photoPreview}
                                        alt={previewTitle}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-6 text-gray-400 dark:text-gray-600">
                                        <FileText className="w-10 h-10 mb-2 stroke-[1.2]" />
                                        <span className="text-[10px] font-medium uppercase tracking-wider">No Cover Image</span>
                                    </div>
                                )}

                                {/* Date Overlay */}
                                <div className="absolute bottom-3 left-3 bg-black/55 backdrop-blur-md text-white text-[10px] px-2.5 py-1 rounded-lg flex items-center gap-1.5 border border-white/5 font-medium">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>{formattedDate}</span>
                                </div>
                            </div>

                            {/* Body Preview */}
                            <div className="p-5 flex flex-col flex-grow justify-between">
                                <div>
                                    <h3 className="text-base font-semibold text-gray-800 dark:text-white line-clamp-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" title={previewTitle}>
                                        {previewTitle}
                                    </h3>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 line-clamp-3 leading-relaxed min-h-[3rem]">
                                        {previewDesc}
                                    </p>
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-700/30 flex items-center justify-end">
                                    <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold uppercase tracking-wider bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                                        Live Preview
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
