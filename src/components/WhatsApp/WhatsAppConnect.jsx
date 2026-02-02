import { useEffect, useState } from "react";
import MetaService from "../../Services/metaServices";

const APP_ID = "1765314440887870";
const CONFIG_ID = "821091584129549";
const GRAPH_API_VERSION = "v24.0";

export default function WhatsAppEmbeddedSignupUI() {
  const [sdkResponse, setSdkResponse] = useState(null);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  /* ===============================
     Load & Init Meta SDK
  =============================== */
  useEffect(() => {
    if (window.FB) {
      setSdkReady(true);
      return;
    }

    window.fbAsyncInit = function () {
      window.FB.init({
        appId: APP_ID,
        autoLogAppEvents: true,
        xfbml: true,
        version: GRAPH_API_VERSION,
      });
      setSdkReady(true);
    };

    const script = document.createElement("script");
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    document.body.appendChild(script);
  }, []);

  /* ===============================
     Embedded Signup Listener
  =============================== */
  useEffect(() => {
    const handler = (event) => {
      if (
        event.origin !== "https://www.facebook.com" &&
        event.origin !== "https://web.facebook.com"
      )
        return;

      let data;
      try {
        data =
          typeof event.data === "string"
            ? JSON.parse(event.data)
            : event.data;
      } catch {
        return;
      }

      if (data?.type === "WA_EMBEDDED_SIGNUP") {
        setSessionInfo(data);

        if (data.event === "FINISH") {
          setMessage("✅ Signup completed successfully");
        }

        if (data.event === "CANCEL") {
          setMessage("⚠️ Signup cancelled by user");
        }

        if (data.event === "ERROR") {
          setMessage("❌ Signup failed");
        }
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  /* ===============================
     FB Login Callback
  =============================== */
  const fbLoginCallback = async (response) => {
    setSdkResponse(response);

    if (!response?.authResponse?.code || !sessionInfo?.data) return;

    try {
      setLoading(true);

      const res = await MetaService.sendAuthCode(
        response.authResponse.code,
        sessionInfo.data
      );

      setMessage("🎉 WhatsApp connected successfully");
      console.log("Meta connected:", res);
    } catch (err) {
      setMessage("❌ Meta authentication failed");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     Launch Embedded Signup
  =============================== */
  const launchWhatsAppSignup = () => {
    if (!sdkReady || loading) return;

    window.FB.login(fbLoginCallback, {
      config_id: CONFIG_ID,
      response_type: "code",
      override_default_response_type: true,
      extras: { version: "v3" },
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          WhatsApp Embedded Signup
        </h2>

        {message && (
          <div className="mb-4 text-sm font-medium text-gray-700">
            {message}
          </div>
        )}

        <button
          onClick={launchWhatsAppSignup}
          disabled={!sdkReady || loading}
          className={`w-full py-3 rounded-md font-semibold transition
            ${loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
        >
          {loading ? "Connecting..." : "Login with Facebook"}
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <InfoBox title="SDK Response" data={sdkResponse} />
          <InfoBox title="Session Info" data={sessionInfo} />
        </div>
      </div>
    </div>
  );
}

/* ===============================
   UI Helpers
=============================== */

const InfoBox = ({ title, data }) => (
  <div className="bg-gray-900 text-gray-200 rounded-lg p-4 text-sm">
    <h4 className="font-semibold mb-2">{title}</h4>
    {data ? (
      <pre className="overflow-x-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    ) : (
      <p className="text-gray-400">No data yet</p>
    )}
  </div>
);
