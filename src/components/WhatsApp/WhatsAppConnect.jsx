import { useEffect, useState } from "react";
import MetaService from "../../Services/metaServices";
import Cookies from "js-cookie";

const APP_ID = "1765314440887870";
const CONFIG_ID = "821091584129549";
const GRAPH_API_VERSION = "v24.0";

export default function WhatsAppEmbeddedSignupUI() {
  const [sdkResponse, setSdkResponse] = useState(null);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [sdkReady, setSdkReady] = useState(false);

  const token = Cookies.get("authToken");

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
          console.log("Signup finished:", data.data);
        }

        if (data.event === "CANCEL") {
          console.warn("Cancelled:", data.data?.current_step);
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
     FB Login Callback (FIXED)
  =============================== */
  const fbLoginCallback = async (response) => {
    setSdkResponse(response);

    if (!response?.authResponse?.code) return;
    if (!sessionInfo?.data) {
      console.warn("Session info not ready yet");
      return;
    }

    const code = response.authResponse.code;

    try {
      const res = await MetaService.sendAuthCode(
        code,
        sessionInfo.data
      );

      console.log("Meta connected:", res);
    } catch (err) {
      console.error(
        "Meta auth failed",
        err?.response?.data || err.message
      );
    }
  };

  /* ===============================
     Launch Embedded Signup
  =============================== */
  const launchWhatsAppSignup = () => {
    if (!sdkReady) {
      alert("Facebook SDK not loaded");
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
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>WhatsApp Embedded Signup</h2>

        <button onClick={launchWhatsAppSignup} style={styles.button}>
          Login with Facebook
        </button>

        <Section title="SDK Response">
          {sdkResponse ? (
            <CodeBlock>
              {JSON.stringify(sdkResponse, null, 2)}
            </CodeBlock>
          ) : (
            <Muted>No SDK response yet</Muted>
          )}
        </Section>

        <Section title="Session Info">
          {sessionInfo ? (
            <CodeBlock>
              {JSON.stringify(sessionInfo, null, 2)}
            </CodeBlock>
          ) : (
            <Muted>Waiting for Embedded Signup events…</Muted>
          )}
        </Section>
      </div>
    </div>
  );
}
