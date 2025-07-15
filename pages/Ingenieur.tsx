// src/pages/Ingenieur.tsx (Modifié)
import Navbar from "../components/navbar";
import React, { useState, useEffect, useRef, useCallback } from "react";
import CarteVente from "../components/carteVente";
import CarteRealisation from "../components/carteRealisation";
import axios from "axios";
import Loader from "./../components/loader/loader";

// Interface Post - Définition UNIQUE pour CE FICHIER.
// Si vous ne voulez pas de fichier séparé, vous devrez COPIER CETTE DÉFINITION EXACTEMENT
// dans TOUS les autres fichiers qui utilisent "Post" (pages et composants de carte).
interface Post {
    id: number;
    titre: string;
    description: string;
    images: string[]; // <-- CECI DOIT ÊTRE string[] PARTOUT
    prix?: string;
    type: 'vente' | 'realisation';
    sousType?: string;
}

// *** IMPORTANT : La fonction getAllImageSources est SUPPRIMÉE d'ici. ***
// Elle est remplacée par l'attente que le backend envoie 'images' comme string[].
// Si votre backend envoie toujours une chaîne JSON, le problème persiste côté backend.

export default function Ingenieur() {
    const [allIngenieurPosts, setAllIngenieurPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const realisationsSectionRef = useRef<HTMLDivElement>(null);
    const ventesSectionRef = useRef<HTMLDivElement>(null);

    const scrollToSection = useCallback((ref: React.RefObject<HTMLDivElement>) => {
        if (ref.current) {
            ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, []);

    useEffect(() => {
        const fetchIngenieurPosts = async () => {
            setLoading(true);
            setError(null);
            try {
                // S'attend à ce que l'API renvoie des objets où 'images' est déjà un tableau de chaînes
                const response = await axios.get<Post[]>("https://batiproingenieuriebackend.onrender.com/etude");
                setAllIngenieurPosts(response.data);
            } catch (err) {
                console.error("Erreur de chargement des études d'ingénieur:", err);
                setError("Échec du chargement des projets d'études d'ingénieur.");
            } finally {
                setLoading(false);
            }
        };

        fetchIngenieurPosts();
    }, []);

    const realisationsIngenieur = allIngenieurPosts.filter(post => post.type === 'realisation');
    const ventesIngenieur = allIngenieurPosts.filter(post => post.type === 'vente');

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

                {allIngenieurPosts.length === 0 && !loading && !error && (
                    <p className="text-center text-gray-600 text-lg">
                        Aucun projet d'étude d'ingénieur disponible pour le moment dans aucune catégorie.
                    </p>
                )}
            </div>
        </div>
    );
}