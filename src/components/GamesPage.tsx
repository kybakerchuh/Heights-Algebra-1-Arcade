import { useMemo, useState } from 'react';
import {
  ArrowRight,
  ExternalLink,
  Pencil,
  Play,
  RotateCcw,
  Search,
} from 'lucide-react';
import {
  ArcadeGame,
  HERO_ARTWORK_PATH,
  REVIEW_TYPES,
  TOPIC_CATEGORIES,
} from '../types/arcade';
import { ThumbnailImage } from './ThumbnailImage';

interface GamesPageProps {
  games: ArcadeGame[];
  loading: boolean;
  isAuthorizedTeacher: boolean;
  onGoToAbout: () => void;
  onOpenWarmup: (warmupKey: string) => void;
  onEditGame: (game: ArcadeGame) => void;
  onOpenTeacherPortal: () => void;
}

export function GamesPage({
  games,
  loading,
  isAuthorizedTeacher,
  onGoToAbout,
  onOpenWarmup,
  onEditGame,
  onOpenTeacherPortal,
}: GamesPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [selectedReviewType, setSelectedReviewType] = useState<string>('All');

  const visibleGames = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return games
      .filter((g) => (isAuthorizedTeacher ? true : g.published))
      .filter((g) =>
        selectedTopic === 'All' ? true : g.topic === selectedTopic
      )
      .filter((g) =>
        selectedReviewType === 'All'
          ? true
          : g.reviewType === selectedReviewType
      )
      .filter((g) => {
        if (!q) return true;
        return (
          g.title.toLowerCase().includes(q) ||
          g.description.toLowerCase().includes(q) ||
          g.topic.toLowerCase().includes(q) ||
          g.createdByName.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        return a.sortOrder - b.sortOrder;
      });
  }, [
    games,
    isAuthorizedTeacher,
    searchQuery,
    selectedTopic,
    selectedReviewType,
  ]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedTopic('All');
    setSelectedReviewType('All');
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Hero Split */}
      <section className="border-b border-white/10 bg-[#0A0A0C]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
              <p className="text-xs font-semibold tracking-wider uppercase text-[#F5B700]">
                Cleveland Heights High School Tigers · Algebra 1
              </p>
              <h1
                className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#F8F7F4] leading-[1.03]"
                style={{ textWrap: 'balance' }}
              >
                Heights Algebra 1 OST &amp; Topic Review Arcade
              </h1>
              <p className="text-base sm:text-lg text-[#B3B1AA] max-w-2xl leading-relaxed">
                Practice Ohio State Test skills, linear equations, systems, quadratics, and exponential functions through interactive classroom games curated by Mr. Baker and Mr. Tokar.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <a
                  href="#arcade-catalog"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-[#F5B700] text-[#0A0A0C] text-sm font-bold rounded-lg hover:bg-[#FFD038] transition-colors whitespace-nowrap shrink-0"
                >
                  Browse Games
                  <ArrowRight className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={onGoToAbout}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-[#131317] border border-white/15 text-[#F8F7F4] text-sm font-semibold rounded-lg hover:border-[#F5B700]/60 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  About Mr. Baker &amp; Mr. Tokar
                </button>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative h-64 sm:h-80 lg:h-full min-h-[260px] rounded-xl overflow-hidden border border-[#F5B700]/25 bg-black flex items-center justify-center p-6 pb-12">
                <img
                  src={HERO_ARTWORK_PATH}
                  alt="Cleveland Heights High School Tigers cursive H logo"
                  referrerPolicy="no-referrer"
                  className="max-h-[220px] w-auto max-w-full object-contain"
                />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-[#F8F7F4]">
                  <span className="font-semibold text-[#F5B700]">
                    Tigers Math Department
                  </span>
                  <span className="text-[#B3B1AA]">OST Prep Ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Games Catalog */}
      <section
        id="arcade-catalog"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8"
      >
        {/* Filter & Search Toolbar */}
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#8A8880] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search games or Algebra 1 topics..."
                aria-label="Search games or Algebra 1 topics"
                className="w-full pl-10 pr-4 py-2.5 bg-[#131317] border border-white/10 rounded-lg text-sm text-[#F8F7F4] placeholder:text-[#8A8880] focus:outline-none focus:border-[#F5B700]"
              />
            </div>

            {/* Review Type Segmented Control */}
            <div
              role="group"
              aria-label="Filter by review type"
              className="inline-flex items-center gap-1 p-1 bg-[#131317] border border-white/10 rounded-lg self-start"
            >
              {(['All', ...REVIEW_TYPES] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedReviewType(type)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    selectedReviewType === type
                      ? 'bg-[#F5B700] text-[#0A0A0C]'
                      : 'text-[#B3B1AA] hover:text-[#F8F7F4]'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Topic Filter Bar */}
          <div
            role="group"
            aria-label="Filter by Algebra 1 topic"
            className="flex flex-wrap items-center gap-2"
          >
            {(['All', ...TOPIC_CATEGORIES] as const).map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => setSelectedTopic(topic)}
                className={`px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 max-w-full truncate cursor-pointer ${
                  selectedTopic === topic
                    ? 'bg-[#F5B700]/15 border-[#F5B700] text-[#F5B700]'
                    : 'bg-[#131317] border-white/10 text-[#B3B1AA] hover:text-[#F8F7F4] hover:border-white/25'
                }`}
              >
                {topic === 'All' ? 'All Topics' : topic}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((slot) => (
              <div
                key={slot}
                className="bg-[#131317] border border-white/10 rounded-xl overflow-hidden animate-pulse"
              >
                <div className="aspect-[4/3] bg-[#1A1A20]" />
                <div className="p-6 space-y-3">
                  <div className="h-3 w-32 bg-[#1A1A20] rounded" />
                  <div className="h-6 w-3/4 bg-[#1A1A20] rounded" />
                  <div className="h-4 w-full bg-[#1A1A20] rounded" />
                  <div className="h-10 w-36 bg-[#1A1A20] rounded-lg mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : games.length === 0 ? (
          <div className="bg-[#131317] border border-white/10 rounded-xl p-12 text-center space-y-4">
            <h2 className="font-display text-2xl font-bold text-[#F8F7F4]">
              No Games Added Yet
            </h2>
            <p className="text-sm text-[#B3B1AA] max-w-md mx-auto">
              Mr. Baker and Mr. Tokar are adding Algebra 1 and OST review games. Teachers can sign in through the Teacher Portal to publish games and thumbnails.
            </p>
            <button
              type="button"
              onClick={onOpenTeacherPortal}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#F5B700] text-[#0A0A0C] text-xs font-bold rounded-lg hover:bg-[#FFD038] transition-colors cursor-pointer"
            >
              Open Teacher Portal
            </button>
          </div>
        ) : visibleGames.length === 0 ? (
          <div className="bg-[#131317] border border-white/10 rounded-xl p-12 text-center space-y-4">
            <h2 className="font-display text-2xl font-bold text-[#F8F7F4]">
              No Matching Games Found
            </h2>
            <p className="text-sm text-[#B3B1AA] max-w-md mx-auto">
              No Algebra 1 review games matched your current search or topic filters.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#F5B700] text-[#0A0A0C] text-xs font-bold rounded-lg hover:bg-[#FFD038] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleGames.map((game) => {
              const isWarmup = game.gameUrl.startsWith('#warmup:');
              return (
                <article
                  key={game.id}
                  className="bg-[#131317] border border-white/10 hover:border-[#F5B700]/45 rounded-xl overflow-hidden flex flex-col transition-colors"
                >
                  <div className="aspect-[4/3] bg-[#0A0A0C] overflow-hidden border-b border-white/10">
                    <ThumbnailImage
                      src={game.thumbnailData}
                      alt={`${game.title} thumbnail`}
                      title={game.title}
                      className="transition-transform duration-300 hover:scale-[1.02]"
                    />
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between gap-5">
                    <div className="space-y-2.5">
                      {/* Unboxed clean metadata line (Zero-Pill Discipline) */}
                      <div className="flex items-center flex-wrap gap-2 text-xs font-medium text-[#F5B700]">
                        <span>{game.reviewType}</span>
                        <span aria-hidden="true" className="text-[#8A8880]">
                          ·
                        </span>
                        <span className="text-[#B3B1AA]">{game.topic}</span>
                        {!game.published && (
                          <>
                            <span aria-hidden="true" className="text-[#8A8880]">
                              ·
                            </span>
                            <span className="text-amber-300">Draft</span>
                          </>
                        )}
                      </div>

                      <h2 className="font-display text-2xl font-bold text-[#F8F7F4] leading-snug">
                        {game.title}
                      </h2>

                      <p className="text-sm text-[#B3B1AA] leading-relaxed">
                        {game.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-3">
                      {isWarmup ? (
                        <button
                          type="button"
                          onClick={() => onOpenWarmup(game.gameUrl)}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#F5B700] text-[#0A0A0C] text-xs font-bold rounded-lg hover:bg-[#FFD038] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          Play Game
                        </button>
                      ) : (
                        <a
                          href={game.gameUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#F5B700] text-[#0A0A0C] text-xs font-bold rounded-lg hover:bg-[#FFD038] transition-colors whitespace-nowrap shrink-0"
                        >
                          Play Game
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#8A8880] truncate max-w-[120px]">
                          {game.createdByName}
                        </span>
                        {isAuthorizedTeacher && (
                          <button
                            type="button"
                            onClick={() => onEditGame(game)}
                            aria-label={`Edit ${game.title}`}
                            className="inline-flex items-center gap-1 px-2.5 py-2 bg-[#1A1A20] border border-white/10 text-[#F8F7F4] text-xs font-medium rounded-lg hover:border-[#F5B700]/60 transition-colors cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            Edit
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
