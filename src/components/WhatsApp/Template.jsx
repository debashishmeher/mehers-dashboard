import { useTemplates } from '../../hooks/useTemplates';

// Helper function to extract component text by type
const getComponentText = (components, type) => {
  const component = components?.find(comp => comp.type === type);
  return component?.text || null;
};

// Helper to get body text with proper formatting
const getBodyText = (components) => {
  const bodyComp = components?.find(comp => comp.type === 'BODY');
  if (bodyComp?.text) return bodyComp.text;
  // If no text, check for example (though not needed for display)
  return 'No content available';
};

// Helper to get header text/format
const getHeaderInfo = (components) => {
  const header = components?.find(comp => comp.type === 'HEADER');
  if (!header) return null;
  return {
    format: header.format || 'TEXT',
    text: header.text || null
  };
};

// Status color mapping
const getStatusColor = (status) => {
  switch (status?.toUpperCase()) {
    case 'APPROVED':
      return 'bg-green-100 text-green-700';
    case 'REJECTED':
      return 'bg-red-100 text-red-700';
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-700';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};

// Category color mapping
const getCategoryColor = (category) => {
  switch (category?.toUpperCase()) {
    case 'UTILITY':
      return 'bg-blue-100 text-blue-700';
    case 'MARKETING':
      return 'bg-purple-100 text-purple-700';
    case 'AUTHENTICATION':
      return 'bg-indigo-100 text-indigo-700';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};

function Template() {
  const { data: templates = [], isLoading, error, refetch } = useTemplates();

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.18),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.16),_transparent_26%),linear-gradient(180deg,_#f8fafc_0%,_#f5f8ff_46%,_#eefaf6_100%)] px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full opacity-20 animate-ping"></div>
            </div>
          </div>
          <p className="mt-6 text-gray-600 font-medium">Loading templates...</p>
          <p className="text-sm text-gray-400 mt-1">Please wait while we fetch your WhatsApp templates</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.18),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.16),_transparent_26%),linear-gradient(180deg,_#f8fafc_0%,_#f5f8ff_46%,_#eefaf6_100%)] px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center border border-red-100">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Templates</h3>
            <p className="text-gray-600 mb-6">{error.message}</p>
            <button
              onClick={() => refetch()}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty State
  if (templates.length === 0) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.18),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.16),_transparent_26%),linear-gradient(180deg,_#f8fafc_0%,_#f5f8ff_46%,_#eefaf6_100%)] px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center border border-gray-100">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Templates Found</h3>
            <p className="text-gray-500">You don't have any WhatsApp templates yet. Create your first template to get started.</p>
          </div>
        </div>
      </div>
    );
  }

  // Success State - Display Templates
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.18),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.16),_transparent_26%),linear-gradient(180deg,_#f8fafc_0%,_#f5f8ff_46%,_#eefaf6_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              WhatsApp Templates
            </h1>
            <p className="text-gray-500 mt-2">Manage and use your message templates</p>
          </div>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 text-gray-700 hover:shadow-md transition-all duration-200 hover:scale-105"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => {
            const bodyText = getBodyText(template.components);
            const headerInfo = getHeaderInfo(template.components);
            const footerText = getComponentText(template.components, 'FOOTER');
            
            return (
              <div
                key={template.id}
                className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-white/50 overflow-hidden flex flex-col"
              >
                <div className="p-6 flex-1">
                  {/* Template Header with Name & Badges */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 break-words">
                        {template.name}
                      </h3>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-50 to-emerald-100 rounded-full flex items-center justify-center shadow-sm">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Category and Status Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {template.category && (
                      <span className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-full ${getCategoryColor(template.category)}`}>
                        {template.category}
                      </span>
                    )}
                    <span className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-full ${getStatusColor(template.status)}`}>
                      {template.status}
                    </span>
                  </div>

                  {/* Header Preview (if exists and not TEXT) */}
                  {headerInfo && headerInfo.format !== 'TEXT' && (
                    <div className="mb-3 p-2 bg-gray-50 rounded-lg border border-gray-100">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Header ({headerInfo.format})</span>
                      {headerInfo.text && (
                        <p className="text-sm text-gray-700 mt-1 line-clamp-2">{headerInfo.text}</p>
                      )}
                    </div>
                  )}

                  {/* Body Text - Main Content */}
                  <div className="mb-3">
                    <p className="text-gray-700 text-sm leading-relaxed line-clamp-4">
                      {bodyText}
                    </p>
                  </div>

                  {/* Footer Preview */}
                  {footerText && (
                    <div className="mt-3 pt-2 text-xs text-gray-400 border-t border-gray-100 italic">
                      {footerText}
                    </div>
                  )}
                </div>

                {/* Template Footer Meta */}
                <div className="px-6 py-3 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                    <span>{template.language || 'en_US'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{new Date(template.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Template;