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
import VerifyEmail from './pages/VerifyEmail';
import ResetPassword from './pages/ResetPassword';
import Welcome from './pages/Welcome';
import Pricing from './pages/Pricing';
import ClaimTool from './pages/ClaimTool';
import Templates from './pages/Templates';
import Deals from './pages/Deals';
import AllTools from './pages/AllTools';
import Trending from './pages/Trending';
import TopRated from './pages/TopRated';
import NewLaunches from './pages/NewLaunches';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Changelog from './pages/Changelog';
import Legal from './pages/Legal';
import Affiliates from './pages/Affiliates';
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
        <Route path="/categories" component={AllTools} />
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
        <Route path="/verify-email" component={VerifyEmail} />
        <Route path="/reset-password" component={ResetPassword} />
        <Route path="/welcome" component={Welcome} />
        <Route path="/pricing" component={Pricing} />
        <Route path="/claim" component={ClaimTool} />
        <Route path="/templates" component={Templates} />
        <Route path="/deals" component={Deals} />
        <Route path="/tools" component={AllTools} />
        <Route path="/trending" component={Trending} />
        <Route path="/top-rated" component={TopRated} />
        <Route path="/new-launches" component={NewLaunches} />
        <Route path="/blog" component={Blog} />
        <Route path="/blog/:slug" component={BlogPost} />
        <Route path="/changelog" component={Changelog} />
        <Route path="/affiliates" component={Affiliates} />
        <Route path="/privacy" component={Legal} />
        <Route path="/terms" component={Legal} />
        <Route path="/cookies" component={Legal} />
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
