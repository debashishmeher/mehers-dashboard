import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import MessagePopup from '../Common/MessagePopup';
import MediaDetails from './MediaDetails';

function MediaRewards() {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    startDate: '',
    endDate: '',
    quickDateFilter: '',
    page: 1
  });
  const [mediaRewards, setMediaRewards] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [showDetailsCard, setShowDetailsCard] = useState({});
  const [selectedMedia, setSelectedMedia] = useState(null);

  const itemsPerPage = 10;
  const apiUrl = `${import.meta.env.VITE_API_URL}/api/social-media/media/allMedia`;

  // Memoized fetch function with debounce
  // Memoized fetch function with debounce
  const fetchMediaRewards = useCallback(async () => {
    try {
      const params = {
        page: filters.page,
        limit: itemsPerPage,
        ...(filters.status && { status: filters.status }),
        ...(filters.startDate && { 'createdAt[gte]': filters.startDate }), // Greater than filter
        ...(filters.endDate && { 'createdAt[lte]': filters.endDate }), // Less than filter
      };

      const response = await axios.get(apiUrl, {
        params,
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
      });

      setMediaRewards(response.data.data.mediaRewards || []);
      setTotalPages(Math.ceil(response.data.results / itemsPerPage));
    } catch (error) {
      console.error('Error fetching media rewards:', error);
      setMessage('❌ Failed to fetch media rewards');
      setMessageType('error');
    }
  }, [ filters.status, filters.page, filters.startDate, filters.endDate, itemsPerPage, apiUrl]);

  useEffect(() => {
    const debounceTimer = setTimeout(fetchMediaRewards, 300);
    return () => clearTimeout(debounceTimer);
  }, [fetchMediaRewards]);

  useEffect(() => {
    const debounceTimer = setTimeout(fetchMediaRewards, 300);
    return () => clearTimeout(debounceTimer);
  }, [fetchMediaRewards]);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value,
      // Reset page to 1 when filters change (except page changes)
      ...(name !== 'page' && { page: 1 })
    }));
  };

  const handleQuickDateFilterChange = (value) => {

    const today = new Date();
    let start = '';
    let end = today.toISOString().split('T')[0]; // format: yyyy-mm-dd

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

  const handleStatusUpdate = async (id, action) => {
    try {
      const endpoint = action === 'approve'
        ? `${import.meta.env.VITE_API_URL}/api/social-media/media/${id}/approve`
        : `${import.meta.env.VITE_API_URL}/api/social-media/media/${id}/reject`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Optimistic UI update
      setMediaRewards(prev => prev.map(reward =>
        reward._id === id
          ? { ...reward, status: action === 'approve' ? 'Approved' : 'Rejected' }
          : reward
      ));

      setMessage(`✅ Media reward ${action}d successfully!`);
      setMessageType('success');
    } catch (error) {
      console.error(`Error ${action}ing media reward:`, error);
      setMessage(`❌ Failed to ${action} media reward`);
      setMessageType('error');
      // Re-fetch to revert optimistic update if failed
      fetchMediaRewards();
    }
  };

  const getPaginationRange = () => {
    const delta = 1;
    let left = filters.page - delta;
    let right = filters.page + delta;

    if (left < 2) {
      right += 2 - left;
      left = 2;
    }

    if (right > totalPages - 1) {
      left -= right - (totalPages - 1);
      right = totalPages - 1;
    }

    left = Math.max(left, 2);

    const range = [1];
    if (left > 2) range.push('...');
    for (let i = left; i <= right; i++) range.push(i);
    if (right < totalPages - 1) range.push('...');
    if (totalPages > 1) range.push(totalPages);
    return range;
  };

  const tableHeaders = ["Sl. No", "User", "Media Type", "Conditions", "Screenshot", "Status", "Actions"];

  return (
    <div className="p-2">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          📱 Media Rewards
        </h1>

        <NavLink
          to="/social-media"
          className="inline-flex items-center px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-600 transition-all duration-200"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add New
        </NavLink>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs mb-6">
        <div className="space-y-4">


          {/* Filters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
            {/* Status Filter */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="block w-full pl-8 pr-8 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-150 text-sm text-gray-700 appearance-none"
              >
                <option value="">All Statuses</option>
                <option value="Pending" className="bg-yellow-50 text-yellow-700">Pending</option>
                <option value="Approved" className="bg-green-50 text-green-700">Approved</option>
                <option value="Rejected" className="bg-red-50 text-red-700">Rejected</option>
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

            {/* Quick Filter Dropdown */}
            <div className="relative">
              <label htmlFor="quickFilter" className="block text-xs font-medium text-gray-500 mb-1">Time Range</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <select
                  id="quickFilter"
                  value={filters.quickDateFilter}
                  onChange={(e) => handleQuickDateFilterChange(e.target.value)}
                  className="block w-full pl-8 pr-8 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-150 text-sm text-gray-700 appearance-none"
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
                onClick={() => setFilters({
                  search: '',
                  status: '',
                  startDate: '',
                  endDate: '',
                  quickDateFilter: '',
                  page: 1
                })}
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


      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="max-w-full overflow-x-auto">
          <table className="min-w-full w-max text-sm bg-white">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
              <tr>
                {tableHeaders.map((heading, i) => (
                  <th key={i} className="px-6 py-3 text-center">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mediaRewards.length > 0 ? (
                mediaRewards.map((reward, index) => {
                  const statusColor = reward.status === 'Approved'
                    ? 'text-green-600'
                    : reward.status === 'Rejected'
                      ? 'text-red-600'
                      : 'text-yellow-600';

                  return (
                    <tr key={reward._id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 text-center">{(filters.page - 1) * itemsPerPage + index + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <img
                              src={reward.account.photo || 'https://via.placeholder.com/50'}
                              alt={reward.account.name}
                              className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                            />
                          </div>
                          <div className="flex flex-col space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-900 capitalize">{reward.account.name}</span>
                              {reward.account.verified && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                  Verified
                                </span>
                              )}
                            </div>
                            <a
                              href={`mailto:${reward.account.email}`}
                              className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                            >
                              {reward.account.email}
                            </a>
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>{new Date(reward.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium capitalize text-center">{reward.mediaType}</td>
                      <td className="px-6 py-4 text-center">
                        <button
                          className="text-blue-600 hover:underline font-medium"
                          onClick={() => {
                            setShowDetailsCard(prev => ({ ...prev, [reward._id]: true }));
                            setSelectedMedia(reward);
                          }}
                        >
                          View Conditions
                        </button>
                        {showDetailsCard[reward._id] && (
                          <MediaDetails
                            conditions={reward.social.conditions}
                            onClose={() => setShowDetailsCard(prev => ({ ...prev, [reward._id]: false }))}
                          />
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <img
                          src={reward.screen_shot}
                          alt="Media screenshot"
                          className="w-16 h-16 object-cover mx-auto cursor-pointer hover:opacity-80"
                          onClick={() => window.open(reward.screen_shot, '_blank')}
                        />
                      </td>
                      <td className={`px-6 py-4 font-medium text-center ${statusColor}`}>
                        {reward.status}
                      </td>
                      <td className="px-6 py-4 text-center space-x-2">
                        <button
                          onClick={() => handleStatusUpdate(reward._id, 'approve')}
                          className={`px-3 py-1 rounded ${reward.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-gray-100 hover:bg-green-50'}`}
                          disabled={reward.status === 'Approved'}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(reward._id, 'reject')}
                          className={`px-3 py-1 rounded ${reward.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-gray-100 hover:bg-red-50'}`}
                          disabled={reward.status === 'Rejected'}
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={tableHeaders.length} className="px-6 py-4 text-center text-gray-500">
                    No media rewards found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          <button
            onClick={() => handleFilterChange('page', Math.max(filters.page - 1, 1))}
            disabled={filters.page === 1}
            className="p-2 rounded border bg-white shadow disabled:opacity-40 hover:bg-gray-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {getPaginationRange().map((page, idx) => (
            typeof page === 'string' ? (
              <span key={idx} className="px-2 py-1 text-gray-500">…</span>
            ) : (
              <button
                key={page}
                onClick={() => handleFilterChange('page', page)}
                className={`px-3 py-1 rounded-md border text-sm shadow ${filters.page === page ? 'bg-blue-600 text-white' : 'bg-white hover:bg-blue-50 text-gray-700'}`}
              >
                {page}
              </button>
            )
          ))}
          <button
            onClick={() => handleFilterChange('page', Math.min(filters.page + 1, totalPages))}
            disabled={filters.page === totalPages}
            className="p-2 rounded border bg-white shadow disabled:opacity-40 hover:bg-gray-50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Message Popup */}
      {message && (
        <MessagePopup
          message={message}
          type={messageType}
          onClose={() => setMessage('')}
        />
      )}
    </div>
  );
}

export default MediaRewards;