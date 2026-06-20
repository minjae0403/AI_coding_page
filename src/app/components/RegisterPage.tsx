import { useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, Loader2, MapPin, Search, X } from "lucide-react";
import { createStoreInDB } from "../api";
import { type StoreType } from "./mockData";

interface Props {
  onBack: () => void;
  onComplete: () => void;
}

type AddressResult = {
  roadAddr: string;
  jibunAddr: string;
};

type GeocodeResult = {
  lat: string;
  lon: string;
};

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
  error,
  onQueryChange,
  onClose,
  onSelect,
}: {
  open: boolean;
  query: string;
  results: AddressResult[];
  loading: boolean;
  error: string;
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
            <p className="text-xs text-[#7A6A58]">행정안전부 도로명주소 검색 결과를 선택하세요.</p>
          </div>
          <button onClick={onClose} className="rounded-full px-3 py-1.5 text-sm text-[#7A6A58] hover:bg-[#F7F3EE]">
            닫기
          </button>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 rounded-2xl border border-[rgba(44,26,14,0.12)] bg-[#F7F3EE] px-3 py-3">
            <Search className="h-4 w-4 shrink-0 text-[#7A6A58]" />
            <input
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="예: 서울 중랑구 망우로 400"
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          <div className="mt-3 max-h-96 space-y-2 overflow-auto">
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">
                {error}
              </div>
            )}
            {loading && <div className="py-10 text-center text-sm text-[#7A6A58]">검색 중...</div>}
            {!loading && results.length === 0 && query.trim() && !error && (
              <div className="py-10 text-center text-sm text-[#7A6A58]">검색 결과가 없습니다.</div>
            )}
            {results.map((item) => (
              <button
                key={`${item.roadAddr}-${item.jibunAddr}`}
                type="button"
                onClick={() => onSelect(item)}
                className="w-full rounded-2xl border border-[rgba(44,26,14,0.08)] px-4 py-3 text-left hover:bg-[#FAF7F2]"
              >
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#C4822A]" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#1C1814]">{item.roadAddr}</p>
                    <p className="truncate text-xs text-[#7A6A58]">{item.jibunAddr}</p>
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
  const [addressError, setAddressError] = useState("");

  const [storeName, setStoreName] = useState("");
  const [storeType, setStoreType] = useState<StoreType>("cafe");
  const [category, setCategory] = useState("");
  const [address, setAddress] = useState("");
  const [addressSelected, setAddressSelected] = useState(false);
  const [detailAddress, setDetailAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [hours, setHours] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const fullAddress = useMemo(() => {
    const parts = [address, detailAddress].filter(Boolean);
    return parts.join(" ").trim();
  }, [address, detailAddress]);

  const getJusoConfmKey = () => {
    const raw = import.meta.env.VITE_JUSO_CONFM_KEY;
    if (!raw) throw new Error("VITE_JUSO_CONFM_KEY 환경변수가 없습니다.");
    const trimmed = String(raw).trim().replace(/^['"]|['"]$/g, "");
    try {
      return decodeURIComponent(trimmed);
    } catch {
      return trimmed;
    }
  };

  const searchAddress = async (query: string) => {
    const normalizedQuery = query.replace(/\s+/g, " ").trim();
    setAddressQuery(normalizedQuery);
    setAddressError("");
    if (normalizedQuery.length < 3) {
      setAddressResults([]);
      setAddressError("시/구/도로명까지 조금 더 자세히 입력해 주세요.");
      return;
    }
    if (!/\d/.test(normalizedQuery) && normalizedQuery.length < 4) {
      setAddressResults([]);
      return;
    }

    setAddressLoading(true);
    try {
      const confmKey = getJusoConfmKey();

      const callbackName = `jusoCallback_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const script = document.createElement("script");
      let timeoutId: number | undefined;

      const cleanup = () => {
        if (timeoutId) window.clearTimeout(timeoutId);
        delete (window as any)[callbackName];
        script.remove();
      };

      const payload = await new Promise<any>((resolve, reject) => {
        (window as any)[callbackName] = (data: any) => resolve(data);
        const params = [
          `currentPage=1`,
          `countPerPage=10`,
          `keyword=${encodeURIComponent(normalizedQuery)}`,
          `confmKey=${encodeURIComponent(confmKey)}`,
          `resultType=json`,
          `callback=${encodeURIComponent(callbackName)}`,
        ].join("&");
        script.src = `https://business.juso.go.kr/addrlink/addrLinkApiJsonp.do?${params}`;
        script.onerror = () => reject(new Error("주소 검색 요청에 실패했습니다."));
        document.body.appendChild(script);
        timeoutId = window.setTimeout(() => reject(new Error("주소 검색 응답이 지연되고 있습니다.")), 8000);
      }).finally(cleanup);

      const common = payload?.results?.common;
      if (common?.errorCode && common.errorCode !== "0" && common.errorCode !== "E0000") {
        if (common.errorCode === "E0001") {
          setAddressError("주소 검색 서비스를 사용할 수 없습니다. 관리자에게 승인된 KEY를 확인해 주세요.");
        } else {
          setAddressError(`${common.errorCode}: ${common.errorMessage || "주소 검색에 실패했습니다."}`);
        }
        setAddressResults([]);
        return;
      }

      const list = payload?.results?.juso ?? [];
      setAddressResults(
        Array.isArray(list)
          ? list.map((item: any) => ({
              roadAddr: item.roadAddr,
              jibunAddr: item.jibunAddr,
            }))
          : []
      );
    } catch (err: any) {
      setAddressError(err?.message || "주소 검색에 실패했습니다.");
      setAddressResults([]);
    } finally {
      setAddressLoading(false);
    }
  };

  const geocodeAddress = async (selectedAddress: string) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(selectedAddress)}`,
        { headers: { "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8" } }
      );
      const data = (await res.json()) as GeocodeResult[];
      if (Array.isArray(data) && data[0]) {
        setLatitude(Number(data[0].lat).toFixed(8));
        setLongitude(Number(data[0].lon).toFixed(8));
      }
    } catch {
      setLatitude("");
      setLongitude("");
    }
  };

  const handleSelectAddress = (item: AddressResult) => {
    setAddress(item.roadAddr);
    setAddressSelected(true);
    setDetailAddress("");
    setLatitude("");
    setLongitude("");
    setAddressModalOpen(false);
    void geocodeAddress(item.roadAddr);
  };

  const addTag = (tag: string) => {
    const normalized = tag.trim();
    if (!normalized) return;
    if (selectedTags.includes(normalized)) return;
    setSelectedTags((prev) => [...prev, normalized]);
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag));
  };

  const validate = () => {
    if (!storeName.trim()) return "가게 이름을 입력하세요.";
    if (!category.trim()) return "카테고리를 입력하세요.";
    if (!address.trim()) return "주소를 선택하세요.";
    if (!detailAddress.trim()) return "상세주소를 입력하세요.";
    if (!latitude || !longitude) return "주소 선택 후 좌표가 자동 입력되어야 합니다.";
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
        address: fullAddress,
        district: "전체",
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
        error={addressError}
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
                  className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
                    storeType === opt.value
                      ? "border-[#C4822A] bg-[#FFF5E8] text-[#C4822A]"
                      : "border-[rgba(44,26,14,0.12)] text-[#7A6A58]"
                  }`}
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
              <label className="mb-1 block text-sm font-semibold">주소 *</label>
              <button
                type="button"
                onClick={() => setAddressModalOpen(true)}
                className="flex w-full items-center justify-between rounded-2xl border border-[rgba(44,26,14,0.12)] px-4 py-3 text-left text-sm text-[#7A6A58] hover:bg-[#FAF7F2]"
              >
                <span className="truncate">{address || "클릭하여 주소 검색"}</span>
                <Search className="h-4 w-4 shrink-0" />
              </button>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">상세주소 *</label>
              {addressSelected ? (
                <input
                  className="w-full rounded-2xl border border-[rgba(44,26,14,0.12)] px-4 py-3 text-sm outline-none focus:border-[#C4822A]"
                  value={detailAddress}
                  onChange={(e) => setDetailAddress(e.target.value)}
                  placeholder="층수, 호수, 건물명 등"
                />
              ) : (
                <div className="rounded-2xl border border-dashed border-[rgba(44,26,14,0.12)] px-4 py-3 text-sm text-[#A89A8E]">
                  주소를 먼저 선택하면 상세주소를 입력할 수 있습니다.
                </div>
              )}
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
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-sm font-semibold">가게 태그</label>
              <span className="text-xs text-[#7A6A58]">직접 추가 가능</span>
            </div>
            <div className="mb-3 flex gap-2">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag(tagInput);
                  }
                }}
                placeholder="태그 입력 후 Enter"
                className="flex-1 rounded-2xl border border-[rgba(44,26,14,0.12)] px-4 py-3 text-sm outline-none focus:border-[#C4822A]"
              />
              <button type="button" onClick={() => addTag(tagInput)} className="rounded-2xl bg-[#2C1A0E] px-4 py-3 text-sm font-semibold text-white">
                추가
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {PRESET_TAGS[storeType].map((tag) => {
                const selected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => (selected ? removeTag(tag) : addTag(tag))}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                      selected
                        ? "border-[#C4822A] bg-[#FFF5E8] text-[#C4822A]"
                        : "border-[rgba(44,26,14,0.12)] text-[#7A6A58]"
                    }`}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
            {selectedTags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedTags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-[#FFF5E8] px-3 py-1.5 text-xs text-[#C4822A]">
                    #{tag}
                    <button type="button" onClick={() => removeTag(tag)} className="ml-1">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
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
