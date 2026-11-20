export const CORE_ALGEBRA_TOPICS = [
  'Data Analysis (Box Whisker, Line of Best Fit, Data, etc...)',
  'All Things Polynomials',
  'Functions and Function Notations',
  'Factoring, Solving, Modeling, Analyzing Quadratics',
  'Create, Analyze, Model Exponential Functions',
  'Creating, Graphing, Modeling Linear (Part 1)',
  'Creating, Graphing, Modeling Linear (Part 2)',
  'Creating, Solving, Modeling Systems of Equations',
  'Expressions (Simplify, Equivalent, Evaluate)',
  'Equations and Inequalities',
] as const;

export const TOPIC_CATEGORIES = [
  ...CORE_ALGEBRA_TOPICS,
  'Other Topics',
] as const;

export type TopicCategory = (typeof TOPIC_CATEGORIES)[number];

export const ALL_TOPICS_VALUE = 'All Topics' as const;
export type GamePrimaryTopic = TopicCategory | typeof ALL_TOPICS_VALUE;

export const REVIEW_TYPES = ['OST Review', 'Topic Review'] as const;
export type ReviewType = (typeof REVIEW_TYPES)[number];

export interface ArcadeGame {
  id: string;
  title: string;
  description: string;
  topic: GamePrimaryTopic;
  topics?: TopicCategory[];
  reviewType: ReviewType;
  gameUrl: string;
  thumbnailData: string;
  published: boolean;
  featured: boolean;
  sortOrder: number;
  createdByUid: string;
  createdByName: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export function formatGameTopicsLabel(
  game: Pick<ArcadeGame, 'topic' | 'topics'>
): string {
  const list = game.topics && game.topics.length > 0 ? game.topics : null;
  if (
    game.topic === ALL_TOPICS_VALUE ||
    (list && CORE_ALGEBRA_TOPICS.every((t) => list.includes(t)))
  ) {
    return ALL_TOPICS_VALUE;
  }
  if (list && list.length > 1) {
    return `${list[0]} (+${list.length - 1} more)`;
  }
  if (list && list.length === 1) {
    return list[0];
  }
  return game.topic;
}

export function gameMatchesTopicFilter(
  game: Pick<ArcadeGame, 'topic' | 'topics'>,
  selectedTopic: string
): boolean {
  if (selectedTopic === 'All') return true;
  if (game.topic === ALL_TOPICS_VALUE) return true;
  if (game.topic === selectedTopic) return true;
  if (game.topics && game.topics.includes(selectedTopic as TopicCategory)) {
    return true;
  }
  return false;
}

export interface AuthorizedTeacher {
  id: string;
  email: string;
  displayName: string;
  addedByUid: string;
  createdAt?: unknown;
}

export const BOOTSTRAPPED_ADMIN_EMAIL = 'ky_baker@chuh.org';

export const HERO_ARTWORK_PATH = `${import.meta.env.BASE_URL}assets/aistudio/images_09262ecd.png`;

export const BUNDLED_THUMBNAILS = [
  {
    label: 'Linear & Slope Grid',
    path: '/src/assets/images/thumb_ost_linear_1795139440288.jpg',
  },
  {
    label: 'Systems Intersection',
    path: '/src/assets/images/thumb_systems_arena_1795139440399.jpg',
  },
  {
    label: 'Quadratic Parabola Arc',
    path: '/src/assets/images/thumb_quadratics_launch_1795139440522.jpg',
  },
  {
    label: 'Exponential Growth Curve',
    path: '/src/assets/images/thumb_exponentials_sprint_1795139440133.jpg',
  },
] as const;

// Validation limits synchronized verbatim with firebase-blueprint.json & firestore.rules
export const GAME_LIMITS = {
  MIN_TITLE: 2,
  MAX_TITLE: 80,
  MIN_DESC: 5,
  MAX_DESC: 260,
  MIN_URL: 5,
  MAX_URL: 500,
  MAX_THUMB_CHARS: 450000,
  MIN_TEACHER_NAME: 2,
  MAX_TEACHER_NAME: 80,
} as const;

export const GAME_URL_PATTERN = /^(https?:\/\/.+|#warmup:.+)$/;
export const THUMBNAIL_PATTERN =
  /^(data:image\/(png|jpeg|jpg|webp|gif);base64,[A-Za-z0-9+/=]+|\/src\/assets\/images\/[a-zA-Z0-9_.-]+\.(jpg|jpeg|png|webp))$/;
export const EMAIL_PATTERN =
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
