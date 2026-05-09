import { useEffect, useState } from "react";
import ProductsTable from "../components/ProductsTable";
import { getProducts } from "../services/prestashopApi";

function ProductsPage() {

  const [products, setProducts] = useState([]);

  useEffect(() => {

    async function loadProducts() {

      const data = await getProducts();

      setProducts(data);
    }

    loadProducts();

  }, []);

  return (
    <div>
      <h2>Liste des produits</h2>

      <ProductsTable products={products} />
    </div>
  );
}

export default ProductsPage;