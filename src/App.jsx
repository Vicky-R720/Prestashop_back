import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import CommandePage from "./pages/commandePage";
import "./App.css";

function App() {

  return (
    <BrowserRouter>

      <Routes>

        <Route element={<MainLayout />}>

          <Route path="/" element={<DashboardPage />} />

          <Route path="/products" element={<ProductsPage />} />

          <Route path="/products/:id" element={<ProductDetailsPage />} />
          
          <Route path="/commande" element={<CommandePage/>}/>
          
        </Route>

      </Routes>

    </BrowserRouter>
  );
}

export default App;