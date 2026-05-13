import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getCommandeById, getOrderStates, updateOrderState } from "../services/commandeApi";
import { getCustomerById } from "../services/custommersApi";

function CommandesDetail() {
	const { id } = useParams();
	const [commande, setCommande] = useState(null);
	const [customer, setCustomer] = useState(null);
	const [orderStates, setOrderStates] = useState([]);
	const [selectedStateId, setSelectedStateId] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const [isUpdating, setIsUpdating] = useState(false);
	const [error, setError] = useState("");
	const [updateError, setUpdateError] = useState("");

	const formatDateTime = (value) => {
		if (!value) return "-";
		const normalized = value.replace(" ", "T");
		const date = new Date(normalized);
		if (Number.isNaN(date.getTime())) return value;
		return date.toLocaleString("fr-FR", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
			hour12: false,
		});
	};

	const formatCurrency = (value) => {
		const amount = Number.isFinite(value) ? value : 0;
		return new Intl.NumberFormat("fr-FR", {
			style: "currency",
			currency: "EUR",
		}).format(amount);
	};

	useEffect(() => {
		async function loadDetail() {
			try {
				setIsLoading(true);
				setError("");

				const data = await getCommandeById(id);
				setCommande(data);
				setSelectedStateId(data?.current_state || "");

				if (data?.id_customer) {
					const customerData = await getCustomerById(data.id_customer);
					setCustomer(customerData);
				} else {
					setCustomer(null);
				}
			} catch {
				setError("Impossible de charger la commande.");
			} finally {
				setIsLoading(false);
			}
		}

		if (id) {
			loadDetail();
		}
	}, [id]);

	useEffect(() => {
		async function loadStates() {
			try {
				const states = await getOrderStates();
				setOrderStates(states);
			} catch {
				setOrderStates([]);
			}
		}

		loadStates();
	}, []);

	const handleStateChange = async (event) => {
		const nextStateId = event.target.value;
		setSelectedStateId(nextStateId);
		setUpdateError("");

		if (!commande?.id || !nextStateId) return;

		try {
			setIsUpdating(true);
			await updateOrderState(commande.id, nextStateId);
			const refreshed = await getCommandeById(commande.id);
			setCommande(refreshed);
			setSelectedStateId(refreshed?.current_state || nextStateId);
		} catch {
			setUpdateError("Impossible de mettre a jour l'etat de la commande.");
		} finally {
			setIsUpdating(false);
		}
	};

	const currentStateName = orderStates.find((state) => state.id === commande?.current_state)?.name;

	if (isLoading) {
		return <p>Chargement...</p>;
	}

	if (error) {
		return <p>{error}</p>;
	}

	if (!commande) {
		return <p>Commande introuvable.</p>;
	}

	return (
		<div>
			<h2>Detail de la commande</h2>

			<p><strong>Reference:</strong> {commande.reference}</p>
			<p><strong>Client:</strong> {commande.id_customer}</p>
			<p><strong>Total TTC:</strong> {commande.total_paid_tax_incl}</p>
			<p><strong>Paiement:</strong> {commande.payment}</p>
			<p><strong>Etat:</strong> {currentStateName || commande.current_state}</p>
			<p><strong>Date:</strong> {commande.date_add}</p>
			<p><strong>Livraison:</strong> {commande.delivery_address || "-"}</p>

			<label>
				Modifier l'etat:
				<select
					value={selectedStateId}
					onChange={handleStateChange}
					disabled={isUpdating || orderStates.length === 0}
				>
					<option value="">Selectionner un etat</option>
					{orderStates.map((state) => (
						<option key={state.id} value={state.id}>
							{state.name || state.id}
						</option>
					))}
				</select>
			</label>
			{isUpdating && <p>Mise a jour en cours...</p>}
			{updateError && <p>{updateError}</p>}

			<h3>Client</h3>

			{customer ? (
				<div>
					<p>account_box M. {customer.fullName || "-"} #{customer.id}</p>
					<p>Plus de details</p>
					<table border="1" width="100%">
						<tbody>
							<tr>
								<td>Client</td>
								<td>M. {customer.fullName || "-"} #{customer.id}</td>
							</tr>
							<tr>
								<td>E-mail :</td>
								<td>{customer.email || "-"}</td>
							</tr>
							<tr>
								<td>Compte cree :</td>
								<td>{formatDateTime(customer.createdAt)}</td>
							</tr>
							<tr>
								<td>Commandes validees :</td>
								<td>{customer.validatedOrders}</td>
							</tr>
							<tr>
								<td>Total depense depuis inscription :</td>
								<td>{formatCurrency(customer.totalSpent)}</td>
							</tr>
						</tbody>
					</table>
				</div>
			) : (
				<p>Aucun client trouve.</p>
			)}

			<p>
				<Link to="/commande">Retour a la liste</Link>
			</p>
		</div>
	);
}

export default CommandesDetail;
