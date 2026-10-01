import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "./config";
import { AdminUser } from "@/types";

export function subscribeToAuth(
  callback: (user: AdminUser | null) => void
): () => void {
  if (isFirebaseConfigured && auth) {
    try {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
        if (firebaseUser) {
          callback({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || "Admin User",
          });
        } else {
          callback(null);
        }
      });
      return unsubscribe;
    } catch (err) {
      console.error("Firebase auth listener error:", err);
    }
  }

  callback(null);
  return () => {};
}

export async function loginAdmin(email: string, password: string): Promise<AdminUser> {
  if (!isFirebaseConfigured || !auth) {
    throw new Error("Firebase Authentication is not configured in .env.local.");
  }

  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return {
      uid: cred.user.uid,
      email: cred.user.email,
      displayName: cred.user.displayName || "Authorized Admin",
    };
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err) {
      const code = String((err as { code: string }).code);
      if (
        code.includes("configuration-not-found") ||
        code.includes("operation-not-allowed")
      ) {
        throw new Error(
          "Firebase Email/Password Auth Provider Disabled: Please enable 'Email/Password' in Firebase Console -> Authentication -> Sign-in method."
        );
      }
      if (
        code.includes("user-not-found") ||
        code.includes("invalid-credential") ||
        code.includes("wrong-password")
      ) {
        throw new Error(
          "Invalid Email or Password. Ensure this admin user is created under Firebase Console -> Authentication -> Users."
        );
      }
    }
    const message = err instanceof Error ? err.message : "Authentication failed";
    throw new Error(message);
  }
}

export async function logoutAdmin(): Promise<void> {
  if (isFirebaseConfigured && auth) {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn("Sign out error:", err);
    }
  }
}
