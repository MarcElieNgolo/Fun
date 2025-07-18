import { useState, useEffect } from "react";
import "./loader.css";

const messages = [
  "Chargement des données…",
  "Recherche des meilleurs résultats…",
  "Construction de l'interface…",
  "Finalisation de l'affichage 🏗️"
];

export default function Loader() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev < messages.length - 1 ? prev + 1 : prev));
    }, 1000); // 1 seconde par étape

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loader-container">
      <div className="spinner"></div>
      <div className="loader-text">
        {messages.slice(0, current + 1).map((msg, index) => (
          <div key={index} className="fade-in">{msg}</div>
        ))}
      </div>
    </div>
  );
}
