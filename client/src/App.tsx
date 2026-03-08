import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ToolDetail from "./pages/ToolDetail";
import SearchResults from './pages/SearchResults';
import LaunchPad from './pages/LaunchPad';

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/tools/:slug" component={ToolDetail} />
      <Route path="/search" component={SearchResults} />
      <Route path="/launchpad" component={LaunchPad} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster richColors position="top-right" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
