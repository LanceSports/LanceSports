import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  getCachedJSON,
  setCachedJSON,
} from "../lib/cache";
import {
  Fixture,
  type FixturesApiResponse,
} from "../types/fixtures";

type FixturesContextValue = {
  fixtures: Fixture[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastFetched: number | null;
  refresh: (options?: { force?: boolean }) => Promise<void>;
};

const FixturesContext = createContext<FixturesContextValue | undefined>(
  undefined,
);

const FIXTURES_URL =
  "https://lancesports-fixtures-api.onrender.com/leagueFixtures";
const CACHE_TTL = 5 * 60 * 1000;
const REFRESH_INTERVAL = 5 * 60 * 1000;
const CACHE_KEY = `cache:${FIXTURES_URL}`;

export function FixturesProvider({ children }: { children: ReactNode }) {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<number | null>(null);

  const hasResolvedRef = useRef(false);
  const lastFetchedRef = useRef<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchFromApi = useCallback(
    async (signal: AbortSignal): Promise<FixturesApiResponse> => {
      const response = await fetch(FIXTURES_URL, {
        signal,
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = (await response.json()) as FixturesApiResponse;
      setCachedJSON(CACHE_KEY, data, CACHE_TTL);
      return data;
    },
    [],
  );

  const fetchFixtures = useCallback(
    async (
      options: { forceFresh?: boolean; background?: boolean } = {},
    ) => {
      if (typeof window === "undefined") {
        return;
      }

      const { forceFresh = false, background = false } = options;
      const showInitialLoader = !background && !hasResolvedRef.current;

      if (showInitialLoader) {
        setIsLoading(true);
      }
      if (background) {
        setIsRefreshing(true);
      }

      setError(null);

      try {
        let payload: FixturesApiResponse | null = null;
        let usedCache = false;

        if (!forceFresh) {
          payload = getCachedJSON<FixturesApiResponse>(CACHE_KEY);
          usedCache = Boolean(payload);
        }

        if (!payload) {
          abortControllerRef.current?.abort();
          const controller = new AbortController();
          abortControllerRef.current = controller;
          payload = await fetchFromApi(controller.signal);
        }

        if (!payload) {
          throw new Error("No fixtures data returned");
        }

        setFixtures(payload.fixtures ?? []);
        const now = Date.now();
        setLastFetched(now);
        lastFetchedRef.current = now;
        hasResolvedRef.current = true;

        if (usedCache) {
          void fetchFixtures({ forceFresh: true, background: true });
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        setError(err instanceof Error ? err.message : "Failed to load fixtures");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [fetchFromApi],
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    void fetchFixtures();

    const intervalId = window.setInterval(() => {
      void fetchFixtures({ forceFresh: true, background: true });
    }, REFRESH_INTERVAL);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        const minutesSinceFetch = lastFetchedRef.current
          ? Date.now() - lastFetchedRef.current
          : Infinity;
        if (minutesSinceFetch >= REFRESH_INTERVAL) {
          void fetchFixtures({ forceFresh: true, background: true });
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibility);
      abortControllerRef.current?.abort();
    };
  }, [fetchFixtures]);

  const value = useMemo<FixturesContextValue>(
    () => ({
      fixtures,
      isLoading,
      isRefreshing,
      error,
      lastFetched,
      refresh: async (options) => {
        await fetchFixtures({
          forceFresh: options?.force ?? false,
          background: Boolean(options?.force),
        });
      },
    }),
    [fixtures, isLoading, isRefreshing, error, lastFetched, fetchFixtures],
  );

  return (
    <FixturesContext.Provider value={value}>
      {children}
    </FixturesContext.Provider>
  );
}

export function useFixtures() {
  const context = useContext(FixturesContext);
  if (!context) {
    throw new Error("useFixtures must be used within a FixturesProvider");
  }
  return context;
}
