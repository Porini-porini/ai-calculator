"use client";

// ─── SEO 전략 노트 ───────────────────────────────────────────────────────────
// 이 파일은 클라이언트 컴포넌트지만, metadata는 별도 layout.tsx에서 처리합니다.
// 실시간 계산기 + 풍부한 SEO 콘텐츠를 결합해 "유용한 도구 + 정보 허브" 역할을 합니다.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from "recharts";
import {
  Calculator, TrendingUp, Clock, DollarSign, Users, Zap,
  ChevronRight, BarChart2, CheckCircle, ArrowRight,
  Download, Save, FolderOpen, Trash2, Plus, X,
  FileText, Loader2, CheckCheck, BookmarkPlus,
} from "lucide-react";

// ══════════════════════════════════════════════════════════════════
// 타입 정의
// ══════════════════════════════════════════════════════════════════

interface Scenario {
  id: string;
  name: string;
  teamSize: number;
  hourlyRate: number;
  hoursSaved: number;
  aiToolCost: number;
  savedAt: string;
}

// ══════════════════════════════════════════════════════════════════
// 커스텀 툴팁
// ══════════════════════════════════════════════════════════════════
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1f2e] border border-[#2a3147] rounded-xl p-4 shadow-2xl">
        <p className="text-[#8b92a5] text-xs mb-2 font-mono">{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} className="text-sm font-semibold" style={{ color: entry.color }}>
            {entry.name}: <span className="font-mono">${entry.value.toLocaleString()}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ══════════════════════════════════════════════════════════════════
// localStorage 키
// ══════════════════════════════════════════════════════════════════
const LS_KEY = "roicalc_scenarios_v1";

// ══════════════════════════════════════════════════════════════════
// 메인 컴포넌트
// ══════════════════════════════════════════════════════════════════
export default function HomePage() {

  // ── 입력 상태 ─────────────────────────────────────────────────────────────
  const [teamSize, setTeamSize]     = useState(10);
  const [hourlyRate, setHourlyRate] = useState(75);
  const [hoursSaved, setHoursSaved] = useState(5);
  const [aiToolCost, setAiToolCost] = useState(500);

  // ── PDF 내보내기 상태 ──────────────────────────────────────────────────────
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfDone, setPdfDone]       = useState(false);

  // ── 시나리오 관련 상태 ─────────────────────────────────────────────────────
  const [scenarios, setScenarios]               = useState<Scenario[]>([]);
  const [scenarioName, setScenarioName]         = useState("");
  const [saveModalOpen, setSaveModalOpen]       = useState(false);
  const [scenarioPanelOpen, setScenarioPanelOpen] = useState(false);
  const [loadedId, setLoadedId]                 = useState<string | null>(null);

  // ── PDF 캡처 대상 ref ──────────────────────────────────────────────────────
  const reportRef = useRef<HTMLDivElement>(null);

  // ── localStorage 초기 로드 (SSR 안전: useEffect 안에서만 실행) ─────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setScenarios(JSON.parse(raw));
    } catch {
      // 파싱 실패 시 무시
    }
  }, []);

  // ── ROI 계산 (useMemo로 성능 최적화) ──────────────────────────────────────
  const metrics = useMemo(() => {
    const weeklySavings    = teamSize * hourlyRate * hoursSaved;
    const monthlySavings   = weeklySavings * 4.33;
    const annualSavings    = monthlySavings * 12;
    const annualAiCost     = aiToolCost * 12;
    const netAnnualSavings = annualSavings - annualAiCost;
    const roi              = annualAiCost > 0
      ? ((netAnnualSavings / annualAiCost) * 100).toFixed(0)
      : 0;
    const paybackWeeks     = weeklySavings > 0
      ? (aiToolCost / weeklySavings).toFixed(1)
      : 0;
    return { weeklySavings, monthlySavings, annualSavings, annualAiCost, netAnnualSavings, roi, paybackWeeks };
  }, [teamSize, hourlyRate, hoursSaved, aiToolCost]);

  // ── 12개월 차트 데이터 ─────────────────────────────────────────────────────
  const chartData = useMemo(() => Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return {
      name: `M${month}`,
      "Cumulative Savings": Math.round(metrics.monthlySavings * month),
      "AI Tool Cost":       Math.round(metrics.annualAiCost / 12) * month,
      "Net Benefit":        Math.round((metrics.monthlySavings - metrics.annualAiCost / 12) * month),
    };
  }), [metrics]);

  // ── 부서별 절감 데이터 ─────────────────────────────────────────────────────
  const departmentData = useMemo(() => [
    { dept: "Engineering", saving: Math.round(metrics.monthlySavings * 0.35) },
    { dept: "Marketing",   saving: Math.round(metrics.monthlySavings * 0.25) },
    { dept: "Support",     saving: Math.round(metrics.monthlySavings * 0.20) },
    { dept: "Sales",       saving: Math.round(metrics.monthlySavings * 0.12) },
    { dept: "HR/Ops",      saving: Math.round(metrics.monthlySavings * 0.08) },
  ], [metrics]);

  // ══════════════════════════════════════════════════════════════════
  // [기능 1] PDF 내보내기
  // - html2canvas로 reportRef DOM 캡처
  // - jsPDF에 이미지 삽입 후 .pdf 저장
  // - 동적 import(Code Splitting)로 초기 번들 크기 최소화
  // ══════════════════════════════════════════════════════════════════
  const handleExportPDF = useCallback(async () => {
    if (!reportRef.current || pdfLoading) return;
    setPdfLoading(true);

    try {
      // 무거운 라이브러리를 필요할 때만 로드 → 초기 로딩 속도 보호
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ]);

      const element = reportRef.current;

      // scale: 2 → Retina 해상도(선명도), backgroundColor: 다크 배경 유지
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#0d1117",
        logging: false,
        windowWidth:  element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      const imgData   = canvas.toDataURL("image/png");
      const pdfWidth  = 210; // A4 mm
      const pdfHeight = 297;
      const ratio     = pdfWidth / canvas.width;
      const scaledH   = canvas.height * ratio;

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      // 콘텐츠가 A4를 초과할 경우 자동 페이지 분할
      let yOffset = 0;
      while (yOffset < scaledH) {
        if (yOffset > 0) pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, -(yOffset), pdfWidth, scaledH);
        yOffset += pdfHeight;
      }

      const date = new Date().toISOString().slice(0, 10);
      pdf.save(`AI-ROI-Report-${date}.pdf`);

      setPdfDone(true);
      setTimeout(() => setPdfDone(false), 2500);
    } catch (err) {
      console.error("PDF export failed:", err);
      alert("PDF export failed. Please try again.");
    } finally {
      setPdfLoading(false);
    }
  }, [pdfLoading]);

  // ══════════════════════════════════════════════════════════════════
  // [기능 2] 시나리오 저장
  // - 현재 슬라이더 값 + 이름 → localStorage에 JSON 배열로 저장
  // - 최대 10개 보관 (오래된 것 자동 제거)
  // ══════════════════════════════════════════════════════════════════
  const handleSaveScenario = useCallback(() => {
    const name = scenarioName.trim() || `Scenario ${new Date().toLocaleTimeString()}`;
    const newScenario: Scenario = {
      id: `sc_${Date.now()}`,
      name,
      teamSize,
      hourlyRate,
      hoursSaved,
      aiToolCost,
      savedAt: new Date().toISOString(),
    };
    const updated = [newScenario, ...scenarios].slice(0, 10);
    setScenarios(updated);
    localStorage.setItem(LS_KEY, JSON.stringify(updated));
    setScenarioName("");
    setSaveModalOpen(false);
    setLoadedId(newScenario.id);
  }, [scenarioName, teamSize, hourlyRate, hoursSaved, aiToolCost, scenarios]);

  // ══════════════════════════════════════════════════════════════════
  // [기능 2] 시나리오 로드
  // - setState로 슬라이더 값 즉시 업데이트 → useMemo 자동 재계산
  // ══════════════════════════════════════════════════════════════════
  const handleLoadScenario = useCallback((s: Scenario) => {
    setTeamSize(s.teamSize);
    setHourlyRate(s.hourlyRate);
    setHoursSaved(s.hoursSaved);
    setAiToolCost(s.aiToolCost);
    setLoadedId(s.id);
    setScenarioPanelOpen(false);
    document.getElementById("calculator")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // ── 시나리오 삭제 ──────────────────────────────────────────────────────────
  const handleDeleteScenario = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = scenarios.filter((s) => s.id !== id);
    setScenarios(updated);
    localStorage.setItem(LS_KEY, JSON.stringify(updated));
    if (loadedId === id) setLoadedId(null);
  }, [scenarios, loadedId]);

  // ── 시나리오 카드에 표시할 ROI 미리 계산 ─────────────────────────────────
  const getScenarioROI = (s: Scenario) => {
    const weekly   = s.teamSize * s.hourlyRate * s.hoursSaved;
    const monthly  = weekly * 4.33;
    const annual   = monthly * 12;
    const cost     = s.aiToolCost * 12;
    const net      = annual - cost;
    return cost > 0 ? Math.round((net / cost) * 100) : 0;
  };

  // ══════════════════════════════════════════════════════════════════════════
  // 렌더
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <main className="min-h-screen bg-[#0d1117] text-white">

      {/* ── 헤더 ─────────────────────────────────────────────────────────────── */}
      <header className="border-b border-[#1e2433] sticky top-0 z-50 bg-[#0d1117]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[#635bff] to-[#00d4ff] rounded-lg flex items-center justify-center">
              <Calculator size={16} className="text-white" />
            </div>
            <span className="font-semibold text-[15px] tracking-tight">
              ROI<span className="text-[#635bff]">Calc</span>.ai
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-[#8b92a5]">
            <a href="#calculator" className="hover:text-white transition-colors">Calculator</a>
            <a href="#insights"   className="hover:text-white transition-colors">Insights</a>
            <a href="/privacy"    className="hover:text-white transition-colors">Privacy</a>
          </nav>
          <div className="flex items-center gap-3">
            {/* Scenarios 버튼 — 저장된 개수 배지 표시 */}
            <button
              onClick={() => setScenarioPanelOpen(true)}
              className="hidden md:flex items-center gap-2 border border-[#1e2433] hover:border-[#635bff]/50 px-4 py-2 rounded-lg text-sm text-[#8b92a5] hover:text-white transition-all"
            >
              <FolderOpen size={14} />
              Scenarios
              {scenarios.length > 0 && (
                <span className="bg-[#635bff]/20 text-[#a89fff] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {scenarios.length}
                </span>
              )}
            </button>
            <a href="#calculator" className="hidden md:flex items-center gap-2 bg-[#635bff] hover:bg-[#5249e5] px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Get Started <ChevronRight size={14} />
            </a>
          </div>
        </div>
      </header>

      {/* ── 히어로 섹션 ──────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 text-center relative">
        <div className="absolute inset-0 -top-20 bg-gradient-to-b from-[#635bff]/5 via-transparent to-transparent pointer-events-none" />
        <div className="inline-flex items-center gap-2 bg-[#635bff]/10 border border-[#635bff]/20 text-[#a89fff] text-xs font-medium px-4 py-2 rounded-full mb-8">
          <Zap size={12} />
          Trusted by 5,000+ B2B Teams Worldwide
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-white via-[#e2e8f0] to-[#94a3b8] bg-clip-text text-transparent leading-tight">
          AI Tools ROI Calculator<br className="hidden md:block" />
          <span className="text-[#635bff]"> for Business Teams</span>
        </h1>
        <p className="text-lg text-[#8b92a5] max-w-2xl mx-auto mb-10 leading-relaxed">
          Instantly calculate your team's cost savings, payback period, and 12-month net benefit
          from AI adoption. Save scenarios, compare strategies, and export PDF reports.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-[#8b92a5]">
          {["No sign-up required", "Real-time calculation", "PDF export", "Scenario comparison"].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <CheckCircle size={14} className="text-[#00d4aa]" />
              {item}
            </div>
          ))}
        </div>
      </section>

      {/* ── 계산기 섹션 ──────────────────────────────────────────────────────── */}
      <section id="calculator" className="max-w-7xl mx-auto px-6 pb-20">

        {/* ====================================================================
            액션 바 — PDF 내보내기 + 시나리오 저장 버튼
            reportRef 밖에 위치 → PDF 캡처 시 버튼 UI가 포함되지 않음
        ==================================================================== */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-4 bg-[#13181f] border border-[#1e2433] rounded-2xl">
          <div className="flex items-center gap-3">
            {loadedId && (
              <div className="flex items-center gap-2 text-xs text-[#a89fff] bg-[#635bff]/10 border border-[#635bff]/20 px-3 py-1.5 rounded-full">
                <CheckCheck size={12} />
                {scenarios.find((s) => s.id === loadedId)?.name ?? "Scenario"} loaded
              </div>
            )}
            <p className="text-sm text-[#8b92a5] hidden sm:block">Adjust inputs, then save or export your analysis</p>
          </div>
          <div className="flex items-center gap-3">
            {/* 시나리오 저장 버튼 */}
            <button
              onClick={() => setSaveModalOpen(true)}
              className="flex items-center gap-2 border border-[#1e2433] hover:border-[#635bff]/50 bg-transparent hover:bg-[#635bff]/5 text-[#8b92a5] hover:text-[#a89fff] px-4 py-2 rounded-lg text-sm font-medium transition-all"
            >
              <BookmarkPlus size={15} />
              Save Scenario
            </button>

            {/* PDF 내보내기 버튼 — 로딩/완료 상태별 UI 변화 */}
            <button
              onClick={handleExportPDF}
              disabled={pdfLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                pdfDone
                  ? "bg-[#00d4aa]/20 text-[#00d4aa] border border-[#00d4aa]/30"
                  : "bg-[#635bff] hover:bg-[#5249e5] text-white"
              } disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {pdfLoading ? (
                <><Loader2 size={15} className="animate-spin" /> Generating PDF...</>
              ) : pdfDone ? (
                <><CheckCheck size={15} /> Downloaded!</>
              ) : (
                <><Download size={15} /> Export PDF Report</>
              )}
            </button>
          </div>
        </div>

        {/* ====================================================================
            PDF 캡처 영역 (reportRef)
            이 div 안의 모든 내용이 PDF로 변환됩니다.
            배경색과 padding을 명시적으로 지정해야 html2canvas가 올바르게 렌더합니다.
        ==================================================================== */}
        <div ref={reportRef} className="bg-[#0d1117] p-2 rounded-2xl">

          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

            {/* ── 입력 패널 ───────────────────────────────────────────────── */}
            <div className="xl:col-span-2 bg-[#13181f] border border-[#1e2433] rounded-2xl p-6 h-fit">
              <div className="flex items-center gap-2 mb-6">
                <Calculator size={18} className="text-[#635bff]" />
                <h2 className="font-semibold text-[15px]">Configure Your Team</h2>
              </div>

              {[
                { label: "Team Size",                      icon: Users,      value: teamSize,   setter: setTeamSize,   min: 1,   max: 500,   step: 1,   unit: "employees", color: "#635bff" },
                { label: "Avg. Hourly Rate",               icon: DollarSign, value: hourlyRate, setter: setHourlyRate, min: 10,  max: 300,   step: 5,   unit: "$/hr",      color: "#00d4aa" },
                { label: "Hours Saved / Employee / Week",  icon: Clock,      value: hoursSaved, setter: setHoursSaved, min: 0.5, max: 40,    step: 0.5, unit: "hrs/wk",    color: "#f59e0b" },
                { label: "AI Tool Monthly Cost",           icon: BarChart2,  value: aiToolCost, setter: setAiToolCost, min: 0,   max: 50000, step: 50,  unit: "$/mo",      color: "#f43f5e" },
              ].map(({ label, icon: Icon, value, setter, min, max, step, unit, color }) => (
                <div key={label} className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <Icon size={14} style={{ color }} />
                      <span className="text-sm text-[#8b92a5]">{label}</span>
                    </div>
                    <span className="font-mono font-bold text-sm" style={{ color }}>
                      {unit.startsWith("$") ? `$${value.toLocaleString()}` : value}{" "}
                      {!unit.startsWith("$") ? unit : ""}
                    </span>
                  </div>
                  <input
                    type="range" min={min} max={max} step={step} value={value}
                    onChange={(e) => setter(Number(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, ${color} 0%, ${color} ${
                        ((value - min) / (max - min)) * 100
                      }%, #1e2433 ${((value - min) / (max - min)) * 100}%, #1e2433 100%)`,
                    }}
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-[#3d4560] font-mono">{min}</span>
                    <span className="text-[10px] text-[#3d4560] font-mono">{max.toLocaleString()}</span>
                  </div>
                </div>
              ))}

              {/* PDF 인쇄용 입력값 요약 박스 */}
              <div className="mt-2 pt-4 border-t border-[#1e2433]">
                <p className="text-[10px] text-[#4a5268] mb-3 font-mono uppercase tracking-wider">Input Summary</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { k: "Team",    v: `${teamSize} employees` },
                    { k: "Rate",    v: `$${hourlyRate}/hr` },
                    { k: "Saved",   v: `${hoursSaved} hrs/wk` },
                    { k: "AI Cost", v: `$${aiToolCost.toLocaleString()}/mo` },
                  ].map(({ k, v }) => (
                    <div key={k} className="bg-[#0d1117] rounded-lg px-3 py-2">
                      <span className="text-[#4a5268]">{k}: </span>
                      <span className="text-[#8b92a5] font-mono">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── 결과 + 차트 패널 ─────────────────────────────────────────── */}
            <div className="xl:col-span-3 flex flex-col gap-6">

              {/* KPI 카드 4개 */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Weekly Savings",     value: `$${metrics.weeklySavings.toLocaleString()}`,    sub: "across your team",     icon: TrendingUp, color: "#00d4aa" },
                  { label: "Annual Net Benefit", value: `$${metrics.netAnnualSavings.toLocaleString()}`, sub: "after AI tool costs",  icon: DollarSign, color: "#635bff" },
                  { label: "ROI",                value: `${metrics.roi}%`,                                sub: "return on investment", icon: BarChart2,  color: "#f59e0b" },
                  { label: "Payback Period",     value: `${metrics.paybackWeeks} wks`,                   sub: "to break even",        icon: Clock,      color: "#f43f5e" },
                ].map(({ label, value, sub, icon: Icon, color }) => (
                  <div key={label} className="bg-[#13181f] border border-[#1e2433] rounded-2xl p-5 hover:border-[#2a3147] transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-xs text-[#8b92a5]">{label}</span>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
                        <Icon size={14} style={{ color }} />
                      </div>
                    </div>
                    <p className="text-2xl font-bold font-mono" style={{ color }}>{value}</p>
                    <p className="text-xs text-[#4a5268] mt-1">{sub}</p>
                  </div>
                ))}
              </div>

              {/* Recharts AreaChart */}
              <div className="bg-[#13181f] border border-[#1e2433] rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-semibold text-[15px]">12-Month Cumulative Savings</h3>
                    <p className="text-xs text-[#8b92a5] mt-1">Net benefit compounds over time</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-[#00d4aa] bg-[#00d4aa]/10 px-3 py-1.5 rounded-full">
                    <TrendingUp size={11} /> Live
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#635bff" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#635bff" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#00d4aa" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#00d4aa" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="g3" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#f43f5e" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e2433" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: "#4a5268", fontSize: 11, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#4a5268", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="Cumulative Savings" stroke="#635bff" strokeWidth={2} fill="url(#g1)" />
                    <Area type="monotone" dataKey="Net Benefit"        stroke="#00d4aa" strokeWidth={2} fill="url(#g2)" />
                    <Area type="monotone" dataKey="AI Tool Cost"       stroke="#f43f5e" strokeWidth={1.5} strokeDasharray="4 2" fill="url(#g3)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Recharts BarChart */}
              <div className="bg-[#13181f] border border-[#1e2433] rounded-2xl p-6">
                <h3 className="font-semibold text-[15px] mb-1">Monthly Savings by Department</h3>
                <p className="text-xs text-[#8b92a5] mb-6">Estimated distribution across your org</p>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={departmentData} margin={{ top: 0, right: 5, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e2433" horizontal vertical={false} />
                    <XAxis dataKey="dept" tick={{ fill: "#4a5268", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#4a5268", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="saving" fill="#635bff" radius={[4, 4, 0, 0]} name="Monthly Saving" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

            </div>
          </div>

          {/* PDF 리포트 하단 메타 정보 — 인쇄물에서 날짜/출처 확인 가능 */}
          <div className="mt-6 pt-4 border-t border-[#1e2433] flex items-center justify-between text-xs text-[#3d4560]">
            <span>Generated by ROICalc.ai — Not financial advice. Results are estimates only.</span>
            <span className="font-mono">
              {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </span>
          </div>
        </div>
        {/* /reportRef */}

      </section>

      {/* ── SEO 콘텐츠 ───────────────────────────────────────────────────────── */}
      <section id="insights" className="bg-[#0a0e17] border-t border-[#1e2433]">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
                Why Every B2B Team Needs an <span className="text-[#635bff]">AI ROI Strategy</span>
              </h2>
              <p className="text-[#8b92a5] text-lg leading-relaxed">
                The numbers behind AI adoption in enterprise and mid-market businesses.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 mb-16">
              {[
                { icon: TrendingUp, color: "#635bff", hover: "hover:border-[#635bff]/30", title: "The Real Cost of Manual Workflows",         body: "Studies consistently show that knowledge workers spend 20–40% of their time on repetitive, automatable tasks—scheduling, data entry, report generation, and email drafting. At an average fully-loaded cost of $75–$120 per hour for professional roles in the US and UK, a 50-person team losing just 5 hours per week per employee hemorrhages over $1.5M annually in unrecovered productivity." },
                { icon: Zap,        color: "#00d4aa", hover: "hover:border-[#00d4aa]/30", title: "How to Calculate AI Tool ROI Accurately",   body: "Accurate ROI calculation goes beyond comparing license costs to headcount savings. A robust model factors in: direct labor recovery, quality improvements, speed-to-output gains, and employee satisfaction uplift. Our calculator conservatively models direct labor recovery, giving you a defensible baseline for board presentations and procurement approvals." },
                { icon: Users,      color: "#f59e0b", hover: "hover:border-[#f59e0b]/30", title: "AI Adoption Benchmarks by Team Size",       body: "ROI dynamics differ significantly by organization size. Small teams (5–20) typically see 3–5 hours saved per employee per week with general-purpose AI assistants. Mid-market teams (20–200) benefit most from department-specific tooling. Enterprise teams (200+) compound savings through workflow automation platforms, delivering 10x+ annual ROI." },
                { icon: BarChart2,  color: "#f43f5e", hover: "hover:border-[#f43f5e]/30", title: "Building a Business Case for AI Investment", body: "Finance teams and CFOs require structured business cases. A compelling proposal includes: a baseline productivity audit, a conservative savings projection, a phased rollout plan with 30/60/90-day milestones, a risk register addressing data security, and a measurement framework with clear KPIs. Our calculator gives you the quantitative foundation." },
              ].map(({ icon: Icon, color, hover, title, body }) => (
                <div key={title} className={`bg-[#13181f] border border-[#1e2433] rounded-2xl p-8 ${hover} transition-colors`}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5" style={{ background: `${color}18` }}>
                    <Icon size={20} style={{ color }} />
                  </div>
                  <h3 className="text-lg font-semibold mb-3">{title}</h3>
                  <p className="text-[#8b92a5] text-sm leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
            <div className="bg-[#13181f] border border-[#1e2433] rounded-2xl p-8">
              <h3 className="text-xl font-semibold mb-4 text-white">Frequently Asked Questions About AI ROI for Business</h3>
              <div className="space-y-6">
                {[
                  { q: "What is a good ROI for AI tools in B2B companies?",          a: "Industry benchmarks suggest a 200–500% ROI is achievable within the first year for well-implemented AI tools. Even a 100% ROI is strong—the tool pays for itself and delivers equivalent additional value. Use this calculator to find your team-specific baseline, then compare against vendor case studies in your industry." },
                  { q: "How long does it take to see ROI from AI adoption?",          a: "Payback periods vary by category. AI writing assistants and code co-pilots show measurable gains within 1–2 weeks. Complex workflow automation platforms may take 4–12 weeks. For most teams, payback falls between 2–8 weeks—the calculator shows your team's specific estimate." },
                  { q: "Should I include implementation costs in my ROI calculation?", a: "Yes—a complete model includes one-time setup costs, ongoing training time, and any productivity dip during adoption. For SaaS AI tools these are often negligible (< 10% of first-year license cost). For enterprise platforms, factor 20–50% of annual license cost as implementation overhead." },
                ].map(({ q, a }) => (
                  <div key={q} className="border-b border-[#1e2433] pb-6 last:border-0 last:pb-0">
                    <h4 className="font-semibold text-white mb-2 flex items-start gap-2">
                      <ArrowRight size={16} className="text-[#635bff] mt-0.5 flex-shrink-0" />{q}
                    </h4>
                    <p className="text-[#8b92a5] text-sm leading-relaxed pl-6">{a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 푸터 ─────────────────────────────────────────────────────────────── */}
      <footer className="border-t border-[#1e2433] bg-[#0d1117]">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[#4a5268]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-[#635bff] to-[#00d4ff] rounded-md flex items-center justify-center">
              <Calculator size={12} className="text-white" />
            </div>
            <span>© {new Date().getFullYear()} ROICalc.ai. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="/privacy" className="hover:text-[#8b92a5] transition-colors">Privacy Policy</a>
            <span>·</span>
            <span>Not financial advice. Results are estimates.</span>
          </div>
        </div>
      </footer>

      {/* ══════════════════════════════════════════════════════════════════════
          모달: 시나리오 저장
          - 이름 입력 + 현재 설정 미리보기 + Enter키 저장 지원
      ══════════════════════════════════════════════════════════════════════ */}
      {saveModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.75)" }}
          onClick={() => setSaveModalOpen(false)}
        >
          <div
            className="bg-[#13181f] border border-[#1e2433] rounded-2xl p-6 w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#635bff]/10 rounded-xl flex items-center justify-center">
                  <Save size={16} className="text-[#635bff]" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Save Scenario</h3>
                  <p className="text-xs text-[#4a5268]">Name this configuration to compare later</p>
                </div>
              </div>
              <button
                onClick={() => setSaveModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#4a5268] hover:text-white hover:bg-[#1e2433] transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* 이름 입력 */}
            <input
              type="text"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveScenario()}
              placeholder='e.g. "Optimistic — Q1 2026"'
              maxLength={50}
              autoFocus
              className="w-full bg-[#0d1117] border border-[#1e2433] focus:border-[#635bff] rounded-xl px-4 py-3 text-sm text-white placeholder-[#3d4560] outline-none transition-colors mb-4"
            />

            {/* 현재 설정 + ROI 미리보기 */}
            <div className="bg-[#0d1117] rounded-xl p-4 mb-5 grid grid-cols-2 gap-y-2 text-xs">
              {[
                { k: "Team Size",   v: `${teamSize} employees` },
                { k: "Hourly Rate", v: `$${hourlyRate}/hr` },
                { k: "Hours Saved", v: `${hoursSaved} hrs/wk/emp` },
                { k: "AI Cost",     v: `$${aiToolCost.toLocaleString()}/mo` },
              ].map(({ k, v }) => (
                <div key={k}>
                  <span className="text-[#4a5268]">{k}: </span>
                  <span className="text-[#8b92a5] font-mono">{v}</span>
                </div>
              ))}
              <div className="col-span-2 pt-2 border-t border-[#1e2433] mt-1">
                <span className="text-[#4a5268]">Projected ROI: </span>
                <span className="text-[#00d4aa] font-mono font-bold">{metrics.roi}%</span>
                <span className="text-[#4a5268] ml-3">Annual Net: </span>
                <span className="text-[#635bff] font-mono font-bold">${metrics.netAnnualSavings.toLocaleString()}</span>
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex gap-3">
              <button
                onClick={() => setSaveModalOpen(false)}
                className="flex-1 border border-[#1e2433] hover:border-[#2a3147] text-[#8b92a5] hover:text-white py-2.5 rounded-xl text-sm font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveScenario}
                className="flex-1 bg-[#635bff] hover:bg-[#5249e5] text-white py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Save size={14} /> Save Scenario
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          사이드 패널: 저장된 시나리오 목록
          - 오른쪽에서 슬라이드인 패널
          - 카드 클릭 → 즉시 슬라이더 값 업데이트 + 스무스 스크롤
          - ROI 배지로 한눈에 비교 가능
      ══════════════════════════════════════════════════════════════════════ */}
      {scenarioPanelOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          style={{ background: "rgba(0,0,0,0.65)" }}
          onClick={() => setScenarioPanelOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-[#13181f] border-l border-[#1e2433] h-full overflow-y-auto flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 패널 헤더 */}
            <div className="sticky top-0 bg-[#13181f] border-b border-[#1e2433] px-5 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <FolderOpen size={18} className="text-[#635bff]" />
                <div>
                  <h3 className="font-semibold text-white text-[15px]">Saved Scenarios</h3>
                  <p className="text-[10px] text-[#4a5268]">
                    {scenarios.length} saved · Click any to load
                  </p>
                </div>
              </div>
              <button
                onClick={() => setScenarioPanelOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#4a5268] hover:text-white hover:bg-[#1e2433] transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* 빈 상태 */}
            {scenarios.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-14 h-14 bg-[#1e2433] rounded-2xl flex items-center justify-center mb-4">
                  <FileText size={24} className="text-[#3d4560]" />
                </div>
                <p className="text-[#8b92a5] font-medium mb-2">No scenarios yet</p>
                <p className="text-xs text-[#3d4560] mb-6">Configure your inputs and save a scenario to compare different strategies.</p>
                <button
                  onClick={() => { setScenarioPanelOpen(false); setSaveModalOpen(true); }}
                  className="flex items-center gap-2 bg-[#635bff] hover:bg-[#5249e5] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <Plus size={14} /> Save First Scenario
                </button>
              </div>
            ) : (
              <div className="flex-1 p-4 space-y-3">
                {scenarios.map((s) => {
                  const roi = getScenarioROI(s);
                  const isActive = loadedId === s.id;
                  return (
                    <div
                      key={s.id}
                      onClick={() => handleLoadScenario(s)}
                      className={`group relative cursor-pointer rounded-xl border p-4 transition-all ${
                        isActive
                          ? "border-[#635bff]/60 bg-[#635bff]/5"
                          : "border-[#1e2433] bg-[#0d1117] hover:border-[#635bff]/30"
                      }`}
                    >
                      {/* 삭제 버튼 — hover 시만 표시 */}
                      <button
                        onClick={(e) => handleDeleteScenario(s.id, e)}
                        className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center text-[#3d4560] hover:text-[#f43f5e] hover:bg-[#f43f5e]/10 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={13} />
                      </button>

                      {/* 시나리오 이름 + 활성 배지 */}
                      <div className="flex items-center gap-2 mb-3 pr-8">
                        <p className="font-semibold text-sm text-white truncate">{s.name}</p>
                        {isActive && (
                          <span className="flex-shrink-0 text-[9px] bg-[#635bff]/20 text-[#a89fff] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            Active
                          </span>
                        )}
                      </div>

                      {/* 설정값 요약 */}
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs mb-3">
                        {[
                          { k: "Team",    v: `${s.teamSize} ppl` },
                          { k: "Rate",    v: `$${s.hourlyRate}/hr` },
                          { k: "Saved",   v: `${s.hoursSaved} hrs/wk` },
                          { k: "AI Cost", v: `$${s.aiToolCost.toLocaleString()}/mo` },
                        ].map(({ k, v }) => (
                          <div key={k}>
                            <span className="text-[#3d4560]">{k}: </span>
                            <span className="text-[#8b92a5] font-mono">{v}</span>
                          </div>
                        ))}
                      </div>

                      {/* 저장 날짜 + ROI 배지 */}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-[#4a5268] font-mono">
                          {new Date(s.savedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                        <span
                          className="text-xs font-bold font-mono px-2.5 py-1 rounded-lg"
                          style={{
                            background: roi >= 0 ? "rgba(0,212,170,0.12)" : "rgba(244,63,94,0.12)",
                            color:      roi >= 0 ? "#00d4aa"               : "#f43f5e",
                          }}
                        >
                          ROI {roi >= 0 ? "+" : ""}{roi}%
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* 새 시나리오 추가 버튼 */}
                {scenarios.length < 10 && (
                  <button
                    onClick={() => { setScenarioPanelOpen(false); setSaveModalOpen(true); }}
                    className="w-full border border-dashed border-[#1e2433] hover:border-[#635bff]/40 rounded-xl py-3 text-sm text-[#4a5268] hover:text-[#8b92a5] flex items-center justify-center gap-2 transition-all"
                  >
                    <Plus size={14} /> Save Current as New Scenario
                  </button>
                )}
              </div>
            )}

            {/* 전체 삭제 버튼 */}
            {scenarios.length > 0 && (
              <div className="sticky bottom-0 bg-[#13181f] border-t border-[#1e2433] p-4">
                <button
                  onClick={() => {
                    if (confirm("Delete all saved scenarios? This cannot be undone.")) {
                      setScenarios([]);
                      localStorage.removeItem(LS_KEY);
                      setLoadedId(null);
                    }
                  }}
                  className="w-full text-xs text-[#3d4560] hover:text-[#f43f5e] flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-[#f43f5e]/5 transition-all"
                >
                  <Trash2 size={12} /> Clear all scenarios
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </main>
  );
}
