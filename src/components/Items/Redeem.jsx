import React, { useState } from 'react'

function Redeem() {
  const [open, setOpen] = useState(false)
  const [coupon, setCoupon] = useState("")

  const handleRedeem = () => {
    // Add redeem logic here
    setOpen(false)
    setCoupon("")
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px]">
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={() => setOpen(true)}
      >
        Redeem Coupon
      </button>
      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80">
            <h2 className="text-lg font-semibold mb-4">Redeem Coupon</h2>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter coupon code"
              value={coupon}
              onChange={e => setCoupon(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                onClick={handleRedeem}
                disabled={!coupon.trim()}
              >
                Redeem
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Redeem
