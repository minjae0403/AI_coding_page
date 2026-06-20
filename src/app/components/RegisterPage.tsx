import { useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, Loader2, MapPin, Search } from "lucide-react";
import { createStoreInDB } from "../api";
import { type StoreType } from "./mockData";

interface Props {
  onBack: () => void;
  onComplete: () => void;
}

type AddressResult = {
  display_name: string;
  lat: string;
  lon: string;
};

const DISTRICT_OPTIONS = ["전체", "마포구", "강남구", "성동구", "영등포구", "종로구", "중구", "송파구"];
const STORE_TYPE_OPTIONS: { value: StoreType; label: string }[] = [
  { value: "cafe", label: "카페" },
  { value: "restaurant", label: "식당" },
];

const PRESET_TAGS: Record<StoreType, string[]> = {
  cafe: ["디저트", "포토존", "감성카페", "브런치", "가성비", "조용한", "모임", "뷰맛집"],
  restaurant: ["한식", "중식", "분위기", "가족외식", "가성비", "데이트", "회식", "술집"],
};

function AddressSearchModal({
  open,
  query,
  results,
  loading,
  onQueryChange,
  onClose,
  onSelect,
}: {
  open: boolean;
  query: string;
  results: AddressResult[];
  loading: boolean;
  onQueryChange: (value: string) => void;
  onClose: () => void;
  onSelect: (item: AddressResult) => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-t-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[rgba(44,26,14,0.08)] px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-[#1C1814]">주소 검색</p>
            <p className="text-xs text-[#7A6A58]">검색 결과를 선택하면 좌표가 자동 입력됩니다.</p>
          </div>
          <button onClick={onClose} className="rounded-full px-3 py-1.5 text-sm text-[#7A6A58] hover:bg-[#F7F3EE]">닫기</button>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 rounded-2xl border border-[rgba(44,26,14,0.12)] bg-[#F7F3EE] px-3 py-3">
            <Search className="h-4 w-4 shrink-0 text-[#7A6A58]" />
            <input
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="예: 서울시 강남구 테헤란로 152"
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          <div className="mt-3 max-h-96 overflow-auto space-y-2">
            {loading && <div className="py-10 text-center text-sm text-[#7A6A58]">검색 중...</div>}
            {!loading && results.length === 0 && query.trim() && (
              <div className="py-10 text-center text-sm text-[#7A6A58]">검색 결과가 없습니다.</div>
            )}
            {results.map((item) => (
              <button
                key={`${item.display_name}-${item.lat}-${item.lon}`}
                type="button"
                onClick={() => onSelect(item)}
                className="w-full rounded-2xl border border-[rgba(44,26,14,0.08)] px-4 py-3 text-left hover:bg-[#FAF7F2]"
              >
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#C4822A]" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#1C1814]">{item.display_name}</p>
                    <p className="text-xs text-[#7A6A58]">Lat {Number(item.lat).toFixed(6)} · Lng {Number(item.lon).toFixed(6)}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function RegisterPage({ onBack, onComplete }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [addressQuery, setAddressQuery] = useState("");
  const [addressResults, setAddressResults] = useState<AddressResult[]>([]);
  const [addressLoading, setAddressLoading] = useState(false);

  const [storeName, setStoreName] = useState("");
  const [storeType, setStoreType] = useState<StoreType>("cafe");
  const [category, setCategory] = useState("");
  const [address, setAddress] = useState("");
  const [district, setDistrict] = useState("전체");
  const [phone, setPhone] = useState("");
  const [hours, setHours] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const canSearch = useMemo(() => addressModalOpen && addressQuery.trim().length > 1, [addressModalOpen, addressQuery]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const searchAddress = async (query: string) => {
    setAddressQuery(query);
    if (query.trim().length < 2) {
      setAddressResults([]);
      return;
    }
    setAddressLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=8&countrycodes=kr&q=${encodeURIComponent(query)}`,
        { headers: { "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8" } }
      );
      const data = (await res.json()) as AddressResult[];
      setAddressResults(Array.isArray(data) ? data : []);
    } catch {
      setAddressResults([]);
    } finally {
      setAddressLoading(false);
    }
  };

  const handleSelectAddress = (item: AddressResult) => {
    setAddress(item.display_name);
    setLatitude(Number(item.lat).toFixed(8));
    setLongitude(Number(item.lon).toFixed(8));
    setAddressModalOpen(false);
  };

  const validate = () => {
    if (!storeName.trim()) return "가게 이름을 입력하세요.";
    if (!category.trim()) return "카테고리를 입력하세요.";
    if (!address.trim()) return "주소를 선택하세요.";
    if (!latitude || !longitude) return "주소 검색 후 좌표를 선택하세요.";
    return null;
  };

  const handleSubmit = async () => {
    const error = validate();
    if (error) {
      setErrorMsg(error);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");
    try {
      await createStoreInDB({
        name: storeName,
        type: storeType,
        category,
        address,
        district,
        phone: phone || null,
        hours: hours || null,
        imageUrl: imageUrl || null,
        description: description || null,
        latitude: Number(latitude),
        longitude: Number(longitude),
        congestion: 10,
        tags: selectedTags,
      });
      setIsSuccess(true);
      setTimeout(onComplete, 1200);
    } catch (err: any) {
      setErrorMsg(err?.message || "가게 등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF7F2] p-4">
        <div className="w-full max-w-sm rounded-3xl border border-[rgba(44,26,14,0.08)] bg-white p-8 text-center shadow-xl">
          <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
          <h2 className="mt-4 text-xl font-bold text-[#2C1A0E]">가게 등록 완료</h2>
          <p className="mt-2 text-sm text-[#7A6A58]">가게 정보가 Oracle DB에 저장되었습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-12 text-[#2C1A0E]">
      <AddressSearchModal
        open={addressModalOpen}
        query={addressQuery}
        results={addressResults}
        loading={addressLoading}
        onQueryChange={searchAddress}
        onClose={() => setAddressModalOpen(false)}
        onSelect={handleSelectAddress}
      />

      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[rgba(44,26,14,0.08)] bg-white px-4 py-4">
        <button onClick={onBack} className="rounded-full p-1 hover:bg-[rgba(44,26,14,0.05)]">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-bold">가게 등록</h1>
        <div className="w-8" />
      </header>

      <div className="mx-auto mt-6 max-w-2xl px-4">
        {errorMsg && <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{errorMsg}</div>}

        <div className="flex flex-col gap-5 rounded-3xl border border-[rgba(44,26,14,0.08)] bg-white p-6 shadow-md">
          <div>
            <label className="mb-2 block text-sm font-semibold">가게 유형 *</label>
            <div className="grid grid-cols-2 gap-3">
              {STORE_TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setStoreType(opt.value);
                    setSelectedTags([]);
                  }}
                  className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${storeType === opt.value ? "border-[#C4822A] bg-[#FFF5E8] text-[#C4822A]" : "border-[rgba(44,26,14,0.12)] text-[#7A6A58]"}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold">가게 이름 *</label>
              <input className="w-full rounded-2xl border border-[rgba(44,26,14,0.12)] px-4 py-3 text-sm outline-none focus:border-[#C4822A]" value={storeName} onChange={(e) => setStoreName(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">카테고리 *</label>
              <input className="w-full rounded-2xl border border-[rgba(44,26,14,0.12)] px-4 py-3 text-sm outline-none focus:border-[#C4822A]" value={category} onChange={(e) => setCategory(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold">지역 구분</label>
              <select value={district} onChange={(e) => setDistrict(e.target.value)} className="w-full rounded-2xl border border-[rgba(44,26,14,0.12)] bg-white px-4 py-3 text-sm outline-none focus:border-[#C4822A]">
                {DISTRICT_OPTIONS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">주소 *</label>
              <button
                type="button"
                onClick={() => { setAddressModalOpen(true); if (!canSearch) setAddressResults([]); }}
                className="flex w-full items-center justify-between rounded-2xl border border-[rgba(44,26,14,0.12)] px-4 py-3 text-left text-sm text-[#7A6A58] outline-none hover:bg-[#FAF7F2]"
              >
                <span className="truncate">{address || "클릭하여 주소 검색"}</span>
                <Search className="h-4 w-4 shrink-0" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold">전화번호</label>
              <input className="w-full rounded-2xl border border-[rgba(44,26,14,0.12)] px-4 py-3 text-sm outline-none focus:border-[#C4822A]" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">영업시간</label>
              <input className="w-full rounded-2xl border border-[rgba(44,26,14,0.12)] px-4 py-3 text-sm outline-none focus:border-[#C4822A]" value={hours} onChange={(e) => setHours(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold">위도</label>
              <input readOnly value={latitude} className="w-full rounded-2xl border border-[rgba(44,26,14,0.08)] bg-gray-50 px-4 py-3 text-sm text-gray-600" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">경도</label>
              <input readOnly value={longitude} className="w-full rounded-2xl border border-[rgba(44,26,14,0.08)] bg-gray-50 px-4 py-3 text-sm text-gray-600" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">대표 이미지 URL</label>
            <input className="w-full rounded-2xl border border-[rgba(44,26,14,0.12)] px-4 py-3 text-sm outline-none focus:border-[#C4822A]" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">가게 설명</label>
            <textarea className="w-full resize-none rounded-2xl border border-[rgba(44,26,14,0.12)] px-4 py-3 text-sm outline-none focus:border-[#C4822A]" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">가게 태그</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_TAGS[storeType].map((tag) => {
                const selected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium ${selected ? "border-[#C4822A] bg-[#FFF5E8] text-[#C4822A]" : "border-[rgba(44,26,14,0.12)] text-[#7A6A58]"}`}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="mt-2 flex items-center justify-center gap-2 rounded-2xl bg-[#C4822A] py-3.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {isSubmitting ? "저장 중..." : "가게 등록"}
          </button>
        </div>
      </div>
    </div>
  );
}
