// src/pages/Terrain.tsx
import Navbar from "../components/navbar";
import React, { useState, useEffect, useRef, useCallback } from "react"; // Importez useCallback
import CarteVente from "../components/carteVente";
import CarteRealisation from "../components/carteRealisation";
import axios from "axios";
import Loader from "./../components/loader/loader"; // Vérifiez que ce chemin est correct

// *** ATTENTION : LA FONCTION getAllImageSources EST SUPPRIMÉE D'ICI. ***
// Elle n'est plus nécessaire si le backend envoie 'images' comme un tableau de Data URLs.
// Si des problèmes d'affichage d'images persistent après cette modification,
// le problème vient probablement du backend ou des données en base.

// Interface Post
interface Post {
  id: number;
  titre: string;
  description: string;
  images: string[]; // <-- CORRECTION MAJEURE ICI : images est un TABLEAU DE CHAINES (Data URLs complètes)
  prix?: string; // Optionnel
  type: "vente" | "realisation"; // 'vente' ou 'realisation'
  sousType?: string; // Sera 'terrain' (mais non filtré si l'endpoint est déjà spécifique)
}

export default function Terrain() {
  const [allTerrainPosts, setAllTerrainPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Références pour les sections Réalisations et Ventes
  const realisationsSectionRef = useRef<HTMLDivElement>(null);
  const ventesSectionRef = useRef<HTMLDivElement>(null);

  // Fonction de défilement optimisée avec useCallback
  const scrollToSection = useCallback((ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  useEffect(() => {
    const fetchTerrainPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        // Appel API à la route /terrain
        const response = await axios.get<Post[]>(
          "https://batiproingenieuriebackend.onrender.com/terrain"
        );

        // Si l'endpoint `/terrain` renvoie déjà des posts pertinents
        // et que les images sont des string[], aucun traitement supplémentaire n'est nécessaire.
        setAllTerrainPosts(response.data); // Stocke tous les posts récupérés directement

      } catch (err) {
        console.error("Erreur de chargement des posts Terrain:", err);
        setError("Échec du chargement des projets de terrains.");
      } finally {
        setLoading(false);
      }
    };

    fetchTerrainPosts();
  }, []); // Dépendances vides pour un seul appel au montage

  // Filtrer les posts pour les sections Réalisations et Ventes
  const realisationsTerrain = allTerrainPosts.filter(
    (post) => post.type === "realisation"
  );
  const ventesTerrain = allTerrainPosts.filter((post) => post.type === "vente");

  // Affichage du Loader pendant le chargement
  if (loading) {
    return (
      <div className="Terrain">
        <Navbar admin={true} />
        <div className="text-center p-8 text-lg text-gray-700">
          <Loader />
        </div>
      </div>
    );
  }

  // Affichage de l'erreur
  if (error) {
    return (
      <div className="Terrain">
        <Navbar admin={true} />
        <div className="text-center p-8 text-lg text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="Terrain">
      <Navbar admin={true}></Navbar>

      <div className="container mx-auto p-6">
        <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-8">
          Terrains
        </h1>

        {/* Boutons de navigation (seulement s'il y a des éléments dans la catégorie correspondante) */}
        <div className="flex justify-center space-x-4 mb-10">
          {realisationsTerrain.length > 0 && (
            <button
              onClick={() => scrollToSection(realisationsSectionRef)}
              className="px-6 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-300 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
            >
              Nos Réalisations
            </button>
          )}
          {ventesTerrain.length > 0 && (
            <button
              onClick={() => scrollToSection(ventesSectionRef)}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg shadow-md hover:bg-purple-700 transition-colors duration-300 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
            >
              Nos Ventes
            </button>
          )}
        </div>

        {/* Section Réalisations de Terrains */}
        {realisationsTerrain.length > 0 ? (
          <section ref={realisationsSectionRef} className="mb-12 pt-4" id="realisations-terrain-section">
            <h2 className="text-3xl font-bold text-gray-800 border-b-2 border-indigo-500 pb-2 mb-6">
              Réalisations de Terrains
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {realisationsTerrain.map((post) => (
                <CarteRealisation key={post.id} post={post} />
              ))}
            </div>
          </section>
        ) : (
          // Affiche ce paragraphe si des posts ont été chargés mais qu'il n'y a pas de réalisations
          realisationsTerrain.length === 0 && allTerrainPosts.length > 0 && (
            <p className="text-center text-gray-600 text-lg mb-12">
              Aucune réalisation de terrain disponible pour le moment.
            </p>
          )
        )}

        {/* Section Ventes de Terrains */}
        {ventesTerrain.length > 0 ? (
          <section ref={ventesSectionRef} className="mb-12 pt-4" id="ventes-terrain-section">
            <h2 className="text-3xl font-bold text-gray-800 border-b-2 border-purple-500 pb-2 mb-6">
              Terrains à Vendre
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ventesTerrain.map((post) => (
                <CarteVente key={post.id} post={post} />
              ))}
            </div>
          </section>
        ) : (
          // Affiche ce paragraphe si des posts ont été chargés mais qu'il n'y a pas de ventes
          ventesTerrain.length === 0 && allTerrainPosts.length > 0 && (
            <p className="text-center text-gray-600 text-lg mb-12">
              Aucun terrain à vendre disponible pour le moment.
            </p>
          )
        )}

        {/* Message si AUCUN post de terrain (ni vente ni réalisation) n'est chargé du tout */}
        {allTerrainPosts.length === 0 && !loading && !error && (
          <p className="text-center text-gray-600 text-lg">
            Aucun terrain disponible pour le moment dans aucune catégorie.
          </p>
        )}
      </div>
    </div>
  );
}