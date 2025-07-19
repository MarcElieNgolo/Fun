import Navbar from "../components/navbar";
import React, { useState, useEffect, useRef, useCallback } from "react";
import CarteVente from "../components/carteVente";
import CarteRealisation from "../components/carteRealisation";
import Loader from "../components/loader/loader";
import axios from "axios";
import ApiBot from "../components/ApiBot";

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

export default function Ecologique() {
  // Séparer les états pour les réalisations et les ventes écologiques
  const [realisationsEcologique, setRealisationsEcologique] = useState<Post[]>([]);
  const [ventesEcologique, setVentesEcologique] = useState<Post[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination states for Realisations Écologiques
  const [realisationPage, setRealisationPage] = useState(0);
  const [hasMoreRealisations, setHasMoreRealisations] = useState(true);
  const loadingRealisationsRef = useRef<HTMLDivElement>(null); // Ref pour le déclencheur de chargement

  // Pagination states for Ventes Écologiques
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

  const [Api, setApi] = useState<boolean>(false);
  const activeBot = () => {
    setApi(!Api);
  };

  // Fonction pour récupérer les posts avec pagination et filtre par type
  const fetchPosts = useCallback(async (
    postType: "realisation" | "vente", // Indique si on charge des réalisations ou des ventes
    page: number
  ) => {
    setLoading(true);
    setError(null);

    const offset = page * POSTS_PER_PAGE;
    // Le backend /ecologique filtre déjà par sousType = 'construction_ecologique_btsc'
    const backendEndpoint = "https://batiproingenieuriebackend.onrender.com/ecologique";

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
        setRealisationsEcologique((prev) => [...prev, ...filteredNewPosts]);
        setHasMoreRealisations(filteredNewPosts.length === POSTS_PER_PAGE);
      } else { // postType === "vente"
        setVentesEcologique((prev) => [...prev, ...filteredNewPosts]);
        setHasMoreVentes(filteredNewPosts.length === POSTS_PER_PAGE);
      }

    } catch (err) {
      console.error(`Erreur lors de la récupération des posts écologiques de type ${postType}:`, err);
      setError(`Impossible de charger les posts écologiques de type ${postType}. Veuillez réessayer plus tard.`);
    } finally {
      setTimeout(() => setLoading(false), 50);
    }
  }, []); // Dépendances: aucune, car elle utilise des états internes et des refs

  // Initial fetch for realisations and ventes écologiques
  useEffect(() => {
    fetchPosts("realisation", 0); // Récupère la première page des réalisations écologiques
    fetchPosts("vente", 0);       // Récupère la première page des ventes écologiques
  }, [fetchPosts]);

  // Intersection Observer for Realisations Écologiques
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

  // Récupérer plus de réalisations écologiques quand la page change
  useEffect(() => {
    if (realisationPage > 0 && hasMoreRealisations) {
      fetchPosts("realisation", realisationPage);
    }
  }, [realisationPage, fetchPosts, hasMoreRealisations]);

  // Intersection Observer for Ventes Écologiques
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

  // Récupérer plus de ventes écologiques quand la page change
  useEffect(() => {
    if (ventePage > 0 && hasMoreVentes) {
      fetchPosts("vente", ventePage);
    }
  }, [ventePage, fetchPosts, hasMoreVentes]);

  // Affichage du loader ou de l'erreur uniquement si aucune donnée n'a encore été chargée
  if (loading && realisationsEcologique.length === 0 && ventesEcologique.length === 0) {
    return (
      <div className="Ecologique">
        <Navbar />
        <div className="text-center p-8 text-lg text-gray-700">
          <Loader />
        </div>
      </div>
    );
  }

  if (error && realisationsEcologique.length === 0 && ventesEcologique.length === 0) {
    return (
      <div className="Ecologique">
        <Navbar />
        <div className="text-center p-8 text-lg text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="Ecologique">
      <Navbar />
      <ApiBot click={Api} cliquer={activeBot}></ApiBot>

      <div className="container mx-auto p-6">
        <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-8">
          Constructions Écologiques
        </h1>

        <div className="flex justify-center space-x-4 mb-10">
          <button
            onClick={() => scrollToSection(realisationsSectionRef)}
            className="px-6 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-colors duration-300 text-lg font-semibold"
          >
            Nos Réalisations
          </button>
          <button
            onClick={() => scrollToSection(ventesSectionRef)}
            className="px-6 py-3 bg-yellow-600 text-white rounded-lg shadow-md hover:bg-yellow-700 transition-colors duration-300 text-lg font-semibold"
          >
            Nos Ventes
          </button>
        </div>

        <section ref={realisationsSectionRef} className="mb-12 pt-4">
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
          {/* Loader pour les réalisations quand plus sont en cours de récupération */}
          {hasMoreRealisations && (
            <div ref={loadingRealisationsRef} className="text-center py-4">
              {loading ? <Loader /> : <p className="text-gray-500">Chargement des réalisations écologiques...</p>}
            </div>
          )}
          {!hasMoreRealisations && realisationsEcologique.length > 0 && (
            <p className="text-center text-gray-500 py-4">
              Toutes les réalisations écologiques ont été chargées.
            </p>
          )}
        </section>

        <section ref={ventesSectionRef} className="mb-12 pt-4">
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
          {/* Loader pour les ventes quand plus sont en cours de récupération */}
          {hasMoreVentes && (
            <div ref={loadingVentesRef} className="text-center py-4">
              {loading ? <Loader /> : <p className="text-gray-500">Chargement des ventes écologiques...</p>}
            </div>
          )}
          {!hasMoreVentes && ventesEcologique.length > 0 && (
            <p className="text-center text-gray-500 py-4">
              Toutes les ventes écologiques ont été chargées.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
