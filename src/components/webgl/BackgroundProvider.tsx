"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DEFAULT_SCENE, type SceneId, SCENES } from "@/lib/webgl/scenes";

const STORAGE_KEY = "wk-scene";

type Ctx = {
  scene: SceneId;
  setScene: (id: SceneId) => void;
  enabled: boolean;
  setEnabled: (on: boolean) => void;
};

const BackgroundCtx = createContext<Ctx | null>(null);

export function useBackground() {
  const ctx = useContext(BackgroundCtx);
  if (!ctx) throw new Error("useBackground must be used inside BackgroundProvider");
  return ctx;
}

const isSceneId = (v: string | null): v is SceneId =>
  !!v && SCENES.some((s) => s.id === v);

export function BackgroundProvider({ children }: { children: ReactNode }) {
  // Lazy initialiser reads the same key the pre-paint script does, so React's
  // first render already agrees with what is on screen.
  const [scene, setSceneState] = useState<SceneId>(() => {
    if (typeof window === "undefined") return DEFAULT_SCENE;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isSceneId(stored) ? stored : DEFAULT_SCENE;
  });

  // Read in the initialiser, same as `scene` — an effect that calls setState
  // here would cost an extra render and flash the background on for a frame.
  const [enabled, setEnabledState] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.localStorage.getItem(`${STORAGE_KEY}-off`) !== "1";
  });

  const setScene = useCallback((id: SceneId) => {
    setSceneState(id);
    try {
      window.localStorage.setItem(STORAGE_KEY, id);
    } catch {
      /* private mode — the choice just won't persist */
    }
  }, []);

  const setEnabled = useCallback((on: boolean) => {
    setEnabledState(on);
    try {
      window.localStorage.setItem(`${STORAGE_KEY}-off`, on ? "0" : "1");
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({ scene, setScene, enabled, setEnabled }),
    [scene, setScene, enabled, setEnabled],
  );

  return <BackgroundCtx.Provider value={value}>{children}</BackgroundCtx.Provider>;
}
