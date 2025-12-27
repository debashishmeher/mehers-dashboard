import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function AllCoupon() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [coupons, setCoupons] = useState([]);
    const [selectedReview, setSelectedReview] = useState(null);
    const [showReviewCard, setShowReviewCard] = useState(false);


  const itemsPerPage = 10;

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const params = {
          page: currentPage,
          limit: itemsPerPage,
        };

        if (search.trim()) params.code = search.trim();
        if (statusFilter) params.status = statusFilter;

        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/coupons`, {
          params,
          withCredentials: true,
        });

        setCoupons(res.data.data.coupons || []);
        setTotalPages(Math.ceil(res.data.results / itemsPerPage));
      } catch (error) {
        console.error('Error fetching coupons:', error);
      }
    };

    const timeout = setTimeout(fetchCoupons, 300);
    return () => clearTimeout(timeout);
  }, [search, statusFilter, currentPage]);

  const handleRedeemClick = (coupon) => {
    setSelectedCoupon(coupon);
    setDialogOpen(true);
  };

  const handleConfirmRedeem = async () => {
    if (!selectedCoupon) return;
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/coupon/${selectedCoupon._id}/redeem`,
        {},
        { withCredentials: true }
      );
      // Optionally, refresh coupons list
      setSearch(""); // This will trigger useEffect to refetch
    } catch (error) {
      console.error("Error redeeming coupon:", error);
      // Optionally, show error to user
    }
    setDialogOpen(false);
    setSelectedCoupon(null);
  };

  const handleCancel = () => {
    setDialogOpen(false);
    setSelectedCoupon(null);
  };

  // Generate pagination range with ellipsis
  const getPaginationRange = () => {
    const delta = 1;
    let left = currentPage - delta;
    let right = currentPage + delta;

    if (left < 2) {
      right += 2 - left;
      left = 2;
    }
    if (right > totalPages - 1) {
      left -= right - (totalPages - 1);
      right = totalPages - 1;
    }
    left = Math.max(left, 2);

    const range = [];
    range.push(1);

    if (left > 2) {
      range.push('left-ellipsis');
    }

    for (let i = left; i <= right; i++) {
      range.push(i);
    }

    if (right < totalPages - 1) {
      range.push('right-ellipsis');
    }

    if (totalPages > 1) {
      range.push(totalPages);
    }

    return range;
  };

  const paginationRange = getPaginationRange();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Coupon Management</h1>

<div className="bg-gray-50 rounded-xl p-4 shadow-md flex flex-wrap gap-4 items-center justify-between mb-6">
  <div className="relative w-full sm:w-64">
    <input
      type="text"
      placeholder="Search by code..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
    />
    <svg
      className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
      />
    </svg>
  </div>

  <div className="relative w-full sm:w-52">
    <select
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value)}
      className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all appearance-none"
    >
      <option value="">All Statuses</option>
      <option value="active">Active</option>
      <option value="redeemed">Redeemed</option>
    </select>
    <svg
      className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 12h14M12 5l7 7-7 7"
      />
    </svg>
  </div>
</div>


      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full text-sm text-left bg-white">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
            <tr>
              <th className="px-6 py-3">Sl. No</th>
              <th className="px-6 py-3">Code</th>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Expiration Date</th>
              <th className="px-6 py-3">Manage</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon, index) => (
              <tr key={coupon._id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                <td className="px-6 py-4 font-medium text-gray-900">{coupon.code}</td>
                <td className="px-6 py-4 font-medium text-gray-900 capitalize">{coupon.review?.name || "N/A"}</td>
                <td className="px-6 py-4 capitalize">{coupon.status}</td>
                <td className="px-6 py-4 text-gray-700">{coupon.expirationDate
                  ? new Date(coupon.expirationDate).toLocaleDateString()
                  : ''}</td>
                <td className="px-6 py-4 text-gray-700">
                  {showReviewCard && selectedReview && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-[9999]">
                      <div className="bg-white rounded-lg shadow-lg p-6 w-[90%] max-w-md">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Review Details</h2>
                        <div className="space-y-2 text-gray-700">
                          <p><span className="font-medium">Name:</span> {selectedReview.name}</p>
                          <p><span className="font-medium">Review:</span> {selectedReview.review || "N/A"}</p>
                          <p><span className="font-medium">Rating:</span> {selectedReview.rating}</p>
                        </div>
                        <div className="mt-6 text-right">
                          <button
                            onClick={() => {
                              setShowReviewCard(false);
                              setSelectedReview(null);
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    className="text-blue-600 hover:underline font-medium"
                    onClick={() => {
                      setSelectedReview(coupon.review || { name: "N/A", review: "No review available", rating: "N/A" });
                      setShowReviewCard(true);
                    }}
                  >
                    See Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>



      {/* Pagination */}
      <div className="flex justify-center mt-6 space-x-2 items-center">
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          className="p-2 rounded-md border bg-white shadow disabled:opacity-50"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {paginationRange.map((page, idx) => {
          if (page === 'left-ellipsis' || page === 'right-ellipsis') {
            return (
              <span
                key={page + idx}
                className="px-3 py-1 text-gray-500 select-none"
              >
                ...
              </span>
            );
          }

          return (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 rounded-md border text-sm shadow ${
                page === currentPage
                  ? 'bg-blue-600 text-white'
                  : 'bg-white hover:bg-blue-50 text-gray-700'
              }`}
            >
              {page}
            </button>
          );
        })}

        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="p-2 rounded-md border bg-white shadow disabled:opacity-50"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default AllCoupon;
