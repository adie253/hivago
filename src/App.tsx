import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navbar } from './presentation/components/Navbar';
import { HomePage } from './presentation/pages/HomePage';
import { RestaurantMenuPage } from './presentation/pages/RestaurantMenuPage';
import { CheckoutPage } from './presentation/pages/CheckoutPage';
import { ProfilePage } from './presentation/pages/ProfilePage';
import { RestaurantsPage } from './presentation/pages/RestaurantsPage';
import { SignInPage } from './presentation/pages/SignInPage';
import { RegisterPage } from './presentation/pages/RegisterPage';
import { PaymentPage } from './presentation/pages/PaymentPage';
import { OrderTrackingPage } from './presentation/pages/OrderTrackingPage';
import { OrdersPage } from './presentation/pages/OrdersPage';
import { PaymentSuccessPage } from './presentation/pages/PaymentSuccessPage';
import { PaymentFailedPage } from './presentation/pages/PaymentFailedPage';
import { AboutUsPage } from './presentation/pages/AboutUsPage';
import { PrivacyPage } from './presentation/pages/PrivacyPage';
import { ProtectedRoute } from './presentation/components/ProtectedRoute';
import { Footer } from './presentation/components/Footer';
import { ScrollToTop } from './presentation/components/ScrollToTop';
import { FloatingCart } from './presentation/components/FloatingCart';
import { CartProvider } from './presentation/context/CartContext';
import { FavoritesProvider } from './presentation/context/FavoritesContext';
import { FilterProvider } from './presentation/context/FilterContext';
import { LocationProvider } from './presentation/context/LocationContext';
import { GoogleMapsProvider } from './presentation/context/GoogleMapsContext';

const MainContent = () => {
  const location = useLocation();
  const isCheckout = location.pathname === '/checkout' || location.pathname === '/payment' || location.pathname === '/track-order' || location.pathname === '/payment-success' || location.pathname === '/payment-failed';

  return (
    <>
      {!isCheckout && <Navbar />}
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/restaurants" element={<RestaurantsPage />} />
          <Route path="/restaurant/:id" element={<RestaurantMenuPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/track-order" element={<OrderTrackingPage />} />
          <Route path="/payment-success" element={<PaymentSuccessPage />} />
          <Route path="/payment-failed" element={<PaymentFailedPage />} />
          <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/about" element={<AboutUsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
        </Routes>
      </div>
      {!isCheckout && <FloatingCart />}
      {!isCheckout && <Footer />}
    </>
  );
};

import { NotificationProvider } from './presentation/context/NotificationContext';
import { ToastProvider } from './presentation/context/ToastContext';
import { PWAInstallProvider } from './presentation/context/PWAInstallContext';
import { PWAInstallOverlay } from './presentation/components/PWAInstallOverlay';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
      <PWAInstallProvider>
      <FavoritesProvider>
      <CartProvider>
        <LocationProvider>
          <GoogleMapsProvider>
          <FilterProvider>
            <NotificationProvider>
              <BrowserRouter>
                <ScrollToTop />
                <PWAInstallOverlay />
                <div className="min-h-screen bg-[#F8F9FA] selection:bg-emerald-200 selection:text-emerald-900 flex flex-col font-sans">
                  <MainContent />
                </div>
              </BrowserRouter>
            </NotificationProvider>
          </FilterProvider>
          </GoogleMapsProvider>
        </LocationProvider>
      </CartProvider>
      </FavoritesProvider>
      </PWAInstallProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
