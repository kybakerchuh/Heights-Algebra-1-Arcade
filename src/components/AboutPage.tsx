import { ArrowRight, ExternalLink } from 'lucide-react';
import { CORE_ALGEBRA_TOPICS, HERO_ARTWORK_PATH } from '../types/arcade';

interface AboutPageProps {
  onExploreGames: () => void;
}

export function AboutPage({ onExploreGames }: AboutPageProps) {
  return (
    <div className="space-y-16 pb-20">
      {/* Purpose Hero */}
      <section className="border-b border-white/10 bg-[#0A0A0C]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
              <p className="text-xs font-semibold tracking-wider uppercase text-[#F5B700]">
                About Heights Algebra 1 Arcade
              </p>
              <h1
                className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#F8F7F4] leading-[1.04]"
                style={{ textWrap: 'balance' }}
              >
                Built for Heights High Tigers to Master Algebra 1 Through Play
              </h1>
              <p className="text-base sm:text-lg text-[#B3B1AA] max-w-2xl leading-relaxed">
                The Heights Algebra 1 Arcade is our classroom hub for Ohio State Test (OST) preparation and year-round Algebra 1 skill review. Instead of relying only on paper packets, students at Cleveland Heights High School can jump straight into interactive games built specifically around the topics we learn in class.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <button
                  type="button"
                  onClick={onExploreGames}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-[#F5B700] text-[#0A0A0C] text-sm font-bold rounded-lg hover:bg-[#FFD038] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Launch the Arcade
                  <ArrowRight className="w-4 h-4" />
                </button>
                <a
                  href="https://www.chuh.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-[#131317] border border-white/15 text-[#F8F7F4] text-sm font-semibold rounded-lg hover:border-[#F5B700]/60 transition-colors whitespace-nowrap shrink-0"
                >
                  Visit CHUH.org
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative h-64 sm:h-80 lg:h-full min-h-[260px] rounded-xl overflow-hidden border border-[#F5B700]/25 bg-black flex items-center justify-center p-6 pb-14">
                <img
                  src={HERO_ARTWORK_PATH}
                  alt="Cleveland Heights High School Tigers cursive H logo"
                  referrerPolicy="no-referrer"
                  className="max-h-[220px] w-auto max-w-full object-contain"
                />
                <div className="absolute bottom-4 left-4 right-4 text-xs text-[#F8F7F4]">
                  <p className="font-semibold text-[#F5B700]">
                    Cleveland Heights-University Heights City School District
                  </p>
                  <p className="text-[#B3B1AA] mt-0.5">
                    Algebra 1 OST &amp; Curriculum Review Initiative
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Creators Section: Mr. Baker & Mr. Tokar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="max-w-2xl space-y-2">
          <p className="text-xs font-semibold tracking-wider uppercase text-[#F5B700]">
            Developed By Heights High Teachers
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#F8F7F4]">
            Created &amp; Maintained by Mr. Baker and Mr. Tokar
          </h2>
          <p className="text-sm sm:text-base text-[#B3B1AA] leading-relaxed">
            Both developed by Mr. Baker and Mr. Tokar to give every Heights High student a unique, fast-paced way to review Algebra 1 concepts before unit quizzes and the spring Ohio State Test.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#131317] border border-white/10 rounded-xl p-7 space-y-4">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <p className="text-xs font-medium text-[#F5B700]">
                  Co-Developer · Heights High Math
                </p>
                <h3 className="font-display text-3xl font-bold text-[#F8F7F4] mt-0.5">
                  Mr. Baker
                </h3>
              </div>
              <span className="font-mono text-xs text-[#8A8880]">
                Algebra 1
              </span>
            </div>
            <p className="text-sm text-[#B3B1AA] leading-relaxed">
              Designs interactive Algebra 1 review games and manages the Heights Arcade catalog so students always have fresh, targeted practice aligned to what happens in the classroom each week.
            </p>
          </div>

          <div className="bg-[#131317] border border-white/10 rounded-xl p-7 space-y-4">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <p className="text-xs font-medium text-[#F5B700]">
                  Co-Developer · Heights High Math
                </p>
                <h3 className="font-display text-3xl font-bold text-[#F8F7F4] mt-0.5">
                  Mr. Tokar
                </h3>
              </div>
              <span className="font-mono text-xs text-[#8A8880]">
                Algebra 1
              </span>
            </div>
            <p className="text-sm text-[#B3B1AA] leading-relaxed">
              Collaborates on game mechanics, OST benchmark alignment, and classroom review challenges that turn tricky algebra standards into engaging head-to-head and solo practice.
            </p>
          </div>
        </div>
      </section>

      {/* Curriculum Topics */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="max-w-2xl space-y-2">
          <p className="text-xs font-semibold tracking-wider uppercase text-[#F5B700]">
            What You Can Practice
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#F8F7F4]">
            OST Review &amp; Core Algebra 1 Topics
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CORE_ALGEBRA_TOPICS.map((title, idx) => (
            <div
              key={title}
              className="bg-[#131317] border border-white/10 hover:border-[#F5B700]/45 rounded-xl px-6 py-5 flex items-baseline gap-4 transition-colors"
            >
              <span className="font-mono text-sm font-semibold text-[#F5B700] tabular-nums shrink-0">
                {String(idx + 1).padStart(2, '0')}.
              </span>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-[#F8F7F4] leading-snug">
                {title}
              </h3>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
