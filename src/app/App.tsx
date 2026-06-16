import { useState } from "react";
import { stores as initialStores, type Store, type MenuItem, type UserProfile } from "./components/mockData";
import { TasteOnboarding } from "./components/TasteOnboarding";
import { HomePage } from "./components/HomePage";
import { StorePage } from "./components/StorePage";
import { MapPage } from "./components/MapPage";
import { MenuDetailPage } from "./components/MenuDetailPage";

export default function App() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [stores, setStores] = useState<Store[]>(initialStores);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);
  const [view, setView] = useState<"home" | "map">("home");

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

  // Show onboarding on first visit
  if (!onboardingDone) {
    return <TasteOnboarding onComplete={handleOnboardingComplete} />;
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
        onSelectMenu={setSelectedMenu}
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
    <HomePage
      stores={stores}
      userProfile={userProfile}
      onSelectStore={setSelectedStore}
      onOpenMap={() => setView("map")}
    />
  );
}
