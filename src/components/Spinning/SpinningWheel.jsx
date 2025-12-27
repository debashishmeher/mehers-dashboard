import React, { useState } from "react";
import { motion } from "framer-motion";

// Utility: Generate random gradient colors for slices
const getColor = (index) => {
  const colors = [
    ["#FF6B6B", "#FF8E53"],
    ["#4ECDC4", "#45B7AF"],
    ["#FFD93D", "#FFB347"],
    ["#6BCB77", "#3FA34D"],
    ["#1A73E8", "#4D9DE0"],
    ["#9B5DE5", "#7A4EAB"],
    ["#F15BB5", "#E94F86"],
    ["#FF922B", "#FF6F3C"]
  ];
  return colors[index % colors.length];
};

// Spinning Wheel Component
const SpinningWheel = ({ spins = [] }) => {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);

  const handleSpin = () => {
    if (!spins.length || spinning) return;

    setSpinning(true);
    setResult(null);

    const sliceAngle = 360 / spins.length;
    const randomIndex = Math.floor(Math.random() * spins.length);

    // Spin at least 5 full rotations + random slice
    const newRotation = rotation + 1800 + randomIndex * sliceAngle;

    setRotation(newRotation);

    setTimeout(() => {
      setSpinning(false);
      setResult(spins[randomIndex]);
    }, 4500);
  };

  const sliceAngle = 360 / (spins.length || 1);

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Wheel Container */}
      <div className="relative w-96 h-96 flex items-center justify-center">
        {/* Pointer */}
        <div className="absolute top-0 w-0 h-0 border-l-12 border-r-12 border-b-20 border-transparent border-b-red-600 z-20" />

        {/* Wheel */}
        <motion.div
          animate={{ rotate: rotation }}
          transition={{ duration: 4.5, ease: "easeOut" }}
          className="w-full h-full rounded-full shadow-2xl relative overflow-hidden border-8 border-gray-200"
        >
          {spins.map((spin, index) => {
            const [start, end] = getColor(index);
            return (
              <div
                key={spin._id || index}
                className="absolute w-1/2 h-1/2 origin-bottom-right flex items-center justify-end pr-6"
                style={{
                  background: `linear-gradient(135deg, ${start}, ${end})`,
                  transform: `rotate(${index * sliceAngle}deg) skewY(${90 - sliceAngle}deg)`,
                  transformOrigin: "100% 100%"
                }}
              >
                <span
                  className="text-sm font-extrabold text-white drop-shadow-md rotate-[-90deg] text-center"
                  style={{
                    transform: `skewY(-${90 - sliceAngle}deg)`,
                    maxWidth: "80px",
                    wordBreak: "break-word"
                  }}
                >
                  {spin.discountType === "percentage" && `${spin.discountAmount}% OFF`}
                  {spin.discountType === "fixed" && `$${spin.discountAmount} OFF`}
                  {spin.discountType === "custom" && `FREE 🎁 ${spin.discountAmount}`}
                  {!spin.discountType && "N/A"}
                </span>
              </div>
            );
          })}
        </motion.div>

        {/* Spin Button (center) */}
        <button
          onClick={handleSpin}
          disabled={spinning || !spins.length}
          className={`absolute w-20 h-20 rounded-full font-bold shadow-xl text-white z-30 transition ${
            spinning || !spins.length
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-500 to-blue-700 hover:scale-105"
          }`}
        >
          {spinning ? "..." : "SPIN"}
        </button>
      </div>

      {/* Result */}
      {result && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="mt-4 px-6 py-3 bg-green-100 text-green-800 rounded-xl font-semibold shadow-md"
        >
          🎉 You got:{" "}
          {result.discountType === "percentage" && `${result.discountAmount}% OFF`}
          {result.discountType === "fixed" && `$${result.discountAmount} OFF`}
          {result.discountType === "custom" && `${result.discountAmount}% OFF`}
          {!result.discountType && result.discountAmount && result.discountAmount}
        </motion.div>
      )}
    </div>
  );
};

export default SpinningWheel;
