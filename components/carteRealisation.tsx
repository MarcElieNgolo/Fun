import { useState } from "react";

// Définition de l'interface Post
// Le backend envoie 'images' comme un tableau de chaînes.
// Donc, nous n'avons plus besoin de 'imageSources'.
interface Post {
  id: number;
  titre: string;
  description: string;
  images: string[]; // <-- CORRECTION ICI : 'images' est maintenant un tableau de chaînes
  prix?: string; // Peut être présent, donc optionnel
  type: "vente" | "realisation"; // C'est une bonne pratique de typer les littéraux
  sousType?: string; // Peut être optionnel
}

// Adaptez les props pour qu'elles reçoivent un objet 'post' de type 'Post'
type CarteRealisationProps = {
  post: Post;
};

export default function CarteRealisation({ post }: CarteRealisationProps) {
  const [detail, setDetail] = useState<boolean>(false);
  // Utilisez directement post.images
  const [index, setIndex] = useState<number>(0);

  const voirDetail = () => setDetail(!detail);

  // Utilisez post.images pour les longueurs et les accès
  const suivant = () => {
    // Vérifier si post.images existe et n'est pas vide avant d'accéder à .length
    if (post.images && index < post.images.length - 1) {
      setIndex(index + 1);
    } else if (post.images && post.images.length > 0) { // Si on est à la fin, revenir au début
      setIndex(0);
    }
  };

  const precedent = () => {
    // Vérifier si post.images existe et n'est pas vide avant d'accéder à .length
    if (post.images && index > 0) {
      setIndex(index - 1);
    } else if (post.images && post.images.length > 0) { // Si on est au début, aller à la fin
      setIndex(post.images.length - 1);
    }
  };

  // Assurez-vous d'avoir une image par défaut au cas où post.images serait vide ou undefined
  // J'ai ajouté une condition plus stricte pour le cas où post.images est undefined/null.
  const currentImage =
    post.images && post.images.length > 0
      ? post.images[index]
      : "/placeholder.jpg"; // Utilisez un chemin absolu si l'image est à la racine de 'public' ou un chemin relatif valide

  const hasMultipleImages = post.images && post.images.length > 1; // Vérifier post.images

  return (
    <>
      <div
        className="w-full max-w-sm mx-auto bg-white rounded-2xl shadow-md overflow-hidden
                           transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl"
      >
        <div className="relative h-48 overflow-hidden">
          <img
            src={currentImage} // Utilisez currentImage ici
            alt={post.titre}
            className="w-full h-full object-cover"
          />

          {/* Badge s’il y a plusieurs images */}
          {hasMultipleImages && (
            <div className="absolute bottom-2 right-2 bg-white text-gray-800 px-3 py-1 text-base font-semibold rounded-full shadow-md">
              {post.images.length} photos{" "}
              {/* Utilisez post.images.length directement */}
            </div>
          )}
        </div>
        <div className="p-4">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            {post.titre}
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            {post.description.length > 90
              ? post.description.slice(0, 90) + "..."
              : post.description}
          </p>
          <button
            className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition duration-300 ease-in-out font-semibold"
            onClick={voirDetail}
          >
            Voir en détail
          </button>
        </div>
      </div>

      {/* Modal détails */}
      {detail && (
        <div className="fixed inset-0 z-50 bg-gray-100 bg-opacity-95 flex items-center justify-center p-4 md:p-8">
          <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 max-w-2xl w-full relative">
            <button
              onClick={voirDetail}
              className="absolute top-4 right-4 text-gray-600 hover:text-red-500 transition-colors duration-200"
              aria-label="Fermer"
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="flex flex-col md:flex-row gap-6 mt-8 md:mt-0">
              <div className="md:w-1/2 flex justify-center items-center flex-col space-y-3">
                <img
                  src={currentImage} // Utilisez currentImage ici aussi
                  alt={post.titre}
                  className="rounded-lg max-h-72 object-cover w-full md:w-auto"
                />
                {hasMultipleImages && (
                  <div className="space-x-3">
                    <button
                      className="bg-gray-200 p-2 rounded-full active:opacity-75"
                      onClick={precedent}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                    </button>
                    <button
                      className="bg-gray-200 p-2 rounded-full active:opacity-75"
                      onClick={suivant}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              <div className="md:w-1/2 text-center md:text-left">
                <h3 className="text-3xl font-extrabold text-gray-900 mb-4">
                  {post.titre}
                </h3>
                <p className="text-gray-700 text-lg leading-relaxed">
                  {post.description}
                </p>
                {/* Ajoutez l'affichage du prix si pertinent pour ce type de carte */}
                {post.type === 'vente' && post.prix && (
                    <p className="text-2xl font-extrabold text-orange-600 mt-4">{post.prix}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}