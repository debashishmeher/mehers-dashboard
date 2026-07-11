import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus, Search, Edit2, Trash2, Loader2, BookOpen, AlertTriangle, Calendar, FileText } from "lucide-react";
import api from "../../utils/api";
import { useToast } from "../../Context/ToastContext";

export default function BlogList() {
    const queryClient = useQueryClient();
    const toast = useToast();
    const [search, setSearch] = useState("");

    // Fetch all blogs
    const { data: blogData, isLoading, isError, refetch } = useQuery({
        queryKey: ["blogs"],
        queryFn: async () => {
            const res = await api.get("/api/blogs");
            return res.data || {};
        }
    });

    const blogs = blogData?.blogs || [];

    // Delete Blog Mutation
    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/api/blogs/${id}`),
        onSuccess: (data) => {
            if (data.status === "success") {
                toast.success("Blog post deleted successfully!");
                queryClient.invalidateQueries(["blogs"]);
            } else {
                toast.error(data.message || "Failed to delete blog post.");
            }
        },
        onError: (err) => {
            toast.error(err.message || "An error occurred while deleting the blog post.");
        }
    });

    const handleDelete = (id, title) => {
        const confirmDelete = window.confirm(`Are you sure you want to delete the blog post "${title}"? This action cannot be undone.`);
        if (confirmDelete) {
            deleteMutation.mutate(id);
        }
    };

    // Client-side search filtering
    const filteredBlogs = blogs.filter(blog => 
        blog.title?.toLowerCase().includes(search.toLowerCase()) ||
        blog.desc?.toLowerCase().includes(search.toLowerCase()) ||
        blog.blog?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto py-6 px-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-gray-100 dark:border-gray-700/50">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-purple-600" /> Store Blog Posts
                    </h1>
                    <p className="text-xs text-gray-500 mt-0.5">Manage search-engine optimized blog articles, publications, and news updates</p>
                </div>
                <Link
                    to="/blogs/new"
                    className="self-start sm:self-center bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow transition duration-200 flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Add Blog Post
                </Link>
            </div>

            {/* Filter/Search Bar */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 mb-6 shadow-sm flex items-center gap-4 transition-all duration-300">
                <div className="relative w-full">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search blog posts by title, description or content..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition"
                    />
                </div>
            </div>

            {/* Content States */}
            {isLoading ? (
                <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                    <span className="text-sm text-gray-500">Loading blogs inventory...</span>
                </div>
            ) : isError ? (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center max-w-md mx-auto my-12">
                    <AlertTriangle className="w-12 h-12 text-red-500 mb-3" />
                    <h3 className="text-base font-bold text-red-800 dark:text-red-400">Failed to Load Blogs</h3>
                    <p className="text-xs text-red-600 dark:text-red-500/80 mt-1 mb-4">Could not retrieve the blog listing from the server.</p>
                    <button
                        onClick={refetch}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs px-4 py-2 rounded-lg transition"
                    >
                        Retry Connection
                    </button>
                </div>
            ) : filteredBlogs.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-12 text-center shadow-sm max-w-lg mx-auto">
                    <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">No blog posts found</h3>
                    <p className="text-xs text-gray-400 mt-1">No articles match your search query, or no blogs have been created yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
                    {filteredBlogs.map((blog) => {
                        const blogImg = blog.image || null;
                        const createdDate = blog.createdAt
                            ? new Date(blog.createdAt).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                              })
                            : "Recent Post";

                        return (
                            <div
                                key={blog._id}
                                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700/50 overflow-hidden w-full max-w-sm mx-auto transition-all duration-300 hover:shadow-xl group flex flex-col h-full"
                            >
                                {/* Cover Image */}
                                <div className="relative aspect-[16/10] bg-gray-50 dark:bg-gray-900/50 overflow-hidden flex items-center justify-center border-b border-gray-100 dark:border-gray-700/50 flex-shrink-0">
                                    {blogImg ? (
                                        <img
                                            src={blogImg}
                                            alt={blog.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            loading="lazy"
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
                                        <span>{createdDate}</span>
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="p-5 flex flex-col flex-grow justify-between">
                                    <div>
                                        <h3 className="text-base font-semibold text-gray-800 dark:text-white line-clamp-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" title={blog.title}>
                                            {blog.title}
                                        </h3>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 line-clamp-3 leading-relaxed">
                                            {blog.desc}
                                        </p>
                                    </div>

                                    {/* Action row */}
                                    <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-700/30 flex items-center justify-end gap-2">
                                        <Link
                                            to={`/blogs/edit/${blog._id}`}
                                            className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700/30 dark:hover:bg-gray-700/60 text-gray-600 dark:text-gray-300 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 border border-gray-200/50 dark:border-gray-600/20"
                                            title="Edit Post"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                            <span>Edit</span>
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(blog._id, blog.title)}
                                            className="p-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/60 text-red-500 dark:text-red-400 rounded-lg transition border border-red-100/50 dark:border-red-900/20"
                                            title="Delete Post"
                                            disabled={deleteMutation.isPending}
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
