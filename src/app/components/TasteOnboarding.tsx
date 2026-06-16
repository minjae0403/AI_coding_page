import { useState } from "react";
import type { UserProfile, UserTastePrefs } from "./mockData";

interface Props {
  onComplete: (profile: UserProfile) => void;
}

interface Question {
  id: keyof UserTastePrefs;
  emoji: string;
  question: string;
  leftLabel: string;
  rightLabel: string;
  leftEmoji: string;
  rightEmoji: string;
}

const QUESTIONS: Question[] = [
  {
    id: "spicy",
    emoji: "🌶️",
    question: "매운 음식을 얼마나 좋아하나요?",
    leftLabel: "순한 게 좋아요",
    rightLabel: "매울수록 좋아요",
    leftEmoji: "😊",
    rightEmoji: "🔥",
  },
  {
    id: "sweet",
    emoji: "🍯",
    question: "단 것을 얼마나 즐기나요?",
    leftLabel: "달지 않은 게 좋아요",
    rightLabel: "달달한 게 좋아요",
    leftEmoji: "🫖",
    rightEmoji: "🧁",
  },
  {
    id: "value",
    emoji: "💰",
    question: "가성비가 얼마나 중요한가요?",
    leftLabel: "분위기·퀄리티가 우선",
    rightLabel: "가성비가 최우선",
    leftEmoji: "✨",
    rightEmoji: "💰",
  },
  {
    id: "aesthetic",
    emoji: "📸",
    question: "분위기·비주얼이 중요한가요?",
    leftLabel: "맛만 있으면 돼요",
    rightLabel: "눈이 즐거워야 해요",
    leftEmoji: "🍽️",
    rightEmoji: "🎨",
  },
  {
    id: "depth",
    emoji: "🧑‍🍳",
    question: "전문성·깊은 맛이 중요한가요?",
    leftLabel: "편하게 먹고 싶어요",
    rightLabel: "장인의 맛을 원해요",
    leftEmoji: "😌",
    rightEmoji: "🏆",
  },
];

const TASTE_TAGS = [
  "맵파당", "순한맛파", "디저트진심러", "커피덕후", "가성비헌터",
  "감성카페러", "고기러버", "채소파", "분위기중시", "혼밥고수",
];

function deriveUserTags(prefs: UserTastePrefs): string[] {
  const tags: string[] = [];
  if (prefs.spicy >= 65) tags.push("맵파당");
  else if (prefs.spicy <= 35) tags.push("순한맛파");
  if (prefs.sweet >= 65) tags.push("디저트진심러");
  if (prefs.depth >= 70) tags.push("커피덕후");
  if (prefs.value >= 65) tags.push("가성비헌터");
  if (prefs.aesthetic >= 65) tags.push("감성카페러");
  return tags.slice(0, 3);
}

export function TasteOnboarding({ onComplete }: Props) {
  const [step, setStep] = useState<"intro" | "questions" | "tags" | "nickname">("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [prefs, setPrefs] = useState<UserTastePrefs>({
    spicy: 50, sweet: 50, value: 50, aesthetic: 50, depth: 50,
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [nickname, setNickname] = useState("");

  const question = QUESTIONS[currentQ];
  const progress = ((currentQ + 1) / QUESTIONS.length) * 100;

  const handleSliderAnswer = (value: number) => {
    setPrefs((prev) => ({ ...prev, [question.id]: value }));
  };

  const nextQuestion = () => {
    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ((q) => q + 1);
    } else {
      const derived = deriveUserTags(prefs);
      setSelectedTags(derived);
      setStep("tags");
    }
  };

  const toggleTag = (tag: string) =>
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : prev.length < 4 ? [...prev, tag] : prev
    );

  const handleComplete = () => {
    if (!nickname.trim()) return;
    onComplete({ nickname: nickname.trim(), tags: selectedTags, prefs });
  };

  // Intro
  if (step === "intro") {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#2C1A0E] px-6">
        <div className="text-center max-w-xs">
          <div className="text-6xl mb-6">🍴</div>
          <h1
            className="text-white mb-3"
            style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", fontStyle: "italic" }}
          >
            당신의 입맛을<br />알려주세요
          </h1>
          <p className="text-white/55 text-sm leading-relaxed mb-8">
            5가지 질문으로 나만의 취향 프로필을 만들면,<br />
            매장과의 싱크로율을 바로 볼 수 있어요.
          </p>
          <button
            onClick={() => setStep("questions")}
            className="w-full py-4 rounded-2xl text-[#2C1A0E] font-semibold text-base transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #C4822A, #E8A94A)" }}
          >
            취향 테스트 시작하기
          </button>
          <button
            onClick={() => onComplete({ nickname: "익명", tags: [], prefs: { spicy: 50, sweet: 50, value: 50, aesthetic: 50, depth: 50 } })}
            className="mt-3 w-full py-3 rounded-2xl text-white/40 text-sm"
          >
            나중에 할게요
          </button>
        </div>
      </div>
    );
  }

  // Questions
  if (step === "questions") {
    const currentValue = prefs[question.id];
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-[#F7F3EE]">
        {/* Progress */}
        <div className="bg-white px-5 pt-5 pb-4" style={{ borderBottom: "1px solid rgba(44,26,14,0.08)" }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#7A6A58]">{currentQ + 1} / {QUESTIONS.length}</span>
            <span className="text-xs text-[#C4822A] font-medium">취향 테스트</span>
          </div>
          <div className="h-1.5 bg-[#EDE6DB] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, backgroundColor: "#C4822A" }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="text-5xl mb-6">{question.emoji}</div>
          <h2
            className="text-center text-[#1C1814] mb-10"
            style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", lineHeight: 1.4 }}
          >
            {question.question}
          </h2>

          {/* Visual scale */}
          <div className="w-full max-w-sm mb-8">
            <div className="flex justify-between text-2xl mb-3">
              <span>{question.leftEmoji}</span>
              <span>{question.rightEmoji}</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={currentValue}
              onChange={(e) => handleSliderAnswer(Number(e.target.value))}
              className="w-full h-3 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #C4822A ${currentValue}%, #EDE6DB ${currentValue}%)`,
                accentColor: "#C4822A",
              }}
            />
            <div className="flex justify-between text-xs text-[#7A6A58] mt-2">
              <span>{question.leftLabel}</span>
              <span>{question.rightLabel}</span>
            </div>
          </div>

          {/* 5-step quick select */}
          <div className="flex gap-2 mb-8">
            {[10, 30, 50, 70, 90].map((v, i) => {
              const labels = ["전혀", "별로", "보통", "꽤", "매우"];
              const isSelected = Math.abs(currentValue - v) < 12;
              return (
                <button
                  key={v}
                  onClick={() => handleSliderAnswer(v)}
                  className="flex-1 py-2.5 rounded-xl text-xs transition-all"
                  style={{
                    backgroundColor: isSelected ? "#C4822A" : "white",
                    color: isSelected ? "white" : "#7A6A58",
                    border: `1px solid ${isSelected ? "#C4822A" : "rgba(44,26,14,0.12)"}`,
                  }}
                >
                  {labels[i]}
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-5 pb-8">
          <button
            onClick={nextQuestion}
            className="w-full py-4 rounded-2xl text-white font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#2C1A0E" }}
          >
            {currentQ < QUESTIONS.length - 1 ? "다음 →" : "완료"}
          </button>
        </div>
      </div>
    );
  }

  // Tags
  if (step === "tags") {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-[#F7F3EE]">
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="text-5xl mb-5">🏷️</div>
          <h2
            className="text-center text-[#1C1814] mb-2"
            style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem" }}
          >
            나를 표현하는 태그
          </h2>
          <p className="text-sm text-[#7A6A58] mb-8 text-center">
            분석 결과를 바탕으로 추천했어요. 자유롭게 수정하세요!
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {TASTE_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className="px-4 py-2 rounded-full text-sm transition-all"
                style={{
                  backgroundColor: selectedTags.includes(tag) ? "#FFF5E8" : "white",
                  color: selectedTags.includes(tag) ? "#C4822A" : "#7A6A58",
                  border: `1.5px solid ${selectedTags.includes(tag) ? "#C4822A" : "rgba(44,26,14,0.12)"}`,
                  fontWeight: selectedTags.includes(tag) ? 600 : 400,
                }}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
        <div className="px-5 pb-8">
          <button
            onClick={() => setStep("nickname")}
            className="w-full py-4 rounded-2xl text-white font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#C4822A" }}
          >
            다음 →
          </button>
        </div>
      </div>
    );
  }

  // Nickname
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#F7F3EE]">
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="text-5xl mb-5">✍️</div>
        <h2
          className="text-center text-[#1C1814] mb-2"
          style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem" }}
        >
          마지막으로 닉네임을
        </h2>
        <p className="text-sm text-[#7A6A58] mb-8 text-center">리뷰를 남길 때 사용할 이름이에요</p>

        {/* Preview card */}
        <div
          className="w-full max-w-xs rounded-2xl p-5 mb-8 bg-white text-center"
          style={{ border: "1px solid rgba(44,26,14,0.1)" }}
        >
          <div
            className="w-14 h-14 rounded-full mx-auto flex items-center justify-center text-2xl text-white mb-3"
            style={{ background: "linear-gradient(135deg, #C4822A, #E8A94A)" }}
          >
            {nickname ? nickname[0].toUpperCase() : "?"}
          </div>
          <p className="font-semibold text-[#1C1814] mb-1">{nickname || "닉네임"}</p>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {(selectedTags.length > 0 ? selectedTags : ["취향태그"]).map((tag) => (
              <span
                key={tag}
                className="text-xs px-2.5 py-1 rounded-full"
                style={{ backgroundColor: "#FFF5E8", color: "#C4822A" }}
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="닉네임 입력"
          maxLength={12}
          className="w-full max-w-xs px-4 py-3 rounded-xl text-center text-[#1C1814] text-base outline-none focus:ring-2 ring-[#C4822A]/40 transition-all"
          style={{ backgroundColor: "white", border: "1.5px solid rgba(44,26,14,0.15)" }}
        />
      </div>

      <div className="px-5 pb-8">
        <button
          onClick={handleComplete}
          disabled={!nickname.trim()}
          className="w-full py-4 rounded-2xl text-white font-semibold transition-opacity disabled:opacity-40"
          style={{ background: "linear-gradient(135deg, #C4822A, #E8A94A)" }}
        >
          맛기록 시작하기 🍴
        </button>
      </div>
    </div>
  );
}
