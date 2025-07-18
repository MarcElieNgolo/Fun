// src/components/supprimer.tsx
import axios from "axios";
import { useState, useCallback, useEffect } from "react";
import VoletVente from "./suppression_outils/ventes";
import VoletRealisation from "./suppression_outils/realisation";
import Loader from "./loader/loader"; // ✅ Ajout du loader

interface Post {
  id: number;
  titre: string;
  description: string;
  images: string[];
  prix?: string;
  type: "vente" | "realisation";
  sousType?: string;
}

interface RawItem {
  id: number;
  titre: string;
  description: string;
  images: string;
  prix?: string;
  type: string;
  sousType?: string;
}

const getAllImageSources = (imagesDataFromDB: string | null | undefined): string[] => {
  if (!imagesDataFromDB || typeof imagesDataFromDB !== "string") return [];

  let temp = imagesDataFromDB.trim();
  if (temp.startsWith('"') && temp.endsWith('"')) temp = temp.slice(1, -1);
  if (temp.startsWith('\\"') && temp.endsWith('\\"')) temp = temp.slice(2, -2);

  let rawList: string[] = [];
  if (temp.startsWith("[") && temp.endsWith("]")) {
    try {
      const parsed = JSON.parse(temp);
      if (Array.isArray(parsed)) rawList = parsed.filter((s) => typeof s === "string");
    } catch {
      rawList = temp.split(",").map((s) => s.trim());
    }
  } else {
    rawList = temp.split(",").map((s) => s.trim());
  }

  return rawList
    .filter((s) => s.length > 0)
    .map((s) =>
      s.startsWith("data:image/") ? s : `data:image/jpeg;base64,${s.replace(/^"|"$/g, "")}`
    );
};

export default function Suppression() {
  const [data, setData] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<RawItem[]>(
        "https://batiproingenieuriebackend.onrender.com/recup"
      );

      const processedData: Post[] = response.data.map((item) => ({
        id: item.id,
        titre: item.titre,
        description: item.description,
        images: item.images,
        prix: item.prix,
        type: item.type as "vente" | "realisation",
        sousType: item.sousType,
      }));

      setData(processedData);
    } catch (err) {
      console.error("Erreur récupération données :", err);
      setError("Impossible de charger les données. Veuillez réessayer plus tard.");
    } finally {
      setTimeout(() => setLoading(false), 50); // ✅ micro-délai pour un rendu fluide
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const ventesToDisplay = data.filter((item) => item.type === "vente");
  const realisationsToDisplay = data.filter((item) => item.type === "realisation");

  const handleDelete = useCallback(async (id: number, itemType: "vente" | "realisation") => {
    try {
      await axios.delete(
        `https://batiproingenieuriebackend.onrender.com/delete/${id}`
      );
      setData((prev) => prev.filter((item) => !(item.id === id && item.type === itemType)));
      alert(`${itemType} avec l'ID ${id} supprimée avec succès.`);
    } catch (err) {
      console.error(`Erreur suppression ${itemType} ${id}:`, err);
      alert(`Erreur lors de la suppression de la ${itemType}.`);
    }
  }, []);

  if (loading) {
    return (
      <div className="text-center p-8 text-xl text-gray-700">
        <Loader />
      </div>
    );
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
          onDelete={(id) => handleDelete(id, "vente")}
        />
      </section>

      <section>
        <VoletRealisation
          realisations={realisationsToDisplay}
          onDelete={(id) => handleDelete(id, "realisation")}
        />
      </section>
    </div>
  );
}
