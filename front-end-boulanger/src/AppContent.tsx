import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthenticatedLayout } from "@/components/Layout/AuthenticatedLayout";
import { useAppSelector, useAppDispatch } from "@/hooks/redux";
import { initializeAuth } from "@/store/slices/authSlice";

// Pages
import { ProtectedRoute } from "@/components/Layout/ProtectedRoute";
import { PublicLayout } from "@/components/Layout/PublicLayout";
import HomePage from "@/pages/HomePage";
import DashboardPage from "@/pages/DashboardPage";
import ProductsPage from "@/pages/ProductsPage";
import UsersPage from "@/pages/UsersPage";
import DeliveriesPage from "@/pages/DeliveriesPage";
import PromotionsPage from "@/pages/PromotionsPage";
import InvoicesPage from "@/pages/InvoicesPage";
import OrdersPage from "@/pages/OrdersPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import SupportPage from "@/pages/SupportPage";
import ProductDetailPage from "@/pages/ProductDetailPage";

export default function AppContent() {
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          {/* <Route path="catalog" element={<CatalogPage />} /> */}
          <Route path="product/:id" element={<ProductDetailPage />} />
        </Route>

        {/* Protected Routes */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<DashboardPage />} />
          <Route
            path="products"
            element={
              <ProtectedRoute allowedRoles={["admin", "employe"]}>
                <ProductsPage />
              </ProtectedRoute>
            }
          />
          <Route path="orders" element={<OrdersPage />} />
          <Route
            path="users"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <UsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="deliveries"
            element={
              <ProtectedRoute allowedRoles={["admin", "employe"]}>
                <DeliveriesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="promotions"
            element={
              <ProtectedRoute allowedRoles={["admin", "employe"]}>
                <PromotionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="invoices"
            element={
              <ProtectedRoute allowedRoles={["admin", "employe"]}>
                <InvoicesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="analytics"
            element={
              <ProtectedRoute allowedRoles={["admin", "employe"]}>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route path="support" element={<SupportPage />} />
        </Route>

        {/* Redirect authenticated users to dashboard */}
        <Route
          path="*"
          element={
            isAuthenticated ? (
              <Navigate to="/app/dashboard" replace />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}
