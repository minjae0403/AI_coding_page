import { type Store, type MenuItem, type Review } from "./components/mockData";

// ORDS Endpoint Base URL
const ORDS_BASE_URL = import.meta.env.VITE_ORDS_PATH;
const SCHEMA = 'test_server'; // 소문자 스키마명
const API_URL = `${ORDS_BASE_URL.endsWith('/') ? ORDS_BASE_URL : ORDS_BASE_URL + '/'}${SCHEMA}`;

export type StoreCreateInput = {
  name: string;
  type: Store["type"];
  category: string;
  address: string;
  district: string;
  phone?: string | null;
  hours?: string | null;
  imageUrl?: string | null;
  description?: string | null;
  latitude: number;
  longitude: number;
  congestion?: number;
  tags?: string[];
};

export type MenuCreateInput = {
  storeId: string;
  name: string;
  category: string;
  price: number;
  description?: string | null;
  imageUrl?: string | null;
};

export interface ORDSResponse<T> {
  items: T[];
  hasMore: boolean;
  limit: number;
  offset: number;
  count: number;
}

export async function fetchStoresFromDB(): Promise<Store[]> {
  try {
    // 1. 필요한 모든 데이터 병렬 fetch
    const [storesRes, menusRes, reviewsRes, storeTagsRes, reviewTagsRes] = await Promise.all([
      fetch(`${API_URL}/stores/?limit=100`).then(r => r.json() as Promise<ORDSResponse<any>>),
      fetch(`${API_URL}/menu_items/?limit=500`).then(r => r.json() as Promise<ORDSResponse<any>>),
      fetch(`${API_URL}/reviews/?limit=1000`).then(r => r.json() as Promise<ORDSResponse<any>>),
      fetch(`${API_URL}/store_tags/?limit=500`).then(r => r.json() as Promise<ORDSResponse<any>>),
      fetch(`${API_URL}/review_tags/?limit=1000`).then(r => r.json() as Promise<ORDSResponse<any>>)
    ]);

    const ordsStores = storesRes.items || [];
    const ordsMenus = menusRes.items || [];
    const ordsReviews = reviewsRes.items || [];
    const ordsStoreTags = storeTagsRes.items || [];
    const ordsReviewTags = reviewTagsRes.items || [];

    // 2. 계층형 데이터(MockData 스키마) 조립
    const assembledStores: Store[] = ordsStores.map((s: any) => {
      // 해당 매장의 태그들 수집
      const tags = ordsStoreTags
        .filter((t: any) => t.store_id === s.store_id)
        .map((t: any) => t.tag_name);

      // 해당 매장의 메뉴들 수집
      const storeMenus: MenuItem[] = ordsMenus
        .filter((m: any) => m.store_id === s.store_id)
        .map((m: any) => {
          // 해당 메뉴의 리뷰들 수집
          const menuReviews: Review[] = ordsReviews
            .filter((r: any) => r.menu_id === m.menu_id)
            .map((r: any) => {
              // 리뷰의 태그들 수집
              const rTags = ordsReviewTags
                .filter((rt: any) => rt.review_id === r.review_id)
                .map((rt: any) => rt.tag_name);

              return {
                id: r.review_id,
                userId: r.user_id,
                userName: r.nickname || `유저_${r.user_id}`, // UI 닉네임 대응
                menuId: r.menu_id,
                rating: Number(r.rating),
                flavorProfile: {
                  dim1: Number(r.dim1),
                  dim2: Number(r.dim2),
                  dim3: Number(r.dim3),
                  dim4: Number(r.dim4),
                  dim5: Number(r.dim5)
                },
                comment: r.comment_text || "",
                tags: rTags,
                companion: r.companion,
                purpose: r.purpose,
                createdAt: r.created_at ? r.created_at.substring(0, 10) : new Date().toISOString().substring(0, 10),
                helpful: Number(r.helpful || 0)
              };
            });

          // 평균 맛 프로필 계산
          const avgFlavor = menuReviews.length > 0 
            ? {
                dim1: Math.round(menuReviews.reduce((sum, r) => sum + r.flavorProfile.dim1, 0) / menuReviews.length),
                dim2: Math.round(menuReviews.reduce((sum, r) => sum + r.flavorProfile.dim2, 0) / menuReviews.length),
                dim3: Math.round(menuReviews.reduce((sum, r) => sum + r.flavorProfile.dim3, 0) / menuReviews.length),
                dim4: Math.round(menuReviews.reduce((sum, r) => sum + r.flavorProfile.dim4, 0) / menuReviews.length),
                dim5: Math.round(menuReviews.reduce((sum, r) => sum + r.flavorProfile.dim5, 0) / menuReviews.length)
              }
            : { dim1: 50, dim2: 50, dim3: 50, dim4: 50, dim5: 50 }; // 기본값

          return {
            id: m.menu_id,
            name: m.name,
            category: m.category || "",
            price: Number(m.price || 0),
            description: m.description || "",
            image: m.image_url || undefined,
            reviews: menuReviews,
            avgFlavor: avgFlavor
          };
        });

      return {
        id: s.store_id,
        name: s.name,
        type: s.type as "cafe" | "restaurant",
        category: s.category,
        address: s.address,
        district: s.district,
        phone: s.phone || "",
        hours: s.hours || "",
        image: s.image_url || "",
        description: s.description || "",
        lat: Number(s.latitude),
        lng: Number(s.longitude),
        congestion: Number(s.congestion || 0),
        congestionUpdated: "실시간",
        menu: storeMenus,
        tags: tags
      };
    });

    return assembledStores;
  } catch (error) {
    console.error("오라클 DB 데이터 로드 실패. 로컬 mockData로 대체합니다:", error);
    throw error;
  }
}

export async function createStoreInDB(input: StoreCreateInput) {
  const storeId = `store-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const storePayload = {
    store_id: storeId,
    name: input.name,
    type: input.type,
    category: input.category,
    address: input.address,
    district: input.district,
    phone: input.phone || null,
    hours: input.hours || null,
    image_url: input.imageUrl || null,
    description: input.description || null,
    latitude: input.latitude,
    longitude: input.longitude,
    congestion: input.congestion ?? 10,
  };

  const storeRes = await fetch(`${API_URL}/stores/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(storePayload),
  });

  if (!storeRes.ok) {
    const errorText = await storeRes.text();
    throw new Error(`가게 등록에 실패했습니다. (${storeRes.status}) ${errorText}`);
  }

  for (const tag of input.tags ?? []) {
    await fetch(`${API_URL}/store_tags/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ store_id: storeId, tag_name: tag }),
    });
  }

  return { storeId };
}

export async function createMenuInDB(input: MenuCreateInput) {
  const menuPayload = {
    menu_id: `menu-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    store_id: input.storeId,
    name: input.name,
    category: input.category,
    price: input.price,
    description: input.description || null,
    image_url: input.imageUrl || null,
  };

  const res = await fetch(`${API_URL}/menu_items/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(menuPayload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`메뉴 등록에 실패했습니다. (${res.status}) ${errorText}`);
  }
}
