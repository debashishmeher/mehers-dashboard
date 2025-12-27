import { Calendar, Clock, Gift, Crosshair, Tag } from "lucide-react";

export default function PresetCard({ preset }) {
  // Icon based on preset type
  const getTypeIcon = (type) => {
    switch (type) {
      case "cross":
        return <Crosshair className="w-6 h-6 text-blue-500" />;
      case "own":
        return <Gift className="w-6 h-6 text-green-500" />;
      default:
        return <Tag className="w-6 h-6 text-purple-500" />;
    }
  };

  return (
    <div className="relative bg-white rounded-2xl shadow-md hover:shadow-lg transition overflow-hidden">
      {/* Top Accent Bar */}
      <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

      <div className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-gray-100">{getTypeIcon(preset.type)}</div>
          <h3 className="text-lg font-bold text-gray-900">{preset.presetName}</h3>
        </div>

        {/* Dates */}
        <div className="flex flex-col gap-2 text-sm">
          {preset.startAt && (
            <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg text-green-700 font-medium">
              <Calendar className="w-4 h-4" />
              Start: {new Date(preset.startAt).toLocaleString()}
            </div>
          )}
          {preset.expireAt && (
            <div className="flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg text-red-700 font-medium">
              <Clock className="w-4 h-4" />
              End: {new Date(preset.expireAt).toLocaleString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
