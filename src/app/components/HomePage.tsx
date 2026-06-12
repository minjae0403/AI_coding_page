import { useMemo, useState } from "react";
import { Coffee, MapPinned, Search, Sparkles, Utensils } from "lucide-react";
import type { Store } from "./mockData";

interface Props {
  stores: Store[];
  onSelectStore: (store: Store) => void;
  onOpenMap: () => void;
}

const DISTRICTS = ["전체", "마포구", "성동구", "용산구", "강남구"];
const TYPES = [
  { value: "all", label: "전체", icon: Sparkles },
  { value: "cafe", label: "카페", icon: Coffee },
  { value: "restaurant", label: "식당", icon: Utensils },
];

function getCongestionInfo(value: number) {
  if (value < 30) return { label: "여유", dot: "#22c55e" };
  if (value < 60) return { label: "보통", dot: "#f59e0b" };
  if (value < 80) return { label: "혼잡", dot: "#ef4444" };
  return { label: "매우 혼잡", dot: "#b91c1c" };
}

function StoreCard({ store, onClick }: { store: Store; onClick: () => void }) {
  const reviews = store.menu.flatMap((menu) => menu.reviews);
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
      : null;
  const { label: congestionLabel, dot } = getCongestionInfo(store.congestion);

  return (
    <button
      type="button"
      onClick={onClick}
      className="overflow-hidden rounded-lg bg-white text-left transition-all duration-200 hover:shadow-md active:scale-[0.99]"
      style={{ border: "1px solid rgba(0,0,0,0.06)" }}
    >
      <div className="relative h-40 overflow-hidden">
        <img src={store.image} alt={store.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
        {avgRating && (
          <div className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-xs font-medium text-gray-800 shadow-sm backdrop-blur-sm">
            <span className="text-yellow-400">★</span>
            {avgRating}
          </div>
        )}
        <div className="absolute bottom-2.5 left-2.5">
          <span className="rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium text-gray-700 backdrop-blur-sm">
            {store.type === "cafe" ? "카페" : "식당"}
          </span>
        </div>
      </div>

      <div className="p-3.5">
        <div className="mb-1.5 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold leading-tight text-gray-900">{store.name}</h3>
            <p className="mt-0.5 truncate text-xs text-gray-400">
              {store.category} · {store.district}
            </p>
          </div>
          <div className="mt-0.5 flex shrink-0 items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: dot }} />
            <span className="text-xs text-gray-500">{congestionLabel}</span>
          </div>
        </div>

        <div className="mb-2.5 flex flex-wrap gap-1">
          {store.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 pt-2.5 text-xs text-gray-400">
          <span>리뷰 {reviews.length}개</span>
          <span>{store.menu.length}개 메뉴</span>
        </div>
      </div>
    </button>
  );
}

export function HomePage({ stores, onSelectStore, onOpenMap }: Props) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [districtFilter, setDistrictFilter] = useState("전체");

  const filtered = useMemo(() => {
    const keyword = search.trim();
    return stores.filter((store) => {
      const matchSearch =
        !keyword ||
        store.name.includes(keyword) ||
        store.category.includes(keyword) ||
        store.tags.some((tag) => tag.includes(keyword)) ||
        store.menu.some((menu) => menu.name.includes(keyword));
      const matchType = typeFilter === "all" || store.type === typeFilter;
      const matchDistrict = districtFilter === "전체" || store.district === districtFilter;
      return matchSearch && matchType && matchDistrict;
    });
  }, [stores, search, typeFilter, districtFilter]);

  const totalReviews = stores.reduce(
    (sum, store) => sum + store.menu.reduce((menuSum, menu) => menuSum + menu.reviews.length, 0),
    0
  );

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <header className="sticky top-0 z-20 border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Coffee className="h-5 w-5 text-[#3D6BF5]" />
            <span className="font-bold text-gray-900">맛기록</span>
          </div>
          <button
            type="button"
            onClick={onOpenMap}
            className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-blue-50 hover:text-[#3D6BF5]"
          >
            <MapPinned className="h-3.5 w-3.5" />
            지도에서 보기
          </button>
        </div>
      </header>

      <div className="border-b border-gray-100 bg-white px-4 py-3">
        <div className="mx-auto max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="매장 이름, 메뉴, 태그로 찾기"
              className="w-full rounded-lg bg-gray-100 py-2.5 pl-9 pr-4 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </div>
      </div>

      {!search && (
        <section className="mx-auto max-w-2xl px-4 pt-4">
          <div className="flex items-start gap-3 rounded-lg bg-white p-4" style={{ border: "1px solid #E5E7EB" }}>
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[#FF6B35]" />
            <div>
              <p className="mb-0.5 text-sm font-semibold text-gray-900">맛과 느낌을 직접 기록해보세요</p>
              <p className="text-xs leading-relaxed text-gray-500">
                카페와 식당의 메뉴별 맛, 향, 바디감을 남기면 취향 데이터가 쌓입니다.
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-2xl px-4 pb-1 pt-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {TYPES.map((type) => {
            const Icon = type.icon;
            const selected = typeFilter === type.value;
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => setTypeFilter(type.value)}
                className="flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm transition-all"
                style={{
                  backgroundColor: selected ? "#1A1D23" : "#FFFFFF",
                  color: selected ? "white" : "#6B7280",
                  border: `1px solid ${selected ? "#1A1D23" : "#E5E7EB"}`,
                }}
              >
                <Icon className="h-3.5 w-3.5" />
                {type.label}
              </button>
            );
          })}
          <div className="h-7 w-px shrink-0 self-center bg-gray-200" />
          {DISTRICTS.map((district) => {
            const selected = districtFilter === district;
            return (
              <button
                key={district}
                type="button"
                onClick={() => setDistrictFilter(district)}
                className="shrink-0 rounded-full px-3.5 py-1.5 text-sm transition-all"
                style={{
                  backgroundColor: selected ? "#FF6B35" : "#FFFFFF",
                  color: selected ? "white" : "#6B7280",
                  border: `1px solid ${selected ? "#FF6B35" : "#E5E7EB"}`,
                }}
              >
                {district}
              </button>
            );
          })}
        </div>
      </section>

      <main className="mx-auto max-w-2xl px-4 pb-8 pt-3">
        <p className="mb-3 text-xs text-gray-400">
          {filtered.length}개 매장
          {search && <span> · <span className="text-blue-500">"{search}"</span> 검색 결과</span>}
        </p>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((store) => (
              <StoreCard key={store.id} store={store} onClick={() => onSelectStore(store)} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <Search className="mx-auto mb-3 h-9 w-9 text-gray-300" />
            <p className="text-sm text-gray-400">검색 결과가 없습니다</p>
          </div>
        )}
      </main>

      <section className="mx-auto max-w-2xl px-4 pb-10">
        <div className="rounded-lg border border-gray-100 bg-white p-4">
          <p className="mb-2 text-sm font-medium text-gray-700">준비 중인 기능</p>
          <div className="grid grid-cols-2 gap-2">
            {["실시간 혼잡도 업데이트", "취향 기반 매장 추천", "리뷰 통계 대시보드", "시간대별 인기 메뉴"].map((feature) => (
              <div key={feature} className="flex items-center gap-1.5 text-xs text-gray-400">
                <span className="h-1 w-1 shrink-0 rounded-full bg-gray-300" />
                {feature}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
