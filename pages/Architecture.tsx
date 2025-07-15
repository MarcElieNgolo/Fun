// Architecture.tsx
import Navbar from "../components/navbar";
import React, { useState, useEffect, useRef } from "react"; // Importez useRef et useCallback
import CarteRealisation from "../components/carteRealisation"; // Assurez-vous que le chemin est correct
import CarteVente from "../components/carteVente"; // Assurez-vous que le chemin est correct
import axios from "axios";
import Loader from "./../components/loader/loader"


// Définition de type pour un post (comme reçu du backend)
interface Post {
    id: number;
    titre: string;
    description: string;
    images: string; // La chaîne JSON de Base64
    prix?: string; // Optionnel
    type: 'vente' | 'realisation'; // 'vente' ou 'realisation'
    sousType?: string; // Optionnel, comme 'Architecture'
}

// Fonction utilitaire pour extraire toutes les sources d'images Base64
// (Celle que nous avons corrigée et améliorée dans Suppression.js,
// vous devrez la réutiliser ou la mettre dans un fichier utilitaire partagé)
const getAllImageSources = (imagesDataFromDB: string | null | undefined): string[] => {
    if (!imagesDataFromDB || typeof imagesDataFromDB !== 'string') {
        return [];
    }

    let trimmedData = imagesDataFromDB.trim();
    let imageSources: string[] = [];

    try {
        let jsonString = trimmedData;

        if (trimmedData.startsWith('"') && trimmedData.endsWith('"')) {
            try {
                const parsedOuter = JSON.parse(trimmedData);
                if (typeof parsedOuter === 'string') {
                    jsonString = parsedOuter;
                } else if (Array.isArray(parsedOuter)) {
                    imageSources = parsedOuter.filter(s => typeof s === 'string' && s.length > 0);
                    return imageSources.map(s => s.startsWith('data:image/') ? s : `data:image/jpeg;base64,${s}`);
                }
            } catch (e) {
                // ignore
            }
        }

        const parsedArray = JSON.parse(jsonString);

        if (Array.isArray(parsedArray)) {
            imageSources = parsedArray.filter(s => typeof s === 'string' && s.length > 0);
        } else {
            console.warn("Le contenu de 'images' n'est pas un tableau JSON valide après parsing initial:", imagesDataFromDB);
            if (typeof parsedArray === 'string' && parsedArray.length > 0) {
                 imageSources = [parsedArray];
            }
        }

    } catch (e) {
        console.error("Erreur critique lors du parsing JSON des images Base64:", e);
        console.error("Données brutes qui ont échoué:", imagesDataFromDB);
        let fallbackString = trimmedData.replace(/^\["|"]$/g, '');
        fallbackString = fallbackString.replace(/\\"/g, '"');
        imageSources = fallbackString.split('","').map(s => s.trim()).filter(s => s.length > 0);
    }

    return imageSources.map(s => {
        if (!s.startsWith('data:image/')) {
            return `data:image/jpeg;base64,${s}`;
        }
        return s;
    }).filter(s => s.startsWith('data:image/'));
};


export default function Architecture() {
    const [allArchitecturePosts, setAllArchitecturePosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Refs pour les sections
    const realisationsRef = useRef<HTMLDivElement>(null);
    const ventesRef = useRef<HTMLDivElement>(null);

    // Fonction pour scroller vers une section
    const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
  if (ref.current) {
    ref.current.scrollIntoView({ behavior: 'smooth' });
  }
};


    // Récupération des données depuis le backend
    useEffect(() => {
        const fetchArchitecturePosts = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get<Post[]>("https://batiproingenieuriebackend.onrender.com/architecture");
                
                // Filtrer les posts pour ne garder que ceux avec sousType 'Architecture'
                const filteredPosts = response.data.filter(
                    (post) => post.sousType && post.sousType.toLowerCase() === 'architecture'
                );

                // Préparer les images pour le frontend
                const processedPosts = filteredPosts.map(post => ({
                    ...post,
                    imageSources: getAllImageSources(post.images) // Utilise la fonction de parsing d'images
                }));

                setAllArchitecturePosts(processedPosts);
            } catch (err) {
                console.error("Erreur lors de la récupération des posts d'architecture:", err);
                setError("Impossible de charger les posts d'architecture. Veuillez réessayer plus tard.");
            } finally {
                setLoading(false);
            }
        };

        fetchArchitecturePosts();
    }, []); // Dépendances vides pour un seul appel au montage

    // Séparer les posts filtrés en réalisations et ventes
    const realisationsArchitecture = allArchitecturePosts.filter(post => post.type === 'realisation');
    const ventesArchitecture = allArchitecturePosts.filter(post => post.type === 'vente');

    if (loading) {
        return (
            <div className="Architecture">
                <Navbar admin={true} />
                <div className="text-center p-8 text-xl"><Loader></Loader></div>
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
            <Navbar admin={true}></Navbar>

            <div className="container mx-auto p-6">
                <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-8">
                    Projets d'Architecture
                </h1>

                {/* Boutons de navigation */}
                <div className="flex justify-center space-x-4 mb-10">
                    <button
                        onClick={() => scrollToSection(realisationsRef)}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-300 text-lg font-semibold"
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

                {/* Section Réalisations */}
                <section ref={realisationsRef} className="mb-12 pt-4" id="realisations-section">
                    <h2 className="text-3xl font-bold text-gray-800 border-b-2 border-blue-500 pb-2 mb-6">
                        Réalisations en Architecture
                    </h2>
                    {realisationsArchitecture.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {realisationsArchitecture.map(post => (
                                <CarteRealisation key={post.id} post={post} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-600 text-lg">
                            Aucune réalisation d'architecture disponible pour le moment.
                        </p>
                    )}
                </section>

                {/* Section Ventes */}
                <section ref={ventesRef} className="mb-12 pt-4" id="ventes-section">
                    <h2 className="text-3xl font-bold text-gray-800 border-b-2 border-orange-500 pb-2 mb-6">
                        Ventes en Architecture
                    </h2>
                    {ventesArchitecture.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {ventesArchitecture.map(post => (
                                <CarteVente key={post.id} post={post} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-600 text-lg">
                            Aucune vente d'architecture disponible pour le moment.
                        </p>
                    )}
                </section>
            </div>
        </div>
    );
}