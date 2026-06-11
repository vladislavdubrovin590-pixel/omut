"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  onIdTokenChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User as FirebaseUser,
} from "firebase/auth";
import {
  isFirebaseConfigured,
  requireAuth,
  requireGoogleProvider,
} from "@/lib/firebase/client";

export type Profile = {
  id: string;
  role: "CLIENT" | "WORKER" | "ADMIN";
  name: string | null;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
};

type AuthContextValue = {
  firebaseUser: FirebaseUser | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signInGoogle: () => Promise<void>;
  signInEmail: (email: string, password: string) => Promise<void>;
  registerEmail: (
    email: string,
    password: string,
    name: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function postSession(idToken: string) {
  await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/me", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.user ?? null);
      } else {
        setProfile(null);
      }
    } catch {
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(requireAuth(), async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        const idToken = await fbUser.getIdToken();
        await postSession(idToken);
        await refreshProfile();
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [refreshProfile]);

  // Keep the server session cookie fresh when the ID token rotates.
  useEffect(() => {
    if (!isFirebaseConfigured) return;
    const unsub = onIdTokenChanged(requireAuth(), async (fbUser) => {
      if (fbUser) {
        const idToken = await fbUser.getIdToken();
        await postSession(idToken);
      }
    });
    return () => unsub();
  }, []);

  const signInGoogle = useCallback(async () => {
    const cred = await signInWithPopup(requireAuth(), requireGoogleProvider());
    const idToken = await cred.user.getIdToken();
    await postSession(idToken);
    await refreshProfile();
  }, [refreshProfile]);

  const signInEmail = useCallback(
    async (email: string, password: string) => {
      const cred = await signInWithEmailAndPassword(
        requireAuth(),
        email,
        password,
      );
      const idToken = await cred.user.getIdToken();
      await postSession(idToken);
      await refreshProfile();
    },
    [refreshProfile],
  );

  const registerEmail = useCallback(
    async (email: string, password: string, name: string) => {
      const cred = await createUserWithEmailAndPassword(
        requireAuth(),
        email,
        password,
      );
      if (name) await updateProfile(cred.user, { displayName: name });
      const idToken = await cred.user.getIdToken(true);
      await postSession(idToken);
      await refreshProfile();
    },
    [refreshProfile],
  );

  const logout = useCallback(async () => {
    if (isFirebaseConfigured) await signOut(requireAuth());
    await fetch("/api/auth/session", { method: "DELETE" });
    setProfile(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      firebaseUser,
      profile,
      loading,
      refreshProfile,
      signInGoogle,
      signInEmail,
      registerEmail,
      logout,
    }),
    [
      firebaseUser,
      profile,
      loading,
      refreshProfile,
      signInGoogle,
      signInEmail,
      registerEmail,
      logout,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
