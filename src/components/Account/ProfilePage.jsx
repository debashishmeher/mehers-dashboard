import React, { useEffect, useState } from "react";

export default function UserProfile() {
  const [user, setUser] = useState({
    name: "Jane Doe",
    email: "janedoe@example.com",
    avatar: "https://i.pravatar.cc/150?img=47",
    bio: "Frontend developer, coffee enthusiast, and cat lover."
  });

  const [orders, setOrders] = useState([
    { id: "001", item: "Wireless Mouse", status: "Delivered" },
    { id: "002", item: "Bluetooth Headphones", status: "Shipped" },
    { id: "003", item: "USB-C Hub", status: "Processing" }
  ]);

  const [accountSettings, setAccountSettings] = useState({
    password: "",
    confirmPassword: ""
  });

  useEffect(() => {
    // Fetch user and orders data here
  }, []);

  const handleAccountChange = (e) => {
    const { name, value } = e.target;
    setAccountSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    if (accountSettings.password !== accountSettings.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    // Handle password update logic here
    console.log("Password updated:", accountSettings.password);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6 space-y-10">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-6">
        <div className="flex flex-col items-center">
          <img
            className="w-24 h-24 rounded-full border-4 border-blue-500 shadow-md"
            src={user.avatar}
            alt="User avatar"
          />
          <h2 className="mt-4 text-xl font-bold text-gray-800">{user.name}</h2>
          <p className="text-gray-500 text-sm">{user.email}</p>
          <p className="mt-2 text-center text-gray-600 text-sm">{user.bio}</p>
        </div>

        <div className="mt-6 flex justify-center gap-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200">
            Edit Profile
          </button>
          <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-200">
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">My Orders</h3>
        <ul className="space-y-3">
          {orders.map((order) => (
            <li
              key={order.id}
              className="flex justify-between items-center border-b pb-2 border-gray-200"
            >
              <span className="text-gray-700 text-sm">{order.item}</span>
              <span className="text-xs text-gray-500">{order.status}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Settings</h3>
        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">New Password</label>
            <input
              type="password"
              name="password"
              value={accountSettings.password}
              onChange={handleAccountChange}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={accountSettings.confirmPassword}
              onChange={handleAccountChange}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}
