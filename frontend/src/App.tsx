import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AdminPage from "./pages/AdminPage";
import StoresPage from "./pages/StoresPage";
import DisplayPage from "./pages/DisplayPage";
import AuthPage from "./pages/AuthPage";
import { Toaster } from "./components/toaster";
import { AuthProvider } from "./contexts/auth-provider";
import { useAuth } from "./hooks/use-auth";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, session } = useAuth();

  if (!user || !session) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="font-poppins">
          <Router>
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <StoresPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/:storeId"
                element={
                  <ProtectedRoute>
                    <AdminPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/:storeId" element={<DisplayPage />} />
              <Route path="/" element={<Navigate to="/auth" replace />} />
            </Routes>
          </Router>
        </div>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
