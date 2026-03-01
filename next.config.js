/** @type {import('next').NextConfig} */
const nextConfig = {
  // ── 성능 최적화 설정 ──────────────────────────────────────────────────
  // Core Web Vitals(LCP, FID, CLS)는 구글 랭킹 팩터입니다.
  
  // 이미지 최적화 — 외부 이미지 도메인 허용 시 추가
  images: {
    domains: [],
  },

  // 실험적 기능: App Router 안정화
  experimental: {},
};

module.exports = nextConfig;
