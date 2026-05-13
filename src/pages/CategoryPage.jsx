import { useParams } from "react-router-dom";

import SectionHeader from "../components/SectionHeader";
import ProductGrid from "../components/ProductGrid";
import { categories, mockProducts } from "../services/mockData";

export default function CategoryPage() {
  const { slug } = useParams();
  const category = categories.find((item) => item.slug === slug);
  const products = mockProducts.filter((product) => product.category === slug);

  return (
    <div className="page">
      <SectionHeader
        title={category ? category.name : "Categorie"}
        subtitle={`${products.length} produits disponibles`}
      />
      <ProductGrid products={products} />
    </div>
  );
}
