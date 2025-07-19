import React, { useState } from "react";
import axios from "axios";

type FormData = {
  titre: string;
  description: string;
  images: string[]; // now base64
  prix?: string;
  type: "realisation" | "vente" | "construction"; // Added 'construction' to type
  sousType?: string;
};

export default function FormulairePost() {
  const [formData, setFormData] = useState<FormData>({
    titre: "",
    description: "",
    images: [], // This will now hold at most one image
    prix: "",
    type: "realisation",
    sousType: "",
  });
  const [oui,setoui] = useState<boolean>(false)
  const maxSizeMB = 4; // Maximum image size in MB

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) { // Check if no file was selected
      return;
    }

    // Since we only allow one image, take the first file
    const file = files[0];

    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      alert(`L'image ${file.name} dépasse ${maxSizeMB} Mo et a été ignorée.`);
      // Clear the file input if the image is too large
      e.target.value = '';
      return;
    }

    try {
      const base64 = await toBase64(file);
      // Replace existing image with the new one
      setFormData(prev => ({ ...prev, images: [base64] }));
    } catch (error) {
      console.error("Erreur lors de la conversion de l'image en base64:", error);
      alert("Une erreur est survenue lors du traitement de l'image.");
    }
  };

  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) return reject("Impossible d’obtenir le contexte du canvas");

        ctx.drawImage(img, 0, 0);

        // quality 0.5 (50%) in JPEG
        const base64 = canvas.toDataURL("image/jpeg", 0.5);
        resolve(base64);
      };

      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  // The handleRemoveImage function can still exist, but will now clear the single image
  const handleRemoveImage = () => {
    setFormData({ ...formData, images: [] });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    setoui(true)
    e.preventDefault();
    if (formData.images.length === 0) {
      alert("Ajoute au moins une image.");
      return;
    }

    axios
      .post("https://batiproingenieuriebackend.onrender.com/post", formData)
      .then(response => {
        console.log("Réponse du serveur:", response.data);
        alert("Requête faite avec succès !");
        // Optionally reset the form after successful submission
        setFormData({
            titre: "",
            description: "",
            images: [],
            prix: "",
            type: "realisation",
            sousType: ""
        });
        setoui(false)
      })
      .catch(err => {
        console.error("Erreur lors de la requête POST:", err);
        alert("Une erreur est survenue lors de la soumission de la requête.");
        setoui(false)
      });
  };

  const handleReset = () => {
  setFormData({
    titre: "",
    description: "",
    images: [],
    prix: "",
    type: "realisation",
    sousType: ""
  });
};


  // Updated sousTypes to include 'construction' if needed, otherwise use only 'realisation' and 'vente'
  const sousTypes: Record<string, { value: string; label: string }[]> = {
    realisation: [
      { value: "architecture", label: "Architecture" },
      { value: "construction_ecologique_btsc", label: "Construction écologique (BTSC)" },
      { value: "construction_classique_agglo", label: "Construction classique (agglo)" },
      { value: "terrain", label: "Terrain" },
      { value: "etude", label: "Étude d'ingénieur" },
    ],
    vente: [
      { value: "architecture", label: "Architecture" },
      { value: "construction_ecologique_btsc", label: "Construction écologique (BTSC)" },
      { value: "construction_classique_agglo", label: "Construction classique (agglo)" },
      { value: "terrain", label: "Terrain" },
      { value: "etude", label: "Étude d'ingénieur" },
    ],
    // If 'construction' is a type, you might have specific sub-types for it
    // For now, I'll just add an example, adjust as per your backend logic.
    construction: [
        { value: "maison_neuve", label: "Maison Neuve" },
        { value: "renovation", label: "Rénovation" },
        { value: "batiment_commercial", label: "Bâtiment Commercial" },
    ]
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-lg space-y-6 mt-12">
      {/* Type */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Type</label>
        <select name="type" value={formData.type} onChange={handleChange} className="w-full p-2 border rounded-lg">
          <option value="realisation">Réalisation</option>
          <option value="vente">Vente</option>
          {/* Add construction if it's a valid type for your backend */}
          {/* <option value="construction">Construction</option> */}
        </select>
      </div>

      {/* Sous-type */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Sous-type</label>
        <select
          name="sousType"
          value={formData.sousType}
          onChange={handleChange}
          className="w-full p-2 border rounded-lg"
        >
          <option value="">-- Choisir --</option>
          {sousTypes[formData.type]?.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Titre */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Titre</label>
        <input
          type="text"
          name="titre"
          value={formData.titre}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded-lg"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={4}
          className="w-full p-2 border rounded-lg"
        />
      </div>

      {/* Images - MODIFIED FOR SINGLE IMAGE */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Image (1 seule max)</label>
        <input
          type="file"
          // Removed 'multiple' attribute to restrict to a single file selection
          accept="image/*"
          onChange={handleImageChange}
          className="w-full p-2 border rounded-lg"
        />
        {/* Display the single selected image if available */}
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.images.length > 0 && (
            <div className="relative">
              <img src={formData.images[0]} alt={`Selected Image`} className="w-20 h-20 object-cover rounded" />
              <button
                type="button"
                onClick={handleRemoveImage} // No index needed now, just clear the single image
                className="absolute top-0 right-0 bg-red-600 text-white p-1 rounded-full text-xs"
              >
                ×
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Prix */}
      {formData.type === "vente" && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Prix</label>
          <input
            type="text"
            name="prix"
            value={formData.prix}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-lg"
          />
        </div>
      )}

      {/* Soumettre */}
      <div className="space-y-2">
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition"
          disabled={oui}
        >
          Soumettre
        </button>
        <button
  type="button"
  onClick={handleReset}
  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 transition"
>
  Recommencer
</button>

      </div>
    </form>
  );
}