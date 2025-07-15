// src/pages/Classique.tsx
import Navbar from "../components/navbar";
import React, { useState, useEffect, useRef } from "react";
import CarteVente from "../components/carteVente";
import CarteRealisation from "../components/carteRealisation";
import axios from "axios";
import Loader from "./../components/loader/loader"


// Si cette fonction est dans un fichier utilitaire, importez-la !
// Exemple: import { getAllImageSources } from '../utils/imageUtils';
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
            } catch (e) { /* ignore */ }
        }

        const parsedArray = JSON.parse(jsonString);

        if (Array.isArray(parsedArray)) {
            imageSources = parsedArray.filter(s => typeof s === 'string' && s.length > 0);
        } else {
            if (typeof parsedArray === 'string' && parsedArray.length > 0) {
                 imageSources = [parsedArray];
            }
        }

    } catch (e) {
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

interface Post {
    id: number;
    titre: string;
    description: string;
    images: string;
    imageSources?: string[];
    prix?: string;
    type: 'vente' | 'realisation';
    sousType?: string;
}

export default function Classique() {
    const [classiquePosts, setClassiquePosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const realisationsRef = useRef<HTMLDivElement>(null);
    const ventesRef = useRef<HTMLDivElement>(null);

    const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
  if (ref.current) {
    ref.current.scrollIntoView({ behavior: 'smooth' });
  }
};


    useEffect(() => {
        const fetchClassiquePosts = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get<Post[]>("https://batiproingenieuriebackend.onrender.com/classique");
                
                const processedPosts = response.data.map(post => ({
                    ...post,
                    imageSources: getAllImageSources(post.images)
                }));
                
                setClassiquePosts(processedPosts);
            } catch (err) {
                setError("Impossible de charger les posts classiques. Veuillez réessayer plus tard.");
            } finally {
                setLoading(false);
            }
        };

        fetchClassiquePosts();
    }, []);

    const realisationsClassique = classiquePosts.filter(post => post.type === 'realisation');
    const ventesClassique = classiquePosts.filter(post => post.type === 'vente');

    if (loading) {
        return (
            <div className="Classique">
                <Navbar admin={true} />
                <div className="text-center p-8 text-xl text-gray-700"><Loader></Loader></div>
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
            <Navbar admin={true}></Navbar>

            <div className="container mx-auto p-6">
                <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-8">
                    Constructions Classiques
                </h1>

                <div className="flex justify-center space-x-4 mb-10">
                    <button
                        onClick={() => scrollToSection(realisationsRef)}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-300 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    >
                        Nos Réalisations
                    </button>
                    <button
                        onClick={() => scrollToSection(ventesRef)}
                        className="px-6 py-3 bg-orange-600 text-white rounded-lg shadow-md hover:bg-orange-700 transition-colors duration-300 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
                    >
                        Nos Ventes
                    </button>
                </div>

                <section ref={realisationsRef} className="mb-12 pt-4" id="realisations-classique-section">
                    <h2 className="text-3xl font-bold text-gray-800 border-b-2 border-blue-500 pb-2 mb-6">
                        Réalisations Classiques
                    </h2>
                    {realisationsClassique.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {realisationsClassique.map(post => (
                                <CarteRealisation key={post.id} post={post} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-600 text-lg">
                            Aucune réalisation classique disponible pour le moment.
                        </p>
                    )}
                </section>

                <section ref={ventesRef} className="mb-12 pt-4" id="ventes-classique-section">
                    <h2 className="text-3xl font-bold text-gray-800 border-b-2 border-orange-500 pb-2 mb-6">
                        Ventes Classiques
                    </h2>
                    {ventesClassique.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {ventesClassique.map(post => (
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