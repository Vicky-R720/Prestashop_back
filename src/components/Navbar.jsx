import { useEffect, useState, useCallback } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import { categories } from "../services/mockData";
import { compterArticles } from "../services/Panier";

export default function Navbar() {
    const [cartCount, setCartCount] = useState(0);
    const wishlistCount = 0;
    const [query, setQuery] = useState("");
    const navigate = useNavigate();

    // ─── Charger le compteur du panier ─────────────────────────
    const refreshCartCount = useCallback(async () => {
        try {
            const count = await compterArticles();
            setCartCount(count);
        } catch {
            setCartCount(0);
        }
    }, []);

    useEffect(() => {
        // Charger au démarrage
        refreshCartCount();

        // Écouter les mises à jour du panier
        window.addEventListener("cart-updated", refreshCartCount);

        return () => {
            window.removeEventListener("cart-updated", refreshCartCount);
        };
    }, [refreshCartCount]);

    const onSubmit = (event) => {
        event.preventDefault();
        const trimmed = query.trim();
        if (!trimmed) {
            return;
        }
        navigate(`/search?q=${encodeURIComponent(trimmed)}`);
        setQuery("");
    };

    return (
        <header className="navbar">
            <div className="navbar__top">
                <Link to="/" className="logo">
                    <span className="logo__mark">PS</span>
                    <span className="logo__text">
                        <span>Prestashop</span>
                        <small>FrontOffice</small>
                    </span>
                </Link>

                <form className="search" onSubmit={onSubmit}>
                    <SearchIcon />
                    <input
                        className="search__input"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Rechercher un produit"
                        aria-label="Rechercher"
                    />
                    <button className="button button--ghost" type="submit">
                        Chercher
                    </button>
                </form>

                <div className="navbar__actions">
                    <NavLink to="/wishlist" className="icon-pill">
                        <HeartIcon />
                        <span>Wishlist</span>
                        <em>{wishlistCount}</em>
                    </NavLink>
                    <NavLink to="/cart" className="icon-pill">
                        <CartIcon />
                        <span>Panier</span>
                        <em>{cartCount}</em>
                    </NavLink>
                    <NavLink to="/auth" className="button button--primary">
                        Connexion
                    </NavLink>
                </div>
            </div>

            <nav className="navbar__menu">
                <div className="navbar__links">
                    {categories.map((category) => (
                        <NavLink
                            key={category.id}
                            to={`/category/${category.slug}`}
                            className={({ isActive }) =>
                                isActive ? "menu-link active" : "menu-link"
                            }
                        >
                            {category.name}
                        </NavLink>
                    ))}
                </div>
                <div className="navbar__links navbar__links--secondary">
                    <NavLink
                        to="/products"
                        className={({ isActive }) =>
                            isActive ? "menu-link active" : "menu-link"
                        }
                    >
                        Nouveautes
                    </NavLink>
                    <NavLink
                        to="/profile"
                        className={({ isActive }) =>
                            isActive ? "menu-link active" : "menu-link"
                        }
                    >
                        Mon compte
                    </NavLink>
                </div>
            </nav>
        </header>
    );
}

function SearchIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.8-3.8" />
        </svg>
    );
}

function HeartIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 20s-7-4.3-9-8.2C1 8.6 3 6 5.8 6c1.7 0 3.1.9 4 2.2C10.7 6.9 12.2 6 13.8 6 16.5 6 18.5 8.6 18 11.8 17 15.7 12 20 12 20z" />
        </svg>
    );
}

function CartIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6h14l-2 9H8L6 4H3" />
            <circle cx="9" cy="20" r="1.6" />
            <circle cx="17" cy="20" r="1.6" />
        </svg>
    );
}
