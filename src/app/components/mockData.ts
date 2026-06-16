export type StoreType = "cafe" | "restaurant";
export type CuisineType = "cafe_dessert" | "korean_chinese" | "western_japanese";

export interface FlavorProfile {
  dim1: number;
  dim2: number;
  dim3: number;
  dim4: number;
  dim5: number;
}

// 동행 유형
export type CompanionType = "solo" | "friend" | "lover" | "family" | "child" | "coworker";
// 방문 목적
export type PurposeType = "value" | "anniversary" | "date" | "work" | "hangover" | "formal" | "casual";

export const COMPANION_OPTIONS: { value: CompanionType; label: string; emoji: string }[] = [
  { value: "solo", label: "혼밥·혼카", emoji: "🙋" },
  { value: "friend", label: "친구", emoji: "👯" },
  { value: "lover", label: "연인", emoji: "💑" },
  { value: "family", label: "가족", emoji: "👨‍👩‍👧" },
  { value: "child", label: "아이와", emoji: "🧒" },
  { value: "coworker", label: "직장동료", emoji: "💼" },
];

export const PURPOSE_OPTIONS: { value: PurposeType; label: string; emoji: string }[] = [
  { value: "value", label: "가성비", emoji: "💰" },
  { value: "anniversary", label: "기념일", emoji: "🎂" },
  { value: "date", label: "데이트", emoji: "🌹" },
  { value: "work", label: "카공·작업", emoji: "💻" },
  { value: "hangover", label: "해장", emoji: "🍜" },
  { value: "formal", label: "격식 있게", emoji: "🎩" },
  { value: "casual", label: "캐주얼", emoji: "😊" },
];

// 사용자 취향 프로필
export interface UserTastePrefs {
  spicy: number;     // 매운맛 선호 0–100
  sweet: number;     // 단맛 선호
  value: number;     // 가성비 중시
  aesthetic: number; // 분위기·비주얼 중시
  depth: number;     // 전문성·깊은맛 중시
}

export interface UserProfile {
  nickname: string;
  tags: string[];         // e.g. ["맵파당", "디저트진심러"]
  prefs: UserTastePrefs;
}

// 카테고리별 라벨
export const CUISINE_LABELS: Record<CuisineType, Record<keyof FlavorProfile, string>> = {
  cafe_dessert: {
    dim1: "단맛",
    dim2: "비주얼",
    dim3: "감성",
    dim4: "커피전문성",
    dim5: "가성비",
  },
  korean_chinese: {
    dim1: "매운맛",
    dim2: "간의세기",
    dim3: "푸짐함",
    dim4: "깊은맛",
    dim5: "기름진정도",
  },
  western_japanese: {
    dim1: "대중성",
    dim2: "비주얼",
    dim3: "가성비",
    dim4: "깔끔함",
    dim5: "특별함",
  },
};

// 사용자 prefs → 해당 cuisine의 dim 선호값으로 매핑
export function mapPrefsToDims(prefs: UserTastePrefs, cuisineType: CuisineType): FlavorProfile {
  if (cuisineType === "cafe_dessert") {
    return { dim1: prefs.sweet, dim2: prefs.aesthetic, dim3: prefs.aesthetic, dim4: prefs.depth, dim5: prefs.value };
  }
  if (cuisineType === "korean_chinese") {
    return { dim1: prefs.spicy, dim2: prefs.depth, dim3: prefs.value, dim4: prefs.depth, dim5: 50 };
  }
  // western_japanese
  return { dim1: 70, dim2: prefs.aesthetic, dim3: prefs.value, dim4: prefs.depth, dim5: prefs.aesthetic };
}

// 싱크율 계산 (0–100)
export function computeSyncScore(prefs: UserTastePrefs, store: Store): number {
  const cuisineType = getCuisineType(store.category);
  const totalReviews = store.menu.reduce((s, m) => s + m.reviews.length, 0);
  if (totalReviews === 0) return 0;

  // 매장의 전체 평균 flavor
  const allReviews = store.menu.flatMap((m) => m.reviews);
  const avgFlavor: FlavorProfile = {
    dim1: Math.round(allReviews.reduce((s, r) => s + r.flavorProfile.dim1, 0) / allReviews.length),
    dim2: Math.round(allReviews.reduce((s, r) => s + r.flavorProfile.dim2, 0) / allReviews.length),
    dim3: Math.round(allReviews.reduce((s, r) => s + r.flavorProfile.dim3, 0) / allReviews.length),
    dim4: Math.round(allReviews.reduce((s, r) => s + r.flavorProfile.dim4, 0) / allReviews.length),
    dim5: Math.round(allReviews.reduce((s, r) => s + r.flavorProfile.dim5, 0) / allReviews.length),
  };

  const userDims = mapPrefsToDims(prefs, cuisineType);
  const keys: Array<keyof FlavorProfile> = ["dim1", "dim2", "dim3", "dim4", "dim5"];

  // 유클리드 거리 기반 유사도
  const dist = Math.sqrt(
    keys.reduce((sum, k) => sum + Math.pow(avgFlavor[k] - userDims[k], 2), 0)
  );
  const maxDist = Math.sqrt(5 * 100 * 100);
  const raw = Math.round((1 - dist / maxDist) * 100);

  // 70–99 범위로 리매핑 (더 사용자 친화적)
  return Math.round(70 + (raw / 100) * 29);
}

export const CUISINE_TAGS: Record<CuisineType, string[]> = {
  cafe_dessert: ["달달함", "포토존", "인스타감성", "핸드드립전문", "가성비최고", "고급스러운", "아늑함", "전문바리스타", "조용한", "힙한"],
  korean_chinese: ["칼칼함", "구수함", "푸짐한양", "집밥맛", "중독적", "얼큰함", "깊은국물", "기름안짐", "매콤달콤", "정성가득"],
  western_japanese: ["플레이팅맛집", "데이트코스", "고급스러운", "가성비좋음", "깔끔한맛", "특별한경험", "신선한재료", "정통스타일", "크리미", "담백함"],
};

export function getCuisineType(storeCategory: string): CuisineType {
  if (["한식", "중식", "분식"].some((k) => storeCategory.includes(k))) return "korean_chinese";
  if (["이탈리안", "프렌치", "양식", "일식", "스시"].some((k) => storeCategory.includes(k))) return "western_japanese";
  return "cafe_dessert";
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  menuId: string;
  rating: number;
  flavorProfile: FlavorProfile;
  comment: string;
  tags: string[];
  companion?: CompanionType;
  purpose?: PurposeType;
  createdAt: string;
  helpful: number;
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image?: string;
  reviews: Review[];
  avgFlavor: FlavorProfile;
}

export interface Store {
  id: string;
  name: string;
  type: StoreType;
  category: string;
  address: string;
  district: string;
  phone: string;
  hours: string;
  image: string;
  description: string;
  congestion: number;
  congestionUpdated: string;
  menu: MenuItem[];
  tags: string[];
}

export const stores: Store[] = [
  {
    id: "1",
    name: "포레스트 커피",
    type: "cafe",
    category: "스페셜티 카페",
    address: "서울 마포구 연남동 223-14",
    district: "마포구",
    phone: "02-1234-5678",
    hours: "월–금 09:00–21:00, 토–일 10:00–22:00",
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=500&fit=crop&auto=format",
    description: "에티오피아, 케냐 등 싱글오리진 원두를 직접 로스팅하는 스페셜티 카페입니다.",
    congestion: 40,
    congestionUpdated: "5분 전",
    tags: ["스페셜티", "싱글오리진", "핸드드립", "조용한"],
    menu: [
      {
        id: "m1",
        name: "에티오피아 예가체프 핸드드립",
        category: "핸드드립",
        price: 8500,
        description: "자스민 플로럴, 복숭아, 밝은 산미의 워시드 예가체프",
        image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop&auto=format",
        avgFlavor: { dim1: 55, dim2: 72, dim3: 80, dim4: 95, dim5: 60 },
        reviews: [
          {
            id: "r1", userId: "u1", userName: "커피맛잘앎",
            menuId: "m1", rating: 5,
            flavorProfile: { dim1: 50, dim2: 70, dim3: 82, dim4: 96, dim5: 58 },
            comment: "바리스타가 직접 추출 방식을 설명해줄 만큼 전문적이에요.",
            tags: ["핸드드립전문", "고급스러운", "전문바리스타"],
            companion: "solo", purpose: "work",
            createdAt: "2026-06-08", helpful: 12,
          },
          {
            id: "r2", userId: "u2", userName: "느긋한오후",
            menuId: "m1", rating: 4,
            flavorProfile: { dim1: 60, dim2: 74, dim3: 78, dim4: 94, dim5: 62 },
            comment: "가격이 좀 있지만 전문성은 확실해요. 인테리어도 아늑하고 오래 앉아있기 좋습니다.",
            tags: ["아늑함", "전문바리스타"],
            companion: "friend", purpose: "casual",
            createdAt: "2026-06-05", helpful: 7,
          },
        ],
      },
      {
        id: "m2",
        name: "케냐 키아무티 에스프레소",
        category: "에스프레소",
        price: 5500,
        description: "블랙커런트, 토마토, 강한 바디의 케냐 AA 에스프레소",
        image: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=600&h=400&fit=crop&auto=format",
        avgFlavor: { dim1: 35, dim2: 65, dim3: 75, dim4: 92, dim5: 72 },
        reviews: [
          {
            id: "r3", userId: "u3", userName: "에스프레소덕후",
            menuId: "m2", rating: 5,
            flavorProfile: { dim1: 32, dim2: 62, dim3: 76, dim4: 93, dim5: 74 },
            comment: "5,500원에 이 퀄리티면 가성비도 충분해요.",
            tags: ["가성비최고", "전문바리스타"],
            companion: "solo", purpose: "casual",
            createdAt: "2026-06-07", helpful: 9,
          },
        ],
      },
      {
        id: "m3",
        name: "콜드브루 토닉",
        category: "시그니처",
        price: 7000,
        description: "12시간 냉침 콜드브루에 토닉워터를 더한 시그니처 메뉴",
        image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&h=400&fit=crop&auto=format",
        avgFlavor: { dim1: 65, dim2: 88, dim3: 82, dim4: 78, dim5: 70 },
        reviews: [],
      },
    ],
  },
  {
    id: "2",
    name: "온기 식당",
    type: "restaurant",
    category: "한식",
    address: "서울 성동구 성수동1가 668-34",
    district: "성동구",
    phone: "02-9876-5432",
    hours: "화–일 11:30–21:00 (브레이크 15:00–17:30)",
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=800&h=500&fit=crop&auto=format",
    description: "제철 재료를 사용한 정갈한 한식. 매일 어머니가 직접 담근 김치가 나옵니다.",
    congestion: 75,
    congestionUpdated: "12분 전",
    tags: ["한식", "제철재료", "가정식", "소박한"],
    menu: [
      {
        id: "m4",
        name: "된장찌개 정식",
        category: "정식",
        price: 12000,
        description: "국산 콩 된장으로 끓인 구수한 찌개와 제철 반찬 5가지",
        image: "https://images.unsplash.com/photo-1583908701673-8b4b89f3b8b4?w=600&h=400&fit=crop&auto=format",
        avgFlavor: { dim1: 25, dim2: 65, dim3: 85, dim4: 90, dim5: 20 },
        reviews: [
          {
            id: "r4", userId: "u4", userName: "밥심으로살아",
            menuId: "m4", rating: 5,
            flavorProfile: { dim1: 22, dim2: 68, dim3: 88, dim4: 92, dim5: 18 },
            comment: "집에서 먹는 된장찌개 맛 그대로입니다. 반찬 하나하나 정성이 느껴져요.",
            tags: ["구수함", "정성가득", "집밥맛"],
            companion: "family", purpose: "casual",
            createdAt: "2026-06-09", helpful: 18,
          },
          {
            id: "r5", userId: "u5", userName: "미식가김씨",
            menuId: "m4", rating: 4,
            flavorProfile: { dim1: 28, dim2: 62, dim3: 82, dim4: 88, dim5: 22 },
            comment: "깊은 된장 풍미에 간이 적당해요. 기름지지 않아 먹고 나서도 개운합니다.",
            tags: ["구수함", "깊은국물"],
            companion: "coworker", purpose: "casual",
            createdAt: "2026-06-06", helpful: 5,
          },
        ],
      },
      {
        id: "m5",
        name: "갈치조림",
        category: "생선",
        price: 15000,
        description: "제주산 은갈치에 무와 청양고추를 넣은 칼칼한 조림",
        image: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=600&h=400&fit=crop&auto=format",
        avgFlavor: { dim1: 68, dim2: 72, dim3: 78, dim4: 82, dim5: 30 },
        reviews: [
          {
            id: "r6", userId: "u6", userName: "생선러버",
            menuId: "m5", rating: 5,
            flavorProfile: { dim1: 70, dim2: 74, dim3: 80, dim4: 84, dim5: 28 },
            comment: "칼칼하지만 갈치살이 부드러워서 자꾸 손이 가요.",
            tags: ["칼칼함", "얼큰함", "중독적"],
            companion: "friend", purpose: "hangover",
            createdAt: "2026-06-04", helpful: 14,
          },
        ],
      },
    ],
  },
  {
    id: "3",
    name: "블루밍 커피바",
    type: "cafe",
    category: "에스프레소 바",
    address: "서울 용산구 이태원동 130-6",
    district: "용산구",
    phone: "02-5555-1234",
    hours: "매일 08:00–23:00",
    image: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800&h=500&fit=crop&auto=format",
    description: "이탈리안 에스프레소 스타일을 고집하는 작은 에스프레소 바.",
    congestion: 20,
    congestionUpdated: "3분 전",
    tags: ["에스프레소바", "이탈리안", "빠른", "직장인"],
    menu: [
      {
        id: "m6",
        name: "더블 에스프레소",
        category: "에스프레소",
        price: 4500,
        description: "브라질·콜롬비아 블렌딩의 균형 잡힌 더블 에스프레소",
        image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&h=400&fit=crop&auto=format",
        avgFlavor: { dim1: 40, dim2: 60, dim3: 55, dim4: 80, dim5: 90 },
        reviews: [
          {
            id: "r7", userId: "u7", userName: "출근전한잔",
            menuId: "m6", rating: 4,
            flavorProfile: { dim1: 38, dim2: 58, dim3: 52, dim4: 82, dim5: 92 },
            comment: "매일 출근 전에 들리는 곳. 4,500원에 이 퀄리티면 가성비 최고죠.",
            tags: ["가성비최고", "전문바리스타"],
            companion: "solo", purpose: "work",
            createdAt: "2026-06-10", helpful: 21,
          },
        ],
      },
    ],
  },
  {
    id: "4",
    name: "후추와 소금",
    type: "restaurant",
    category: "이탈리안",
    address: "서울 강남구 청담동 79-11",
    district: "강남구",
    phone: "02-7777-8888",
    hours: "화–일 12:00–22:00 (브레이크 15:00–18:00)",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=500&fit=crop&auto=format",
    description: "신선한 국산 재료로 만드는 가정식 이탈리안. 생면 파스타를 직접 만듭니다.",
    congestion: 55,
    congestionUpdated: "8분 전",
    tags: ["이탈리안", "생면파스타", "데이트", "분위기좋은"],
    menu: [
      {
        id: "m7",
        name: "까르보나라 (생면)",
        category: "파스타",
        price: 18000,
        description: "판체타, 달걀 노른자, 페코리노 로마노로 만든 정통 까르보나라",
        image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&h=400&fit=crop&auto=format",
        avgFlavor: { dim1: 72, dim2: 88, dim3: 55, dim4: 70, dim5: 90 },
        reviews: [
          {
            id: "r8", userId: "u8", userName: "파스타집착남",
            menuId: "m7", rating: 5,
            flavorProfile: { dim1: 75, dim2: 90, dim3: 52, dim4: 68, dim5: 92 },
            comment: "생면의 쫄깃함과 크리미한 소스가 환상적. 가격은 있지만 이 특별함은 돈 값 해요.",
            tags: ["특별한경험", "플레이팅맛집", "크리미"],
            companion: "lover", purpose: "date",
            createdAt: "2026-06-07", helpful: 28,
          },
          {
            id: "r9", userId: "u9", userName: "청담미식러",
            menuId: "m7", rating: 4,
            flavorProfile: { dim1: 69, dim2: 86, dim3: 58, dim4: 72, dim5: 88 },
            comment: "정통 스타일이라 생크림이 없어서 낯설 수 있지만 재료의 맛이 살아있어요.",
            tags: ["정통스타일", "데이트코스"],
            companion: "lover", purpose: "anniversary",
            createdAt: "2026-06-03", helpful: 15,
          },
        ],
      },
      {
        id: "m8",
        name: "트러플 버섯 리소토",
        category: "리소토",
        price: 22000,
        description: "포르치니 버섯과 트러플 오일로 마무리한 고소한 리소토",
        image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=600&h=400&fit=crop&auto=format",
        avgFlavor: { dim1: 60, dim2: 92, dim3: 45, dim4: 82, dim5: 95 },
        reviews: [],
      },
    ],
  },
];
