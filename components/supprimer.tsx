import axios from "axios";
import { useState , useCallback , useEffect } from "react";
import VoletVente from "./suppression_outils/ventes";
import VoletRealisation from "./suppression_outils/realisation";


type Vente = ProcessedItem & {
  type: "vente";
  prix: string; // Obligatoire ici
};


type RawItem = {
  id: number;
  titre: string;
  description: string;
  images: string;
  type: string;
  prix?: string;
};

type ProcessedItem = RawItem & {
  imageSources: string[];
};

const getAllImageSources = (imagesDataFromDB: string | null | undefined): string[] => {
    if (!imagesDataFromDB || typeof imagesDataFromDB !== 'string') {
        return [];
    }

    let processedStrings: string[] = [];
    let tempString = imagesDataFromDB.trim();

    if (tempString.startsWith('"') && tempString.endsWith('"')) {
        tempString = tempString.substring(1, tempString.length - 1);
    }
    if (tempString.startsWith('\\"') && tempString.endsWith('\\"')) {
        tempString = tempString.substring(2, tempString.length - 2);
    }

    if (tempString.startsWith('[') && tempString.endsWith(']')) {
        try {
            const parsedArray = JSON.parse(tempString);
            if (Array.isArray(parsedArray)) {
                processedStrings = parsedArray.filter(s => typeof s === 'string' && s.length > 0);
            }
        } catch (e) {
            console.warn("Échec du parsing JSON, tentative de split par virgule/nettoyage manuel:", e);
            processedStrings = tempString.split(',').map(s => s.trim());
        }
    } else {
        processedStrings = tempString.split(',').map(s => s.trim());
    }

    return processedStrings
        .filter(s => s.length > 0)
        .map(s => {
            let finalString = s;
            if (finalString.startsWith('"') && finalString.endsWith('"')) {
                finalString = finalString.substring(1, finalString.length - 1);
            }
            if (finalString.startsWith('\\"') && finalString.endsWith('\\"')) {
                finalString = finalString.substring(2, finalString.length - 2);
            }

            if (!finalString.startsWith('data:image/')) {
                return `data:image/jpeg;base64,${finalString}`; // <<< IMPORTANT: Ajustez le type MIME !
            }
            return finalString;
        })
        .filter(s => s.startsWith('data:image/'));
};


export default function Suppression() {
  const [data, setData] = useState<ProcessedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("https://batiproingenieuriebackend.onrender.com/recup");
      
      const processedData: ProcessedItem[] = response.data.map((item: RawItem) => ({
        ...item,
        imageSources: getAllImageSources(item.images),
      }));

      setData(processedData);
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

      setData(prevData => prevData.filter(item => !(item.id === id && item.type === itemType)));
      alert(`${itemType} de l'ID ${id} supprimée avec succès.`);

    } catch (err) {
      console.error(`Erreur lors de la suppression de la ${itemType} ${id}:`, err);
      alert(`Erreur lors de la suppression de la ${itemType}.`);
    }
  }, []);

  const realisationsToDisplay = data.filter(item => item.type === "realisation");
  const ventesToDisplay: Vente[] = data
  .filter((item): item is Vente => item.type === "vente" && typeof item.prix === "string");


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