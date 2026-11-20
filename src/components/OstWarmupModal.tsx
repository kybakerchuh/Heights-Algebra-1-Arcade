import { useMemo, useState } from 'react';
import { CheckCircle2, RotateCcw, X, XCircle } from 'lucide-react';

interface Question {
  prompt: string;
  expression: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const QUESTION_BANK: Record<string, { title: string; questions: Question[] }> = {
  linear: {
    title: 'Slope & Linear Intercept Showdown',
    questions: [
      {
        prompt: 'What is the slope of the line passing through (2, 5) and (6, 17)?',
        expression: 'm = (y2 - y1) / (x2 - x1)',
        options: ['m = 2', 'm = 3', 'm = 4', 'm = 1/3'],
        correctIndex: 1,
        explanation: '(17 - 5) / (6 - 2) = 12 / 4 = 3.',
      },
      {
        prompt: 'Rewrite 4x + 2y = 14 in slope-intercept form y = mx + b.',
        expression: '4x + 2y = 14',
        options: ['y = -2x + 7', 'y = 2x + 7', 'y = -4x + 14', 'y = -2x + 14'],
        correctIndex: 0,
        explanation: 'Subtract 4x to get 2y = -4x + 14, then divide by 2: y = -2x + 7.',
      },
      {
        prompt: 'A gym charges $25 to join plus $18 per month. Which equation models total cost C after m months?',
        expression: 'C(m) = ?',
        options: ['C = 25m + 18', 'C = 18m + 25', 'C = 43m', 'C = 18m - 25'],
        correctIndex: 1,
        explanation: 'The rate per month ($18) is the slope and the one-time fee ($25) is the y-intercept.',
      },
    ],
  },
  systems: {
    title: 'Systems Intersection Arena',
    questions: [
      {
        prompt: 'Find the x-coordinate where the two lines intersect.',
        expression: 'y = 2x + 1  and  y = -x + 10',
        options: ['x = 2', 'x = 3', 'x = 4', 'x = 5'],
        correctIndex: 1,
        explanation: 'Set 2x + 1 = -x + 10 -> 3x = 9 -> x = 3 (and y = 7).',
      },
      {
        prompt: 'Solve the system using elimination:',
        expression: 'x + y = 11  and  x - y = 5',
        options: ['(8, 3)', '(3, 8)', '(7, 4)', '(6, 5)'],
        correctIndex: 0,
        explanation: 'Adding both equations gives 2x = 16 -> x = 8, so y = 11 - 8 = 3.',
      },
      {
        prompt: 'How many solutions does the system y = 3x - 2 and y = 3x + 5 have?',
        expression: 'y = 3x - 2  |  y = 3x + 5',
        options: ['Exactly 1 solution', '2 solutions', 'Infinitely many', 'No solution'],
        correctIndex: 3,
        explanation: 'Same slope (3) and different y-intercepts (-2 vs 5) means parallel lines that never intersect.',
      },
    ],
  },
  quadratics: {
    title: 'Quadratic Parabola Launch',
    questions: [
      {
        prompt: 'What is the vertex of the parabola f(x) = (x - 4)^2 + 3?',
        expression: 'f(x) = (x - 4)^2 + 3',
        options: ['(-4, 3)', '(4, 3)', '(4, -3)', '(3, 4)'],
        correctIndex: 1,
        explanation: 'In vertex form a(x - h)^2 + k, the vertex is (h, k) = (4, 3).',
      },
      {
        prompt: 'Find the zeros (x-intercepts) of f(x) = x^2 - 5x + 6.',
        expression: 'x^2 - 5x + 6 = 0',
        options: ['x = -2, -3', 'x = 1, 6', 'x = 2, 3', 'x = -1, 6'],
        correctIndex: 2,
        explanation: 'Factor as (x - 2)(x - 3) = 0, giving x = 2 and x = 3.',
      },
      {
        prompt: 'Which direction does y = -2x^2 + 8x - 1 open, and does it have a max or min?',
        expression: 'a = -2',
        options: [
          'Opens up, minimum',
          'Opens down, maximum',
          'Opens up, maximum',
          'Opens down, minimum',
        ],
        correctIndex: 1,
        explanation: 'Since a = -2 < 0, the parabola opens downward and its vertex is a maximum.',
      },
    ],
  },
  exponentials: {
    title: 'Exponential Growth & Decay Sprint',
    questions: [
      {
        prompt: 'A bacteria culture starts at 120 cells and triples every hour. Which function models it?',
        expression: 'P(t) = a * b^t',
        options: [
          'P(t) = 3 * 120^t',
          'P(t) = 120 + 3t',
          'P(t) = 120 * 3^t',
          'P(t) = 120 * (1.03)^t',
        ],
        correctIndex: 2,
        explanation: 'Initial value a = 120 and growth factor b = 3 gives P(t) = 120 * 3^t.',
      },
      {
        prompt: 'What is the percent rate of decay in V(t) = 4500 * (0.85)^t?',
        expression: 'b = 0.85',
        options: ['85% decay', '15% decay', '15% growth', '0.85% decay'],
        correctIndex: 1,
        explanation: 'Because b = 1 - r = 0.85, r = 0.15, which is 15% decay per period.',
      },
      {
        prompt: 'Evaluate f(3) for f(x) = 5 * 2^x.',
        expression: 'f(3) = 5 * 2^3',
        options: ['30', '40', '25', '1000'],
        correctIndex: 1,
        explanation: '2^3 = 8, and 5 * 8 = 40.',
      },
    ],
  },
};

interface OstWarmupModalProps {
  warmupKey: string | null;
  onClose: () => void;
}

export function OstWarmupModal({ warmupKey, onClose }: OstWarmupModalProps) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const deck = useMemo(() => {
    if (!warmupKey) return null;
    const key = warmupKey.replace('#warmup:', '');
    return QUESTION_BANK[key] || QUESTION_BANK.linear;
  }, [warmupKey]);

  if (!warmupKey || !deck) return null;

  const currentQuestion = deck.questions[questionIndex];

  const handleSelect = (idx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);
    if (idx === currentQuestion.correctIndex) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (questionIndex + 1 < deck.questions.length) {
      setQuestionIndex((i) => i + 1);
      setSelectedOption(null);
    } else {
      setFinished(true);
    }
  };

  const handleRestart = () => {
    setQuestionIndex(0);
    setSelectedOption(null);
    setScore(0);
    setFinished(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="warmup-modal-title"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="max-w-xl w-full bg-[#131317] border border-[#F5B700]/30 rounded-xl overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-[#F5B700]">
              Heights OST Quick-Play Preview
            </p>
            <h2
              id="warmup-modal-title"
              className="font-display text-2xl font-bold text-[#F8F7F4]"
            >
              {deck.title}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close warmup modal"
            onClick={onClose}
            className="w-10 h-10 rounded-lg border border-white/10 flex items-center justify-center text-[#B3B1AA] hover:text-[#F8F7F4] hover:border-white/30 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {finished ? (
            <div className="py-4 space-y-5 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[#F5B700]/15 text-[#F5B700] mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="font-display text-3xl font-bold text-[#F8F7F4]">
                  Warmup Complete
                </h3>
                <p className="font-mono tabular-nums text-lg text-[#F5B700]">
                  Score: {score} / {deck.questions.length}
                </p>
                <p className="text-sm text-[#B3B1AA] max-w-md mx-auto">
                  This is a built-in Heights Algebra 1 OST starter warmup. Teachers can replace or add external game links anytime in the Teacher Portal.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleRestart}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1A1A20] border border-white/15 text-[#F8F7F4] text-sm font-semibold rounded-lg hover:border-[#F5B700]/50 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  Play Again
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 bg-[#F5B700] text-[#0A0A0C] text-sm font-bold rounded-lg hover:bg-[#FFD038] transition-colors cursor-pointer"
                >
                  Back to Arcade
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between text-xs text-[#8A8880] font-mono tabular-nums">
                <span>
                  Question {questionIndex + 1} of {deck.questions.length}
                </span>
                <span>Score: {score}</span>
              </div>

              <div className="space-y-3">
                <p className="text-base font-medium text-[#F8F7F4] leading-relaxed">
                  {currentQuestion.prompt}
                </p>
                <div className="px-4 py-3 bg-[#0A0A0C] border border-white/10 rounded-lg font-mono text-sm text-[#F5B700]">
                  {currentQuestion.expression}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentQuestion.options.map((opt, idx) => {
                  const isAnswered = selectedOption !== null;
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === currentQuestion.correctIndex;

                  let styleClass =
                    'bg-[#1A1A20] border-white/10 text-[#F8F7F4] hover:border-[#F5B700]/60';
                  if (isAnswered) {
                    if (isCorrect) {
                      styleClass =
                        'bg-emerald-500/15 border-emerald-400 text-emerald-200';
                    } else if (isSelected) {
                      styleClass =
                        'bg-rose-500/15 border-rose-400 text-rose-200';
                    } else {
                      styleClass =
                        'bg-[#1A1A20]/50 border-white/5 text-[#8A8880]';
                    }
                  }

                  return (
                    <button
                      key={opt}
                      type="button"
                      disabled={isAnswered}
                      onClick={() => handleSelect(idx)}
                      className={`px-4 py-3 text-left text-sm font-medium rounded-lg border transition-colors flex items-center justify-between gap-2 cursor-pointer disabled:cursor-default ${styleClass}`}
                    >
                      <span>{opt}</span>
                      {isAnswered && isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                      {isAnswered && isSelected && !isCorrect && (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {selectedOption !== null && (
                <div className="p-4 bg-[#0A0A0C] border border-white/10 rounded-lg space-y-3">
                  <p className="text-xs font-semibold text-[#F5B700]">
                    {selectedOption === currentQuestion.correctIndex
                      ? 'Correct Answer'
                      : 'Review Solution'}
                  </p>
                  <p className="text-sm text-[#B3B1AA]">
                    {currentQuestion.explanation}
                  </p>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-4 py-2 bg-[#F5B700] text-[#0A0A0C] text-xs font-bold rounded-lg hover:bg-[#FFD038] transition-colors cursor-pointer"
                    >
                      {questionIndex + 1 < deck.questions.length
                        ? 'Next Question'
                        : 'Finish Warmup'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
