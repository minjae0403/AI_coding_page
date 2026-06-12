import { useState } from "react";
import { ArrowLeft, Clock, ExternalLink, MapPin, Phone, Users } from "lucide-react";
import type { FlavorProfile, MenuItem, Review, Store } from "./mockData";
import { FLAVOR_LABELS, RESTAURANT_FLAVOR_LABELS } from "./mockData";
import { FlavorRadar } from "./FlavorRadar";
import { ReviewForm } from "./ReviewForm";

interface Props {
  store: Store;
  onBack: () => void;
  onStoreUpdate: (store: Store) => void;
}

function getCongestionInfo(value: number) {
  if (value < 30) return { label: "여유", color: "#22c55e", bg: "#f0fdf4" };
  if (value < 60) return { label: "보통", color: "#f59e0b", bg: "#fffbeb" };
  if (value < 80) return { label: "혼잡", color: "#ef4444", bg: "#fef2f2" };
  return { label: "매우 혼잡", color: "#b91c1c", bg: "#fee2e2" };
}

function StarDisplay({ rating }: { rating: number }) {
  const maxStars = 3; // 3단계 평점 기준
  const filledStars = rating;
  const emptyStars = maxStars - rating;
  return (
    <span className="text-sm text-yellow-400">
      {"★".repeat(filledStars)}
      <span className="text-gray-200">{"★".repeat(emptyStars)}</span>
    </span>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="border-b border-gray-100 py-3.5 last:border-0">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-500 text-xs font-medium text-white">
            {review.userName[0]}
          </div>
          <span className="truncate text-sm font-medium text-gray-800">{review.userName}</span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <StarDisplay rating={review.rating} />
          <span className="text-xs text-gray-400">{review.createdAt}</span>
        </div>
      </div>
      {review.tags.length > 0 && (
        <div className="mb-1.5 flex flex-wrap gap-1">
          {review.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-orange-50 px-2 py-0.5 text-xs text-orange-500">
              #{tag}
            </span>
          ))}
        </div>
      )}
      <p className="text-sm leading-relaxed text-gray-600">{review.comment}</p>
      <p className="mt-1.5 text-xs text-gray-400">{review.helpful}명이 도움 됨</p>
    </article>
  );
}

function MenuCard({
  item,
  storeType,
  onReview,
}: {
  item: MenuItem;
  storeType: Store["type"];
  onReview: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const labels = storeType === "cafe" ? FLAVOR_LABELS : RESTAURANT_FLAVOR_LABELS;
  const avgRating =
    item.reviews.length > 0
      ? (item.reviews.reduce((sum, review) => sum + review.rating, 0) / item.reviews.length).toFixed(1)
      : null;

  const itemTotalReviews = item.reviews.length;
  const itemReviewCounts = item.reviews.reduce((acc, review) => {
    acc[review.rating] = (acc[review.rating] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const itemRatingPercentages = {
    1: itemTotalReviews > 0 ? ((itemReviewCounts[1] || 0) / itemTotalReviews) * 100 : 0,
    2: itemTotalReviews > 0 ? ((itemReviewCounts[2] || 0) / itemTotalReviews) * 100 : 0,
    3: itemTotalReviews > 0 ? ((itemReviewCounts[3] || 0) / itemTotalReviews) * 100 : 0,
  };

  return (
    <article className="overflow-hidden rounded-lg border border-gray-100 bg-white">
      {item.image && (
        <div className="h-36 overflow-hidden">
          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
        </div>
      )}
      <div className="p-4">
        <div className="mb-1 flex items-start justify-between">
          <div className="mr-2 min-w-0 flex-1">
            <span className="mr-1.5 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-400">
              {item.category}
            </span>
            <h3 className="mt-1.5 text-sm font-semibold text-gray-900">{item.name}</h3>
          </div>
          <span className="shrink-0 text-sm font-medium tabular-nums text-gray-900">
            {item.price.toLocaleString()}원
          </span>
        </div>
        <p className="mb-3 mt-1 text-xs leading-relaxed text-gray-400">{item.description}</p>



        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setExpanded((current) => !current)}
            className="flex-1 rounded-lg bg-gray-100 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-200"
          >
            {expanded ? "접기" : `리뷰 ${item.reviews.length}개 보기`}
          </button>
          <button
            type="button"
            onClick={onReview}
            className="flex-1 rounded-lg bg-[#3D6BF5] py-2 text-xs font-medium text-white transition-opacity hover:opacity-90"
          >
            리뷰 쓰기
          </button>
        </div>

        {expanded && (
          <div className="mt-4">
            {item.reviews.length > 0 ? (
              <>
                <div className="mb-3 flex justify-center rounded-lg bg-gray-50 p-3">
                  <FlavorRadar flavor={item.avgFlavor} labels={labels} size={180} color="#3D6BF5" />
                </div>
                <div className="mb-3 rounded-lg border border-gray-100 bg-white p-3">
                  <p className="mb-2 text-center text-xs font-medium text-gray-500">메뉴 평점 비율</p>
                  <div className="flex flex-col gap-1.5">
                    {[3, 2, 1].map((ratingLevel) => (
                      <div key={ratingLevel} className="flex items-center gap-2">
                        <span className="w-4 shrink-0 text-xs font-medium text-gray-600">{ratingLevel}단계</span>
                        <div className="relative h-1.5 flex-1 rounded-full bg-gray-200">
                          <div
                            className="absolute inset-y-0 left-0 rounded-full bg-blue-500"
                            style={{ width: `${itemRatingPercentages[ratingLevel].toFixed(0)}%` }}
                          />
                        </div>
                        <span className="w-8 shrink-0 text-right text-xs tabular-nums text-gray-500">
                          {itemRatingPercentages[ratingLevel].toFixed(0)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                {item.reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </>
            ) : (
              <div className="py-8 text-center text-sm text-gray-400">
                아직 리뷰가 없어요.
                <br />
                <span className="text-xs">첫 번째 리뷰를 남겨보세요.</span>
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export function StorePage({ store, onBack, onStoreUpdate }: Props) {
  const [reviewTarget, setReviewTarget] = useState<MenuItem | null>(null);
  const { label: congestionLabel, color: congestionColor, bg: congestionBg } = getCongestionInfo(store.congestion);

  const handleReviewSubmit = (
    menuId: string,
    data: { rating: number; flavorProfile: FlavorProfile; comment: string; tags: string[]; userName: string }
  ) => {
    const newReview: Review = {
      id: `r-${Date.now()}`,
      userId: `u-${Date.now()}`,
      userName: data.userName,
      menuId,
      rating: data.rating,
      flavorProfile: data.flavorProfile,
      comment: data.comment,
      tags: data.tags,
      createdAt: new Date().toISOString().slice(0, 10),
      helpful: 0,
    };

    const updatedMenu = store.menu.map((item) => {
      if (item.id !== menuId) return item;
      const allReviews = [...item.reviews, newReview];
      const keys = Object.keys(data.flavorProfile) as Array<keyof FlavorProfile>;
      const avgFlavor = keys.reduce((result, key) => {
        result[key] = Math.round(allReviews.reduce((sum, review) => sum + review.flavorProfile[key], 0) / allReviews.length);
        return result;
      }, {} as FlavorProfile);

      return { ...item, reviews: allReviews, avgFlavor };
    });

    onStoreUpdate({ ...store, menu: updatedMenu });
    setReviewTarget(null);
  };

  const totalReviews = store.menu.reduce((sum, menu) => sum + menu.reviews.length, 0);
  const allReviews = store.menu.flatMap((menu) => menu.reviews);
  const avgRating =
    allReviews.length > 0
      ? (allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length).toFixed(1)
      : null;

  const reviewCounts = allReviews.reduce((acc, review) => {
    acc[review.rating] = (acc[review.rating] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const ratingPercentages = {
    1: totalReviews > 0 ? ((reviewCounts[1] || 0) / totalReviews) * 100 : 0,
    2: totalReviews > 0 ? ((reviewCounts[2] || 0) / totalReviews) * 100 : 0,
    3: totalReviews > 0 ? ((reviewCounts[3] || 0) / totalReviews) * 100 : 0,
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <header className="sticky top-0 z-10 border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={onBack}
            aria-label="뒤로 가기"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <span className="truncate font-semibold text-gray-900">{store.name}</span>
        </div>
      </header>

      <section className="relative h-52 overflow-hidden">
        <img src={store.image} alt={store.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <p className="mb-0.5 text-xs text-white/70">{store.category}</p>
          <h1 className="text-xl font-bold text-white">{store.name}</h1>
        </div>
      </section>

      <main className="mx-auto flex max-w-2xl flex-col gap-3 px-4 py-4">
        <section className="rounded-lg border border-gray-100 bg-white p-4">
          <div className="mb-3 flex flex-wrap gap-1.5">
            {store.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                #{tag}
              </span>
            ))}
          </div>

          <p className="mb-4 text-sm leading-relaxed text-gray-600">{store.description}</p>

          <div className="mb-4 flex flex-col gap-1.5 text-xs text-gray-500">
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span className="flex-1">{store.address}</span>
              <a
                href={`https://map.naver.com/p/search/${encodeURIComponent(store.address)}`}
                target="_blank"
                rel="noreferrer"
                aria-label={`${store.name} 지도에서 보기`}
                className="ml-2 inline-flex shrink-0 items-center gap-1 rounded-full border border-gray-200 bg-white px-2 py-0.5 text-xs font-medium text-gray-600 transition-colors hover:border-[#3D6BF5] hover:text-[#3D6BF5]"
              >
                지도
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{store.hours}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 shrink-0" />
              <span>{store.phone}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg px-3 py-2.5" style={{ backgroundColor: congestionBg }}>
            <Users className="h-4 w-4 shrink-0" style={{ color: congestionColor }} />
            <div className="flex-1">
              <p className="mb-1 text-xs text-gray-500">지금 혼잡도</p>
              <div className="flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/70">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${store.congestion}%`, backgroundColor: congestionColor }}
                  />
                </div>
                <span className="text-xs font-medium" style={{ color: congestionColor }}>
                  {congestionLabel}
                </span>
                <span className="text-xs text-gray-400">{store.congestionUpdated}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-gray-100 bg-white p-3 text-center">
            <div className="text-lg font-bold tabular-nums text-gray-900">{store.menu.length}</div>
            <div className="mt-0.5 text-xs text-gray-400">메뉴</div>
          </div>
          <div className="rounded-lg border border-gray-100 bg-white p-3 text-center">
            <div className="text-lg font-bold tabular-nums text-gray-900">{totalReviews}</div>
            <div className="mt-0.5 text-xs text-gray-400">리뷰</div>
          </div>
          <div className="rounded-lg border border-gray-100 bg-white p-3">
            <div className="text-center text-xs text-gray-400">평점 비율</div>
            <div className="mt-2 flex flex-col gap-1.5">
              {[3, 2, 1].map((ratingLevel) => (
                <div key={ratingLevel} className="flex items-center gap-2">
                  <span className="w-4 text-xs font-medium text-gray-600">{ratingLevel}단계</span>
                  <div className="relative h-1.5 flex-1 rounded-full bg-gray-200">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-blue-500"
                      style={{ width: `${ratingPercentages[ratingLevel].toFixed(0)}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-xs tabular-nums text-gray-500">
                    {ratingPercentages[ratingLevel].toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <p className="mt-1 text-sm font-semibold text-gray-900">메뉴별 리뷰</p>
        {store.menu.map((item) => (
          <MenuCard key={item.id} item={item} storeType={store.type} onReview={() => setReviewTarget(item)} />
        ))}
      </main>

      {reviewTarget && (
        <ReviewForm
          store={store}
          menu={reviewTarget}
          onSubmit={(data) => handleReviewSubmit(reviewTarget.id, data)}
          onClose={() => setReviewTarget(null)}
        />
      )}
    </div>
  );
}
