// src/pages/Terrain.tsx
import Navbar from "../components/navbar";
import React, { useState, useEffect, useRef } from "react";
import CarteVente from "../components/carteVente";
import CarteRealisation from "../components/carteRealisation";
import axios from "axios";
import Loader from "./../components/loader/loader"; // Vérifiez que ce chemin est correct

// Fonction utilitaire pour parser les chaînes d'images Base64
// RECOMMANDATION : DÉPLACEZ CETTE FONCTION DANS UN FICHIER UTILITAIRE SÉPARÉ (ex: src/utils/imageUtils.ts)
// ET IMPORTEZ-LA DANS TOUS LES COMPOSANTS QUI EN ONT BESOIN
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

// Interface Post
interface Post {
    id: number;
    titre: string;
    description: string;
    images: string;
    imageSources?: string[];
    prix?: string;
    type: 'vente' | 'realisation';
    sousType?: string; // Sera 'terrain'
}

export default function Terrain() {
    const [allTerrainPosts, setAllTerrainPosts] = useState<Post[]>([]); // Tous les posts "Terrain"
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Références pour les sections Réalisations et Ventes
    const realisationsSectionRef = useRef<HTMLDivElement>(null);
    const ventesSectionRef = useRef<HTMLDivElement>(null);

    // Fonction de défilement
    const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
  if (ref.current) {
    ref.current.scrollIntoView({ behavior: 'smooth' });
  }
};


    useEffect(() => {
        const fetchTerrainPosts = async () => {
            setLoading(true);
            setError(null);
            try {
                // Appel API à la route /terrain
                const response = await axios.get<Post[]>("https://batiproingenieuriebackend.onrender.com/terrain");
                
                const processedPosts = response.data.map(post => ({
                    ...post,
                    imageSources: getAllImageSources(post.images)
                }));
                
                setAllTerrainPosts(processedPosts); // Stocke TOUS les posts "Terrain" ici
            } catch (err) {
                console.error("Erreur de chargement des posts Terrain:", err);
                setError("Échec du chargement des projets de terrains.");
            } finally {
                setLoading(false);
            }
        };

        fetchTerrainPosts();
    }, []);

    // Filtrer les posts pour les sections Réalisations et Ventes
    // Cette étape est faite ici, après que les données soient chargées dans allTerrainPosts
    const realisationsTerrain = allTerrainPosts.filter(post => post.type === 'realisation');
    const ventesTerrain = allTerrainPosts.filter(post => post.type === 'vente');

    // Affichage du Loader pendant le chargement
    if (loading) {
        return (
            <div className="Terrain">
                <Navbar admin={true} />
                <div className="text-center p-8 text-lg text-gray-700">
                    <Loader />
                </div>
            </div>
        );
    }

    // Affichage de l'erreur
    if (error) {
        return (
            <div className="Terrain">
                <Navbar admin={true} />
                <div className="text-center p-8 text-lg text-red-600">{error}</div>
            </div>
        );
    }

    return (
        <div className="Terrain">
            <Navbar admin={true}></Navbar>

            <div className="container mx-auto p-6">
                <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-8">
                    Terrains
                </h1>

                {/* Boutons de navigation (seulement s'il y a des éléments dans la catégorie correspondante) */}
                <div className="flex justify-center space-x-4 mb-10">
                    {realisationsTerrain.length > 0 && (
                        <button
                            onClick={() => scrollToSection(realisationsSectionRef)}
                            className="px-6 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-300 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
                        >
                            Nos Réalisations
                        </button>
                    )}
                    {ventesTerrain.length > 0 && (
                        <button
                            onClick={() => scrollToSection(ventesSectionRef)}
                            className="px-6 py-3 bg-orange-500 text-white rounded-lg shadow-md hover:bg-purple-700 transition-colors duration-300 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                        >
                            Nos Ventes
                        </button>
                    )}
                </div>
                
                {/* Section Réalisations de Terrains */}
                {realisationsTerrain.length > 0 ? (
                    <section ref={realisationsSectionRef} className="mb-12 pt-4" id="realisations-terrain-section">
                        <h2 className="text-3xl font-bold text-gray-800 border-b-2 border-indigo-500 pb-2 mb-6">
                            Réalisations de Terrains
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {realisationsTerrain.map(post => (
                                <CarteRealisation key={post.id} post={post} />
                            ))}
                        </div>
                    </section>
                ) : (
                    // Affiche ce paragraphe si le bouton de réalisations n'était pas présent ou s'il est vide
                    realisationsTerrain.length === 0 && allTerrainPosts.length > 0 && (
                         <p className="text-center text-gray-600 text-lg mb-12">
                             Aucune réalisation de terrain disponible pour le moment.
                         </p>
                    )
                )}

                {/* Section Ventes de Terrains */}
                {ventesTerrain.length > 0 ? (
                    <section ref={ventesSectionRef} className="mb-12 pt-4" id="ventes-terrain-section">
                        <h2 className="text-3xl font-bold text-gray-800 border-b-2 border-purple-500 pb-2 mb-6">
                            Terrains à Vendre
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {ventesTerrain.map(post => (
                                <CarteVente key={post.id} post={post} />
                            ))}
                        </div>
                    </section>
                ) : (
                    // Affiche ce paragraphe si le bouton de ventes n'était pas présent ou s'il est vide
                    ventesTerrain.length === 0 && allTerrainPosts.length > 0 && (
                        <p className="text-center text-gray-600 text-lg mb-12">
                            Aucun terrain à vendre disponible pour le moment.
                        </p>
                    )
                )}

                {/* Message si AUCUN post de terrain (ni vente ni réalisation) n'est chargé du tout */}
                {allTerrainPosts.length === 0 && !loading && !error && (
                    <p className="text-center text-gray-600 text-lg">
                        Aucun terrain disponible pour le moment dans aucune catégorie.
                    </p>
                )}
            </div>
        </div>
    );
}