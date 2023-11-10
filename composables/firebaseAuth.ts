import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  Auth,
  User as FirebaseAuthUser,
  signOut,
} from "firebase/auth";
import type { User } from "firebase/auth";
import { useNuxtApp } from "#app";
import { ref, reactive, onMounted } from "vue";

export default function () {
  const { $auth } = useNuxtApp();

  const user = ref<User | null>(null);
  const error = ref<string | null>(null);

  // Function to set the user after login or registration
  const setUser = (firebaseUser: FirebaseAuthUser | null) => {
    user.value = firebaseUser ? (firebaseUser as User) : null;
  };

  // Check if the user is already logged in on mount
  onMounted(() => {
    setUser($auth.currentUser);
  });

  const registerUser = async (
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      const userCreds = await createUserWithEmailAndPassword(
        $auth,
        email,
        password
      );
      setUser(userCreds.user);
      return true;
    } catch (error: unknown) {
      if (error instanceof Error) {
        handleError(error);
      }
      return false;
    }
  };

  const loginUser = async (
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      const userCreds = await signInWithEmailAndPassword(
        $auth,
        email,
        password
      );
      setUser(userCreds.user);
      return true;
    } catch (error: unknown) {
      if (error instanceof Error) {
        handleError(error);
      }
      return false;
    }
  };

  const logoutUser = async (): Promise<void> => {
    try {
      await signOut($auth);
      setUser(null);
    } catch (error: unknown) {
      if (error instanceof Error) {
        handleError(error);
      }
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      await sendPasswordResetEmail($auth, email);
      return true;
    } catch (error: unknown) {
      if (error instanceof Error) {
        handleError(error);
      }
      return false;
    }
  };

  const handleError = (err: Error): void => {
    error.value = err.message;
  };

  return {
    user,
    error,
    registerUser,
    loginUser,
    logoutUser,
    resetPassword,
  };
}
