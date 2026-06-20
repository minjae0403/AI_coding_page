import React, { useState } from "react";
import { ArrowLeft, Plus, Trash2, CheckCircle2, Loader2 } from "lucide-react";
import { type StoreType } from "./mockData";

interface Props {
  onBack: () => void;
  onComplete: () => void;
}

interface MenuItemInput {
  name: string;
  category: string;
  price: string;
  description: string;
  imageUrl: string;
}

const DISTRICT_OPTIONS = ["마포구", "성동구", "용산구", "강남구", "서초구", "종로구", "중구", "송파구"];
const STORE_TYPE_OPTIONS: { value: StoreType; label: string }[] = [
  { value: "cafe", label: "☕ 카페" },
  { value: "restaurant", label: "🍽️ 식당" },
];

const PRESET_TAGS: Record<StoreType, string[]> = {
  cafe: ["달달함", "포토존", "인스타감성", "핸드드립전문", "가성비최고", "고급스러운", "아늑함", "조용한", "힙한"],
  restaurant: ["칼칼함", "구수함", "푸짐한양", "집밥맛", "중독적", "얼큰함", "깊은국물", "기름안짐", "매콤달콤"],
};

export function RegisterPage({ onBack, onComplete }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Store Form State
  const [storeName, setStoreName] = useState("");
  const [storeType, setStoreType] = useState<StoreType>("cafe");
  const [category, setCategory] = useState("");
  const [address, setAddress] = useState("");
  const [district, setDistrict] = useState("마포구");
  const [phone, setPhone] = useState("");
  const [hours, setHours] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState("37.5665");
  const [longitude, setLongitude] = useState("126.9780");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSearchingCoords, setIsSearchingCoords] = useState(false);

  // Menu Form State
  const [menus, setMenus] = useState<MenuItemInput[]>([
    { name: "", category: "", price: "", description: "", imageUrl: "" },
  ]);

  const fetchCoordinates = async (addr: string) => {
    if (!addr.trim()) return;
    setIsSearchingCoords(true);
    try {
      // Nominatim API를 이용하여 상세 주소 위치 검색
      const searchAddr = addr.includes("서울") ? addr : `서울 ${district} ${addr}`;
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchAddr)}&format=json&limit=1`,
        {
          headers: {
            "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          setLatitude(Number(data[0].lat).toFixed(8));
          setLongitude(Number(data[0].lon).toFixed(8));
        } else {
          // 상세 주소 검색 결과가 없을 경우 구 이름으로 포백
          const fallbackRes = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(`서울 ${district}`)}&format=json&limit=1`,
            {
              headers: {
                "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
              },
            }
          );
          if (fallbackRes.ok) {
            const fallbackData = await fallbackRes.json();
            if (fallbackData && fallbackData.length > 0) {
              setLatitude(Number(fallbackData[0].lat).toFixed(8));
              setLongitude(Number(fallbackData[0].lon).toFixed(8));
            }
          }
        }
      }
    } catch (e) {
      console.error("위치 검색 오류:", e);
    } finally {
      setIsSearchingCoords(false);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleAddMenu = () => {
    setMenus((prev) => [...prev, { name: "", category: "", price: "", description: "", imageUrl: "" }]);
  };

  const handleRemoveMenu = (index: number) => {
    if (menus.length === 1) return;
    setMenus((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMenuChange = (index: number, field: keyof MenuItemInput, value: string) => {
    setMenus((prev) =>
      prev.map((menu, i) => (i === index ? { ...menu, [field]: value } : menu))
    );
  };

  const validateStoreStep = () => {
    if (!storeName.trim()) return "가게 이름을 입력해주세요.";
    if (!category.trim()) return "업종/카테고리를 입력해주세요.";
    if (!address.trim()) return "상세 주소를 입력해주세요.";
    if (!district) return "지역구(구)를 선택해주세요.";
    if (isNaN(Number(latitude)) || isNaN(Number(longitude))) return "위도와 경도는 올바른 숫자여야 합니다.";
    return null;
  };

  const handleNextStep = () => {
    const error = validateStoreStep();
    if (error) {
      alert(error);
      return;
    }
    setStep(2);
  };

  const handleSubmit = async () => {
    // Validate menus
    for (let i = 0; i < menus.length; i++) {
      const menu = menus[i];
      if (!menu.name.trim()) {
        alert(`${i + 1}번째 메뉴의 이름을 입력해주세요.`);
        return;
      }
      if (!menu.price.trim() || isNaN(Number(menu.price))) {
        alert(`${i + 1}번째 메뉴의 올바른 가격을 입력해주세요.`);
        return;
      }
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const ORDS_BASE_URL = import.meta.env.VITE_ORDS_PATH;
      const SCHEMA = 'test_server';
      const API_URL = `${ORDS_BASE_URL.endsWith('/') ? ORDS_BASE_URL : ORDS_BASE_URL + '/'}${SCHEMA}`;

      const storeId = `store-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // 1. Post Store Information
      const storePayload = {
        store_id: storeId,
        name: storeName,
        type: storeType,
        category: category,
        address: address,
        district: district,
        phone: phone || null,
        hours: hours || null,
        image_url: imageUrl || null,
        description: description || null,
        latitude: Number(latitude),
        longitude: Number(longitude),
        congestion: 10, // 기본값
      };

      const storeRes = await fetch(`${API_URL}/stores/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(storePayload),
      });

      if (!storeRes.ok) {
        const errorText = await storeRes.text();
        throw new Error(`가게 등록에 실패했습니다. (상태코드: ${storeRes.status}, ${errorText})`);
      }

      // 2. Post Store Tags
      for (const tag of selectedTags) {
        const tagPayload = {
          store_id: storeId,
          tag_name: tag,
        };
        await fetch(`${API_URL}/store_tags/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(tagPayload),
        });
      }

      // 3. Post Menu Items
      for (let i = 0; i < menus.length; i++) {
        const menu = menus[i];
        const menuId = `menu-${Date.now()}-${i}-${Math.floor(Math.random() * 1000)}`;
        const menuPayload = {
          menu_id: menuId,
          store_id: storeId,
          name: menu.name,
          category: menu.category || category,
          price: Number(menu.price),
          description: menu.description || null,
          image_url: menu.imageUrl || null,
        };

        const menuRes = await fetch(`${API_URL}/menu_items/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(menuPayload),
        });

        if (!menuRes.ok) {
          console.error(`${menu.name} 메뉴 등록 실패`);
        }
      }

      setIsSuccess(true);
      setTimeout(() => {
        onComplete();
      }, 1500);

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "서버 통신 중 에러가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAF7F2] p-4 text-center">
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-white p-8 shadow-xl border border-[rgba(44,26,14,0.07)] max-w-sm w-full">
          <CheckCircle2 className="h-16 w-16 text-emerald-500 animate-bounce" />
          <h2 className="text-xl font-bold text-[#2C1A0E]">등록이 완료되었습니다!</h2>
          <p className="text-sm text-[#7A6A58]">가게 및 메뉴 정보를 성공적으로 DB에 저장했습니다. 홈 화면으로 이동합니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C1A0E] font-sans pb-12">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[rgba(44,26,14,0.07)] bg-white px-4 py-4 shadow-sm">
        <button onClick={onBack} className="p-1 rounded-full hover:bg-[rgba(44,26,14,0.05)] transition-colors">
          <ArrowLeft className="h-6 w-6 text-[#2C1A0E]" />
        </button>
        <h1 className="text-lg font-bold">가게 & 메뉴 등록</h1>
        <div className="w-8" />
      </header>

      <div className="max-w-2xl mx-auto px-4 mt-6">
        {/* Step indicator */}
        <div className="mb-6 flex items-center justify-between bg-white rounded-xl p-4 shadow-sm border border-[rgba(44,26,14,0.07)]">
          <div className="flex items-center gap-2">
            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${step === 1 ? "bg-[#C4822A] text-white" : "bg-[#EDE6DB] text-[#7A6A58]"}`}>1</span>
            <span className={`text-sm font-semibold ${step === 1 ? "text-[#2C1A0E]" : "text-[#7A6A58]"}`}>가게 정보 등록</span>
          </div>
          <div className="h-[1px] flex-1 bg-[rgba(44,26,14,0.1)] mx-4" />
          <div className="flex items-center gap-2">
            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${step === 2 ? "bg-[#C4822A] text-white" : "bg-[#EDE6DB] text-[#7A6A58]"}`}>2</span>
            <span className={`text-sm font-semibold ${step === 2 ? "text-[#2C1A0E]" : "text-[#7A6A58]"}`}>메뉴 정보 등록</span>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">
            {errorMsg}
          </div>
        )}

        {/* Step 1: Store info */}
        {step === 1 && (
          <div className="flex flex-col gap-5 rounded-2xl bg-white p-6 shadow-md border border-[rgba(44,26,14,0.07)]">
            <h2 className="text-md font-bold text-[#C4822A] border-b pb-2">기본 정보 입력</h2>

            {/* Store Type selection */}
            <div>
              <label className="block text-sm font-semibold mb-2">구분 *</label>
              <div className="grid grid-cols-2 gap-3">
                {STORE_TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setStoreType(opt.value);
                      setSelectedTags([]); // Reset tags on type change
                    }}
                    className={`py-3 rounded-xl border text-sm font-bold transition-all ${
                      storeType === opt.value
                        ? "border-[#C4822A] bg-[#FFF5E8] text-[#C4822A]"
                        : "border-[rgba(44,26,14,0.15)] text-[#7A6A58] hover:bg-[#FAF7F2]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Store Name & Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">가게명 *</label>
                <input
                  type="text"
                  placeholder="예: 포레스트 커피"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full rounded-xl border border-[rgba(44,26,14,0.15)] px-4 py-2.5 text-sm focus:outline-none focus:border-[#C4822A]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">카테고리 *</label>
                <input
                  type="text"
                  placeholder="예: 디저트 카페, 일식당 등"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-[rgba(44,26,14,0.15)] px-4 py-2.5 text-sm focus:outline-none focus:border-[#C4822A]"
                />
              </div>
            </div>

            {/* Address & District */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">지역구 *</label>
                <select
                  value={district}
                  onChange={(e) => {
                    setDistrict(e.target.value);
                    if (address.trim()) fetchCoordinates(address);
                  }}
                  className="w-full rounded-xl border border-[rgba(44,26,14,0.15)] px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-[#C4822A]"
                >
                  {DISTRICT_OPTIONS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">상세 주소 *</label>
                <input
                  type="text"
                  placeholder="예: 와우산로 21 (입력 후 포커스 아웃 시 위치 자동 계산)"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  onBlur={() => fetchCoordinates(address)}
                  className="w-full rounded-xl border border-[rgba(44,26,14,0.15)] px-4 py-2.5 text-sm focus:outline-none focus:border-[#C4822A]"
                />
              </div>
            </div>

            {/* Contact & Hours */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">전화번호</label>
                <input
                  type="text"
                  placeholder="예: 02-123-4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-[rgba(44,26,14,0.15)] px-4 py-2.5 text-sm focus:outline-none focus:border-[#C4822A]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">영업시간</label>
                <input
                  type="text"
                  placeholder="예: 매일 10:00 - 22:00"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="w-full rounded-xl border border-[rgba(44,26,14,0.15)] px-4 py-2.5 text-sm focus:outline-none focus:border-[#C4822A]"
                />
              </div>
            </div>

            {/* Coordinates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-semibold">위도(Latitude) *</label>
                  {isSearchingCoords && <span className="text-xs text-[#C4822A] animate-pulse">검색 중...</span>}
                </div>
                <input
                  type="text"
                  value={latitude}
                  readOnly
                  disabled
                  className="w-full rounded-xl border border-[rgba(44,26,14,0.1)] bg-gray-100 text-gray-500 cursor-not-allowed px-4 py-2.5 text-sm outline-none"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-semibold">경도(Longitude) *</label>
                  {isSearchingCoords && <span className="text-xs text-[#C4822A] animate-pulse">검색 중...</span>}
                </div>
                <input
                  type="text"
                  value={longitude}
                  readOnly
                  disabled
                  className="w-full rounded-xl border border-[rgba(44,26,14,0.1)] bg-gray-100 text-gray-500 cursor-not-allowed px-4 py-2.5 text-sm outline-none"
                />
              </div>
            </div>


            {/* Image URL & Description */}
            <div>
              <label className="block text-sm font-semibold mb-1">대표 이미지 URL</label>
              <input
                type="text"
                placeholder="https://images.unsplash.com/..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full rounded-xl border border-[rgba(44,26,14,0.15)] px-4 py-2.5 text-sm focus:outline-none focus:border-[#C4822A]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">가게 간단 설명</label>
              <textarea
                placeholder="가게의 분위기나 특별한 점을 설명해주세요."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-[rgba(44,26,14,0.15)] px-4 py-2.5 text-sm focus:outline-none focus:border-[#C4822A] resize-none"
              />
            </div>

            {/* Tags selection */}
            <div>
              <label className="block text-sm font-semibold mb-2">가게 특징 태그</label>
              <div className="flex flex-wrap gap-2">
                {PRESET_TAGS[storeType].map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        isSelected
                          ? "bg-[#C4822A] text-white border-[#C4822A]"
                          : "bg-white text-[#7A6A58] border-[rgba(44,26,14,0.15)] hover:bg-[#FAF7F2]"
                      }`}
                    >
                      #{tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Next Button */}
            <button
              onClick={handleNextStep}
              className="mt-4 w-full py-3.5 rounded-xl text-white font-bold transition-all text-center hover:opacity-95"
              style={{ backgroundColor: "#C4822A" }}
            >
              메뉴 등록 단계로 이동 →
            </button>
          </div>
        )}

        {/* Step 2: Menus info */}
        {step === 2 && (
          <div className="flex flex-col gap-6">
            {menus.map((menu, idx) => (
              <div
                key={idx}
                className="relative flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-md border border-[rgba(44,26,14,0.07)]"
              >
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="text-sm font-bold text-[#C4822A]">{idx + 1}번째 메뉴</h3>
                  {menus.length > 1 && (
                    <button
                      onClick={() => handleRemoveMenu(idx)}
                      className="text-red-500 hover:text-red-700 transition-colors p-1"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1">메뉴명 *</label>
                    <input
                      type="text"
                      placeholder="예: 시그니처 아메리카노"
                      value={menu.name}
                      onChange={(e) => handleMenuChange(idx, "name", e.target.value)}
                      className="w-full rounded-xl border border-[rgba(44,26,14,0.15)] px-4 py-2.5 text-xs focus:outline-none focus:border-[#C4822A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">가격(원) *</label>
                    <input
                      type="text"
                      placeholder="예: 4500"
                      value={menu.price}
                      onChange={(e) => handleMenuChange(idx, "price", e.target.value)}
                      className="w-full rounded-xl border border-[rgba(44,26,14,0.15)] px-4 py-2.5 text-xs focus:outline-none focus:border-[#C4822A]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1">카테고리</label>
                    <input
                      type="text"
                      placeholder="예: 커피 / 음료 / 디저트"
                      value={menu.category}
                      onChange={(e) => handleMenuChange(idx, "category", e.target.value)}
                      className="w-full rounded-xl border border-[rgba(44,26,14,0.15)] px-4 py-2.5 text-xs focus:outline-none focus:border-[#C4822A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">메뉴 이미지 URL</label>
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/..."
                      value={menu.imageUrl}
                      onChange={(e) => handleMenuChange(idx, "imageUrl", e.target.value)}
                      className="w-full rounded-xl border border-[rgba(44,26,14,0.15)] px-4 py-2.5 text-xs focus:outline-none focus:border-[#C4822A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">메뉴 설명</label>
                  <textarea
                    placeholder="메뉴 맛의 특징이나 재료 구성을 적어주세요."
                    value={menu.description}
                    onChange={(e) => handleMenuChange(idx, "description", e.target.value)}
                    rows={2}
                    className="w-full rounded-xl border border-[rgba(44,26,14,0.15)] px-4 py-2 text-xs focus:outline-none focus:border-[#C4822A] resize-none"
                  />
                </div>
              </div>
            ))}

            {/* Add menu item button */}
            <button
              onClick={handleAddMenu}
              className="flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-[#C4822A] text-[#C4822A] hover:bg-[#FFF5E8] transition-all font-semibold text-sm"
            >
              <Plus className="h-4 w-4" />
              <span>메뉴 추가하기</span>
            </button>

            {/* Action buttons */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setStep(1)}
                disabled={isSubmitting}
                className="flex-1 py-3.5 rounded-xl border border-[rgba(44,26,14,0.15)] text-[#7A6A58] bg-white font-bold transition-all disabled:opacity-50 text-center"
              >
                ← 이전 단계
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-[2] py-3.5 rounded-xl text-white font-bold transition-all flex items-center justify-center gap-2 hover:opacity-95 disabled:opacity-50"
                style={{ backgroundColor: "#C4822A" }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>저장 중...</span>
                  </>
                ) : (
                  <span>완료 및 DB 저장하기</span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
