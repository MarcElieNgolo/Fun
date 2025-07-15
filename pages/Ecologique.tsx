// src/pages/Ecologique.tsx
import Navbar from "../components/navbar";
import React, { useState, useEffect, useRef } from "react";
import CarteVente from "../components/carteVente";
import CarteRealisation from "../components/carteRealisation";
import Loader from "./../components/loader/loader"

import axios from "axios";

// --- Fonction getAllImageSources (minimale et robuste) ---
// Toujours la même recommandation : idéalement, cette fonction serait dans un fichier utilitaire partagé.
const getAllImageSources = (imagesDataFromDB: string | null | undefined): string[] => {
    if (!imagesDataFromDB || typeof imagesDataFromDB !== 'string') {
        return [];
    }
    try {
        const parsed = JSON.parse(imagesDataFromDB);
        if (Array.isArray(parsed)) {
            return parsed.filter(s => typeof s === 'string' && s.length > 0).map(s => s.startsWith('data:image/') ? s : `data:image/jpeg;base64,${s}`);
        } else if (typeof parsed === 'string' && parsed.length > 0) {
            return [parsed.startsWith('data:image/') ? parsed : `data:image/jpeg;base64,${parsed}`];
        }
    } catch (e) {
        // Fallback simple: si ce n'est pas un JSON valide, tente de traiter comme une seule image
        if (imagesDataFromDB.length > 0) {
            return [imagesDataFromDB.startsWith('data:image/') ? imagesDataFromDB : `data:image/jpeg;base64,${imagesDataFromDB}`];
        }
    }
    return [];
};

// --- Interface Post ---
interface Post {
    id: number;
    titre: string;
    description: string;
    images: string;
    imageSources?: string[];
    prix?: string;
    type: 'vente' | 'realisation'; // 'vente' ou 'realisation'
    sousType?: string;
}

export default function Ecologique() {
    const [allEcologiquePosts, setAllEcologiquePosts] = useState<Post[]>([]); // Tous les posts écologiques
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Références pour les sections (si on veut scroll, sinon on peut les retirer)
    const realisationsSectionRef = useRef<HTMLDivElement>(null);
    const ventesSectionRef = useRef<HTMLDivElement>(null);

    // Fonction de défilement simplifiée
    const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
  if (ref.current) {
    ref.current.scrollIntoView({ behavior: 'smooth' });
  }
};


    useEffect(() => {
        const fetchEcologiquePosts = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get<Post[]>("https://batiproingenieuriebackend.onrender.com/ecologique");
                
                const processedPosts = response.data.map(post => ({
                    ...post,
                    imageSources: getAllImageSources(post.images)
                }));
                
                setAllEcologiquePosts(processedPosts); // Stocke TOUS les posts ici
            } catch (err) {
                console.error("Erreur de chargement des posts écologiques:", err);
                setError("Échec du chargement des projets écologiques.");
            } finally {
                setLoading(false);
            }
        };

        fetchEcologiquePosts();
    }, []);

    if (loading) {
        return (
            <div className="Ecologique">
                <Navbar admin={true} />
                <div className="text-center p-8 text-lg text-gray-700"><Loader></Loader></div>
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
                <section ref={realisationsSectionRef} className="mb-12 pt-4" id="realisations-ecologique-section">
                    <h2 className="text-3xl font-bold text-gray-800 border-b-2 border-green-500 pb-2 mb-6">
                        Réalisations Écologiques
                    </h2>
                    {allEcologiquePosts.filter(post => post.type === 'realisation').length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {allEcologiquePosts
                                .filter(post => post.type === 'realisation') // Filtrage direct ici
                                .map(post => (
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
                <section ref={ventesSectionRef} className="mb-12 pt-4" id="ventes-ecologique-section">
                    <h2 className="text-3xl font-bold text-gray-800 border-b-2 border-yellow-500 pb-2 mb-6">
                        Ventes Écologiques
                    </h2>
                    {allEcologiquePosts.filter(post => post.type === 'vente').length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {allEcologiquePosts
                                .filter(post => post.type === 'vente') // Filtrage direct ici
                                .map(post => (
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