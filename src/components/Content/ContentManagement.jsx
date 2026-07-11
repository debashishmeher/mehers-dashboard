import React, { useState, useEffect } from "react";
import { Sliders, Plus, Trash2, Save, Upload, Loader2, AlertTriangle, Eye, FolderOpen, Tag, Edit, ArrowUp, ArrowDown, Settings, Check, X } from "lucide-react";
import { useToast } from "../../Context/ToastContext";
import { useGetContent, useUpdateContent, useUploadContentImage } from "../../hooks/useContent";

const STORE_ICONS = ["Truck", "Shield", "Sparkles", "CreditCard", "RotateCcw", "ThumbsUp", "Clock", "Heart"];

export default function ContentManagement() {
    const toast = useToast();

    // Editor sections state
    const [activeTab, setActiveTab] = useState("hero");

    // Homepage state objects
    const [heroBanners, setHeroBanners] = useState([]);
    const [offers, setOffers] = useState([]);
    const [highlights, setHighlights] = useState([]);

    // Temporary modals / editors states
    const [editingItem, setEditingItem] = useState(null); // { type: 'hero'|'offer'|'highlight', index: number, data: object }
    const [creatingItem, setCreatingItem] = useState(null); // { type: 'hero'|'offer'|'highlight', data: object }
    const [uploadingImage, setUploadingImage] = useState(false);

    // Custom React Query Service Hooks
    const { data: contentData, isLoading, isError, refetch } = useGetContent();
    const saveMutation = useUpdateContent();
    const uploadImageMutation = useUploadContentImage();

    // Populate state once fetched
    useEffect(() => {
        if (contentData?.status === "success" && contentData.data?.content) {
            const data = contentData.data.content;
            setHeroBanners(data.heroBanners || []);
            setOffers(data.offers || []);
            setHighlights(data.highlights || []);
        }
    }, [contentData]);

    const handleSaveAll = () => {
        saveMutation.mutate({
            heroBanners,
            offers,
            highlights
        }, {
            onSuccess: (res) => {
                if (res.status === "success") {
                    setEditingItem(null);
                    setCreatingItem(null);
                }
            }
        });
    };

    // Dedicated image upload handler
    const handleImageUpload = async (e, targetStateSetter) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("image", file);

        setUploadingImage(true);
        try {
            const res = await uploadImageMutation.mutateAsync(formData);
            if (res.status === "success") {
                targetStateSetter(prev => ({ ...prev, image: res.url }));
            }
        } catch (err) {
            // Errors toast is handled inside the hook
        } finally {
            setUploadingImage(false);
        }
    };


    // --- Order / Reorder Operations ---
    const moveItem = (type, index, direction) => {
        let list = [];
        let setter = null;

        if (type === "hero") {
            list = [...heroBanners];
            setter = setHeroBanners;
        } else if (type === "offer") {
            list = [...offers];
            setter = setOffers;
        } else if (type === "highlight") {
            list = [...highlights];
            setter = setHighlights;
        }

        if (!setter) return;

        const targetIndex = direction === "up" ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= list.length) return;

        // Swap items
        const temp = list[index];
        list[index] = list[targetIndex];
        list[targetIndex] = temp;

        setter(list);
        toast.info("Reordered list. Save to persist changes.");
    };

    // --- Hero Slide CRUD ---
    const openCreateHero = () => {
        setCreatingItem({
            type: "hero",
            data: { title: "", subtitle: "", link: "", image: "", active: true }
        });
    };

    const handleSaveNewHero = () => {
        const { data } = creatingItem;
        if (!data.image) {
            toast.error("Slide image is required.");
            return;
        }
        setHeroBanners(prev => [...prev, data]);
        setCreatingItem(null);
        toast.success("Slide appended to list. Save to apply changes.");
    };

    const openEditHero = (index) => {
        setEditingItem({
            type: "hero",
            index,
            data: { ...heroBanners[index] }
        });
    };

    const handleUpdateHero = () => {
        const { index, data } = editingItem;
        if (!data.image) {
            toast.error("Slide image cannot be empty.");
            return;
        }
        setHeroBanners(prev => prev.map((item, idx) => idx === index ? data : item));
        setEditingItem(null);
        toast.success("Slide updated in list. Save to apply changes.");
    };

    const handleDeleteHero = (index) => {
        if (window.confirm("Are you sure you want to delete this hero slide?")) {
            setHeroBanners(prev => prev.filter((_, idx) => idx !== index));
            toast.info("Slide deleted. Save to apply changes.");
        }
    };

    // --- Offer Slide CRUD ---
    const openCreateOffer = () => {
        setCreatingItem({
            type: "offer",
            data: { title: "", subtitle: "", link: "", discountCode: "", image: "", active: true }
        });
    };

    const handleSaveNewOffer = () => {
        const { data } = creatingItem;
        if (!data.image) {
            toast.error("Offer image is required.");
            return;
        }
        setOffers(prev => [...prev, data]);
        setCreatingItem(null);
        toast.success("Offer appended to list. Save to apply changes.");
    };

    const openEditOffer = (index) => {
        setEditingItem({
            type: "offer",
            index,
            data: { ...offers[index] }
        });
    };

    const handleUpdateOffer = () => {
        const { index, data } = editingItem;
        if (!data.image) {
            toast.error("Offer image cannot be empty.");
            return;
        }
        setOffers(prev => prev.map((item, idx) => idx === index ? data : item));
        setEditingItem(null);
        toast.success("Offer card updated in list. Save to apply changes.");
    };

    const handleDeleteOffer = (index) => {
        if (window.confirm("Are you sure you want to delete this promotion offer card?")) {
            setOffers(prev => prev.filter((_, idx) => idx !== index));
            toast.info("Offer card deleted. Save to apply changes.");
        }
    };

    // --- Highlights CRUD ---
    const openCreateHighlight = () => {
        setCreatingItem({
            type: "highlight",
            data: { title: "", description: "", icon: "Truck" }
        });
    };

    const handleSaveNewHighlight = () => {
        const { data } = creatingItem;
        if (!data.title) {
            toast.error("Highlight header is required.");
            return;
        }
        setHighlights(prev => [...prev, data]);
        setCreatingItem(null);
        toast.success("Highlight card appended. Save to apply changes.");
    };

    const openEditHighlight = (index) => {
        setEditingItem({
            type: "highlight",
            index,
            data: { ...highlights[index] }
        });
    };

    const handleUpdateHighlight = () => {
        const { index, data } = editingItem;
        if (!data.title) {
            toast.error("Highlight header cannot be empty.");
            return;
        }
        setHighlights(prev => prev.map((item, idx) => idx === index ? data : item));
        setEditingItem(null);
        toast.success("Highlight card updated in list. Save to apply changes.");
    };

    const handleDeleteHighlight = (index) => {
        if (window.confirm("Are you sure you want to delete this highlight item?")) {
            setHighlights(prev => prev.filter((_, idx) => idx !== index));
            toast.info("Highlight item deleted. Save to apply changes.");
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-6 px-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-gray-100 dark:border-gray-700/50">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <Sliders className="w-6 h-6 text-purple-600" /> Website Content Editor
                    </h1>
                    <p className="text-xs text-gray-500 mt-0.5">Create, edit, reorder and delete hero banners, coupon promotions, and storefront highlights</p>
                </div>
                <button
                    onClick={handleSaveAll}
                    disabled={saveMutation.isPending}
                    className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-550/20 hover:shadow-purple-550/30 transition disabled:opacity-50"
                >
                    {saveMutation.isPending ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Saving Changes...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4" /> Save Content Changes
                        </>
                    )}
                </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 border-b border-gray-150 dark:border-gray-700 pb-3 mb-6">
                <button
                    onClick={() => setActiveTab("hero")}
                    className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
                        activeTab === "hero"
                            ? "bg-purple-555 text-white shadow-sm"
                            : "bg-transparent text-gray-450 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                >
                    Hero Slider Slides ({heroBanners.length})
                </button>
                <button
                    onClick={() => setActiveTab("offers")}
                    className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
                        activeTab === "offers"
                            ? "bg-purple-555 text-white shadow-sm"
                            : "bg-transparent text-gray-450 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                >
                    Announcements & Offers ({offers.length})
                </button>
                <button
                    onClick={() => setActiveTab("highlights")}
                    className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
                        activeTab === "highlights"
                            ? "bg-purple-555 text-white shadow-sm"
                            : "bg-transparent text-gray-450 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                >
                    Fulfillment Highlights ({highlights.length})
                </button>
            </div>

            {/* Loader / Content Display */}
            {isLoading ? (
                <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl">
                    <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                    <span className="text-sm text-gray-500">Loading customizer editor configurations...</span>
                </div>
            ) : isError ? (
                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-12 text-center shadow-sm">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-gray-800 dark:text-white">Connection Error</h3>
                    <p className="text-xs text-gray-400 mt-1">Failed to fetch homepage content models.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Add button trigger */}
                    <div className="flex justify-end">
                        {activeTab === "hero" && (
                            <button
                                onClick={openCreateHero}
                                className="flex items-center gap-1.5 px-4 py-2 bg-purple-50 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400 border border-purple-200 dark:border-purple-900/60 rounded-xl text-xs font-bold hover:bg-purple-100/70 transition shadow-sm"
                            >
                                <Plus className="w-4 h-4" /> Add Hero Slide
                            </button>
                        )}
                        {activeTab === "offers" && (
                            <button
                                onClick={openCreateOffer}
                                className="flex items-center gap-1.5 px-4 py-2 bg-purple-50 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400 border border-purple-200 dark:border-purple-900/60 rounded-xl text-xs font-bold hover:bg-purple-100/70 transition shadow-sm"
                            >
                                <Plus className="w-4 h-4" /> Add Announcement Offer
                            </button>
                        )}
                        {activeTab === "highlights" && (
                            <button
                                onClick={openCreateHighlight}
                                className="flex items-center gap-1.5 px-4 py-2 bg-purple-50 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400 border border-purple-200 dark:border-purple-900/60 rounded-xl text-xs font-bold hover:bg-purple-100/70 transition shadow-sm"
                            >
                                <Plus className="w-4 h-4" /> Add Highlight Card
                            </button>
                        )}
                    </div>

                    {/* HERO SLIDES */}
                    {activeTab === "hero" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {heroBanners.length === 0 ? (
                                <div className="col-span-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-16 text-center">
                                    <Eye className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                    <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400">No slides created</h4>
                                    <p className="text-xs text-gray-400 mt-1">Add a new slider banner to customize homepage visuals.</p>
                                </div>
                            ) : (
                                heroBanners.map((banner, idx) => (
                                    <div key={idx} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col group relative">
                                        {/* Banner Image */}
                                        <div className="relative aspect-[16/8] bg-gray-50 dark:bg-gray-900 overflow-hidden border-b border-gray-100 dark:border-gray-750 flex items-center justify-center flex-shrink-0">
                                            {banner.image ? (
                                                <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <FolderOpen className="w-6 h-6 text-gray-450" />
                                            )}

                                            {/* Quick Active Badge */}
                                            <span className={`absolute left-3 top-3 text-[9px] font-bold px-2 py-0.5 rounded-full border shadow-sm ${
                                                banner.active ?? true
                                                    ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40"
                                                    : "bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-900"
                                            }`}>
                                                {banner.active ?? true ? "Active" : "Disabled"}
                                            </span>
                                        </div>

                                        {/* Banner text info */}
                                        <div className="p-4 flex-1 flex flex-col">
                                            <h4 className="font-bold text-gray-800 dark:text-white text-sm truncate capitalize mb-1">{banner.title || "Untitled Heading"}</h4>
                                            <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-4 flex-1">{banner.subtitle || "No subtext provided."}</p>
                                            
                                            <div className="text-[10px] text-purple-600 dark:text-purple-400 font-mono font-bold truncate mb-3">
                                                Link: {banner.link || "#"}
                                            </div>

                                            {/* Action triggers */}
                                            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-750/50 mt-auto">
                                                <div className="flex gap-1.5">
                                                    <button
                                                        onClick={() => moveItem("hero", idx, "up")}
                                                        disabled={idx === 0}
                                                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 disabled:opacity-30 rounded-lg transition"
                                                        title="Move Up"
                                                    >
                                                        <ArrowUp className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => moveItem("hero", idx, "down")}
                                                        disabled={idx === heroBanners.length - 1}
                                                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 disabled:opacity-30 rounded-lg transition"
                                                        title="Move Down"
                                                    >
                                                        <ArrowDown className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>

                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => openEditHero(idx)}
                                                        className="flex items-center gap-1 px-3 py-1.5 hover:bg-purple-50 dark:hover:bg-purple-950/20 text-purple-650 dark:text-purple-400 rounded-xl text-xs font-bold transition border border-transparent hover:border-purple-200 dark:hover:border-purple-900"
                                                    >
                                                        <Edit className="w-3.5 h-3.5" /> Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteHero(idx)}
                                                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 rounded-lg transition"
                                                        title="Delete slide"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* OFFERS / PROMOTIONS */}
                    {activeTab === "offers" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {offers.length === 0 ? (
                                <div className="col-span-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-16 text-center">
                                    <Tag className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                    <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400">No active promotions</h4>
                                    <p className="text-xs text-gray-400 mt-1">Create an announcement card to customize current marketing deals.</p>
                                </div>
                            ) : (
                                offers.map((offer, idx) => (
                                    <div key={idx} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col group relative">
                                        {/* Promo Cover Image */}
                                        <div className="relative aspect-[16/8] bg-gray-50 dark:bg-gray-900 overflow-hidden border-b border-gray-100 dark:border-gray-750 flex items-center justify-center flex-shrink-0">
                                            {offer.image ? (
                                                <img src={offer.image} alt={offer.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <FolderOpen className="w-6 h-6 text-gray-450" />
                                            )}

                                            {/* Discount coupon badge */}
                                            {offer.discountCode && (
                                                <span className="absolute right-3 top-3 bg-emerald-600 text-white text-[9px] font-bold px-2.5 py-0.5 rounded shadow uppercase">
                                                    {offer.discountCode}
                                                </span>
                                            )}

                                            <span className={`absolute left-3 top-3 text-[9px] font-bold px-2 py-0.5 rounded-full border shadow-sm ${
                                                offer.active ?? true
                                                    ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40"
                                                    : "bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-900"
                                            }`}>
                                                {offer.active ?? true ? "Active" : "Disabled"}
                                            </span>
                                        </div>

                                        {/* Text detail */}
                                        <div className="p-4 flex-1 flex flex-col">
                                            <h4 className="font-bold text-gray-800 dark:text-white text-sm truncate capitalize mb-1">{offer.title || "Untitled Promo"}</h4>
                                            <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-4 flex-1">{offer.subtitle || "No promo subtext provided."}</p>
                                            
                                            <div className="text-[10px] text-purple-600 dark:text-purple-400 font-mono font-bold truncate mb-3">
                                                Link: {offer.link || "#"}
                                            </div>

                                            {/* Actions footer */}
                                            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-750/50 mt-auto">
                                                <div className="flex gap-1.5">
                                                    <button
                                                        onClick={() => moveItem("offer", idx, "up")}
                                                        disabled={idx === 0}
                                                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-550 disabled:opacity-30 rounded-lg transition"
                                                        title="Move Up"
                                                    >
                                                        <ArrowUp className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => moveItem("offer", idx, "down")}
                                                        disabled={idx === offers.length - 1}
                                                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-550 disabled:opacity-30 rounded-lg transition"
                                                        title="Move Down"
                                                    >
                                                        <ArrowDown className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>

                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => openEditOffer(idx)}
                                                        className="flex items-center gap-1 px-3 py-1.5 hover:bg-purple-50 dark:hover:bg-purple-950/20 text-purple-655 dark:text-purple-400 rounded-xl text-xs font-bold transition border border-transparent hover:border-purple-200 dark:hover:border-purple-900"
                                                    >
                                                        <Edit className="w-3.5 h-3.5" /> Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteOffer(idx)}
                                                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 rounded-lg transition"
                                                        title="Delete Offer"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* HIGHLIGHT FEATURES */}
                    {activeTab === "highlights" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {highlights.length === 0 ? (
                                <div className="col-span-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-16 text-center">
                                    <Sparkles className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                    <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400">No highlights added</h4>
                                    <p className="text-xs text-gray-400 mt-1">Create fulfillment highlight cards to announce special values.</p>
                                </div>
                            ) : (
                                highlights.map((hl, idx) => (
                                    <div key={idx} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-150 dark:border-gray-700 p-5 shadow-sm flex flex-col justify-between relative group">
                                        <div className="space-y-3">
                                            {/* Icon placeholder preview */}
                                            <div className="w-10 h-10 bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center font-bold text-xs">
                                                {hl.icon?.slice(0, 2) || "Hi"}
                                            </div>
                                            <h4 className="font-bold text-gray-850 dark:text-white text-sm capitalize">{hl.title || "Untitled Highlight"}</h4>
                                            <p className="text-xs text-gray-400 leading-relaxed">{hl.description || "No description provided."}</p>
                                        </div>

                                        {/* Actions footer */}
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-750/50 mt-5">
                                            <div className="flex gap-1.5">
                                                <button
                                                    onClick={() => moveItem("highlight", idx, "up")}
                                                    disabled={idx === 0}
                                                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-550 disabled:opacity-30 rounded-lg transition"
                                                    title="Move Up"
                                                >
                                                    <ArrowUp className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => moveItem("highlight", idx, "down")}
                                                    disabled={idx === highlights.length - 1}
                                                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-550 disabled:opacity-30 rounded-lg transition"
                                                    title="Move Down"
                                                >
                                                    <ArrowDown className="w-3.5 h-3.5" />
                                                </button>
                                            </div>

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openEditHighlight(idx)}
                                                    className="flex items-center gap-1 px-3 py-1.5 hover:bg-purple-50 dark:hover:bg-purple-950/20 text-purple-655 dark:text-purple-400 rounded-xl text-xs font-bold transition border border-transparent hover:border-purple-200 dark:hover:border-purple-900"
                                                >
                                                    <Edit className="w-3.5 h-3.5" /> Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteHighlight(idx)}
                                                    className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 rounded-lg transition"
                                                    title="Delete Highlight"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* CREATE OVERLAY MODAL */}
            {creatingItem && (
                <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 max-w-md w-full shadow-2xl overflow-hidden animate-fade-in flex flex-col">
                        <div className="p-5 border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-900/10 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-gray-800 dark:text-white capitalize">
                                Create New {creatingItem.type}
                            </h3>
                            <button
                                onClick={() => setCreatingItem(null)}
                                className="p-1.5 hover:bg-gray-150 dark:hover:bg-gray-700 rounded-xl text-gray-400"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-5 space-y-4 overflow-y-auto max-h-[70vh] text-xs">
                            {/* --- Create Hero Slide fields --- */}
                            {creatingItem.type === "hero" && (
                                <>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Banner Image</label>
                                        {creatingItem.data.image ? (
                                            <div className="relative aspect-[16/7] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 mb-1">
                                                <img src={creatingItem.data.image} className="w-full h-full object-cover" />
                                                <button
                                                    onClick={() => setCreatingItem(prev => ({ ...prev, data: { ...prev.data, image: "" } }))}
                                                    className="absolute right-2 top-2 p-1 bg-black/60 hover:bg-black/80 text-white rounded-lg transition"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="relative border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-600 rounded-xl p-6 text-center cursor-pointer transition">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleImageUpload(e, (dataUpdater) => {
                                                        setCreatingItem(prev => {
                                                            const updatedData = dataUpdater(prev.data);
                                                            return { ...prev, data: updatedData };
                                                        });
                                                    })}
                                                    disabled={uploadingImage}
                                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                                />
                                                {uploadingImage ? (
                                                    <Loader2 className="w-6 h-6 text-purple-600 animate-spin mx-auto" />
                                                ) : (
                                                    <>
                                                        <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                                                        <span className="text-[10px] font-semibold text-gray-500 block">Click to upload photo banner</span>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-550 uppercase mb-1">Heading Title</label>
                                        <input
                                            type="text"
                                            value={creatingItem.data.title}
                                            onChange={(e) => setCreatingItem(prev => ({ ...prev, data: { ...prev.data, title: e.target.value } }))}
                                            placeholder="Slide header text"
                                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-750 rounded-xl bg-gray-50/50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-550 uppercase mb-1">Subtitle Message</label>
                                        <textarea
                                            value={creatingItem.data.subtitle}
                                            onChange={(e) => setCreatingItem(prev => ({ ...prev, data: { ...prev.data, subtitle: e.target.value } }))}
                                            placeholder="Slide description subtext"
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-750 rounded-xl bg-gray-50/50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-555 uppercase mb-1">Redirect Route Link</label>
                                        <input
                                            type="text"
                                            value={creatingItem.data.link}
                                            onChange={(e) => setCreatingItem(prev => ({ ...prev, data: { ...prev.data, link: e.target.value } }))}
                                            placeholder="e.g. /products"
                                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-750 rounded-xl bg-gray-50/50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                                        />
                                    </div>
                                </>
                            )}

                            {/* --- Create Offer fields --- */}
                            {creatingItem.type === "offer" && (
                                <>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Promo Banner Image</label>
                                        {creatingItem.data.image ? (
                                            <div className="relative aspect-[16/7] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 mb-1">
                                                <img src={creatingItem.data.image} className="w-full h-full object-cover" />
                                                <button
                                                    onClick={() => setCreatingItem(prev => ({ ...prev, data: { ...prev.data, image: "" } }))}
                                                    className="absolute right-2 top-2 p-1 bg-black/60 hover:bg-black/80 text-white rounded-lg transition"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="relative border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-600 rounded-xl p-6 text-center cursor-pointer transition">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleImageUpload(e, (dataUpdater) => {
                                                        setCreatingItem(prev => {
                                                            const updatedData = dataUpdater(prev.data);
                                                            return { ...prev, data: updatedData };
                                                        });
                                                    })}
                                                    disabled={uploadingImage}
                                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                                />
                                                {uploadingImage ? (
                                                    <Loader2 className="w-6 h-6 text-purple-600 animate-spin mx-auto" />
                                                ) : (
                                                    <>
                                                        <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                                                        <span className="text-[10px] font-semibold text-gray-500 block">Click to upload photo banner</span>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-550 uppercase mb-1">Promo Title</label>
                                        <input
                                            type="text"
                                            value={creatingItem.data.title}
                                            onChange={(e) => setCreatingItem(prev => ({ ...prev, data: { ...prev.data, title: e.target.value } }))}
                                            placeholder="Promo card heading"
                                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-750 rounded-xl bg-gray-50/50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-550 uppercase mb-1">Promo Message / Subtitle</label>
                                        <textarea
                                            value={creatingItem.data.subtitle}
                                            onChange={(e) => setCreatingItem(prev => ({ ...prev, data: { ...prev.data, subtitle: e.target.value } }))}
                                            placeholder="Promo subtext description"
                                            rows={2}
                                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-750 rounded-xl bg-gray-50/50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-550 uppercase mb-1">Coupon Code</label>
                                            <input
                                                type="text"
                                                value={creatingItem.data.discountCode}
                                                onChange={(e) => setCreatingItem(prev => ({ ...prev, data: { ...prev.data, discountCode: e.target.value } }))}
                                                placeholder="e.g. GET30"
                                                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-750 rounded-xl bg-gray-50/50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-555 uppercase mb-1">Redirection Link</label>
                                            <input
                                                type="text"
                                                value={creatingItem.data.link}
                                                onChange={(e) => setCreatingItem(prev => ({ ...prev, data: { ...prev.data, link: e.target.value } }))}
                                                placeholder="e.g. /offers"
                                                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-750 rounded-xl bg-gray-50/50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* --- Create Highlight fields --- */}
                            {creatingItem.type === "highlight" && (
                                <>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-450 uppercase mb-1">Highlight Icon Class</label>
                                        <select
                                            value={creatingItem.data.icon || "Truck"}
                                            onChange={(e) => setCreatingItem(prev => ({ ...prev, data: { ...prev.data, icon: e.target.value } }))}
                                            className="w-full px-3 py-2 border border-gray-205 dark:border-gray-750 rounded-xl bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                                        >
                                            {STORE_ICONS.map(ic => (
                                                <option key={ic} value={ic}>{ic}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-550 uppercase mb-1">Header Title</label>
                                        <input
                                            type="text"
                                            value={creatingItem.data.title}
                                            onChange={(e) => setCreatingItem(prev => ({ ...prev, data: { ...prev.data, title: e.target.value } }))}
                                            placeholder="Highlight headline"
                                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-750 rounded-xl bg-gray-50/50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-550 uppercase mb-1">Description</label>
                                        <textarea
                                            value={creatingItem.data.description}
                                            onChange={(e) => setCreatingItem(prev => ({ ...prev, data: { ...prev.data, description: e.target.value } }))}
                                            placeholder="Highlight detail description message"
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-750 rounded-xl bg-gray-50/50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="p-5 border-t border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-900/10 flex justify-end gap-3">
                            <button
                                onClick={() => setCreatingItem(null)}
                                className="px-4 py-2 bg-gray-150 dark:bg-gray-700 hover:bg-gray-200 text-gray-700 dark:text-white font-semibold rounded-xl transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={
                                    creatingItem.type === "hero"
                                        ? handleSaveNewHero
                                        : creatingItem.type === "offer"
                                        ? handleSaveNewOffer
                                        : handleSaveNewHighlight
                                }
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-sm transition"
                            >
                                Add Element
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT OVERLAY MODAL */}
            {editingItem && (
                <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 max-w-md w-full shadow-2xl overflow-hidden animate-fade-in flex flex-col">
                        <div className="p-5 border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-900/10 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-gray-800 dark:text-white capitalize">
                                Edit {editingItem.type} (Index: {editingItem.index + 1})
                            </h3>
                            <button
                                onClick={() => setEditingItem(null)}
                                className="p-1.5 hover:bg-gray-150 dark:hover:bg-gray-700 rounded-xl text-gray-400"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-5 space-y-4 overflow-y-auto max-h-[70vh] text-xs">
                            {/* --- Edit Hero Slide fields --- */}
                            {editingItem.type === "hero" && (
                                <>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Banner Image</label>
                                        {editingItem.data.image ? (
                                            <div className="relative aspect-[16/7] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 mb-1">
                                                <img src={editingItem.data.image} className="w-full h-full object-cover" />
                                                <button
                                                    onClick={() => setEditingItem(prev => ({ ...prev, data: { ...prev.data, image: "" } }))}
                                                    className="absolute right-2 top-2 p-1 bg-black/60 hover:bg-black/80 text-white rounded-lg transition"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="relative border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-600 rounded-xl p-6 text-center cursor-pointer transition">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleImageUpload(e, (dataUpdater) => {
                                                        setEditingItem(prev => {
                                                            const updatedData = dataUpdater(prev.data);
                                                            return { ...prev, data: updatedData };
                                                        });
                                                    })}
                                                    disabled={uploadingImage}
                                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                                />
                                                {uploadingImage ? (
                                                    <Loader2 className="w-6 h-6 text-purple-600 animate-spin mx-auto" />
                                                ) : (
                                                    <>
                                                        <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                                                        <span className="text-[10px] font-semibold text-gray-500 block">Click to upload photo banner</span>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-550 uppercase mb-1">Heading Title</label>
                                        <input
                                            type="text"
                                            value={editingItem.data.title}
                                            onChange={(e) => setEditingItem(prev => ({ ...prev, data: { ...prev.data, title: e.target.value } }))}
                                            placeholder="Slide header text"
                                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-750 rounded-xl bg-gray-50/50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-555 uppercase mb-1">Subtitle Message</label>
                                        <textarea
                                            value={editingItem.data.subtitle}
                                            onChange={(e) => setEditingItem(prev => ({ ...prev, data: { ...prev.data, subtitle: e.target.value } }))}
                                            placeholder="Slide description subtext"
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-750 rounded-xl bg-gray-50/50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-550 uppercase mb-1">Redirect Route Link</label>
                                        <input
                                            type="text"
                                            value={editingItem.data.link}
                                            onChange={(e) => setEditingItem(prev => ({ ...prev, data: { ...prev.data, link: e.target.value } }))}
                                            placeholder="e.g. /products"
                                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-750 rounded-xl bg-gray-50/50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                                        />
                                    </div>

                                    <label className="flex items-center gap-2 cursor-pointer pt-2">
                                        <input
                                            type="checkbox"
                                            checked={editingItem.data.active ?? true}
                                            onChange={(e) => setEditingItem(prev => ({ ...prev, data: { ...prev.data, active: e.target.checked } }))}
                                            className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
                                        />
                                        <span className="font-semibold text-gray-750 dark:text-white text-xs">Slide Active Visibility</span>
                                    </label>
                                </>
                            )}

                            {/* --- Edit Offer fields --- */}
                            {editingItem.type === "offer" && (
                                <>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-550 uppercase mb-1">Promo Image Banner</label>
                                        {editingItem.data.image ? (
                                            <div className="relative aspect-[16/7] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 mb-1">
                                                <img src={editingItem.data.image} className="w-full h-full object-cover" />
                                                <button
                                                    onClick={() => setEditingItem(prev => ({ ...prev, data: { ...prev.data, image: "" } }))}
                                                    className="absolute right-2 top-2 p-1 bg-black/60 hover:bg-black/80 text-white rounded-lg transition"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="relative border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-600 rounded-xl p-6 text-center cursor-pointer transition">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleImageUpload(e, (dataUpdater) => {
                                                        setEditingItem(prev => {
                                                            const updatedData = dataUpdater(prev.data);
                                                            return { ...prev, data: updatedData };
                                                        });
                                                    })}
                                                    disabled={uploadingImage}
                                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                                />
                                                {uploadingImage ? (
                                                    <Loader2 className="w-6 h-6 text-purple-600 animate-spin mx-auto" />
                                                ) : (
                                                    <>
                                                        <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                                                        <span className="text-[10px] font-semibold text-gray-500 block">Click to upload photo banner</span>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-550 uppercase mb-1">Promo Title</label>
                                        <input
                                            type="text"
                                            value={editingItem.data.title}
                                            onChange={(e) => setEditingItem(prev => ({ ...prev, data: { ...prev.data, title: e.target.value } }))}
                                            placeholder="Promo card heading"
                                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-750 rounded-xl bg-gray-50/50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-550 uppercase mb-1">Promo Message / Subtitle</label>
                                        <textarea
                                            value={editingItem.data.subtitle}
                                            onChange={(e) => setEditingItem(prev => ({ ...prev, data: { ...prev.data, subtitle: e.target.value } }))}
                                            placeholder="Promo subtext description"
                                            rows={2}
                                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-750 rounded-xl bg-gray-50/50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-550 uppercase mb-1">Coupon Code</label>
                                            <input
                                                type="text"
                                                value={editingItem.data.discountCode}
                                                onChange={(e) => setEditingItem(prev => ({ ...prev, data: { ...prev.data, discountCode: e.target.value } }))}
                                                placeholder="e.g. GET30"
                                                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-750 rounded-xl bg-gray-50/50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-555 uppercase mb-1">Redirection Link</label>
                                            <input
                                                type="text"
                                                value={editingItem.data.link}
                                                onChange={(e) => setEditingItem(prev => ({ ...prev, data: { ...prev.data, link: e.target.value } }))}
                                                placeholder="e.g. /offers"
                                                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-750 rounded-xl bg-gray-50/50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                                            />
                                        </div>
                                    </div>

                                    <label className="flex items-center gap-2 cursor-pointer pt-2">
                                        <input
                                            type="checkbox"
                                            checked={editingItem.data.active ?? true}
                                            onChange={(e) => setEditingItem(prev => ({ ...prev, data: { ...prev.data, active: e.target.checked } }))}
                                            className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
                                        />
                                        <span className="font-semibold text-gray-750 dark:text-white text-xs">Promo Visibility Active</span>
                                    </label>
                                </>
                            )}

                            {/* --- Edit Highlight fields --- */}
                            {editingItem.type === "highlight" && (
                                <>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-450 uppercase mb-1">Highlight Icon Class</label>
                                        <select
                                            value={editingItem.data.icon || "Truck"}
                                            onChange={(e) => setEditingItem(prev => ({ ...prev, data: { ...prev.data, icon: e.target.value } }))}
                                            className="w-full px-3 py-2 border border-gray-205 dark:border-gray-750 rounded-xl bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                                        >
                                            {STORE_ICONS.map(ic => (
                                                <option key={ic} value={ic}>{ic}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-550 uppercase mb-1">Header Title</label>
                                        <input
                                            type="text"
                                            value={editingItem.data.title}
                                            onChange={(e) => setEditingItem(prev => ({ ...prev, data: { ...prev.data, title: e.target.value } }))}
                                            placeholder="Highlight headline"
                                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-750 rounded-xl bg-gray-50/50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-550 uppercase mb-1">Description</label>
                                        <textarea
                                            value={editingItem.data.description}
                                            onChange={(e) => setEditingItem(prev => ({ ...prev, data: { ...prev.data, description: e.target.value } }))}
                                            placeholder="Highlight detail description message"
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-750 rounded-xl bg-gray-50/50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="p-5 border-t border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-900/10 flex justify-end gap-3">
                            <button
                                onClick={() => setEditingItem(null)}
                                className="px-4 py-2 bg-gray-150 dark:bg-gray-700 hover:bg-gray-200 text-gray-700 dark:text-white font-semibold rounded-xl transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={
                                    editingItem.type === "hero"
                                        ? handleUpdateHero
                                        : editingItem.type === "offer"
                                        ? handleUpdateOffer
                                        : handleUpdateHighlight
                                }
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-sm transition"
                            >
                                Apply Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
