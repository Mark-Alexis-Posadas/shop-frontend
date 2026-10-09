import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuthStore } from "../store/authStore";

const ProtectedRoute = () => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading);

  const location = useLocation();

  if (isAuthLoading) {
    return <div className="p-8 text-center">Checking authentication...</div>;
  }

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
