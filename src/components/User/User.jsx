import { useEffect, useState, useCallback, useMemo } from "react";
import UserCard from "./UserCard";
import "./User.css";
import { Link } from "react-router";
import axios from "axios";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

function User() {
  const [formStatus, setFormStatus] = useState({ type: "", message: "" });
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    page: 1,
    limit: 6
  });
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [layout, setLayout] = useState("card");
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    hasNextPage: false,
    hasPreviousPage: false
  });

  const maxVisiblePages = 5;

  // Build query parameters from filters
  const buildQueryParams = useCallback(() => {
    const params = {
      page: filters.page,
      limit: filters.limit,
    };

    if (filters.search.trim()) params.search = filters.search.trim();

    return params;
  }, [filters]);

  // Fetch users with query parameters
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = buildQueryParams();
      
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/users`,
        {
          params: queryParams,
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = response.data;
      if (result.status === "success") {
        setUsers(result.data.users || []);
        
          setPagination({
            totalItems: result.data.results || 0,
            itemsPerPage: result.data.itemsPerPage || filters.limit,
            currentPage: result.data.currentPage || filters.page,
            totalPages: result.data.totalPages || 1,
            hasNextPage: result.data.hasNextPage || false,
            hasPreviousPage: result.data.hasPreviousPage || false
          });
        }
      
    } catch (err) {
      console.error("Fetch failed:", err);
      setUsers([]);
      setPagination({
        totalItems: 0,
        totalPages: 1,
        currentPage: 1,
        hasNextPage: false,
        hasPreviousPage: false
      });
    } finally {
      setLoading(false);
    }
  }, [buildQueryParams, filters.limit, filters.page]);

  // Fetch users when filters change with debounce
  useEffect(() => {
    const timeout = setTimeout(fetchUsers, 2000);
    return () => clearTimeout(timeout);
  }, [fetchUsers]);

  const handleFilterChange = useCallback((name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value,
      ...(name !== 'page' && { page: 1 }) // Reset to first page when filters change
    }));
  }, []);

  const handleSearchChange = useCallback((e) => {
    handleFilterChange('search', e.target.value);
  }, []);



  const resetFilters = () => {
    setFilters({
      search: '',
      page: 1,
      limit: 6
    });
  };

  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setFilters(prev => ({ ...prev, page: newPage }));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [pagination.totalPages]);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setFormStatus({ type: "error", message: "Passwords do not match." });
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/admin/users`,
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = response.data;

      if (result.status === "success") {
        setFormStatus({ type: "success", message: "User created successfully!" });

        // Auto-close modal after short delay
        setTimeout(() => {
          setShowModal(false);
          setFormData({ name: "", email: "", password: "", confirmPassword: "" });
          setFormStatus({ type: "", message: "" });
          fetchUsers(); // Refresh user list
        }, 1500);
      } else {
        setFormStatus({
          type: "error",
          message: result.message || "Failed to create user.",
        });
      }
    } catch (error) {
      console.error("Create user failed:", error);
      setFormStatus({ 
        type: "error", 
        message: error.response?.data?.message || "An unexpected error occurred." 
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="py-10 px-4 relative max-w-7xl mx-auto">
      {/* Header with search + button */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by name or email"
              value={filters.search}
              onChange={handleSearchChange}
              className="p-2 pl-10 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex gap-2">
            {/* Sort options */}
            
            {/* Reset Button */}
            <button
              onClick={resetFilters}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium transition-all duration-150 flex items-center justify-center space-x-1.5"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Reset</span>
            </button>

            {/* Layout Toggle */}
            <button
              onClick={() => setLayout("card")}
              className={`p-2 rounded-lg border ${layout === "card" ? "bg-blue-100 text-blue-600 border-blue-300" : "bg-white text-gray-600 border-gray-300"}`}
              aria-label="Card view"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            
            <button
              onClick={() => setLayout("list")}
              className={`p-2 rounded-lg border ${layout === "list" ? "bg-blue-100 text-blue-600 border-blue-300" : "bg-white text-gray-600 border-gray-300"}`}
              aria-label="List view"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
            
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create User
            </button>
          </div>
        </div>
      </div>

      {/* User list */}
      {users.length ? (
        <>
          <div className={layout === "card" ? "user-grid" : "space-y-4"}>
            {users.map((user) => (
              layout === "card" ? (
                <UserCard
                  key={user._id}
                  name={user.name}
                  profile={user.photo || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200&q=80"}
                  email={user.email}
                  id={user._id}
                />
              ) : (
                <div key={user._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex items-center gap-4">
                  <img
                    src={user.photo || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200&q=80"}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate capitalize">{user.name}</h3>
                    <p className="text-gray-500 text-sm truncate">{user.email}</p>
                    <p className="text-xs text-gray-400">
                      Joined: {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Link 
                    to={`/user/${user._id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors whitespace-nowrap"
                  >
                    Manage
                  </Link>
                </div>
              )
            ))}
          </div>

          {/* Enhanced Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between mt-8 gap-4">
              {/* Items count */}
              <div className="text-sm text-gray-600 whitespace-nowrap">
                Showing {(filters.page - 1) * filters.limit + 1} to{' '}
                {Math.min(filters.page * filters.limit, pagination.totalItems)} of {pagination.totalItems} users
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
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No users found</h3>
          <p className="mt-2 text-gray-500">Try adjusting your search or create a new user.</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Create New User
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[9999] p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Create New User</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setFormStatus({ type: "", message: "" });
                  setFormData({ name: "", email: "", password: "", confirmPassword: "" });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {formStatus.message && (
                <div className={`p-3 rounded-lg ${formStatus.type === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                  {formStatus.message}
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormStatus({ type: "", message: "" });
                    setFormData({ name: "", email: "", password: "", confirmPassword: "" });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default User;