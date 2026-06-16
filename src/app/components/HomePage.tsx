import { useState, useMemo } from "react";
import type { Store, UserProfile } from "./mockData";
import { computeSyncScore, COMPANION_OPTIONS, PURPOSE_OPTIONS } from "./mockData";
import { AiSearch } from "./AiSearch";
import { MapPinned } from "lucide-react"; // Import MapPinned

interface Props {
  stores: Store[];
  userProfile: UserProfile | null;
  onSelectStore: (store: Store) => void;
  onOpenMap: () => void; // Add prop
}

const DISTRICTS = ["전체", "마포구", "성동구", "용산구", "강남구"];
const TYPES = [
  { value: "all", label: "전체" },
  { value: "cafe", label: "카페" },
  { value: "restaurant", label: "식당" },
];

function getCongestionInfo(value: number) {
  if (value < 30) return { label: "여유", color: "#22c55e" };
  if (value < 60) return { label: "보통", color: "#f59e0b" };
  if (value < 80) return { label: "혼잡", color: "#ef4444" };
  return { label: "매우혼잡", color: "#b91c1c" };
}

function StoreCard({ store, showRating, userProfile, onClick }: {
  store: Store;
  showRating: boolean;
  userProfile: UserProfile | null;
  onClick: () => void;
}) {
  const totalReviews = store.menu.reduce((s, m) => s + m.reviews.length, 0);
  const avgRating = totalReviews > 0
    ? store.menu.flatMap((m) => m.reviews).reduce((s, r) => s + r.rating, 0) / totalReviews
    : null;
  const { label: congLabel, color: congColor } = getCongestionInfo(store.congestion);
  const syncScore = userProfile && totalReviews > 0 ? computeSyncScore(userProfile.prefs, store) : null;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl overflow-hidden cursor-pointer hover:shadow-md transition-all duration-200 active:scale-[0.98] group"
      style={{ border: "1px solid rgba(44,26,14,0.07)" }}
    >
      <div className="relative h-40 overflow-hidden">
        <img
          src={store.image}
          alt={store.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Sync score badge — top left */}
        {syncScore !== null && (
          <div
            className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-full px-2 py-0.5 backdrop-blur-sm"
            style={{ backgroundColor: syncScore >= 85 ? "rgba(196,130,42,0.92)" : "rgba(44,26,14,0.6)", }}
          >
            <span className="text-white text-xs font-semibold">✨ {syncScore}%</span>
          </div>
        )}

        {showRating && avgRating !== null && (
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-white/95 backdrop-blur-sm rounded-full px-2 py-0.5 shadow-sm">
            <span className="text-yellow-400 text-xs">★</span>
            <span className="text-xs font-medium text-gray-800">{avgRating.toFixed(1)}</span>
          </div>
        )}

        <div className="absolute bottom-2.5 left-2.5">
          <span className="text-xs rounded-full px-2.5 py-1 text-white/90" style={{ background: "rgba(44,26,14,0.55)", backdropFilter: "blur(4px)" }}>
            {store.type === "cafe" ? "☕ 카페" : "🍽 식당"}
          </span>
        </div>
      </div>

      <div className="p-3.5">
        <p className="text-xs text-[#7A6A58] mb-0.5">{store.category} · {store.district}</p>
        <h3 className="text-sm font-semibold text-[#1C1814] leading-snug mb-2">{store.name}</h3>

        <div className="flex flex-wrap gap-1 mb-3">
          {store.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#EDE6DB", color: "#7A6A58" }}>
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs pt-2.5" style={{ borderTop: "1px solid rgba(44,26,14,0.07)" }}>
          <span className="text-[#7A6A58]">리뷰 {totalReviews}개</span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: congColor }} />
            <span style={{ color: congColor }}>{congLabel}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export function HomePage({ stores, userProfile, onSelectStore, onOpenMap }: Props) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [districtFilter, setDistrictFilter] = useState("전체");
  const [showRating, setShowRating] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [companionFilter, setCompanionFilter] = useState<string | null>(null);
  const [purposeFilter, setPurposeFilter] = useState<string | null>(null);
  const [situationOpen, setSituationOpen] = useState(false);

  const filtered = useMemo(() => {
    return stores.filter((s) => {
      const matchSearch = !search ||
        s.name.includes(search) || s.category.includes(search) ||
        s.tags.some((t) => t.includes(search)) ||
        s.menu.some((m) => m.name.includes(search));
      const matchType = typeFilter === "all" || s.type === typeFilter;
      const matchDistrict = districtFilter === "전체" || s.district === districtFilter;

      // Situation filter
      const allReviews = s.menu.flatMap((m) => m.reviews);
      const matchCompanion = !companionFilter || allReviews.some((r) => r.companion === companionFilter);
      const matchPurpose = !purposeFilter || allReviews.some((r) => r.purpose === purposeFilter);

      return matchSearch && matchType && matchDistrict && matchCompanion && matchPurpose;
    });
  }, [stores, search, typeFilter, districtFilter, companionFilter, purposeFilter]);

  // If profile exists, sort by sync score
  const sortedFiltered = useMemo(() => {
    if (!userProfile) return filtered;
    return [...filtered].sort((a, b) => {
      const sa = computeSyncScore(userProfile.prefs, a);
      const sb = computeSyncScore(userProfile.prefs, b);
      return sb - sa;
    });
  }, [filtered, userProfile]);

  const totalReviews = stores.reduce((s, st) => s + st.menu.reduce((a, m) => a + m.reviews.length, 0), 0);
  const hasSituationFilter = companionFilter || purposeFilter;

  return (
    <>
      {aiOpen && <AiSearch stores={stores} onSelectStore={onSelectStore} onClose={() => setAiOpen(false)} />}

      <div className="min-h-screen bg-[#F7F3EE]">
        {/* Hero */}
        <div className="relative overflow-hidden" style={{ background: "#2C1A0E" }}>
          <div className="absolute inset-0 opacity-15" style={{
            backgroundImage: "url(https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&h=400&fit=crop&auto=format)",
            backgroundSize: "cover", backgroundPosition: "center",
          }} />
          <div className="relative max-w-2xl mx-auto px-5 pt-10 pb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="text-xl">🍴</span>
                <span className="text-white font-semibold tracking-wide" style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}>
                  맛기록
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={onOpenMap} className="text-white/80 hover:text-white">
                  <MapPinned className="h-5 w-5" />
                </button>
                {userProfile && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: "rgba(196,130,42,0.2)" }}>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: "linear-gradient(135deg, #C4822A, #E8A94A)", color: "white" }}>
                      {userProfile.nickname[0]}
                    </div>
                    <span className="text-xs text-white/80">{userProfile.nickname}</span>
                  </div>
                )}
                <div className="text-xs px-2.5 py-1 rounded-full" style={{ background: "rgba(196,130,42,0.25)", color: "#E8A94A", fontFamily: "var(--font-mono)" }}>
                  리뷰 {totalReviews}개
                </div>
              </div>
            </div>

            <h1 className="text-white mb-2 leading-tight" style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", fontStyle: "italic" }}>
              당신의 미각을<br />데이터로 남겨요
            </h1>
            <p className="text-white/55 text-sm mb-7 leading-relaxed">
              광고도, 순위도 없이 — 오직 사람들의 솔직한 맛 기록만 쌓입니다.
            </p>

            <div className="flex gap-2">
              <div className="flex-1 relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A6A58] text-sm">🔍</span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="매장·메뉴·#태그로 찾기"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/95 text-sm text-[#1C1814] outline-none focus:ring-2 ring-[#C4822A]/40"
                />
              </div>
              <button
                onClick={() => setAiOpen(true)}
                className="px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 shrink-0 transition-opacity hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #C4822A, #E8A94A)", color: "white" }}
              >
                <span>🔍</span>
                <span className="hidden sm:inline">AI 탐정</span>
              </button>
            </div>

            <button
              onClick={() => setAiOpen(true)}
              className="mt-3 w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
            >
              <span className="text-white/40 text-xs mr-1">AI 탐정 도루에게 →</span>
              <span className="text-white/70 text-xs">"강남구에 한적한 카페 어디있어?"</span>
            </button>
          </div>
        </div>

        {/* Situation filter bar */}
        <div className="bg-white px-4 py-2.5" style={{ borderBottom: "1px solid rgba(44,26,14,0.08)" }}>
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => setSituationOpen(!situationOpen)}
              className="flex items-center gap-2 text-sm transition-colors"
              style={{ color: hasSituationFilter ? "#C4822A" : "#7A6A58" }}
            >
              <span>🎯</span>
              <span>상황별 찾기</span>
              {hasSituationFilter && (
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#FFF5E8", color: "#C4822A" }}>
                  필터 적용 중
                </span>
              )}
              <span className="ml-auto text-xs">{situationOpen ? "▲" : "▼"}</span>
            </button>

            {situationOpen && (
              <div className="mt-3 flex flex-col gap-3 pb-1">
                <div>
                  <p className="text-xs text-[#7A6A58] mb-2">누구랑?</p>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {COMPANION_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setCompanionFilter(companionFilter === opt.value ? null : opt.value)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all shrink-0"
                        style={{
                          backgroundColor: companionFilter === opt.value ? "#FFF5E8" : "#F7F3EE",
                          color: companionFilter === opt.value ? "#C4822A" : "#7A6A58",
                          border: `1px solid ${companionFilter === opt.value ? "#C4822A" : "transparent"}`,
                        }}
                      >
                        <span>{opt.emoji}</span><span>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-[#7A6A58] mb-2">목적은?</p>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {PURPOSE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setPurposeFilter(purposeFilter === opt.value ? null : opt.value)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all shrink-0"
                        style={{
                          backgroundColor: purposeFilter === opt.value ? "#FFF5E8" : "#F7F3EE",
                          color: purposeFilter === opt.value ? "#C4822A" : "#7A6A58",
                          border: `1px solid ${purposeFilter === opt.value ? "#C4822A" : "transparent"}`,
                        }}
                      >
                        <span>{opt.emoji}</span><span>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                {hasSituationFilter && (
                  <button
                    onClick={() => { setCompanionFilter(null); setPurposeFilter(null); }}
                    className="text-xs text-[#C4822A] underline self-start"
                  >필터 초기화</button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Filters + rating toggle */}
        <div className="sticky top-0 z-10 bg-[#F7F3EE]/95 backdrop-blur-sm px-4 py-2.5" style={{ borderBottom: "1px solid rgba(44,26,14,0.08)" }}>
          <div className="max-w-2xl mx-auto flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none">
            {TYPES.map((t) => (
              <button key={t.value} onClick={() => setTypeFilter(t.value)}
                className="px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap transition-all shrink-0"
                style={{
                  backgroundColor: typeFilter === t.value ? "#2C1A0E" : "white",
                  color: typeFilter === t.value ? "white" : "#7A6A58",
                  border: `1px solid ${typeFilter === t.value ? "#2C1A0E" : "rgba(44,26,14,0.15)"}`,
                }}>
                {t.label}
              </button>
            ))}
            <div className="w-px h-4 bg-[rgba(44,26,14,0.15)] shrink-0" />
            {DISTRICTS.map((d) => (
              <button key={d} onClick={() => setDistrictFilter(d)}
                className="px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap transition-all shrink-0"
                style={{
                  backgroundColor: districtFilter === d ? "#C4822A" : "white",
                  color: districtFilter === d ? "white" : "#7A6A58",
                  border: `1px solid ${districtFilter === d ? "#C4822A" : "rgba(44,26,14,0.15)"}`,
                }}>
                {d}
              </button>
            ))}
            <div className="ml-auto shrink-0">
              <button
                onClick={() => setShowRating((v) => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all"
                style={{
                  backgroundColor: showRating ? "#FFF5E8" : "white",
                  color: showRating ? "#C4822A" : "#7A6A58",
                  border: `1px solid ${showRating ? "#C4822A" : "rgba(44,26,14,0.15)"}`,
                }}>
                <span>{showRating ? "★" : "☆"}</span><span>평점</span>
              </button>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-[#7A6A58]">
              {sortedFiltered.length}개 매장
              {search && <span> · <span style={{ color: "#C4822A" }}>"{search}"</span></span>}
              {hasSituationFilter && <span> · 상황 필터 적용</span>}
            </p>
            {userProfile && (
              <p className="text-xs text-[#7A6A58]">✨ 취향 순 정렬</p>
            )}
          </div>

          {sortedFiltered.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {sortedFiltered.map((store) => (
                <StoreCard
                  key={store.id}
                  store={store}
                  showRating={showRating}
                  userProfile={userProfile}
                  onClick={() => onSelectStore(store)}
                />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <div className="text-4xl mb-3">🔎</div>
              <p className="text-[#7A6A58] text-sm mb-2">검색 결과가 없어요</p>
              <button onClick={() => setAiOpen(true)} className="text-xs underline text-[#C4822A]">
                AI 탐정 도루에게 물어볼까요?
              </button>
            </div>
          )}
        </div>

        {/* Upcoming features */}
        <div className="max-w-2xl mx-auto px-4 pb-10">
          <div className="rounded-2xl p-5" style={{ backgroundColor: "white", border: "1px solid rgba(44,26,14,0.08)" }}>
            <p className="text-sm font-semibold text-[#1C1814] mb-3">🛠 곧 출시될 기능</p>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { icon: "🏪", text: "점주 실시간 혼잡도 업데이트" },
                { icon: "🧠", text: "취향 기반 AI 매장 추천" },
                { icon: "📊", text: "맛 데이터 통계 대시보드" },
                { icon: "📅", text: "시간대별 인기 메뉴 트렌드" },
              ].map((f) => (
                <div key={f.text} className="flex items-start gap-2">
                  <span className="text-base shrink-0">{f.icon}</span>
                  <span className="text-xs text-[#7A6A58] leading-relaxed">{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
