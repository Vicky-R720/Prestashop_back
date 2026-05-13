import { BrowserRouter, Route, Routes } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/HomePage";
import CartPage from "./pages/CartPage";
import AuthPage from "./pages/AuthPage";
import WishlistPage from "./pages/WishlistPage";
import CategoryPage from "./pages/CategoryPage";
import SearchResultsPage from "./pages/SearchResultsPage";
import ProfilePage from "./pages/ProfilePage";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;