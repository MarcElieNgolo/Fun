// src/pages/Ecologique.tsx
import Navbar from "../components/navbar";
import React, { useState, useEffect, useRef, useCallback } from "react"; // Importez useCallback
import CarteVente from "../components/carteVente";
import CarteRealisation from "../components/carteRealisation";
import Loader from "./../components/loader/loader"; // Assurez-vous que le chemin est correct

import axios from "axios";

// *** ATTENTION : LA FONCTION getAllImageSources EST SUPPRIMÉE D'ICI. ***
// Elle est inutile si le backend envoie déjà 'images' comme un tableau de Data URLs.
// Si vous rencontrez toujours des problèmes d'images après cette suppression,
// le problème est très probablement au niveau du backend ou des données stockées.

// --- Interface Post ---
interface Post {
  id: number;
  titre: string;
  description: string;
  images: string[]; // <-- CORRECTION MAJEURE ICI : images est un TABLEAU DE CHAINES (Data URLs complètes)
  prix?: string; // Optionnel
  type: "vente" | "realisation"; // 'vente' ou 'realisation'
  sousType?: string; // Optionnel
}

export default function Ecologique() {
  const [allEcologiquePosts, setAllEcologiquePosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Références pour les sections
  const realisationsSectionRef = useRef<HTMLDivElement>(null);
  const ventesSectionRef = useRef<HTMLDivElement>(null);

  // Fonction de défilement optimisée avec useCallback
  const scrollToSection = useCallback((ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  useEffect(() => {
    const fetchEcologiquePosts = async () => {
      setLoading(true);
      setError(null);
      try {
        // Le backend est censé renvoyer un tableau de `Post` où `images` est déjà `string[]`.
        const response = await axios.get<Post[]>(
          "https://batiproingenieuriebackend.onrender.com/ecologique"
        );

        // Si l'endpoint `/ecologique` ne renvoie que des posts "écologiques",
        // pas besoin de filtrer par sousType ici. On utilise directement response.data.
        setAllEcologiquePosts(response.data);

      } catch (err) {
        console.error("Erreur de chargement des posts écologiques:", err);
        setError("Échec du chargement des projets écologiques.");
      } finally {
        setLoading(false);
      }
    };

    fetchEcologiquePosts();
  }, []); // Dépendances vides pour un seul appel au montage

  // Filtrage des posts pour l'affichage (réalisations et ventes)
  const realisationsEcologique = allEcologiquePosts.filter(
    (post) => post.type === "realisation"
  );
  const ventesEcologique = allEcologiquePosts.filter(
    (post) => post.type === "vente"
  );

  if (loading) {
    return (
      <div className="Ecologique">
        <Navbar admin={true} />
        <div className="text-center p-8 text-lg text-gray-700">
          <Loader />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="Ecologique">
        <Navbar admin={true} />
        <div className="text-center p-8 text-lg text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="Ecologique">
      <Navbar admin={true}></Navbar>

      <div className="container mx-auto p-6">
        <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-8">
          Constructions Écologiques
        </h1>

        {/* Boutons de navigation (utilisent les refs) */}
        <div className="flex justify-center space-x-4 mb-10">
          <button
            onClick={() => scrollToSection(realisationsSectionRef)}
            className="px-6 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-colors duration-300 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
          >
            Nos Réalisations
          </button>
          <button
            onClick={() => scrollToSection(ventesSectionRef)}
            className="px-6 py-3 bg-yellow-600 text-white rounded-lg shadow-md hover:bg-yellow-700 transition-colors duration-300 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50"
          >
            Nos Ventes
          </button>
        </div>

        {/* Section Réalisations Écologiques */}
        <section
          ref={realisationsSectionRef}
          className="mb-12 pt-4"
          id="realisations-ecologique-section"
        >
          <h2 className="text-3xl font-bold text-gray-800 border-b-2 border-green-500 pb-2 mb-6">
            Réalisations Écologiques
          </h2>
          {realisationsEcologique.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {realisationsEcologique.map((post) => (
                <CarteRealisation key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600 text-lg">
              Aucune réalisation écologique disponible pour le moment.
            </p>
          )}
        </section>

        {/* Section Ventes Écologiques */}
        <section
          ref={ventesSectionRef}
          className="mb-12 pt-4"
          id="ventes-ecologique-section"
        >
          <h2 className="text-3xl font-bold text-gray-800 border-b-2 border-yellow-500 pb-2 mb-6">
            Ventes Écologiques
          </h2>
          {ventesEcologique.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ventesEcologique.map((post) => (
                <CarteVente key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600 text-lg">
              Aucune vente écologique disponible pour le moment.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}