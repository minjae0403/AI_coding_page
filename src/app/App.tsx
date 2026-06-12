import { useState } from "react";
import { stores as initialStores, type MenuItem, type Store } from "./components/mockData";
import { HomePage } from "./components/HomePage";
import { StorePage } from "./components/StorePage";
import { MapPage } from "./components/MapPage";
import { MenuDetailPage } from "./components/MenuDetailPage";

export default function App() {
  const [stores, setStores] = useState<Store[]>(initialStores);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);
  const [view, setView] = useState<"home" | "map">("home");

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

  if (selectedMenu && selectedStore) {
    return (
      <MenuDetailPage
        store={selectedStore}
        menu={selectedMenu}
        onBack={() => setSelectedMenu(null)}
        onStoreUpdate={handleStoreUpdate}
      />
    );
  }

  if (selectedStore) {
    return (
      <StorePage
        store={selectedStore}
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
      onSelectStore={setSelectedStore}
      onOpenMap={() => setView("map")}
    />
  );
}
