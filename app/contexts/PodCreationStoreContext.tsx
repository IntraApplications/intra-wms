import React, {
  createContext,
  useContext,
  useRef,
  type PropsWithChildren,
} from "react";
import { useStore } from "zustand";
import {
  createPodCreationStore,
  type PodCreationStore,
} from "@/stores/podCreationStore";

// Create a context for the PodCreationStore
const PodCreationStoreContext = createContext<PodCreationStore | null>(null);

// Custom hook to use the PodCreationStore
export const usePodCreationStore = <T,>(
  selector: (store: PodCreationStore) => T
): T => {
  const store = useContext(PodCreationStoreContext);
  if (!store)
    throw new Error(
      "usePodCreationStore must be used within PodCreationProvider"
    );
  return useStore(store, selector);
};

// Provider component
export const PodCreationProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const storeRef = useRef<PodCreationStore>();
  if (!storeRef.current) {
    storeRef.current = createPodCreationStore();
  }

  return (
    <PodCreationStoreContext.Provider value={storeRef.current}>
      {children}
    </PodCreationStoreContext.Provider>
  );
};
