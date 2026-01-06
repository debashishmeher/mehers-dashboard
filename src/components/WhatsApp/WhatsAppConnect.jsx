import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";

const APP_ID = "1765314440887870";
const CONFIG_ID = "821091584129549";

export default function WhatsAppConnect() {
  const [sdkReady, setSdkReady] = useState(false);
  const [sessionInfo, setSessionInfo] = useState(null);

  /* ===============================
     Load Meta SDK (Once)
  =============================== */
  useEffect(() => {
    if (window.FB) {
      setSdkReady(true);
      return;
    }

    window.fbAsyncInit = function () {
      window.FB.init({
        appId: APP_ID,
        cookie: true,
        xfbml: false,
        version: "v24.0",
      });
      setSdkReady(true);
    };

    const script = document.createElement("script");
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  /* ===============================
     OAuth → Backend
  =============================== */
  const exchangeCode = async (code) => {
    const token = Cookies.get("authToken");

    await axios.post(
      `${import.meta.env.VITE_API_URL}/meta/access-token`,
      { code },
      {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  };

  /* ===============================
     Embedded Signup Listener
  =============================== */
  useEffect(() => {
    const handler = async (event) => {
      if (
        !["https://www.facebook.com", "https://web.facebook.com"].includes(
          event.origin
        )
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

      if (data?.type !== "WA_EMBEDDED_SIGNUP") return;
      setSessionInfo(data);

      if (data.event === "FINISH") {
        const token = Cookies.get("authToken");

        await axios.post(
          `${import.meta.env.VITE_API_URL}/meta/store-client`,
          data.data,
          {
            withCredentials: true,
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  /* ===============================
     Launch Signup
  =============================== */
  const launchSignup = () => {
    if (!sdkReady) return alert("SDK not ready");

    window.FB.login(
      (res) => res?.authResponse?.code && exchangeCode(res.authResponse.code),
      {
        config_id: CONFIG_ID,
        response_type: "code",
        override_default_response_type: true,
        auth_type: "rerequest",
        scope: "business_management,whatsapp_business_management",
      }
    );
  };

  return (
    <div>
      <button onClick={launchSignup}>Connect WhatsApp</button>
      <pre>{JSON.stringify(sessionInfo, null, 2)}</pre>
    </div>
  );
}
