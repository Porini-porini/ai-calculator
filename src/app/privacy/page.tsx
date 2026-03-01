// ─── SEO 전략 노트 ───────────────────────────────────────────────────────────
// 개인정보처리방침 페이지는 구글 애드센스 승인의 필수 요건입니다.
// 영어로 작성하고, 애드센스가 쿠키를 사용한다는 내용을 반드시 포함해야 합니다.
// 별도 metadata export → 이 페이지도 독립적으로 인덱싱됩니다.
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | ROICalc.ai",
  description:
    "Privacy Policy for ROICalc.ai — AI Tools ROI Calculator. Learn how we collect, use, and protect your data.",
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  const lastUpdated = "January 1, 2025";
  const siteName = "ROICalc.ai";
  const siteUrl = "https://roicalc.ai";
  const contactEmail = "privacy@roicalc.ai";

  return (
    <main className="min-h-screen bg-[#0d1117] text-white">

      {/* 헤더 */}
      <header className="border-b border-[#1e2433]">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-[#8b92a5] hover:text-white transition-colors text-sm"
          >
            <ArrowLeft size={16} />
            Back to Calculator
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-16">

        {/* 페이지 헤더 */}
        <div className="flex items-start gap-4 mb-12">
          <div className="w-12 h-12 bg-[#635bff]/10 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1">
            <Shield size={22} className="text-[#635bff]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
            <p className="text-[#8b92a5]">Last updated: {lastUpdated}</p>
          </div>
        </div>

        {/* 본문 — 애드센스 승인 체크리스트를 모두 충족하는 내용 */}
        <div className="prose prose-invert max-w-none space-y-10 text-[#c9d1d9] leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Introduction</h2>
            <p>
              Welcome to {siteName} ("<strong className="text-white">we</strong>", "
              <strong className="text-white">us</strong>", or "
              <strong className="text-white">our</strong>"). We operate the website located at{" "}
              <a href={siteUrl} className="text-[#635bff] hover:underline">{siteUrl}</a> (the
              "Service"). This Privacy Policy explains how we collect, use, disclose, and
              safeguard your information when you use our Service. Please read this policy
              carefully. If you disagree with its terms, please discontinue use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Information We Collect</h2>
            <p className="mb-3">
              We may collect information about you in a variety of ways. The information we may
              collect via the Service includes:
            </p>
            <h3 className="text-base font-semibold text-white mb-2">Automatically Collected Data</h3>
            <p className="mb-3">
              When you visit our website, our servers may automatically log standard data provided
              by your web browser. It may include your device's Internet Protocol (IP) address,
              your browser type and version, the pages you visit, the time and date of your visit,
              the time spent on each page, and other technical details.
            </p>
            <h3 className="text-base font-semibold text-white mb-2">Cookies and Tracking Technologies</h3>
            <p>
              We use cookies and similar tracking technologies to track activity on our Service and
              hold certain information. Cookies are files with a small amount of data which may
              include an anonymous unique identifier. You can instruct your browser to refuse all
              cookies or to indicate when a cookie is being sent. However, if you do not accept
              cookies, you may not be able to use some portions of our Service.
            </p>
          </section>

          {/* ★ 애드센스 핵심 조항 — 제3자 광고 쿠키 사용 명시 */}
          <section className="bg-[#13181f] border border-[#1e2433] rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-3">
              3. Google AdSense &amp; Third-Party Advertising
            </h2>
            <p className="mb-3">
              We use Google AdSense to display advertisements on our Service. Google AdSense is an
              advertising service provided by Google LLC. This third-party vendor uses cookies to
              serve ads based on your prior visits to our website or other websites on the Internet.
            </p>
            <p className="mb-3">
              Google's use of advertising cookies enables it and its partners to serve ads to you
              based on your visit to our site and/or other sites on the Internet. You may opt out of
              personalized advertising by visiting{" "}
              <a
                href="https://www.google.com/settings/ads"
                className="text-[#635bff] hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                www.google.com/settings/ads
              </a>
              .
            </p>
            <p>
              We also use Google Analytics to understand how visitors interact with our website.
              Google Analytics uses cookies to collect information. For more information on Google's
              privacy practices, please visit{" "}
              <a
                href="https://policies.google.com/privacy"
                className="text-[#635bff] hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google Privacy Policy
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. How We Use Your Information</h2>
            <p className="mb-3">
              Having accurate information about you permits us to provide you with a smooth,
              efficient, and customized experience. Specifically, we may use information collected
              about you via the Service to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-[#8b92a5]">
              <li>Compile anonymous statistical data and analysis for use internally or with third parties.</li>
              <li>Monitor and analyze usage and trends to improve your experience with the Service.</li>
              <li>Deliver targeted advertising, coupons, newsletters, and other information regarding promotions.</li>
              <li>Increase the efficiency and operation of the Service.</li>
              <li>Perform other business activities as needed.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Disclosure of Your Information</h2>
            <p className="mb-3">
              We may share information we have collected about you in certain situations. Your
              information may be disclosed as follows:
            </p>
            <h3 className="text-base font-semibold text-white mb-2">By Law or to Protect Rights</h3>
            <p className="mb-3">
              If we believe the release of information about you is necessary to respond to legal
              process, to investigate or remedy potential violations of our policies, or to protect
              the rights, property, and safety of others, we may share your information as permitted
              or required by any applicable law, rule, or regulation.
            </p>
            <h3 className="text-base font-semibold text-white mb-2">Third-Party Service Providers</h3>
            <p>
              We may share your information with third parties that perform services for us or on
              our behalf, including data analysis, advertising services (including Google AdSense),
              and service improvement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Security of Your Information</h2>
            <p>
              We use administrative, technical, and physical security measures to help protect your
              personal information. While we have taken reasonable steps to secure the information
              you provide to us, please be aware that despite our efforts, no security measures are
              perfect or impenetrable, and no method of data transmission can be guaranteed against
              any interception or other type of misuse.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Your Rights (GDPR &amp; CCPA)</h2>
            <p className="mb-3">
              Depending on your location, you may have certain rights regarding your personal data:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-[#8b92a5]">
              <li><strong className="text-white">Right to Access:</strong> You have the right to request copies of your personal data.</li>
              <li><strong className="text-white">Right to Rectification:</strong> You have the right to request that we correct any information you believe is inaccurate.</li>
              <li><strong className="text-white">Right to Erasure:</strong> You have the right to request that we erase your personal data, under certain conditions.</li>
              <li><strong className="text-white">Right to Opt-Out (CCPA):</strong> California residents have the right to opt-out of the sale of personal information.</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, please contact us at{" "}
              <a href={`mailto:${contactEmail}`} className="text-[#635bff] hover:underline">
                {contactEmail}
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Children's Privacy</h2>
            <p>
              Our Service is not directed to children under the age of 13. We do not knowingly
              collect personal information from children under 13. If you are a parent or guardian
              and you are aware that your child has provided us with personal information, please
              contact us so that we will be able to take the necessary actions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes
              by posting the new Privacy Policy on this page and updating the "Last updated" date.
              You are advised to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. Contact Us</h2>
            <p>
              If you have questions or comments about this Privacy Policy, please contact us at:
            </p>
            <div className="mt-3 bg-[#13181f] border border-[#1e2433] rounded-xl p-5 inline-block">
              <p className="font-semibold text-white">{siteName}</p>
              <p className="text-[#8b92a5]">Website: <a href={siteUrl} className="text-[#635bff] hover:underline">{siteUrl}</a></p>
              <p className="text-[#8b92a5]">Email: <a href={`mailto:${contactEmail}`} className="text-[#635bff] hover:underline">{contactEmail}</a></p>
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}
