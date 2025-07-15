// Architecture.tsx
import Navbar from "../components/navbar";
import React, { useState, useEffect, useRef, useCallback } from "react"; // Importez useCallback
import CarteRealisation from "../components/carteRealisation"; // Assurez-vous que le chemin est correct
import CarteVente from "../components/carteVente"; // Assurez-vous que le chemin est correct
import axios from "axios";
import Loader from "./../components/loader/loader"; // Assurez-vous que le chemin est correct

// Définition de type pour un post (comme reçu du backend)
// C'est le type le plus important pour la cohérence des données
interface Post {
  id: number;
  titre: string;
  description: string;
  images: string[]; // <-- CORRECTION MAJEURE ICI : images est un TABLEAU DE CHAINES (Data URLs complètes)
  prix?: string; // Optionnel
  type: "vente" | "realisation"; // 'vente' ou 'realisation'
  sousType?: string; // Optionnel, comme 'Architecture'
}

// *** ATTENTION : LA FONCTION getAllImageSources EST SUPPRIMÉE / DEVIENT INUTILE ICI ***
// Votre backend est censé envoyer 'images' déjà au bon format (tableau de Data URLs).
// Si ce n'est pas le cas, le problème est au niveau du backend ou de la base de données.

export default function Architecture() {
  const [allArchitecturePosts, setAllArchitecturePosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Refs pour les sections
  const realisationsRef = useRef<HTMLDivElement>(null);
  const ventesRef = useRef<HTMLDivElement>(null);

  // Fonction pour scroller vers une section
  // Utilisation de useCallback pour éviter la recréation inutile de la fonction
  const scrollToSection = useCallback((ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" }); // Ajout de block: "start" pour un meilleur positionnement
    }
  }, []);

  // Récupération des données depuis le backend
  useEffect(() => {
    const fetchArchitecturePosts = async () => {
      setLoading(true);
      setError(null);
      try {
        // Le backend est censé renvoyer un tableau de `Post` où `images` est déjà `string[]`.
        const response = await axios.get<Post[]>( // Axios peut souvent inférer, mais explicitons pour la clarté
          "https://batiproingenieuriebackend.onrender.com/architecture"
        );

        // Filtrer les posts pour ne garder que ceux avec sousType 'Architecture'
        // Assurez-vous que le champ 'sousType' existe dans votre base de données et est correctement renseigné.
        const filteredPosts = response.data.filter(
          (post) =>
            post.sousType && post.sousType.toLowerCase() === "architecture"
        );

        // PAS BESOIN DE PROCESSED POSTS AVEC getAllImageSources
        // Les données sont déjà au bon format si le backend est corrigé.
        setAllArchitecturePosts(filteredPosts);

      } catch (err) {
        console.error("Erreur lors de la récupération des posts d'architecture:", err);
        setError(
          "Impossible de charger les posts d'architecture. Veuillez réessayer plus tard."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchArchitecturePosts();
  }, []); // Dépendances vides pour un seul appel au montage

  // Séparer les posts filtrés en réalisations et ventes
  const realisationsArchitecture = allArchitecturePosts.filter(
    (post) => post.type === "realisation"
  );
  const ventesArchitecture = allArchitecturePosts.filter(
    (post) => post.type === "vente"
  );

  // --- RENDU DU COMPOSANT ---

  if (loading) {
    return (
      <div className="Architecture">
        <Navbar admin={true} />
        <div className="text-center p-8 text-xl">
          <Loader /> {/* Utilisation du composant Loader */}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="Architecture">
        <Navbar admin={true} />
        <div className="text-center p-8 text-red-600 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="Architecture">
      <Navbar admin={true}></Navbar>

      <div className="container mx-auto p-6">
        <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-8">
          Projets d'Architecture
        </h1>

        {/* Boutons de navigation */}
        <div className="flex justify-center space-x-4 mb-10">
          <button
            onClick={() => scrollToSection(realisationsRef)}
            className="px-6 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-300 text-lg font-semibold"
          >
            Nos Réalisations
          </button>
          <button
            onClick={() => scrollToSection(ventesRef)}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg shadow-md hover:bg-orange-700 transition-colors duration-300 text-lg font-semibold"
          >
            Nos Ventes
          </button>
        </div>

        {/* Section Réalisations */}
        <section ref={realisationsRef} className="mb-12 pt-4" id="realisations-section">
          <h2 className="text-3xl font-bold text-gray-800 border-b-2 border-blue-500 pb-2 mb-6">
            Réalisations en Architecture
          </h2>
          {realisationsArchitecture.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {realisationsArchitecture.map((post) => (
                // Passer directement l'objet post qui contient images: string[]
                <CarteRealisation key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600 text-lg">
              Aucune réalisation d'architecture disponible pour le moment.
            </p>
          )}
        </section>

        {/* Section Ventes */}
        <section ref={ventesRef} className="mb-12 pt-4" id="ventes-section">
          <h2 className="text-3xl font-bold text-gray-800 border-b-2 border-orange-500 pb-2 mb-6">
            Ventes en Architecture
          </h2>
          {ventesArchitecture.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ventesArchitecture.map((post) => (
                // Passer directement l'objet post qui contient images: string[]
                <CarteVente key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600 text-lg">
              Aucune vente d'architecture disponible pour le moment.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}