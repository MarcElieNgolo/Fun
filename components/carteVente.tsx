// src/components/suppression_outils/vente.tsx
import { useState } from "react";

interface Post {
  id: number;
  titre: string;
  description: string;
  images: string[];
  prix?: string;
  type: "vente" | "realisation";
  sousType?: string;
}

type CarteVenteProps = {
  post: Post;
};

export default function CarteVente({ post }: CarteVenteProps) {
  const [detail, setDetail] = useState(false);
  const [index, setIndex] = useState(0);

  const voirDetail = () => setDetail(!detail);

  const suivant = () => {
    if (post.images && index < post.images.length - 1) {
      setIndex(index + 1);
    } else if (post.images.length > 0) {
      setIndex(0);
    }
  };

  const precedent = () => {
    if (post.images && index > 0) {
      setIndex(index - 1);
    } else if (post.images.length > 0) {
      setIndex(post.images.length - 1);
    }
  };

  const currentImage =
    post.images && post.images.length > 0
      ? post.images[index]
      : "/placeholder.jpg"; // Assurez-vous d'avoir un placeholder.jpg ou utilisez une autre URL par défaut

  const hasMultipleImages = post.images && post.images.length > 1;

  // Numéro de téléphone pour WhatsApp et appel direct (le même que sur votre page d'accueil)
  const phoneNumber = "2250757524050"; 

  // Construction du message WhatsApp avec des retours à la ligne (`%0A`) et sans l'ID
 const whatsappMessage = encodeURIComponent(
  `Bonjour,\n` + // Retour à la ligne après "Bonjour,"
  `Je suis intéressé(e) par l'article suivant :\n` + // Nouvelle phrase pour introduire l'article
  `\n` + // Ligne vide pour aérer
  `*Nom de l'article :* ${post.titre}\n` + // Titre en gras (avec *) et retour à la ligne
  `*Description :* ${post.description}\n` + // Description en gras (avec *) et retour à la ligne
  (post.prix ? `*Prix :* ${post.prix}\n` : '') + // Prix en gras (avec *) et retour à la ligne si présent
  `\n` + // Ligne vide avant la question
  `Est-ce toujours disponible ?` // Question finale
);
  const whatsappLink = `https://wa.me/${phoneNumber}?text=${whatsappMessage}`;
  const callLink = `tel:+${phoneNumber}`;

  return (
    <>
      <div className="w-full max-w-sm mx-auto bg-white rounded-2xl shadow-md overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
        <div className="relative h-48 overflow-hidden">
          <img
            src={currentImage}
            alt={post.titre}
            className="w-full h-full object-cover"
          />
          {hasMultipleImages && (
            <div className="absolute bottom-2 right-2 bg-white text-gray-800 px-3 py-1 text-base font-semibold rounded-full shadow-md">
              {post.images.length} photos
            </div>
          )}
        </div>
        <div className="p-4">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            {post.titre}
          </h2>
          <p className="text-sm text-gray-600 mb-2">
            {post.description.length > 90
              ? post.description.slice(0, 90) + "..."
              : post.description}
          </p>
          {post.prix && (
            <p className="text-lg font-bold text-orange-600 mb-4">{post.prix}</p>
          )}
          
          {/* Boutons de contact DIRECTEMENT SUR LA CARTE */}
          <div className="flex flex-col gap-2 mt-4"> {/* Added mt-4 for spacing from price/desc */}
            <button
              className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition duration-300 ease-in-out font-semibold"
              onClick={voirDetail}
            >
              Voir en détail
            </button>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg text-base shadow-sm hover:shadow-md transition duration-300"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.557-3.845-1.557-5.875 0-6.571 5.358-11.928 11.928-11.928s11.928 5.357 11.928 11.928c0 6.572-5.357 11.929-11.928 11.929h-.001c-1.879 0-3.731-.562-5.32-1.602l-6.162 1.687zm6.559-4.226l-.413-.244c-1.46-1.03-2.31-2.617-2.31-4.39 0-3.834 3.111-6.945 6.945-6.945 1.848 0 3.594.726 4.904 2.036 1.31 1.31 2.036 3.056 2.036 4.904 0 3.835-3.111 6.946-6.945 6.946-1.773 0-3.36-.85-4.39-2.31zM17.436 14.88c-.104-.055-.619-.304-.714-.338-.094-.035-.196-.052-.276.052-.08.104-.308.338-.378.408-.07.07-.13.07-.243.021-.115-.05-.484-.177-1.066-.66-3.858-3.74-3.82-3.856-4.088-4.295-.26-.44-.246-.339-.17-.473.072-.134.16-.245.245-.308.08-.063.174-.153.26-.26.088-.108.1-.186.05-.276-.05-.09-.484-1.16-.661-1.59-.178-.426-.358-.369-.484-.369h-.105c-.13-.002-.276-.002-.422.002-.14.004-.37.057-.56.244-.19.187-.723.702-.723 1.714 0 1.01.741 1.983.846 2.128.105.145 1.405 2.138 3.414 3.059.904.406 1.62.646 2.164.823.545.176.69.143.86.089.17-.053 1.894-.775 2.162-1.636.269-.86.269-.602.196-.737z"></path>
              </svg>
              Contacter sur WhatsApp
            </a>
            <a
              href={callLink}
              className="w-full inline-flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg text-base shadow-sm hover:shadow-md transition duration-300"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.74 21 3 13.26 3 3c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.47.57 3.57.11.35.03.74-.25 1.02L6.62 10.79z"></path>
              </svg>
              Appeler
            </a>
          </div>
          
        </div>
      </div>

      {detail && (
        <div className="fixed inset-0 z-50 bg-gray-100 bg-opacity-95 flex items-center justify-center p-4 md:p-8">
          <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 max-w-2xl w-full relative">
            <button
              onClick={voirDetail}
              className="absolute top-4 right-4 text-gray-600 hover:text-red-500 transition-colors duration-200"
              aria-label="Fermer"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex flex-col md:flex-row gap-6 mt-8 md:mt-0">
              <div className="md:w-1/2 flex justify-center items-center flex-col space-y-3">
                <img
                  src={currentImage}
                  alt={post.titre}
                  className="rounded-lg max-h-72 object-cover w-full md:w-auto"
                />
                {hasMultipleImages && (
                  <div className="space-x-3">
                    <button
                      className="bg-gray-200 p-2 rounded-full active:opacity-75"
                      onClick={precedent}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                    </button>
                    <button
                      className="bg-gray-200 p-2 rounded-full active:opacity-75"
                      onClick={suivant}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                <p className="text-gray-700 text-lg leading-relaxed">{post.description}</p>
                {post.prix && (
                  <p className="text-2xl font-extrabold text-orange-600 mt-4">{post.prix}</p>
                )}

                {/* Boutons de contact dans la MODAL */}
                <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-lg shadow-md hover:shadow-lg transition duration-300 transform hover:-translate-y-0.5"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.557-3.845-1.557-5.875 0-6.571 5.358-11.928 11.928-11.928s11.928 5.357 11.928 11.928c0 6.572-5.357 11.929-11.928 11.929h-.001c-1.879 0-3.731-.562-5.32-1.602l-6.162 1.687zm6.559-4.226l-.413-.244c-1.46-1.03-2.31-2.617-2.31-4.39 0-3.834 3.111-6.945 6.945-6.945 1.848 0 3.594.726 4.904 2.036 1.31 1.31 2.036 3.056 2.036 4.904 0 3.835-3.111 6.946-6.946-6.946-1.773 0-3.36-.85-4.39-2.31zM17.436 14.88c-.104-.055-.619-.304-.714-.338-.094-.035-.196-.052-.276.052-.08.104-.308.338-.378.408-.07.07-.13.07-.243.021-.115-.05-.484-.177-1.066-.66-3.858-3.74-3.82-3.856-4.088-4.295-.26-.44-.246-.339-.17-.473.072-.134.16-.245.245-.308.08-.063.174-.153.26-.26.088-.108.1-.186.05-.276-.05-.09-.484-1.16-.661-1.59-.178-.426-.358-.369-.484-.369h-.105c-.13-.002-.276-.002-.422.002-.14.004-.37.057-.56.244-.19.187-.723.702-.723 1.714 0 1.01.741 1.983.846 2.128.105.145 1.405 2.138 3.414 3.059.904.406 1.62.646 2.164.823.545.176.69.143.86.089.17-.053 1.894-.775 2.162-1.636.269-.86.269-.602.196-.737z"></path>
                    </svg>
                    Contacter sur WhatsApp
                  </a>
                  <a
                    href={callLink}
                    className="inline-flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg text-lg shadow-md hover:shadow-lg transition duration-300 transform hover:-translate-y-0.5"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.74 21 3 13.26 3 3c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.47.57 3.57.11.35.03.74-.25 1.02L6.62 10.79z"></path>
                    </svg>
                    Appeler
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}