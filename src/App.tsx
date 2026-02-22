import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import { CartProvider } from './presentation/context/CartContext';
import { FavoritesProvider } from './presentation/context/FavoritesContext';

function App() {
  return (
    <FavoritesProvider>
      <CartProvider>
        <BrowserRouter>
          <ScrollToTop />
          <div className="min-h-screen bg-[#F8F9FA] selection:bg-emerald-200 selection:text-emerald-900 flex flex-col font-sans">
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
            <Footer />
          </div>
        </BrowserRouter>
      </CartProvider>
    </FavoritesProvider>
  );
}

export default App;
