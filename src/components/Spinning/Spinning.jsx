import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import SpinList from "./SpinList";
import CouponPresetSelector from "./CouponPresetSelector";
import SpinningWheel from "./SpinningWheel";

const Spinning = () => {
  const [spinData, setSpinData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [fetchError, setFetchError] = useState(null);
  const [addError, setAddError] = useState(null);
  const [removeError, setRemoveError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const token = Cookies.get("authToken");

  // Fetch spin data
  const fetchSpinData = async () => {
    try {
      setLoading(true);
      setFetchError(null);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/spin/my-spins`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
          credentials: "include",
        }
      );

      const data = await response.json();
      if (data.status === "success") {
        setSpinData(data.data.spin || { spins: [] });
      } else {
        setFetchError(data.message || "Failed to fetch spin data");
      }
    } catch (err) {
      setFetchError("Network error: Could not fetch spin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchSpinData();
  }, [token]);

  // Add spin from modal preset
  const handleAddSpin = async (presetObj) => {
    setAddError(null);

    if (!presetObj || !presetObj._id) {
      setAddError("Invalid preset");
      return;
    }

    if (spinData.spins.length >= 5) {
      setAddError("Maximum limit of 5 spins reached");
      return;
    }

    if (spinData.spins.find((s) => s._id === presetObj._id)) {
      setAddError("This spin already exists");
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/spin/add-items`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
          credentials: "include",
          body: JSON.stringify({ itemId: presetObj._id }),
        }
      );

      const data = await response.json();
      if (data.status !== "success") {
        setAddError(data.message || "Failed to add spin");
        return;
      }

      // Refetch spin data after adding
      await fetchSpinData();
      setIsModalOpen(false);
    } catch (err) {
      setAddError("Something went wrong. Please try again.");
    }
  };

  // Remove spin
  const handleRemoveSpin = async (spinId) => {
    setRemoveError(null);

    if (spinData.spins.length <= 1) {
      setRemoveError("Minimum of 1 spin required");
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/spin/remove-items`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
          credentials: "include",
          body: JSON.stringify({ itemId: spinId }),
        }
      );

      const data = await response.json();
      if (data.status !== "success") {
        setRemoveError(data.message || "Failed to remove spin");
        return;
      }

      setSpinData((prev) => ({
        ...prev,
        spins: prev.spins.filter((s) => s._id !== spinId),
      }));
    } catch (err) {
      setRemoveError("Something went wrong. Please try again.");
    }
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setAddError(null);
  };
const createSpin = async () => {
  try {


    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/spin/create-spin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${token}`,
      },
      credentials: "include",
      body: JSON.stringify({
        // You can send default values here, adjust as needed
        presetName: "Default Spin",
        discountType: "percentage",
        discountAmount: 10,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to create spin");

    // Refetch spins after creating
    await fetchSpinData();
  } catch (err) {
    alert(err.message || "Failed to create spin");
  }
};



  // Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // No spins
  if (!spinData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Setup Spins</h2>
          <p className="text-gray-600 mb-6">
            No spin data found. Please set up your spins to get started.
          </p>
          <button
            onClick={createSpin}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
          >
            Setup Spins
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center lg:text-left">
          Spinning Management
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left panel: Spin list */}
          <div className="lg:w-1/2">
            <SpinList
              spins={spinData.spins}
              openModal={() => setIsModalOpen(true)}
              onRemoveSpin={handleRemoveSpin}
              error={removeError || fetchError}
            />
          </div>

          {/* Right panel: Fixed spinning wheel */}
          <div className="lg:w-1/2 flex justify-center lg:justify-end">
            <div className="sticky top-20">
              <SpinningWheel spins={spinData.spins} />
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <CouponPresetSelector
          existingPresets={spinData.spins.map((s) => s._id)}
          onAddSpin={handleAddSpin}
          onClose={handleClose}
          error={addError}
        />
      )}
    </div>
  );
};

export default Spinning;
