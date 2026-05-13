import { useState } from "react";
import { importProduits } from "../services/importApi";

function ImportPage() {
	const [csv1, setCsv1] = useState(null);
	const [message, setMessage] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const isCsv = (file) => file && file.name.toLowerCase().endsWith(".csv");

	const handleImportProduits = async () => {
		setMessage("");
        console.log("IMPORT CLICK", csv1);
		if (!isCsv(csv1)) {
			setMessage("Choisis un fichier CSV produits valide.");
			return;
		}

		setIsLoading(true);
		try {
			const text = await csv1.text();
			const results = await importProduits(text);
			setMessage(`Import produits termine: ${results.length} produits`);
		// eslint-disable-next-line no-unused-vars
		} catch (error) {
			setMessage("Erreur pendant l import des produits.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div>
			<h2>Import produits (CSV 1)</h2>

			<div>
				<label>CSV 1 (produits)</label>
				<input
					type="file"
					accept=".csv"
					onChange={(e) => setCsv1(e.target.files?.[0] || null)}
				/>
			</div>

			<button type="button" onClick={handleImportProduits} disabled={isLoading}>
				{isLoading ? "Import en cours..." : "Importer produits"}
			</button>

			{message && <p>{message}</p>}
		</div>
	);
}

export default ImportPage;
