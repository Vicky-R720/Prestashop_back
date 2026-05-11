import { useEffect, useState } from "react";
import CommandesTable from "../components/CommandesTable";
import { getCommande } from "../services/commandeApi";


function CommandePage() {

    const [commandes, setCommandes] = useState([]);


    useEffect(() => {

        async function loadCommande() {
            const data = await getCommande();

            setCommandes(data);
        }

        loadCommande();
    }, []);

    return (

        <div>
            <h2>Liste des commandes</h2>
            <CommandesTable commandes={commandes} />

        </div>


    )

}

export default CommandePage