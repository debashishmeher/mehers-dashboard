import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useParams } from 'react-router';

function Reviews({ role }) {
  const { userId } = useParams();
  const [filters, setFilters] = useState({
    search: '',
    rating: '',
    startDate: '',
    endDate: '',
    quickDateFilter: '',
    page: 1,
    limit: 10
  });
  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    hasNextPage: false,
    hasPreviousPage: false
  });
  const [loading, setLoading] = useState(false);

  const maxVisiblePages = 5;

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: filters.page,
        limit: filters.limit,
      };

      // Add filters if they exist
      if (filters.search.trim()) params.search = filters.search.trim();
      if (filters.rating) params.rating = filters.rating;
      if (filters.startDate) params['createdAt[gte]'] = filters.startDate;
      if (filters.endDate) params['createdAt[lte]'] = filters.endDate;

      let apiUrl;

      if (role === 'admin') {
        apiUrl = `${import.meta.env.VITE_API_URL}/api/admin/reviews`;
        if (userId) {
          params.user = userId;
        }
      } else {
        apiUrl = `${import.meta.env.VITE_API_URL}/api/user/myreviews`;
      }

      const res = await axios.get(apiUrl, {
        params,
        withCredentials: true,
      });

      setReviews(res.data.data.reviews || []);

      // Optimized pagination update
      const apiPagination = res.data.data.pagination || res.data.pagination;
      if (apiPagination) {
        setPagination({
          totalItems: apiPagination.totalItems || 0,
          itemsPerPage: apiPagination.itemsPerPage || filters.limit,
          currentPage: apiPagination.currentPage || filters.page,
          totalPages: apiPagination.totalPages || 1,
          hasNextPage: apiPagination.hasNextPage || false,
          hasPreviousPage: apiPagination.hasPreviousPage || false
        });
      } else {
        // Fallback calculation if no pagination data from API
        const totalItems = res.data.results || 0;
        const totalPages = Math.ceil(totalItems / filters.limit) || 1;
        setPagination({
          totalItems,
          itemsPerPage: filters.limit,
          currentPage: filters.page,
          totalPages,
          hasNextPage: filters.page < totalPages,
          hasPreviousPage: filters.page > 1
        });
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, role, userId]);

  useEffect(() => {
    const timeout = setTimeout(fetchReviews, 300);
    return () => clearTimeout(timeout);
  }, [fetchReviews]);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value,
      ...(name !== 'page' && { page: 1 }) // Reset to first page when filters change
    }));
  };

  const handleQuickDateFilterChange = (value) => {
    const today = new Date();
    let start = '';
    let end = today.toISOString().split('T')[0];

    switch (value) {
      case 'today':
        start = end;
        break;
      case '7days':
        start = new Date(today.setDate(today.getDate() - 7)).toISOString().split('T')[0];
        break;
      case '15days':
        start = new Date(today.setDate(today.getDate() - 15)).toISOString().split('T')[0];
        break;
      case '1month':
        start = new Date(today.setMonth(today.getMonth() - 1)).toISOString().split('T')[0];
        break;
      default:
        start = '';
        end = '';
    }

    setFilters(prev => ({
      ...prev,
      quickDateFilter: value,
      startDate: start,
      endDate: end,
      page: 1
    }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      rating: '',
      startDate: '',
      endDate: '',
      quickDateFilter: '',
      page: 1,
      limit: 10
    });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setFilters(prev => ({ ...prev, page: newPage }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getPaginationRange = useMemo(() => {
    const { currentPage, totalPages } = pagination;

    // If total pages is less than max visible, show all
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const halfVisible = Math.floor(maxVisiblePages / 2);
    let startPage = currentPage - halfVisible;
    let endPage = currentPage + halfVisible;

    // Adjust if we're near the start
    if (currentPage <= halfVisible + 1) {
      startPage = 1;
      endPage = maxVisiblePages;
    }
    // Adjust if we're near the end
    else if (currentPage >= totalPages - halfVisible) {
      startPage = totalPages - maxVisiblePages + 1;
      endPage = totalPages;
    }

    const pages = [];

    // Always show first page
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) pages.push('...');
    }

    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      if (i > 0 && i <= totalPages) pages.push(i);
    }

    // Always show last page if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  }, [pagination.currentPage, pagination.totalPages]);

  return (
    <div className="p-6 max-w-7xl mx-auto bg-white rounded-lg shadow-md min-h-screen flex flex-col">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Customer Reviews</h1>

      {/* Enhanced Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs mb-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
            {/* Search Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by name, phone or email"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-150 text-sm text-gray-700"
              />
            </div>

            {/* Rating Filter */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <select
                value={filters.rating}
                onChange={(e) => handleFilterChange('rating', e.target.value)}
                className="block w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-150 text-sm text-gray-700 appearance-none"
              >
                <option value="">All Ratings</option>
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>{r} Stars</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-2 sm:col-span-2">
              <div className="relative">
                <label htmlFor="startDate" className="block text-xs font-medium text-gray-500 mb-1">From</label>
                <div className="relative">
                  <input
                    id="startDate"
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => {
                      handleFilterChange('quickDateFilter', '');
                      handleFilterChange('startDate', e.target.value);
                    }}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-150 text-sm text-gray-700"
                  />
                </div>
              </div>
              <div className="relative">
                <label htmlFor="endDate" className="block text-xs font-medium text-gray-500 mb-1">To</label>
                <div className="relative">
                  <input
                    id="endDate"
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => {
                      handleFilterChange('quickDateFilter', '');
                      handleFilterChange('endDate', e.target.value);
                    }}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-150 text-sm text-gray-700"
                  />
                </div>
              </div>
            </div>

            {/* Quick Date Filter */}
            <div className="relative">
              <label htmlFor="quickFilter" className="block text-xs font-medium text-gray-500 mb-1">Time Range</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <select
                  id="quickFilter"
                  value={filters.quickDateFilter}
                  onChange={(e) => handleQuickDateFilterChange(e.target.value)}
                  className="block w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-150 text-sm text-gray-700 appearance-none"
                >
                  <option value="">Custom Range</option>
                  <option value="today">Today</option>
                  <option value="7days">Last 7 Days</option>
                  <option value="15days">Last 15 Days</option>
                  <option value="1month">Last 30 Days</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Reset Button */}
            <div className="flex items-end">
              <button
                onClick={resetFilters}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium transition-all duration-150 flex items-center justify-center space-x-1.5"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Spinner */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-300 h-16 w-16"></div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl shadow-md ring-1 ring-black ring-opacity-5">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
                <tr>
                  {['Name', 'Phone', 'Email', 'Rating', 'Review', 'Date'].map((header) => (
                    <th
                      key={header}
                      className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {reviews.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No reviews found.
                    </td>
                  </tr>
                ) : (
                  reviews.map((review, idx) => (
                    <tr
                      key={review._id}
                      className={`transition-colors duration-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900 capitalize">{review.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">{review.phone}</td>
                      <td className="px-6 py-4 break-words text-gray-700">{review.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-yellow-500 font-bold">
                        {review.rating} ★
                      </td>
                      <td className="px-6 py-4 break-words text-gray-800 min-w-60">{review.review}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Optimized Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
              {/* Items count - always visible */}
              <div className="text-sm text-gray-600 whitespace-nowrap">
                Showing {(filters.page - 1) * filters.limit + 1} to{' '}
                {Math.min(filters.page * filters.limit, pagination.totalItems)} of {pagination.totalItems} reviews
              </div>

              {/* Pagination controls */}
              <div className="flex items-center gap-1 w-full sm:w-auto justify-center sm:justify-normal">
                {/* Mobile: Compact navigation */}
                <div className="sm:hidden flex items-center gap-1">
                  <button
                    onClick={() => handlePageChange(filters.page - 1)}
                    disabled={filters.page === 1}
                    className="p-2 rounded-md border bg-white shadow disabled:opacity-30 hover:bg-gray-50 transition-colors"
                    aria-label="Previous Page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="px-3 py-1 text-sm font-medium text-gray-700">
                    {filters.page} / {pagination.totalPages}
                  </div>

                  <button
                    onClick={() => handlePageChange(filters.page + 1)}
                    disabled={!pagination.hasNextPage}
                    className="p-2 rounded-md border bg-white shadow disabled:opacity-30 hover:bg-gray-50 transition-colors"
                    aria-label="Next Page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Desktop: Full navigation */}
                <div className="hidden sm:flex items-center gap-1">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={filters.page === 1}
                    className="p-2 rounded-md border bg-white shadow disabled:opacity-30 hover:bg-gray-50 transition-colors"
                    aria-label="First Page"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handlePageChange(filters.page - 1)}
                    disabled={filters.page === 1}
                    className="p-2 rounded-md border bg-white shadow disabled:opacity-30 hover:bg-gray-50 transition-colors"
                    aria-label="Previous Page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1">
                    {getPaginationRange.map((page, idx) =>
                      page === '...' ? (
                        <span key={`ellipsis-${idx}`} className="px-2 py-1 text-gray-500">
                          ...
                        </span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`w-10 h-10 flex items-center justify-center rounded-md border text-sm ${page === filters.page
                              ? 'bg-blue-600 text-white border-blue-600 font-medium'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                          aria-current={page === filters.page ? 'page' : undefined}
                        >
                          {page}
                        </button>
                      )
                    )}
                  </div>

                  <button
                    onClick={() => handlePageChange(filters.page + 1)}
                    disabled={!pagination.hasNextPage}
                    className="p-2 rounded-md border bg-white shadow disabled:opacity-30 hover:bg-gray-50 transition-colors"
                    aria-label="Next Page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handlePageChange(pagination.totalPages)}
                    disabled={filters.page === pagination.totalPages}
                    className="p-2 rounded-md border bg-white shadow disabled:opacity-30 hover:bg-gray-50 transition-colors"
                    aria-label="Last Page"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Reviews;