"use client";
export const dynamic = "force-dynamic";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, Upload, X, Plus, Loader2, Image as ImageIcon,
  FileText, DollarSign, Tag, Layers, Zap, Globe, Package, Info,
  CheckCircle, AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useDbUser } from "@/hooks/useDbUser";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createProduct } from "@/app/actions/marketplace";

type Category = "templates" | "saas_boilerplates" | "micro_saas" | "full_apps" | "automation_tools" | "startup_assets";

const CATEGORIES: { value: Category; label: string; desc: string; offersEnabled: boolean }[] = [
  { value: "templates", label: "Templates", desc: "UI kits, landing pages, dashboards, email templates", offersEnabled: false },
  { value: "saas_boilerplates", label: "SaaS Boilerplates", desc: "Starter kits with auth, billing, and deployment", offersEnabled: false },
  { value: "micro_saas", label: "Micro-SaaS", desc: "Small, focused SaaS products ready to deploy", offersEnabled: true },
  { value: "full_apps", label: "Full Apps", desc: "Complete applications with all features built", offersEnabled: true },
  { value: "automation_tools", label: "Automation Tools", desc: "Workflows, scripts, bots, and integrations", offersEnabled: false },
  { value: "startup_assets", label: "Startup Assets", desc: "Business plans, pitch decks, brand kits, domains", offersEnabled: true },
];

type Feature = { title: string; description: string };

export default function SubmitProductPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { dbUser, loading: dbLoading } = useDbUser();

  // Form state
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [category, setCategory] = useState<Category | "">("");
  const [price, setPrice] = useState("");
  const [compareAtPrice, setCompareAtPrice] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [techStack, setTechStack] = useState<string[]>([]);
  const [techInput, setTechInput] = useState("");
  const [includes, setIncludes] = useState<string[]>([]);
  const [includeInput, setIncludeInput] = useState("");
  const [features, setFeatures] = useState<Feature[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [minimumOfferPercent, setMinimumOfferPercent] = useState(60);

  // File state
  const [previewImage, setPreviewImage] = useState<string>("");
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [productFile, setProductFile] = useState<{ url: string; name: string; size: number } | null>(null);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingPreview, setUploadingPreview] = useState(false);
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  const selectedCat = CATEGORIES.find(c => c.value === category);
  const offersEnabled = selectedCat?.offersEnabled ?? false;

  const uploadFile = useCallback(async (file: File, type: "image" | "file"): Promise<{ url: string; key: string } | null> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    try {
      const res = await fetch("/api/marketplace/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Upload failed");
        return null;
      }
      return data;
    } catch {
      toast.error("Upload failed. Please try again.");
      return null;
    }
  }, []);

  const handlePreviewUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPreview(true);
    const result = await uploadFile(file, "image");
    if (result) setPreviewImage(result.url);
    setUploadingPreview(false);
  }, [uploadFile]);

  const handleScreenshotUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (screenshots.length >= 6) {
      toast.error("Maximum 6 screenshots allowed");
      return;
    }
    setUploadingScreenshot(true);
    const result = await uploadFile(file, "image");
    if (result) setScreenshots(prev => [...prev, result.url]);
    setUploadingScreenshot(false);
  }, [uploadFile, screenshots.length]);

  const handleProductFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFile(true);
    const result = await uploadFile(file, "file");
    if (result) setProductFile({ url: result.url, name: file.name, size: file.size });
    setUploadingFile(false);
  }, [uploadFile]);

  const addTag = useCallback((input: string, setter: React.Dispatch<React.SetStateAction<string[]>>, inputSetter: React.Dispatch<React.SetStateAction<string>>) => {
    const val = input.trim();
    if (val) {
      setter(prev => prev.includes(val) ? prev : [...prev, val]);
      inputSetter("");
    }
  }, []);

  const addFeature = useCallback(() => {
    setFeatures(prev => [...prev, { title: "", description: "" }]);
  }, []);

  const updateFeature = useCallback((index: number, field: "title" | "description", value: string) => {
    setFeatures(prev => prev.map((f, i) => i === index ? { ...f, [field]: value } : f));
  }, []);

  const removeFeature = useCallback((index: number) => {
    setFeatures(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = useCallback(async () => {
    // Validation
    if (!name.trim()) { toast.error("Product name is required"); return; }
    if (!tagline.trim()) { toast.error("Tagline is required"); return; }
    if (!description.trim()) { toast.error("Description is required"); return; }
    if (!category) { toast.error("Category is required"); return; }
    if (!price || parseFloat(price) < 0) { toast.error("Valid price is required"); return; }
    if (!previewImage) { toast.error("Preview image is required"); return; }

    setIsSubmitting(true);
    try {
      const priceInCents = Math.round(parseFloat(price) * 100);
      const compareInCents = compareAtPrice ? Math.round(parseFloat(compareAtPrice) * 100) : undefined;

      const result = await createProduct({
        name: name.trim(),
        tagline: tagline.trim(),
        description: description.trim(),
        longDescription: longDescription.trim() || undefined,
        category: category as Category,
        price: priceInCents,
        compareAtPrice: compareInCents,
        previewImageUrl: previewImage,
        screenshots,
        demoUrl: demoUrl.trim() || undefined,
        downloadFileKey: productFile?.url,
        downloadFileName: productFile?.name,
        downloadFileSize: productFile?.size,
        techStack: techStack.length > 0 ? techStack : undefined,
        includes: includes.length > 0 ? includes : undefined,
        features: features.filter(f => f.title.trim()).length > 0 ? features.filter(f => f.title.trim()) : undefined,
        tags: tags.length > 0 ? tags : undefined,
      });

      if (result.success) {
        toast.success("Product submitted for review!");
        router.push("/dashboard/creator?tab=products");
      } else {
        toast.error(result.error || "Failed to submit product");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [name, tagline, description, longDescription, category, price, compareAtPrice, previewImage, screenshots, demoUrl, productFile, techStack, includes, features, tags, offersEnabled, minimumOfferPercent, router]);

  if (authLoading || dbLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (!user || !dbUser) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center max-w-md">
            <Package className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Sign in required</h2>
            <p className="text-slate-500 mb-6">You need to be signed in to list a product.</p>
            <Link href="/auth/login" className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 transition-colors">
              Sign In <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!dbUser.isMarketplaceCreator) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center max-w-md">
            <Zap className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Become a Creator First</h2>
            <p className="text-slate-500 mb-6">Complete the creator onboarding to start listing products.</p>
            <Link href="/marketplace/creator/onboarding" className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 transition-colors">
              Start Onboarding <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <div style={{ height: "72px", flexShrink: 0 }} />

      <div className="flex-1 py-8 px-6 lg:px-10">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/dashboard/creator" className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-700 mb-4">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-slate-900">List a New Product</h1>
            <p className="text-slate-500 mt-1">Fill in the details below. Your product will be reviewed before going live.</p>
          </div>

          {/* Form */}
          <div className="space-y-6">

            {/* Basic Info */}
            <section className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-500" /> Basic Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Product Name *</label>
                  <input
                    type="text" value={name} onChange={e => setName(e.target.value)}
                    placeholder="e.g., SaaS Starter Kit Pro"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                    maxLength={128}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tagline *</label>
                  <input
                    type="text" value={tagline} onChange={e => setTagline(e.target.value)}
                    placeholder="A short, compelling description (max 200 chars)"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                    maxLength={200}
                  />
                  <p className="text-xs text-slate-500 mt-1">{tagline.length}/200</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setCategory(cat.value)}
                        className={`p-3 rounded-xl border text-left transition-colors ${
                          category === cat.value
                            ? "border-amber-400 bg-amber-50 ring-2 ring-amber-500/20"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <p className={`text-sm font-medium ${category === cat.value ? "text-amber-700" : "text-slate-700"}`}>{cat.label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{cat.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Short Description *</label>
                  <textarea
                    value={description} onChange={e => setDescription(e.target.value)}
                    placeholder="Describe your product in 2-3 sentences..."
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Detailed Description</label>
                  <textarea
                    value={longDescription} onChange={e => setLongDescription(e.target.value)}
                    placeholder="Full product description. Supports markdown formatting..."
                    rows={8}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 resize-none"
                  />
                  <p className="text-xs text-slate-500 mt-1">Markdown supported. Include setup instructions, use cases, and technical details.</p>
                </div>
              </div>
            </section>

            {/* Pricing */}
            <section className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-amber-500" /> Pricing
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Price (USD) *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
                    <input
                      type="number" value={price} onChange={e => setPrice(e.target.value)}
                      placeholder="29.00"
                      min="0" step="0.01"
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Compare at Price</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
                    <input
                      type="number" value={compareAtPrice} onChange={e => setCompareAtPrice(e.target.value)}
                      placeholder="49.00"
                      min="0" step="0.01"
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Original price to show a discount (optional)</p>
                </div>
              </div>

              {offersEnabled && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-700">Make Offer enabled for this category</p>
                      <p className="text-xs text-blue-600 mt-1">Buyers can negotiate prices. Set the minimum offer percentage below.</p>
                      <div className="mt-3">
                        <label className="block text-xs font-medium text-blue-700 mb-1">
                          Minimum offer: {minimumOfferPercent}% of listing price
                          {price && ` ($${(parseFloat(price) * minimumOfferPercent / 100).toFixed(2)})`}
                        </label>
                        <input
                          type="range" min={40} max={90} value={minimumOfferPercent}
                          onChange={e => setMinimumOfferPercent(parseInt(e.target.value))}
                          className="w-full accent-blue-500"
                        />
                        <div className="flex justify-between text-xs text-blue-400">
                          <span>40%</span><span>90%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4 p-3 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-500">
                  <strong>Platform fee:</strong> 12% commission on each sale. You receive 88%.
                  {price && parseFloat(price) > 0 && (
                    <> For a ${parseFloat(price).toFixed(2)} product, you earn <strong className="text-green-600">${(parseFloat(price) * 0.88).toFixed(2)}</strong> per sale.</>
                  )}
                </p>
              </div>
            </section>

            {/* Media */}
            <section className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-amber-500" /> Media
              </h2>

              <div className="space-y-4">
                {/* Preview Image */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Preview Image *</label>
                  {previewImage ? (
                    <div className="relative inline-block">
                      <img src={previewImage} alt="Preview" className="w-full max-w-md h-48 object-cover rounded-xl border border-slate-200" />
                      <button onClick={() => setPreviewImage("")} className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-amber-400 hover:bg-amber-50/30 transition-colors">
                      {uploadingPreview ? (
                        <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-slate-500 mb-2" />
                          <span className="text-sm text-slate-600">Click to upload preview image</span>
                          <span className="text-xs text-slate-500 mt-1">JPEG, PNG, WebP (max 5MB)</span>
                        </>
                      )}
                      <input type="file" accept="image/*" onChange={handlePreviewUpload} className="hidden" />
                    </label>
                  )}
                </div>

                {/* Screenshots */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Screenshots ({screenshots.length}/6)</label>
                  <div className="grid grid-cols-3 gap-3">
                    {screenshots.map((url, i) => (
                      <div key={i} className="relative">
                        <img src={url} alt={`Screenshot ${i + 1}`} className="w-full h-24 object-cover rounded-lg border border-slate-200" />
                        <button onClick={() => setScreenshots(prev => prev.filter((_, j) => j !== i))} className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {screenshots.length < 6 && (
                      <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-slate-200 rounded-lg cursor-pointer hover:border-amber-400 transition-colors">
                        {uploadingScreenshot ? (
                          <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
                        ) : (
                          <>
                            <Plus className="w-5 h-5 text-slate-500" />
                            <span className="text-xs text-slate-500 mt-1">Add</span>
                          </>
                        )}
                        <input type="file" accept="image/*" onChange={handleScreenshotUpload} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>

                {/* Demo URL */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Demo / Preview URL</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="url" value={demoUrl} onChange={e => setDemoUrl(e.target.value)}
                      placeholder="https://demo.yourproduct.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Product File */}
            <section className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-500" /> Product File
              </h2>

              {productFile ? (
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{productFile.name}</p>
                    <p className="text-xs text-slate-500">{(productFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                  <button onClick={() => setProductFile(null)} className="text-red-500 hover:text-red-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-amber-400 hover:bg-amber-50/30 transition-colors">
                  {uploadingFile ? (
                    <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-slate-500 mb-2" />
                      <span className="text-sm text-slate-600">Upload product file (ZIP)</span>
                      <span className="text-xs text-slate-500 mt-1">Max 50MB. Buyers download this after purchase.</span>
                    </>
                  )}
                  <input type="file" accept=".zip" onChange={handleProductFileUpload} className="hidden" />
                </label>
              )}
              <p className="text-xs text-slate-500 mt-2">
                <AlertCircle className="w-3 h-3 inline mr-1" />
                You can also add the file later from your Creator Dashboard.
              </p>
            </section>

            {/* Tech Stack & Includes */}
            <section className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-500" /> Details
              </h2>

              <div className="space-y-4">
                {/* Tech Stack */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tech Stack</label>
                  <div className="flex gap-2">
                    <input
                      type="text" value={techInput} onChange={e => setTechInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag(techInput, setTechStack, setTechInput))}
                      placeholder="e.g., Next.js, Tailwind CSS"
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                    />
                    <button type="button" onClick={() => addTag(techInput, setTechStack, setTechInput)} className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200">Add</button>
                  </div>
                  {techStack.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {techStack.map(t => (
                        <span key={t} className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                          {t}
                          <button onClick={() => setTechStack(prev => prev.filter(x => x !== t))} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* What's Included */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">What&apos;s Included</label>
                  <div className="flex gap-2">
                    <input
                      type="text" value={includeInput} onChange={e => setIncludeInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag(includeInput, setIncludes, setIncludeInput))}
                      placeholder="e.g., Source code, Documentation, 1 year updates"
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                    />
                    <button type="button" onClick={() => addTag(includeInput, setIncludes, setIncludeInput)} className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200">Add</button>
                  </div>
                  {includes.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {includes.map(t => (
                        <span key={t} className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-600 text-xs rounded-full">
                          <CheckCircle className="w-3 h-3" /> {t}
                          <button onClick={() => setIncludes(prev => prev.filter(x => x !== t))} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Features */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Key Features</label>
                  {features.map((f, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <input
                        type="text" value={f.title} onChange={e => updateFeature(i, "title", e.target.value)}
                        placeholder="Feature title"
                        className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                      />
                      <input
                        type="text" value={f.description} onChange={e => updateFeature(i, "description", e.target.value)}
                        placeholder="Brief description"
                        className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                      />
                      <button onClick={() => removeFeature(i)} className="text-red-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                    </div>
                  ))}
                  <button type="button" onClick={addFeature} className="flex items-center gap-1 text-sm text-amber-600 font-medium hover:text-amber-700">
                    <Plus className="w-4 h-4" /> Add Feature
                  </button>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tags</label>
                  <div className="flex gap-2">
                    <input
                      type="text" value={tagInput} onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag(tagInput, setTags, setTagInput))}
                      placeholder="e.g., nextjs, dashboard, admin"
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                    />
                    <button type="button" onClick={() => addTag(tagInput, setTags, setTagInput)} className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200">Add</button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.map(t => (
                        <span key={t} className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-600 text-xs rounded-full">
                          <Tag className="w-3 h-3" /> {t}
                          <button onClick={() => setTags(prev => prev.filter(x => x !== t))} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Submit */}
            <div className="flex gap-3">
              <Link href="/dashboard/creator" className="flex-1 py-3.5 bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors text-center">
                Cancel
              </Link>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 py-3.5 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                ) : (
                  <><Zap className="w-4 h-4" /> Submit for Review</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
