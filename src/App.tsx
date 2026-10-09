import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Suspense } from "react";
import { lazyWithRetry } from "@/lib/lazyWithRetry";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { BottomNav } from "@/components/BottomNav";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { ProgressProvider } from "@/hooks/useProgress";
import Welcome from "./pages/Welcome";
import NotFound from "./pages/NotFound";

// Lazy load pages for code-splitting. lazyWithRetry auto-reloads once if a
// chunk 404s after a new deploy (stale hash), instead of a hard crash.
const Dashboard = lazyWithRetry(() => import("./pages/Dashboard"));
const LearningPath = lazyWithRetry(() => import("./pages/LearningPath"));
const LessonPage = lazyWithRetry(() => import("./pages/LessonPage"));
const Journal = lazyWithRetry(() => import("./pages/Journal"));
const Profile = lazyWithRetry(() => import("./pages/Profile"));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <span className="text-muted-foreground">...</span>
  </div>
);

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/welcome" replace />;
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader />;

  return (
    <>
      <Routes>
        <Route path="/welcome" element={user ? <Navigate to="/" replace /> : <Welcome />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/path" element={<ProtectedRoute><LearningPath /></ProtectedRoute>} />
        <Route path="/lesson/:id" element={<ProtectedRoute><LessonPage /></ProtectedRoute>} />
        <Route path="/journal" element={<ProtectedRoute><Journal /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {user && <BottomNav />}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <ProgressProvider>
            <div className="flex flex-col min-h-screen">
              <div className="flex-1">
                <AppRoutes />
              </div>
              <Footer />
            </div>
          </ProgressProvider>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
