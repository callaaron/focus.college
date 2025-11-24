import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import Competencies from "@/pages/Competencies";
import Assessment from "@/pages/Assessment";
import Challenge from "@/pages/Challenge";
import Analysis from "@/pages/Analysis";
import Growth from "@/pages/Growth";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ChangePassword from "@/pages/ChangePassword";
import CompanyDashboard from "@/pages/CompanyDashboard";
import CompanyAssessment from "@/pages/CompanyAssessment";
import GapAnalysis from "@/pages/GapAnalysis";
import LearningPath from "@/pages/LearningPath";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminQuestions from "@/pages/admin/AdminQuestions";
import QATest from "@/pages/admin/QATest";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/login"} component={Login} />
      <Route path={"/register"} component={Register} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/profile"} component={Profile} />
      <Route path={"/change-password"} component={ChangePassword} />
      <Route path={"/competencies"} component={Competencies} />
      <Route path={"/assessment"} component={Assessment} />
      <Route path={"/challenge"} component={Challenge} />
      <Route path={"/analysis"} component={Analysis} />
      <Route path={"/growth"} component={Growth} />
      <Route path={"/company"} component={CompanyDashboard} />
      <Route path={"/company/assessment"} component={CompanyAssessment} />
      <Route path={"/gap-analysis"} component={GapAnalysis} />
      <Route path={"/learning-path"} component={LearningPath} />
      <Route path={"/learning-path/:pathId"} component={LearningPath} />
      <Route path={"/admin"} component={AdminDashboard} />
      <Route path={"/admin/users"} component={AdminUsers} />
      <Route path={"/admin/questions"} component={AdminQuestions} />
      <Route path={"/admin/qa-test"} component={QATest} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
