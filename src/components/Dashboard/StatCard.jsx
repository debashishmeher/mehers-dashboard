// components/StatCard.jsx
import React from "react";

function StatCard({ icon, value, label, bgColor, borderColor }) {
  return (
    <div className={`flex items-center gap-4 p-4 rounded-2xl shadow-sm border ${borderColor} bg-white`}>
      <div className={`p-2 rounded-xl ${bgColor}`}>
        {icon}
      </div>
      <div>
        <div className="text-xl font-semibold text-gray-800">{value}</div>
        <div className="text-sm text-gray-500">{label}</div>
      </div>
    </div>
  );
}

export default StatCard;
