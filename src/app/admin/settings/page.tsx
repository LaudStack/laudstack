"use client";
/*
 * LaudStack Admin — Platform Settings
 * General, SEO, email, moderation, feature flags
 */

import { useState } from "react";
import {
  Settings, Globe, Mail, Shield, Zap, Bell, Save,
  CheckCircle, AlertTriangle, ToggleLeft, ToggleRight,
  Key, Database, Palette,
} from "lucide-react";
import { toast } from "sonner";

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

  const toggleFeature = (key: keyof typeof features) => {
    setFeatures(f => ({ ...f, [key]: !f[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    toast.success("Settings saved successfully");
  };

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          <p className="text-sm text-slate-500 mt-0.5">Configure platform-wide settings and feature flags</p>
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
                    <input defaultValue="G-XXXXXXXXXX" placeholder="G-XXXXXXXXXX"
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
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">SMTP Host</label>
                    <input defaultValue="smtp.sendgrid.net"
                      className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">SMTP Port</label>
                      <input defaultValue="587"
                        className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">From Name</label>
                      <input defaultValue="LaudStack"
                        className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">From Email</label>
                    <input defaultValue="noreply@laudstack.com"
                      className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400" />
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-xs text-amber-700">
                      <strong>Note:</strong> Email credentials are managed via environment variables for security. Update them in your deployment environment.
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
                    <Toggle enabled={false} onToggle={() => toast.info("This setting requires confirmation")} />
                  </SettingRow>
                  <SettingRow label="Require email verification for reviews" description="Users must verify their email before posting reviews.">
                    <Toggle enabled={true} onToggle={() => {}} />
                  </SettingRow>
                  <SettingRow label="Minimum review length" description="Require reviews to have at least 50 characters.">
                    <Toggle enabled={true} onToggle={() => {}} />
                  </SettingRow>
                  <SettingRow label="Profanity filter" description="Automatically flag reviews containing profanity for manual review.">
                    <Toggle enabled={true} onToggle={() => {}} />
                  </SettingRow>
                  <SettingRow label="One review per tool per user" description="Prevent users from posting multiple reviews for the same tool.">
                    <Toggle enabled={true} onToggle={() => {}} />
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
                    <Toggle enabled={true} onToggle={() => {}} />
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
