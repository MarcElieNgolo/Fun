// src/pages/Terrain.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import Navbar from "../components/navbar";
import CarteVente from "../components/carteVente";
import CarteRealisation from "../components/carteRealisation";
import Loader from "../components/loader/loader";

interface Post {
  id: number;
  titre: string;
  description: string;
  images: string[];
  prix?: string;
  type: "vente" | "realisation";
  sousType?: string;
}

export default function Terrain() {
  const [allTerrainPosts, setAllTerrainPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const realisationsRef = useRef<HTMLDivElement>(null);
  const ventesRef = useRef<HTMLDivElement>(null);

  const scrollToSection = useCallback(
    (ref: React.RefObject<HTMLDivElement>) => {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    []
  );

  useEffect(() => {
    const fetchTerrainPosts = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get<Post[]>(
          "https://batiproingenieuriebackend.onrender.com/terrain"
        );
        setAllTerrainPosts(response.data);
      } catch (err) {
        console.error("Erreur de chargement des posts Terrain:", err);
        setError("Échec du chargement des projets de terrains.");
      } finally {
        // Micro-délai pour garantir que le loader disparaisse juste après le rendu
        setTimeout(() => setLoading(false), 50);
      }
    };

    fetchTerrainPosts();
  }, []);

  const realisations = allTerrainPosts.filter((p) => p.type === "realisation");
  const ventes = allTerrainPosts.filter((p) => p.type === "vente");

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
      <Navbar admin={true} />

      <div className="container mx-auto p-6">
        <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-8">
          Terrains
        </h1>

        {(realisations.length > 0 || ventes.length > 0) && (
          <div className="flex justify-center space-x-4 mb-10">
            {realisations.length > 0 && (
              <button
                onClick={() => scrollToSection(realisationsRef)}
                className="px-6 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors text-lg font-semibold"
              >
                Nos Réalisations
              </button>
            )}
            {ventes.length > 0 && (
              <button
                onClick={() => scrollToSection(ventesRef)}
                className="px-6 py-3 bg-orange-500 text-white rounded-lg shadow-md hover:bg-purple-700 transition-colors text-lg font-semibold"
              >
                Nos Ventes
              </button>
            )}
          </div>
        )}

        {realisations.length > 0 ? (
          <section
            ref={realisationsRef}
            className="mb-12 pt-4"
            id="realisations-terrain-section"
          >
            <h2 className="text-3xl font-bold text-gray-800 border-b-2 border-indigo-500 pb-2 mb-6">
              Réalisations de Terrains
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {realisations.map((post) => (
                <CarteRealisation key={post.id} post={post} />
              ))}
            </div>
          </section>
        ) : (
          allTerrainPosts.length > 0 && (
            <p className="text-center text-gray-600 text-lg mb-12">
              Aucune réalisation de terrain disponible pour le moment.
            </p>
          )
        )}

        {ventes.length > 0 ? (
          <section
            ref={ventesRef}
            className="mb-12 pt-4"
            id="ventes-terrain-section"
          >
            <h2 className="text-3xl font-bold text-gray-800 border-b-2 border-purple-500 pb-2 mb-6">
              Terrains à Vendre
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ventes.map((post) => (
                <CarteVente key={post.id} post={post} />
              ))}
            </div>
          </section>
        ) : (
          allTerrainPosts.length > 0 && (
            <p className="text-center text-gray-600 text-lg mb-12">
              Aucun terrain à vendre disponible pour le moment.
            </p>
          )
        )}

        {allTerrainPosts.length === 0 && (
          <p className="text-center text-gray-600 text-lg">
            Aucun terrain disponible pour le moment dans aucune catégorie.
          </p>
        )}
      </div>
    </div>
  );
}
