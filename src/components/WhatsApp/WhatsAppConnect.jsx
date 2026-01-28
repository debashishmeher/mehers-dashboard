import { useEffect, useState } from "react";

const APP_ID = "1765314440887870";
const CONFIG_ID = "821091584129549";
const GRAPH_API_VERSION = "v24.0";

export default function WhatsAppEmbeddedSignup() {
  const [sdkReady, setSdkReady] = useState(false);
  const [authCode, setAuthCode] = useState(null);
  const [signupData, setSignupData] = useState(null);

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
      if (!event.origin.endsWith("facebook.com")) return;

      let payload;
      try {
        payload =
          typeof event.data === "string"
            ? JSON.parse(event.data)
            : event.data;
      } catch {
        return;
      }

      if (payload?.type === "WA_EMBEDDED_SIGNUP") {
        setSignupData(payload);
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  /* ===============================
     FB Login Callback
  =============================== */
  const fbLoginCallback = (response) => {
    if (response?.authResponse?.code) {
      setAuthCode(response.authResponse.code);
    }
  };

  /* ===============================
     Launch Embedded Signup
  =============================== */
  const launchWhatsAppSignup = () => {
    if (!sdkReady) return alert("Facebook SDK not ready");

    window.FB.login(fbLoginCallback, {
      config_id: CONFIG_ID,
      response_type: "code",
      override_default_response_type: true,
      extras: { setup: {} },
    });
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>WhatsApp Embedded Signup</h2>

        <button onClick={launchWhatsAppSignup} style={styles.button}>
          Connect WhatsApp
        </button>

        {/* OAuth Code */}
        <Section title="OAuth Code">
          {authCode ? (
            <CodeBlock>{authCode}</CodeBlock>
          ) : (
            <Muted>Not received yet</Muted>
          )}
        </Section>

        {/* Parsed Signup Data */}
        <Section title="Signup Details">
          {signupData?.data ? (
            <div style={styles.grid}>
              <Field label="Business ID" value={signupData.data.business_id} />
              <Field label="WABA ID" value={signupData.data.waba_id} />
              <Field
                label="Phone Number ID"
                value={signupData.data.phone_number_id}
              />
              <Field label="Event" value={signupData.event} />
            </div>
          ) : (
            <Muted>No signup data yet</Muted>
          )}
        </Section>

        {/* Raw Payload */}
        <Section title="Raw Payload">
          {signupData ? (
            <CodeBlock>
              {JSON.stringify(signupData, null, 2)}
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
   Small UI Helpers
=============================== */

const Section = ({ title, children }) => (
  <div style={{ marginTop: 24 }}>
    <h4 style={{ marginBottom: 8 }}>{title}</h4>
    {children}
  </div>
);

const Field = ({ label, value }) => (
  <div>
    <div style={{ fontSize: 12, color: "#6b7280" }}>{label}</div>
    <div style={{ fontWeight: 600 }}>{value || "-"}</div>
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
    maxWidth: 720,
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
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
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
