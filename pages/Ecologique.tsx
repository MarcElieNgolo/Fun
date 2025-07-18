// src/pages/Ecologique.tsx
import Navbar from "../components/navbar";
import React, { useState, useEffect, useRef, useCallback } from "react";
import CarteVente from "../components/carteVente";
import CarteRealisation from "../components/carteRealisation";
import Loader from "../components/loader/loader";
import axios from "axios";

interface Post {
  id: number;
  titre: string;
  description: string;
  images: string[];
  prix?: string;
  type: "vente" | "realisation";
  sousType?: string;
}

export default function Ecologique() {
  const [posts, setPosts] = useState<Post[]>([]);
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
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);

      try {
        const resp = await axios.get<any[]>(
          "https://batiproingenieuriebackend.onrender.com/ecologique"
        );

        const processed: Post[] = resp.data.map((item) => ({
          id: item.id,
          titre: item.titre,
          description: item.description,
          images: Array.isArray(item.images) ? item.images : [],
          prix: item.prix,
          type: item.type === "vente" ? "vente" : "realisation",
          sousType: item.soustype ?? item.sousType,
        }));

        setPosts(processed);
      } catch (err) {
        console.error("Erreur de chargement des posts écologiques:", err);
        setError("Échec du chargement des projets écologiques.");
      } finally {
        // Micro-délai pour garantir que le loader disparaisse juste après la mise à jour du DOM
        setTimeout(() => setLoading(false), 50);
      }
    };

    fetchPosts();
  }, []);

  const realisations = posts.filter((p) => p.type === "realisation");
  const ventes = posts.filter((p) => p.type === "vente");

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
      <Navbar admin={true} />

      <div className="container mx-auto p-6">
        <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-8">
          Constructions Écologiques
        </h1>

        <div className="flex justify-center space-x-4 mb-10">
          <button
            onClick={() => scrollToSection(realisationsRef)}
            className="px-6 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-colors duration-300 text-lg font-semibold"
          >
            Nos Réalisations
          </button>
          <button
            onClick={() => scrollToSection(ventesRef)}
            className="px-6 py-3 bg-yellow-600 text-white rounded-lg shadow-md hover:bg-yellow-700 transition-colors duration-300 text-lg font-semibold"
          >
            Nos Ventes
          </button>
        </div>

        <section ref={realisationsRef} className="mb-12 pt-4">
          <h2 className="text-3xl font-bold text-gray-800 border-b-2 border-green-500 pb-2 mb-6">
            Réalisations Écologiques
          </h2>
          {realisations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {realisations.map((post) => (
                <CarteRealisation key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600 text-lg">
              Aucune réalisation écologique disponible pour le moment.
            </p>
          )}
        </section>

        <section ref={ventesRef} className="mb-12 pt-4">
          <h2 className="text-3xl font-bold text-gray-800 border-b-2 border-yellow-500 pb-2 mb-6">
            Ventes Écologiques
          </h2>
          {ventes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ventes.map((post) => (
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
