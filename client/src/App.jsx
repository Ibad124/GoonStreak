import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import HomePage from "@/pages/home-page";
import LeaderboardPage from "@/pages/leaderboard-page";
import AdultContent from "@/pages/adult-content";
import SocialPage from "@/pages/social-page";
import NotFound from "@/pages/not-found";
import QuickAccessMenu from "@/components/QuickAccessMenu";

function Router() {
  return (
    <Switch>
      <Route path="/adult-content" component={AdultContent} />
      <Route path="/leaderboard" component={LeaderboardPage} />
      <Route path="/social" component={SocialPage} />
      <Route path="/" component={HomePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <QuickAccessMenu />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;