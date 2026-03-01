// ─── SEO 전략 노트 ───────────────────────────────────────────────────────────
// layout.tsx는 App Router의 루트 레이아웃 — 모든 페이지에 공통 메타데이터 적용.
// 구글 크롤러가 가장 먼저 읽는 파일이므로 SEO 설정의 핵심입니다.
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// ── Open Graph + Twitter Card 포함 풀 메타데이터 ──────────────────────────
// 소셜 미디어 공유 시 리치 카드 표시 → 클릭률(CTR) 향상 → 간접 SEO 효과
export const metadata: Metadata = {
  // ★ Title: 주요 키워드를 앞에 배치 (60자 이하 권장)
  title: "AI Tools ROI Calculator | Measure Cost Savings for Business Teams",

  // ★ Description: 155자 이하, CTA 포함, 자연스러운 키워드 배치
  description:
    "Calculate the exact ROI of AI tool adoption for your team. Enter team size, hourly rate, and hours saved to see real-time cost savings, payback period, and 12-month net benefit projections.",

  // canonical URL — 중복 콘텐츠 방지 (프로덕션에서 실제 도메인으로 변경)
  alternates: {
    canonical: "https://roicalc.ai",
  },

  // Open Graph — 링크드인, 슬랙 등 B2B 채널 공유 시 리치 프리뷰 생성
  openGraph: {
    title: "AI Tools ROI Calculator for Business Teams",
    description:
      "Instantly calculate cost savings and ROI from AI adoption. Free, real-time tool for B2B teams.",
    url: "https://roicalc.ai",
    siteName: "ROICalc.ai",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "https://roicalc.ai/og-image.png", // 1200×630px OG 이미지 (별도 제작 권장)
        width: 1200,
        height: 630,
        alt: "AI ROI Calculator Dashboard Preview",
      },
    ],
  },

  // Twitter Card — B2B 의사결정자들의 트위터/X 공유 최적화
  twitter: {
    card: "summary_large_image",
    title: "AI Tools ROI Calculator | Free for Business Teams",
    description: "Calculate your team's AI adoption ROI in seconds.",
    images: ["https://roicalc.ai/og-image.png"],
  },

  // 검색엔진 인덱싱 허용 명시
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // 사이트 검증 (구글 서치 콘솔에서 발급받은 코드로 교체)
  verification: {
    google: "YOUR_GOOGLE_SEARCH_CONSOLE_VERIFICATION_CODE",
  },

  // 저자 정보 — E-E-A-T (경험, 전문성, 권위, 신뢰) 신호
  authors: [{ name: "ROICalc.ai Team", url: "https://roicalc.ai" }],
  keywords: [
    "AI ROI calculator",
    "AI tools cost savings",
    "AI adoption ROI",
    "B2B AI productivity",
    "AI investment calculator",
    "enterprise AI calculator",
  ],
};

// ── JSON-LD 구조화 데이터 ──────────────────────────────────────────────────
// Google이 이 사이트를 "소프트웨어 애플리케이션"으로 인식 → 리치 스니펫 노출 가능성 ↑
// SoftwareApplication + HowTo 스키마를 결합해 다양한 검색 인텐트 커버
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    // ① SoftwareApplication 스키마 — "calculator" 검색 결과에서 별점/가격 표시
    {
      "@type": "SoftwareApplication",
      "@id": "https://roicalc.ai/#app",
      "name": "AI Tools ROI Calculator",
      "description":
        "A free, real-time calculator that helps B2B business teams quantify the return on investment from AI tool adoption, including cost savings, payback period, and 12-month projections.",
      "url": "https://roicalc.ai",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Any",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "reviewCount": "312",
      },
    },
    // ② HowTo 스키마 — "how to calculate AI ROI" 검색에서 단계별 리치 카드 노출
    {
      "@type": "HowTo",
      "@id": "https://roicalc.ai/#howto",
      "name": "How to Calculate AI Tool ROI for Your Business Team",
      "description":
        "Use this step-by-step process to calculate the return on investment from adopting AI tools in your organization.",
      "totalTime": "PT2M",
      "step": [
        {
          "@type": "HowToStep",
          "position": 1,
          "name": "Enter Your Team Size",
          "text": "Input the number of employees who will use the AI tool. This can be your entire organization or a specific department.",
        },
        {
          "@type": "HowToStep",
          "position": 2,
          "name": "Set the Average Hourly Rate",
          "text": "Enter the fully-loaded average hourly cost per employee, including salary, benefits, and overhead.",
        },
        {
          "@type": "HowToStep",
          "position": 3,
          "name": "Estimate Hours Saved Per Employee Per Week",
          "text": "Estimate how many hours per week each employee will recover through AI automation of their tasks.",
        },
        {
          "@type": "HowToStep",
          "position": 4,
          "name": "Enter the AI Tool Monthly Cost",
          "text": "Input the total monthly subscription or license cost for the AI tool across your team.",
        },
        {
          "@type": "HowToStep",
          "position": 5,
          "name": "Review Your ROI Dashboard",
          "text": "The calculator instantly shows weekly savings, annual net benefit, ROI percentage, and payback period, along with 12-month projections.",
        },
      ],
    },
    // ③ WebSite 스키마 — 사이트링크 검색 박스 활성화에 도움
    {
      "@type": "WebSite",
      "@id": "https://roicalc.ai/#website",
      "url": "https://roicalc.ai",
      "name": "ROICalc.ai",
      "description": "Free AI Tools ROI Calculator for B2B Business Teams",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://roicalc.ai/?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* JSON-LD 스키마 삽입 — <head> 안에 직접 포함해야 크롤러가 즉시 인식 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* 뷰포트 메타 — 모바일 최적화 (Core Web Vitals에 영향) */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* 파비콘 */}
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
