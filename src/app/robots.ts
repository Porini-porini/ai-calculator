// ─── SEO 전략 노트 ───────────────────────────────────────────────────────────
// robots.ts → /robots.txt 자동 생성.
// 모든 검색엔진에 크롤링을 허용하고, 사이트맵 위치를 명시합니다.
// 특정 URL(예: /api/*)은 크롤링에서 제외해 크롤 예산을 보호합니다.
// ─────────────────────────────────────────────────────────────────────────────

import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // 모든 크롤러 허용 (구글봇, 빙봇 등)
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",       // API 엔드포인트 제외
          "/_next/",     // Next.js 내부 파일 제외
        ],
      },
    ],
    // 사이트맵 위치 명시 — 구글 서치 콘솔에 수동 등록도 권장
    sitemap: "https://roicalc.ai/sitemap.xml",
  };
}
