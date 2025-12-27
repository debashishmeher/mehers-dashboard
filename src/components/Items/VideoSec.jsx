import { useState, useRef, useEffect } from "react";
import { FaVideo } from "react-icons/fa";
import { ChevronDown, ChevronRight, Video, Play, Upload } from "lucide-react";

export default function VideoSec({ cardData, openModal }) {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef(null);
  const [height, setHeight] = useState(0);
  // const [videoUrl, setVideoUrl] = useState(cardData?.videoUrl || "");
  const [videoError, setVideoError] = useState("");

  const videoUrl= cardData?.videoUrl || "";


  // Function to extract YouTube video ID from URL
  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // Function to validate YouTube URL
  const validateYouTubeUrl = (url) => {
    if (!url) return ""; // Empty URL is valid (optional field)
    
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    if (!youtubeRegex.test(url)) {
      return "Please enter a valid YouTube URL";
    }
    
    if (!getYouTubeVideoId(url)) {
      return "Could not extract video ID from this YouTube URL";
    }
    
    return "";
  };

  const handleVideoUrlChange = (e) => {
    const url = e.target.value;
    setVideoUrl(url);
    const error = validateYouTubeUrl(url);
    setVideoError(error);
  };

  const handleVideoSave = () => {
    const error = validateYouTubeUrl(videoUrl);
    if (error) {
      setVideoError(error);
      return;
    }
    
    setVideoError("");
    // Save video URL logic would go here
    console.log("Video URL saved:", videoUrl);
  };

  
  
  
  useEffect(() => {
    if (contentRef.current) {
      setHeight(isOpen ? contentRef.current.scrollHeight : 0);
    }
  }, [isOpen]);
  
  const youtubeVideoId = getYouTubeVideoId(videoUrl);
  console.log(youtubeVideoId);
  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-900/20 rounded-xl border border-gray-200 dark:border-gray-700 w-full overflow-hidden transition-all duration-300 hover:shadow-xl dark:hover:shadow-gray-900/30">
      {/* Header */}
      <div
        className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
            <FaVideo className="text-purple-600 dark:text-purple-400 text-xl" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Video Content
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              YouTube video integration
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {isOpen ? "Hide" : "Show"}
          </span>
          <ChevronDown
            className={`w-5 h-5 text-gray-400 dark:text-gray-500 transform transition-transform duration-300 ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
          />
        </div>
      </div>

      {/* Collapsible Content */}
      <div
        ref={contentRef}
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: `${height}px` }}
      >


        {/* Video Input Section - Shows when modal is open or in edit mode */}
        {openModal && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                  YouTube Video URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={handleVideoUrlChange}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  />
                  <button
                    onClick={handleVideoSave}
                    disabled={!!videoError && videoUrl !== ""}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white rounded-lg font-medium text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Save
                  </button>
                </div>
                
                {videoError && (
                  <p className="text-red-500 text-xs flex items-center gap-1 mt-2">
                    <span>⚠</span> {videoError}
                  </p>
                )}

                {!videoError && videoUrl && (
                  <p className="text-green-500 text-xs flex items-center gap-1 mt-2">
                    <span>✓</span> Valid YouTube URL
                  </p>
                )}
              </div>

              {/* Video Preview */}
              {youtubeVideoId && !videoError && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <Play className="w-4 h-4" />
                    Video Preview
                  </h4>
                  <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                    <iframe
                      src={`https://www.youtube.com/embed/${youtubeVideoId}?rel=0&modestbranding=1`}
                      title="YouTube video player"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Live preview of your YouTube video
                  </p>
                </div>
              )}

              {/* Help Text */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  <strong>Supported formats:</strong> youtube.com/watch?v=..., youtu.be/..., youtube.com/embed/...
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Empty State */}
        {!videoUrl && (
          <div className="text-center py-8 px-6">
            <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <Video className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Video Added
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
              Add a YouTube video to showcase your content
            </p>
            <button
              onClick={() => openModal && openModal("videoUrl", "Video URL")}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 flex items-center gap-2 mx-auto"
            >
              <Upload className="w-4 h-4" />
              Add Video URL
            </button>
          </div>
        )}
      </div>
    </div>
  );
}