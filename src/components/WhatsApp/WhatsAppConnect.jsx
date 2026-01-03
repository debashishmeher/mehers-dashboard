import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";

const APP_ID = "1765314440887870";
const CONFIG_ID = "821091584129549";

export default function WhatsAppConnect() {
  const [sessionInfo, setSessionInfo] = useState(null);
  const [sdkResponse, setSdkResponse] = useState(null);

  /* ===============================
     1️⃣ Load Facebook SDK (once)
  =============================== */
  useEffect(() => {
    if (window.FB) return;

    window.fbAsyncInit = function () {
      window.FB.init({
        appId: APP_ID,
        autoLogAppEvents: true,
        xfbml: false,
        version: "v24.0",
      });
    };

    const script = document.createElement("script");
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    document.body.appendChild(script);
  }, []);

  /* ===============================
     2️⃣ Listen for Embedded Signup
  =============================== */
  useEffect(() => {
    const handleMessage = async (event) => {
      if (
        event.origin !== "https://www.facebook.com" &&
        event.origin !== "https://web.facebook.com"
      ) {
        return;
      }

      try {
        const data =
          typeof event.data === "string"
            ? JSON.parse(event.data)
            : event.data;

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
                Authorization: token,
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
      } catch (err) {
        console.error("Embedded signup message error:", err);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  /* ===============================
     3️⃣ Facebook Login Callback
  =============================== */
  const fbLoginCallback = async (fbResponse) => {
    try {
      setSdkResponse(fbResponse);

      const code = fbResponse?.authResponse?.code;
      if (!code) return;

      const token = Cookies.get("authToken");

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/meta/access-token`,
        { code },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        }
      );

      console.log("Access token stored:", res.data);
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
    if (!window.FB) {
      alert("Facebook SDK not loaded yet");
      return;
    }

    window.FB.login(fbLoginCallback, {
      config_id: CONFIG_ID,
      response_type: "code",
      override_default_response_type: true,
      extras: { version: "v3" },
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
        Login with Facebook
      </button>

      <h3>Session Info</h3>
      <pre>{JSON.stringify(sessionInfo, null, 2)}</pre>

      <h3>SDK Response</h3>
      <pre>{JSON.stringify(sdkResponse, null, 2)}</pre>
    </div>
  );
}
