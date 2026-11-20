import React, { useRef, useState } from 'react';
import { ImagePlus, Loader2, Upload, X } from 'lucide-react';
import {
  ALL_TOPICS_VALUE,
  ArcadeGame,
  BUNDLED_THUMBNAILS,
  CORE_ALGEBRA_TOPICS,
  GAME_LIMITS,
  GAME_URL_PATTERN,
  GamePrimaryTopic,
  REVIEW_TYPES,
  ReviewType,
  THUMBNAIL_PATTERN,
  TOPIC_CATEGORIES,
  TopicCategory,
} from '../types/arcade';
import { processUploadedThumbnail } from '../utils/imageUpload';
import { ThumbnailImage } from './ThumbnailImage';

export interface GameFormValues {
  title: string;
  description: string;
  topic: GamePrimaryTopic;
  topics: TopicCategory[];
  reviewType: ReviewType;
  gameUrl: string;
  thumbnailData: string;
  published: boolean;
  featured: boolean;
  sortOrder: number;
  createdByName: string;
}

interface GameEditorModalProps {
  initialGame: ArcadeGame | null;
  defaultTeacherName: string;
  onClose: () => void;
  onSave: (values: GameFormValues, existingId?: string) => Promise<void>;
}

function getInitialSelectedTopics(
  initialGame: ArcadeGame | null
): TopicCategory[] {
  if (initialGame?.topics && initialGame.topics.length > 0) {
    const valid = initialGame.topics.filter((t) =>
      (TOPIC_CATEGORIES as readonly string[]).includes(t)
    );
    if (valid.length > 0) return valid;
  }
  if (initialGame?.topic === ALL_TOPICS_VALUE) {
    return [...TOPIC_CATEGORIES];
  }
  if (
    initialGame?.topic &&
    (TOPIC_CATEGORIES as readonly string[]).includes(initialGame.topic)
  ) {
    return [initialGame.topic as TopicCategory];
  }
  return [TOPIC_CATEGORIES[0]];
}

export function GameEditorModal({
  initialGame,
  defaultTeacherName,
  onClose,
  onSave,
}: GameEditorModalProps) {
  const [title, setTitle] = useState(initialGame?.title ?? '');
  const [description, setDescription] = useState(
    initialGame?.description ?? ''
  );
  const [selectedTopics, setSelectedTopics] = useState<TopicCategory[]>(() =>
    getInitialSelectedTopics(initialGame)
  );
  const [reviewType, setReviewType] = useState<ReviewType>(
    initialGame?.reviewType ?? 'OST Review'
  );
  const [gameUrl, setGameUrl] = useState(initialGame?.gameUrl ?? 'https://');
  const [thumbnailData, setThumbnailData] = useState(
    initialGame?.thumbnailData ?? ''
  );
  const [published, setPublished] = useState(initialGame?.published ?? true);
  const [featured, setFeatured] = useState(initialGame?.featured ?? false);
  const [sortOrder, setSortOrder] = useState(
    initialGame?.sortOrder !== undefined ? String(initialGame.sortOrder) : '10'
  );
  const [createdByName, setCreatedByName] = useState(
    initialGame?.createdByName ?? defaultTeacherName
  );

  const [uploadMeta, setUploadMeta] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelected = async (file: File | undefined) => {
    if (!file) return;
    setErrorMessage(null);
    setUploadingImage(true);
    try {
      const processed = await processUploadedThumbnail(file);
      setThumbnailData(processed.dataUrl);
      setUploadMeta(
        `${file.name} (${processed.width}x${processed.height}, ${processed.sizeKb} KB)`
      );
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to process image upload.'
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    void handleFileSelected(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedTitle = title.trim();
    const trimmedDesc = description.trim();
    const trimmedUrl = gameUrl.trim();
    const trimmedTeacher = createdByName.trim();
    const parsedOrder = Math.max(
      0,
      Math.min(1000, Math.round(Number(sortOrder) || 0))
    );

    if (
      trimmedTitle.length < GAME_LIMITS.MIN_TITLE ||
      trimmedTitle.length > GAME_LIMITS.MAX_TITLE
    ) {
      setErrorMessage(
        `Game title must be between ${GAME_LIMITS.MIN_TITLE} and ${GAME_LIMITS.MAX_TITLE} characters.`
      );
      return;
    }

    if (
      trimmedDesc.length < GAME_LIMITS.MIN_DESC ||
      trimmedDesc.length > GAME_LIMITS.MAX_DESC
    ) {
      setErrorMessage(
        `Description must be between ${GAME_LIMITS.MIN_DESC} and ${GAME_LIMITS.MAX_DESC} characters.`
      );
      return;
    }

    if (
      trimmedUrl.length < GAME_LIMITS.MIN_URL ||
      trimmedUrl.length > GAME_LIMITS.MAX_URL ||
      !GAME_URL_PATTERN.test(trimmedUrl)
    ) {
      setErrorMessage(
        'Please provide a valid game link starting with https:// or http://'
      );
      return;
    }

    if (
      !thumbnailData ||
      thumbnailData.length > GAME_LIMITS.MAX_THUMB_CHARS ||
      !THUMBNAIL_PATTERN.test(thumbnailData)
    ) {
      setErrorMessage(
        'Please upload a thumbnail image from your computer (or choose a built-in Tiger artwork card).'
      );
      return;
    }

    if (
      trimmedTeacher.length < GAME_LIMITS.MIN_TEACHER_NAME ||
      trimmedTeacher.length > GAME_LIMITS.MAX_TEACHER_NAME
    ) {
      setErrorMessage(
        `Teacher name must be between ${GAME_LIMITS.MIN_TEACHER_NAME} and ${GAME_LIMITS.MAX_TEACHER_NAME} characters.`
      );
      return;
    }

    if (selectedTopics.length === 0) {
      setErrorMessage(
        'Please select at least one Algebra 1 topic (or click Select All Topics).'
      );
      return;
    }

    const coversAllCoreTopics = CORE_ALGEBRA_TOPICS.every((t) =>
      selectedTopics.includes(t)
    );
    const primaryTopic: GamePrimaryTopic = coversAllCoreTopics
      ? ALL_TOPICS_VALUE
      : selectedTopics[0];

    setSubmitting(true);
    try {
      await onSave(
        {
          title: trimmedTitle,
          description: trimmedDesc,
          topic: primaryTopic,
          topics: selectedTopics,
          reviewType,
          gameUrl: trimmedUrl,
          thumbnailData,
          published,
          featured,
          sortOrder: parsedOrder,
          createdByName: trimmedTeacher,
        },
        initialGame?.id
      );
      onClose();
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Could not save the game. Check your teacher permissions.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="game-editor-title"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="max-w-2xl w-full max-h-[calc(100vh-2rem)] bg-[#131317] border border-[#F5B700]/30 rounded-xl overflow-hidden shadow-2xl flex flex-col">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between gap-4 shrink-0">
          <div>
            <p className="text-xs font-semibold text-[#F5B700]">
              Teacher Arcade Editor
            </p>
            <h2
              id="game-editor-title"
              className="font-display text-2xl font-bold text-[#F8F7F4]"
            >
              {initialGame ? 'Edit Arcade Game' : 'Add New Arcade Game'}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close editor"
            onClick={onClose}
            className="w-10 h-10 rounded-lg border border-white/10 flex items-center justify-center text-[#B3B1AA] hover:text-[#F8F7F4] hover:border-white/30 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {errorMessage && (
            <div className="p-3.5 bg-rose-500/15 border border-rose-400/50 rounded-lg text-sm text-rose-200">
              {errorMessage}
            </div>
          )}

          {/* Uploaded Thumbnail Section (No external URLs allowed) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <label className="block text-xs font-semibold text-[#F8F7F4]">
                Uploaded Thumbnail Image (Required)
              </label>
              <span className="text-xs text-[#8A8880]">
                Device upload only — no internet links
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-stretch">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                className={`sm:col-span-7 border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center text-center gap-2 transition-colors cursor-pointer ${
                  dragActive
                    ? 'border-[#F5B700] bg-[#F5B700]/10'
                    : 'border-white/15 bg-[#0A0A0C] hover:border-[#F5B700]/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    void handleFileSelected(file);
                    e.target.value = '';
                  }}
                />
                {uploadingImage ? (
                  <Loader2 className="w-6 h-6 text-[#F5B700] animate-spin" />
                ) : (
                  <Upload className="w-6 h-6 text-[#F5B700]" />
                )}
                <p className="text-sm font-medium text-[#F8F7F4]">
                  {uploadingImage
                    ? 'Optimizing image...'
                    : 'Click or drag & drop an image file'}
                </p>
                <p className="text-xs text-[#8A8880]">
                  PNG, JPG, WebP, or GIF. Automatically resized &amp; saved inside the arcade.
                </p>
                {uploadMeta && (
                  <p className="text-xs font-mono text-[#F5B700] mt-1">
                    {uploadMeta}
                  </p>
                )}
              </div>

              <div className="sm:col-span-5 aspect-[4/3] rounded-xl overflow-hidden border border-white/10 bg-[#0A0A0C]">
                {thumbnailData ? (
                  <ThumbnailImage
                    src={thumbnailData}
                    alt="Uploaded game thumbnail preview"
                    title={title || 'Thumbnail Preview'}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[#8A8880] p-4 text-center">
                    <ImagePlus className="w-6 h-6 text-[#F5B700]/60" />
                    <span className="text-xs">No thumbnail uploaded yet</span>
                  </div>
                )}
              </div>
            </div>

            {/* Optional Local Bundled Artwork Presets */}
            <div className="pt-1">
              <p className="text-xs text-[#8A8880] mb-2">
                Or select a built-in local Heights Tigers illustration:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {BUNDLED_THUMBNAILS.map((preset) => (
                  <button
                    key={preset.path}
                    type="button"
                    onClick={() => {
                      setThumbnailData(preset.path);
                      setUploadMeta(`Built-in: ${preset.label}`);
                    }}
                    className={`px-2.5 py-2 rounded-lg border text-left text-xs transition-colors cursor-pointer ${
                      thumbnailData === preset.path
                        ? 'border-[#F5B700] bg-[#F5B700]/15 text-[#F5B700]'
                        : 'border-white/10 bg-[#0A0A0C] text-[#B3B1AA] hover:border-white/25'
                    }`}
                  >
                    <span className="block truncate font-medium">
                      {preset.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="game-title-input"
                  className="text-xs font-semibold text-[#F8F7F4]"
                >
                  Game Title
                </label>
                <span className="text-xs font-mono text-[#8A8880] tabular-nums">
                  {title.length}/{GAME_LIMITS.MAX_TITLE}
                </span>
              </div>
              <input
                id="game-title-input"
                type="text"
                required
                maxLength={GAME_LIMITS.MAX_TITLE}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Slope Intercept Showdown"
                className="w-full px-3.5 py-2.5 bg-[#0A0A0C] border border-white/10 rounded-lg text-sm text-[#F8F7F4] focus:outline-none focus:border-[#F5B700]"
              />
            </div>

            <div className="sm:col-span-2 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="block text-xs font-semibold text-[#F8F7F4]">
                    Algebra 1 Topics Covered
                  </span>
                  <span className="text-xs text-[#8A8880]">
                    {CORE_ALGEBRA_TOPICS.every((t) =>
                      selectedTopics.includes(t)
                    )
                      ? 'All Topics selected (appears under every topic filter)'
                      : `${selectedTopics.length} topic${selectedTopics.length === 1 ? '' : 's'} selected`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const allSelected = TOPIC_CATEGORIES.every((t) =>
                        selectedTopics.includes(t)
                      );
                      setSelectedTopics(
                        allSelected ? [] : [...TOPIC_CATEGORIES]
                      );
                    }}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                      TOPIC_CATEGORIES.every((t) => selectedTopics.includes(t))
                        ? 'border-[#F5B700] bg-[#F5B700] text-[#0A0A0C]'
                        : 'border-[#F5B700]/40 bg-[#F5B700]/10 text-[#F5B700] hover:bg-[#F5B700]/20'
                    }`}
                  >
                    {TOPIC_CATEGORIES.every((t) => selectedTopics.includes(t))
                      ? 'All Topics Selected'
                      : 'Select All Topics'}
                  </button>
                  {selectedTopics.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedTopics([])}
                      className="px-2.5 py-1.5 rounded-lg border border-white/10 bg-[#0A0A0C] text-xs text-[#B3B1AA] hover:text-[#F8F7F4] hover:border-white/25 transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-[#0A0A0C] border border-white/10 rounded-lg">
                {TOPIC_CATEGORIES.map((cat) => {
                  const checked = selectedTopics.includes(cat);
                  return (
                    <label
                      key={cat}
                      className={`flex items-start gap-2.5 px-3 py-2 rounded-lg border text-xs transition-colors cursor-pointer ${
                        checked
                          ? 'border-[#F5B700]/60 bg-[#F5B700]/10 text-[#F8F7F4]'
                          : 'border-white/5 bg-[#131317] text-[#B3B1AA] hover:border-white/20'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          setSelectedTopics((prev) =>
                            prev.includes(cat)
                              ? prev.filter((item) => item !== cat)
                              : [...prev, cat]
                          );
                        }}
                        className="mt-0.5 w-3.5 h-3.5 accent-[#F5B700] rounded shrink-0"
                      />
                      <span className="leading-snug">{cat}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label
                htmlFor="game-review-type-select"
                className="block text-xs font-semibold text-[#F8F7F4]"
              >
                Review Type
              </label>
              <select
                id="game-review-type-select"
                value={reviewType}
                onChange={(e) => setReviewType(e.target.value as ReviewType)}
                className="w-full px-3.5 py-2.5 bg-[#0A0A0C] border border-white/10 rounded-lg text-sm text-[#F8F7F4] focus:outline-none focus:border-[#F5B700]"
              >
                {REVIEW_TYPES.map((rt) => (
                  <option key={rt} value={rt}>
                    {rt}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="game-desc-input"
                  className="text-xs font-semibold text-[#F8F7F4]"
                >
                  Short Description
                </label>
                <span className="text-xs font-mono text-[#8A8880] tabular-nums">
                  {description.length}/{GAME_LIMITS.MAX_DESC}
                </span>
              </div>
              <textarea
                id="game-desc-input"
                required
                rows={3}
                maxLength={GAME_LIMITS.MAX_DESC}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe what students review in this game..."
                className="w-full px-3.5 py-2.5 bg-[#0A0A0C] border border-white/10 rounded-lg text-sm text-[#F8F7F4] focus:outline-none focus:border-[#F5B700]"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label
                htmlFor="game-url-input"
                className="block text-xs font-semibold text-[#F8F7F4]"
              >
                Game Link URL (Teacher-Provided Destination)
              </label>
              <input
                id="game-url-input"
                type="text"
                required
                maxLength={GAME_LIMITS.MAX_URL}
                value={gameUrl}
                onChange={(e) => setGameUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2.5 bg-[#0A0A0C] border border-white/10 rounded-lg text-sm font-mono text-[#F8F7F4] focus:outline-none focus:border-[#F5B700]"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="game-teacher-name"
                className="block text-xs font-semibold text-[#F8F7F4]"
              >
                Added By (Display Name)
              </label>
              <input
                id="game-teacher-name"
                type="text"
                required
                maxLength={GAME_LIMITS.MAX_TEACHER_NAME}
                value={createdByName}
                onChange={(e) => setCreatedByName(e.target.value)}
                placeholder="Mr. Baker or Mr. Tokar"
                className="w-full px-3.5 py-2.5 bg-[#0A0A0C] border border-white/10 rounded-lg text-sm text-[#F8F7F4] focus:outline-none focus:border-[#F5B700]"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="game-sort-order"
                className="block text-xs font-semibold text-[#F8F7F4]"
              >
                Display Order (Lower = First)
              </label>
              <input
                id="game-sort-order"
                type="number"
                min={0}
                max={1000}
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#0A0A0C] border border-white/10 rounded-lg text-sm font-mono tabular-nums text-[#F8F7F4] focus:outline-none focus:border-[#F5B700]"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-1">
            <label className="inline-flex items-center gap-2.5 text-sm text-[#F8F7F4] cursor-pointer">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="w-4 h-4 accent-[#F5B700] rounded"
              />
              Published to Student Arcade
            </label>
            <label className="inline-flex items-center gap-2.5 text-sm text-[#F8F7F4] cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 accent-[#F5B700] rounded"
              />
              Pin to Top (Featured)
            </label>
          </div>

          </div>

          <div className="px-6 py-4 border-t border-white/10 bg-[#131317] flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-[#1A1A20] border border-white/10 text-[#F8F7F4] text-xs font-semibold rounded-lg hover:border-white/30 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || uploadingImage}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F5B700] text-[#0A0A0C] text-xs font-bold rounded-lg hover:bg-[#FFD038] transition-colors disabled:opacity-50 cursor-pointer"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {initialGame ? 'Save Changes' : 'Publish to Arcade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
