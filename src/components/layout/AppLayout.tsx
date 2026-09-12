import { Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      <Outlet />
    </div>
  );
}