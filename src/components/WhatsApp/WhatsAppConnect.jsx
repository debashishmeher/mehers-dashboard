// export default function WhatsAppTemplates() {
//   const connect = () => {
//     window.location.href =
//       "https://whatsapp.api.nexodo.in/meta/connect-whatsapp";
//   };

//   return (
//     <button onClick={connect}>
//       Connect WhatsApp
//     </button>
//   );
// }


import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from 'js-cookie';

const APP_ID = "1765314440887870"; // your Meta App ID
const CONFIG_ID = "821091584129549"; // WhatsApp Embedded Signup config ID

export default function WhatsAppConnect() {
  const [sessionInfo, setSessionInfo] = useState(null);
  const [sdkResponse, setSdkResponse] = useState(null);

  // 1️⃣ Load Facebook SDK
  useEffect(() => {
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: APP_ID,
        autoLogAppEvents: true,
        xfbml: true,
        version: "v24.0",
      });
    };

    // Load SDK script
    const script = document.createElement("script");
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // 2️⃣ Listen for Embedded Signup events
  useEffect(() => {
    const handleMessage = (event) => {
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

        if (data.type === "WA_EMBEDDED_SIGNUP") {
          setSessionInfo(data);

          if (data.event === "FINISH") {
            const { phone_number_id, waba_id, business_id } = data.data;

            console.log("WABA ID:", waba_id);
            console.log("Phone Number ID:", phone_number_id);
            const token = Cookies.get('authToken');

            // TODO: send to backend
            // fetch("/api/meta/store-assets", { ... })
            const apiResponse = await axios.post(
              `${import.meta.env.VITE_API_URL}/meta/store-data`,
              { phone_number_id, waba_id, business_id },
              {
                withCredentials: true,
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `${token}`,
                },
              }
            );

          }

          if (data.event === "CANCEL") {
            console.warn("Signup cancelled at step:", data.data.current_step);
          }

          if (data.event === "ERROR") {
            console.error("Signup error:", data.data.error_message);
          }
        }
      } catch (err) {
        console.log("Non-JSON message:", event.data);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // 3️⃣ Facebook login callback
  const fbLoginCallback = async (fbResponse) => {
    try {
      setSdkResponse(fbResponse);

      const code = fbResponse?.authResponse?.code;
      if (!code) return;

      console.log("OAuth Code:", code);
      const token = Cookies.get('authToken');
      // ✅ Send code to backend
      const apiResponse = await axios.post(
        `${import.meta.env.VITE_API_URL}/meta/access-token`,
        { code },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
        }
      );

      console.log("Backend response:", apiResponse.data);
    } catch (error) {
      console.error(
        "OAuth exchange failed:",
        error?.response?.data || error.message
      );
    }
  };


  // 4️⃣ Launch Embedded Signup
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