import { useTranslations } from "next-intl";
import { todaysGame, unlockedThroughDay } from "@/lib/games/registry";

/**
 * Landing screen. Skeleton: shows today's unlocked game (or a pre-launch state)
 * and links to the leaderboard. Sign-in gating and the actual game routes are
 * the build-out work — see docs/ARCHITECTURE.md.
 */
export default function Home() {
  const t = useTranslations("app");
  const today = todaysGame();
  const launched = unlockedThroughDay() > 0;

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-3xl font-semibold">{t("title")}</h1>
      <p className="text-balance opacity-80">{t("tagline")}</p>

      {launched && today ? (
        <a
          href={`/play/${today.id}`}
          className="rounded-full bg-black px-6 py-3 font-medium text-white"
        >
          {t("playToday")}
        </a>
      ) : (
        <p className="opacity-70">{t("comingTomorrow")}</p>
      )}

      <a href="/leaderboard" className="underline opacity-80">
        {t("leaderboard")}
      </a>
    </main>
  );
}
