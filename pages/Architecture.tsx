// Architecture.tsx
import Navbar from "../components/navbar";
import React, { useState, useEffect, useRef, useCallback } from "react";
import CarteRealisation from "../components/carteRealisation";
import CarteVente from "../components/carteVente";
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

export default function Architecture() {
  const [allPosts, setAllPosts] = useState<Post[]>([]);
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
          "https://batiproingenieuriebackend.onrender.com/architecture"
        );

        // On transforme chaque objet brut en Post typé
        const posts: Post[] = resp.data.map((item) => ({
          id: item.id,
          titre: item.titre,
          description: item.description,
          images: Array.isArray(item.images) ? item.images : [],
          prix: item.prix,
          type: item.type === "vente" ? "vente" : "realisation",
          // Ici on prend le champ JSON "soustype"
          sousType: item.soustype ?? item.sousType
        }));

        setAllPosts(posts);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger les projets. Réessaie plus tard.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const realisations = allPosts.filter((p) => p.type === "realisation");
  const ventes = allPosts.filter((p) => p.type === "vente");

  if (loading) {
    return (
      <div className="Architecture">
        <Navbar admin={true} />
        <div className="text-center p-8 text-xl">
          <Loader />
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
      <Navbar admin={true} />

      <div className="container mx-auto p-6">
        <h1 className="text-4xl font-extrabold text-center mb-8">
          Projets d'Architecture
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
            className="px-6 py-3 bg-orange-500 text-white rounded-lg shadow-md hover:bg-orange-700 transition-colors duration-300 text-lg font-semibold"
          >
            Nos Ventes
          </button>
        </div>

        <section ref={realisationsRef} className="mb-12 pt-4">
          <h2 className="text-3xl font-bold mb-6 border-b-2 border-blue-500 pb-2">
            Réalisations
          </h2>
          {realisations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {realisations.map((post) => (
                <CarteRealisation key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600">
              Aucune réalisation disponible.
            </p>
          )}
        </section>

        <section ref={ventesRef} className="mb-12 pt-4">
          <h2 className="text-3xl font-bold mb-6 border-b-2 border-orange-500 pb-2">
            Ventes
          </h2>
          {ventes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ventes.map((post) => (
                <CarteVente key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600">
              Aucune vente disponible.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
