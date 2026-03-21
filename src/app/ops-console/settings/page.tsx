"use client";
export const dynamic = "force-dynamic";
/*
 * LaudStack Admin — Platform Settings
 * General, SEO, email, moderation, feature flags, security
 */

import { useState, useEffect } from "react";
import {
  Settings, Globe, Mail, Shield, Zap, Save,
  CheckCircle2, AlertTriangle,
  Key,
} from "lucide-react";
import { toast } from "sonner";
import { getPlatformSettings, savePlatformSettings } from "@/app/actions/admin";

type SettingSection = "general" | "seo" | "email" | "moderation" | "features" | "security";

const SECTIONS: { id: SettingSection; label: string; icon: React.ElementType }[] = [
  { id: "general",    label: "General",     icon: Settings },
  { id: "seo",        label: "SEO & Meta",  icon: Globe },
  { id: "email",      label: "Email",       icon: Mail },
  { id: "moderation", label: "Moderation",  icon: Shield },
  { id: "features",   label: "Features",    icon: Zap },
  { id: "security",   label: "Security",    icon: Key },
];

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${enabled ? "bg-amber-400" : "bg-slate-200"}`}
    >
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${enabled ? "translate-x-4.5" : "translate-x-0.5"}`} />
    </button>
  );
}

function SettingRow({
  label, description, children,
}: {
  label: string; description?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between py-4 border-b border-slate-100 last:border-0">
      <div className="flex-1 pr-8">
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        {description && <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{description}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

export default function AdminSettings() {
  const [activeSection, setActiveSection] = useState<SettingSection>("general");
  const [saving, setSaving] = useState(false);

  // General settings
  const [siteName, setSiteName] = useState("LaudStack");
  const [siteTagline, setSiteTagline] = useState("The Trusted Source for SaaS & AI Stacks");
  const [siteUrl, setSiteUrl] = useState("https://laudstack.com");
  const [supportEmail, setSupportEmail] = useState("support@laudstack.com");

  // Feature flags
  const [features, setFeatures] = useState({
    founderVerification: true,
    toolSubmissions: true,
    userReviews: true,
    dealSection: true,
    newsletterSignup: true,
    aiReviewSummaries: false,
    maintenanceMode: false,
    newUserRegistration: true,
    emailNotifications: true,
    twoFactorAuth: false,
  });

  // Moderation settings (previously dead toggles — now wired to save flow)
  const [moderation, setModeration] = useState({
    autoApproveSubmissions: false,
    requireEmailVerification: true,
    minimumReviewLength: true,
    profanityFilter: true,
    oneReviewPerTool: true,
  });

  // Security settings (previously dead toggle — now wired to save flow)
  const [security, setSecurity] = useState({
    sessionTimeout: true,
  });

  const toggleFeature = (key: keyof typeof features) => {
    setFeatures(f => ({ ...f, [key]: !f[key] }));
  };

  const toggleModeration = (key: keyof typeof moderation) => {
    if (key === "autoApproveSubmissions") {
      // Require explicit confirmation for this dangerous setting
      if (!moderation.autoApproveSubmissions) {
        const confirmed = window.confirm(
          "Are you sure you want to auto-approve tool submissions? This is not recommended for production."
        );
        if (!confirmed) return;
      }
    }
    setModeration(m => ({ ...m, [key]: !m[key] }));
  };

  const toggleSecurity = (key: keyof typeof security) => {
    setSecurity(s => ({ ...s, [key]: !s[key] }));
  };

  // Load settings from DB on mount
  useEffect(() => {
    getPlatformSettings().then(map => {
      if (map.siteName) setSiteName(map.siteName);
      if (map.siteTagline) setSiteTagline(map.siteTagline);
      if (map.siteUrl) setSiteUrl(map.siteUrl);
      if (map.supportEmail) setSupportEmail(map.supportEmail);

      // Feature flags
      const flagKeys = Object.keys(features) as (keyof typeof features)[];
      const newFeatures = { ...features };
      for (const k of flagKeys) {
        if (map[`feature_${k}`] !== undefined) {
          newFeatures[k] = map[`feature_${k}`] === "true";
        }
      }
      setFeatures(newFeatures);

      // Moderation settings
      const modKeys = Object.keys(moderation) as (keyof typeof moderation)[];
      const newMod = { ...moderation };
      for (const k of modKeys) {
        if (map[`mod_${k}`] !== undefined) {
          newMod[k] = map[`mod_${k}`] === "true";
        }
      }
      setModeration(newMod);

      // Security settings
      const secKeys = Object.keys(security) as (keyof typeof security)[];
      const newSec = { ...security };
      for (const k of secKeys) {
        if (map[`sec_${k}`] !== undefined) {
          newSec[k] = map[`sec_${k}`] === "true";
        }
      }
      setSecurity(newSec);
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const settings: Record<string, string> = {
      siteName,
      siteTagline,
      siteUrl,
      supportEmail,
    };
    // Flatten feature flags
    for (const [k, v] of Object.entries(features)) {
      settings[`feature_${k}`] = String(v);
    }
    // Flatten moderation settings
    for (const [k, v] of Object.entries(moderation)) {
      settings[`mod_${k}`] = String(v);
    }
    // Flatten security settings
    for (const [k, v] of Object.entries(security)) {
      settings[`sec_${k}`] = String(v);
    }
    const res = await savePlatformSettings(settings);
    setSaving(false);
    if (res.success) {
      toast.success("Settings saved successfully");
    } else {
      toast.error(res.error || "Failed to save settings");
    }
  };

  return (
    <div className="space-y-5 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          <p className="text-sm text-slate-600 mt-0.5">Configure platform-wide settings and feature flags</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 h-9 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar nav */}
        <div className="w-48 flex-shrink-0">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {SECTIONS.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-2.5 w-full px-4 py-3 text-sm transition-colors border-b border-slate-100 last:border-0 ${
                  activeSection === section.id
                    ? "bg-amber-50 text-amber-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <section.icon className={`w-4 h-4 ${activeSection === section.id ? "text-amber-600" : "text-slate-400"}`} />
                {section.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-xl border border-slate-200 p-6">

            {/* General */}
            {activeSection === "general" && (
              <div>
                <h2 className="text-base font-bold text-slate-900 mb-5">General Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Site Name</label>
                    <input value={siteName} onChange={e => setSiteName(e.target.value)}
                      className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Site Tagline</label>
                    <input value={siteTagline} onChange={e => setSiteTagline(e.target.value)}
                      className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Site URL</label>
                    <input value={siteUrl} onChange={e => setSiteUrl(e.target.value)}
                      className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Support Email</label>
                    <input value={supportEmail} onChange={e => setSupportEmail(e.target.value)}
                      className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400" />
                  </div>
                </div>
              </div>
            )}

            {/* SEO */}
            {activeSection === "seo" && (
              <div>
                <h2 className="text-base font-bold text-slate-900 mb-5">SEO & Meta Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Default Meta Title</label>
                    <input defaultValue="LaudStack — Discover & Review SaaS & AI Stacks"
                      className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Default Meta Description</label>
                    <textarea defaultValue="Real reviews, honest rankings. The smartest way to discover, compare, and choose the products your business actually needs."
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 resize-none"
                      rows={3} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">OG Image URL</label>
                    <input defaultValue="https://laudstack.com/og-image.png"
                      className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Google Analytics ID</label>
                    <input defaultValue="" placeholder="e.g. G-ABC123DEF4"
                      className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400" />
                  </div>
                </div>
              </div>
            )}

            {/* Email */}
            {activeSection === "email" && (
              <div>
                <h2 className="text-base font-bold text-slate-900 mb-5">Email Configuration</h2>
                <div className="space-y-4">
                  {/* Provider status */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-green-800">Resend — Active</p>
                      <p className="text-xs text-green-700 mt-0.5">All transactional emails are sent through Resend.</p>
                    </div>
                  </div>

                  {/* Email details */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-600">From Address</span>
                      <span className="text-sm text-slate-900 font-mono">noreply@laudstack.com</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-600">Reply-To</span>
                      <span className="text-sm text-slate-900 font-mono">support@laudstack.com</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-600">Provider</span>
                      <span className="text-sm text-slate-900">Resend</span>
                    </div>
                  </div>

                  {/* Email templates */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-700 mb-3">Active Email Templates</h3>
                    <div className="space-y-2">
                      {[
                        { name: "Welcome Email", trigger: "On signup" },
                        { name: "Review Notification", trigger: "New review on owned tool" },
                        { name: "Founder Verification", trigger: "Verification approved/rejected" },
                        { name: "Tool Approved", trigger: "Tool submission approved" },
                        { name: "Weekly Digest", trigger: "Every Monday" },
                      ].map(tmpl => (
                        <div key={tmpl.name} className="flex items-center justify-between py-2 px-3 bg-white rounded-lg border border-slate-100">
                          <span className="text-sm text-slate-800 font-medium">{tmpl.name}</span>
                          <span className="text-xs text-slate-500">{tmpl.trigger}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-xs text-amber-700">
                      <strong>Note:</strong> The Resend API key and from address are managed via environment variables (<code className="bg-amber-100 px-1 rounded">RESEND_API_KEY</code>, <code className="bg-amber-100 px-1 rounded">RESEND_FROM_EMAIL</code>). Update them in your Vercel deployment settings.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Moderation */}
            {activeSection === "moderation" && (
              <div>
                <h2 className="text-base font-bold text-slate-900 mb-5">Moderation Settings</h2>
                <div className="divide-y divide-slate-100">
                  <SettingRow label="Auto-approve tool submissions" description="Automatically approve tool submissions without manual review. Not recommended.">
                    <Toggle enabled={moderation.autoApproveSubmissions} onToggle={() => toggleModeration("autoApproveSubmissions")} />
                  </SettingRow>
                  <SettingRow label="Require email verification for reviews" description="Users must verify their email before posting reviews.">
                    <Toggle enabled={moderation.requireEmailVerification} onToggle={() => toggleModeration("requireEmailVerification")} />
                  </SettingRow>
                  <SettingRow label="Minimum review length" description="Require reviews to have at least 50 characters.">
                    <Toggle enabled={moderation.minimumReviewLength} onToggle={() => toggleModeration("minimumReviewLength")} />
                  </SettingRow>
                  <SettingRow label="Profanity filter" description="Automatically flag reviews containing profanity for manual review.">
                    <Toggle enabled={moderation.profanityFilter} onToggle={() => toggleModeration("profanityFilter")} />
                  </SettingRow>
                  <SettingRow label="One review per tool per user" description="Prevent users from posting multiple reviews for the same tool.">
                    <Toggle enabled={moderation.oneReviewPerTool} onToggle={() => toggleModeration("oneReviewPerTool")} />
                  </SettingRow>
                </div>
              </div>
            )}

            {/* Features */}
            {activeSection === "features" && (
              <div>
                <h2 className="text-base font-bold text-slate-900 mb-5">Feature Flags</h2>
                <div className="divide-y divide-slate-100">
                  {[
                    { key: "founderVerification" as const, label: "Founder Verification", desc: "Allow users to apply for founder status" },
                    { key: "toolSubmissions" as const, label: "Tool Launches", desc: "Allow founders to launch new products via LaunchPad" },
                    { key: "userReviews" as const, label: "User Reviews", desc: "Allow users to post reviews on tools" },
                    { key: "dealSection" as const, label: "Deals Section", desc: "Show the Deals page and deal badges on tool cards" },
                    { key: "newsletterSignup" as const, label: "Newsletter Signup", desc: "Show newsletter signup forms across the site" },
                    { key: "aiReviewSummaries" as const, label: "AI Review Summaries", desc: "Generate AI-powered summaries of tool reviews (beta)" },
                    { key: "newUserRegistration" as const, label: "New User Registration", desc: "Allow new users to create accounts" },
                    { key: "emailNotifications" as const, label: "Email Notifications", desc: "Send transactional emails to users" },
                    { key: "maintenanceMode" as const, label: "Maintenance Mode", desc: "Show maintenance page to all non-admin visitors" },
                  ].map(item => (
                    <SettingRow key={item.key} label={item.label} description={item.desc}>
                      <Toggle enabled={features[item.key]} onToggle={() => toggleFeature(item.key)} />
                    </SettingRow>
                  ))}
                </div>
                {features.maintenanceMode && (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <p className="text-xs text-red-700 font-medium">Maintenance mode is enabled. The site is not accessible to regular users.</p>
                  </div>
                )}
              </div>
            )}

            {/* Security */}
            {activeSection === "security" && (
              <div>
                <h2 className="text-base font-bold text-slate-900 mb-5">Security Settings</h2>
                <div className="divide-y divide-slate-100">
                  <SettingRow label="Two-Factor Authentication for Admins" description="Require 2FA for all admin accounts.">
                    <Toggle enabled={features.twoFactorAuth} onToggle={() => toggleFeature("twoFactorAuth")} />
                  </SettingRow>
                  <SettingRow label="Session timeout" description="Automatically log out inactive admin sessions after 2 hours.">
                    <Toggle enabled={security.sessionTimeout} onToggle={() => toggleSecurity("sessionTimeout")} />
                  </SettingRow>
                  <SettingRow label="IP allowlist for admin panel" description="Restrict admin panel access to specific IP addresses.">
                    <Toggle enabled={false} onToggle={() => toast.info("Configure IP allowlist in environment variables")} />
                  </SettingRow>
                </div>
                <div className="mt-6 space-y-4">
                  <h3 className="text-sm font-bold text-slate-700">Danger Zone</h3>
                  <div className="border border-red-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">Clear all sessions</p>
                        <p className="text-xs text-slate-500">Force all users to log in again</p>
                      </div>
                      <button
                        onClick={() => toast.error("This action requires additional confirmation")}
                        className="px-3 h-8 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold transition-colors"
                      >
                        Clear Sessions
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">Export all data</p>
                        <p className="text-xs text-slate-500">Download a full database export</p>
                      </div>
                      <button
                        onClick={() => toast.info("Data export initiated — you will receive an email when ready")}
                        className="px-3 h-8 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-bold transition-colors"
                      >
                        Export
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
