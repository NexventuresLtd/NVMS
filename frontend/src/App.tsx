import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Suspense } from "react";
import { Layout } from "./components/Layout";
import { Dashboard } from "./features/dashboard/Dashboard";
import { PortfolioAdmin } from "./features/portfolio/PortfolioAdmin";
import { PortfolioCreate } from "./features/portfolio/PortfolioCreate";
import { PortfolioList } from "./features/portfolio/PortfolioList";
import { PortfolioDetail } from "./features/portfolio/PortfolioDetail";
import { ProjectList } from "./features/projects/ProjectList";
import { ProjectCreate } from "./features/projects/ProjectCreate";
import { ProjectEdit } from "./features/projects/ProjectEdit";
import { ProjectDetail } from "./features/projects/ProjectDetail";
import { Login } from "./features/auth/Login";
import { walletRoutes } from "./routes/walletRoutes";
import "./App.css";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* Login route without layout */}
        <Route path="/login" element={<Login />} />

        {/* All other routes with sidebar layout */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/*"
            element={
              <Layout>
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center h-screen">
                      <div className="text-lg text-gray-600">Loading...</div>
                    </div>
                  }
                >
                  <Routes>
                    {/* Public routes */}
                    <Route path="/portfolio" element={<PortfolioList />} />
                    <Route
                      path="/portfolio/:slug"
                      element={<PortfolioDetail />}
                    />

                    {/* Protected admin routes */}
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route
                      path="/admin/portfolio"
                      element={<PortfolioAdmin />}
                    />
                    <Route
                      path="/admin/portfolio/create"
                      element={<PortfolioCreate />}
                    />

                    {/* Projects routes */}
                    <Route path="/projects" element={<ProjectList />} />
                    <Route
                      path="/projects/create"
                      element={<ProjectCreate />}
                    />
                    <Route path="/projects/:id" element={<ProjectDetail />} />
                    <Route
                      path="/projects/:id/edit"
                      element={<ProjectEdit />}
                    />

                    {/* Wallet routes */}
                    {walletRoutes.map((route) => (
                      <Route
                        key={route.path}
                        path={route.path}
                        element={route.element}
                      />
                    ))}

                    {/* Default redirect */}
                    <Route
                      path="/"
                      element={<Navigate to="/dashboard" replace />}
                    />
                    <Route
                      path="*"
                      element={<Navigate to="/dashboard" replace />}
                    />
                  </Routes>
                </Suspense>
              </Layout>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
