import { Routes, Route } from 'react-router-dom';
import LandingPage from '../pages/LandingPage.jsx';
import SignInPage from '../pages/auth/SignInPage.jsx';
import ShoppingPage from '../pages/customer/ShoppingPage.jsx';
import CheckoutPage from '../pages/customer/CheckoutPage.jsx';
import DashboardPage from '../pages/merchant/DashboardPage.jsx';
import CatalogPage from '../pages/merchant/CatalogPage.jsx';
import OrdersPage from '../pages/merchant/OrdersPage.jsx';
import ApprovalsPage from '../pages/merchant/ApprovalsPage.jsx';
import AuditPage from '../pages/merchant/AuditPage.jsx';
import SafetyRulesPage from '../pages/merchant/SafetyRulesPage.jsx';
import CustomerLayout from '../components/layout/CustomerLayout.jsx';
import MerchantLayout from '../components/layout/MerchantLayout.jsx';
import ProtectedRoute from '../components/auth/ProtectedRoute.jsx';
import { CartProvider } from '../hooks/useCart.jsx';

// CartProvider only needs to wrap the customer surface — wrapped here as a
// small shell component so <Route element> still receives a single element.
function CustomerShell() {
  return (
    <CartProvider>
      <CustomerLayout />
    </CartProvider>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<SignInPage />} />

      <Route element={<ProtectedRoute role="customer" />}>
        <Route element={<CustomerShell />}>
          <Route path="/shop" element={<ShoppingPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute role="merchant" />}>
        <Route element={<MerchantLayout />}>
          <Route path="/merchant" element={<DashboardPage />} />
          <Route path="/merchant/catalog" element={<CatalogPage />} />
          <Route path="/merchant/orders" element={<OrdersPage />} />
          <Route path="/merchant/approvals" element={<ApprovalsPage />} />
          <Route path="/merchant/audit" element={<AuditPage />} />
          <Route path="/merchant/safety-rules" element={<SafetyRulesPage />} />
        </Route>
      </Route>
    </Routes>
  );
}