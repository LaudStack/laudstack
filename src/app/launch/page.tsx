"use client";
export const dynamic = "force-dynamic";
/*
 * Tool Launch Flow — LaudStack
 *
 * Multi-step flow for founders to launch a new tool listing.
 * Auth-gated: users must be signed in before reaching this page.
 * Steps:
 *   1. Tool Info      (name, tagline, website, description, logo, launch date)
 *   2. Category       (category, tags)
 *   3. Pricing        (pricing model, plans)
 *   4. Media          (screenshots, demo video)
 *   5. Verification   (ownership proof: DNS, meta tag, or email domain)
 *   6. Review Review Review & Submit Launch Launch
 *
 * Design: Clean white, professional, G2-inspired, amber accent
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Rocket, Globe, Tag, DollarSign, Image as ImageIcon, Eye,
  Shield, CheckCircle2, ArrowRight, ArrowLeft, Plus, Trash2,
  X, AlertCircle, Clock, BadgeCheck, Lock, ChevronRight,
  Loader2, Star, Users, BarChart3
} from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useDbUser } from "@/hooks/useDbUser";
import { submitTool, type ToolFormData } from "@/app/actions/submitTool";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  "AI Writing", "Code Editor", "Design", "Productivity", "Analytics",
  "CRM", "Marketing", "DevTools", "Communication", "Finance",
  "HR & Recruiting", "Project Management", "Security", "Data & BI", "Other",
];

const PRICING_MODELS = [
  { value: "free",        label: "Free",              desc: "Always free, no credit card required" },
  { value: "freemium",    label: "Freemium",           desc: "Free tier + paid upgrades" },
  { value: "paid",        label: "Paid",               desc: "Subscription or one-time purchase" },
  { value: "free_trial",  label: "Free Trial",         desc: "Trial period, then paid" },
  { value: "open_source", label: "Open Source",        desc: "Free & open source" },
  { value: "contact",     label: "Contact for Price",  desc: "Enterprise / custom pricing" },
];

const POPULAR_TAGS = [
  "AI", "Automation", "No-Code", "API", "Collaboration", "Analytics",
  "Open Source", "Mobile", "Integrations", "Real-time", "Security", "B2B",
];

const STEPS = [
  { id: 1, label: "Tool Info",     icon: Globe },
  { id: 2, label: "Category",      icon: Tag },
  { id: 3, label: "Pricing",       icon: DollarSign },
  { id: 4, label: "Media",         icon: ImageIcon },
  { id: 5, label: "Verification",  icon: Shield },
  { id: 6, label: "Review",        icon: Eye },
];

const VERIFY_METHODS = [
  {
    id: "dns",
    label: "DNS TXT Record",
    desc: "Add a TXT record to your domain's DNS settings. Most reliable method.",
    icon: Globe,
    instructions: [
      "Go to your domain registrar's DNS settings",
      'Add a new TXT record with the name "@" or your subdomain',
      'Set the value to: laudstack-verify={YOUR_CODE}',
      "Save and wait up to 24 hours for DNS propagation",
    ],
  },
  {
    id: "meta",
    label: "HTML Meta Tag",
    desc: "Add a meta tag to your website's <head> section. Instant verification.",
    icon: Globe,
    instructions: [
      "Open your website's HTML source or CMS",
      "Add the following tag inside your <head> section:",
      '<meta name="laudstack-site-verification" content="{YOUR_CODE}" />',
      "Deploy the change and click Verify below",
    ],
  },
  {
    id: "email",
    label: "Email Domain Match",
    desc: "Verify using an email address at your tool's domain. Quickest method.",
    icon: BadgeCheck,
    instructions: [
      "Provide an email address at your tool's domain (e.g. you@yourtool.com)",
      "We'll send a verification code to that address",
      "Enter the code below to confirm ownership",
    ],
  },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  features: string;
}

interface FormData {
  name: string;
  tagline: string;
  website: string;
  description: string;
  logo: string;
  launchDate: string;
  category: string;
  tags: string[];
  pricingModel: string;
  plans: PricingPlan[];
  screenshots: string[];
  demoVideo: string;
  verifyMethod: string;
  verifyEmail: string;
  verifyCode: string;
  founderName: string;
  founderRole: string;
  founderBio: string;
  founderLinkedin: string;
  agreedToTerms: boolean;
}

const INITIAL_FORM: FormData = {
  name: "", tagline: "", website: "", description: "", logo: "", launchDate: "",
  category: "", tags: [],
  pricingModel: "", plans: [{ name: "Starter", price: "", period: "month", features: "" }],
  screenshots: [""], demoVideo: "",
  verifyMethod: "meta", verifyEmail: "", verifyCode: "",
  founderName: "", founderRole: "", founderBio: "", founderLinkedin: "",
  agreedToTerms: false,
};

// ─── Shared Styles ────────────────────────────────────────────────────────────

const inputBase = "w-full px-4 py-3 text-sm text-slate-900 bg-white border border-slate-200 rounded-xl outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all placeholder:text-slate-400";
const labelBase = "block text-sm font-semibold text-slate-700 mb-1.5";

function Required() {
  return <span className="text-red-400 ml-0.5">*</span>;
}

// ─── Step 1: Tool Info ────────────────────────────────────────────────────────

function StepToolInfo({ form, setForm }: { form: FormData; setForm: (f: FormData) => void }) {
  const f = (key: keyof FormData, val: string) => setForm({ ...form, [key]: val });
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <label className={labelBase}>Tool Name <Required /></label>
          <input value={form.name} onChange={e => f("name", e.target.value)}
            placeholder="e.g. Notion, Linear, Cursor" className={inputBase} />
        </div>
        <div className="md:col-span-2">
          <label className={labelBase}>Tagline <Required /></label>
          <input value={form.tagline} onChange={e => f("tagline", e.target.value)}
            placeholder="One-line pitch — what does it do?" maxLength={120} className={inputBase} />
          <div className="text-xs text-slate-400 mt-1 text-right">{form.tagline.length}/120</div>
        </div>
        <div>
          <label className={labelBase}>Website URL <Required /></label>
          <input value={form.website} onChange={e => f("website", e.target.value)}
            placeholder="https://yourtool.com" type="url" className={inputBase} />
        </div>
        <div>
          <label className={labelBase}>Logo URL</label>
          <input value={form.logo} onChange={e => f("logo", e.target.value)}
            placeholder="https://yourtool.com/logo.png" className={inputBase} />
        </div>
      </div>
      <div>
        <label className={labelBase}>Description <Required /></label>
        <textarea value={form.description} onChange={e => f("description", e.target.value)}
          placeholder="Describe your tool in detail — key features, use cases, who it's for, and what makes it different from alternatives."
          rows={5} className={`${inputBase} resize-y min-h-[120px] leading-relaxed`} />
        <div className="text-xs text-slate-400 mt-1">
          {form.description.length} chars {form.description.length < 100 ? `(${100 - form.description.length} more recommended)` : "✓"}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={labelBase}>Scheduled Launch Date</label>
          <input type="date" value={form.launchDate} onChange={e => f("launchDate", e.target.value)}
            min={new Date().toISOString().split("T")[0]} className={inputBase} />
          <div className="text-xs text-slate-400 mt-1">
            Set a future date to appear on the <strong>Upcoming Launches</strong> page with a countdown timer. Leave blank to list immediately after admin review.
          </div>
        </div>
      </div>
      {form.logo && (
        <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <img src={form.logo} alt="Logo preview" className="w-10 h-10 object-contain rounded-lg border border-slate-200"
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
          <span className="text-sm text-slate-500">Logo preview</span>
        </div>
      )}
    </div>
  );
}

// ─── Step 2: Category ─────────────────────────────────────────────────────────

function StepCategory({ form, setForm }: { form: FormData; setForm: (f: FormData) => void }) {
  const toggleTag = (tag: string) => {
    const tags = form.tags.includes(tag)
      ? form.tags.filter(t => t !== tag)
      : form.tags.length < 8 ? [...form.tags, tag] : form.tags;
    setForm({ ...form, tags });
  };
  return (
    <div className="flex flex-col gap-7">
      <div>
        <label className={labelBase}>Primary Category <Required /></label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 mt-2">
          {CATEGORIES.map(cat => (
            <button key={cat} type="button" onClick={() => setForm({ ...form, category: cat })}
              className={`px-3 py-2.5 rounded-xl border text-sm font-medium text-left transition-all ${
                form.category === cat
                  ? "border-amber-400 bg-amber-50 text-amber-700 font-semibold"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}>
              {cat}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className={labelBase}>Tags <span className="text-xs font-normal text-slate-400">up to 8</span></label>
        <div className="flex flex-wrap gap-2 mt-2">
          {POPULAR_TAGS.map(tag => (
            <button key={tag} type="button" onClick={() => toggleTag(tag)}
              className={`px-3.5 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                form.tags.includes(tag)
                  ? "border-amber-400 bg-amber-50 text-amber-700"
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"
              }`}>
              {tag}
            </button>
          ))}
        </div>
        {form.tags.length > 0 && (
          <div className="mt-2 text-xs text-slate-500">Selected: {form.tags.join(", ")}</div>
        )}
      </div>
    </div>
  );
}

// ─── Step 3: Pricing ──────────────────────────────────────────────────────────

function StepPricing({ form, setForm }: { form: FormData; setForm: (f: FormData) => void }) {
  const updatePlan = (i: number, key: keyof PricingPlan, val: string) => {
    const plans = form.plans.map((p, idx) => idx === i ? { ...p, [key]: val } : p);
    setForm({ ...form, plans });
  };
  const addPlan = () => form.plans.length < 4 && setForm({ ...form, plans: [...form.plans, { name: "", price: "", period: "month", features: "" }] });
  const removePlan = (i: number) => setForm({ ...form, plans: form.plans.filter((_, idx) => idx !== i) });

  return (
    <div className="flex flex-col gap-7">
      <div>
        <label className={labelBase}>Pricing Model <Required /></label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
          {PRICING_MODELS.map(m => (
            <button key={m.value} type="button" onClick={() => setForm({ ...form, pricingModel: m.value })}
              className={`p-4 rounded-xl border text-left transition-all ${
                form.pricingModel === m.value
                  ? "border-amber-400 bg-amber-50"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}>
              <div className={`text-sm font-bold mb-0.5 ${form.pricingModel === m.value ? "text-amber-700" : "text-slate-900"}`}>{m.label}</div>
              <div className="text-xs text-slate-500">{m.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {["paid", "freemium", "free_trial"].includes(form.pricingModel) && (
        <div>
          <label className={labelBase}>Pricing Plans</label>
          <div className="flex flex-col gap-3 mt-2">
            {form.plans.map((plan, i) => (
              <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Plan {i + 1}</span>
                  {form.plans.length > 1 && (
                    <button type="button" onClick={() => removePlan(i)} className="text-slate-300 hover:text-red-400 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <input value={plan.name} onChange={e => updatePlan(i, "name", e.target.value)}
                    placeholder="Plan name" className={inputBase} />
                  <input value={plan.price} onChange={e => updatePlan(i, "price", e.target.value)}
                    placeholder="Price (e.g. 29)" className={inputBase} />
                  <select value={plan.period} onChange={e => updatePlan(i, "period", e.target.value)}
                    className={inputBase}>
                    <option value="month">/ month</option>
                    <option value="year">/ year</option>
                    <option value="one_time">one-time</option>
                    <option value="free">Free</option>
                  </select>
                </div>
                <input value={plan.features} onChange={e => updatePlan(i, "features", e.target.value)}
                  placeholder="Key features (comma-separated)" className={inputBase} />
              </div>
            ))}
            {form.plans.length < 4 && (
              <button type="button" onClick={addPlan}
                className="flex items-center gap-2 text-sm font-semibold text-amber-600 border border-dashed border-amber-300 rounded-xl px-4 py-3 hover:bg-amber-50 transition-colors">
                <Plus className="w-4 h-4" /> Add another plan
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Step 4: Media ────────────────────────────────────────────────────────────

function StepMedia({ form, setForm }: { form: FormData; setForm: (f: FormData) => void }) {
  const updateScreenshot = (i: number, v: string) =>
    setForm({ ...form, screenshots: form.screenshots.map((s, idx) => idx === i ? v : s) });
  const addScreenshot = () => form.screenshots.length < 5 && setForm({ ...form, screenshots: [...form.screenshots, ""] });
  const removeScreenshot = (i: number) => setForm({ ...form, screenshots: form.screenshots.filter((_, idx) => idx !== i) });

  return (
    <div className="flex flex-col gap-7">
      <div>
        <label className={labelBase}>Screenshot URLs <span className="text-xs font-normal text-slate-400">up to 5</span></label>
        <p className="text-xs text-slate-400 mb-3">Add URLs to screenshots hosted on your site, Imgur, or any public CDN.</p>
        <div className="flex flex-col gap-2.5">
          {form.screenshots.map((s, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input value={s} onChange={e => updateScreenshot(i, e.target.value)}
                placeholder={`Screenshot ${i + 1} URL`} className={inputBase} />
              {form.screenshots.length > 1 && (
                <button type="button" onClick={() => removeScreenshot(i)} className="text-slate-300 hover:text-red-400 transition-colors flex-shrink-0">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          {form.screenshots.length < 5 && (
            <button type="button" onClick={addScreenshot}
              className="flex items-center gap-2 text-sm font-semibold text-amber-600 border border-dashed border-amber-300 rounded-xl px-4 py-3 hover:bg-amber-50 transition-colors">
              <Plus className="w-4 h-4" /> Add screenshot
            </button>
          )}
        </div>
      </div>
      <div>
        <label className={labelBase}>Demo Video URL</label>
        <input value={form.demoVideo} onChange={e => setForm({ ...form, demoVideo: e.target.value })}
          placeholder="https://youtube.com/watch?v=... or https://loom.com/share/..." className={inputBase} />
        <div className="text-xs text-slate-400 mt-1">YouTube, Loom, or Vimeo links are supported</div>
      </div>
      {/* Preview */}
      {form.screenshots.filter(Boolean).length > 0 && (
        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Preview</div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {form.screenshots.filter(Boolean).map((s, i) => (
              <img key={i} src={s} alt={`Screenshot ${i + 1}`}
                className="h-28 w-auto rounded-lg border border-slate-200 object-cover flex-shrink-0"
                onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Step 5: Verification ─────────────────────────────────────────────────────

function StepVerification({ form, setForm }: { form: FormData; setForm: (f: FormData) => void }) {
  const verificationCode = "LS-" + Math.random().toString(36).substring(2, 10).toUpperCase();
  const selectedMethod = VERIFY_METHODS.find(m => m.id === form.verifyMethod) || VERIFY_METHODS[0];

  return (
    <div className="flex flex-col gap-7">
      {/* Intro */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <Shield className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <div className="text-sm font-bold text-blue-800 mb-1">Why we verify ownership</div>
          <p className="text-xs text-blue-600 leading-relaxed">
            LaudStack only allows real tool owners to manage listings. Verification ensures no one can impersonate your brand or claim your tool without proof of ownership. This protects you and builds trust with buyers.
          </p>
        </div>
      </div>

      {/* Method selection */}
      <div>
        <label className={labelBase}>Choose Verification Method <Required /></label>
        <div className="flex flex-col gap-3 mt-2">
          {VERIFY_METHODS.map(method => (
            <button key={method.id} type="button" onClick={() => setForm({ ...form, verifyMethod: method.id })}
              className={`p-4 rounded-xl border text-left transition-all ${
                form.verifyMethod === method.id
                  ? "border-amber-400 bg-amber-50"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}>
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                  form.verifyMethod === method.id ? "border-amber-500 bg-amber-500" : "border-slate-300"
                }`}>
                  {form.verifyMethod === method.id && (
                    <div className="w-full h-full rounded-full bg-white scale-50 transform" />
                  )}
                </div>
                <div>
                  <div className={`text-sm font-bold ${form.verifyMethod === method.id ? "text-amber-700" : "text-slate-900"}`}>
                    {method.label}
                  </div>
                  <div className="text-xs text-slate-500">{method.desc}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl">
        <div className="text-sm font-bold text-slate-700 mb-3">Instructions: {selectedMethod.label}</div>
        <ol className="flex flex-col gap-2">
          {selectedMethod.instructions.map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
              <span className="text-sm text-slate-600 leading-relaxed font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">
                {step.includes("{YOUR_CODE}") ? step.replace("{YOUR_CODE}", verificationCode) : step}
              </span>
            </li>
          ))}
        </ol>

        {form.verifyMethod === "email" && (
          <div className="mt-4 flex flex-col gap-3">
            <div>
              <label className={labelBase}>Your Domain Email <Required /></label>
              <input value={form.verifyEmail} onChange={e => setForm({ ...form, verifyEmail: e.target.value })}
                placeholder={`you@${form.website.replace(/https?:\/\//, "").replace(/\/.*/, "") || "yourtool.com"}`}
                type="email" className={inputBase} />
            </div>
            <div>
              <label className={labelBase}>Verification Code</label>
              <input value={form.verifyCode} onChange={e => setForm({ ...form, verifyCode: e.target.value })}
                placeholder="Enter the 6-digit code from your email" className={inputBase} />
            </div>
          </div>
        )}
      </div>

      {/* Founder info */}
      <div>
        <div className="text-sm font-bold text-slate-700 mb-3">Your Founder Profile</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelBase}>Your Name <Required /></label>
            <input value={form.founderName} onChange={e => setForm({ ...form, founderName: e.target.value })}
              placeholder="Jane Smith" className={inputBase} />
          </div>
          <div>
            <label className={labelBase}>Your Role <Required /></label>
            <input value={form.founderRole} onChange={e => setForm({ ...form, founderRole: e.target.value })}
              placeholder="CEO, Co-founder, Head of Growth..." className={inputBase} />
          </div>
          <div className="md:col-span-2">
            <label className={labelBase}>Short Bio</label>
            <textarea value={form.founderBio} onChange={e => setForm({ ...form, founderBio: e.target.value })}
              placeholder="Brief background — who you are and what you've built..." rows={3}
              className={`${inputBase} resize-y`} />
          </div>
          <div className="md:col-span-2">
            <label className={labelBase}>LinkedIn Profile URL</label>
            <input value={form.founderLinkedin} onChange={e => setForm({ ...form, founderLinkedin: e.target.value })}
              placeholder="https://linkedin.com/in/yourprofile" className={inputBase} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step 6: Review Review Review & Submit Launch Launch ──────────────────────────────────────────────────

function StepReview({ form, setForm }: { form: FormData; setForm: (f: FormData) => void }) {
  const sections = [
    { label: "Tool Info", items: [
      { key: "Name", val: form.name },
      { key: "Tagline", val: form.tagline },
      { key: "Website", val: form.website },
      { key: "Description", val: form.description.substring(0, 120) + (form.description.length > 120 ? "..." : "") },
    ]},
    { label: "Category & Tags", items: [
      { key: "Category", val: form.category },
      { key: "Tags", val: form.tags.join(", ") || "None" },
    ]},
    { label: "Pricing", items: [
      { key: "Model", val: form.pricingModel },
    ]},
    { label: "Verification", items: [
      { key: "Method", val: VERIFY_METHODS.find(m => m.id === form.verifyMethod)?.label || "" },
      { key: "Founder", val: `${form.founderName} — ${form.founderRole}` },
    ]},
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
        <div>
          <div className="text-sm font-bold text-green-800 mb-0.5">Almost there!</div>
          <p className="text-xs text-green-600 leading-relaxed">
            Review your submission below. Our team will verify your ownership and review your listing within 24 hours. You'll receive an email confirmation once approved.
          </p>
        </div>
      </div>

      {sections.map(section => (
        <div key={section.label} className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{section.label}</span>
          </div>
          <div className="divide-y divide-slate-100">
            {section.items.map(item => (
              <div key={item.key} className="flex items-start gap-4 px-4 py-3">
                <span className="text-xs font-semibold text-slate-400 w-24 flex-shrink-0 mt-0.5">{item.key}</span>
                <span className="text-sm text-slate-700 flex-1">{item.val || <span className="text-slate-300 italic">Not provided</span>}</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Terms */}
      <div className="flex items-start gap-3">
        <button type="button" onClick={() => setForm({ ...form, agreedToTerms: !form.agreedToTerms })}
          className={`w-5 h-5 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${
            form.agreedToTerms ? "border-amber-500 bg-amber-500" : "border-slate-300 bg-white"
          }`}>
          {form.agreedToTerms && <CheckCircle2 className="w-3 h-3 text-white" />}
        </button>
        <p className="text-sm text-slate-600 leading-relaxed">
          I confirm that I am the owner or authorized representative of this product, and I agree to LaudStack's{" "}
          <Link href="/terms" className="text-amber-600 hover:text-amber-700 font-semibold">Terms of Service</Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-amber-600 hover:text-amber-700 font-semibold">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}

// ─── Submission Success ───────────────────────────────────────────────────────

function SubmissionSuccess({ form }: { form: FormData }) {
  const router = useRouter();
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 rounded-2xl bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-5">
        <CheckCircle2 className="w-8 h-8 text-green-500" />
      </div>
      <h2 className="text-2xl font-black text-slate-900 mb-3">Submission Received!</h2>
      <p className="text-slate-500 text-base leading-relaxed max-w-md mx-auto mb-6">
        <strong className="text-slate-700">{form.name}</strong> has been sent for review. Our team will verify your ownership and approve your listing within <strong className="text-slate-700">24 hours</strong>.
      </p>
      <div className="flex flex-col gap-3 max-w-xs mx-auto mb-8">
        {[
          "Verification email sent to your address",
          "Listing under review by our team",
          "Founder Dashboard unlocks on approval",
        ].map(item => (
          <div key={item} className="flex items-center gap-2.5 text-sm text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
            {item}
          </div>
        ))}
      </div>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm">
          Go to My Dashboard
          <ArrowRight className="w-4 h-4" />
        </button>
        <button onClick={() => router.push("/")}
          className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-bold px-6 py-3 rounded-xl transition-colors text-sm border border-slate-200">
          Back to Home
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LaunchPage() {
  const router = useRouter();
  const { isAuthenticated, user, loading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { dbUser } = useDbUser();

  // Pre-fill founder name from auth
  useEffect(() => {
    if (!form.founderName) {
      const name = (dbUser?.firstName ? [dbUser.firstName, dbUser.lastName].filter(Boolean).join(' ') : null) || dbUser?.name || user?.user_metadata?.full_name || user?.user_metadata?.name || "";
      if (name) setForm(f => ({ ...f, founderName: name }));
    }
  }, [user, dbUser]);

  // Auth gate
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-slate-300 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div style={{ height: "72px" }} />
        <div className="max-w-[1300px] mx-auto px-6 lg:px-10 py-24">
          <div className="max-w-md mx-auto text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-5">
              <Lock className="w-7 h-7 text-amber-500" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-3">Sign in to Launch Your Tool</h2>
            <p className="text-slate-500 text-base leading-relaxed mb-6">
              You need a LaudStack account to launch a product. It&apos;s free and takes under 2 minutes.
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={() => router.push("/auth/login?redirect=/launch")}
                className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3.5 rounded-xl transition-colors">
                <Rocket className="w-4 h-4" />
                Sign In to Continue
              </button>
              <button onClick={() => router.push("/launchpad")}
                className="text-sm text-slate-500 hover:text-slate-700 transition-colors">
                ← Back to LaunchPad
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const validateStep = () => {
    if (currentStep === 1) {
      if (!form.name.trim()) { toast.error("Tool name is required"); return false; }
      if (!form.tagline.trim()) { toast.error("Tagline is required"); return false; }
      if (!form.website.trim()) { toast.error("Website URL is required"); return false; }
      if (!form.description.trim() || form.description.length < 50) { toast.error("Description must be at least 50 characters"); return false; }
    }
    if (currentStep === 2) {
      if (!form.category) { toast.error("Please select a category"); return false; }
    }
    if (currentStep === 3) {
      if (!form.pricingModel) { toast.error("Please select a pricing model"); return false; }
    }
    if (currentStep === 5) {
      if (!form.founderName.trim()) { toast.error("Your name is required"); return false; }
      if (!form.founderRole.trim()) { toast.error("Your role is required"); return false; }
    }
    if (currentStep === 6) {
      if (!form.agreedToTerms) { toast.error("Please agree to the Terms of Service"); return false; }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (currentStep < STEPS.length) setCurrentStep(s => s + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(s => s - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setSubmitting(true);
    try {
      const result = await submitTool(form as ToolFormData);
      if (result.success) {
        setSubmitted(true);
        toast.success("Tool launched for review! We'll notify you within 24 hours.");
      } else {
        toast.error(result.error || "Submission failed. Please try again.");
      }
    } catch (err) {
      console.error("[handleSubmit]", err);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const progress = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div style={{ height: "72px" }} />

      <div className="max-w-[1300px] mx-auto px-6 lg:px-10 py-10 lg:py-16">
        {submitted ? (
          <SubmissionSuccess form={form} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10">

            {/* ── Sidebar: Step Navigator ── */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <div className="mb-6">
                <Link href="/launchpad" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-4">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to LaunchPad
                </Link>
                <h1 className="text-xl font-black text-slate-900 mb-1">Launch Your Tool</h1>
                <p className="text-sm text-slate-500">Complete all steps to launch your listing</p>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 bg-slate-100 rounded-full mb-6 overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Steps list */}
              <div className="flex flex-col gap-1">
                {STEPS.map(step => {
                  const isCompleted = step.id < currentStep;
                  const isCurrent = step.id === currentStep;
                  return (
                    <div key={step.id}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                        isCurrent ? "bg-amber-50 border border-amber-200" : "border border-transparent"
                      }`}>
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold transition-all ${
                        isCompleted ? "bg-green-500 text-white" :
                        isCurrent ? "bg-amber-400 text-slate-900" :
                        "bg-slate-100 text-slate-400"
                      }`}>
                        {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : step.id}
                      </div>
                      <div>
                        <div className={`text-sm font-semibold ${isCurrent ? "text-amber-700" : isCompleted ? "text-slate-600" : "text-slate-400"}`}>
                          {step.label}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Trust note */}
              <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Secure Submission</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Your information is encrypted and only used for verification purposes. We never share founder data with third parties.
                </p>
              </div>
            </div>

            {/* ── Main: Step Content ── */}
            <div>
              {/* Step header */}
              <div className="mb-8 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center">
                    {(() => {
                      const StepIcon = STEPS[currentStep - 1].icon;
                      return <StepIcon className="w-4.5 h-4.5 text-white" />;
                    })()}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Step {currentStep} of {STEPS.length}</div>
                    <h2 className="text-xl font-black text-slate-900">{STEPS[currentStep - 1].label}</h2>
                  </div>
                </div>
              </div>

              {/* Step content */}
              <div className="mb-8">
                {currentStep === 1 && <StepToolInfo form={form} setForm={setForm} />}
                {currentStep === 2 && <StepCategory form={form} setForm={setForm} />}
                {currentStep === 3 && <StepPricing form={form} setForm={setForm} />}
                {currentStep === 4 && <StepMedia form={form} setForm={setForm} />}
                {currentStep === 5 && <StepVerification form={form} setForm={setForm} />}
                {currentStep === 6 && <StepReview form={form} setForm={setForm} />}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>

                <div className="text-xs text-slate-400 font-medium">
                  {currentStep} / {STEPS.length}
                </div>

                {currentStep < STEPS.length ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-2.5 rounded-xl transition-colors text-sm"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting || !form.agreedToTerms}
                    className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-6 py-2.5 rounded-xl transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Launching...
                      </>
                    ) : (
                      <>
                        <Rocket className="w-4 h-4" />
                        Launch for Review
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
