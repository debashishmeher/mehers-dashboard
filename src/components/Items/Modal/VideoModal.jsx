import { useState } from "react";
import Cookies from "js-cookie";

export default function UpdateVideoModal({ cardData, cardId, onClose, onSubmit }) {
  const [videoUrl, setVideoUrl] = useState(cardData?.videoUrl || "");
  const [videoError, setVideoError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Function to extract YouTube video ID from URL
  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // Function to validate YouTube URL
  const validateYouTubeUrl = (url) => {
    if (!url) return "";
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
    setErrorMessage(""); // Clear any previous error messages
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    const error = validateYouTubeUrl(videoUrl);
    if (error) {
      setVideoError(error);
      return;
    }
    
    const authToken = Cookies.get("authToken");
    setIsSubmitting(true);
    setErrorMessage(""); // clear old error

    const url = `${import.meta.env.VITE_API_URL}/api/user/card/${cardId}/update-meta`;
    
    try {
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${authToken}`,
        },
        credentials: "include",
        body: JSON.stringify({ videoUrl: videoUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.message || `Failed to update video URL`);
      }

      const result = await response.json();
      const updatedValue = result?.data?.videoUrl;

      if (onSubmit) onSubmit({ videoUrl: updatedValue });
      onClose();
    } catch (err) {
      console.error(`Error updating video URL:`, err.message);
      setErrorMessage(err.message || "Something went wrong, please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const youtubeVideoId = getYouTubeVideoId(videoUrl);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Update Video URL
        </h2>
        
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              YouTube Video URL
            </label>
            <input
              type="url"
              value={videoUrl}
              onChange={handleVideoUrlChange}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isSubmitting}
            />
            {videoError && (
              <p className="text-red-500 text-xs mt-2">{videoError}</p>
            )}
          </div>

          {youtubeVideoId && !videoError && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Preview
              </h4>
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                  title="YouTube video player"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-red-700 dark:text-red-300 text-sm">{errorMessage}</p>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!!videoError && videoUrl !== "" || isSubmitting}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                "Save Video"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}