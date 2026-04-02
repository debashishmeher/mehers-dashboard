import { useEffect, useState, useCallback, useRef } from "react";
import Cookies from "js-cookie";

const APP_ID = "1765314440887870";
const CONFIG_ID = "821091584129549";
const GRAPH_API_VERSION = "v24.0";
const API_URL = import.meta.env.VITE_API_URL;

export default function WhatsAppEmbeddedSignup() {
  const [sdkReady, setSdkReady] = useState(false);
  const [sdkResponse, setSdkResponse] = useState(null);
  const [sessionEvent, setSessionEvent] = useState(null);
  const [authCode, setAuthCode] = useState(null);

  const backendCalledRef = useRef(false); // ✅ prevents double call

  // ✅ Store ALL required IDs
  const [integrationIds, setIntegrationIds] = useState({
    waba_id: null,
    phone_number_id: null,
    business_id: null,
  });

  /* ===============================
     Send data to backend (SAFE)
  =============================== */
  const sendToBackend = async (code, ids) => {
    if (
      !ids.waba_id ||
      !ids.phone_number_id ||
      !ids.business_id
    ) {
      console.warn("IDs not ready, skipping backend call");
      return;
    }

    if (backendCalledRef.current) return;
    backendCalledRef.current = true;

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
        waba_id: ids.waba_id,
        phone_number_id: ids.phone_number_id,
        business_id: ids.business_id,
      }),
    });

    const data = await res.json();
    console.log("Backend response:", data);
  };

  /* ===============================
     Call backend ONLY when ready
  =============================== */
  useEffect(() => {
    if (
      authCode &&
      integrationIds.waba_id &&
      integrationIds.phone_number_id &&
      integrationIds.business_id
    ) {
      sendToBackend(authCode, integrationIds);
    }
  }, [authCode, integrationIds]);

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
     Embedded Signup Listener
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
          const { waba_id, phone_number_id, business_id } = data.data;

          setIntegrationIds({
            waba_id,
            phone_number_id,
            business_id,
          });
        }

        if (data.event === "CANCEL") {
          console.warn("Signup cancelled:", data.data?.current_step);
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
     FB Login Callback
  =============================== */
  const fbLoginCallback = useCallback((response) => {
    setSdkResponse(response);

    if (response?.authResponse?.code) {
      setAuthCode(response.authResponse.code);
    }
  }, []);

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
      scope: [
        "business_management",
        "whatsapp_business_management",
        "whatsapp_business_messaging",
      ].join(","),
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

        <pre className="bg-slate-900 text-slate-200 p-4 rounded-lg text-sm">
          SDK Response:
          {JSON.stringify(sdkResponse, null, 2)}
        </pre>

        <pre className="bg-slate-900 text-slate-200 p-4 rounded-lg text-sm">
          Embedded Signup:
          {JSON.stringify(sessionEvent, null, 2)}
        </pre>

        <pre className="bg-gray-50 border rounded-lg p-4 text-sm">
          Stored IDs:
          {JSON.stringify(integrationIds, null, 2)}
        </pre>
      </div>
    </div>
  );
}
