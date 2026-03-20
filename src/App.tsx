import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './presentation/components/Navbar';
import { HomePage } from './presentation/pages/HomePage';
import { RestaurantMenuPage } from './presentation/pages/RestaurantMenuPage';
import { CheckoutPage } from './presentation/pages/CheckoutPage';
import { ProfilePage } from './presentation/pages/ProfilePage';
import { RestaurantsPage } from './presentation/pages/RestaurantsPage';
import { SignInPage } from './presentation/pages/SignInPage';
import { RegisterPage } from './presentation/pages/RegisterPage';
import { Footer } from './presentation/components/Footer';
import { ScrollToTop } from './presentation/components/ScrollToTop';
import { FloatingCart } from './presentation/components/FloatingCart';
import { CartProvider } from './presentation/context/CartContext';
import { FavoritesProvider } from './presentation/context/FavoritesContext';
import { FilterProvider } from './presentation/context/FilterContext';

const MainContent = () => {
  const location = useLocation();
  const isCheckout = location.pathname === '/checkout';

  return (
    <>
      <Navbar />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/restaurants" element={<RestaurantsPage />} />
          <Route path="/restaurant/:id" element={<RestaurantMenuPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </div>
      {!isCheckout && <FloatingCart />}
      {!isCheckout && <Footer />}
    </>
  );
};

function App() {
  return (
    <FavoritesProvider>
      <CartProvider>
        <FilterProvider>
          <BrowserRouter>
            <ScrollToTop />
            <div className="min-h-screen bg-[#F8F9FA] selection:bg-emerald-200 selection:text-emerald-900 flex flex-col font-sans">
              <MainContent />
            </div>
          </BrowserRouter>
        </FilterProvider>
      </CartProvider>
    </FavoritesProvider>
  );
}

export default App;
