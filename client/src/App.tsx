import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { RouteSkeleton } from "./components/RouteSkeleton";

// Critical pages - loaded immediately
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Lazy-loaded pages - loaded on demand
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const Competencies = lazy(() => import("./pages/Competencies"));
const Assessment = lazy(() => import("./pages/Assessment"));
const AssessmentQuestionnaire = lazy(() => import("./pages/AssessmentQuestionnaire"));
const AssessmentResults = lazy(() => import("./pages/AssessmentResults"));
const Challenge = lazy(() => import("./pages/Challenge"));
const Achievements = lazy(() => import("./pages/Achievements"));
const Analysis = lazy(() => import("./pages/Analysis"));
const Growth = lazy(() => import("./pages/Growth"));
const ChangePassword = lazy(() => import("./pages/ChangePassword"));
const CompanyDashboard = lazy(() => import("./pages/CompanyDashboard"));
const CompanyAssessment = lazy(() => import("./pages/CompanyAssessment"));
const GapAnalysis = lazy(() => import("./pages/GapAnalysis"));
const LearningPath = lazy(() => import("./pages/LearningPath"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminQuestions = lazy(() => import("./pages/admin/AdminQuestions"));
const QATest = lazy(() => import("./pages/admin/QATest"));
const NotFound = lazy(() => import("./pages/NotFound"));

function Router() {
  return (
    <Suspense fallback={<RouteSkeleton />}>
      <Switch>
        {/* Critical routes - no lazy loading */}
        <Route path={"/"} component={Home} />
        <Route path={"/login"} component={Login} />
        <Route path={"/register"} component={Register} />
        
        {/* Lazy-loaded routes */}
        <Route path={"/dashboard"} component={Dashboard} />
        <Route path={"/profile"} component={Profile} />
        <Route path={"/change-password"} component={ChangePassword} />
        <Route path={"/competencies"} component={Competencies} />
        <Route path={"/assessment"} component={Assessment} />
        <Route path={"/assessment/questionnaire/:sessionId"} component={AssessmentQuestionnaire} />
        <Route path={"/assessment/results/:sessionId"} component={AssessmentResults} />
        <Route path={"/challenge"} component={Challenge} />
        <Route path={"/achievements"} component={Achievements} />
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
    </Suspense>
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
