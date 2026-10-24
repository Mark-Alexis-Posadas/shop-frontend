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

  if (token && !user) {
    return (
      <div role="alert" className="mx-auto max-w-md p-8 text-center">
        <p>
          Unable to verify your session. Check your connection and try again.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 rounded-xl bg-indigo-600 px-5 py-3 text-white"
        >
          Retry session check
        </button>
      </div>
    );
  }
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
