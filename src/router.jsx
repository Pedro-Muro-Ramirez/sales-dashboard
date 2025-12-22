import SignIn from "./components/Signin";
import Dashboard from "./routes/Dashboard";
import Header from "./components/Header";
import Signup from "./components/Signup";
import RootRedirect from "./routes/RootRedirect";
import ProtectedRoute from "./components/ProtectedRoute";
import { createBrowserRouter } from "react-router-dom";

export const router = createBrowserRouter([
  { path: "/", element: <RootRedirect /> },
  { path: "/signin", element: <SignIn /> },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Header />
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  { path: "/signup", element: <Signup /> },
]);
