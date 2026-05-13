import SectionHeader from "../components/SectionHeader";
import ProductGrid from "../components/ProductGrid";
import { mockProducts } from "../services/mockData";
import { useStore } from "../services/store.jsx";

export default function WishlistPage() {
  const { wishlist } = useStore();
  const wishlistedProducts = mockProducts.filter((product) =>
    wishlist.includes(product.id)
  );

  return (
    <div className="page">
      <SectionHeader
        title="Wishlist"
        subtitle="Gardez vos coups de coeur a portee."
      />
      {wishlistedProducts.length === 0 ? (
        <p>Votre wishlist est vide.</p>
      ) : (
        <ProductGrid products={wishlistedProducts} />
      )}
    </div>
  );
}
