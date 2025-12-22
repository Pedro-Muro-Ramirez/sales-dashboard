import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  // Get the current auth session from context
  const { session } = useAuth();

  // Show a loading state while auth status is being determined
  if (session === undefined) {
    return <div>Loading...</div>;
  }

  // Render protected content if authenticated, otherwise redirect
  return session ? <>{children}</> : <Navigate to="/signin" />;
};

export default ProtectedRoute;
