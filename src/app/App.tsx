import { useState, useEffect } from "react";
import { type Store, type MenuItem, type UserProfile } from "./components/mockData";
import { fetchStoresFromDB } from "./api";
import { TasteOnboarding } from "./components/TasteOnboarding";
import { HomePage } from "./components/HomePage";
import { StorePage } from "./components/StorePage";
import { MapPage } from "./components/MapPage";
import { MenuDetailPage } from "./components/MenuDetailPage";
import { RegisterPage } from "./components/RegisterPage";

export default function App() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);
  const [view, setView] = useState<"home" | "map" | "register">("home");

  const loadStores = () => {
    setLoading(true);
    fetchStoresFromDB()
      .then((data) => {
        setStores(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadStores();
  }, []);

  const handleOnboardingComplete = (profile: UserProfile) => {
    setUserProfile(profile);
    setOnboardingDone(true);
  };

  const handleStoreUpdate = (updatedStore: Store) => {
    setStores((prev) => prev.map((s) => (s.id === updatedStore.id ? updatedStore : s)));
    setSelectedStore(updatedStore);
    if (selectedMenu) {
      const updatedMenuItem = updatedStore.menu.find(m => m.id === selectedMenu.id);
      if (updatedMenuItem) {
        setSelectedMenu(updatedMenuItem);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-950 text-white font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
          <p className="text-zinc-400 animate-pulse">실시간 오라클 클라우드 데이터베이스 로딩 중...</p>
        </div>
      </div>
    );
  }

  // Show onboarding on first visit
  if (!onboardingDone) {
    return <TasteOnboarding onComplete={handleOnboardingComplete} />;
  }

  if (view === "register") {
    return (
      <RegisterPage
        onBack={() => setView("home")}
        onComplete={() => {
          loadStores();
          setView("home");
        }}
      />
    );
  }

  if (selectedMenu && selectedStore) {
    return (
      <MenuDetailPage
        store={selectedStore}
        menu={selectedMenu}
        onBack={() => setSelectedMenu(null)}
        onGoHome={() => { setSelectedStore(null); setSelectedMenu(null); }}
        onStoreUpdate={handleStoreUpdate}
      />
    );
  }

  if (selectedStore) {
    return (
      <StorePage
        store={selectedStore}
        userProfile={userProfile}
        onBack={() => setSelectedStore(null)}
        onStoreUpdate={handleStoreUpdate}
      />
    );
  }

  if (view === "map") {
    return (
      <MapPage
        stores={stores}
        onBack={() => setView("home")}
        onSelectStore={setSelectedStore}
      />
    );
  }

  return (
    <>
      <HomePage
        stores={stores}
        userProfile={userProfile}
        onSelectStore={setSelectedStore}
        onOpenMap={() => setView("map")}
      />
      {/* FAB - 가게/메뉴 등록 버튼 */}
      <button
        onClick={() => setView("register")}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full px-5 py-3.5 text-white font-semibold shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95"
        style={{
          background: "linear-gradient(135deg, #C4822A 0%, #A0642A 100%)",
          boxShadow: "0 8px 32px rgba(196,130,42,0.4)",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        <span className="text-sm">가게 등록</span>
      </button>
    </>
  );
}
