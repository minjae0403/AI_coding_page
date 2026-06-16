import { useState, useMemo } from "react";
import type { Store, MenuItem, Review, UserProfile } from "./mockData";
import { CUISINE_LABELS, getCuisineType, computeSyncScore, COMPANION_OPTIONS, PURPOSE_OPTIONS } from "./mockData";
import { FlavorRadar } from "./FlavorRadar";
import { ReviewForm } from "./ReviewForm";

interface Props {
  store: Store;
  userProfile: UserProfile | null;
  onBack: () => void;
  onStoreUpdate: (store: Store) => void;
}

function getCongestionInfo(value: number) {
  if (value < 30) return { label: "여유", color: "#22c55e", bg: "#f0fdf4" };
  if (value < 60) return { label: "보통", color: "#f59e0b", bg: "#fffbeb" };
  if (value < 80) return { label: "혼잡", color: "#ef4444", bg: "#fef2f2" };
  return { label: "매우혼잡", color: "#b91c1c", bg: "#fee2e2" };
}

function SyncBadge({ score }: { score: number }) {
  const color = score >= 90 ? "#16a34a" : score >= 80 ? "#C4822A" : "#7A6A58";
  const bg = score >= 90 ? "#f0fdf4" : score >= 80 ? "#FFF5E8" : "#F7F3EE";
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ backgroundColor: bg }}>
      <span className="text-sm">✨</span>
      <span className="text-sm font-semibold" style={{ color }}>{score}%</span>
      <span className="text-xs" style={{ color }}>싱크로</span>
    </div>
  );
}

function ReviewCard({ review, showRating }: { review: Review; showRating: boolean }) {
  const companionLabel = COMPANION_OPTIONS.find((o) => o.value === review.companion);
  const purposeLabel = PURPOSE_OPTIONS.find((o) => o.value === review.purpose);

  return (
    <div className="py-3.5 last:pb-0" style={{ borderBottom: "1px solid rgba(44,26,14,0.07)" }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs text-white font-medium shrink-0"
            style={{ backgroundColor: "#C4822A" }}>
            {review.userName[0]}
          </div>
          <span className="text-sm font-medium text-[#1C1814]">{review.userName}</span>
        </div>
        <div className="flex items-center gap-2">
          {showRating && (
            <span className="text-yellow-400 text-sm">
              {"★".repeat(review.rating)}<span className="text-gray-200">{"★".repeat(5 - review.rating)}</span>
            </span>
          )}
          <span className="text-xs text-[#7A6A58]">{review.createdAt}</span>
        </div>
      </div>

      {/* Companion + purpose badges */}
      {(companionLabel || purposeLabel) && (
        <div className="flex gap-1.5 mb-2">
          {companionLabel && (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#EDE6DB", color: "#7A6A58" }}>
              {companionLabel.emoji} {companionLabel.label}
            </span>
          )}
          {purposeLabel && (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#EDE6DB", color: "#7A6A58" }}>
              {purposeLabel.emoji} {purposeLabel.label}
            </span>
          )}
        </div>
      )}

      {review.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1.5">
          {review.tags.map((tag) => (
            <span key={tag} className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: "#FFF5E8", color: "#C4822A" }}>
              #{tag}
            </span>
          ))}
        </div>
      )}
      <p className="text-sm text-[#4A3828] leading-relaxed">{review.comment}</p>
      <p className="text-xs text-[#7A6A58] mt-1.5">👍 {review.helpful}명에게 도움됨</p>
    </div>
  );
}

function MenuCard({ item, storeCategory, showRating, onReview }: {
  item: MenuItem;
  storeCategory: string;
  showRating: boolean;
  onReview: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const labels = CUISINE_LABELS[getCuisineType(storeCategory)];
  const avgRating = item.reviews.length > 0
    ? item.reviews.reduce((s, r) => s + r.rating, 0) / item.reviews.length
    : null;

  // Companion/purpose distribution for this menu
  const companionDist = useMemo(() => {
    const counts: Record<string, number> = {};
    item.reviews.forEach((r) => {
      if (r.companion) counts[r.companion] = (counts[r.companion] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3);
  }, [item.reviews]);

  return (
    <div className="bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(44,26,14,0.07)" }}>
      {item.image && (
        <div className="h-36 overflow-hidden">
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between mb-1">
          <div className="flex-1 min-w-0 mr-2">
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#EDE6DB", color: "#7A6A58" }}>
              {item.category}
            </span>
            <h3 className="text-sm font-semibold text-[#1C1814] mt-1.5">{item.name}</h3>
          </div>
          <span className="text-sm shrink-0 font-medium text-[#1C1814]" style={{ fontFamily: "var(--font-mono)" }}>
            {item.price.toLocaleString()}원
          </span>
        </div>

        <p className="text-xs text-[#7A6A58] mt-1 mb-3 leading-relaxed">{item.description}</p>

        {showRating && avgRating !== null && (
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-yellow-400 text-sm">★</span>
            <span className="text-sm font-semibold text-[#1C1814]">{avgRating.toFixed(1)}</span>
            <span className="text-xs text-[#7A6A58]">({item.reviews.length}개)</span>
          </div>
        )}

        {/* Companion distribution hint */}
        {companionDist.length > 0 && (
          <div className="flex items-center gap-1.5 mb-3 text-xs text-[#7A6A58]">
            <span>주로</span>
            {companionDist.map(([key]) => {
              const opt = COMPANION_OPTIONS.find((o) => o.value === key);
              return opt ? <span key={key}>{opt.emoji} {opt.label}</span> : null;
            })}
            <span>이 방문</span>
          </div>
        )}

        {!showRating && item.reviews.length > 0 && (
          <p className="text-xs text-[#7A6A58] mb-3">리뷰 {item.reviews.length}개 · 평점 숨김</p>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex-1 py-2 rounded-xl text-xs font-medium transition-colors"
            style={{ backgroundColor: "#EDE6DB", color: "#2C1A0E" }}
          >
            {expanded ? "접기" : `리뷰 ${item.reviews.length}개 보기`}
          </button>
          <button
            onClick={onReview}
            className="flex-1 py-2 rounded-xl text-xs font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#C4822A" }}
          >✍️ 리뷰 쓰기</button>
        </div>

        {expanded && (
          <div className="mt-4">
            {item.reviews.length > 0 ? (
              <>
                <div className="rounded-xl p-3 mb-3 flex justify-center" style={{ backgroundColor: "#F7F3EE" }}>
                  <FlavorRadar flavor={item.avgFlavor} labels={labels} size={180} color="#C4822A" />
                </div>
                {item.reviews.map((r) => <ReviewCard key={r.id} review={r} showRating={showRating} />)}
              </>
            ) : (
              <div className="py-8 text-center text-sm text-[#7A6A58]">
                아직 리뷰가 없어요 🙂<br />
                <span className="text-xs">첫 번째 리뷰를 남겨보세요!</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Aggregate store-level radar from all reviews
function StoreRadar({ store }: { store: Store }) {
  const cuisineType = getCuisineType(store.category);
  const labels = CUISINE_LABELS[cuisineType];
  const allReviews = store.menu.flatMap((m) => m.reviews);
  if (allReviews.length === 0) return null;

  const avgFlavor = {
    dim1: Math.round(allReviews.reduce((s, r) => s + r.flavorProfile.dim1, 0) / allReviews.length),
    dim2: Math.round(allReviews.reduce((s, r) => s + r.flavorProfile.dim2, 0) / allReviews.length),
    dim3: Math.round(allReviews.reduce((s, r) => s + r.flavorProfile.dim3, 0) / allReviews.length),
    dim4: Math.round(allReviews.reduce((s, r) => s + r.flavorProfile.dim4, 0) / allReviews.length),
    dim5: Math.round(allReviews.reduce((s, r) => s + r.flavorProfile.dim5, 0) / allReviews.length),
  };

  return (
    <div className="bg-white rounded-2xl p-4" style={{ border: "1px solid rgba(44,26,14,0.07)" }}>
      <p className="text-sm font-semibold text-[#1C1814] mb-1">이 매장의 맛 프로필</p>
      <p className="text-xs text-[#7A6A58] mb-3">{allReviews.length}명의 리뷰어가 남긴 데이터</p>
      <div className="flex justify-center">
        <FlavorRadar flavor={avgFlavor} labels={labels} size={200} color="#C4822A" />
      </div>
      {/* Bar summary */}
      <div className="mt-2 flex flex-col gap-2">
        {(Object.keys(avgFlavor) as Array<keyof typeof avgFlavor>).map((key) => (
          <div key={key} className="flex items-center gap-2">
            <span className="w-16 text-xs text-[#7A6A58] shrink-0">{labels[key]}</span>
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#EDE6DB" }}>
              <div className="h-full rounded-full" style={{ width: `${avgFlavor[key]}%`, backgroundColor: "#C4822A" }} />
            </div>
            <span className="text-xs tabular-nums" style={{ color: "#C4822A", fontFamily: "var(--font-mono)", width: 24, textAlign: "right" }}>
              {avgFlavor[key]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function StorePage({ store, userProfile, onBack, onStoreUpdate }: Props) {
  const [reviewTarget, setReviewTarget] = useState<MenuItem | null>(null);
  const [showRating, setShowRating] = useState(false);

  const syncScore = userProfile ? computeSyncScore(userProfile.prefs, store) : null;
  const { label: congLabel, color: congColor, bg: congBg } = getCongestionInfo(store.congestion);

  const handleReviewSubmit = (menuId: string, data: {
    rating: number; flavorProfile: any; comment: string; tags: string[];
    userName: string; companion?: any; purpose?: any;
  }) => {
    const newReview: Review = {
      id: `r-${Date.now()}`,
      userId: `u-${Date.now()}`,
      userName: data.userName,
      menuId,
      rating: data.rating,
      flavorProfile: data.flavorProfile,
      comment: data.comment,
      tags: data.tags,
      companion: data.companion,
      purpose: data.purpose,
      createdAt: new Date().toISOString().slice(0, 10),
      helpful: 0,
    };

    const updatedMenu = store.menu.map((item) => {
      if (item.id !== menuId) return item;
      const allReviews = [...item.reviews, newReview];
      const keys = ["dim1", "dim2", "dim3", "dim4", "dim5"] as const;
      const avgFlavor = {} as any;
      keys.forEach((k) => {
        avgFlavor[k] = Math.round(allReviews.reduce((s, r) => s + r.flavorProfile[k], 0) / allReviews.length);
      });
      return { ...item, reviews: allReviews, avgFlavor };
    });

    onStoreUpdate({ ...store, menu: updatedMenu });
    setReviewTarget(null);
  };

  const totalReviews = store.menu.reduce((s, m) => s + m.reviews.length, 0);
  const avgRating = totalReviews > 0
    ? store.menu.flatMap((m) => m.reviews).reduce((s, r) => s + r.rating, 0) / totalReviews
    : null;

  // Situation summary from all reviews
  const allReviews = store.menu.flatMap((m) => m.reviews);
  const topCompanions = useMemo(() => {
    const counts: Record<string, number> = {};
    allReviews.forEach((r) => { if (r.companion) counts[r.companion] = (counts[r.companion] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 2);
  }, [allReviews]);
  const topPurposes = useMemo(() => {
    const counts: Record<string, number> = {};
    allReviews.forEach((r) => { if (r.purpose) counts[r.purpose] = (counts[r.purpose] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 2);
  }, [allReviews]);

  return (
    <div className="min-h-screen bg-[#F7F3EE]">
      {/* Sticky header */}
      <div className="bg-white sticky top-0 z-10" style={{ borderBottom: "1px solid rgba(44,26,14,0.08)" }}>
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onBack}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#7A6A58] hover:bg-[#EDE6DB] transition-colors shrink-0"
              style={{ border: "1px solid rgba(44,26,14,0.1)" }}
            >←</button>
            <span className="font-semibold text-[#1C1814] truncate text-sm">{store.name}</span>
          </div>
          <button
            onClick={() => setShowRating((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs shrink-0 transition-all"
            style={{
              backgroundColor: showRating ? "#FFF5E8" : "transparent",
              color: showRating ? "#C4822A" : "#7A6A58",
              border: `1px solid ${showRating ? "#C4822A" : "rgba(44,26,14,0.15)"}`,
            }}
          >
            <span>{showRating ? "★" : "☆"}</span>
            <span>평점 {showRating ? "켜짐" : "숨김"}</span>
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className="h-52 overflow-hidden relative">
        <img src={store.image} alt={store.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        <div className="absolute bottom-4 left-5 right-5">
          <p className="text-white/60 text-xs mb-0.5">{store.category}</p>
          <h1 className="text-white font-semibold leading-tight" style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem" }}>
            {store.name}
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 flex flex-col gap-3">
        {/* Sync score banner */}
        {syncScore !== null && (
          <div
            className="rounded-2xl p-4 flex items-center gap-4"
            style={{ background: syncScore >= 85 ? "linear-gradient(135deg, #FFF5E8, #FFF0DC)" : "#F7F3EE", border: "1px solid rgba(196,130,42,0.2)" }}
          >
            <SyncBadge score={syncScore} />
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#1C1814]">
                {userProfile?.nickname}님과 {syncScore}% 취향 매칭
              </p>
              <p className="text-xs text-[#7A6A58] mt-0.5">
                {syncScore >= 90 ? "취향이 아주 잘 맞는 곳이에요! 강력 추천 🎯"
                  : syncScore >= 80 ? "취향이 꽤 잘 맞아요 👍"
                  : "취향이 조금 다를 수 있어요"}
              </p>
              {userProfile?.tags && userProfile.tags.length > 0 && (
                <div className="flex gap-1 mt-1.5">
                  {userProfile.tags.map((tag) => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#EDE6DB", color: "#7A6A58" }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info card */}
        <div className="bg-white rounded-2xl p-4" style={{ border: "1px solid rgba(44,26,14,0.07)" }}>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {store.tags.map((tag) => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#EDE6DB", color: "#7A6A58" }}>
                #{tag}
              </span>
            ))}
          </div>
          <p className="text-sm text-[#4A3828] leading-relaxed mb-4">{store.description}</p>
          <div className="flex flex-col gap-1.5 text-xs text-[#7A6A58] mb-4">
            <div className="flex gap-2 items-start"><span>📍</span><span>{store.address}</span></div>
            <div className="flex gap-2 items-start"><span>🕐</span><span>{store.hours}</span></div>
            <div className="flex gap-2"><span>📞</span><span>{store.phone}</span></div>
          </div>
          {/* Congestion */}
          <div className="rounded-xl px-3 py-2.5 flex items-center gap-3" style={{ backgroundColor: congBg }}>
            <span className="text-sm">🏪</span>
            <div className="flex-1">
              <p className="text-xs text-[#7A6A58] mb-1">지금 혼잡도</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-white/70 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${store.congestion}%`, backgroundColor: congColor }} />
                </div>
                <span className="text-xs font-medium" style={{ color: congColor }}>{congLabel}</span>
                <span className="text-xs text-[#7A6A58]">{store.congestionUpdated}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "메뉴", value: store.menu.length },
            { label: "리뷰", value: totalReviews },
            { label: "평점", value: showRating && avgRating !== null ? `${avgRating.toFixed(1)} ★` : "—", dim: !showRating },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-3 text-center" style={{ border: "1px solid rgba(44,26,14,0.07)" }}>
              <div className="font-bold" style={{ fontFamily: "var(--font-mono)", fontSize: "1.1rem", color: s.dim ? "#C9BFB3" : "#1C1814" }}>
                {s.value}
              </div>
              <div className="text-xs text-[#7A6A58] mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Situation summary */}
        {(topCompanions.length > 0 || topPurposes.length > 0) && (
          <div className="bg-white rounded-2xl p-4" style={{ border: "1px solid rgba(44,26,14,0.07)" }}>
            <p className="text-sm font-semibold text-[#1C1814] mb-3">주로 이런 분들이 방문해요</p>
            <div className="grid grid-cols-2 gap-3">
              {topCompanions.length > 0 && (
                <div>
                  <p className="text-xs text-[#7A6A58] mb-2">동행</p>
                  <div className="flex flex-col gap-1.5">
                    {topCompanions.map(([key, count]) => {
                      const opt = COMPANION_OPTIONS.find((o) => o.value === key);
                      return opt ? (
                        <div key={key} className="flex items-center gap-2">
                          <span className="text-base">{opt.emoji}</span>
                          <span className="text-xs text-[#4A3828]">{opt.label}</span>
                          <span className="text-xs text-[#7A6A58] ml-auto">{count}명</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
              {topPurposes.length > 0 && (
                <div>
                  <p className="text-xs text-[#7A6A58] mb-2">목적</p>
                  <div className="flex flex-col gap-1.5">
                    {topPurposes.map(([key, count]) => {
                      const opt = PURPOSE_OPTIONS.find((o) => o.value === key);
                      return opt ? (
                        <div key={key} className="flex items-center gap-2">
                          <span className="text-base">{opt.emoji}</span>
                          <span className="text-xs text-[#4A3828]">{opt.label}</span>
                          <span className="text-xs text-[#7A6A58] ml-auto">{count}명</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Aggregate flavor radar */}
        <StoreRadar store={store} />

        {!showRating && (
          <div className="rounded-xl px-4 py-3 text-xs text-[#7A6A58] flex items-center justify-between" style={{ backgroundColor: "#EDE6DB" }}>
            <span>광고·알바 없는 순수한 데이터를 지향해요 🙏</span>
            <button onClick={() => setShowRating(true)} className="shrink-0 ml-3 underline text-[#C4822A]">평점 보기</button>
          </div>
        )}

        {/* Menu */}
        <p className="text-sm font-semibold text-[#1C1814] mt-1">메뉴별 맛 기록</p>
        {store.menu.map((item) => (
          <MenuCard
            key={item.id}
            item={item}
            storeCategory={store.category}
            showRating={showRating}
            onReview={() => setReviewTarget(item)}
          />
        ))}
      </div>

      {reviewTarget && (
        <ReviewForm
          store={store}
          menu={reviewTarget}
          defaultNickname={userProfile?.nickname}
          onSubmit={(data) => handleReviewSubmit(reviewTarget.id, data)}
          onClose={() => setReviewTarget(null)}
        />
      )}
    </div>
  );
}
