"use client";

export const dynamic = 'force-dynamic';


// Design: LaudStack dark-slate + amber accent. Shared legal page component.
import { useRouter, usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';
import { Shield, FileText, Cookie, ChevronRight } from 'lucide-react';

type LegalType = 'privacy' | 'terms' | 'cookies';

const LEGAL_CONTENT: Record<LegalType, {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  updated: string;
  sections: { heading: string; content: string }[];
}> = {
  privacy: {
    title: 'Privacy Policy',
    subtitle: 'How we collect, use, and protect your information.',
    icon: Shield,
    updated: 'March 1, 2026',
    sections: [
      {
        heading: '1. Information We Collect',
        content: `We collect information you provide directly to us, such as when you create an account, launch a product, write a review, or contact us. This includes your name, email address, profile information, and any content you provide.\n\nWe also collect information automatically when you use LaudStack, including log data (IP address, browser type, pages visited), device information, and usage patterns through analytics tools.`,
      },
      {
        heading: '2. How We Use Your Information',
        content: `We use the information we collect to provide, maintain, and improve our services; process transactions and send related information; send promotional communications (with your consent); respond to comments and questions; and monitor and analyze usage trends.\n\nWe do not sell your personal information to third parties. We may share information with service providers who assist in our operations, subject to confidentiality agreements.`,
      },
      {
        heading: '3. Data Retention',
        content: `We retain your personal information for as long as your account is active or as needed to provide services. You may request deletion of your account and associated data at any time by contacting us at privacy@laudstack.com.\n\nWe may retain certain information as required by law or for legitimate business purposes, such as resolving disputes or enforcing our agreements.`,
      },
      {
        heading: '4. Cookies & Tracking',
        content: `We use cookies and similar tracking technologies to track activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. See our Cookie Policy for more details.`,
      },
      {
        heading: '5. Security',
        content: `We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.`,
      },
      {
        heading: '6. Your Rights',
        content: `Depending on your pathname, you may have certain rights regarding your personal information, including the right to access, correct, or delete your data; the right to object to or restrict processing; and the right to data portability.\n\nTo exercise these rights, please contact us at privacy@laudstack.com.`,
      },
      {
        heading: '7. Changes to This Policy',
        content: `We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date. Your continued use of LaudStack after changes constitutes acceptance of the updated policy.`,
      },
      {
        heading: '8. Contact Us',
        content: `If you have questions about this Privacy Policy, please contact us at:\n\nLaudStack Inc.\nprivacy@laudstack.com\n123 Market Street, Suite 400\nSan Francisco, CA 94105`,
      },
    ],
  },
  terms: {
    title: 'Terms of Service',
    subtitle: 'The rules and guidelines for using LaudStack.',
    icon: FileText,
    updated: 'March 1, 2026',
    sections: [
      {
        heading: '1. Acceptance of Terms',
        content: `By accessing or using LaudStack ("Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Service.\n\nWe reserve the right to update these terms at any time. Continued use of the Service after changes constitutes acceptance of the new terms.`,
      },
      {
        heading: '2. User Accounts',
        content: `You must create an account to access certain features. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.\n\nYou must provide accurate and complete information when creating your account. You may not use another person's account without permission.`,
      },
      {
        heading: '3. User Content',
        content: `You retain ownership of content you provide to LaudStack, including reviews, ratings, and tool launches. By providing content, you grant LaudStack a worldwide, non-exclusive, royalty-free license to use, display, and distribute your content in connection with the Service.\n\nYou are solely responsible for your content and must not post false, misleading, defamatory, or fraudulent reviews.`,
      },
      {
        heading: '4. Prohibited Conduct',
        content: `You agree not to: post fake or incentivized reviews; manipulate rankings through artificial means; impersonate other users or entities; use the Service for any unlawful purpose; attempt to gain unauthorized access to our systems; or interfere with the proper functioning of the Service.`,
      },
      {
        heading: '5. Tool Listings',
        content: `Founders who launch products on LaudStack represent that they have the right to do so and that all information provided is accurate. LaudStack reserves the right to remove or modify any listing that violates our guidelines or contains inaccurate information.`,
      },
      {
        heading: '6. Intellectual Property',
        content: `The LaudStack platform, including its design, logos, and software, is owned by LaudStack Inc. and protected by intellectual property laws. You may not copy, modify, or distribute our proprietary content without written permission.`,
      },
      {
        heading: '7. Disclaimer of Warranties',
        content: `The Service is provided "as is" without warranties of any kind. LaudStack does not warrant that the Service will be uninterrupted, error-free, or that reviews and ratings accurately reflect the quality of listed products.`,
      },
      {
        heading: '8. Limitation of Liability',
        content: `To the maximum extent permitted by law, LaudStack shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service, even if we have been advised of the possibility of such damages.`,
      },
      {
        heading: '9. Governing Law',
        content: `These Terms shall be governed by the laws of the State of California, without regard to its conflict of law provisions. Any disputes shall be resolved in the courts of San Francisco County, California.`,
      },
    ],
  },
  cookies: {
    title: 'Cookie Policy',
    subtitle: 'How we use cookies and similar tracking technologies.',
    icon: Cookie,
    updated: 'March 1, 2026',
    sections: [
      {
        heading: '1. What Are Cookies',
        content: `Cookies are small text files stored on your device when you visit a website. They help websites remember your preferences, keep you logged in, and understand how you use the site.\n\nWe use both session cookies (which expire when you close your browser) and persistent cookies (which remain on your device until deleted or expired).`,
      },
      {
        heading: '2. Types of Cookies We Use',
        content: `Essential Cookies: Required for the Service to function. These include authentication cookies that keep you logged in and security cookies that prevent fraud.\n\nAnalytics Cookies: Help us understand how visitors interact with LaudStack, which pages are most popular, and where users come from. We use this data to improve the Service.\n\nPreference Cookies: Remember your settings and preferences, such as your selected theme, language, and filter choices.`,
      },
      {
        heading: '3. Third-Party Cookies',
        content: `We may use third-party services that set their own cookies, including analytics providers (such as Plausible Analytics) and authentication providers (such as Google OAuth). These third parties have their own privacy policies governing their use of cookies.`,
      },
      {
        heading: '4. Managing Cookies',
        content: `You can control and manage cookies through your browser settings. Most browsers allow you to refuse cookies, delete existing cookies, or be notified when a cookie is set.\n\nPlease note that disabling certain cookies may affect the functionality of LaudStack, including your ability to stay logged in or use personalized features.`,
      },
      {
        heading: '5. Do Not Track',
        content: `Some browsers include a "Do Not Track" feature that signals to websites that you do not want your online activity tracked. LaudStack currently does not respond to Do Not Track signals, but we are committed to minimizing data collection and respecting user privacy.`,
      },
      {
        heading: '6. Updates to This Policy',
        content: `We may update this Cookie Policy from time to time to reflect changes in technology or legal requirements. We will notify you of significant changes by posting a notice on our website.`,
      },
      {
        heading: '7. Contact Us',
        content: `If you have questions about our use of cookies, please contact us at privacy@laudstack.com.`,
      },
    ],
  },
};

interface LegalPageProps {
  type: LegalType;
}

function LegalPage({ type }: LegalPageProps) {
  const router = useRouter();
  const content = LEGAL_CONTENT[type];
  const Icon = content.icon;

  const OTHER_PAGES = [
    { label: 'Privacy Policy', href: '/privacy', type: 'privacy' as LegalType },
    { label: 'Terms of Service', href: '/terms', type: 'terms' as LegalType },
    { label: 'Cookie Policy', href: '/cookies', type: 'cookies' as LegalType },
  ].filter(p => p.type !== type);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <PageHero
        eyebrow="Legal"
        title={content.title}
        subtitle={`${content.subtitle} Last updated: ${content.updated}`}
        accent="amber"
        layout="default"
        size="sm"
      />

      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar TOC */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-1">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Contents</p>
              {content.sections.map((section) => (
                <a
                  key={section.heading}
                  href={`#${section.heading.replace(/\s+/g, '-').toLowerCase()}`}
                  className="block text-xs text-slate-500 hover:text-amber-400 transition-colors py-1 border-l-2 border-gray-200 hover:border-amber-500 pl-3"
                >
                  {section.heading}
                </a>
              ))}

              <div className="pt-6 border-t border-gray-200 mt-6">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Related</p>
                {OTHER_PAGES.map(p => (
                  <button
                    key={p.href}
                    onClick={() => router.push(p.href)}
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-amber-400 transition-colors py-1 w-full text-left"
                  >
                    <ChevronRight className="h-3 w-3" />
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="lg:col-span-3">
            <div className="space-y-8">
              {content.sections.map((section) => (
                <section
                  key={section.heading}
                  id={section.heading.replace(/\s+/g, '-').toLowerCase()}
                  className="scroll-mt-24"
                >
                  <h2 className="text-lg font-bold text-slate-900 mb-3 pb-2 border-b border-gray-200">
                    {section.heading}
                  </h2>
                  <div className="space-y-3">
                    {section.content.split('\n\n').map((para, i) => (
                      <p key={i} className="text-slate-500 text-sm leading-relaxed whitespace-pre-line">
                        {para}
                      </p>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            {/* Contact box */}
            <div className="mt-12 bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-base font-bold text-slate-900 mb-2">Questions about this policy?</h3>
              <p className="text-sm text-slate-500 mb-4">
                Our team is happy to clarify anything. Reach out and we'll respond within 2 business days.
              </p>
              <button
                onClick={() => router.push('/contact')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-white font-bold text-sm hover:bg-amber-400 transition-colors"
              >
                Contact Us <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}




// Default export routes to privacy by default; actual page type is determined by URL
export default function Legal() {
  const pathname = usePathname();
  const type: LegalType = (pathname ?? '').includes('terms') ? 'terms' : (pathname ?? '').includes('cookies') ? 'cookies' : 'privacy';
  return <LegalPage type={type} />;
}
