import { useEffect, useState } from "react";
import { sendMetaAuthCode } from "../../Services/metaServices";

const APP_ID = "1765314440887870";
const CONFIG_ID = "821091584129549";
const GRAPH_API_VERSION = "v24.0";

export default function WhatsAppEmbeddedSignupUI() {
  const [sdkResponse, setSdkResponse] = useState(null);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [state, setState] = useState(null);

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
     Embedded Signup Event Listener
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
          const { phone_number_id, waba_id } = data.data;
          console.log("Phone:", phone_number_id, "WABA:", waba_id);
        }
        if (data.event === "CANCEL") {
          console.warn("Cancelled at step:", data.data?.current_step);
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
  const fbLoginCallback = (response) => {
    setSdkResponse(response);

    if (response?.authResponse?.code) {
      const code = response.authResponse.code;

      console.log("OAuth code:", code);

      try {
        const res = await sendMetaAuthCode({
          code,
          sessionData: sessionInfo.data,
        });

        console.log("Backend response:", res);
        // 👉 handle success (save meta account, navigate, toast, etc.)
      } catch (error) {
        console.error(
          "Failed to send OAuth code",
          error?.response?.data || error.message
        );
        // 👉 show error toast
      }
    }
  };

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

        <Section title="Session Info (Embedded Signup)">
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

/* ===============================
   UI Helpers
=============================== */

const Section = ({ title, children }) => (
  <div style={{ marginTop: 24 }}>
    <h4 style={{ marginBottom: 8 }}>{title}</h4>
    {children}
  </div>
);

const CodeBlock = ({ children }) => (
  <pre style={styles.code}>{children}</pre>
);

const Muted = ({ children }) => (
  <div style={{ color: "#9ca3af" }}>{children}</div>
);

/* ===============================
   Styles
=============================== */

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f3f4f6",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 760,
    background: "#fff",
    borderRadius: 12,
    padding: 24,
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
  },
  title: {
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#1877f2",
    border: 0,
    borderRadius: 6,
    color: "#fff",
    cursor: "pointer",
    fontSize: 16,
    fontWeight: 600,
    height: 44,
    padding: "0 24px",
  },
  code: {
    background: "#0f172a",
    color: "#e5e7eb",
    padding: 16,
    borderRadius: 8,
    overflowX: "auto",
    fontSize: 13,
  },
};
