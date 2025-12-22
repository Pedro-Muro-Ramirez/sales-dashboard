import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const RootRedirect = () => {
  // Get the current auth session from context
  const { session } = useAuth();

  // Show a loading state while auth status is being determined
  if (session === undefined) {
    return <div>Loading...</div>;
  }

  // Redirect logged-in users to the dashboard, others to sign in
  return session ? <Navigate to="/dashboard" /> : <Navigate to="/signin" />;
};

export default RootRedirect;
