// src/pages/Classique.tsx
import Navbar from "../components/navbar";
import React, { useState, useEffect, useRef, useCallback } from "react";
import CarteVente from "../components/carteVente";
import CarteRealisation from "../components/carteRealisation";
import axios from "axios";
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

export default function Classique() {
  const [classiquePosts, setClassiquePosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const realisationsRef = useRef<HTMLDivElement>(null);
  const ventesRef = useRef<HTMLDivElement>(null);

  const scrollToSection = useCallback((ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await axios.get<any[]>(
          "https://batiproingenieuriebackend.onrender.com/classique"
        );

        const posts: Post[] = resp.data.map((item) => ({
          id: item.id,
          titre: item.titre,
          description: item.description,
          images: Array.isArray(item.images) ? item.images : [],
          prix: item.prix,
          type: item.type === "vente" ? "vente" : "realisation",
          sousType: item.soustype ?? item.sousType,
        }));

        setClassiquePosts(posts);
      } catch (err) {
        console.error("Erreur lors de la récupération des posts classiques:", err);
        setError(
          "Impossible de charger les posts classiques. Veuillez réessayer plus tard."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const realisationsClassique = classiquePosts.filter(
    (post) => post.type === "realisation"
  );
  const ventesClassique = classiquePosts.filter(
    (post) => post.type === "vente"
  );

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
      <Navbar admin={true} />

      <div className="container mx-auto p-6">
        <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-8">
          Constructions Classiques
        </h1>

        <div className="flex justify-center space-x-4 mb-10">
          <button
            onClick={() => scrollToSection(realisationsRef)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-300 text-lg font-semibold"
          >
            Nos Réalisations
          </button>
          <button
            onClick={() => scrollToSection(ventesRef)}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg shadow-md hover:bg-orange-700 transition-colors duration-300 text-lg font-semibold"
          >
            Nos Ventes
          </button>
        </div>

        <section ref={realisationsRef} className="mb-12 pt-4">
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

        <section ref={ventesRef} className="mb-12 pt-4">
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
