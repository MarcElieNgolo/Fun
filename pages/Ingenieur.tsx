// src/pages/Ingenieur.tsx
import Navbar from "../components/navbar";
import React, { useState, useEffect, useRef } from "react";
import CarteVente from "../components/carteVente";
import CarteRealisation from "../components/carteRealisation";
import axios from "axios";
import Loader from "./../components/loader/loader"; // Verify this path is correct for your Loader component

// Utility function to parse Base64 image strings
// RECOMMENDATION: Extract this function to a shared utility file (e.g., src/utils/imageUtils.ts)
// and import it wherever needed (Architecture, Classique, Ecologique, Terrain, Ingenieur, etc.)
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
        if (imagesDataFromDB.length > 0) {
            return [imagesDataFromDB.startsWith('data:image/') ? imagesDataFromDB : `data:image/jpeg;base64,${imagesDataFromDB}`];
        }
    }
    return [];
};

// Post Interface
interface Post {
    id: number;
    titre: string;
    description: string;
    images: string;
    imageSources?: string[];
    prix?: string;
    type: 'vente' | 'realisation'; // Projects can be 'vente' or 'realisation'
    sousType?: string; // Will be 'ingenieur' or similar
}

export default function Ingenieur() {
    const [allIngenieurPosts, setAllIngenieurPosts] = useState<Post[]>([]); // All 'Ingenieur' posts
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // References for 'Réalisations' and 'Ventes' sections
    const realisationsSectionRef = useRef<HTMLDivElement>(null);
    const ventesSectionRef = useRef<HTMLDivElement>(null);

    // Scroll function
    const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
  if (ref.current) {
    ref.current.scrollIntoView({ behavior: 'smooth' });
  }
};


    useEffect(() => {
        const fetchIngenieurPosts = async () => {
            setLoading(true);
            setError(null);
            try {
                // API call to the /ingenieur route (adjust if your backend uses a different name)
                const response = await axios.get<Post[]>("https://batiproingenieuriebackend.onrender.com/etude");
                
                const processedPosts = response.data.map(post => ({
                    ...post,
                    imageSources: getAllImageSources(post.images)
                }));
                
                setAllIngenieurPosts(processedPosts); // Store all 'Ingenieur' posts here
            } catch (err) {
                console.error("Erreur de chargement des études d'ingénieur:", err);
                setError("Échec du chargement des projets d'études d'ingénieur.");
            } finally {
                setLoading(false);
            }
        };

        fetchIngenieurPosts();
    }, []);

    // Filter posts for 'Réalisations' and 'Ventes' sections
    const realisationsIngenieur = allIngenieurPosts.filter(post => post.type === 'realisation');
    const ventesIngenieur = allIngenieurPosts.filter(post => post.type === 'vente');

    // Display Loader during loading
    if (loading) {
        return (
            <div className="Ingenieur">
                <Navbar admin={true} />
                <div className="text-center p-8 text-lg text-gray-700">
                    <Loader />
                </div>
            </div>
        );
    }

    // Display error message
    if (error) {
        return (
            <div className="Ingenieur">
                <Navbar admin={true} />
                <div className="text-center p-8 text-lg text-red-600">{error}</div>
            </div>
        );
    }

    return (
        <div className="Ingenieur">
            <Navbar admin={true}></Navbar>

            <div className="container mx-auto p-6">
                <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-8">
                    Étude d'Ingénieur
                </h1>

                {/* Navigation buttons (only if corresponding category has items) */}
                <div className="flex justify-center space-x-4 mb-10">
                    {realisationsIngenieur.length > 0 && (
                        <button
                            onClick={() => scrollToSection(realisationsSectionRef)}
                            className="px-6 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-300 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                        >
                            Nos Réalisations
                        </button>
                    )}
                    {ventesIngenieur.length > 0 && (
                        <button
                            onClick={() => scrollToSection(ventesSectionRef)}
                            className="px-6 py-3 bg-orange-500 text-white rounded-lg shadow-md hover:bg-teal-700 transition-colors duration-300 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
                        >
                            Nos Ventes
                        </button>
                    )}
                </div>
                
                {/* Réalisations Section for Étude d'Ingénieur */}
                {realisationsIngenieur.length > 0 ? (
                    <section ref={realisationsSectionRef} className="mb-12 pt-4" id="realisations-ingenieur-section">
                        <h2 className="text-3xl font-bold text-gray-800 border-b-2 border-blue-500 pb-2 mb-6">
                            Réalisations d'Études d'Ingénieur
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {realisationsIngenieur.map(post => (
                                <CarteRealisation key={post.id} post={post} />
                            ))}
                        </div>
                    </section>
                ) : (
                    realisationsIngenieur.length === 0 && allIngenieurPosts.length > 0 && (
                         <p className="text-center text-gray-600 text-lg mb-12">
                             Aucune réalisation d'étude d'ingénieur disponible pour le moment.
                         </p>
                    )
                )}

                {/* Ventes Section for Étude d'Ingénieur */}
                {ventesIngenieur.length > 0 ? (
                    <section ref={ventesSectionRef} className="mb-12 pt-4" id="ventes-ingenieur-section">
                        <h2 className="text-3xl font-bold text-gray-800 border-b-2 border-teal-500 pb-2 mb-6">
                            Ventes d'Études d'Ingénieur
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {ventesIngenieur.map(post => (
                                <CarteVente key={post.id} post={post} />
                            ))}
                        </div>
                    </section>
                ) : (
                    ventesIngenieur.length === 0 && allIngenieurPosts.length > 0 && (
                        <p className="text-center text-gray-600 text-lg mb-12">
                            Aucune vente d'étude d'ingénieur disponible pour le moment.
                        </p>
                    )
                )}

                {/* Message if NO posts at all (neither sales nor realisations) are loaded */}
                {allIngenieurPosts.length === 0 && !loading && !error && (
                    <p className="text-center text-gray-600 text-lg">
                        Aucun projet d'étude d'ingénieur disponible pour le moment dans aucune catégorie.
                    </p>
                )}
            </div>
        </div>
    );
}