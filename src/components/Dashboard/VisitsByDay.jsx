import React from "react";

// const visitData = {
//   sunday: 0,
//   monday: 0,
//   tuesday: 0,
//   wednesday: 0,
//   thursday: 0,
//   friday: 3,
//   saturday: 0,
// };

const formatDay = (day) =>
  day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();

function VisitsByDay({data}) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm w-full">
      <h2 className="text-sm font-semibold text-gray-700">
        Visits by day of the week
      </h2>
      <p className="text-xs text-gray-400 mb-4">in the selected period</p>

      <div className="text-sm text-gray-700 divide-y divide-gray-100">
        {Object.entries(data).map(([day, count]) => (
          <div key={day} className="flex justify-between py-2">
            <span>{formatDay(day)}</span>
            <span className="font-medium">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default VisitsByDay;
