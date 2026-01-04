import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";

const APP_ID = "1765314440887870";
const CONFIG_ID = "821091584129549";

export default function WhatsAppConnect() {
  const [sessionInfo, setSessionInfo] = useState(null);
  const [sdkResponse, setSdkResponse] = useState(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);


  const exchangeCode = async (code) => {
    try {
      const token = Cookies.get("authToken");

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/meta/access-token`,
        { code },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("OAuth exchange success:", res.data);
    } catch (err) {
      console.error(
        "OAuth exchange failed:",
        err?.response?.data || err.message
      );
    }
  };

  /* ===============================
     1️⃣ Load Facebook SDK (Meta way)
  =============================== */
  useEffect(() => {
    if (window.FB) {
      setSdkLoaded(true);
      return;
    }

    window.fbAsyncInit = function () {
      window.FB.init({
        appId: APP_ID,
        cookie: true,
        xfbml: false, // ✅ REQUIRED
        version: "v24.0",
      });
      setSdkLoaded(true);
    };

    const script = document.createElement("script");
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    document.body.appendChild(script);
  }, []);

  /* ===============================
     2️⃣ Embedded Signup Event Listener
  =============================== */
  useEffect(() => {
    const handleMessage = async (event) => {
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

      if (data?.type !== "WA_EMBEDDED_SIGNUP") return;

      setSessionInfo(data);

      if (data.event === "FINISH") {
        const { phone_number_id, waba_id, business_id } = data.data;
        const token = Cookies.get("authToken");

        await axios.post(
          `${import.meta.env.VITE_API_URL}/meta/store-data`,
          { phone_number_id, waba_id, business_id },
          {
            withCredentials: true,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // ✅ FIXED
            },
          }
        );
      }

      if (data.event === "CANCEL") {
        console.warn("Signup cancelled:", data.data?.current_step);
      }

      if (data.event === "ERROR") {
        console.error("Signup error:", data.data?.error_message);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  /* ===============================
     3️⃣ OAuth Code Callback
  =============================== */
  const fbLoginCallback = (response) => {
    setSdkResponse(response);

    const code = response?.authResponse?.code;
    if (!code) return;

    try {



      exchangeCode(code);

    } catch (err) {
      console.error(
        "OAuth exchange failed:",
        err?.response?.data || err.message
      );
    }
  };

  /* ===============================
     4️⃣ Launch Embedded Signup
  =============================== */
  const launchWhatsAppSignup = () => {
    if (!sdkLoaded || !window.FB) {
      alert("Facebook SDK not ready");
      return;
    }

    window.FB.login(fbLoginCallback, {
      config_id: CONFIG_ID,
      response_type: "code",
      override_default_response_type: true,
      scope: "business_management,whatsapp_business_management", // ✅ REQUIRED
    });
  };

  return (
    <div style={{ padding: 20 }}>
      <button
        onClick={launchWhatsAppSignup}
        style={{
          backgroundColor: "#1877f2",
          border: 0,
          borderRadius: 4,
          color: "#fff",
          cursor: "pointer",
          fontSize: 16,
          fontWeight: "bold",
          height: 40,
          padding: "0 24px",
        }}
      >
        Connect WhatsApp
      </button>

      <h3>Session Info</h3>
      <pre>{JSON.stringify(sessionInfo, null, 2)}</pre>

      <h3>SDK Response</h3>
      <pre>{JSON.stringify(sdkResponse, null, 2)}</pre>
    </div>
  );
}
