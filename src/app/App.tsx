import { useState } from "react";
import { stores as initialStores, type Store } from "./components/mockData";
import { HomePage } from "./components/HomePage";
import { StorePage } from "./components/StorePage";
import { MapPage } from "./components/MapPage";

export default function App() {
  const [stores, setStores] = useState<Store[]>(initialStores);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [view, setView] = useState<"home" | "map">("home");

  const handleStoreUpdate = (updatedStore: Store) => {
    setStores((prev) => prev.map((s) => (s.id === updatedStore.id ? updatedStore : s)));
    setSelectedStore(updatedStore);
  };

  if (selectedStore) {
    return (
      <StorePage
        store={selectedStore}
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
    <HomePage
      stores={stores}
      onSelectStore={setSelectedStore}
      onOpenMap={() => setView("map")}
    />
  );
}
