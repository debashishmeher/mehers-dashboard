import { useEffect, useState, useCallback, useRef } from "react";
import { getCookie } from "../../utils/auth";
import {
  AlertCircle,
  BadgeCheck,
  Building2,
  CheckCircle2,
  ChevronRight,
  LoaderCircle,
  MessageSquareShare,
  Phone,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Store,
  Unplug,
} from "lucide-react";

const APP_ID = "1765314440887870";
const CONFIG_ID = "821091584129549";
const GRAPH_API_VERSION = "v24.0";
const API_URL = import.meta.env.VITE_API_URL;

const initialIntegrationIds = {
  waba_id: null,
  phone_number_id: null,
  business_id: null,
};

const statusPillStyles = {
  success: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
  warning: "bg-amber-100 text-amber-700 ring-1 ring-amber-200",
  error: "bg-rose-100 text-rose-700 ring-1 ring-rose-200",
  neutral: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  info: "bg-sky-100 text-sky-700 ring-1 ring-sky-200",
};

const formatDate = (value) => {
  if (!value) return "Not available";

  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatFlag = (value) => (value ? "Enabled" : "Disabled");

const getEventTone = (eventName) => {
  if (eventName === "FINISH") return "success";
  if (eventName === "ERROR") return "error";
  if (eventName === "CANCEL") return "warning";
  return "neutral";
};

function StatusPill({ tone = "neutral", children }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusPillStyles[tone]}`}
    >
      {children}
    </span>
  );
}

function SummaryCard({ icon: Icon, label, value, hint, tone = "neutral" }) {
  const iconTone =
    tone === "success"
      ? "text-emerald-600"
      : tone === "error"
        ? "text-rose-600"
        : tone === "warning"
          ? "text-amber-600"
          : "text-slate-700";

  return (
    <div className="rounded-3xl border border-white/60 bg-white/80 p-5 shadow-[0_18px_60px_-28px_rgba(15,23,42,0.28)] backdrop-blur">
      <div className="mb-4 flex items-center justify-between">
        <div className="rounded-2xl bg-slate-900/5 p-3">
          <Icon className={`h-5 w-5 ${iconTone}`} />
        </div>
        <StatusPill tone={tone}>{label}</StatusPill>
      </div>
      <div className="text-lg font-semibold text-slate-900">{value}</div>
      <p className="mt-2 text-sm text-slate-500">{hint}</p>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 break-words text-sm font-medium text-slate-800">
        {value || "Not available"}
      </p>
    </div>
  );
}

function StepRow({ title, subtitle, done }) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={`mt-0.5 rounded-full p-1 ${done ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"}`}
      >
        {done ? <CheckCircle2 className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </div>
      <div>
        <p className="font-medium text-slate-900">{title}</p>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}

function ConnectionCard({ client, loading, onRefresh }) {
  return (
    <div className="rounded-[28px] border border-slate-200/70 bg-white/85 p-6 shadow-[0_18px_60px_-28px_rgba(15,23,42,0.35)] backdrop-blur">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
              <BadgeCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                Current Connection
              </p>
              <h3 className="text-2xl font-semibold text-slate-900">
                {loading ? "Checking your account..." : client?.waba_name || "No WhatsApp account connected"}
              </h3>
            </div>
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
            {client
              ? "Your latest connected WhatsApp Business account is shown here, including messaging and webhook status."
              : "Connect your business account to start using templates, messaging, and webhook-based automation from this dashboard."}
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex items-center gap-2 self-start rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="mt-6 flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-5 text-slate-600">
          <LoaderCircle className="h-5 w-5 animate-spin" />
          Loading saved WhatsApp client...
        </div>
      ) : client ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <InfoItem label="Business" value={client.waba_name || client.waba_id} />
          <InfoItem label="Phone" value={client.display_phone_number || client.phone_number_id} />
          <InfoItem label="Verified Name" value={client.verified_name} />
          <InfoItem label="Platform" value={client.platform_type} />
          <InfoItem label="Messaging" value={formatFlag(client.messaging_enabled)} />
          <InfoItem label="Webhook" value={formatFlag(client.webhook_subscribed)} />
          <InfoItem label="Quality" value={client.quality_rating} />
          <InfoItem label="Last Onboarded" value={formatDate(client.last_onboarded_at)} />
        </div>
      ) : (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-5 text-slate-600">
          <Unplug className="mt-0.5 h-5 w-5" />
          <div>
            <p className="font-medium text-slate-800">No client found yet</p>
            <p className="text-sm">
              Complete the embedded signup flow below and the account details will appear here automatically.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WhatsAppEmbeddedSignup() {
  const [sdkReady, setSdkReady] = useState(false);
  const [sdkResponse, setSdkResponse] = useState(null);
  const [sessionEvent, setSessionEvent] = useState(null);
  const [authCode, setAuthCode] = useState(null);
  const [backendResponse, setBackendResponse] = useState(null);
  const [backendError, setBackendError] = useState("");
  const [loadingBackend, setLoadingBackend] = useState(false);
  const [loadingClient, setLoadingClient] = useState(true);
  const [clientError, setClientError] = useState("");
  const [currentClient, setCurrentClient] = useState(null);

  const backendCalledRef = useRef(false);
  const [integrationIds, setIntegrationIds] = useState(initialIntegrationIds);

  const fetchMyClient = useCallback(async () => {
    const token = getCookie("authToken");

    setLoadingClient(true);
    setClientError("");

    try {
      const res = await fetch(`${API_URL}/meta/my-whatsapp-client`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      });

      const data = await res.json();

      if (res.status === 404) {
        setCurrentClient(null);
        return;
      }

      if (!res.ok) {
        throw new Error(data?.message || "Unable to fetch WhatsApp client");
      }

      setCurrentClient(data.client || null);
    } catch (error) {
      setCurrentClient(null);
      setClientError(error.message || "Unable to fetch WhatsApp client");
    } finally {
      setLoadingClient(false);
    }
  }, []);

  const sendToBackend = useCallback(async (code, ids) => {
    if (!ids.waba_id || !ids.phone_number_id || !ids.business_id) {
      return;
    }

    if (backendCalledRef.current) return;
    backendCalledRef.current = true;
    setLoadingBackend(true);
    setBackendError("");
    setBackendResponse(null);

    try {
      const token = getCookie("authToken");

      const res = await fetch(`${API_URL}/meta/onboard-whatsapp`, {
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

      if (!res.ok) {
        throw new Error(data?.message || "Failed to connect WhatsApp");
      }

      setBackendResponse(data);
      setCurrentClient(data.client || null);
    } catch (error) {
      backendCalledRef.current = false;
      setBackendError(error.message || "Failed to connect WhatsApp");
    } finally {
      setLoadingBackend(false);
    }
  }, []);

  useEffect(() => {
    fetchMyClient();
  }, [fetchMyClient]);

  useEffect(() => {
    if (
      authCode &&
      integrationIds.waba_id &&
      integrationIds.phone_number_id &&
      integrationIds.business_id
    ) {
      sendToBackend(authCode, integrationIds);
    }
  }, [authCode, integrationIds, sendToBackend]);

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
          setBackendError(
            `Signup was cancelled at step: ${data.data?.current_step || "unknown"}`
          );
        }

        if (data.event === "ERROR") {
          setBackendError(data.data?.error_message || "Signup failed");
          backendCalledRef.current = false;
        }
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const fbLoginCallback = useCallback((response) => {
    setSdkResponse(response);

    if (response?.authResponse?.code) {
      setAuthCode(response.authResponse.code);
      setBackendError("");
      backendCalledRef.current = false;
    }
  }, []);

  const launchWhatsAppSignup = () => {
    if (!sdkReady) {
      setBackendError("Facebook SDK is still loading. Please try again in a moment.");
      return;
    }

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

  const resolvedClient = backendResponse?.client || currentClient;
  const eventTone = getEventTone(sessionEvent?.event);
  const connectionReady =
    Boolean(authCode) &&
    Boolean(integrationIds.waba_id) &&
    Boolean(integrationIds.phone_number_id) &&
    Boolean(integrationIds.business_id);

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.18),_transparent_24%),linear-gradient(180deg,_#f8fafc_0%,_#eef6ff_45%,_#f8fafc_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[36px] border border-white/60 bg-slate-950 px-6 py-8 text-white shadow-[0_30px_120px_-40px_rgba(15,23,42,0.8)] sm:px-8 lg:px-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(16,185,129,0.24),_transparent_25%),radial-gradient(circle_at_80%_0%,_rgba(59,130,246,0.24),_transparent_26%)]" />
          <div className="relative grid gap-8 lg:grid-cols-[1.35fr_0.9fr]">
            <div>
              <StatusPill tone="info">
                <Sparkles className="h-3.5 w-3.5" />
                Embedded WhatsApp onboarding
              </StatusPill>

              <h1 className="mt-5 max-w-2xl text-3xl font-semibold leading-tight text-white sm:text-4xl">
                Connect your WhatsApp Business account and watch the setup status unfold in real time.
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                This screen now highlights each stage of the Meta signup flow, the saved business connection, and the backend onboarding result in a cleaner dashboard UI.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={launchWhatsAppSignup}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                >
                  <MessageSquareShare className="h-4 w-4" />
                  Connect with Facebook
                </button>

                <button
                  onClick={fetchMyClient}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh client
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <SummaryCard
                icon={ShieldCheck}
                label="SDK"
                value={sdkReady ? "Facebook SDK ready" : "Loading Facebook SDK"}
                hint="The embedded signup button becomes usable once the Facebook SDK is initialized."
                tone={sdkReady ? "success" : "warning"}
              />
              <SummaryCard
                icon={Store}
                label="Signup Event"
                value={sessionEvent?.event || "Waiting for activity"}
                hint="Meta embedded signup events appear here after the popup flow starts."
                tone={eventTone}
              />
              <SummaryCard
                icon={BadgeCheck}
                label="Backend"
                value={
                  loadingBackend
                    ? "Saving connection..."
                    : backendResponse?.connected
                      ? "WhatsApp connected"
                      : "Awaiting onboarding"
                }
                hint="Once Meta returns the business IDs, the backend stores the WhatsApp client automatically."
                tone={loadingBackend ? "warning" : backendResponse?.connected ? "success" : "neutral"}
              />
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-8">
            <ConnectionCard
              client={resolvedClient}
              loading={loadingClient}
              onRefresh={fetchMyClient}
            />

            <div className="rounded-[28px] border border-slate-200/70 bg-white/85 p-6 shadow-[0_18px_60px_-28px_rgba(15,23,42,0.28)] backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Setup Progress
                  </p>
                  <h2 className="text-2xl font-semibold text-slate-900">
                    Signup flow checklist
                  </h2>
                </div>
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-3">
                <StepRow
                  title="Authenticate with Meta"
                  subtitle={authCode ? "OAuth code captured successfully." : "Start the Facebook popup to retrieve the code."}
                  done={Boolean(authCode)}
                />
                <StepRow
                  title="Collect business identifiers"
                  subtitle={
                    connectionReady
                      ? "Business, WABA, and phone number IDs are ready."
                      : "Waiting for the embedded signup finish event."
                  }
                  done={connectionReady}
                />
                <StepRow
                  title="Persist in backend"
                  subtitle={
                    backendResponse?.connected
                      ? "The WhatsApp client is stored and available."
                      : loadingBackend
                        ? "Saving the account to your backend..."
                        : "The backend call will run automatically after signup completes."
                  }
                  done={Boolean(backendResponse?.connected)}
                />
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <InfoItem label="Business ID" value={integrationIds.business_id} />
                <InfoItem label="WABA ID" value={integrationIds.waba_id} />
                <InfoItem label="Phone Number ID" value={integrationIds.phone_number_id} />
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="rounded-[28px] border border-slate-200/70 bg-white/85 p-6 shadow-[0_18px_60px_-28px_rgba(15,23,42,0.28)] backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Response UI
                  </p>
                  <h2 className="text-2xl font-semibold text-slate-900">
                    Backend onboarding result
                  </h2>
                </div>
              </div>

              {loadingBackend ? (
                <div className="mt-6 flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-5 text-slate-600">
                  <LoaderCircle className="h-5 w-5 animate-spin" />
                  Connecting your WhatsApp Business account...
                </div>
              ) : backendResponse ? (
                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                    <div className="flex items-center gap-2 text-emerald-700">
                      <BadgeCheck className="h-5 w-5" />
                      <p className="font-semibold">WhatsApp connected successfully</p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-emerald-800">
                      The account is now stored in your backend and ready for templates, messages, and webhook activity.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <InfoItem label="WABA Name" value={backendResponse.client?.waba_name} />
                    <InfoItem label="Display Number" value={backendResponse.client?.display_phone_number} />
                    <InfoItem label="Verified Name" value={backendResponse.client?.verified_name} />
                    <InfoItem label="Phone Status" value={backendResponse.client?.phone_verification_status} />
                    <InfoItem label="Webhook" value={formatFlag(backendResponse.client?.webhook_subscribed)} />
                    <InfoItem label="Messaging" value={formatFlag(backendResponse.client?.messaging_enabled)} />
                  </div>
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-5 text-sm leading-6 text-slate-600">
                  Start the embedded signup flow and the response will appear here as a polished summary instead of raw console logs.
                </div>
              )}

              {backendError && (
                <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
                  <div className="flex items-center gap-2 font-semibold">
                    <AlertCircle className="h-5 w-5" />
                    Connection issue
                  </div>
                  <p className="mt-2 text-sm leading-6">{backendError}</p>
                </div>
              )}

              {clientError && !loadingClient && (
                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
                  <div className="flex items-center gap-2 font-semibold">
                    <AlertCircle className="h-5 w-5" />
                    Saved client could not be loaded
                  </div>
                  <p className="mt-2 text-sm leading-6">{clientError}</p>
                </div>
              )}
            </div>

            <div className="rounded-[28px] border border-slate-200/70 bg-white/85 p-6 shadow-[0_18px_60px_-28px_rgba(15,23,42,0.28)] backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-violet-100 p-3 text-violet-700">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Live Details
                  </p>
                  <h2 className="text-2xl font-semibold text-slate-900">
                    Activity snapshots
                  </h2>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-slate-900">Latest signup event</p>
                    <StatusPill tone={eventTone}>{sessionEvent?.event || "No event yet"}</StatusPill>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    {sessionEvent?.event === "FINISH"
                      ? "Meta returned the required business IDs and the backend onboarding started."
                      : sessionEvent?.event === "ERROR"
                        ? sessionEvent?.data?.error_message || "The embedded signup flow reported an error."
                        : sessionEvent?.event === "CANCEL"
                          ? `The flow was cancelled at ${sessionEvent?.data?.current_step || "an unknown step"}.`
                          : "Once the popup flow starts, the latest embedded signup event will appear here."}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-slate-900">Facebook login result</p>
                    <StatusPill tone={sdkResponse?.status === "connected" ? "success" : "neutral"}>
                      {sdkResponse?.status || "Idle"}
                    </StatusPill>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    {sdkResponse?.authResponse?.code
                      ? "OAuth code captured. The next step is handled automatically."
                      : "No OAuth code received yet. Use the connect button to begin."}
                  </p>
                </div>

                <details className="group rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <summary className="cursor-pointer list-none font-medium text-slate-800">
                    Debug payloads
                  </summary>
                  <div className="mt-4 space-y-4">
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        SDK Response
                      </p>
                      <pre className="overflow-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-200">
                        {JSON.stringify(sdkResponse, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Embedded Signup Event
                      </p>
                      <pre className="overflow-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-200">
                        {JSON.stringify(sessionEvent, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Backend Response
                      </p>
                      <pre className="overflow-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-200">
                        {JSON.stringify(backendResponse, null, 2)}
                      </pre>
                    </div>
                  </div>
                </details>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
