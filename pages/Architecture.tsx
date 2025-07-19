import Navbar from "../components/navbar";
import React, { useState, useEffect, useRef, useCallback } from "react";
import CarteRealisation from "../components/carteRealisation";
import CarteVente from "../components/carteVente";
import axios from "axios";
import Loader from "../components/loader/loader";
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

export default function Architecture() {
  const [realisations, setRealisations] = useState<Post[]>([]);
  const [ventes, setVentes] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination states for Realisations
  const [realisationPage, setRealisationPage] = useState(0);
  const [hasMoreRealisations, setHasMoreRealisations] = useState(true);
  const loadingRealisationsRef = useRef<HTMLDivElement>(null); // Ref for the loading spinner/trigger for realisations

  // Pagination states for Ventes
  const [ventePage, setVentePage] = useState(0);
  const [hasMoreVentes, setHasMoreVentes] = useState(true);
  const loadingVentesRef = useRef<HTMLDivElement>(null); // Ref for the loading spinner/trigger for ventes

  const realisationsSectionRef = useRef<HTMLDivElement>(null);
  const ventesSectionRef = useRef<HTMLDivElement>(null);

  const scrollToSection = useCallback((ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  // Function to fetch posts with pagination
  const fetchPosts = useCallback(async (
    type: "realisation" | "vente",
    page: number
  ) => {
    setLoading(true);
    setError(null);

    const offset = page * POSTS_PER_PAGE;
    let endpoint = "";

    if (type === "realisation") {
        endpoint = "architecture";
    } else if (type === "vente") {
        endpoint = "terrain";
    }

    try {
      const resp = await axios.get<any[]>(
        `https://batiproingenieuriebackend.onrender.com/${endpoint}`,
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
        type: item.type === "vente" ? "vente" : "realisation",
        sousType: item.soustype ?? item.sousType,
      }));

      // Filtrer les posts reçus par le type demandé (realisation ou vente)
      const filteredNewPosts = newPosts.filter(post => post.type === type);


      if (type === "realisation") {
        setRealisations((prev) => [...prev, ...filteredNewPosts]);
        setHasMoreRealisations(filteredNewPosts.length === POSTS_PER_PAGE);
      } else { // type === "vente"
        setVentes((prev) => [...prev, ...filteredNewPosts]);
        setHasMoreVentes(filteredNewPosts.length === POSTS_PER_PAGE);
      }

    } catch (err) {
      console.error(`Error fetching ${type} posts:`, err);
      setError(`Impossible de charger les projets de ${type}. Réessaie plus tard.`);
    } finally {
      setTimeout(() => setLoading(false), 50); // Small delay for loader
    }
  }, []); // Dependencies: None, as it uses internal states and refs

  // Initial fetch for realisations and ventes
  useEffect(() => {
    fetchPosts("realisation", 0); // Appel avec 2 arguments
    fetchPosts("vente", 0);       // Appel avec 2 arguments
  }, [fetchPosts]);

  // Intersection Observer for Realisations
  useEffect(() => {
    if (!loadingRealisationsRef.current || !hasMoreRealisations || loading) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMoreRealisations && !loading) {
        setRealisationPage((prevPage) => prevPage + 1);
      }
    }, { threshold: 0.1 }); // Trigger when 10% of the element is visible

    observer.observe(loadingRealisationsRef.current);

    return () => {
      if (loadingRealisationsRef.current) {
        observer.unobserve(loadingRealisationsRef.current);
      }
    };
  }, [hasMoreRealisations, loading]);

  // Fetch more realisations when page changes
  useEffect(() => {
    if (realisationPage > 0 && hasMoreRealisations) {
      fetchPosts("realisation", realisationPage);
    }
  }, [realisationPage, fetchPosts, hasMoreRealisations]);

  // Intersection Observer for Ventes
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

  // Fetch more ventes when page changes
  useEffect(() => {
    if (ventePage > 0 && hasMoreVentes) {
      fetchPosts("vente", ventePage);
    }
  }, [ventePage, fetchPosts, hasMoreVentes]);


  const [Api,setApi] = useState<boolean>(false)
  const activeBot = ()=>{
    setApi(!Api)
  }

  if (loading && realisations.length === 0 && ventes.length === 0) {
    return (
      <div className="Architecture">
        <Navbar /> {/* admin={true} retiré */}
        <div className="text-center p-8 text-xl">
          <Loader />
        </div>
      </div>
    );
  }

  if (error && realisations.length === 0 && ventes.length === 0) {
    return (
      <div className="Architecture">
        <Navbar /> {/* admin={true} retiré */}
        <div className="text-center p-8 text-red-600 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="Architecture">
      <Navbar /> {/* admin={true} retiré */}
      <ApiBot click={Api} cliquer={activeBot}></ApiBot>
      <div className="container mx-auto p-6">
        <h1 className="text-4xl font-extrabold text-center mb-8">
          Projets d'Architecture
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
            className="px-6 py-3 bg-orange-500 text-white rounded-lg shadow-md hover:bg-orange-700 transition-colors duration-300 text-lg font-semibold"
          >
            Nos Ventes
          </button>
        </div>

        <section ref={realisationsSectionRef} className="mb-12 pt-4">
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
          {/* Loader for realisations when more are being fetched */}
          {hasMoreRealisations && (
            <div ref={loadingRealisationsRef} className="text-center py-4">
              {loading ? <Loader /> : <p className="text-gray-500">Chargement des réalisations...</p>}
            </div>
          )}
          {!hasMoreRealisations && realisations.length > 0 && (
            <p className="text-center text-gray-500 py-4">
              Toutes les réalisations ont été chargées.
            </p>
          )}
        </section>

        <section ref={ventesSectionRef} className="mb-12 pt-4">
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
          {/* Loader for ventes when more are being fetched */}
          {hasMoreVentes && (
            <div ref={loadingVentesRef} className="text-center py-4">
              {loading ? <Loader /> : <p className="text-gray-500">Chargement des ventes...</p>}
            </div>
          )}
          {!hasMoreVentes && ventes.length > 0 && (
            <p className="text-center text-gray-500 py-4">
              Toutes les ventes ont été chargées.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
