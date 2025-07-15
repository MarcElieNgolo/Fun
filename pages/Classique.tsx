// src/pages/Classique.tsx
import Navbar from "../components/navbar";
import React, { useState, useEffect, useRef, useCallback } from "react"; // Importez useCallback
import CarteVente from "../components/carteVente";
import CarteRealisation from "../components/carteRealisation";
import axios from "axios";
import Loader from "./../components/loader/loader"; // Assurez-vous que le chemin est correct

// ATTENTION : LA FONCTION getAllImageSources EST SUPPRIMÉE D'ICI.
// Elle ne doit pas être présente dans les composants qui consomment les données
// si le backend envoie déjà les images au format string[].

// Définition de type pour un post (comme reçu du backend)
interface Post {
  id: number;
  titre: string;
  description: string;
  images: string[]; // <-- CORRECTION MAJEURE ICI : images est un TABLEAU DE CHAINES (Data URLs complètes)
  prix?: string; // Optionnel
  type: "vente" | "realisation"; // 'vente' ou 'realisation'
  sousType?: string; // Optionnel
}

export default function Classique() {
  const [classiquePosts, setClassiquePosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const realisationsRef = useRef<HTMLDivElement>(null);
  const ventesRef = useRef<HTMLDivElement>(null);

  // Fonction pour scroller vers une section
  const scrollToSection = useCallback((ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []); // useCallback pour optimiser la fonction de callback

  useEffect(() => {
    const fetchClassiquePosts = async () => {
      setLoading(true);
      setError(null);
      try {
        // Le backend est censé renvoyer un tableau de `Post` où `images` est déjà `string[]`.
        const response = await axios.get<Post[]>(
          "https://batiproingenieuriebackend.onrender.com/classique"
        );

        // Si le backend renvoie déjà les images comme string[], AUCUN TRAITEMENT SUPPLÉMENTAIRE N'EST NÉCESSAIRE.
        // On n'a pas besoin de filtrer par sousType 'classique' si l'endpoint est déjà dédié.
        // Cependant, si l'endpoint `/classique` peut aussi renvoyer d'autres sous-types,
        // vous pourriez vouloir ajouter un filtre similaire à `Architecture.tsx`.
        // Pour l'instant, je pars du principe que `/classique` ne renvoie que des posts "classiques".

        setClassiquePosts(response.data); // Utilisez directement response.data

      } catch (err) {
        console.error("Erreur lors de la récupération des posts classiques:", err);
        setError(
          "Impossible de charger les posts classiques. Veuillez réessayer plus tard."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchClassiquePosts();
  }, []); // Dépendances vides pour un seul appel au montage

  const realisationsClassique = classiquePosts.filter(
    (post) => post.type === "realisation"
  );
  const ventesClassique = classiquePosts.filter((post) => post.type === "vente");

  if (loading) {
    return (
      <div className="Classique">
        <Navbar admin={true} />
        <div className="text-center p-8 text-xl text-gray-700">
          <Loader />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="Classique">
        <Navbar admin={true} />
        <div className="text-center p-8 text-red-600 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="Classique">
      <Navbar admin={true}></Navbar>

      <div className="container mx-auto p-6">
        <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-8">
          Constructions Classiques
        </h1>

        <div className="flex justify-center space-x-4 mb-10">
          <button
            onClick={() => scrollToSection(realisationsRef)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-300 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Nos Réalisations
          </button>
          <button
            onClick={() => scrollToSection(ventesRef)}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg shadow-md hover:bg-orange-700 transition-colors duration-300 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
          >
            Nos Ventes
          </button>
        </div>

        <section ref={realisationsRef} className="mb-12 pt-4" id="realisations-classique-section">
          <h2 className="text-3xl font-bold text-gray-800 border-b-2 border-blue-500 pb-2 mb-6">
            Réalisations Classiques
          </h2>
          {realisationsClassique.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {realisationsClassique.map((post) => (
                <CarteRealisation key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600 text-lg">
              Aucune réalisation classique disponible pour le moment.
            </p>
          )}
        </section>

        <section ref={ventesRef} className="mb-12 pt-4" id="ventes-classique-section">
          <h2 className="text-3xl font-bold text-gray-800 border-b-2 border-orange-500 pb-2 mb-6">
            Ventes Classiques
          </h2>
          {ventesClassique.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ventesClassique.map((post) => (
                <CarteVente key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600 text-lg">
              Aucune vente classique disponible pour le moment.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}