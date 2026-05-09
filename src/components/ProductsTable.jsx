import { Link } from "react-router-dom";

function ProductsTable({ products }) {

    return (
        <table border="1" width="100%">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nom</th>
                    <th>Référence</th>
                    <th>Prix HT</th>
                    <th>Prix TTC</th>
                    <th>État</th>
                    <th>Actions</th>
                </tr>
            </thead>

            <tbody>
                {products.map((p) => (
                    <tr key={p.id}>
                        <td>{p.id}</td>
                        <td>{p.name}</td>
                        <td>{p.reference}</td>
                        <td>{p.price_ht}</td>
                        <td>{p.price_ttc}</td>
                        <td>{p.active == 1 ? "Actif" : "Inactif"}</td>
                        <td>
                            <Link to={`/products/${p.id}`}>
                                <button>Voir</button>
                            </Link>
                            <button>Modifier</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export default ProductsTable;