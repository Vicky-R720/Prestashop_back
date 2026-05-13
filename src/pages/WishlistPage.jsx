import SectionHeader from "../components/SectionHeader";

export default function WishlistPage() {
  return (
    <div className="page">
      <SectionHeader
        title="Wishlist"
        subtitle="Gardez vos coups de coeur a portee."
      />
      <p>Votre wishlist est vide.</p>
    </div>
  );
}
