import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    MessageSquare, Search, Trash2, CheckCircle2, XCircle, Eye,
    Loader2, AlertTriangle, Flame, Snowflake, Thermometer, Calendar,
    ChevronLeft, ChevronRight, Phone, Mail, User, Clock, Plus, HelpCircle
} from "lucide-react";
import api from "../../utils/api";
import { useToast } from "../../Context/ToastContext";

export default function Enquary() {
    const queryClient = useQueryClient();
    const toast = useToast();

    // Query pagination and filters state
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [type, setType] = useState("all");

    // Modal view state
    const [selectedEnquiryId, setSelectedEnquiryId] = useState(null);

    // Callback scheduling state inside details modal
    const [schedMethod, setSchedMethod] = useState("call");
    const [schedMessage, setSchedMessage] = useState("");
    const [schedDate, setSchedDate] = useState("");

    // Fetch leads list (paginated, filtered, and searched)
    const { data: leadData, isLoading, isError, refetch } = useQuery({
        queryKey: ["enquiries", page, search, status, type],
        queryFn: async () => {
            const params = { page, limit: 10 };
            if (search.trim()) params.search = search;
            if (status !== "all") params.status = status;
            if (type !== "all") params.type = type;

            const res = await api.get("/api/enquary", { params });
            return res || {};
        }
    });

    const leads = leadData?.data?.leads || [];
    const totalLeads = leadData?.data?.totalLeads || 0;
    const totalPages = leadData?.data?.totalPages || 1;

    // Fetch single enquiry details + callback schedules
    const { data: detailData, isLoading: isDetailLoading, refetch: refetchDetails } = useQuery({
        queryKey: ["enquiry-detail", selectedEnquiryId],
        queryFn: async () => {
            const res = await api.get(`/api/enquary/${selectedEnquiryId}`);
            return res.data || {};
        },
        enabled: !!selectedEnquiryId
    });

    const activeEnquiry = detailData?.enquary || null;
    const schedules = detailData?.schedules || [];

    // Update status / temperature Mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, payload }) => api.patch(`/api/enquary/${id}`, payload),
        onSuccess: (data) => {
            if (data.status === "success") {
                toast.success("Lead qualification updated!");
                queryClient.invalidateQueries(["enquiries"]);
                if (selectedEnquiryId) refetchDetails();
            } else {
                toast.error(data.message || "Failed to update qualification.");
            }
        },
        onError: (err) => {
            toast.error(err.message || "Error saving qualification.");
        }
    });

    // Delete lead post Mutation
    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/api/enquary/${id}`),
        onSuccess: () => {
            toast.success("Enquiry deleted successfully!");
            queryClient.invalidateQueries(["enquiries"]);
            setSelectedEnquiryId(null);
        },
        onError: (err) => {
            toast.error(err.message || "Error deleting lead.");
        }
    });

    // Schedule callback post Mutation
    const scheduleMutation = useMutation({
        mutationFn: ({ enquiryId, payload }) => api.post(`/api/enquary/${enquiryId}/schedule`, payload),
        onSuccess: () => {
            toast.success("Callback schedule created!");
            refetchDetails();
            setSchedMessage("");
            setSchedDate("");
        },
        onError: (err) => {
            toast.error(err.message || "Error creating callback schedule.");
        }
    });

    const handleCreateSchedule = (e) => {
        e.preventDefault();
        if (!schedDate) {
            toast.error("Please pick a scheduled date.");
            return;
        }
        scheduleMutation.mutate({
            enquiryId: selectedEnquiryId,
            payload: {
                method: schedMethod,
                message: schedMessage,
                scheduleDate: schedDate
            }
        });
    };

    const handleDelete = (id, name) => {
        if (window.confirm(`Are you sure you want to delete the enquiry from "${name}"? This deletes all callback schedules as well.`)) {
            deleteMutation.mutate(id);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-6 px-4">
            {/* Header */}
            <div className="mb-8 pb-4 border-b border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <MessageSquare className="w-6 h-6 text-purple-600" /> Customer Enquiries & Leads
                    </h1>
                    <p className="text-xs text-gray-500 mt-0.5">Manage customer inquiries, view details, update temperatures, and plan follow-up calls</p>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 mb-6 shadow-sm flex flex-col md:flex-row items-center gap-4 transition duration-200">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search by customer name, email or phone number..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    {/* Status filter */}
                    <div className="flex-1 md:flex-initial">
                        <select
                            value={status}
                            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-800 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="all">All Statuses</option>
                            <option value="unchecked">Unchecked</option>
                            <option value="checked">Checked</option>
                        </select>
                    </div>

                    {/* Temperature filter */}
                    <div className="flex-1 md:flex-initial">
                        <select
                            value={type}
                            onChange={(e) => { setType(e.target.value); setPage(1); }}
                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-800 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="all">All Lead Types</option>
                            <option value="hot">Hot 🔥</option>
                            <option value="warm">Warm ⚡</option>
                            <option value="cold">Cold ❄️</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Inquiries List */}
            {isLoading ? (
                <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl">
                    <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                    <span className="text-sm text-gray-500">Loading incoming enquiries...</span>
                </div>
            ) : isError ? (
                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-12 text-center shadow-sm">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-gray-800 dark:text-white">Connection Failure</h3>
                    <button
                        onClick={refetch}
                        className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl"
                    >
                        Retry Connection
                    </button>
                </div>
            ) : leads.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-16 text-center shadow-sm">
                    <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">No leads found</h3>
                    <p className="text-xs text-gray-400 mt-1">No incoming enquiries fit the query filters.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Table View */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-150 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">
                                        <th className="p-4">Customer Name</th>
                                        <th className="p-4">Contact Info</th>
                                        <th className="p-4">Temperature</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">Inbound Date</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50 text-sm">
                                    {leads.map((lead) => {
                                        const inboundDate = lead.createdAt
                                            ? new Date(lead.createdAt).toLocaleDateString("en-IN", {
                                                  day: "numeric",
                                                  month: "short",
                                                  year: "numeric"
                                              })
                                            : "Recent";

                                        return (
                                            <tr key={lead._id} className="hover:bg-gray-50/30 dark:hover:bg-gray-900/10 transition">
                                                {/* Customer Name */}
                                                <td className="p-4">
                                                    <div className="font-semibold text-gray-800 dark:text-white capitalize flex items-center gap-2">
                                                        <User className="w-4 h-4 text-purple-600/60" />
                                                        {lead.name}
                                                    </div>
                                                </td>

                                                {/* Contact Details */}
                                                <td className="p-4 space-y-1">
                                                    <a href={`tel:${lead.phone}`} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-mono">
                                                        <Phone className="w-3.5 h-3.5" /> {lead.phone}
                                                    </a>
                                                    {lead.email && (
                                                        <a href={`mailto:${lead.email}`} className="flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-purple-600 dark:hover:text-purple-400">
                                                            <Mail className="w-3.5 h-3.5" /> {lead.email}
                                                        </a>
                                                    )}
                                                </td>

                                                {/* Temperature Qualification */}
                                                <td className="p-4">
                                                    <select
                                                        value={lead.type}
                                                        onChange={(e) => updateMutation.mutate({ id: lead._id, payload: { type: e.target.value } })}
                                                        className={`text-xs px-2.5 py-1 rounded-lg border font-bold capitalize focus:outline-none focus:ring-1 focus:ring-purple-500 ${
                                                            lead.type === "hot"
                                                                ? "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/20 dark:border-red-900"
                                                                : lead.type === "warm"
                                                                ? "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900"
                                                                : "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900"
                                                        }`}
                                                    >
                                                        <option value="cold">❄️ Cold</option>
                                                        <option value="warm">⚡ Warm</option>
                                                        <option value="hot">🔥 Hot</option>
                                                    </select>
                                                </td>

                                                {/* Checked/Unchecked status */}
                                                <td className="p-4">
                                                    <button
                                                        onClick={() => updateMutation.mutate({
                                                            id: lead._id,
                                                            payload: { status: lead.status === "checked" ? "unchecked" : "checked" }
                                                        })}
                                                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 border ${
                                                            lead.status === "checked"
                                                                ? "bg-green-50 text-green-600 border-green-200 dark:bg-green-950/20 dark:border-green-900"
                                                                : "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900"
                                                        }`}
                                                    >
                                                        {lead.status === "checked" ? (
                                                            <>
                                                                <CheckCircle2 className="w-3.5 h-3.5" /> Checked
                                                            </>
                                                        ) : (
                                                            <>
                                                                <XCircle className="w-3.5 h-3.5" /> Unchecked
                                                            </>
                                                        )}
                                                    </button>
                                                </td>

                                                {/* Created Date */}
                                                <td className="p-4 text-xs text-gray-500 dark:text-gray-400">
                                                    {inboundDate}
                                                </td>

                                                {/* Actions */}
                                                <td className="p-4 text-right">
                                                    <div className="inline-flex items-center gap-1.5">
                                                        <button
                                                            onClick={() => setSelectedEnquiryId(lead._id)}
                                                            className="p-1.5 hover:bg-gray-150 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg transition"
                                                            title="View Details & Schedules"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(lead._id, lead.name)}
                                                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 dark:text-red-400 rounded-lg transition"
                                                            title="Delete Lead"
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

                    {/* Pagination Footer */}
                    <div className="flex items-center justify-between pt-2">
                        <span className="text-xs text-gray-500">
                            Showing <span className="font-semibold text-gray-700 dark:text-gray-300">{leads.length}</span> of <span className="font-semibold text-gray-700 dark:text-gray-300">{totalLeads}</span> leads
                        </span>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page === 1}
                                className="p-2 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page === totalPages}
                                className="p-2 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Details & Scheduling Modal Overlay */}
            {selectedEnquiryId && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col border border-gray-100 dark:border-gray-700 animate-slide-up">
                        {/* Modal Header */}
                        <div className="p-5 border-b border-gray-150 dark:border-gray-700 flex items-center justify-between flex-shrink-0">
                            <h2 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                <User className="w-5 h-5 text-purple-600" /> Lead Information & Follow-ups
                            </h2>
                            <button
                                onClick={() => setSelectedEnquiryId(null)}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400 hover:text-gray-600"
                            >
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto space-y-6 flex-grow">
                            {isDetailLoading || !activeEnquiry ? (
                                <div className="py-12 flex flex-col items-center justify-center gap-2">
                                    <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                                    <span className="text-xs text-gray-500">Retrieving details...</span>
                                </div>
                            ) : (
                                <>
                                    {/* Lead Info Details */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50/50 dark:bg-gray-900/30 p-4 rounded-xl border border-gray-150 dark:border-gray-700/50">
                                        <div className="space-y-1">
                                            <span className="text-[10px] uppercase font-bold text-gray-400">Customer Name</span>
                                            <p className="font-semibold text-sm text-gray-800 dark:text-white capitalize">{activeEnquiry.name}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[10px] uppercase font-bold text-gray-400">Phone Number</span>
                                            <p className="font-mono text-sm text-gray-800 dark:text-white">
                                                <a href={`tel:${activeEnquiry.phone}`} className="hover:underline text-purple-600">{activeEnquiry.phone}</a>
                                            </p>
                                        </div>
                                        {activeEnquiry.email && (
                                            <div className="space-y-1">
                                                <span className="text-[10px] uppercase font-bold text-gray-400">Email Address</span>
                                                <p className="text-sm text-gray-800 dark:text-white break-all">
                                                    <a href={`mailto:${activeEnquiry.email}`} className="hover:underline text-purple-600">{activeEnquiry.email}</a>
                                                </p>
                                            </div>
                                        )}
                                        <div className="space-y-1">
                                            <span className="text-[10px] uppercase font-bold text-gray-400">Inbound Date</span>
                                            <p className="text-sm text-gray-800 dark:text-white">
                                                {new Date(activeEnquiry.createdAt).toLocaleString("en-IN")}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Qualification Row */}
                                    <div className="flex flex-wrap items-center gap-4 justify-between pt-2 border-t border-gray-100 dark:border-gray-700/50">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-semibold text-gray-500">Lead Status:</span>
                                            <button
                                                onClick={() => updateMutation.mutate({
                                                    id: activeEnquiry._id,
                                                    payload: { status: activeEnquiry.status === "checked" ? "unchecked" : "checked" }
                                                })}
                                                className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider flex items-center gap-1 ${
                                                    activeEnquiry.status === "checked"
                                                        ? "bg-green-50 text-green-600 border-green-200 dark:bg-green-950/20 dark:border-green-900"
                                                        : "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900"
                                                }`}
                                            >
                                                {activeEnquiry.status === "checked" ? "Checked" : "Unchecked"}
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-semibold text-gray-500">Lead Type:</span>
                                            <select
                                                value={activeEnquiry.type}
                                                onChange={(e) => updateMutation.mutate({ id: activeEnquiry._id, payload: { type: e.target.value } })}
                                                className={`text-xs px-2.5 py-1 rounded-lg border font-bold capitalize focus:outline-none focus:ring-1 focus:ring-purple-500 ${
                                                    activeEnquiry.type === "hot"
                                                        ? "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/20 dark:border-red-900"
                                                        : activeEnquiry.type === "warm"
                                                        ? "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900"
                                                        : "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900"
                                                }`}
                                            >
                                                <option value="cold">❄️ Cold</option>
                                                <option value="warm">⚡ Warm</option>
                                                <option value="hot">🔥 Hot</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Callback Schedule List */}
                                    <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-700/50">
                                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                                            <Clock className="w-4 h-4 text-purple-600" /> Scheduled Callback Logs ({schedules.length})
                                        </h3>

                                        {schedules.length === 0 ? (
                                            <p className="text-xs text-gray-400 dark:text-gray-500 italic bg-gray-50/20 dark:bg-gray-900/10 p-3 rounded-lg border border-gray-100 dark:border-gray-700/50">
                                                No callbacks have been scheduled for this lead. Use the form below to plan follow-up calls.
                                            </p>
                                        ) : (
                                            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                                                {schedules.map((schedule) => {
                                                    const icon = schedule.method === "email" ? (
                                                        <Mail className="w-3.5 h-3.5 text-blue-500" />
                                                    ) : schedule.method === "message" ? (
                                                        <MessageSquare className="w-3.5 h-3.5 text-green-500" />
                                                    ) : (
                                                        <Phone className="w-3.5 h-3.5 text-purple-500" />
                                                    );

                                                    return (
                                                        <div
                                                            key={schedule._id}
                                                            className="p-3 bg-gray-50/50 dark:bg-gray-900/20 border border-gray-150 dark:border-gray-700/50 rounded-lg flex items-center justify-between gap-3 text-xs"
                                                        >
                                                            <div className="min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                                                        {icon} <span className="capitalize">{schedule.method}</span>
                                                                    </span>
                                                                    <span className="text-[10px] text-gray-400 font-mono">
                                                                        {new Date(schedule.scheduleDate).toLocaleString("en-IN")}
                                                                    </span>
                                                                </div>
                                                                {schedule.message && (
                                                                    <p className="text-gray-500 dark:text-gray-400 mt-1 truncate max-w-md">
                                                                        Note: {schedule.message}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    {/* Callback Schedule Form */}
                                    <form onSubmit={handleCreateSchedule} className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                                            <Plus className="w-3.5 h-3.5 text-purple-600" /> Plan A Callback Call/Message
                                        </h4>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Contact Method</label>
                                                <select
                                                    value={schedMethod}
                                                    onChange={(e) => setSchedMethod(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-800 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                                                >
                                                    <option value="call">Call 📞</option>
                                                    <option value="message">WhatsApp Message 💬</option>
                                                    <option value="email">Email 📧</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Schedule Date & Time</label>
                                                <input
                                                    type="datetime-local"
                                                    value={schedDate}
                                                    onChange={(e) => setSchedDate(e.target.value)}
                                                    required
                                                    className="w-full px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-800 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Callback Message/Note</label>
                                            <textarea
                                                value={schedMessage}
                                                onChange={(e) => setSchedMessage(e.target.value)}
                                                rows={2}
                                                placeholder="Add follow-up notes (e.g. customer requested callback regarding saree sizes)..."
                                                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-800 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={scheduleMutation.isPending}
                                            className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                                        >
                                            {scheduleMutation.isPending ? (
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            ) : (
                                                <>
                                                    <Calendar className="w-3.5 h-3.5" /> Plan Callback
                                                </>
                                            )}
                                        </button>
                                    </form>
                                </>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 bg-gray-50 dark:bg-gray-900/30 border-t border-gray-150 dark:border-gray-700/50 flex justify-end flex-shrink-0">
                            <button
                                onClick={() => setSelectedEnquiryId(null)}
                                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                            >
                                Close Details
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
