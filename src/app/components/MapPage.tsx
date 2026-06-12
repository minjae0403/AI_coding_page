import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { ArrowLeft, ExternalLink, MapPin, Navigation } from "lucide-react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import type { Store } from "./mockData";

interface Props {
  stores: Store[];
  onBack: () => void;
  onSelectStore: (store: Store) => void;
}

const SEOUL_CENTER: [number, number] = [37.548, 126.995];

function getNaverMapUrl(store: Store) {
  return `https://map.naver.com/p/search/${encodeURIComponent(store.address)}`;
}

function createStoreIcon(type: Store["type"]) {
  const color = type === "cafe" ? "#3D6BF5" : "#FF6B35";

  return L.divIcon({
    className: "",
    html: `
      <div style="
        width: 34px;
        height: 34px;
        border-radius: 9999px;
        background: ${color};
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 10px 24px rgba(15, 23, 42, 0.22);
        border: 4px solid white;
      ">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -34],
  });
}

function FitStoreBounds({ stores }: { stores: Store[] }) {
  const map = useMap();

  useEffect(() => {
    if (stores.length === 0) return;
    const bounds = L.latLngBounds(stores.map((store) => [store.lat, store.lng]));
    map.fitBounds(bounds, { padding: [36, 36], maxZoom: 13 });
  }, [map, stores]);

  return null;
}

export function MapPage({ stores, onBack, onSelectStore }: Props) {
  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <header className="sticky top-0 z-20 border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={onBack}
            aria-label="목록으로 돌아가기"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold text-gray-900">지도에서 보기</h1>
            <p className="text-xs text-gray-400">저장된 매장 {stores.length}곳</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-4">
        <section className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <div className="h-[430px]">
            <MapContainer
              center={SEOUL_CENTER}
              zoom={12}
              scrollWheelZoom
              className="h-full w-full"
              zoomControl
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <FitStoreBounds stores={stores} />
              {stores.map((store) => (
                <Marker
                  key={store.id}
                  position={[store.lat, store.lng]}
                  icon={createStoreIcon(store.type)}
                >
                  <Popup>
                    <div className="w-52">
                      <p className="mb-1 text-sm font-semibold text-gray-900">{store.name}</p>
                      <p className="mb-2 text-xs text-gray-500">
                        {store.category} · {store.district}
                      </p>
                      <p className="mb-3 text-xs leading-relaxed text-gray-600">{store.address}</p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => onSelectStore(store)}
                          className="flex-1 rounded-md bg-[#3D6BF5] px-2 py-1.5 text-xs font-semibold text-white"
                        >
                          상세 보기
                        </button>
                        <a
                          href={getNaverMapUrl(store)}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center rounded-md bg-gray-100 px-2 py-1.5 text-xs font-semibold text-gray-700"
                        >
                          지도
                        </a>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 px-3 py-2 text-xs text-gray-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#3D6BF5]" />
                카페
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#FF6B35]" />
                식당
              </span>
            </div>
            <span>확대/축소, 드래그 가능</span>
          </div>
        </section>

        <section className="mt-4 flex flex-col gap-2">
          {stores.map((store) => (
            <article key={store.id} className="rounded-lg border border-gray-100 bg-white p-3">
              <div className="flex items-start gap-3">
                <img src={store.image} alt={store.name} className="h-14 w-14 shrink-0 rounded-lg object-cover" />
                <button type="button" onClick={() => onSelectStore(store)} className="min-w-0 flex-1 text-left">
                  <h2 className="truncate text-sm font-semibold text-gray-900">{store.name}</h2>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {store.category} · {store.district}
                  </p>
                  <p className="mt-1 line-clamp-1 text-xs text-gray-500">{store.address}</p>
                </button>
                <a
                  href={getNaverMapUrl(store)}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${store.name} 네이버 지도에서 보기`}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-blue-50 hover:text-[#3D6BF5]"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </article>
          ))}
        </section>

        <a
          href={`https://map.naver.com/p/search/${encodeURIComponent("서울 카페 식당")}`}
          target="_blank"
          rel="noreferrer"
          className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-[#1A1D23] px-4 py-3 text-sm font-semibold text-white"
        >
          <Navigation className="h-4 w-4" />
          네이버 지도 열기
        </a>

        <p className="mt-3 flex items-start gap-1.5 text-xs leading-relaxed text-gray-400">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          앱 안의 지도는 OpenStreetMap을 사용하고, 외부 지도 버튼은 주소만으로 네이버 지도 검색을 엽니다.
        </p>
      </main>
    </div>
  );
}
