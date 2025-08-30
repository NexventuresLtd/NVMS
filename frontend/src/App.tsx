import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Layout } from "./components/Layout";
import { Dashboard } from "./features/dashboard/Dashboard";
import { PortfolioAdmin } from "./features/portfolio/PortfolioAdmin";
import { PortfolioList } from "./features/portfolio/PortfolioList";
import { PortfolioDetail } from "./features/portfolio/PortfolioDetail";
import { Login } from "./features/auth/Login";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        {/* Login route without layout */}
        <Route path="/login" element={<Login />} />

        {/* All other routes with sidebar layout */}
        <Route
          path="/*"
          element={
            <Layout>
              <Routes>
                {/* Public routes */}
                <Route path="/portfolio" element={<PortfolioList />} />
                <Route path="/portfolio/:slug" element={<PortfolioDetail />} />

                {/* Protected admin routes */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/admin/portfolio" element={<PortfolioAdmin />} />

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
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
