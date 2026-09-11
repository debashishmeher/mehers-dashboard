import { Plus, CreditCard, Share2, QrCode, Users, Sparkles } from "lucide-react";

function NoCard({ onCreateCard }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        {/* Main Content */}
        <div className="space-y-8">
          {/* Icon & Header */}
          <div className="space-y-4">
            <div className="relative inline-block">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-md">
                <Sparkles className="w-4 h-4 text-yellow-800" />
              </div>
            </div>
            
            <div className="space-y-3">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Create Your Digital Business Card
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                Share your professional information with a beautiful digital card that works everywhere.
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
            {[
              {
                icon: Share2,
                title: "Easy Sharing",
                description: "Share via digital link"
              },
              {
                icon: Users,
                title: "Professional",
                description: "Make great impressions"
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 text-center group hover:shadow-md transition-all duration-200"
              >
                <div className="w-12 h-12 mx-auto bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200">
                  <feature.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                  {feature.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="space-y-4">
            <button
              onClick={onCreateCard}
              className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Plus className="w-6 h-6 transition-transform group-hover:rotate-90 duration-300" />
              Create Your First Card
              <div className="absolute inset-0 rounded-xl bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            </button>
            
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Free • Quick setup • Professional results
            </p>
          </div>

          {/* Additional Info */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center gap-6 text-xs text-gray-500 dark:text-gray-400">
              <span>✓ No credit card required</span>
              <span>✓ Set up in 2 minutes</span>
              <span>✓ Mobile friendly</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NoCard;