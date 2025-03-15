import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/hooks/use-theme";
import { ProtectedRoute } from "@/lib/protected-route";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import LeaderboardPage from "@/pages/leaderboard-page";
import AdultPage from "@/pages/adult-content";
import GoalsPage from "@/pages/goals-page";
import OnboardingPage from "@/pages/onboarding-page";
import SocialPage from "@/pages/social-page";
import NotFound from "@/pages/not-found";
import { ErrorBoundary } from "@/components/ErrorBoundary";

function Router() {
  console.log("Initializing Router component");
  try {
    return (
      <Switch>
        <Route path="/auth" component={AuthPage} />
        <ProtectedRoute path="/onboarding" component={OnboardingPage} />
        <ProtectedRoute path="/onboarding/goals" component={GoalsPage} />
        <ProtectedRoute path="/adult-content" component={AdultPage} />
        <ProtectedRoute path="/leaderboard" component={LeaderboardPage} />
        <ProtectedRoute path="/social" component={SocialPage} />
        <ProtectedRoute path="/" component={HomePage} />
        <Route component={NotFound} />
      </Switch>
    );
  } catch (error) {
    console.error("Router initialization error:", error);
    throw error;
  }
}

const App = () => {
  console.log("Initializing App component with providers");
  try {
    return (
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ThemeProvider>
              <Router />
              <Toaster />
            </ThemeProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    );
  } catch (error) {
    console.error("App initialization error:", error);
    throw error;
  }
};

export default App;