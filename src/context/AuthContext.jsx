import { createContext, useState, useContext, useEffect } from "react";
import supabase from "../supabase-client";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  // Stores the current auth session (undefined = still loading)
  const [session, setSession] = useState(undefined);

  // Stores user profile data for the app
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Fetch the current session when the app first loads
    async function getInitialSession() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          throw error;
        }
        setSession(data.session);
      } catch (error) {
        console.error("Error getting session:", error.message);
      }
    }
    getInitialSession();

    // Listen for sign-in and sign-out events
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  useEffect(() => {
    // Do not fetch users if there is no active session
    if (!session) return;

    async function fetchUsers() {
      try {
        const { data, error } = await supabase
          .from("user_profiles")
          .select("id, name, account_type");
        if (error) {
          throw error;
        }
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error.message);
      }
    }
    fetchUsers();
  }, [session]);

  // Signs in a user with email and password
  const signInUser = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password: password,
      });
      if (error) {
        console.error("Supabase sign-in error:", error.message);
        return { success: false, error: error.message };
      }
      return { success: true, data };
    } catch (error) {
      console.error("Unexpected error during sign-in:", error.message);
      return {
        success: false,
        error: "An unexpected error occurred. Please try again.",
      };
    }
  };

  // Signs out the currently authenticated user
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Supabase sign-out error:", error.message);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (error) {
      console.error("Unexpected error during sign-out:", error.message);
      return {
        success: false,
        error: "An unexpected error occurred during sign out.",
      };
    }
  };

  // Creates a new user account and stores profile metadata
  const signUpNewUser = async (email, password, name, accountType) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase(),
        password: password,
        options: {
          data: {
            name: name,
            account_type: accountType,
          },
        },
      });
      if (error) {
        console.error("Supabase sign-up error:", error.message);
        return { success: false, error: error.message };
      }
      return { success: true, data };
    } catch (error) {
      console.error("Unexpected error during sign-up:", error.message);
      return {
        success: false,
        error: "An unexpected error occurred. Please try again.",
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{ session, signInUser, signOut, signUpNewUser, users }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
