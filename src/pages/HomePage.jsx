import HeroSlider from "../components/HeroSlider";
import SectionHeader from "../components/SectionHeader";
import CategoryChips from "../components/CategoryChips";
import ProductGrid from "../components/ProductGrid";
import { mockProducts } from "../services/mockData";

export default function HomePage() {
  const featured = mockProducts.slice(0, 4);
  const newArrivals = mockProducts.slice(4, 8);

  return (
    <div className="page">
      <HeroSlider />

      <section className="section">
        <SectionHeader
          title="Categories tendances"
          subtitle="Des univers complets pour composer votre style."
        />
        <CategoryChips />
      </section>

      <section className="section">
        <SectionHeader
          title="Selections du moment"
          subtitle="Pieces premium selectionnees par notre studio."
        />
        <ProductGrid products={featured} />
      </section>

      <section className="banner">
        <div>
          <span className="eyebrow">Studio services</span>
          <h2>Livraison express, retours faciles</h2>
          <p>
            Support premium 7/7, retours et echanges sous 30 jours, suivi en
            temps reel.
          </p>
          <button className="button button--primary">Voir les services</button>
        </div>
        <div className="banner__cards">
          <div className="mini-card">
            <h4>Click & Collect</h4>
            <p>Retrait gratuit sous 2 heures.</p>
          </div>
          <div className="mini-card">
            <h4>Packaging luxe</h4>
            <p>Finitions prestige sur demande.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <SectionHeader
          title="Nouveautes"
          subtitle="De nouvelles silhouettes chaque semaine."
        />
        <ProductGrid products={newArrivals} />
      </section>
    </div>
  );
}
