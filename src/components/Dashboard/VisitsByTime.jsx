import React from "react";

const visitTimeData = {
  morning: 0,
  lunch: 2,
  evening: 1,
  night: 0,
};

const formatLabel = (label) =>
  label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();

function VisitsByTime({data}) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm w-full">
  <h2 className="text-sm font-semibold text-gray-700">
    Visits by time of day
  </h2>
  <p className="text-xs text-gray-400 mb-4">in the selected period</p>

  <div className="text-sm text-gray-700 divide-y divide-gray-100">
    {Object.entries(data).map(([key, value]) => (
      <div key={key} className="flex justify-between py-2">
        <span>{formatLabel(key)}</span>
        <span className="font-medium">{value}</span>
      </div>
    ))}
  </div>

  {/* Time period information section */}
  <div className="mt-6 pt-4 border-t border-gray-100">
    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
      Time Periods
    </h3>
    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
      <div className="flex items-center">
        <span className="w-2 h-2 rounded-full bg-blue-400 mr-2"></span>
        <span>6:00 AM - 11:59 AM: Morning</span>
      </div>
      <div className="flex items-center">
        <span className="w-2 h-2 rounded-full bg-green-400 mr-2"></span>
        <span>12:00 PM - 5:59 PM: Afternoon</span>
      </div>
      <div className="flex items-center">
        <span className="w-2 h-2 rounded-full bg-orange-400 mr-2"></span>
        <span>6:00 PM - 11:59 PM: Evening</span>
      </div>
      <div className="flex items-center">
        <span className="w-2 h-2 rounded-full bg-purple-400 mr-2"></span>
        <span>12:00 AM - 6:00 AM: Night</span>
      </div>
    </div>
  </div>
</div>
  );
}

export default VisitsByTime;
