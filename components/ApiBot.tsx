import { useState, useEffect } from "react"
import Bot from "./bot/Bot"

type botApiType = {
    click: boolean;
    cliquer: () => void;
}

export default function ApiBot({ click, cliquer }: botApiType) {
    const [text, setText] = useState<string>("");
     const phrases = [
        "Bienvenue !", 
        "Coucou !", 
        "Salut !", 
        "Besoin d'aide ?", 
        "Je suis là !",
        "Bonjour ! Comment puis-je vous assister ?", // Nouvelle phrase
        "N'hésitez pas si vous avez des questions !", // Nouvelle phrase
        "Ravi de vous voir !", // Nouvelle phrase
        "Un projet en tête ? Parlons-en !" // Nouvelle phrase
    ];

    useEffect(() => {
            setText(phrases[Math.floor(Math.random() * phrases.length)])
    }, []);

    return ( 
        <div className="mybot">
            {!click && (
                // Conteneur du bouton et du texte, positionné en haut à droite.
                // Le bouton est initialement à moitié caché, le message est toujours visible.
                // 'group' permet d'appliquer des styles au survol du parent sur ses enfants.
                <div 
                    className="fixed mt-8 right-0 z-92 flex flex-col items-end transition-all duration-300 ease-in-out group"
                >
                    {text && ( // Le paragraphe est toujours affiché s'il y a du texte
                        <p className="bg-white text-gray-800 text-sm px-3 py-1 rounded-lg mb-2 shadow-lg max-w-xs text-right animate-fade-in-right">
                            {text}
                        </p>
                    )}
                    <button
                        // Le bouton est translaté de 50% de sa propre largeur vers la droite initialement.
                        // Au survol du groupe parent, il revient à sa position normale (translate-x-0).
                        className="h-16 w-16 rounded-full bg-white text-blue-600 flex items-center justify-center text-3xl cursor-pointer shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 translate-x-1/2 group-hover:translate-x-0 animate-bounce-in"
                        type="button"
                        onClick={cliquer}
                        title="Ouvrir le chat BATI-BOT"
                    >
                        🤖
                    </button>
                </div> 
            )}

            {click && (
                <div className="z-92 inset-0 fixed h-screen w-screen bg-white flex flex-col">
                    <div className="absolute top-4 right-4 z-93">
                        <button
                            type="button"
                            onClick={cliquer}
                            className="text-white bg-red-500 hover:bg-red-600 rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold shadow-md transition-colors duration-200"
                            title="Fermer le chat"
                        >
                            X
                        </button>
                    </div>
                    <div className="flex-1 p-4 pt-16 h-full overflow-y-auto">
                        <Bot />
                    </div>
                </div>
            )}
        </div>
    );
}
