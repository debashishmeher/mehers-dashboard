import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const COLORS = ["#A78BFA", "#6366F1"]; // New, Returning

function CustomerTypeChart({ old , newvisitors }) {
  const validTotal = old + newvisitors || 1; // Avoid division by 0
  const data = [
    { name: "New", value: newvisitors },
    { name: "Returning", value: old },
  ];
  const returningPercent = ((old / validTotal) * 100).toFixed(1);

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm w-full">
      <h2 className="text-sm font-semibold text-gray-700">
        New vs. returning customers
      </h2>
      <p className="text-xs text-gray-400 mb-4">in the selected period</p>

      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={70}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      <div className="text-center text-gray-600 text-lg font-semibold">
        {returningPercent}%
        <div className="text-xs text-gray-400">Returning customers</div>
      </div>

      <div className="flex justify-around mt-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#A78BFA]"></span> New
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#6366F1]"></span> Returning
        </span>
      </div>
    </div>
  );
}

export default CustomerTypeChart;
