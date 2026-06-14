export type StoreType = "cafe" | "restaurant";

export interface FlavorProfile {
  acidity: number;
  sweetness: number;
  bitterness: number;
  body: number;
  aroma: number;
}

export interface MealFlavorProfile {
  priceValue: number;
  portion: number;
  saltiness: number;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  menuId: string;
  rating: number;
  flavorProfile: FlavorProfile | MealFlavorProfile;
  comment: string;
  tags: string[];
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
  avgFlavor: FlavorProfile | MealFlavorProfile;
  tags?: string[];
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
  lat: number;
  lng: number;
  congestion: number;
  congestionUpdated: string;
  menu: MenuItem[];
  tags: string[];
}

export const FLAVOR_LABELS: Record<keyof FlavorProfile, string> = {
  acidity: "산미",
  sweetness: "단맛",
  bitterness: "쓴맛",
  body: "바디감",
  aroma: "향",
};

export const RESTAURANT_FLAVOR_LABELS: Record<keyof FlavorProfile, string> = {
  acidity: "새콤함",
  sweetness: "단맛",
  bitterness: "쌉쌀함",
  body: "진한맛",
  aroma: "향",
};

export const MEAL_FLAVOR_LABELS: Record<keyof MealFlavorProfile, string> = {
  priceValue: "가성비",
  portion: "양",
  saltiness: "짠맛",
};

export const stores: Store[] = [
  {
    id: "1",
    name: "포레스트 커피",
    type: "cafe",
    category: "스페셜티 카페",
    address: "서울 마포구 연남로 223-14",
    district: "마포구",
    phone: "02-1234-5678",
    hours: "월-금 09:00-21:00, 토-일 10:00-22:00",
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=500&fit=crop&auto=format",
    description: "에티오피아와 케냐 싱글 오리진 원두를 직접 로스팅하는 조용한 스페셜티 카페입니다.",
    lat: 37.5622,
    lng: 126.9237,
    congestion: 40,
    congestionUpdated: "5분 전",
    tags: ["스페셜티", "싱글오리진", "핸드드립", "조용함"],
    menu: [
      {
        id: "m1",
        name: "에티오피아 예가체프 핸드드립",
        category: "핸드드립",
        price: 8500,
        description: "자스민 플로럴 향과 밝은 산미가 돋보이는 예가체프 커피",
        image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop&auto=format",
        avgFlavor: { acidity: 82, sweetness: 65, bitterness: 30, body: 45, aroma: 90 },
        tags: ["#커피"],
        reviews: [
          {
            id: "r1",
            userId: "u1",
            userName: "커피맛잘알",
            menuId: "m1",
            rating: 5,
            flavorProfile: { acidity: 85, sweetness: 70, bitterness: 25, body: 40, aroma: 92 },
            comment: "산미가 정말 선명하고 자스민 향이 입안에 오래 남아요. 아침에 마시기 좋은 커피입니다.",
            tags: ["밝은산미", "플로럴", "가벼운바디"],
            createdAt: "2026-06-08",
            helpful: 12,
          },
          {
            id: "r2",
            userId: "u2",
            userName: "연남동산책",
            menuId: "m1",
            rating: 4,
            flavorProfile: { acidity: 80, sweetness: 60, bitterness: 35, body: 50, aroma: 88 },
            comment: "기대보다 산미가 강하게 느껴졌지만 향이 복합적이라 기분 좋게 마셨어요.",
            tags: ["복합향", "밝은산미"],
            createdAt: "2026-06-05",
            helpful: 7,
          },
        ],
      },
      {
        id: "m2",
        name: "케냐 니에리 에스프레소",
        category: "에스프레소",
        price: 5500,
        description: "블랙커런트의 산뜻함과 강한 바디를 가진 케냐 AA 에스프레소",
        image: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=600&h=400&fit=crop&auto=format",
        avgFlavor: { acidity: 70, sweetness: 50, bitterness: 65, body: 80, aroma: 75 },
        tags: ["#커피"],
        reviews: [
          {
            id: "r3",
            userId: "u3",
            userName: "에스프레소덕후",
            menuId: "m2",
            rating: 5,
            flavorProfile: { acidity: 72, sweetness: 48, bitterness: 68, body: 82, aroma: 76 },
            comment: "블랙커런트의 새콤쌉쌀함이 진한 바디와 잘 어울립니다. 추천해요.",
            tags: ["진한바디", "블랙커런트", "묵직한맛"],
            createdAt: "2026-06-07",
            helpful: 9,
          },
        ],
      },
      {
        id: "m3",
        name: "콜드브루 토닉",
        category: "시그니처",
        price: 7000,
        description: "12시간 저온 추출 콜드브루에 토닉워터를 더한 시그니처 메뉴",
        image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&h=400&fit=crop&auto=format",
        avgFlavor: { acidity: 60, sweetness: 75, bitterness: 40, body: 55, aroma: 68 },
        tags: ["#커피"],
        reviews: [],
      },
    ],
  },
  {
    id: "2",
    name: "온기 식당",
    type: "restaurant",
    category: "한식",
    address: "서울 성동구 성수일로 668-34",
    district: "성동구",
    phone: "02-9876-5432",
    hours: "월-일 11:30-21:00 (브레이크 15:00-17:30)",
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=800&h=500&fit=crop&auto=format",
    description: "제철 재료를 사용한 따뜻한 한식. 매일 아침 직접 담근 김치가 제공됩니다.",
    lat: 37.5446,
    lng: 127.0557,
    congestion: 75,
    congestionUpdated: "12분 전",
    tags: ["한식", "제철재료", "가정식", "든든함"],
    menu: [
      {
        id: "m4",
        name: "된장찌개 정식",
        category: "정식",
        price: 12000,
        description: "국산 콩 된장으로 끓인 구수한 찌개와 제철 반찬 5가지",
        image: "https://images.unsplash.com/photo-1583908701673-8b4b89f3b8b4?w=600&h=400&fit=crop&auto=format",
        avgFlavor: { priceValue: 85, portion: 80, saltiness: 70 },
        tags: ["#식사"],
        reviews: [
          {
            id: "r4",
            userId: "u4",
            userName: "밥심으로살아",
            menuId: "m4",
            rating: 5,
            flavorProfile: { priceValue: 90, portion: 85, saltiness: 65 },
            comment: "집에서 먹는 된장찌개 맛 그대로입니다. 반찬 하나하나 정성이 느껴지고 밥과 잘 어울려요.",
            tags: ["구수함", "정성", "가정식맛", "#식사"],
            createdAt: "2026-06-09",
            helpful: 18,
          },
          {
            id: "r5",
            userId: "u5",
            userName: "미식가김씨",
            menuId: "m4",
            rating: 4,
            flavorProfile: { priceValue: 80, portion: 75, saltiness: 75 },
            comment: "깊은 된장 풍미가 좋습니다. 약간 짜게 느껴질 수 있어요.",
            tags: ["구수함", "진한맛", "#식사"],
            createdAt: "2026-06-06",
            helpful: 5,
          },
        ],
      },
      {
        id: "m5",
        name: "갈치조림",
        category: "생선",
        price: 15000,
        description: "제주산 은갈치와 무, 청양고추를 넣어 칼칼하게 조린 메뉴",
        image: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=600&h=400&fit=crop&auto=format",
        avgFlavor: { priceValue: 75, portion: 70, saltiness: 75 },
        tags: ["#식사"],
        reviews: [
          {
            id: "r6",
            userId: "u6",
            userName: "생선러버",
            menuId: "m5",
            rating: 5,
            flavorProfile: { priceValue: 80, portion: 75, saltiness: 80 },
            comment: "갈치살이 부드럽고 양념이 깊게 배어 있어요. 청양고추 덕분에 칼칼한 맛이 중독적입니다.",
            tags: ["칼칼함", "부드러운살", "중독적", "#식사"],
            createdAt: "2026-06-04",
            helpful: 14,
          },
        ],
      },
    ],
  },
  {
    id: "3",
    name: "블루바 커피바",
    type: "cafe",
    category: "에스프레소 바",
    address: "서울 용산구 이태원로 130-6",
    district: "용산구",
    phone: "02-5555-1234",
    hours: "매일 08:00-23:00",
    image: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800&h=500&fit=crop&auto=format",
    description: "이탈리안 에스프레소 스타일을 고집하는 작은 에스프레소 바입니다.",
    lat: 37.5345,
    lng: 126.9946,
    congestion: 20,
    congestionUpdated: "3분 전",
    tags: ["에스프레소바", "이탈리안", "빠른회전", "직장인"],
    menu: [
      {
        id: "m6",
        name: "더블 에스프레소",
        category: "에스프레소",
        price: 4500,
        description: "브라질과 콜롬비아 블렌딩의 균형 잡힌 더블 에스프레소",
        image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&h=400&fit=crop&auto=format",
        avgFlavor: { acidity: 45, sweetness: 55, bitterness: 60, body: 78, aroma: 72 },
        tags: ["#커피"],
        reviews: [
          {
            id: "r7",
            userId: "u7",
            userName: "출근전한잔",
            menuId: "m6",
            rating: 4,
            flavorProfile: { acidity: 42, sweetness: 58, bitterness: 62, body: 80, aroma: 70 },
            comment: "매일 출근 전에 들르기 좋아요. 균형 잡힌 맛에 가성비도 좋습니다.",
            tags: ["균형잡힘", "가성비", "진한"],
            createdAt: "2026-06-10",
            helpful: 21,
          },
        ],
      },
    ],
  },
  {
    id: "4",
    name: "아추토 키친",
    type: "restaurant",
    category: "이탈리안",
    address: "서울 강남구 청담로 79-11",
    district: "강남구",
    phone: "02-7777-8888",
    hours: "월-일 12:00-22:00 (브레이크 15:00-18:00)",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=500&fit=crop&auto=format",
    description: "신선한 국산 재료로 만드는 가정식 이탈리안. 생면 파스타를 직접 만듭니다.",
    lat: 37.5252,
    lng: 127.0473,
    congestion: 55,
    congestionUpdated: "8분 전",
    tags: ["이탈리안", "생면파스타", "데이트", "분위기좋음"],
    menu: [
      {
        id: "m7",
        name: "까르보나라 생면 파스타",
        category: "파스타",
        price: 18000,
        description: "판체타, 계란 노른자, 페코리노 로마노로 만든 정통 까르보나라",
        image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&h=400&fit=crop&auto=format",
        avgFlavor: { priceValue: 70, portion: 90, saltiness: 50 },
        tags: ["#식사"],
        reviews: [
          {
            id: "r8",
            userId: "u8",
            userName: "파스타집착러",
            menuId: "m7",
            rating: 5,
            flavorProfile: { priceValue: 75, portion: 95, saltiness: 45 },
            comment: "생면의 쫄깃함과 크리미한 소스가 인상적입니다. 서울에서 먹어본 까르보나라 중 최고예요.",
            tags: ["크리미", "쫄깃한생면", "진한풍미", "#식사"],
            createdAt: "2026-06-07",
            helpful: 28,
          },
          {
            id: "r9",
            userId: "u9",
            userName: "청담미식가",
            menuId: "m7",
            rating: 4,
            flavorProfile: { priceValue: 65, portion: 85, saltiness: 55 },
            comment: "정통 스타일이라 생크림이 없어 처음엔 낯설지만, 고소함이 중독적이에요.",
            tags: ["정통스타일", "진한풍미", "#식사"],
            createdAt: "2026-06-03",
            helpful: 15,
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
        avgFlavor: { priceValue: 60, portion: 85, saltiness: 40 },
        tags: ["#식사"],
        reviews: [],
      },
    ],
  },
];
