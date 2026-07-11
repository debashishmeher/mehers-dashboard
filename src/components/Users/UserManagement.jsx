import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Search, ShieldAlert, Trash2, Loader2, Mail, UserCheck, Shield, ShoppingCart, UserX } from "lucide-react";
import api from "../../utils/api";
import { useToast } from "../../Context/ToastContext";
import { useUser } from "../../Context/ContextApt";

export default function UserManagement() {
    const queryClient = useQueryClient();
    const toast = useToast();
    const { userData } = useUser();
    const currentUserId = userData?.user?._id;

    // Filters states
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");

    // Fetch all users
    const { data: usersData, isLoading, isError, refetch } = useQuery({
        queryKey: ["users"],
        queryFn: async () => {
            const res = await api.get("/api/user/user");
            return res || {};
        }
    });

    const allUsers = usersData?.newuser || [];

    // Role qualification update Mutation
    const roleMutation = useMutation({
        mutationFn: ({ userId, role }) => api.patch(`/api/user/${userId}`, { role }),
        onSuccess: (data) => {
            if (data.status === "success") {
                toast.success("User access scope updated successfully!");
                queryClient.invalidateQueries(["users"]);
            } else {
                toast.error(data.message || "Failed to update role.");
            }
        },
        onError: (err) => {
            toast.error(err.message || "An error occurred while updating role.");
        }
    });

    // Delete user account Mutation
    const deleteMutation = useMutation({
        mutationFn: (userId) => api.delete(`/api/user/${userId}`),
        onSuccess: (data) => {
            if (data.status === "success") {
                toast.success("User account deleted successfully.");
                queryClient.invalidateQueries(["users"]);
            } else {
                toast.error(data.message || "Failed to delete user account.");
            }
        },
        onError: (err) => {
            toast.error(err.message || "An error occurred while deleting user account.");
        }
    });

    const handleRoleChange = (userId, newRole) => {
        if (userId === currentUserId) {
            toast.error("You cannot modify your own administrative access permissions.");
            return;
        }
        roleMutation.mutate({ userId, role: newRole });
    };

    const handleDeleteUser = (userId, name) => {
        if (userId === currentUserId) {
            toast.error("Demoting or deleting your own active profile is locked to prevent lockout.");
            return;
        }
        if (window.confirm(`Are you sure you want to permanently delete the user account for "${name}"? This will revoke all authentication tokens and sessions.`)) {
            deleteMutation.mutate(userId);
        }
    };

    // Calculate quick metrics
    const totalCount = allUsers.length;
    const adminCount = allUsers.filter(u => u.role === "admin").length;
    const sellerCount = allUsers.filter(u => u.role === "seller").length;
    const customerCount = allUsers.filter(u => u.role === "user" || !u.role).length;

    // Filtered users matching search and role dropdown
    const filteredUsers = allUsers.filter(user => {
        const matchesSearch = 
            user.name?.toLowerCase().includes(search.toLowerCase()) ||
            user.email?.toLowerCase().includes(search.toLowerCase());
        
        const matchesRole = 
            roleFilter === "all" ||
            (roleFilter === "user" ? (user.role === "user" || !user.role) : user.role === roleFilter);

        return matchesSearch && matchesRole;
    });

    return (
        <div className="max-w-7xl mx-auto py-6 px-4">
            {/* Header */}
            <div className="mb-8 pb-4 border-b border-gray-100 dark:border-gray-700/50">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <Users className="w-6 h-6 text-purple-600" /> Users & Staff Directory
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">Manage registered customer profiles, qualify role privileges, and revoke staff access permissions</p>
            </div>

            {/* Metrics Counters Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-800 p-4 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-purple-50 dark:bg-purple-950/20 text-purple-600 rounded-xl">
                        <Users className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-[10px] uppercase font-bold text-gray-400">Total Users</span>
                        <p className="text-lg font-bold text-gray-800 dark:text-white mt-0.5">{totalCount}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 rounded-xl">
                        <Shield className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-[10px] uppercase font-bold text-gray-400">Admins</span>
                        <p className="text-lg font-bold text-gray-800 dark:text-white mt-0.5">{adminCount}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-600 rounded-xl">
                        <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-[10px] uppercase font-bold text-gray-400">Sellers</span>
                        <p className="text-lg font-bold text-gray-800 dark:text-white mt-0.5">{sellerCount}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 text-blue-600 rounded-xl">
                        <ShoppingCart className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-[10px] uppercase font-bold text-gray-400">Customers</span>
                        <p className="text-lg font-bold text-gray-800 dark:text-white mt-0.5">{customerCount}</p>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 mb-6 shadow-sm flex flex-col sm:flex-row items-center gap-4">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search users by name or email address..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    />
                </div>

                <div className="w-full sm:w-auto">
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-800 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        <option value="all">All Roles</option>
                        <option value="admin">Administrators</option>
                        <option value="seller">Sellers</option>
                        <option value="user">Customers/Users</option>
                    </select>
                </div>
            </div>

            {/* Table Listing */}
            {isLoading ? (
                <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl">
                    <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                    <span className="text-sm text-gray-500">Loading user database...</span>
                </div>
            ) : isError ? (
                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-12 text-center shadow-sm">
                    <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-gray-800 dark:text-white">Connection Error</h3>
                    <button
                        onClick={refetch}
                        className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl"
                    >
                        Retry Connection
                    </button>
                </div>
            ) : filteredUsers.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-16 text-center shadow-sm animate-fade-in">
                    <UserX className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">No users found</h3>
                    <p className="text-xs text-gray-400 mt-1">No registered profiles fit your search parameters.</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-150 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">
                                    <th className="p-4">User</th>
                                    <th className="p-4">Email</th>
                                    <th className="p-4">Access Scope</th>
                                    <th className="p-4">Account Type</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50 text-sm">
                                {filteredUsers.map((user) => {
                                    const isSelf = user._id === currentUserId;
                                    const userPhoto = user.photo || "/default-avatar.png";

                                    return (
                                        <tr key={user._id} className="hover:bg-gray-50/30 dark:hover:bg-gray-900/10 transition">
                                            {/* Photo & Name */}
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200/50 dark:border-gray-600 flex-shrink-0 flex items-center justify-center">
                                                        <img
                                                            src={userPhoto}
                                                            alt={user.name}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => { e.target.src = "/default-avatar.png"; }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-gray-800 dark:text-white capitalize flex items-center gap-1.5">
                                                            {user.name}
                                                            {isSelf && (
                                                                <span className="bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 text-[9px] font-bold px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-900">
                                                                    You
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Email */}
                                            <td className="p-4">
                                                <a href={`mailto:${user.email}`} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400">
                                                    <Mail className="w-3.5 h-3.5" />
                                                    {user.email}
                                                </a>
                                            </td>

                                            {/* Role dropdown */}
                                            <td className="p-4">
                                                <select
                                                    value={user.role || "user"}
                                                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                                    disabled={isSelf || roleMutation.isPending}
                                                    className={`text-xs px-2.5 py-1.5 rounded-lg border font-bold capitalize focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:opacity-75 disabled:cursor-not-allowed ${
                                                        user.role === "admin"
                                                            ? "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/20 dark:border-red-900"
                                                            : user.role === "seller"
                                                            ? "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900"
                                                            : "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900"
                                                    }`}
                                                >
                                                    <option value="user">Customer</option>
                                                    <option value="seller">Seller</option>
                                                    <option value="admin">Administrator</option>
                                                </select>
                                            </td>

                                            {/* Account Type */}
                                            <td className="p-4">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                                                    user.googleId
                                                        ? "bg-emerald-50 text-emerald-600 border border-emerald-250 dark:bg-emerald-950/20"
                                                        : "bg-gray-50 text-gray-600 border border-gray-200 dark:bg-gray-700/50 dark:text-gray-400"
                                                }`}>
                                                    {user.googleId ? "Google Auth" : "Password"}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={() => handleDeleteUser(user._id, user.name)}
                                                    className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 dark:text-red-400 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
                                                    title={isSelf ? "Self-deletion is locked" : "Delete Account"}
                                                    disabled={isSelf || deleteMutation.isPending}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
