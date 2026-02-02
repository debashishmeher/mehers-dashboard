import { useEffect, useState, useCallback } from "react";
import Cookies from "js-cookie";

const APP_ID = "1765314440887870";
const CONFIG_ID = "821091584129549";
const GRAPH_API_VERSION = "v24.0";
const API_URL = import.meta.env.VITE_API_URL;

export default function WhatsAppEmbeddedSignup() {
  const [sdkReady, setSdkReady] = useState(false);
  const [sdkResponse, setSdkResponse] = useState(null);
  const [sessionEvent, setSessionEvent] = useState(null);

  // Store IDs required by backend
  const [integrationIds, setIntegrationIds] = useState({
    waba_id: null,
    phone_number_id: null,
  });

  /* ===============================
     Load Facebook SDK
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
     Embedded Signup Event Listener
  =============================== */
  useEffect(() => {
    const handler = (event) => {
      if (
        event.origin !== "https://www.facebook.com" &&
        event.origin !== "https://web.facebook.com"
      ) {
        return;
      }

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
        setSessionEvent(data);

        if (data.event === "FINISH") {
          const { waba_id, phone_number_id } = data.data;

          setIntegrationIds({
            waba_id,
            phone_number_id,
          });
        }

        if (data.event === "CANCEL") {
          console.warn("Signup cancelled at:", data.data?.current_step);
        }

        if (data.event === "ERROR") {
          console.error("Signup error:", data.data?.error_message);
        }
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  /* ===============================
     Backend Token Exchange
  =============================== */
  const sendToBackend = async (code) => {
    const token = Cookies.get("authToken");

    const res = await fetch(`${API_URL}/meta/access-token`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({
        code,
        waba_id: integrationIds.waba_id,
        phone_number_id: integrationIds.phone_number_id,
      }),
    });

    const data = await res.json();
    console.log("Backend response:", data);
  };

  /* ===============================
     FB Login Callback
  =============================== */
  const fbLoginCallback = useCallback(
    (response) => {
      setSdkResponse(response);

      if (response?.authResponse?.code) {
        const code = response.authResponse.code;

        // Meta requirement: send code + IDs to backend
        sendToBackend(code);
      }
    },
    [integrationIds]
  );

  /* ===============================
     Launch Embedded Signup
  =============================== */
  const launchWhatsAppSignup = () => {
    if (!sdkReady) return alert("Facebook SDK not loaded");

    window.FB.login(fbLoginCallback, {
      config_id: CONFIG_ID,
      response_type: "code",
      override_default_response_type: true,
      extras: { version: "v3" },
    });
  };

  /* ===============================
     UI
  =============================== */
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-6">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-xl p-6 space-y-6">
        <h2 className="text-2xl font-semibold">
          WhatsApp Embedded Signup
        </h2>

        <button
          onClick={launchWhatsAppSignup}
          className="bg-[#1877f2] hover:bg-[#166fe5] transition text-white font-semibold px-6 py-3 rounded-md"
        >
          Login with Facebook
        </button>

        {/* SDK Response */}
        <div>
          <h4 className="font-medium mb-2">SDK Response</h4>
          <pre className="bg-slate-900 text-slate-200 p-4 rounded-lg text-sm overflow-x-auto">
            {sdkResponse
              ? JSON.stringify(sdkResponse, null, 2)
              : "Waiting for Facebook login…"}
          </pre>
        </div>

        {/* Embedded Signup Session */}
        <div>
          <h4 className="font-medium mb-2">
            Embedded Signup Session
          </h4>
          <pre className="bg-slate-900 text-slate-200 p-4 rounded-lg text-sm overflow-x-auto">
            {sessionEvent
              ? JSON.stringify(sessionEvent, null, 2)
              : "Waiting for Embedded Signup events…"}
          </pre>
        </div>

        {/* Stored IDs */}
        <div>
          <h4 className="font-medium mb-2">Stored Integration IDs</h4>
          <pre className="bg-gray-50 border rounded-lg p-4 text-sm">
            {JSON.stringify(integrationIds, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
