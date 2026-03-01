// ─── SEO 전략 노트 ───────────────────────────────────────────────────────────
// sitemap.xml은 구글봇이 사이트 구조를 파악하는 핵심 파일입니다.
// Next.js App Router의 sitemap.ts → /sitemap.xml 자동 생성.
// 새 페이지 추가 시 이 배열에 URL만 추가하면 됩니다.
// changeFrequency와 priority를 올바르게 설정해 크롤 예산을 효율적으로 사용합니다.
// ─────────────────────────────────────────────────────────────────────────────

import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://roicalc.ai";

  return [
    {
      // 메인 계산기 페이지 — 가장 중요한 페이지, 최고 priority
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      // 개인정보처리방침 — 정적 콘텐츠, 변경 빈도 낮음
      url: `${baseUrl}/privacy`,
      lastModified: new Date("2025-01-01"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    // ── 향후 추가 예정 페이지 ─────────────────────────────────────────────
    // {
    //   url: `${baseUrl}/blog`,
    //   lastModified: new Date(),
    //   changeFrequency: "weekly",
    //   priority: 0.8,
    // },
    // {
    //   url: `${baseUrl}/blog/how-to-measure-ai-roi`,
    //   lastModified: new Date(),
    //   changeFrequency: "monthly",
    //   priority: 0.7,
    // },
  ];
}
