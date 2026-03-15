"use client";

import Link from "next/link";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-20 mt-[72px]">
        <div className="w-full max-w-md text-center">
          {/* Icon */}
          <div className="w-20 h-20 rounded-2xl bg-red-50 border-2 border-red-200 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-black text-slate-900 mb-3">
            Authentication Failed
          </h1>
          <p className="text-slate-500 leading-relaxed mb-8">
            Something went wrong during sign-in. This can happen if the session expired,
            the link was already used, or there was a temporary issue with the authentication provider.
          </p>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Link href="/auth/login">
              <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-amber-400/25">
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            </Link>
            <Link href="/">
              <button className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-6 rounded-xl transition-all">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </button>
            </Link>
          </div>

          {/* Help text */}
          <div className="mt-8 bg-slate-50 border border-slate-200 rounded-xl p-4">
            <p className="text-slate-500 text-sm leading-relaxed">
              If this keeps happening, try clearing your browser cookies or using a different browser.
              You can also{" "}
              <Link href="/auth/login?tab=signup" className="text-amber-600 font-semibold hover:text-amber-700">
                create a new account
              </Link>{" "}
              with email and password.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
