import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import CommandePage from "./pages/commandePage";
import CommandesDetail from "./components/CommandesDetail";
import "./App.css";
import LoginPage from "./pages/LoginPages";
import RequireAuth from "./components/RequireAuth";
import ResetPage from "./pages/ResetPage"; 
import ImportPage from "./pages/ImportPage"; 

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<RequireAuth><MainLayout /></RequireAuth>}>

          <Route path="/" element={<DashboardPage />} />

          <Route path="/products" element={<ProductsPage />} />

          <Route path="/products/:id" element={<ProductDetailsPage />} />

          <Route path="/commande" element={<CommandePage />} />

          <Route path="/orders/:id" element={<CommandesDetail />} />

          <Route path="/reset" element={<ResetPage />} />

          <Route path="/import" element={<ImportPage />} />
        </Route>
      </Routes>

    </BrowserRouter>
  );
}

export default App;