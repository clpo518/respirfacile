import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

import ProtectedRoute from "@/components/ProtectedRoute";
import SEOHead from "@/components/SEOHead";
import ScrollToTop from "@/components/ScrollToTop";
import CookieConsent from "./components/CookieConsent";
import PageLoader from "@/components/PageLoader";

// Eager: landing page (first paint)
import UnifiedLanding from "./pages/UnifiedLanding";

// Lazy-loaded pages
const Auth           = lazy(() => import("./pages/Auth"));
const ResetPassword  = lazy(() => import("./pages/ResetPassword"));
const NotFound       = lazy(() => import("./pages/NotFound"));
const Terms          = lazy(() => import("./pages/Terms"));
const Privacy        = lazy(() => import("./pages/Privacy"));
const Pricing        = lazy(() => import("./pages/Pricing"));
const About          = lazy(() => import("./pages/About"));
const Contact        = lazy(() => import("./pages/Contact"));
const Blog           = lazy(() => import("./pages/Blog"));
const BlogArticle    = lazy(() => import("./pages/BlogArticle"));

// Thérapeute
const ProLanding            = lazy(() => import("./pages/ProLanding"));
const TherapistDashboard    = lazy(() => import("./pages/TherapistDashboard"));
const PatientDetail         = lazy(() => import("./pages/PatientDetail"));
const ProSubscription       = lazy(() => import("./pages/ProSubscription"));
const ProSubscriptionManage = lazy(() => import("./pages/ProSubscriptionManage"));

// Patient
const Dashboard     = lazy(() => import("./pages/Dashboard"));
const Practice      = lazy(() => import("./pages/Practice"));
const SessionLive   = lazy(() => import("./pages/SessionLive"));
const SessionDetail = lazy(() => import("./pages/SessionDetail"));
const Settings      = lazy(() => import("./pages/Settings"));

// Admin
const Admin = lazy(() => import("./pages/Admin"));

// Preview éphémère (à retirer après validation visuelle)
const PreviewClinicalBadges = lazy(() => import("./pages/PreviewClinicalBadges"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ScrollToTop />
          <SEOHead />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* ── Public ──────────────────────────────── */}
              <Route path="/"                     element={<UnifiedLanding />} />
              <Route path="/pro"                  element={<ProLanding />} />
              <Route path="/auth"                 element={<Auth />} />
              <Route path="/auth/reset-password"  element={<ResetPassword />} />
              <Route path="/pricing"              element={<Pricing />} />
              <Route path="/about"                element={<About />} />
              <Route path="/contact"              element={<Contact />} />
              <Route path="/legal/terms"          element={<Terms />} />
              <Route path="/legal/privacy"        element={<Privacy />} />
              <Route path="/blog"                 element={<Blog />} />
              <Route path="/blog/:slug"           element={<BlogArticle />} />

              {/* ── Preview éphémère (à retirer après validation) ── */}
              <Route path="/preview/clinical-badges" element={<PreviewClinicalBadges />} />

              {/* ── Thérapeute (ortho / kiné) ───────────── */}
              <Route path="/pro/subscription"        element={<ProtectedRoute roles={["therapist","kine"]}><ProSubscription /></ProtectedRoute>} />
              <Route path="/pro/subscription/manage" element={<ProtectedRoute roles={["therapist","kine"]}><ProSubscriptionManage /></ProtectedRoute>} />
              <Route path="/patients"                element={<ProtectedRoute roles={["therapist","kine"]}><TherapistDashboard /></ProtectedRoute>} />
              <Route path="/patients/:id"            element={<ProtectedRoute roles={["therapist","kine"]}><PatientDetail /></ProtectedRoute>} />

              {/* ── Patient ─────────────────────────────── */}
              <Route path="/dashboard"         element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/practice"          element={<ProtectedRoute><Practice /></ProtectedRoute>} />
              <Route path="/session-live"      element={<ProtectedRoute><SessionLive /></ProtectedRoute>} />
              <Route path="/session/:id"       element={<ProtectedRoute><SessionDetail /></ProtectedRoute>} />
              <Route path="/settings"          element={<ProtectedRoute><Settings /></ProtectedRoute>} />

              {/* ── Admin ───────────────────────────────── */}
              <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><Admin /></ProtectedRoute>} />

              {/* ── 404 ─────────────────────────────────── */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <CookieConsent />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
