import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from './contexts/AuthContext';
import { CompareProvider } from './contexts/CompareContext';
import CompareBar from './components/CompareBar';
import Home from "./pages/Home";
import ToolDetail from "./pages/ToolDetail";
import SearchResults from './pages/SearchResults';
import LaunchPad from './pages/LaunchPad';
import Categories from './pages/Categories';
import Reviews from './pages/Reviews';
import SignIn from './pages/SignIn';
import Compare from './pages/Compare';
import Saved from './pages/Saved';
import Launches from './pages/Launches';
import About from './pages/About';
import Trust from './pages/Trust';
import Contact from './pages/Contact';
import Dashboard from './pages/Dashboard';
import FounderDashboard from './pages/FounderDashboard';
import ScrollToTop from './components/ScrollToTop';

function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/tools/:slug" component={ToolDetail} />
        <Route path="/search" component={SearchResults} />
        <Route path="/launchpad" component={LaunchPad} />
        <Route path="/categories" component={Categories} />
        <Route path="/reviews" component={Reviews} />
        <Route path="/signin" component={SignIn} />
        <Route path="/compare" component={Compare} />
        <Route path="/saved" component={Saved} />
        <Route path="/launches" component={Launches} />
        <Route path="/about" component={About} />
        <Route path="/trust" component={Trust} />
        <Route path="/contact" component={Contact} />
        <Route path="/dashboard/founder" component={FounderDashboard} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
      <CompareBar />
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <CompareProvider>
            <TooltipProvider>
              <Toaster richColors position="top-right" />
              <Router />
            </TooltipProvider>
          </CompareProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
