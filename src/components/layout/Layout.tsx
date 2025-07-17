import { Outlet } from "react-router-dom";
import { Header } from "./Header";

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300">
      {/* Global background effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-100 via-white to-gray-100 dark:from-gray-900 dark:via-black dark:to-gray-900 transition-colors duration-300">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-200/20 via-transparent to-transparent dark:from-purple-900/20 dark:via-transparent dark:to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-200/20 via-transparent to-transparent dark:from-blue-900/20 dark:via-transparent dark:to-transparent" />
      </div>
      
      <div className="relative z-10">
        <Header />
        <main className="pt-24">
          <Outlet />
        </main>
      </div>
    </div>
  );
} 