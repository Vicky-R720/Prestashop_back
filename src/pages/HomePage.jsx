
import SectionHeader from "../components/SectionHeader";
// import CategoryChips from "../components/CategoryChips";
import ProductGrid from "../components/ProductGrid";
import { mockProducts } from "../services/mockData";

export default function HomePage() {
  const featured = mockProducts.slice(0, 4);
  

  return (
    <div className="page">
      

      

      <section className="section">
        <SectionHeader
          title="Liste produit"
          subtitle="Pieces premium selectionnees par notre studio."
        />
        <ProductGrid products={featured} />
      </section>

      
    </div>
  );
}
