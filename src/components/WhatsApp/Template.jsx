import { useEffect, useMemo, useState } from "react";
import TemplateBuilderHeader from "./templateBuilder/TemplateBuilderHeader";
import TemplateConfigurationPanel from "./templateBuilder/TemplateConfigurationPanel";
import TemplateComposerPanel from "./templateBuilder/TemplateComposerPanel";
import TemplatePreviewPanel from "./templateBuilder/TemplatePreviewPanel";
import TemplateLibraryPanel from "./templateBuilder/TemplateLibraryPanel";
import {
  buildTemplatePayload,
  extractVariableKeys,
  initialTemplateState,
  templateCategories,
} from "./templateBuilder/templateBuilderData";
import whatsappTemplatesService from "../../Services/whatsappServices";

function Template() {
  const [template, setTemplate] = useState(initialTemplateState);
  const [templates, setTemplates] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [templatesError, setTemplatesError] = useState("");
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    const loadTemplates = async () => {
      setLoadingTemplates(true);
      setTemplatesError("");

      try {
        const response = await whatsappTemplatesService.getTemplates();
        const resolvedTemplates = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.templates)
            ? response.templates
            : Array.isArray(response)
              ? response
              : [];

        setTemplates(resolvedTemplates);
      } catch (error) {
        setTemplatesError(error.message || "Failed to load templates");
      } finally {
        setLoadingTemplates(false);
      }
    };

    loadTemplates();
  }, []);

  const variableKeys = useMemo(
    () =>
      extractVariableKeys([
        template.headerText,
        template.body,
        template.footer,
        ...template.buttons.flatMap((button) => [
          button.text,
          button.url,
          button.phoneNumber,
        ]),
      ]),
    [template]
  );

  const activeSections = useMemo(
    () =>
      [template.includeHeader, Boolean(template.footer.trim()), template.buttons.length > 0].filter(Boolean).length,
    [template.includeHeader, template.footer, template.buttons.length]
  );

  const handleFieldChange = (field, value) => {
    setTemplate((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleToggleSection = (field) => {
    setTemplate((current) => {
      if (field === "includeHeader") {
        return {
          ...current,
          includeHeader: !current.includeHeader,
          headerType: !current.includeHeader ? current.headerType : "TEXT",
        };
      }

      if (field === "footer") {
        return {
          ...current,
          footer: current.footer ? "" : "Reply STOP to opt out.",
        };
      }

      return current;
    });
  };

  const handleButtonChange = (index, field, value) => {
    setTemplate((current) => ({
      ...current,
      buttons: current.buttons.map((button, buttonIndex) =>
        buttonIndex === index
          ? {
              ...button,
              [field]: value,
            }
          : button
      ),
    }));
  };

  const handleAddButton = () => {
    setTemplate((current) => {
      if (current.buttons.length >= 3) {
        return current;
      }

      return {
        ...current,
        buttons: [
          ...current.buttons,
          {
            id: Date.now(),
            type: "QUICK_REPLY",
            text: "Talk to us",
            url: "",
            phoneNumber: "",
          },
        ],
      };
    });
  };

  const handleRemoveButton = (index) => {
    setTemplate((current) => ({
      ...current,
      buttons: current.buttons.filter((_, buttonIndex) => buttonIndex !== index),
    }));
  };

  const handleSampleChange = (key, value) => {
    setTemplate((current) => ({
      ...current,
      sampleValues: {
        ...current.sampleValues,
        [key]: value,
      },
    }));
  };

  const copyPayloadToClipboard = async () => {
    try {
      const payload = buildTemplatePayload(template);
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      setStatusMessage({
        tone: "success",
        text: "Template payload copied. You can hand this JSON to your backend or Meta API flow.",
      });
    } catch {
      setStatusMessage({
        tone: "error",
        text: "Clipboard access failed. The preview JSON is still visible on the page.",
      });
    }
  };

  const saveDraft = () => {
    if (!template.name.trim() || !template.body.trim()) {
      setStatusMessage({
        tone: "error",
        text: "Template name and body are required before saving a draft.",
      });
      return;
    }

    const payload = buildTemplatePayload(template);
    const categoryLabel =
      templateCategories.find((item) => item.value === template.category)?.label || template.category;

    const draft = {
      id: `draft-${Date.now()}`,
      name: template.name,
      category: template.category,
      categoryLabel,
      language: template.language,
      status: "DRAFT",
      components: payload.components,
      updatedAt: new Date().toISOString(),
      source: "Local draft",
    };

    setDrafts((current) => [draft, ...current]);
    setStatusMessage({
      tone: "success",
      text: "Draft saved locally. The layout mirrors a Meta template builder, but submission is still up to your backend flow.",
    });
  };

  const selectedCategory =
    templateCategories.find((item) => item.value === template.category)?.label || template.category;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.18),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.16),_transparent_26%),linear-gradient(180deg,_#f8fafc_0%,_#f5f8ff_46%,_#eefaf6_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <TemplateBuilderHeader
          templateName={template.name}
          categoryLabel={selectedCategory}
          activeSections={activeSections}
          variableCount={variableKeys.length}
          templateCount={templates.length + drafts.length}
          onSaveDraft={saveDraft}
          onCopyPayload={copyPayloadToClipboard}
          statusMessage={statusMessage}
        />

        <div className="grid gap-8 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-8">
            <TemplateConfigurationPanel
              template={template}
              onFieldChange={handleFieldChange}
            />

            <TemplateComposerPanel
              template={template}
              variableKeys={variableKeys}
              onFieldChange={handleFieldChange}
              onToggleSection={handleToggleSection}
              onButtonChange={handleButtonChange}
              onAddButton={handleAddButton}
              onRemoveButton={handleRemoveButton}
              onSampleChange={handleSampleChange}
            />
          </div>

          <div className="space-y-8">
            <TemplatePreviewPanel
              template={template}
              variableKeys={variableKeys}
            />

            <TemplateLibraryPanel
              templates={templates}
              drafts={drafts}
              loading={loadingTemplates}
              error={templatesError}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Template;
