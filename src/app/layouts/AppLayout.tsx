import { Outlet } from "@tanstack/react-router";
import Navbar from "../../shared/components/Navbar";

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-white text-neutral-950">
      <Navbar />

      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
