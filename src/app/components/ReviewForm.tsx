import { useState } from "react";
import type { FlavorProfile, MenuItem, Store, CompanionType, PurposeType } from "./mockData";
import { CUISINE_LABELS, CUISINE_TAGS, getCuisineType, COMPANION_OPTIONS, PURPOSE_OPTIONS } from "./mockData";

interface Props {
  store: Store;
  menu: MenuItem;
  onSubmit: (review: {
    rating: number;
    flavorProfile: FlavorProfile;
    comment: string;
    tags: string[];
    userName: string;
    companion?: CompanionType;
    purpose?: PurposeType;
  }) => void;
  onClose: () => void;
  defaultNickname?: string;
}

const RATING_LABELS = ["", "별로예요", "그냥 그래요", "괜찮아요", "좋아요", "최고예요!"];

const CUISINE_TYPE_LABEL: Record<string, string> = {
  cafe_dessert: "☕ 카페·디저트",
  korean_chinese: "🍲 한식·중식",
  western_japanese: "🍝 양식·일식",
};

function FlavorSlider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-16 text-xs text-[#7A6A58] shrink-0 leading-tight">{label}</span>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #C4822A ${value}%, #EDE6DB ${value}%)`,
          accentColor: "#C4822A",
        }}
      />
      <span className="w-7 text-xs text-right tabular-nums shrink-0" style={{ color: "#C4822A", fontFamily: "var(--font-mono)" }}>
        {value}
      </span>
    </div>
  );
}

export function ReviewForm({ store, menu, onSubmit, onClose, defaultNickname = "" }: Props) {
  const cuisineType = getCuisineType(store.category);
  const labels = CUISINE_LABELS[cuisineType];
  const tagOptions = CUISINE_TAGS[cuisineType];

  const [step, setStep] = useState<"context" | "flavor" | "comment">("context");
  const [rating, setRating] = useState(4);
  const [hoverRating, setHoverRating] = useState(0);
  const [companion, setCompanion] = useState<CompanionType | undefined>();
  const [purpose, setPurpose] = useState<PurposeType | undefined>();
  const [flavor, setFlavor] = useState<FlavorProfile>({ dim1: 50, dim2: 50, dim3: 50, dim4: 50, dim5: 50 });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [userName, setUserName] = useState(defaultNickname);

  const toggleTag = (tag: string) =>
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : prev.length < 5 ? [...prev, tag] : prev
    );

  const handleSubmit = () => {
    if (!comment.trim() || !userName.trim()) return;
    onSubmit({ rating, flavorProfile: flavor, comment, tags: selectedTags, userName, companion, purpose });
  };

  const displayRating = hoverRating || rating;
  const totalSteps = 3;
  const stepIndex = step === "context" ? 1 : step === "flavor" ? 2 : 3;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-t-3xl overflow-y-auto" style={{ maxHeight: "92vh" }}>
        {/* Handle + progress */}
        <div className="px-5 pt-3 pb-3">
          <div className="flex justify-center mb-3">
            <div className="w-10 h-1 rounded-full bg-[#EDE6DB]" />
          </div>
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className="flex-1 h-1 rounded-full transition-all"
                style={{ backgroundColor: s <= stepIndex ? "#C4822A" : "#EDE6DB" }}
              />
            ))}
          </div>
        </div>

        {/* Header */}
        <div className="px-5 pb-3" style={{ borderBottom: "1px solid rgba(44,26,14,0.08)" }}>
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-xs text-[#7A6A58]">{store.name}</p>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#EDE6DB", color: "#7A6A58" }}>
                  {CUISINE_TYPE_LABEL[cuisineType]}
                </span>
              </div>
              <h2 className="text-base font-semibold text-[#1C1814]">{menu.name}</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#7A6A58] hover:bg-[#EDE6DB] transition-colors text-sm shrink-0"
              style={{ border: "1px solid rgba(44,26,14,0.1)" }}
            >✕</button>
          </div>
        </div>

        <div className="px-5 py-5">
          {/* STEP 1: Context (companion + purpose + rating + nickname) */}
          {step === "context" && (
            <div className="flex flex-col gap-5">
              <div>
                <p className="text-xs font-medium text-[#7A6A58] mb-2">누구와 방문했나요?</p>
                <div className="grid grid-cols-3 gap-2">
                  {COMPANION_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setCompanion(companion === opt.value ? undefined : opt.value)}
                      className="flex flex-col items-center py-2.5 rounded-xl text-xs transition-all gap-1"
                      style={{
                        backgroundColor: companion === opt.value ? "#FFF5E8" : "#F7F3EE",
                        color: companion === opt.value ? "#C4822A" : "#7A6A58",
                        border: `1.5px solid ${companion === opt.value ? "#C4822A" : "transparent"}`,
                      }}
                    >
                      <span className="text-xl">{opt.emoji}</span>
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-[#7A6A58] mb-2">방문 목적은요?</p>
                <div className="flex flex-wrap gap-2">
                  {PURPOSE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setPurpose(purpose === opt.value ? undefined : opt.value)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs transition-all"
                      style={{
                        backgroundColor: purpose === opt.value ? "#FFF5E8" : "#F7F3EE",
                        color: purpose === opt.value ? "#C4822A" : "#7A6A58",
                        border: `1.5px solid ${purpose === opt.value ? "#C4822A" : "transparent"}`,
                      }}
                    >
                      <span>{opt.emoji}</span>
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-[#7A6A58] mb-2">전반적인 만족도</p>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="text-2xl transition-transform active:scale-90"
                      style={{ color: star <= displayRating ? "#FBBF24" : "#EDE6DB" }}
                    >★</button>
                  ))}
                  <span className="text-sm text-[#7A6A58] ml-1">{RATING_LABELS[displayRating]}</span>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-[#7A6A58] mb-1.5">닉네임</p>
                <input
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="사용할 닉네임"
                  className="w-full px-3 py-2.5 rounded-xl text-sm text-[#1C1814] outline-none focus:ring-2 ring-[#C4822A]/40 transition-all"
                  style={{ backgroundColor: "#F7F3EE", border: "1px solid rgba(44,26,14,0.12)" }}
                />
              </div>

              <button
                onClick={() => setStep("flavor")}
                className="w-full py-3.5 rounded-xl text-white text-sm font-semibold"
                style={{ backgroundColor: "#2C1A0E" }}
              >
                다음 — 맛 프로필 →
              </button>
            </div>
          )}

          {/* STEP 2: Flavor sliders + tags */}
          {step === "flavor" && (
            <div className="flex flex-col gap-5">
              <div>
                <p className="text-xs font-medium text-[#7A6A58] mb-1">맛 평가 슬라이더</p>
                <p className="text-xs text-[#7A6A58]/60 mb-3">{CUISINE_TYPE_LABEL[cuisineType]} 기준</p>
                <div className="rounded-xl p-3 flex flex-col gap-3.5" style={{ backgroundColor: "#F7F3EE" }}>
                  {(Object.keys(flavor) as Array<keyof FlavorProfile>).map((key) => (
                    <FlavorSlider
                      key={key}
                      label={labels[key]}
                      value={flavor[key]}
                      onChange={(v) => setFlavor((prev) => ({ ...prev, [key]: v }))}
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-[#7A6A58] mb-2">
                  태그 <span className="font-normal text-[#7A6A58]/60">(최대 5개)</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {tagOptions.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className="px-3 py-1.5 rounded-full text-xs transition-all"
                      style={{
                        backgroundColor: selectedTags.includes(tag) ? "#FFF5E8" : "#F7F3EE",
                        color: selectedTags.includes(tag) ? "#C4822A" : "#7A6A58",
                        border: `1px solid ${selectedTags.includes(tag) ? "#C4822A" : "rgba(44,26,14,0.12)"}`,
                      }}
                    >#{tag}</button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setStep("context")}
                  className="flex-1 py-3 rounded-xl text-sm font-medium"
                  style={{ backgroundColor: "#EDE6DB", color: "#2C1A0E" }}
                >← 이전</button>
                <button
                  onClick={() => setStep("comment")}
                  className="flex-1 py-3 rounded-xl text-white text-sm font-semibold"
                  style={{ backgroundColor: "#2C1A0E" }}
                >다음 →</button>
              </div>
            </div>
          )}

          {/* STEP 3: Comment + submit */}
          {step === "comment" && (
            <div className="flex flex-col gap-5">
              <div>
                <p className="text-xs font-medium text-[#7A6A58] mb-1.5">한 줄 리뷰</p>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="솔직한 느낌을 자유롭게 남겨주세요 🙂"
                  rows={5}
                  autoFocus
                  className="w-full px-3 py-2.5 rounded-xl text-sm text-[#1C1814] outline-none focus:ring-2 ring-[#C4822A]/40 transition-all resize-none"
                  style={{ backgroundColor: "#F7F3EE", border: "1px solid rgba(44,26,14,0.12)" }}
                />
              </div>

              {/* Summary before submit */}
              <div className="rounded-xl p-3 flex flex-wrap gap-2" style={{ backgroundColor: "#F7F3EE" }}>
                {companion && (
                  <span className="text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: "#EDE6DB", color: "#7A6A58" }}>
                    {COMPANION_OPTIONS.find((o) => o.value === companion)?.emoji} {COMPANION_OPTIONS.find((o) => o.value === companion)?.label}
                  </span>
                )}
                {purpose && (
                  <span className="text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: "#EDE6DB", color: "#7A6A58" }}>
                    {PURPOSE_OPTIONS.find((o) => o.value === purpose)?.emoji} {PURPOSE_OPTIONS.find((o) => o.value === purpose)?.label}
                  </span>
                )}
                {selectedTags.map((tag) => (
                  <span key={tag} className="text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: "#FFF5E8", color: "#C4822A" }}>
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setStep("flavor")}
                  className="flex-1 py-3 rounded-xl text-sm font-medium"
                  style={{ backgroundColor: "#EDE6DB", color: "#2C1A0E" }}
                >← 이전</button>
                <button
                  onClick={handleSubmit}
                  disabled={!comment.trim() || !userName.trim()}
                  className="flex-1 py-3 rounded-xl text-white text-sm font-semibold transition-opacity disabled:opacity-40"
                  style={{ backgroundColor: "#C4822A" }}
                >등록하기</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
