import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import Navbar from "../components/navbar";
import CarteVente from "../components/carteVente";
import CarteRealisation from "../components/carteRealisation";
import Loader from "../components/loader/loader";
import ApiBot from "../components/ApiBot"


interface Post {
  id: number;
  titre: string;
  description: string;
  images: string[];
  prix?: string;
  type: "vente" | "realisation";
  sousType?: string;
}

const POSTS_PER_PAGE = 5; // Nombre d'éléments à charger par requête

export default function Terrain() {
  // Séparer les états pour les réalisations et les ventes de terrains
  const [realisationsTerrain, setRealisationsTerrain] = useState<Post[]>([]);
  const [ventesTerrain, setVentesTerrain] = useState<Post[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination states for Realisations de Terrains
  const [realisationPage, setRealisationPage] = useState(0);
  const [hasMoreRealisations, setHasMoreRealisations] = useState(true);
  const loadingRealisationsRef = useRef<HTMLDivElement>(null); // Ref pour le déclencheur de chargement

  // Pagination states for Ventes de Terrains
  const [ventePage, setVentePage] = useState(0);
  const [hasMoreVentes, setHasMoreVentes] = useState(true);
  const loadingVentesRef = useRef<HTMLDivElement>(null); // Ref pour le déclencheur de chargement

  const realisationsSectionRef = useRef<HTMLDivElement>(null);
  const ventesSectionRef = useRef<HTMLDivElement>(null);

  const scrollToSection = useCallback(
    (ref: React.RefObject<HTMLDivElement>) => {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    []
  );

  const [Api, setApi] = useState<boolean>(false)
  const activeBot = () => {
    setApi(!Api)
  }

  // Fonction pour récupérer les posts avec pagination et filtre par type
  const fetchPosts = useCallback(async (
    postType: "realisation" | "vente", // Indique si on charge des réalisations ou des ventes
    page: number
  ) => {
    setLoading(true);
    setError(null);

    const offset = page * POSTS_PER_PAGE;
    // Le backend /terrain filtre déjà par sousType = 'terrain'
    const backendEndpoint = "https://batiproingenieuriebackend.onrender.com/terrain";

    try {
      const resp = await axios.get<any[]>(
        backendEndpoint,
        {
          params: {
            limit: POSTS_PER_PAGE,
            offset: offset,
          },
        }
      );

      const newPosts: Post[] = resp.data.map((item: any) => ({
        id: item.id,
        titre: item.titre,
        description: item.description,
        images: Array.isArray(item.images) ? item.images : [],
        prix: item.prix,
        type: item.type === "vente" ? "vente" : "realisation", // Assurez-vous que le type est correctement mappé
        sousType: item.soustype ?? item.sousType,
      }));

      // Filtrer les posts reçus par le type demandé (realisation ou vente)
      const filteredNewPosts = newPosts.filter(post => post.type === postType);

      if (postType === "realisation") {
        setRealisationsTerrain((prev) => [...prev, ...filteredNewPosts]);
        setHasMoreRealisations(filteredNewPosts.length === POSTS_PER_PAGE);
      } else { // postType === "vente"
        setVentesTerrain((prev) => [...prev, ...filteredNewPosts]);
        setHasMoreVentes(filteredNewPosts.length === POSTS_PER_PAGE);
      }

    } catch (err) {
      console.error(`Erreur lors de la récupération des posts de terrains de type ${postType}:`, err);
      setError(`Impossible de charger les posts de terrains de type ${postType}. Veuillez réessayer plus tard.`);
    } finally {
      setTimeout(() => setLoading(false), 50);
    }
  }, []); // Dépendances: aucune, car elle utilise des états internes et des refs

  // Initial fetch for realisations and ventes de terrains
  useEffect(() => {
    fetchPosts("realisation", 0); // Récupère la première page des réalisations de terrains
    fetchPosts("vente", 0);       // Récupère la première page des ventes de terrains
  }, [fetchPosts]);

  // Intersection Observer for Realisations de Terrains
  useEffect(() => {
    if (!loadingRealisationsRef.current || !hasMoreRealisations || loading) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMoreRealisations && !loading) {
        setRealisationPage((prevPage) => prevPage + 1);
      }
    }, { threshold: 0.1 }); // Se déclenche quand 10% de l'élément est visible

    observer.observe(loadingRealisationsRef.current);

    return () => {
      if (loadingRealisationsRef.current) {
        observer.unobserve(loadingRealisationsRef.current);
      }
    };
  }, [hasMoreRealisations, loading]); // Relancer quand hasMoreRealisations ou loading change

  // Récupérer plus de réalisations de terrains quand la page change
  useEffect(() => {
    if (realisationPage > 0 && hasMoreRealisations) {
      fetchPosts("realisation", realisationPage);
    }
  }, [realisationPage, fetchPosts, hasMoreRealisations]);

  // Intersection Observer for Ventes de Terrains
  useEffect(() => {
    if (!loadingVentesRef.current || !hasMoreVentes || loading) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMoreVentes && !loading) {
        setVentePage((prevPage) => prevPage + 1);
      }
    }, { threshold: 0.1 });

    observer.observe(loadingVentesRef.current);

    return () => {
      if (loadingVentesRef.current) {
        observer.unobserve(loadingVentesRef.current);
      }
    };
  }, [hasMoreVentes, loading]);

  // Récupérer plus de ventes de terrains quand la page change
  useEffect(() => {
    if (ventePage > 0 && hasMoreVentes) {
      fetchPosts("vente", ventePage);
    }
  }, [ventePage, fetchPosts, hasMoreVentes]);

  // Affichage du loader ou de l'erreur uniquement si aucune donnée n'a encore été chargée
  if (loading && realisationsTerrain.length === 0 && ventesTerrain.length === 0) {
    return (
      <div className="Terrain">
        <Navbar  />
        <div className="text-center p-8 text-lg text-gray-700">
          <Loader />
        </div>
      </div>
    );
  }

  if (error && realisationsTerrain.length === 0 && ventesTerrain.length === 0) {
    return (
      <div className="Terrain">
        <Navbar  />
        <div className="text-center p-8 text-lg text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="Terrain">
      <Navbar  />
      <ApiBot click={Api} cliquer={activeBot}></ApiBot>

      <div className="container mx-auto p-6">
        <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-8">
          Terrains
        </h1>

        {(realisationsTerrain.length > 0 || ventesTerrain.length > 0) && (
          <div className="flex justify-center space-x-4 mb-10">
            {realisationsTerrain.length > 0 && (
              <button
                onClick={() => scrollToSection(realisationsSectionRef)}
                className="px-6 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors text-lg font-semibold"
              >
                Nos Réalisations
              </button>
            )}
            {ventesTerrain.length > 0 && (
              <button
                onClick={() => scrollToSection(ventesSectionRef)}
                className="px-6 py-3 bg-orange-500 text-white rounded-lg shadow-md hover:bg-purple-700 transition-colors text-lg font-semibold"
              >
                Nos Ventes
              </button>
            )}
          </div>
        )}

        {realisationsTerrain.length > 0 ? (
          <section
            ref={realisationsSectionRef}
            className="mb-12 pt-4"
            id="realisations-terrain-section"
          >
            <h2 className="text-3xl font-bold text-gray-800 border-b-2 border-indigo-500 pb-2 mb-6">
              Réalisations de Terrains
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {realisationsTerrain.map((post) => (
                <CarteRealisation key={post.id} post={post} />
              ))}
            </div>
            {/* Loader pour les réalisations quand plus sont en cours de récupération */}
            {hasMoreRealisations && (
              <div ref={loadingRealisationsRef} className="text-center py-4">
                {loading ? <Loader /> : <p className="text-gray-500">Chargement des réalisations de terrains...</p>}
              </div>
            )}
            {!hasMoreRealisations && realisationsTerrain.length > 0 && (
              <p className="text-center text-gray-500 py-4">
                Toutes les réalisations de terrains ont été chargées.
              </p>
            )}
          </section>
        ) : (
          // Message si aucune réalisation n'est disponible après le chargement initial
          !loading && <p className="text-center text-gray-600 text-lg mb-12">
            Aucune réalisation de terrain disponible pour le moment.
          </p>
        )}

        {ventesTerrain.length > 0 ? (
          <section
            ref={ventesSectionRef}
            className="mb-12 pt-4"
            id="ventes-terrain-section"
          >
            <h2 className="text-3xl font-bold text-gray-800 border-b-2 border-purple-500 pb-2 mb-6">
              Terrains à Vendre
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ventesTerrain.map((post) => (
                <CarteVente key={post.id} post={post} />
              ))}
            </div>
            {/* Loader pour les ventes quand plus sont en cours de récupération */}
            {hasMoreVentes && (
              <div ref={loadingVentesRef} className="text-center py-4">
                {loading ? <Loader /> : <p className="text-gray-500">Chargement des terrains à vendre...</p>}
              </div>
            )}
            {!hasMoreVentes && ventesTerrain.length > 0 && (
              <p className="text-center text-gray-500 py-4">
                Tous les terrains à vendre ont été chargés.
              </p>
            )}
          </section>
        ) : (
          // Message si aucune vente n'est disponible après le chargement initial
          !loading && <p className="text-center text-gray-600 text-lg mb-12">
            Aucun terrain à vendre disponible pour le moment.
          </p>
        )}

        {/* Aucun projet trouvé du tout (si les deux listes sont vides après le chargement) */}
        {!loading && realisationsTerrain.length === 0 && ventesTerrain.length === 0 && (
          <p className="text-center text-gray-600 text-lg">
            Aucun terrain disponible pour le moment dans aucune catégorie.
          </p>
        )}
      </div>
    </div>
  );
}
