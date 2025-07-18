// src/components/VoletVente.tsx (Modifié)

interface Post {
  id: number;
  titre: string;
  description: string;
  images: string;
  prix?: string;
  type: "vente" | "realisation";
  sousType?: string;
}

interface VoletVenteProps {
  ventes: Post[];
  onDelete: (id: number) => void;
}

export default function VoletVente({ ventes, onDelete }: VoletVenteProps) {
  return (
    <div className="space-y-8 p-4">
      <h2 className="text-3xl font-extrabold text-gray-900 border-b-2 border-orange-500 pb-2">
        Nos Ventes Disponibles
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ventes.length > 0 ? (
          ventes.map((post) => (
            <div
              key={post.id}
              className="bg-white shadow-xl rounded-lg overflow-hidden flex flex-col h-full"
            >
              <div className="w-full h-64 bg-gray-100 overflow-hidden">
                <img
                  src={post.images[0] ? post.images[0] : "placeholder.jpg"}
                  alt="image"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {post.titre}{" "}
                  <span className="text-sm font-normal text-gray-500">
                    (ID: {post.id})
                  </span>
                </h3>
                <p className="text-gray-700 text-sm mb-3 flex-grow">
                  {post.description}
                </p>
                {post.prix && (
                  <p className="text-2xl font-extrabold text-orange-600 mt-auto">
                    {post.prix}
                  </p>
                )}
                <button
                  onClick={() => onDelete(post.id)}
                  className="mt-4 w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition duration-300 ease-in-out text-lg font-semibold"
                >
                  Supprimer cette vente
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-600 text-lg">
            Aucune vente à afficher pour le moment.
          </p>
        )}
      </div>
    </div>
  );
}
