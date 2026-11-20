import React, { useState } from 'react';
import { User } from 'firebase/auth';
import {
  Check,
  ExternalLink,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  LogIn,
  LogOut,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  UserPlus,
} from 'lucide-react';
import {
  ArcadeGame,
  AuthorizedTeacher,
  BOOTSTRAPPED_ADMIN_EMAIL,
  EMAIL_PATTERN,
} from '../types/arcade';
import { ThumbnailImage } from './ThumbnailImage';

interface TeacherPortalProps {
  user: User | null;
  authReady: boolean;
  isAuthorizedTeacher: boolean;
  passcodeUnlocked: boolean;
  games: ArcadeGame[];
  authorizedTeachers: AuthorizedTeacher[];
  onUnlockPasscode: (code: string) => Promise<boolean>;
  onLockPortal: () => void;
  onSignIn: () => Promise<void>;
  onSignOut: () => Promise<void>;
  onOpenNewGame: () => void;
  onEditGame: (game: ArcadeGame) => void;
  onTogglePublished: (game: ArcadeGame) => Promise<void>;
  onDeleteGame: (gameId: string) => Promise<void>;
  onAddAuthorizedTeacher: (
    email: string,
    displayName: string
  ) => Promise<void>;
  onRemoveAuthorizedTeacher: (email: string) => Promise<void>;
}

export function TeacherPortal({
  user,
  authReady,
  isAuthorizedTeacher,
  passcodeUnlocked,
  games,
  authorizedTeachers,
  onUnlockPasscode,
  onLockPortal,
  onSignIn,
  onSignOut,
  onOpenNewGame,
  onEditGame,
  onTogglePublished,
  onDeleteGame,
  onAddAuthorizedTeacher,
  onRemoveAuthorizedTeacher,
}: TeacherPortalProps) {
  const [passcodeInput, setPasscodeInput] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [passcodeChecking, setPasscodeChecking] = useState(false);
  const [passcodeError, setPasscodeError] = useState<string | null>(null);

  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [busyGameId, setBusyGameId] = useState<string | null>(null);

  const [newTeacherEmail, setNewTeacherEmail] = useState('');
  const [newTeacherName, setNewTeacherName] = useState('Mr. Tokar');
  const [teacherActionLoading, setTeacherActionLoading] = useState(false);
  const [teacherActionError, setTeacherActionError] = useState<string | null>(
    null
  );
  const [teacherActionSuccess, setTeacherActionSuccess] = useState<
    string | null
  >(null);

  const handleSignInClick = async () => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      await onSignIn();
    } catch (err) {
      setAuthError(
        err instanceof Error
          ? err.message
          : 'Google Sign-In did not complete. Please try again.'
      );
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setTeacherActionError(null);
    setTeacherActionSuccess(null);

    const normalizedEmail = newTeacherEmail.trim().toLowerCase();
    const trimmedName = newTeacherName.trim();

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setTeacherActionError('Please enter a valid Google email address.');
      return;
    }
    if (trimmedName.length < 2 || trimmedName.length > 80) {
      setTeacherActionError(
        'Teacher display name must be between 2 and 80 characters.'
      );
      return;
    }

    setTeacherActionLoading(true);
    try {
      await onAddAuthorizedTeacher(normalizedEmail, trimmedName);
      setNewTeacherEmail('');
      setTeacherActionSuccess(`Added ${trimmedName} (${normalizedEmail}).`);
    } catch (err) {
      setTeacherActionError(
        err instanceof Error ? err.message : 'Could not add teacher access.'
      );
    } finally {
      setTeacherActionLoading(false);
    }
  };

  const handlePasscodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasscodeError(null);
    setPasscodeChecking(true);
    try {
      const ok = await onUnlockPasscode(passcodeInput);
      if (ok) {
        setPasscodeInput('');
      } else {
        setPasscodeError('Incorrect passcode. Please try again.');
      }
    } finally {
      setPasscodeChecking(false);
    }
  };

  if (!passcodeUnlocked) {
    return (
      <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-[#131317] border border-[#F5B700]/25 rounded-xl p-8 sm:p-10 space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#F5B700]">
              <Lock className="w-3.5 h-3.5" />
              <span>Teacher Access Protection</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#F8F7F4]">
              Enter Teacher Passcode
            </h1>
            <p className="text-sm text-[#B3B1AA] leading-relaxed">
              Enter the Heights Algebra 1 teacher passcode to access teacher sign-in and game management.
            </p>
          </div>

          <form onSubmit={handlePasscodeSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="teacher-passcode-input"
                className="block text-xs font-semibold text-[#F8F7F4]"
              >
                Passcode
              </label>
              <div className="relative">
                <input
                  id="teacher-passcode-input"
                  type={showPasscode ? 'text' : 'password'}
                  inputMode="numeric"
                  autoComplete="off"
                  required
                  value={passcodeInput}
                  onChange={(e) => {
                    setPasscodeInput(e.target.value);
                    if (passcodeError) setPasscodeError(null);
                  }}
                  placeholder="Enter passcode"
                  className="w-full pl-3.5 pr-11 py-2.5 bg-[#0A0A0C] border border-white/10 rounded-lg text-sm font-mono tracking-widest text-[#F8F7F4] focus:outline-none focus:border-[#F5B700]"
                />
                <button
                  type="button"
                  aria-label={showPasscode ? 'Hide passcode' : 'Show passcode'}
                  onClick={() => setShowPasscode((prev) => !prev)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-[#8A8880] hover:text-[#F8F7F4] cursor-pointer"
                >
                  {showPasscode ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {passcodeError && (
              <p className="text-sm text-rose-300">{passcodeError}</p>
            )}

            <button
              type="submit"
              disabled={passcodeChecking}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#F5B700] text-[#0A0A0C] text-sm font-bold rounded-lg hover:bg-[#FFD038] transition-colors disabled:opacity-60 cursor-pointer"
            >
              {passcodeChecking ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              Unlock Teacher Portal
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!authReady) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <Loader2 className="w-7 h-7 text-[#F5B700] animate-spin mx-auto" />
        <p className="mt-3 text-sm text-[#B3B1AA]">
          Checking teacher session...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-[#131317] border border-[#F5B700]/25 rounded-xl p-8 sm:p-10 space-y-6">
          <div className="space-y-2">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#F5B700]">
              Teacher Arcade Management
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#F8F7F4]">
              Sign In to Manage Games
            </h1>
            <p className="text-sm sm:text-base text-[#B3B1AA] leading-relaxed">
              Mr. Baker and Mr. Tokar can sign in with their Google account to upload game thumbnails, update Algebra 1 links, and publish new OST review games directly to the student arcade.
            </p>
          </div>

          {authError && (
            <div className="p-3.5 bg-rose-500/15 border border-rose-400/40 rounded-lg text-sm text-rose-200">
              {authError}
            </div>
          )}

          <button
            type="button"
            disabled={authLoading}
            onClick={handleSignInClick}
            className="inline-flex items-center justify-center gap-2.5 px-5 py-3 bg-[#F5B700] text-[#0A0A0C] text-sm font-bold rounded-lg hover:bg-[#FFD038] transition-colors disabled:opacity-60 cursor-pointer"
          >
            {authLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            Sign In with Google
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthorizedTeacher) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-[#131317] border border-white/10 rounded-xl p-8 space-y-5">
          <p className="text-xs font-semibold tracking-wider uppercase text-[#F5B700]">
            Teacher Verification Required
          </p>
          <h1 className="font-display text-3xl font-bold text-[#F8F7F4]">
            Signed In as {user.email}
          </h1>
          <p className="text-sm text-[#B3B1AA] leading-relaxed">
            This account does not currently have teacher editor permissions for the Heights Algebra 1 Arcade. Only <span className="text-[#F8F7F4] font-medium">{BOOTSTRAPPED_ADMIN_EMAIL}</span> or co-teachers added in the Teacher Portal can add or edit games.
          </p>
          <button
            type="button"
            onClick={() => void onSignOut()}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1A1A20] border border-white/15 text-[#F8F7F4] text-sm font-semibold rounded-lg hover:border-[#F5B700]/50 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 pb-20">
      {/* Top Action Bar */}
      <div className="bg-[#131317] border border-[#F5B700]/25 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#F5B700]">
            <ShieldCheck className="w-4 h-4" />
            <span>Authorized Teacher · {user.email}</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#F8F7F4]">
            Heights Algebra 1 Teacher Studio
          </h1>
          <p className="text-sm text-[#B3B1AA]">
            Add new Algebra 1 or OST games with uploaded thumbnails and teacher-provided links. Changes go live immediately.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenNewGame}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#F5B700] text-[#0A0A0C] text-xs font-bold rounded-lg hover:bg-[#FFD038] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add New Game
          </button>
          <button
            type="button"
            onClick={onLockPortal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1A1A20] border border-white/15 text-[#F8F7F4] text-xs font-semibold rounded-lg hover:border-[#F5B700]/50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            Lock Portal
          </button>
          <button
            type="button"
            onClick={() => void onSignOut()}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1A1A20] border border-white/15 text-[#F8F7F4] text-xs font-semibold rounded-lg hover:border-white/30 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Manage Games List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-[#F8F7F4]">
            Saved Arcade Games ({games.length})
          </h2>
        </div>

        {games.length === 0 ? (
          <div className="bg-[#131317] border border-white/10 rounded-xl p-8 text-center space-y-4">
            <p className="text-sm text-[#B3B1AA]">
              No games saved in the arcade yet. Click &ldquo;Add New Game&rdquo; to publish your first Algebra 1 or OST review game.
            </p>
            <button
              type="button"
              onClick={onOpenNewGame}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#F5B700] text-[#0A0A0C] text-xs font-bold rounded-lg hover:bg-[#FFD038] transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add New Game
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {games.map((game) => (
              <div
                key={game.id}
                className="bg-[#131317] border border-white/10 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start sm:items-center gap-4 min-w-0">
                  <div className="w-24 aspect-[4/3] rounded-lg overflow-hidden border border-white/10 bg-[#0A0A0C] shrink-0">
                    <ThumbnailImage
                      src={game.thumbnailData}
                      alt={game.title}
                      title={game.title}
                    />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center flex-wrap gap-2 text-xs font-medium">
                      <span className="text-[#F5B700]">{game.reviewType}</span>
                      <span aria-hidden="true" className="text-[#8A8880]">
                        ·
                      </span>
                      <span className="text-[#B3B1AA]">{game.topic}</span>
                      <span aria-hidden="true" className="text-[#8A8880]">
                        ·
                      </span>
                      <span
                        className={
                          game.published ? 'text-emerald-400' : 'text-amber-300'
                        }
                      >
                        {game.published ? 'Published' : 'Hidden Draft'}
                      </span>
                      <span aria-hidden="true" className="text-[#8A8880]">
                        ·
                      </span>
                      <span className="font-mono text-[#8A8880] tabular-nums">
                        Order #{game.sortOrder}
                      </span>
                    </div>
                    <h3 className="font-display text-xl font-bold text-[#F8F7F4] truncate">
                      {game.title}
                    </h3>
                    <p className="text-xs text-[#8A8880] truncate max-w-xl">
                      {game.gameUrl}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {!game.gameUrl.startsWith('#warmup:') && (
                    <a
                      href={game.gameUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#1A1A20] border border-white/10 text-[#B3B1AA] hover:text-[#F8F7F4] text-xs font-medium rounded-lg transition-colors"
                    >
                      Test Link
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  <button
                    type="button"
                    disabled={busyGameId === game.id}
                    onClick={async () => {
                      setBusyGameId(game.id);
                      try {
                        await onTogglePublished(game);
                      } finally {
                        setBusyGameId(null);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#1A1A20] border border-white/10 text-[#F8F7F4] hover:border-[#F5B700]/50 text-xs font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {game.published ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        Hide
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        Publish
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => onEditGame(game)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#1A1A20] border border-white/10 text-[#F8F7F4] hover:border-[#F5B700]/50 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>

                  {confirmDeleteId === game.id ? (
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={busyGameId === game.id}
                        onClick={async () => {
                          setBusyGameId(game.id);
                          try {
                            await onDeleteGame(game.id);
                            setConfirmDeleteId(null);
                          } finally {
                            setBusyGameId(null);
                          }
                        }}
                        className="px-3 py-2 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-500 transition-colors cursor-pointer"
                      >
                        Confirm Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-2.5 py-2 bg-[#1A1A20] border border-white/10 text-xs text-[#B3B1AA] rounded-lg cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(game.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#1A1A20] border border-white/10 text-rose-300 hover:border-rose-400/50 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Co-Teacher Access Management */}
      <section className="bg-[#131317] border border-white/10 rounded-xl p-6 space-y-6">
        <div className="space-y-1">
          <h2 className="font-display text-2xl font-bold text-[#F8F7F4]">
            Co-Teacher Editor Access
          </h2>
          <p className="text-sm text-[#B3B1AA]">
            Add Mr. Tokar&apos;s Google email address (or another Heights math teacher) so they can sign in and add or update games too.
          </p>
        </div>

        <form
          onSubmit={handleAddTeacher}
          className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end"
        >
          <div className="sm:col-span-5 space-y-1.5">
            <label
              htmlFor="coteacher-email"
              className="block text-xs font-semibold text-[#F8F7F4]"
            >
              Teacher Google Email
            </label>
            <input
              id="coteacher-email"
              type="email"
              required
              value={newTeacherEmail}
              onChange={(e) => setNewTeacherEmail(e.target.value)}
              placeholder="colleague@chuh.org"
              className="w-full px-3.5 py-2.5 bg-[#0A0A0C] border border-white/10 rounded-lg text-sm text-[#F8F7F4] focus:outline-none focus:border-[#F5B700]"
            />
          </div>

          <div className="sm:col-span-4 space-y-1.5">
            <label
              htmlFor="coteacher-name"
              className="block text-xs font-semibold text-[#F8F7F4]"
            >
              Display Name
            </label>
            <input
              id="coteacher-name"
              type="text"
              required
              value={newTeacherName}
              onChange={(e) => setNewTeacherName(e.target.value)}
              placeholder="Mr. Tokar"
              className="w-full px-3.5 py-2.5 bg-[#0A0A0C] border border-white/10 rounded-lg text-sm text-[#F8F7F4] focus:outline-none focus:border-[#F5B700]"
            />
          </div>

          <div className="sm:col-span-3">
            <button
              type="submit"
              disabled={teacherActionLoading}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#F5B700] text-[#0A0A0C] text-xs font-bold rounded-lg hover:bg-[#FFD038] transition-colors cursor-pointer disabled:opacity-50"
            >
              {teacherActionLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              Grant Access
            </button>
          </div>
        </form>

        {teacherActionError && (
          <p className="text-sm text-rose-300">{teacherActionError}</p>
        )}
        {teacherActionSuccess && (
          <p className="inline-flex items-center gap-1.5 text-sm text-emerald-300">
            <Check className="w-4 h-4" />
            {teacherActionSuccess}
          </p>
        )}

        <div className="border-t border-white/10 pt-4 space-y-2">
          <p className="text-xs font-semibold text-[#8A8880]">
            Active Teacher Editors
          </p>
          <div className="divide-y divide-white/10">
            <div className="py-2.5 flex items-center justify-between gap-4 text-sm">
              <div>
                <span className="font-medium text-[#F8F7F4]">Mr. Baker</span>
                <span className="mx-2 text-[#8A8880]">·</span>
                <span className="font-mono text-xs text-[#B3B1AA]">
                  {BOOTSTRAPPED_ADMIN_EMAIL}
                </span>
              </div>
              <span className="text-xs text-[#F5B700]">Primary Admin</span>
            </div>

            {authorizedTeachers.map((teacher) => (
              <div
                key={teacher.id}
                className="py-2.5 flex items-center justify-between gap-4 text-sm"
              >
                <div>
                  <span className="font-medium text-[#F8F7F4]">
                    {teacher.displayName}
                  </span>
                  <span className="mx-2 text-[#8A8880]">·</span>
                  <span className="font-mono text-xs text-[#B3B1AA]">
                    {teacher.email}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => void onRemoveAuthorizedTeacher(teacher.email)}
                  className="text-xs text-rose-300 hover:text-rose-200 cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
