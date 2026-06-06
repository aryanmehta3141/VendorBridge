import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Vendors from "@/pages/Vendors";
import RFQs from "@/pages/RFQs";
import VendorPortal from "@/pages/VendorPortal";
import Quotations from "@/pages/Quotations";
import Approval from "@/pages/Approval";
import PurchaseOrders from "@/pages/PurchaseOrders";
import Invoices from "@/pages/Invoices";
import Unauthorized from "@/pages/Unauthorized";
import { canAccess, ROLE_HOME } from "@/utils/roleConfig";

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

/** Redirects to login if not authenticated. Redirects to /unauthorized if role lacks access. */
function RoleRoute({
  path,
  children,
}: {
  path: string;
  children: React.ReactNode;
}) {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!canAccess(role, path)) {
    return (
      <AppLayout>
        <Unauthorized />
      </AppLayout>
    );
  }

  return <AppLayout>{children}</AppLayout>;
}

function RootRedirect() {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (location.pathname === "/" || location.pathname === "") {
    return <Navigate to={role ? ROLE_HOME[role] : "/login"} replace />;
  }
  return <Navigate to="/unauthorized" replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <RoleRoute path="/dashboard">
            <Dashboard />
          </RoleRoute>
        }
      />
      <Route
        path="/vendors"
        element={
          <RoleRoute path="/vendors">
            <Vendors />
          </RoleRoute>
        }
      />
      <Route
        path="/rfqs"
        element={
          <RoleRoute path="/rfqs">
            <RFQs />
          </RoleRoute>
        }
      />
      <Route
        path="/vendor-portal"
        element={
          <RoleRoute path="/vendor-portal">
            <VendorPortal />
          </RoleRoute>
        }
      />
      <Route
        path="/quotations"
        element={
          <RoleRoute path="/quotations">
            <Quotations />
          </RoleRoute>
        }
      />
      <Route
        path="/approval"
        element={
          <RoleRoute path="/approval">
            <Approval />
          </RoleRoute>
        }
      />
      <Route
        path="/purchase-orders"
        element={
          <RoleRoute path="/purchase-orders">
            <PurchaseOrders />
          </RoleRoute>
        }
      />
      <Route
        path="/invoices"
        element={
          <RoleRoute path="/invoices">
            <Invoices />
          </RoleRoute>
        }
      />
      <Route
        path="/unauthorized"
        element={
          <AppLayout>
            <Unauthorized />
          </AppLayout>
        }
      />

      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}
