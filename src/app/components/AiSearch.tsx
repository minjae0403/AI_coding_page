import { useState, useRef, useEffect } from "react";
import type { Store } from "./mockData";

interface Message {
  role: "user" | "ai";
  text: string;
  results?: Store[];
}

interface Props {
  stores: Store[];
  onSelectStore: (store: Store) => void;
  onClose: () => void;
}

// keyword → intent mapping
function parseQuery(query: string, stores: Store[]): { reply: string; results: Store[] } {
  const q = query;

  const districtMap: Record<string, string> = {
    마포: "마포구", 홍대: "마포구", 연남: "마포구",
    성동: "성동구", 성수: "성동구",
    용산: "용산구", 이태원: "용산구",
    강남: "강남구", 청담: "강남구", 압구정: "강남구",
  };

  const targetDistrict = Object.entries(districtMap).find(([k]) => q.includes(k))?.[1];
  const wantsCafe = q.includes("카페") || q.includes("커피") || q.includes("cafe");
  const wantsRestaurant = q.includes("식당") || q.includes("밥") || q.includes("맛집") || q.includes("레스토랑");
  const wantsQuiet = q.includes("한적") || q.includes("조용") || q.includes("여유") || q.includes("혼잡하지 않");
  const wantsBusy = q.includes("활기") || q.includes("인기") || q.includes("핫") || q.includes("붐");
  const wantsSpecialty = q.includes("스페셜티") || q.includes("핸드드립") || q.includes("싱글오리진");
  const wantsKorean = q.includes("한식") || q.includes("한국") || q.includes("정식") || q.includes("찌개");
  const wantsItalian = q.includes("이탈리안") || q.includes("파스타") || q.includes("리소토");

  let filtered = [...stores];

  if (targetDistrict) filtered = filtered.filter((s) => s.district === targetDistrict);
  if (wantsCafe && !wantsRestaurant) filtered = filtered.filter((s) => s.type === "cafe");
  if (wantsRestaurant && !wantsCafe) filtered = filtered.filter((s) => s.type === "restaurant");
  if (wantsQuiet) filtered = filtered.sort((a, b) => a.congestion - b.congestion);
  if (wantsBusy) filtered = filtered.sort((a, b) => b.congestion - a.congestion);
  if (wantsSpecialty) filtered = filtered.filter((s) => s.tags.some((t) => ["스페셜티", "싱글오리진", "핸드드립"].includes(t)));
  if (wantsKorean) filtered = filtered.filter((s) => s.category.includes("한식"));
  if (wantsItalian) filtered = filtered.filter((s) => s.category.includes("이탈리안"));

  if (filtered.length === 0) {
    return {
      reply: "음… 딱 맞는 곳을 못 찾았어요 🤔 다른 키워드로 다시 물어봐 주세요! 지역, 유형(카페/식당), 분위기(한적한/활기찬)를 함께 말해주면 더 잘 찾을 수 있어요.",
      results: [],
    };
  }

  const top = filtered.slice(0, 3);
  const districtText = targetDistrict ? `${targetDistrict}` : "서울";
  const quietText = wantsQuiet ? "한적한 " : wantsBusy ? "활기찬 " : "";
  const typeText = wantsCafe ? "카페" : wantsRestaurant ? "식당" : "매장";

  const reply = `${districtText}에서 ${quietText}${typeText} ${top.length}곳을 찾았어요! 🗺️ 맛 데이터가 쌓인 곳 위주로 골라봤어요.`;

  return { reply, results: top };
}

const SUGGESTIONS = [
  "서울 강남구에 한적한 카페가 어디있을까?",
  "성수동 근처 분위기 좋은 식당 추천해줘",
  "마포구에서 스페셜티 커피 마실 수 있는 곳?",
  "이태원 근처 조용한 카페 알려줘",
];

export function AiSearch({ stores, onSelectStore, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      text: "안녕하세요! 저는 맛기록의 AI 탐정, **도루**예요 🔍\n\n가고 싶은 곳을 자유롭게 말해보세요. 지역, 분위기, 음식 종류 뭐든 좋아요!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const { reply, results } = parseQuery(text, stores);
      setIsTyping(false);
      setMessages((prev) => [...prev, { role: "ai", text: reply, results }]);
    }, 900);
  };

  const renderText = (text: string) =>
    text.split("**").map((part, i) =>
      i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>
    );

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#F7F3EE]">
      {/* Header */}
      <div className="bg-[#2C1A0E] px-4 py-3 flex items-center gap-3">
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20 transition-colors text-sm"
        >
          ←
        </button>
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-lg"
            style={{ background: "linear-gradient(135deg, #C4822A, #E8A94A)" }}
          >
            🔍
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">도루</p>
            <p className="text-white/50 text-xs">맛기록 AI 탐정</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
            {msg.role === "ai" && (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 mt-0.5"
                style={{ background: "linear-gradient(135deg, #C4822A, #E8A94A)" }}
              >
                🔍
              </div>
            )}
            <div className={`flex flex-col gap-2 max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
              <div
                className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
                style={
                  msg.role === "user"
                    ? { backgroundColor: "#2C1A0E", color: "white", borderBottomRightRadius: 4 }
                    : { backgroundColor: "white", color: "#1C1814", borderBottomLeftRadius: 4, border: "1px solid rgba(44,26,14,0.08)" }
                }
              >
                {renderText(msg.text)}
              </div>

              {msg.results && msg.results.length > 0 && (
                <div className="flex flex-col gap-2 w-full">
                  {msg.results.map((store) => {
                    const totalReviews = store.menu.reduce((s, m) => s + m.reviews.length, 0);
                    return (
                      <button
                        key={store.id}
                        onClick={() => { onSelectStore(store); onClose(); }}
                        className="bg-white rounded-xl overflow-hidden text-left hover:shadow-md transition-all border border-[rgba(44,26,14,0.08)] active:scale-[0.98] flex gap-3 p-3"
                      >
                        <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                          <img src={store.image} alt={store.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-[#7A6A58] mb-0.5">{store.category} · {store.district}</p>
                          <p className="text-sm font-semibold text-[#1C1814] truncate">{store.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-[#7A6A58]">리뷰 {totalReviews}개</span>
                            <CongestionDot value={store.congestion} />
                          </div>
                        </div>
                        <span className="text-[#C4822A] text-sm self-center">→</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-2.5 items-end">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0"
              style={{ background: "linear-gradient(135deg, #C4822A, #E8A94A)" }}
            >
              🔍
            </div>
            <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 border border-[rgba(44,26,14,0.08)]">
              <div className="flex gap-1 items-center h-4">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-[#C4822A] animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-[#7A6A58] mb-2">이렇게 물어보세요</p>
          <div className="flex flex-col gap-1.5">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => handleSend(s)}
                className="text-left px-3.5 py-2.5 rounded-xl bg-white text-sm text-[#2C1A0E] border border-[rgba(44,26,14,0.1)] hover:border-[#C4822A] hover:bg-[#FFF8F0] transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-6 pt-2 bg-[#F7F3EE] border-t border-[rgba(44,26,14,0.08)]">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
            placeholder="자유롭게 질문해보세요..."
            className="flex-1 px-4 py-3 rounded-xl bg-white text-sm text-[#1C1814] border border-[rgba(44,26,14,0.12)] outline-none focus:border-[#C4822A] transition-colors"
          />
          <button
            onClick={() => handleSend(input)}
            disabled={!input.trim()}
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white transition-opacity disabled:opacity-40"
            style={{ backgroundColor: "#C4822A" }}
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}

function CongestionDot({ value }: { value: number }) {
  const color = value < 30 ? "#22c55e" : value < 60 ? "#f59e0b" : "#ef4444";
  const label = value < 30 ? "여유" : value < 60 ? "보통" : "혼잡";
  return (
    <span className="flex items-center gap-1">
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-xs text-[#7A6A58]">{label}</span>
    </span>
  );
}
