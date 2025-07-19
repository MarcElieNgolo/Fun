import axios from "axios";
import { useState, useCallback, useEffect, useRef } from "react"; // Ajout de useRef
import VoletVente from "./suppression_outils/ventes";
import VoletRealisation from "./suppression_outils/realisation";
import Loader from "./loader/loader";

interface Post {
  id: number;
  titre: string;
  description: string;
  images: string; // Garder comme string si le backend renvoie une chaîne JSON
  prix?: string;
  type: "vente" | "realisation";
  sousType?: string;
}

interface RawItem {
  id: number;
  titre: string;
  description: string;
  images: string; // Le backend renvoie une chaîne JSON ici
  prix?: string;
  type: string;
  sousType?: string;
}

const POSTS_PER_PAGE = 5; // Nombre d'éléments à charger par requête

export default function Suppression() {
  const [data, setData] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0); // Page actuelle
  const [hasMore, setHasMore] = useState(true); // Indique s'il y a plus de posts à charger

  const loadingRef = useRef<HTMLDivElement>(null); // Ref pour le déclencheur de chargement

  const fetchData = useCallback(async () => {
    if (!hasMore) return; // Ne pas charger si plus d'éléments disponibles
    setLoading(true);
    setError(null);

    const offset = currentPage * POSTS_PER_PAGE;

    try {
      const response = await axios.get<RawItem[]>(
        "https://batiproingenieuriebackend.onrender.com/recup",
        {
          params: {
            limit: POSTS_PER_PAGE,
            offset: offset,
          },
        }
      );

      const processedData: Post[] = response.data.map((item) => ({
        id: item.id,
        titre: item.titre,
        description: item.description,
        // Désérialiser le champ 'images' de chaîne JSON à liste Python (si nécessaire)
        // Le type 'images' dans l'interface Post est 'string[]', mais RawItem est 'string'.
        // Assurez-vous que le backend renvoie une chaîne JSON qui peut être parsée en string[].
        images: JSON.parse(item.images), // Supposons que item.images est une chaîne JSON valide d'un tableau de chaînes
        prix: item.prix,
        type: item.type as "vente" | "realisation",
        sousType: item.sousType,
      }));

      setData((prevData) => [...prevData, ...processedData]);
      setHasMore(processedData.length === POSTS_PER_PAGE); // S'il y a moins d'éléments que la limite, c'est la dernière page
    } catch (err) {
      console.error("Erreur récupération données :", err);
      setError("Impossible de charger les données. Veuillez réessayer plus tard.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, hasMore]); // Dépend de currentPage et hasMore

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Intersection Observer pour déclencher le chargement de plus de posts
  useEffect(() => {
    if (!loadingRef.current || !hasMore || loading) return; // Ne pas observer si plus d'éléments, ou déjà en chargement

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        setCurrentPage((prevPage) => prevPage + 1); // Incrémente la page pour charger le lot suivant
      }
    }, { threshold: 0.1 }); // Se déclenche quand 10% de l'élément est visible

    observer.observe(loadingRef.current);

    return () => {
      if (loadingRef.current) {
        observer.unobserve(loadingRef.current);
      }
    };
  }, [hasMore, loading]); // Relancer quand hasMore ou loading change

  const ventesToDisplay = data.filter((item) => item.type === "vente");
  const realisationsToDisplay = data.filter((item) => item.type === "realisation");

  const handleDelete = useCallback(async (id: number, itemType: "vente" | "realisation") => {
    try {
      await axios.delete(
        `https://batiproingenieuriebackend.onrender.com/delete/${id}`
      );
      // Supprimer l'élément de l'état local après suppression réussie
      setData((prev) => prev.filter((item) => item.id !== id)); // Filtrer par ID uniquement, car il est unique
      // Afficher une alerte personnalisée au lieu de window.alert
      alert(`${itemType} avec l'ID ${id} supprimée avec succès.`);
    } catch (err) {
      console.error(`Erreur suppression ${itemType} ${id}:`, err);
      // Afficher une alerte personnalisée
      alert(`Erreur lors de la suppression de la ${itemType}.`);
    }
  }, []);

  // Affichage du loader uniquement si c'est le chargement initial et qu'il n'y a pas encore de données
  if (loading && data.length === 0) {
    return (
      <div className="text-center p-8 text-xl text-gray-700">
        <Loader />
      </div>
    );
  }

  // Affichage de l'erreur uniquement si aucune donnée n'a été chargée
  if (error && data.length === 0) {
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

      {/* Loader ou message de fin de liste pour le défilement infini */}
      {hasMore && (
        <div ref={loadingRef} className="text-center py-4">
          {loading ? <Loader /> : <p className="text-gray-500">Chargement des éléments...</p>}
        </div>
      )}
      {!hasMore && data.length > 0 && (
        <p className="text-center text-gray-500 py-4">
          Tous les éléments ont été chargés.
        </p>
      )}
      {data.length === 0 && !loading && !error && (
        <p className="text-center text-gray-600 text-lg">
          Aucun contenu trouvé.
        </p>
      )}
    </div>
  );
}
