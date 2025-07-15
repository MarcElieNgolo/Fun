// Suppression.tsx
import axios from "axios";
import { useState, useCallback, useEffect } from "react";
import VoletVente from "./suppression_outils/ventes"; // Assurez-vous que le chemin est correct
import VoletRealisation from "./suppression_outils/realisation"; // Assurez-vous que le chemin est correct

// Définition des types pour correspondre précisément à la réponse du backend
type RawItemFromBackend = {
  id: number;
  titre: string;
  description: string;
  images: string[]; // <-- LE BACKEND ENVOIE DÉSORMAIS UN TABLEAU DE CHAÎNES
  type: string;
  sousType?: string; // Ajouté car le backend envoie aussi ce champ
  prix?: string; // Peut être optionnel pour certaines entrées
};

// Type pour les ventes (avec le prix obligatoire)
// Utilise le type RawItemFromBackend comme base
type Vente = RawItemFromBackend & {
  type: "vente"; // Surcharge pour s'assurer que c'est bien "vente"
  prix: string; // Le prix est obligatoire pour une vente
};

// Pas besoin de ProcessedItem ou getAllImageSources si le backend fait le travail
// Le backend s'assure déjà que `images` est un `string[]`

export default function Suppression() {
  const [data, setData] = useState<RawItemFromBackend[]>([]); // État principal pour toutes les données
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("https://batiproingenieuriebackend.onrender.com/recup");
      
      // Ici, response.data est déjà un tableau d'objets où 'images' est un tableau de chaînes.
      // Pas besoin de post-traitement complexe comme getAllImageSources.
      setData(response.data); 

    } catch (err) {
      console.error("Erreur lors de la récupération des données:", err);
      setError("Impossible de charger les données. Veuillez réessayer plus tard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = useCallback(async (id: number, itemType: 'vente' | 'realisation') => {
    try {
      await axios.delete(`https://batiproingenieuriebackend.onrender.com/delete/${id}`);

      // Filtrer les données après suppression
      setData(prevData => prevData.filter(item => item.id !== id)); // Suppression basée uniquement sur l'ID, plus robuste

      alert(`${itemType} de l'ID ${id} supprimée avec succès.`);

    } catch (err) {
      console.error(`Erreur lors de la suppression de la ${itemType} ${id}:`, err);
      alert(`Erreur lors de la suppression de la ${itemType}.`);
    }
  }, []);

  // Filtrer les données pour les passer aux composants enfants
  const realisationsToDisplay = data.filter(item => item.type === "realisation");

  // Filtrage pour les ventes, assurant que 'prix' est une chaîne et que le type est 'vente'
  const ventesToDisplay: Vente[] = data.filter((item): item is Vente => 
    item.type === "vente" && typeof item.prix === "string"
  );


  if (loading) {
    return <div className="text-center text-xl p-8">Chargement des données...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600 text-xl p-8">{error}</div>;
  }

  return (
    <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-12">
        Gestion des Contenus du Site
      </h1>

      <section className="mb-12">
        <VoletVente
          ventes={ventesToDisplay}
          onDelete={(id) => handleDelete(id, 'vente')}
        />
      </section>

      <section>
        <VoletRealisation
          realisations={realisationsToDisplay}
          onDelete={(id) => handleDelete(id, 'realisation')}
        />
      </section>
    </div>
  );
}