import { useState } from "react";
import { ArrowLeft, Sparkles } from "lucide-react";
import type { FlavorProfile, MenuItem, Review, Store } from "./mockData";
import { FLAVOR_LABELS, RESTAURANT_FLAVOR_LABELS } from "./mockData";
import { FlavorRadar } from "./FlavorRadar";
import { ReviewForm } from "./ReviewForm"; // ReviewForm import 추가

interface Props {
  store: Store;
  menu: MenuItem;
  onBack: () => void;
  onGoHome: () => void;
  onStoreUpdate: (store: Store) => void; // 리뷰 등록 후 Store 업데이트를 위해 추가
}

function StarDisplay({ rating }: { rating: number }) {
  const maxStars = 3;
  const filledStars = Math.min(rating, maxStars);
  const emptyStars = Math.max(0, maxStars - filledStars);
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

export function MenuDetailPage({ store, menu, onBack, onGoHome, onStoreUpdate }: Props) {
  const [reviewFormOpen, setReviewFormOpen] = useState(false); // 리뷰 폼 상태 관리

  const labels = store.type === "cafe" ? FLAVOR_LABELS : RESTAURANT_FLAVOR_LABELS;

  // 메뉴별 리뷰 데이터
  const itemTotalReviews = menu.reviews.length;
  const itemReviewCounts = menu.reviews.reduce((acc, review) => {
    acc[review.rating] = (acc[review.rating] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const itemRatingPercentages = {
    1: itemTotalReviews > 0 ? ((itemReviewCounts[1] || 0) / itemTotalReviews) * 100 : 0,
    2: itemTotalReviews > 0 ? ((itemReviewCounts[2] || 0) / itemTotalReviews) * 100 : 0,
    3: itemTotalReviews > 0 ? ((itemReviewCounts[3] || 0) / itemTotalReviews) * 100 : 0,
  };

  const goodReviewsCount = menu.reviews.filter(review => review.rating === 3).length;
  const goodReviewsPercentage = menu.reviews.length > 0 ? (goodReviewsCount / menu.reviews.length) * 100 : 0;

  const handleReviewSubmit = (
    data: { rating: number; flavorProfile: FlavorProfile; comment: string; tags: string[]; userName: string }
  ) => {
    const newReview: Review = {
      id: `r-${Date.now()}`,
      userId: `u-${Date.now()}`,
      userName: data.userName,
      menuId: menu.id,
      rating: data.rating,
      flavorProfile: data.flavorProfile,
      comment: data.comment,
      tags: data.tags,
      createdAt: new Date().toISOString().slice(0, 10),
      helpful: 0,
    };

    const updatedMenu = store.menu.map((item) => {
      if (item.id !== menu.id) return item;
      const allReviews = [...item.reviews, newReview];
      const keys = Object.keys(data.flavorProfile) as Array<keyof FlavorProfile>;
      const avgFlavor = keys.reduce((result, key) => {
        result[key] = Math.round(allReviews.reduce((sum, review) => sum + review.flavorProfile[key], 0) / allReviews.length);
        return result;
      }, {} as FlavorProfile);

      return { ...item, reviews: allReviews, avgFlavor };
    });

    onStoreUpdate({ ...store, menu: updatedMenu });
    setReviewFormOpen(false);
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
          <span className="truncate font-semibold text-gray-900">{menu.name} 상세</span>
        </div>
      </header>

      <main className="mx-auto flex max-w-2xl flex-col gap-3 px-4 py-4">
        {menu.image && (
          <section className="h-52 overflow-hidden rounded-lg">
            <img src={menu.image} alt={menu.name} className="h-full w-full object-cover" />
          </section>
        )}

        <section className="rounded-lg border border-gray-100 bg-white p-4">
          <p className="mb-0.5 text-xs text-gray-400">{store.name}</p>
          <h1 className="text-xl font-bold text-gray-900">{menu.name}</h1>
          <p className="mt-1 text-sm text-gray-600">{menu.description}</p>
          <p className="mt-2 text-lg font-bold tabular-nums text-gray-900">
            {menu.price.toLocaleString()}원
          </p>

          <div className="mt-4 border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900">리뷰 ({menu.reviews.length}개)</p>
              {menu.tags?.includes("#커피") ? (
                <button
                  type="button"
                  onClick={() => setReviewFormOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-md bg-[#3D6BF5] px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  리뷰 쓰기
                </button>
              ) : (
                <span className="text-xs text-gray-400">리뷰 작성이 불가능한 메뉴입니다.</span>
              )}
            </div>

            {menu.reviews.length > 0 && (
              <div className="mt-4">
                {/* 메뉴 평점 비율 */}
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

                {/* 맛 프로필 레이더 */}
                {menu.avgFlavor && (
                  <div className="mb-3 flex justify-center rounded-lg bg-gray-50 p-3">
                    <FlavorRadar flavor={menu.avgFlavor} labels={labels} size={180} color="#3D6BF5" />
                  </div>
                )}
                
                {/* 개별 리뷰 목록 */}
                <div className="mt-4 border-t border-gray-100">
                  {menu.reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              </div>
            )}
            
            {menu.reviews.length === 0 && (
              <div className="py-8 text-center text-sm text-gray-400">
                <p className="mb-4">아직 이 메뉴의 리뷰가 없어요.</p>
                <button
                  type="button"
                  onClick={onGoHome}
                  className="rounded-lg bg-gray-900 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-gray-800"
                >
                  홈으로 돌아가기
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      {reviewFormOpen && (
        <ReviewForm
          store={store}
          menu={menu}
          onSubmit={handleReviewSubmit}
          onClose={() => setReviewFormOpen(false)}
        />
      )}
    </div>
  );
}