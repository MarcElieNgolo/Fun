// src/components/carteRealisation.tsx (Modifié)
import React from 'react';

// Définition de l'interface Post - Doit correspondre EXACTEMENT à celle de Ingenieur.tsx.
interface Post {
    id: number;
    titre: string;
    description: string;
    images: string[]; // <-- DOIT ÊTRE string[] PARTOUT
    prix?: string;
    type: 'vente' | 'realisation';
    sousType?: string;
}

interface CarteRealisationProps {
    post: Post;
}

const CarteRealisation: React.FC<CarteRealisationProps> = ({ post }) => {
    const imageUrl = post.images && post.images.length > 0 ? post.images[0] : 'placeholder-image-url.jpg';

    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <img src={imageUrl} alt={post.titre} className="w-full h-48 object-cover" />
            <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{post.titre}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-3">{post.description}</p>
            </div>
        </div>
    );
};

export default CarteRealisation;