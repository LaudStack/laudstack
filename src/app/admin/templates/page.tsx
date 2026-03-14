"use client";
/*
 * LaudStack Admin — Email Templates Management
 * Manage email notification templates sent to users and founders
 */

import { useState } from "react";
import {
  Mail, Plus, Edit2, Eye, Copy, CheckCircle,
  XCircle, AlertTriangle, FileText, Trash2,
} from "lucide-react";
import { toast } from "sonner";

type EmailTemplate = {
  id: number;
  name: string;
  subject: string;
  trigger: string;
  recipient: "user" | "founder" | "admin";
  isActive: boolean;
  lastEdited: string;
  preview: string;
};

const MOCK_TEMPLATES: EmailTemplate[] = [
  {
    id: 1, name: "Welcome Email", subject: "Welcome to LaudStack! 🎉",
    trigger: "User registration", recipient: "user", isActive: true,
    lastEdited: "2026-01-15",
    preview: "Welcome to LaudStack! We're thrilled to have you join our community of 12,000+ professionals...",
  },
  {
    id: 2, name: "Tool Submission Received", subject: "We received your tool submission",
    trigger: "Tool submission created", recipient: "founder", isActive: true,
    lastEdited: "2026-01-20",
    preview: "Thank you for launching your tool to LaudStack. Our team will review your listing within 3-5 business days...",
  },
  {
    id: 3, name: "Tool Approved", subject: "Your tool has been approved! 🚀",
    trigger: "Tool submission approved", recipient: "founder", isActive: true,
    lastEdited: "2026-02-01",
    preview: "Great news! Your tool has been approved and is now live on LaudStack. Start sharing your listing to get more reviews...",
  },
  {
    id: 4, name: "Tool Rejected", subject: "Update on your tool submission",
    trigger: "Tool submission rejected", recipient: "founder", isActive: true,
    lastEdited: "2026-02-01",
    preview: "Thank you for launching your tool. After careful review, we were unable to approve it at this time...",
  },
  {
    id: 5, name: "New Review Notification", subject: "New review on your tool",
    trigger: "Review posted on claimed tool", recipient: "founder", isActive: true,
    lastEdited: "2026-02-10",
    preview: "Someone just left a review on your tool. Log in to LaudStack to read the review and respond...",
  },
  {
    id: 6, name: "Founder Verified", subject: "Your founder status has been verified ✓",
    trigger: "Founder status verified", recipient: "founder", isActive: true,
    lastEdited: "2026-02-15",
    preview: "Congratulations! Your founder status has been verified. You now have access to all founder features on LaudStack...",
  },
  {
    id: 7, name: "Weekly Digest", subject: "Your weekly LaudStack digest",
    trigger: "Weekly cron job", recipient: "user", isActive: false,
    lastEdited: "2026-01-05",
    preview: "Here's what's trending on LaudStack this week. Discover new products, read top reviews, and stay ahead...",
  },
  {
    id: 8, name: "Admin: New Submission Alert", subject: "[Admin] New tool submission received",
    trigger: "Tool submission created", recipient: "admin", isActive: true,
    lastEdited: "2026-01-15",
    preview: "A new tool submission has been received and is awaiting your review. Log in to the admin panel to review it...",
  },
];

const RECIPIENT_COLORS: Record<string, string> = {
  user:    "bg-blue-100 text-blue-700",
  founder: "bg-purple-100 text-purple-700",
  admin:   "bg-amber-100 text-amber-700",
};

function TemplateCard({
  template,
  onToggle,
  onEdit,
  onPreview,
  onDuplicate,
}: {
  template: EmailTemplate;
  onToggle: (id: number) => void;
  onEdit: (id: number) => void;
  onPreview: (template: EmailTemplate) => void;
  onDuplicate: (id: number) => void;
}) {
  return (
    <div className={`bg-white rounded-xl border ${template.isActive ? "border-slate-200" : "border-slate-100 opacity-70"} p-5 hover:shadow-sm transition-shadow`}>
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${template.isActive ? "bg-blue-50" : "bg-slate-100"}`}>
          <Mail className={`w-5 h-5 ${template.isActive ? "text-blue-600" : "text-slate-400"}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-slate-900 text-sm">{template.name}</h3>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${RECIPIENT_COLORS[template.recipient]}`}>
              → {template.recipient}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${template.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
              {template.isActive ? "Active" : "Inactive"}
            </span>
          </div>
          <p className="text-xs font-medium text-slate-600 mt-0.5">{template.subject}</p>
          <p className="text-xs text-slate-400 mt-1 line-clamp-1">{template.preview}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
              Trigger: {template.trigger}
            </span>
            <span className="text-[10px] text-slate-400">
              Last edited {new Date(template.lastEdited).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => onPreview(template)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            title="Preview"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDuplicate(template.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title="Duplicate"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(template.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onToggle(template.id)}
            className={`p-1.5 rounded-lg transition-colors ${template.isActive ? "text-green-600 hover:bg-green-50" : "text-slate-400 hover:bg-slate-100"}`}
            title={template.isActive ? "Deactivate" : "Activate"}
          >
            {template.isActive ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

function PreviewModal({ template, onClose }: { template: EmailTemplate; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="font-bold text-slate-900">{template.name}</h2>
            <p className="text-xs text-slate-500 mt-0.5">Email preview</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
            <XCircle className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          {/* Email header */}
          <div className="bg-slate-900 rounded-t-xl p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center">
              <Mail className="w-4 h-4 text-slate-950" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">LaudStack</p>
              <p className="text-slate-400 text-xs">noreply@laudstack.com</p>
            </div>
          </div>
          {/* Email body */}
          <div className="border border-t-0 border-slate-200 rounded-b-xl p-6">
            <div className="mb-4 pb-4 border-b border-slate-100">
              <p className="text-xs text-slate-500">Subject</p>
              <p className="font-semibold text-slate-900 mt-0.5">{template.subject}</p>
            </div>
            <div className="space-y-3">
              <p className="text-sm text-slate-700 leading-relaxed">{template.preview}</p>
              <p className="text-sm text-slate-500 leading-relaxed">
                [Full email body would be rendered here. Use the editor to customize the complete template with variables like {"{user_name}"}, {"{tool_name}"}, {"{action_url}"}, etc.]
              </p>
              <div className="mt-4">
                <button className="px-4 py-2 bg-amber-400 text-slate-950 rounded-lg text-sm font-bold">
                  View on LaudStack →
                </button>
              </div>
            </div>
          </div>
          {/* Meta */}
          <div className="mt-4 bg-slate-50 rounded-lg p-3 grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-slate-500">Trigger</p>
              <p className="text-xs font-semibold text-slate-700 mt-0.5">{template.trigger}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Recipient</p>
              <p className="text-xs font-semibold text-slate-700 mt-0.5 capitalize">{template.recipient}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-slate-100">
          <button onClick={onClose}
            className="flex-1 h-9 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            Close
          </button>
          <button
            onClick={() => { toast.info("Template editor coming soon"); onClose(); }}
            className="flex-1 h-9 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-lg text-sm font-bold transition-colors">
            Edit Template
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminTemplates() {
  const [templates, setTemplates] = useState<EmailTemplate[]>(MOCK_TEMPLATES);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [filter, setFilter] = useState<"all" | "user" | "founder" | "admin">("all");

  const toggleTemplate = (id: number) => {
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, isActive: !t.isActive } : t));
    toast.success("Template status updated");
  };

  const duplicateTemplate = (id: number) => {
    const original = templates.find(t => t.id === id);
    if (!original) return;
    const copy: EmailTemplate = {
      ...original,
      id: Math.max(...templates.map(t => t.id)) + 1,
      name: `${original.name} (Copy)`,
      isActive: false,
      lastEdited: new Date().toISOString().split("T")[0],
    };
    setTemplates(prev => [...prev, copy]);
    toast.success("Template duplicated");
  };

  const filtered = filter === "all" ? templates : templates.filter(t => t.recipient === filter);

  const activeCount = templates.filter(t => t.isActive).length;

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Email Templates</h1>
          <p className="text-sm text-slate-500 mt-0.5">{templates.length} templates — {activeCount} active</p>
        </div>
        <button
          onClick={() => toast.info("Template editor coming soon")}
          className="flex items-center gap-2 px-4 h-9 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-lg text-sm font-bold transition-colors"
        >
          <Plus className="w-4 h-4" /> New Template
        </button>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <FileText className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700">
          Email templates are triggered automatically based on platform events. Customize the subject and body for each template.
          <strong className="ml-1">Note: Full template editor integration is pending — currently showing template inventory.</strong>
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 w-fit">
        {(["all", "user", "founder", "admin"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 h-7 rounded-md text-xs font-semibold capitalize transition-colors ${
              filter === f ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {f === "all" ? "All" : `→ ${f}`}
          </button>
        ))}
      </div>

      {/* Templates list */}
      <div className="space-y-3">
        {filtered.map(template => (
          <TemplateCard
            key={template.id}
            template={template}
            onToggle={toggleTemplate}
            onEdit={(id) => toast.info("Template editor coming soon")}
            onPreview={setPreviewTemplate}
            onDuplicate={duplicateTemplate}
          />
        ))}
        {filtered.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <Mail className="w-10 h-10 mx-auto mb-3 text-slate-200" />
            <p className="text-slate-500 font-medium">No templates found</p>
          </div>
        )}
      </div>

      {previewTemplate && (
        <PreviewModal template={previewTemplate} onClose={() => setPreviewTemplate(null)} />
      )}
    </div>
  );
}
