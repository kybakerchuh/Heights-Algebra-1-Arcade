import { useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { AboutPage } from './components/AboutPage';
import { ErrorBoundary } from './components/ErrorBoundary';
import { GameEditorModal, GameFormValues } from './components/GameEditorModal';
import { GamesPage } from './components/GamesPage';
import { ActivePage, Header } from './components/Header';
import { OstWarmupModal } from './components/OstWarmupModal';
import { TeacherPortal } from './components/TeacherPortal';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
} from './firebase';
import {
  ArcadeGame,
  AuthorizedTeacher,
  BOOTSTRAPPED_ADMIN_EMAIL,
  TOPIC_CATEGORIES,
  TopicCategory,
} from './types/arcade';
import {
  PASSCODE_STORAGE_KEY,
  verifyTeacherPasscode,
} from './utils/passcode';

function ArcadeAppContent() {
  const [activePage, setActivePage] = useState<ActivePage>('games');
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isAuthorizedTeacher, setIsAuthorizedTeacher] = useState(false);
  const [passcodeUnlocked, setPasscodeUnlocked] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(PASSCODE_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [firestoreGames, setFirestoreGames] = useState<ArcadeGame[]>([]);
  const [gamesLoaded, setGamesLoaded] = useState(false);
  const [authorizedTeachers, setAuthorizedTeachers] = useState<
    AuthorizedTeacher[]
  >([]);

  const [editingGame, setEditingGame] = useState<ArcadeGame | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [activeWarmupKey, setActiveWarmupKey] = useState<string | null>(null);
  const [fatalError, setFatalError] = useState<Error | null>(null);

  if (fatalError) {
    throw fatalError;
  }

  // Listen for Firebase Auth state and verify teacher role
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      if (nextUser && nextUser.emailVerified && nextUser.email) {
        const normalizedEmail = nextUser.email.toLowerCase();
        if (normalizedEmail === BOOTSTRAPPED_ADMIN_EMAIL) {
          setIsAuthorizedTeacher(true);
        } else {
          try {
            const teacherRef = doc(db, 'authorizedTeachers', normalizedEmail);
            const teacherSnap = await getDoc(teacherRef);
            setIsAuthorizedTeacher(teacherSnap.exists());
          } catch {
            setIsAuthorizedTeacher(false);
          }
        }
      } else {
        setIsAuthorizedTeacher(false);
      }
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to games collection (filtered by published==true for non-admins)
  useEffect(() => {
    if (!authReady) return;

    const gamesQuery = isAuthorizedTeacher
      ? collection(db, 'games')
      : query(collection(db, 'games'), where('published', '==', true));

    const unsubscribe = onSnapshot(
      gamesQuery,
      (snapshot) => {
        const validTopicSet = new Set<string>(TOPIC_CATEGORIES);
        const loaded: ArcadeGame[] = snapshot.docs.map((d) => {
          const data = d.data();
          const parsedTopics = Array.isArray(data.topics)
            ? data.topics.filter(
                (t): t is TopicCategory =>
                  typeof t === 'string' && validTopicSet.has(t)
              )
            : undefined;
          return {
            id: d.id,
            title: String(data.title ?? ''),
            description: String(data.description ?? ''),
            topic: data.topic,
            topics:
              parsedTopics && parsedTopics.length > 0
                ? parsedTopics
                : undefined,
            reviewType: data.reviewType,
            gameUrl: String(data.gameUrl ?? ''),
            thumbnailData: String(data.thumbnailData ?? ''),
            published: Boolean(data.published),
            featured: Boolean(data.featured),
            sortOrder: Number(data.sortOrder ?? 0),
            createdByUid: String(data.createdByUid ?? ''),
            createdByName: String(data.createdByName ?? ''),
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          };
        });
        setFirestoreGames(loaded);
        setGamesLoaded(true);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, 'games');
        } catch (wrapped) {
          setFatalError(
            wrapped instanceof Error ? wrapped : new Error(String(wrapped))
          );
        }
      }
    );

    return () => unsubscribe();
  }, [authReady, isAuthorizedTeacher]);

  // Subscribe to authorizedTeachers list ONLY for verified teacher admins
  useEffect(() => {
    if (!authReady || !isAuthorizedTeacher) {
      setAuthorizedTeachers([]);
      return;
    }

    const unsubscribe = onSnapshot(
      collection(db, 'authorizedTeachers'),
      (snapshot) => {
        const list: AuthorizedTeacher[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            email: String(data.email ?? d.id),
            displayName: String(data.displayName ?? ''),
            addedByUid: String(data.addedByUid ?? ''),
            createdAt: data.createdAt,
          };
        });
        setAuthorizedTeachers(list);
      },
      (error) => {
        try {
          handleFirestoreError(
            error,
            OperationType.LIST,
            'authorizedTeachers'
          );
        } catch (wrapped) {
          setFatalError(
            wrapped instanceof Error ? wrapped : new Error(String(wrapped))
          );
        }
      }
    );

    return () => unsubscribe();
  }, [authReady, isAuthorizedTeacher]);

  const displayedGames: ArcadeGame[] = firestoreGames;

  const defaultTeacherName =
    user?.email?.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL
      ? 'Mr. Baker'
      : user?.displayName || 'Heights Teacher';

  const canEditArcade = passcodeUnlocked && isAuthorizedTeacher;

  const handleUnlockPasscode = async (code: string): Promise<boolean> => {
    const valid = await verifyTeacherPasscode(code);
    if (valid) {
      setPasscodeUnlocked(true);
      try {
        sessionStorage.setItem(PASSCODE_STORAGE_KEY, 'true');
      } catch {
        // Ignore sessionStorage restrictions
      }
    }
    return valid;
  };

  const handleLockPortal = () => {
    setPasscodeUnlocked(false);
    setEditorOpen(false);
    setEditingGame(null);
    try {
      sessionStorage.removeItem(PASSCODE_STORAGE_KEY);
    } catch {
      // Ignore sessionStorage restrictions
    }
  };

  const handleSignIn = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const handleSignOut = async () => {
    handleLockPortal();
    await signOut(auth);
  };

  const handleSaveGame = async (
    values: GameFormValues,
    existingId?: string
  ) => {
    if (!user) throw new Error('You must be signed in to save games.');

    if (existingId) {
      const gameRef = doc(db, 'games', existingId);
      try {
        await updateDoc(gameRef, {
          title: values.title,
          description: values.description,
          topic: values.topic,
          topics: values.topics,
          reviewType: values.reviewType,
          gameUrl: values.gameUrl,
          thumbnailData: values.thumbnailData,
          published: values.published,
          featured: values.featured,
          sortOrder: values.sortOrder,
          createdByName: values.createdByName,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `games/${existingId}`);
      }
    } else {
      const slugBase = values.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 40);
      const docId = `${slugBase || 'game'}-${Date.now().toString(36)}`;
      const gameRef = doc(db, 'games', docId);
      try {
        await setDoc(gameRef, {
          title: values.title,
          description: values.description,
          topic: values.topic,
          topics: values.topics,
          reviewType: values.reviewType,
          gameUrl: values.gameUrl,
          thumbnailData: values.thumbnailData,
          published: values.published,
          featured: values.featured,
          sortOrder: values.sortOrder,
          createdByUid: user.uid,
          createdByName: values.createdByName,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `games/${docId}`);
      }
    }
  };

  const handleTogglePublished = async (game: ArcadeGame) => {
    const gameRef = doc(db, 'games', game.id);
    try {
      await updateDoc(gameRef, {
        published: !game.published,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `games/${game.id}`);
    }
  };

  const handleDeleteGame = async (gameId: string) => {
    const gameRef = doc(db, 'games', gameId);
    try {
      await deleteDoc(gameRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `games/${gameId}`);
    }
  };

  const handleAddAuthorizedTeacher = async (
    email: string,
    displayName: string
  ) => {
    if (!user) return;
    const normalized = email.trim().toLowerCase();
    const ref = doc(db, 'authorizedTeachers', normalized);
    try {
      await setDoc(ref, {
        email: normalized,
        displayName: displayName.trim(),
        addedByUid: user.uid,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.CREATE,
        `authorizedTeachers/${normalized}`
      );
    }
  };

  const handleRemoveAuthorizedTeacher = async (email: string) => {
    const normalized = email.trim().toLowerCase();
    const ref = doc(db, 'authorizedTeachers', normalized);
    try {
      await deleteDoc(ref);
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.DELETE,
        `authorizedTeachers/${normalized}`
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0C] text-[#F8F7F4]">
      <Header
        activePage={activePage}
        onNavigate={(page) => {
          setActivePage(page);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      <main className="flex-1">
        {activePage === 'games' && (
          <GamesPage
            games={displayedGames}
            loading={!gamesLoaded}
            isAuthorizedTeacher={canEditArcade}
            onGoToAbout={() => {
              setActivePage('about');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenWarmup={(warmupKey) => setActiveWarmupKey(warmupKey)}
            onEditGame={(game) => {
              setEditingGame(game);
              setEditorOpen(true);
            }}
            onOpenTeacherPortal={() => {
              setActivePage('manage');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activePage === 'about' && (
          <AboutPage
            onExploreGames={() => {
              setActivePage('games');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activePage === 'manage' && (
          <TeacherPortal
            user={user}
            authReady={authReady}
            isAuthorizedTeacher={isAuthorizedTeacher}
            passcodeUnlocked={passcodeUnlocked}
            games={displayedGames}
            authorizedTeachers={authorizedTeachers}
            onUnlockPasscode={handleUnlockPasscode}
            onLockPortal={handleLockPortal}
            onSignIn={handleSignIn}
            onSignOut={handleSignOut}
            onOpenNewGame={() => {
              setEditingGame(null);
              setEditorOpen(true);
            }}
            onEditGame={(game) => {
              setEditingGame(game);
              setEditorOpen(true);
            }}
            onTogglePublished={handleTogglePublished}
            onDeleteGame={handleDeleteGame}
            onAddAuthorizedTeacher={handleAddAuthorizedTeacher}
            onRemoveAuthorizedTeacher={handleRemoveAuthorizedTeacher}
          />
        )}
      </main>

      <footer className="border-t border-white/10 bg-[#0A0A0C]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#8A8880]">
          <div className="space-y-1">
            <p className="font-semibold text-[#F8F7F4]">
              Heights Algebra 1 Arcade
            </p>
            <p>
              Developed by Mr. Baker and Mr. Tokar for Cleveland Heights High School Tigers
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <button
              type="button"
              onClick={() => {
                setActivePage('games');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-[#F5B700] transition-colors cursor-pointer"
            >
              Games
            </button>
            <button
              type="button"
              onClick={() => {
                setActivePage('about');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-[#F5B700] transition-colors cursor-pointer"
            >
              About Us
            </button>
            <button
              type="button"
              onClick={() => {
                setActivePage('manage');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-[#F5B700] transition-colors cursor-pointer"
            >
              Teacher Portal
            </button>
            <a
              href="https://www.chuh.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#F5B700] transition-colors"
            >
              CHUH.org
            </a>
          </div>
        </div>
      </footer>

      {editorOpen && (
        <GameEditorModal
          initialGame={editingGame}
          defaultTeacherName={defaultTeacherName}
          onClose={() => {
            setEditorOpen(false);
            setEditingGame(null);
          }}
          onSave={handleSaveGame}
        />
      )}

      <OstWarmupModal
        warmupKey={activeWarmupKey}
        onClose={() => setActiveWarmupKey(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ArcadeAppContent />
    </ErrorBoundary>
  );
}
