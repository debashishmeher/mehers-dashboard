import { useEffect, useState } from "react";
import axios from "axios";
import MenuCard from "./MenuCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

function Card() {
  const [search, setSearch] = useState("");
  const [cardItems, setCardItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const itemsPerPage = 10;

  useEffect(() => {
    const fetchCards = async () => {
      setLoading(true);
      try {
        const params = {
          page: currentPage,
          limit: itemsPerPage,
        };

        if (search.trim()) {
          params.name = search.trim();
        }

        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/cards`, {
          params,
          withCredentials: true,
        });

        const data = response.data;

        if (data.status === "success") {
          const cards = data.data?.cards || [];
          setCardItems(cards);
          setTotalPages(Math.ceil(data.results / itemsPerPage) || 1);
        } else {
          setCardItems([]);
          setTotalPages(1);
          console.error("API responded with status:", data.status);
        }
      } catch (error) {
        console.error("Error fetching cards:", error);
        setCardItems([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(fetchCards, 300);
    return () => clearTimeout(timeout);
  }, [search, currentPage]);

  // Pagination range with ellipsis
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
    if (totalPages >= 1) range.push(1);

    if (left > 2) {
      range.push("left-ellipsis");
    }

    for (let i = left; i <= right; i++) {
      if (i > 0 && i < totalPages) {
        range.push(i);
      }
    }

    if (right < totalPages - 1) {
      range.push("right-ellipsis");
    }

    if (totalPages > 1) {
      range.push(totalPages);
    }

    return range;
  };

  const paginationRange = getPaginationRange();

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Card Gallery</h1>

      <div className="bg-gray-50 rounded-xl p-4 shadow-md flex flex-wrap gap-4 items-center justify-between mb-6">
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={handleSearchChange}
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
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading cards...</p>
      ) : cardItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {cardItems.map((item) => (
            <MenuCard
              key={item._id}
              id={item._id}
              title={item.name}
              logo={item.logo || "/images/d.png"}
              img={item.photo || "/images/d.png"}
              slug={item.slug}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No items found.</p>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-2 items-center">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-md border bg-white shadow disabled:opacity-50"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {paginationRange.map((page, idx) => {
            if (page === "left-ellipsis" || page === "right-ellipsis") {
              return (
                <span key={page + idx} className="px-3 py-1 text-gray-500 select-none">
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
                    ? "bg-blue-600 text-white cursor-default"
                    : "bg-white hover:bg-blue-50 text-gray-700"
                }`}
                disabled={page === currentPage}
                aria-current={page === currentPage ? "page" : undefined}
              >
                {page}
              </button>
            );
          })}

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-md border bg-white shadow disabled:opacity-50"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default Card;
