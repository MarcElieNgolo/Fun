// components/supprimer.tsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Loader from './loader/loader'; // Assurez-vous que le chemin est correct

// Définition de l'interface Post - COPIE CELLE-CI EXACTEMENT dans tous les fichiers qui utilisent Post
interface Post {
    id: number;
    titre: string;
    description: string;
    images: string[]; // DOIT être string[]
    prix?: string; // Optionnel
    type: 'vente' | 'realisation';
    sousType?: string; // Optionnel
}

// --- Composant ImageSlider (copié ici car il est utilisé par VoletVente et VoletRealisation) ---
// Idéalement, ce composant serait dans un fichier séparé pour éviter la duplication.
interface ImageSliderProps {
    images: string[];
    title: string;
}

const ImageSlider: React.FC<ImageSliderProps> = ({ images, title }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const goToNextImage = useCallback(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, [images.length]);

    const goToPreviousImage = useCallback(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    }, [images.length]);

    const showNavigation = images.length > 1;

    return (
        <div className="relative w-full h-64 bg-gray-100 flex items-center justify-center overflow-hidden">
            <div className="flex items-center justify-center w-full h-full">
                <img
                    src={images[currentImageIndex]}
                    alt={`${title} - Image ${currentImageIndex + 1}`}
                    className="max-w-full max-h-full object-contain"
                />
            </div>

            {showNavigation && (
                <>
                    <button
                        onClick={goToPreviousImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all duration-200 z-10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-75"
                        aria-label="Image précédente"
                    >
                        &lt;
                    </button>
                    <button
                        onClick={goToNextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all duration-200 z-10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-75"
                        aria-label="Image suivante"
                    >
                        &gt;
                    </button>
                </>
            )}

            {showNavigation && (
                <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-1 z-10">
                    {images.map((_, index) => (
                        <span
                            key={index}
                            className={`w-2 h-2 rounded-full ${index === currentImageIndex ? 'bg-white' : 'bg-gray-400'} border border-gray-600 cursor-pointer`}
                            onClick={() => setCurrentImageIndex(index)}
                            aria-label={`Aller à l'image ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};


// --- Composant VoletVente (copié et adapté pour ne pas dépendre d'un import externe) ---
interface VoletVenteProps {
    ventes: Post[];
    onDelete: (id: number) => void;
}

const VoletVente: React.FC<VoletVenteProps> = ({ ventes, onDelete }) => {
    return (
        <div className="space-y-8 p-4">
            <h2 className="text-3xl font-extrabold text-gray-900 border-b-2 border-orange-500 pb-2">
                Nos Ventes Disponibles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ventes.length > 0 ? (
                    ventes.map((post) => {
                        const allImageSources = post.images;

                        return (
                            <div
                                key={post.id}
                                className="bg-white shadow-xl rounded-lg overflow-hidden flex flex-col h-full"
                            >
                                {allImageSources && allImageSources.length > 0 ? (
                                    <ImageSlider images={allImageSources} title={post.titre} />
                                ) : (
                                    <div className="w-full h-64 bg-gray-200 flex items-center justify-center text-gray-500">
                                        Image(s) non disponible(s)
                                    </div>
                                )}

                                <div className="p-5 flex flex-col flex-grow">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        {post.titre} <span className="text-sm font-normal text-gray-500">(ID: {post.id})</span>
                                    </h3>
                                    <p className="text-gray-700 text-sm mb-3 flex-grow">{post.description}</p>
                                    <p className="text-2xl font-extrabold text-orange-600 mt-auto">{post.prix}</p>
                                    <button
                                        onClick={() => onDelete(post.id)}
                                        className="mt-4 w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition duration-300 ease-in-out text-lg font-semibold"
                                    >
                                        Supprimer cette vente
                                    </button>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p className="col-span-full text-center text-gray-600 text-lg">
                        Aucune vente à afficher pour le moment.
                    </p>
                )}
            </div>
        </div>
    );
};

// --- Composant VoletRealisation (créé ici car il est utilisé dans supprimer.tsx) ---
interface VoletRealisationProps {
    realisations: Post[];
    onDelete: (id: number) => void;
}

const VoletRealisation: React.FC<VoletRealisationProps> = ({ realisations, onDelete }) => {
    return (
        <div className="space-y-8 p-4">
            <h2 className="text-3xl font-extrabold text-gray-900 border-b-2 border-green-500 pb-2">
                Nos Réalisations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {realisations.length > 0 ? (
                    realisations.map((post) => (
                        <div key={post.id} className="bg-white shadow-xl rounded-lg overflow-hidden flex flex-col h-full">
                            {post.images && post.images.length > 0 ? (
                                <ImageSlider images={post.images} title={post.titre} />
                            ) : (
                                <div className="w-full h-64 bg-gray-200 flex items-center justify-center text-gray-500">
                                    Image(s) non disponible(s)
                                </div>
                            )}
                            <div className="p-5 flex flex-col flex-grow">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    {post.titre} <span className="text-sm font-normal text-gray-500">(ID: {post.id})</span>
                                </h3>
                                <p className="text-gray-700 text-sm mb-3 flex-grow">{post.description}</p>
                                <button
                                    onClick={() => onDelete(post.id)}
                                    className="mt-4 w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition duration-300 ease-in-out text-lg font-semibold"
                                >
                                    Supprimer cette réalisation
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="col-span-full text-center text-gray-600 text-lg">
                        Aucune réalisation à afficher pour le moment.
                    </p>
                )}
            </div>
        </div>
    );
};


// --- Composant Supprimer principal ---
export default function Supprimer() {
    const [realisations, setRealisations] = useState<Post[]>([]);
    const [ventes, setVentes] = useState<Post[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [filterType, setFilterType] = useState<'all' | 'realisation' | 'vente'>('all');

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const realisationsResponse = await axios.get<Post[]>("https://batiproingenieuriebackend.onrender.com/realisations");
            const ventesResponse = await axios.get<Post[]>("https://batiproingenieuriebackend.onrender.com/ventes");

            setRealisations(realisationsResponse.data);
            setVentes(ventesResponse.data);
        } catch (err) {
            console.error("Error fetching posts:", err);
            setError("Échec du chargement des publications pour la suppression.");
        } finally {
            setLoading(false);
        }
    }, []); // Dépendances vides car fetchPosts n'utilise pas de valeurs de l'extérieur du hook qui pourraient changer

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]); // Dépendance à fetchPosts (qui est memoized par useCallback)

    const handleDelete = async (id: number, type: 'realisation' | 'vente') => {
        try {
            await axios.delete(`https://batiproingenieuriebackend.onrender.com/${type}/${id}`);
            fetchPosts(); // Re-fetch all posts after successful deletion
        } catch (err) {
            console.error(`Error deleting ${type} with ID ${id}:`, err);
            setError(`Échec de la suppression de la ${type}.`);
        }
    };

    const realisationsToDisplay = filterType === 'all' || filterType === 'realisation' ? realisations : [];
    const ventesToDisplay = filterType === 'all' || filterType === 'vente' ? ventes : [];

    if (loading) return <Loader />;
    if (error) return <div className="text-center p-8 text-lg text-red-600">{error}</div>;

    return (
        <div className="Supprimer">
            <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-8">
                Gérer les Publications
            </h1>

            <div className="flex justify-center space-x-4 mb-8">
                <button
                    onClick={() => setFilterType('all')}
                    className={`px-6 py-3 rounded-lg shadow-md text-lg font-semibold ${filterType === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                >
                    Tout afficher
                </button>
                <button
                    onClick={() => setFilterType('realisation')}
                    className={`px-6 py-3 rounded-lg shadow-md text-lg font-semibold ${filterType === 'realisation' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                >
                    Réalisations
                </button>
                <button
                    onClick={() => setFilterType('vente')}
                    className={`px-6 py-3 rounded-lg shadow-md text-lg font-semibold ${filterType === 'vente' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-800'}`}
                >
                    Ventes
                </button>
            </div>

            {realisationsToDisplay.length > 0 && (
                <VoletRealisation
                    realisations={realisationsToDisplay}
                    onDelete={(id: number) => handleDelete(id, 'realisation')}
                />
            )}
            {ventesToDisplay.length > 0 && (
                <VoletVente
                    ventes={ventesToDisplay}
                    onDelete={(id: number) => handleDelete(id, 'vente')}
                />
            )}

            {realisationsToDisplay.length === 0 && ventesToDisplay.length === 0 && (
                <p className="text-center text-gray-600 text-lg mt-8">
                    Aucune publication disponible pour le moment.
                </p>
            )}
        </div>
    );
}