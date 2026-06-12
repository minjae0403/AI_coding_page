import { useState } from "react";
import { X } from "lucide-react";
import type { FlavorProfile, MenuItem, Store } from "./mockData";
import { FLAVOR_LABELS, RESTAURANT_FLAVOR_LABELS } from "./mockData";

interface Props {
  store: Store;
  menu: MenuItem;
  onSubmit: (review: {
    rating: number;
    flavorProfile: FlavorProfile;
    comment: string;
    tags: string[];
    userName: string;
  }) => void;
  onClose: () => void;
}

const CAFE_TAG_OPTIONS = [
  "밝은산미",
  "플로럴",
  "복합향",
  "초콜릿",
  "견과류",
  "카라멜",
  "진한바디",
  "가벼운바디",
  "균형잡힘",
  "과일향",
];

const RESTAURANT_TAG_OPTIONS = [
  "구수함",
  "칼칼함",
  "담백함",
  "진한맛",
  "중독적",
  "깔끔함",
  "풍미좋음",
  "집밥맛",
  "매콤함",
  "짭짤함",
];

const RATING_OPTIONS = [
  { value: 1, label: "1단계", description: "아쉬워요" },
  { value: 2, label: "2단계", description: "무난해요" },
  { value: 3, label: "3단계", description: "좋아요" },
];

function FlavorSlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-14 shrink-0 text-xs text-gray-500">{label}</span>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full"
        style={{
          background: `linear-gradient(to right, #3D6BF5 ${value}%, #E5E7EB ${value}%)`,
          accentColor: "#3D6BF5",
        }}
      />
      <span className="w-7 text-right text-xs tabular-nums text-[#3D6BF5]">{value}</span>
    </div>
  );
}

export function ReviewForm({ store, menu, onSubmit, onClose }: Props) {
  const [rating, setRating] = useState(2);
  const [flavor, setFlavor] = useState<FlavorProfile>({
    acidity: 50,
    sweetness: 50,
    bitterness: 50,
    body: 50,
    aroma: 50,
  });
  const [comment, setComment] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [userName, setUserName] = useState("");

  const labels = store.type === "cafe" ? FLAVOR_LABELS : RESTAURANT_FLAVOR_LABELS;
  const tagOptions = store.type === "cafe" ? CAFE_TAG_OPTIONS : RESTAURANT_TAG_OPTIONS;

  const toggleTag = (tag: string) => {
    setSelectedTags((current) => {
      if (current.includes(tag)) return current.filter((item) => item !== tag);
      if (current.length >= 5) return current;
      return [...current, tag];
    });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!comment.trim() || !userName.trim()) return;
    onSubmit({
      rating,
      flavorProfile: flavor,
      comment: comment.trim(),
      tags: selectedTags,
      userName: userName.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white" style={{ maxHeight: "92vh" }}>
        <div className="flex justify-center pb-1 pt-3">
          <div className="h-1 w-10 rounded-full bg-gray-200" />
        </div>

        <div className="border-b border-gray-100 px-5 pb-3 pt-2">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-xs text-gray-400">{store.name}</p>
              <h2 className="truncate text-base font-semibold text-gray-900">{menu.name}</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="리뷰 작성 닫기"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-5 py-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500">닉네임</label>
            <input
              value={userName}
              onChange={(event) => setUserName(event.target.value)}
              placeholder="사용할 닉네임"
              className="w-full rounded-lg bg-gray-100 px-3 py-2.5 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-200"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-gray-500">평가 단계</label>
            <div className="grid grid-cols-3 gap-2">
              {RATING_OPTIONS.map((option) => {
                const selected = rating === option.value;
                return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setRating(option.value)}
                  className="rounded-lg border px-2 py-2 text-center transition-all active:scale-[0.98]"
                  style={{
                    backgroundColor: selected ? "#EEF2FF" : "#FFFFFF",
                    borderColor: selected ? "#3D6BF5" : "#E5E7EB",
                    color: selected ? "#3D6BF5" : "#6B7280",
                  }}
                  aria-pressed={selected}
                >
                  <span className="block text-sm font-semibold">{option.label}</span>
                  <span className="mt-0.5 block text-[11px]">{option.description}</span>
                </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-3 block text-xs font-medium text-gray-500">
              맛 프로필
              <span className="ml-1 font-normal text-gray-400">(0-100)</span>
            </label>
            <div className="flex flex-col gap-3 rounded-lg bg-gray-50 p-3">
              {(Object.keys(flavor) as Array<keyof FlavorProfile>).map((key) => (
                <FlavorSlider
                  key={key}
                  label={labels[key]}
                  value={flavor[key]}
                  onChange={(value) => setFlavor((current) => ({ ...current, [key]: value }))}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-gray-500">
              태그 선택 <span className="font-normal text-gray-400">(최대 5개)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {tagOptions.map((tag) => {
                const selected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className="rounded-full px-3 py-1.5 text-xs transition-all"
                    style={{
                      backgroundColor: selected ? "#EEF2FF" : "#F3F4F6",
                      color: selected ? "#3D6BF5" : "#6B7280",
                      border: `1px solid ${selected ? "#3D6BF5" : "transparent"}`,
                    }}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500">한 줄 리뷰</label>
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="맛과 분위기에 대한 솔직한 느낌을 남겨주세요."
              rows={3}
              className="w-full resize-none rounded-lg bg-gray-100 px-3 py-2.5 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-200"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-[#3D6BF5] py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            리뷰 등록하기
          </button>
        </form>
      </div>
    </div>
  );
}
