"use client";
/*
 * LaudStack Admin — Email Templates
 * Manage email templates stored in the database
 */
import { useState, useEffect, useCallback } from "react";
import {
  Mail, Plus, Eye, Power, Pencil, Copy, Trash2,
  FileText, Loader2, AlertCircle, X, Check,
} from "lucide-react";
import {
  getEmailTemplates,
  toggleEmailTemplate,
  updateEmailTemplate,
  createEmailTemplate,
  deleteEmailTemplate,
} from "@/app/actions/admin";
import { toast } from "sonner";

type EmailTemplate = {
  id: number;
  name: string;
  subject: string;
  trigger: string;
  recipient: "user" | "founder" | "admin";
  isActive: boolean;
  bodyHtml: string | null;
  bodyText: string | null;
  preview: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const RECIPIENT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  user:    { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200" },
  founder: { bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200" },
  admin:   { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
};

// ─── Template Card ─────────────────────────────────────────────────────────

function TemplateCard({
  template,
  onToggle,
  onEdit,
  onPreview,
  onDuplicate,
  onDelete,
}: {
  template: EmailTemplate;
  onToggle: (id: number) => void;
  onEdit: (t: EmailTemplate) => void;
  onPreview: (t: EmailTemplate) => void;
  onDuplicate: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  const rc = RECIPIENT_COLORS[template.recipient] ?? RECIPIENT_COLORS.user;
  return (
    <div className={`bg-white rounded-xl border ${template.isActive ? "border-slate-200" : "border-slate-200 opacity-60"} hover:shadow-sm transition-all`}>
      <div className="flex items-start gap-4 p-4 sm:p-5">
        <div className={`w-10 h-10 rounded-lg ${rc.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
          <Mail className={`w-4 h-4 ${rc.text}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-slate-900 text-sm">{template.name}</h3>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${rc.bg} ${rc.text} border ${rc.border}`}>
              → {template.recipient}
            </span>
            {!template.isActive && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-500 border border-slate-200">
                Disabled
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1 truncate">Subject: {template.subject}</p>
          {template.preview && (
            <p className="text-xs text-slate-400 mt-0.5 truncate">{template.preview}</p>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => onPreview(template)} title="Preview"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onEdit(template)} title="Edit"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onToggle(template.id)} title={template.isActive ? "Disable" : "Enable"}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              template.isActive ? "text-green-500 hover:text-red-500 hover:bg-red-50" : "text-slate-400 hover:text-green-500 hover:bg-green-50"
            }`}>
            <Power className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onDuplicate(template.id)} title="Duplicate"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onDelete(template.id)} title="Delete"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      {/* Meta */}
      <div className="px-4 sm:px-5 pb-4">
        <div className="bg-slate-50 rounded-lg p-3 grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-slate-500">Trigger</p>
            <p className="text-xs font-semibold text-slate-700 mt-0.5">{template.trigger}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Last Updated</p>
            <p className="text-xs font-semibold text-slate-700 mt-0.5">
              {new Date(template.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Preview Modal ─────────────────────────────────────────────────────────

function PreviewModal({ template, onClose }: { template: EmailTemplate; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">Template Preview</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-4 sm:px-6 py-5 space-y-4">
          <div>
            <p className="text-xs text-slate-500 mb-1">Template Name</p>
            <p className="text-sm font-semibold text-slate-900">{template.name}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Subject Line</p>
            <p className="text-sm text-slate-700">{template.subject}</p>
          </div>
          {template.preview && (
            <div>
              <p className="text-xs text-slate-500 mb-1">Preview Text</p>
              <p className="text-sm text-slate-700">{template.preview}</p>
            </div>
          )}
          <div className="bg-slate-50 rounded-lg p-3 grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-slate-500">Trigger</p>
              <p className="text-xs font-semibold text-slate-700 mt-0.5">{template.trigger}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Recipient</p>
              <p className="text-xs font-semibold text-slate-700 mt-0.5 capitalize">{template.recipient}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Status</p>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
              template.isActive ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"
            }`}>
              {template.isActive ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
              {template.isActive ? "Active" : "Disabled"}
            </span>
          </div>
        </div>
        <div className="flex gap-3 px-4 sm:px-6 py-4 border-t border-slate-100">
          <button onClick={onClose}
            className="flex-1 h-9 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Modal ────────────────────────────────────────────────────────────

function EditModal({
  template,
  onClose,
  onSave,
}: {
  template: EmailTemplate | null; // null = create new
  onClose: () => void;
  onSave: () => void;
}) {
  const isNew = !template;
  const [name, setName] = useState(template?.name ?? "");
  const [subject, setSubject] = useState(template?.subject ?? "");
  const [trigger, setTrigger] = useState(template?.trigger ?? "");
  const [recipient, setRecipient] = useState<"user" | "founder" | "admin">(template?.recipient ?? "user");
  const [preview, setPreview] = useState(template?.preview ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || !subject.trim() || !trigger.trim()) {
      toast.error("Name, subject, and trigger are required");
      return;
    }
    setSaving(true);
    try {
      if (isNew) {
        await createEmailTemplate({ name, subject, trigger, recipient, preview: preview || undefined });
        toast.success("Template created");
      } else {
        await updateEmailTemplate(template.id, { name, subject, trigger, recipient, preview: preview || undefined });
        toast.success("Template updated");
      }
      onSave();
      onClose();
    } catch {
      toast.error("Failed to save template");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">{isNew ? "New Template" : "Edit Template"}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-4 sm:px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Template Name *</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Subject Line *</label>
            <input value={subject} onChange={e => setSubject(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Trigger Event *</label>
            <input value={trigger} onChange={e => setTrigger(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Recipient</label>
            <select value={recipient} onChange={e => setRecipient(e.target.value as "user" | "founder" | "admin")}
              className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400">
              <option value="user">User</option>
              <option value="founder">Founder</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Preview Text</label>
            <textarea value={preview} onChange={e => setPreview(e.target.value)} rows={3}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 resize-none" />
          </div>
        </div>
        <div className="flex gap-3 px-4 sm:px-6 py-4 border-t border-slate-100">
          <button onClick={onClose}
            className="flex-1 h-9 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 h-9 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-lg text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            {isNew ? "Create" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

export default function AdminTemplates() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [editTemplate, setEditTemplate] = useState<EmailTemplate | null | undefined>(undefined); // undefined = closed, null = new
  const [filter, setFilter] = useState<"all" | "user" | "founder" | "admin">("all");

  const loadTemplates = useCallback(async () => {
    try {
      const rows = await getEmailTemplates({ recipient: filter === "all" ? undefined : filter });
      setTemplates(rows as EmailTemplate[]);
    } catch {
      toast.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    loadTemplates();
  }, [loadTemplates]);

  const handleToggle = async (id: number) => {
    try {
      const res = await toggleEmailTemplate(id);
      setTemplates(prev => prev.map(t => t.id === id ? { ...t, isActive: res.isActive } : t));
      toast.success(`Template ${res.isActive ? "enabled" : "disabled"}`);
    } catch {
      toast.error("Failed to toggle template");
    }
  };

  const handleDuplicate = async (id: number) => {
    const original = templates.find(t => t.id === id);
    if (!original) return;
    try {
      await createEmailTemplate({
        name: `${original.name} (Copy)`,
        subject: original.subject,
        trigger: original.trigger,
        recipient: original.recipient,
        preview: original.preview ?? undefined,
      });
      toast.success("Template duplicated");
      loadTemplates();
    } catch {
      toast.error("Failed to duplicate template");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this template? This action cannot be undone.")) return;
    try {
      await deleteEmailTemplate(id);
      setTemplates(prev => prev.filter(t => t.id !== id));
      toast.success("Template deleted");
    } catch {
      toast.error("Failed to delete template");
    }
  };

  const activeCount = templates.filter(t => t.isActive).length;

  return (
    <div className="space-y-5 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Email Templates</h1>
          <p className="text-sm text-slate-600 mt-0.5">
            {loading ? "Loading..." : `${templates.length} templates — ${activeCount} active`}
          </p>
        </div>
        <button
          onClick={() => setEditTemplate(null)}
          className="flex items-center gap-2 px-4 h-9 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-lg text-sm font-bold transition-colors"
        >
          <Plus className="w-4 h-4" /> New Template
        </button>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <FileText className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700">
          Email templates are triggered automatically based on platform events. Toggle templates on/off to control which emails are sent.
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
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map(template => (
            <TemplateCard
              key={template.id}
              template={template}
              onToggle={handleToggle}
              onEdit={setEditTemplate}
              onPreview={setPreviewTemplate}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
            />
          ))}
          {templates.length === 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <Mail className="w-10 h-10 mx-auto mb-3 text-slate-200" />
              <p className="text-slate-500 font-medium">No templates found</p>
            </div>
          )}
        </div>
      )}

      {previewTemplate && (
        <PreviewModal template={previewTemplate} onClose={() => setPreviewTemplate(null)} />
      )}

      {editTemplate !== undefined && (
        <EditModal
          template={editTemplate}
          onClose={() => setEditTemplate(undefined)}
          onSave={loadTemplates}
        />
      )}
    </div>
  );
}
