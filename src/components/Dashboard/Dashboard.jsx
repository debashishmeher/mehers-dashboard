import { useState, useEffect } from "react";
import {
  Users,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Activity,
  CreditCard,
  Package,
  ChevronLeft,
  ChevronRight,
  Calendar,
  AlertCircle
} from "lucide-react";

function Dashboard() {
  // State for dark mode - follows system preference by default
  const [darkMode, setDarkMode] = useState(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // State for carousel navigation
  const [currentMetricSet, setCurrentMetricSet] = useState(0);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e) => {
      setDarkMode(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Apply dark mode class to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Dashboard metrics data sets (for carousel)
  const metricSets = [
    [
      {
        title: "Total Revenue",
        value: "$45,231.89",
        change: "+20.1%",
        icon: <DollarSign className="h-5 w-5" />,
        color: "bg-green-500/10 text-green-700 dark:text-green-400"
      },
      {
        title: "Subscriptions",
        value: "+2,350",
        change: "+180.1%",
        icon: <Users className="h-5 w-5" />,
        color: "bg-blue-500/10 text-blue-700 dark:text-blue-400"
      },
      {
        title: "Sales",
        value: "12,234",
        change: "+19%",
        icon: <ShoppingCart className="h-5 w-5" />,
        color: "bg-purple-500/10 text-purple-700 dark:text-purple-400"
      },
      {
        title: "Active Users",
        value: "573",
        change: "+201",
        icon: <Activity className="h-5 w-5" />,
        color: "bg-orange-500/10 text-orange-700 dark:text-orange-400"
      },
    ],
    [
      {
        title: "Avg. Order Value",
        value: "$142.50",
        change: "+12.5%",
        icon: <DollarSign className="h-5 w-5" />,
        color: "bg-blue-500/10 text-blue-700 dark:text-blue-400"
      },
      {
        title: "Conversion Rate",
        value: "3.25%",
        change: "+0.5%",
        icon: <TrendingUp className="h-5 w-5" />,
        color: "bg-green-500/10 text-green-700 dark:text-green-400"
      },
      {
        title: "Customer Satisfaction",
        value: "4.8/5",
        change: "+0.2",
        icon: <Users className="h-5 w-5" />,
        color: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
      },
      {
        title: "Bounce Rate",
        value: "28.5%",
        change: "-2.1%",
        icon: <Activity className="h-5 w-5" />,
        color: "bg-red-500/10 text-red-700 dark:text-red-400"
      },
    ]
  ];

  const recentOrders = [
    { id: 1, customer: "Olivia Martin", email: "olivia@email.com", amount: "$1,999.00", status: "Completed" },
    { id: 2, customer: "Jackson Lee", email: "jackson@email.com", amount: "$39.00", status: "Pending" },
    { id: 3, customer: "Isabella Nguyen", email: "isabella@email.com", amount: "$299.00", status: "Completed" },
    { id: 4, customer: "William Kim", email: "will@email.com", amount: "$99.00", status: "Processing" },
    { id: 5, customer: "Sofia Davis", email: "sofia@email.com", amount: "$39.00", status: "Completed" },
  ];

  const quickStats = [
    { label: "Avg. Order Value", value: "$142.50", trend: "up" },
    { label: "Conversion Rate", value: "3.25%", trend: "up" },
    { label: "Cart Abandonment", value: "28.5%", trend: "down" },
    { label: "Customer Satisfaction", value: "4.8/5", trend: "up" },
  ];

  const recentActivity = [
    {
      id: 1,
      action: "New payment received",
      time: "Just now",
      icon: <CreditCard className="h-4 w-4 text-blue-600 dark:text-blue-400" />,
      bgColor: "bg-blue-100 dark:bg-blue-900/30"
    },
    {
      id: 2,
      action: "Order #3210 shipped",
      time: "2 minutes ago",
      icon: <Package className="h-4 w-4 text-green-600 dark:text-green-400" />,
      bgColor: "bg-green-100 dark:bg-green-900/30"
    },
    {
      id: 3,
      action: "New user registered",
      time: "1 hour ago",
      icon: <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />,
      bgColor: "bg-purple-100 dark:bg-purple-900/30"
    },
  ];

  // Navigation handlers
  const handleNextMetrics = () => {
    setCurrentMetricSet((prev) => (prev + 1) % metricSets.length);
  };

  const handlePrevMetrics = () => {
    setCurrentMetricSet((prev) => (prev - 1 + metricSets.length) % metricSets.length);
  };

  const currentMetrics = metricSets[currentMetricSet];

  return (
    <div className="min-h-screen dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard Overview
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Welcome back! Here's what's happening today.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-full text-sm ${darkMode
              ? 'bg-gray-800 text-gray-300'
              : 'bg-gray-200 text-gray-700'}`}>
              <Calendar className="w-4 h-4 inline mr-2" />
              {new Date().toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
          </div>
        </div>

        {/* Metrics Grid with Navigation */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Key Metrics
            </h2>

            {metricSets.length > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevMetrics}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Set {currentMetricSet + 1} of {metricSets.length}
                </span>

                <button
                  onClick={handleNextMetrics}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {currentMetrics.map((metric, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {metric.title}
                    </p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                      {metric.value}
                    </h3>
                    <p className="text-sm mt-2">
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        {metric.change}
                      </span>{" "}
                      <span className="text-gray-600 dark:text-gray-400">from last month</span>
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${metric.color}`}>
                    {metric.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Recent Orders
                </h2>
                <button className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                  View all
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm font-medium text-gray-600 dark:text-gray-400 border-b dark:border-gray-700">
                      <th className="pb-3 px-4">Customer</th>
                      <th className="pb-3 px-4">Amount</th>
                      <th className="pb-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <td className="py-4 px-4">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {order.customer}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {order.email}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-900 dark:text-white font-medium">
                          {order.amount}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${order.status === 'Completed'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : order.status === 'Processing'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                            }`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Quick Stats and Activity */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Performance Stats
              </h2>
              <div className="space-y-4">
                {quickStats.map((stat, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <span className="text-gray-700 dark:text-gray-300">
                      {stat.label}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {stat.value}
                      </span>
                      <TrendingUp className={`h-4 w-4 ${stat.trend === 'up'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                        }`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Recent Activity
                </h2>
                <AlertCircle className="w-5 h-5 text-gray-400" />
              </div>

              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${activity.bgColor}`}>
                      {activity.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {activity.action}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Status */}
        <footer className="mt-8 pt-6 border-t dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Last updated: {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>

            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  System Operational
                </span>
              </div>

              <div className="text-sm text-gray-600 dark:text-gray-400">
                Auto-refresh in 5m
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default Dashboard;