export const templateCategories = [
  {
    value: "MARKETING",
    label: "Marketing",
    description: "Promotions, launches, upsells, and campaign announcements.",
  },
  {
    value: "UTILITY",
    label: "Utility",
    description: "Order updates, reminders, and service notifications.",
  },
  {
    value: "AUTHENTICATION",
    label: "Authentication",
    description: "One-time passwords and secure verification messages.",
  },
];

export const templateLanguages = [
  { value: "en_US", label: "English (US)" },
  { value: "en_GB", label: "English (UK)" },
  { value: "hi", label: "Hindi" },
  { value: "mr", label: "Marathi" },
  { value: "ta", label: "Tamil" },
];

export const headerTypes = [
  { value: "TEXT", label: "Text header" },
  { value: "IMAGE", label: "Image header" },
  { value: "VIDEO", label: "Video header" },
  { value: "DOCUMENT", label: "Document header" },
];

export const buttonTypes = [
  { value: "QUICK_REPLY", label: "Quick reply" },
  { value: "URL", label: "Visit website" },
  { value: "PHONE_NUMBER", label: "Call phone number" },
];

export const reviewChecklist = [
  "Use a lowercase template name with underscores instead of spaces.",
  "Keep the body specific and avoid salesy wording for utility flows.",
  "Sample values help reviewers understand variables like {{1}} and {{2}}.",
  "Add only the buttons that are needed for the user action.",
];

export const initialTemplateState = {
  name: "festival_offer_launch",
  category: "MARKETING",
  language: "en_US",
  allowCategoryChange: false,
  includeHeader: true,
  headerType: "TEXT",
  headerText: "Early access opens today",
  body:
    "Hi {{1}}, your private offer is ready. Use code {{2}} before {{3}} to unlock the deal.",
  footer: "Reply STOP to opt out.",
  buttons: [
    {
      id: 1,
      type: "QUICK_REPLY",
      text: "Claim offer",
      url: "",
      phoneNumber: "",
    },
    {
      id: 2,
      type: "URL",
      text: "View collection",
      url: "https://example.com/offers/{{2}}",
      phoneNumber: "",
    },
  ],
  sampleValues: {
    1: "Riya",
    2: "APRIL20",
    3: "30 Apr",
  },
};

export const extractVariableKeys = (parts) => {
  const matches = new Set();

  parts.forEach((part) => {
    const value = typeof part === "string" ? part : "";
    const tokens = value.match(/{{\s*\d+\s*}}/g) || [];

    tokens.forEach((token) => {
      const key = token.replace(/[^\d]/g, "");

      if (key) {
        matches.add(key);
      }
    });
  });

  return Array.from(matches).sort((left, right) => Number(left) - Number(right));
};

export const applyVariableSamples = (text, sampleValues = {}) => {
  if (!text) return "";

  return text.replace(/{{\s*(\d+)\s*}}/g, (_, key) => sampleValues[key] || `{{${key}}}`);
};

export const buildTemplatePayload = (template) => {
  const components = [];

  if (template.includeHeader) {
    components.push(
      template.headerType === "TEXT"
        ? {
            type: "HEADER",
            format: "TEXT",
            text: template.headerText,
          }
        : {
            type: "HEADER",
            format: template.headerType,
            example: {
              header_handle: ["sample-media-asset"],
            },
          }
    );
  }

  components.push({
    type: "BODY",
    text: template.body,
    ...(Object.keys(template.sampleValues).length
      ? {
          example: {
            body_text: [
              extractVariableKeys([template.body]).map(
                (key) => template.sampleValues[key] || `example_${key}`
              ),
            ],
          },
        }
      : {}),
  });

  if (template.footer.trim()) {
    components.push({
      type: "FOOTER",
      text: template.footer,
    });
  }

  if (template.buttons.length > 0) {
    components.push({
      type: "BUTTONS",
      buttons: template.buttons.map((button) => {
        if (button.type === "URL") {
          return {
            type: "URL",
            text: button.text,
            url: button.url,
          };
        }

        if (button.type === "PHONE_NUMBER") {
          return {
            type: "PHONE_NUMBER",
            text: button.text,
            phone_number: button.phoneNumber,
          };
        }

        return {
          type: "QUICK_REPLY",
          text: button.text,
        };
      }),
    });
  }

  return {
    name: template.name.trim().toLowerCase(),
    category: template.category,
    language: template.language,
    allow_category_change: template.allowCategoryChange,
    components,
  };
};

export const getTemplateComponent = (template, componentType) =>
  template?.components?.find((component) => component.type === componentType);

export const getTemplateBodyPreview = (template) =>
  getTemplateComponent(template, "BODY")?.text || "No body content";

export const getTemplateStatusTone = (status) => {
  if (status === "APPROVED") return "bg-emerald-100 text-emerald-700";
  if (status === "REJECTED") return "bg-rose-100 text-rose-700";
  if (status === "DRAFT") return "bg-sky-100 text-sky-700";
  return "bg-amber-100 text-amber-700";
};
