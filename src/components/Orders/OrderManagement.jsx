import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ShoppingBag, Search, Eye, Trash2, Loader2, AlertTriangle, CheckCircle, Package, Truck, Clock, CreditCard, MapPin, Phone, Mail, User } from "lucide-react";
import api from "../../utils/api";
import { useToast } from "../../Context/ToastContext";

export default function OrderManagement() {
    const queryClient = useQueryClient();
    const toast = useToast();

    // Filtering states
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [payFilter, setPayFilter] = useState("all");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [trackingOrder, setTrackingOrder] = useState(null);
    const [deleteOrderId, setDeleteOrderId] = useState(null);

    // Fetch orders list
    const { data: ordersData, isLoading, isError, refetch } = useQuery({
        queryKey: ["orders", statusFilter, payFilter],
        queryFn: async () => {
            const params = {};
            if (statusFilter !== "all") params.status = statusFilter;
            if (payFilter !== "all") params.payType = payFilter;

            const res = await api.get("/api/order", { params });
            return res || {};
        }
    });

    const allOrders = ordersData?.data?.orders || [];

    // Update status Mutation
    const updateStatusMutation = useMutation({
        mutationFn: ({ orderId, status }) => api.patch(`/api/order/${orderId}`, { status }),
        onSuccess: (data) => {
            if (data.status === "success") {
                toast.success("Order status updated successfully!");
                queryClient.invalidateQueries(["orders"]);
                if (selectedOrder && selectedOrder._id === data.data.order._id) {
                    setSelectedOrder(data.data.order);
                }
            } else {
                toast.error(data.message || "Failed to update order status.");
            }
        },
        onError: (err) => {
            toast.error(err.message || "Error occurred while updating order status.");
        }
    });

    // Update tracking Mutation
    const updateTrackingMutation = useMutation({
        mutationFn: ({ orderId, trackingCode, trackingLink }) =>
            api.patch(`/api/order/${orderId}`, { trackingCode, trackingLink }),
        onSuccess: (data) => {
            if (data.status === "success") {
                toast.success("Tracking information updated successfully!");
                queryClient.invalidateQueries(["orders"]);
                if (selectedOrder && selectedOrder._id === data.data.order._id) {
                    setSelectedOrder(data.data.order);
                }
                setTrackingOrder(null);
            } else {
                toast.error(data.message || "Failed to update tracking info.");
            }
        },
        onError: (err) => {
            toast.error(err.message || "Error occurred while updating tracking info.");
        }
    });

    // Delete order Mutation
    const deleteOrderMutation = useMutation({
        mutationFn: (orderId) => api.delete(`/api/order/${orderId}`),
        onSuccess: (data) => {
            if (data.status === "success") {
                toast.success("Order record deleted successfully.");
                queryClient.invalidateQueries(["orders"]);
                setSelectedOrder(null);
            } else {
                toast.error(data.message || "Failed to delete order.");
            }
        },
        onError: (err) => {
            toast.error(err.message || "Error occurred while deleting order.");
        }
    });

    const handleStatusChange = (orderId, newStatus) => {
        updateStatusMutation.mutate({ orderId, status: newStatus });
    };

    const handleDeleteOrder = (orderId) => {
        setDeleteOrderId(orderId);
    };

    const handleConfirmDelete = () => {
        if (deleteOrderId) {
            deleteOrderMutation.mutate(deleteOrderId, {
                onSuccess: () => {
                    setDeleteOrderId(null);
                }
            });
        }
    };

    // Calculate metrics
    const totalCount = allOrders.length;
    const pendingCount = allOrders.filter(o => o.status === "ordered" || o.status === "initiate").length;
    const transitCount = allOrders.filter(o => o.status === "on-way").length;
    const deliveredCount = allOrders.filter(o => o.status === "delivered").length;
    const totalSales = allOrders
        .filter(o => o.status === "delivered")
        .reduce((sum, o) => sum + (Number(o.price) || 0), 0);

    // Apply text search filtering
    const filteredOrders = allOrders.filter(order => {
        const matchesSearch =
            order._id?.toLowerCase().includes(search.toLowerCase()) ||
            order.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
            order.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
            order.address?.toLowerCase().includes(search.toLowerCase()) ||
            order.phone?.toString().includes(search);

        return matchesSearch;
    });

    const getStatusStyle = (status) => {
        switch (status) {
            case "delivered":
                return "bg-emerald-50 text-emerald-700 border-emerald-250 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900";
            case "on-way":
                return "bg-purple-50 text-purple-700 border-purple-250 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900";
            case "initiate":
                return "bg-amber-50 text-amber-700 border-amber-250 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900";
            default:
                return "bg-blue-50 text-blue-700 border-blue-250 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900";
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "delivered":
                return <CheckCircle className="w-4 h-4 text-emerald-500" />;
            case "on-way":
                return <Truck className="w-4 h-4 text-purple-500" />;
            case "initiate":
                return <Clock className="w-4 h-4 text-amber-500" />;
            default:
                return <Package className="w-4 h-4 text-blue-500" />;
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-6 px-4">
            {/* Header */}
            <div className="mb-8 pb-4 border-b border-gray-100 dark:border-gray-700/50">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <ShoppingBag className="w-6 h-6 text-purple-600" /> Order Fulfillment Center
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">Track customer purchases, edit shipment delivery routes, and log transaction files</p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-800 p-4 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Total Orders</span>
                    <p className="text-xl font-bold text-gray-800 dark:text-white mt-1">{totalCount}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Awaiting Dispatch</span>
                    <p className="text-xl font-bold text-blue-600 mt-1">{pendingCount}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm">
                    <span className="text-[10px] uppercase font-bold text-gray-400">In Transit</span>
                    <p className="text-xl font-bold text-purple-600 mt-1">{transitCount}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Delivered</span>
                    <p className="text-xl font-bold text-emerald-600 mt-1">{deliveredCount}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm col-span-2 lg:col-span-1">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Total Sales Sales</span>
                    <p className="text-xl font-bold text-purple-700 dark:text-purple-400 mt-1">₹{totalSales.toLocaleString("en-IN")}</p>
                </div>
            </div>

            {/* Filter Panel */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 mb-6 shadow-sm flex flex-col md:flex-row items-center gap-4">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search by Order ID, Buyer Name, Email or Address..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    />
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="flex-1 md:flex-initial px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-800 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        <option value="all">All Statuses</option>
                        <option value="ordered">Ordered</option>
                        <option value="initiate">Initiated</option>
                        <option value="on-way">On the Way</option>
                        <option value="delivered">Delivered</option>
                    </select>

                    <select
                        value={payFilter}
                        onChange={(e) => setPayFilter(e.target.value)}
                        className="flex-1 md:flex-initial px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-800 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        <option value="all">All Payments</option>
                        <option value="online">Online Card/UPI</option>
                        <option value="offline">Cash on Delivery</option>
                    </select>
                </div>
            </div>

            {/* List Table */}
            {isLoading ? (
                <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl">
                    <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                    <span className="text-sm text-gray-500">Retrieving order lists...</span>
                </div>
            ) : isError ? (
                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-12 text-center shadow-sm">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-gray-800 dark:text-white">Connection Error</h3>
                    <p className="text-xs text-gray-400 mt-1">Failed to query order records from the server.</p>
                    <button
                        onClick={refetch}
                        className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl"
                    >
                        Retry Load
                    </button>
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-16 text-center shadow-sm">
                    <ShoppingBag className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">No orders logged</h3>
                    <p className="text-xs text-gray-400 mt-1">No transactions fit your current search query.</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-150 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">
                                    <th className="p-4">Order ID</th>
                                    <th className="p-4">Customer</th>
                                    <th className="p-4">Purchased Items</th>
                                    <th className="p-4">Payment</th>
                                    <th className="p-4">Fulfillment Status</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50 text-sm">
                                {filteredOrders.map((order) => {
                                    const createdDate = order.createdAt
                                        ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                                              day: "numeric",
                                              month: "short",
                                              year: "numeric",
                                              hour: "2-digit",
                                              minute: "2-digit"
                                          })
                                        : "N/A";

                                    // Safely build the summary string of items
                                    const itemsCount = order.product?.length || 0;
                                    const firstItemName = order.product?.[0]?.product?.name || "Deleted Product Item";

                                    return (
                                        <tr key={order._id} className="hover:bg-gray-50/30 dark:hover:bg-gray-900/10 transition">
                                            {/* Order ID */}
                                            <td className="p-4">
                                                <span className="font-mono text-xs font-bold text-gray-850 dark:text-gray-300 block">
                                                    #{order._id?.slice(-8)}
                                                </span>
                                                <span className="text-[10px] text-gray-400 mt-0.5 block">{createdDate}</span>
                                            </td>

                                            {/* Buyer info */}
                                            <td className="p-4">
                                                <div className="font-semibold text-gray-800 dark:text-white capitalize">
                                                    {order.user?.name || "Guest Checkout"}
                                                </div>
                                                <div className="text-xs text-gray-400 mt-0.5">{order.user?.email || "No Email"}</div>
                                            </td>

                                            {/* Items purchased */}
                                            <td className="p-4">
                                                <div className="text-xs text-gray-800 dark:text-gray-300">
                                                    <span className="font-semibold">{firstItemName}</span>
                                                    {itemsCount > 1 && (
                                                        <span className="text-purple-600 dark:text-purple-400 font-bold ml-1">
                                                            +{itemsCount - 1} more items
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-[10px] text-gray-400 mt-0.5">
                                                    Qty: {order.product?.reduce((acc, p) => acc + (p?.quantity || 1), 0)} units
                                                </div>
                                            </td>

                                            {/* Payment details */}
                                            <td className="p-4">
                                                <div className="font-bold text-gray-800 dark:text-white">
                                                    ₹{(Number(order.price) || 0).toLocaleString("en-IN")}
                                                </div>
                                                <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider mt-0.5 ${
                                                    order.payType === "online" ? "text-emerald-600" : "text-gray-500"
                                                }`}>
                                                    <CreditCard className="w-3 h-3" />
                                                    {order.payType}
                                                </span>
                                            </td>

                                            {/* Status dropdown */}
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(order.status)}
                                                    <select
                                                        value={order.status || "ordered"}
                                                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                                        disabled={updateStatusMutation.isPending}
                                                        className={`text-xs px-2.5 py-1.5 border rounded-lg font-bold capitalize focus:outline-none focus:ring-1 focus:ring-purple-500 ${getStatusStyle(
                                                            order.status
                                                        )}`}
                                                    >
                                                        <option value="ordered">Ordered</option>
                                                        <option value="initiate">Initiated</option>
                                                        <option value="on-way">On Way</option>
                                                        <option value="delivered">Delivered</option>
                                                    </select>
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => setSelectedOrder(order)}
                                                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-550 dark:text-gray-400 rounded-lg transition"
                                                        title="Order Summary Details"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setTrackingOrder(order)}
                                                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-550 dark:text-gray-400 rounded-lg transition"
                                                        title="Update Tracking Info"
                                                    >
                                                        <Truck className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteOrder(order._id)}
                                                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 dark:text-red-400 rounded-lg transition"
                                                        title="Delete Order Record"
                                                        disabled={deleteOrderMutation.isPending}
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

            {/* Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 max-w-2xl w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-fade-in">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-900/10 flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-bold text-gray-800 dark:text-white">Order Receipt Summary</h3>
                                <span className="font-mono text-xs text-gray-450 dark:text-gray-400 block mt-0.5">#{selectedOrder._id}</span>
                            </div>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-450 rounded-xl text-xs font-semibold"
                            >
                                Close
                            </button>
                        </div>

                        {/* Modal Body (Scrollable) */}
                        <div className="p-6 overflow-y-auto space-y-6 flex-1">
                            {/* Order Details & Customer Contact */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50/50 dark:bg-gray-900/30 rounded-2xl border border-gray-150/50 dark:border-gray-750">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                                        <User className="w-3.5 h-3.5 text-purple-600" /> Customer Information
                                    </h4>
                                    <div className="space-y-2 text-xs">
                                        <p className="font-bold text-gray-800 dark:text-white capitalize">{selectedOrder.user?.name || "Guest Buyer"}</p>
                                        <p className="text-gray-500 flex items-center gap-1.5">
                                            <Mail className="w-3.5 h-3.5" /> {selectedOrder.user?.email || "No email address"}
                                        </p>
                                        {selectedOrder.phone && (
                                            <p className="text-gray-500 flex items-center gap-1.5">
                                                <Phone className="w-3.5 h-3.5" /> {selectedOrder.phone}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="p-4 bg-gray-50/50 dark:bg-gray-900/30 rounded-2xl border border-gray-150/50 dark:border-gray-750">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                                        <MapPin className="w-3.5 h-3.5 text-purple-600" /> Shipping & Delivery
                                    </h4>
                                    <p className="text-xs text-gray-650 dark:text-gray-300 leading-relaxed font-semibold mb-3">
                                        {selectedOrder.address || "No shipping address provided."}
                                    </p>
                                    <div className="pt-2.5 border-t border-gray-200 dark:border-gray-700 text-xs">
                                        <span className="font-bold text-gray-400 uppercase text-[10px] tracking-wider block mb-1.5">Shipment Tracking</span>
                                        {selectedOrder.trackingCode ? (
                                            <div className="space-y-1">
                                                <p className="text-gray-700 dark:text-gray-300 font-mono">Code: <strong className="text-gray-900 dark:text-white">{selectedOrder.trackingCode}</strong></p>
                                                {selectedOrder.trackingLink && (
                                                    <a
                                                        href={selectedOrder.trackingLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 mt-0.5"
                                                    >
                                                        Track Shipment <Truck className="w-3 h-3" />
                                                    </a>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-gray-400 italic text-[11px]">No tracking info added yet.</p>
                                        )}
                                        <button
                                            onClick={() => setTrackingOrder(selectedOrder)}
                                            className="mt-3.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 text-[10px] font-bold rounded-lg border border-purple-200 dark:border-purple-900 transition"
                                        >
                                            Update Tracking Info
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Products Bought List */}
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Purchased Items</h4>
                                <div className="divide-y divide-gray-100 dark:divide-gray-750 border border-gray-150/50 dark:border-gray-750 rounded-2xl overflow-hidden">
                                    {selectedOrder.product?.map((item, idx) => {
                                        if (!item) return null;
                                        const prodDetail = item.product || {};
                                        const finalItemPrice = prodDetail.price - (prodDetail.price * (prodDetail.discount || 0)) / 100;
                                        
                                        return (
                                            <div key={item._id || idx} className="p-4 bg-white dark:bg-gray-800/20 flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-12 bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                        {prodDetail.mainphoto ? (
                                                            <img
                                                                src={prodDetail.mainphoto}
                                                                alt={prodDetail.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <Package className="w-4 h-4 text-gray-400" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h5 className="font-semibold text-gray-800 dark:text-white capitalize text-xs">{prodDetail.name || "Deleted Product Item"}</h5>
                                                        <span className="text-[10px] text-gray-400 block mt-0.5">Code: {prodDetail.code || "N/A"}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-xs font-bold text-gray-800 dark:text-white">
                                                        ₹{finalItemPrice.toLocaleString("en-IN")}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 block mt-0.5">Qty: {item.quantity} units</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Summary Totals */}
                            <div className="p-4 bg-purple-50/30 dark:bg-purple-950/10 rounded-2xl border border-purple-100 dark:border-purple-900/40 flex items-center justify-between">
                                <div>
                                    <span className="text-xs text-gray-555 dark:text-gray-400">Total Purchase Amount</span>
                                    <p className="text-lg font-bold text-purple-800 dark:text-purple-400 mt-0.5">
                                        ₹{(Number(selectedOrder.price) || 0).toLocaleString("en-IN")}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-bold uppercase tracking-wider block text-gray-400">Payment Option</span>
                                    <span className="inline-block px-2.5 py-1 bg-white dark:bg-gray-900 border border-purple-250 dark:border-purple-900 rounded-lg text-xs font-bold text-purple-700 dark:text-purple-400 capitalize mt-1 shadow-sm">
                                        {selectedOrder.payType}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-900/10 flex items-center justify-between">
                            <span className="text-xs text-gray-400 flex items-center gap-1.5">
                                {getStatusIcon(selectedOrder.status)}
                                Delivery Status: <strong className="capitalize text-gray-700 dark:text-gray-300">{selectedOrder.status}</strong>
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="px-4 py-2 bg-gray-150 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-650 text-gray-700 dark:text-white text-xs font-semibold rounded-xl"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tracking Modal */}
            {trackingOrder && (
                <TrackingModal
                    order={trackingOrder}
                    onClose={() => setTrackingOrder(null)}
                    onSave={(trackingCode, trackingLink) => {
                        updateTrackingMutation.mutate({
                            orderId: trackingOrder._id,
                            trackingCode,
                            trackingLink,
                        });
                    }}
                    isPending={updateTrackingMutation.isPending}
                />
            )}

            {/* Delete Confirmation Modal */}
            {deleteOrderId && (
                <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-150 dark:border-gray-700 max-w-sm w-full shadow-2xl p-6 text-center animate-fade-in">
                        <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center mx-auto mb-4 border border-red-100 dark:border-red-900/50">
                            <AlertTriangle className="w-6 h-6 text-red-500" />
                        </div>
                        <h3 className="text-base font-bold text-gray-850 dark:text-white mb-2">Delete Order Record</h3>
                        <p className="text-xs text-gray-400 dark:text-gray-450 leading-relaxed mb-6">
                            Are you sure you want to permanently delete this order? This action cannot be undone and will erase all associated transaction files.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                type="button"
                                onClick={() => setDeleteOrderId(null)}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-650 text-gray-750 dark:text-white text-xs font-semibold rounded-xl transition duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmDelete}
                                disabled={deleteOrderMutation.isPending}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition duration-200"
                            >
                                {deleteOrderMutation.isPending ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Deleting...
                                    </>
                                ) : (
                                    "Confirm Delete"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// 7. Tracking Modal Component
function TrackingModal({ order, onClose, onSave, isPending }) {
    const [code, setCode] = useState(order.trackingCode || "");
    const [link, setLink] = useState(order.trackingLink || "");

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(code, link);
    };

    return (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 max-w-md w-full shadow-2xl overflow-hidden animate-fade-in">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-900/10 flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-bold text-gray-800 dark:text-white">Update Tracking Info</h3>
                            <span className="font-mono text-xs text-gray-450 dark:text-gray-400 block mt-0.5">Order #{order._id?.slice(-8)}</span>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-450 rounded-xl text-xs font-semibold"
                        >
                            Cancel
                        </button>
                    </div>

                    <div className="p-6 space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Tracking Code / Number</label>
                            <input
                                type="text"
                                placeholder="e.g. AWB12345678"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="w-full px-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Tracking URL / Link</label>
                            <input
                                type="url"
                                placeholder="https://dhl.com/track?id=..."
                                value={link}
                                onChange={(e) => setLink(e.target.value)}
                                className="w-full px-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                    </div>

                    <div className="p-6 border-t border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-900/10 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-650 text-gray-750 dark:text-white text-xs font-semibold rounded-xl"
                        >
                            Discard
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="w-3 h-3 animate-spin" /> Saving...
                                </>
                            ) : (
                                "Save Details"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
