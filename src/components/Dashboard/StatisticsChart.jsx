import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const CouponChart = ({ totalVisitors, activeCoupons, redeemedCoupons, expiredCoupons }) => {


  const data = {
    labels: ['Statistics'],
    datasets: [
      {
        label: 'Visitors',
        data: [totalVisitors],
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
      {
        label: 'Active Coupons',
        data: [activeCoupons],
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
      },
      {
        label: 'Redeemed Coupons',
        data: [redeemedCoupons],
        backgroundColor: 'rgba(245, 158, 11, 0.7)',
        borderColor: 'rgba(245, 158, 11, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Coupon Performance',
      },
    },
    scales: {
      x: {
        stacked: false,
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="bg-white text-gray-800 p-4 rounded-2xl shadow-sm w-full overflow-x-auto"> {/* Added overflow-x-auto here */}
      <div className="bg-white rounded-lg shadow p-4 h-[400px] min-h-[300px] min-w-[500px]"> {/* Added min-width */}
        <div className="h-full w-full">
          <Bar data={data} options={options} />
        </div>
      </div>
    </div>
  );
};

export default CouponChart;