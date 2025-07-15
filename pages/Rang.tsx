// src/pages/Rang.tsx
import Navbar from "../components/navbar";
import React, { useState, useCallback } from "react"; // Importez useCallback
import Choix from "../components/choixpersonnalite";
import Formulaire from "../components/formulaire";
import ChoixAdmin from "../components/choixDadmin";
import Back from "../components/backBouton";
import FormulairePost from "../components/poster";
import Suppression from "../components/supprimer";

// Définition des différentes étapes de l'interface d'administration
type AdminStep =
  | "choixPersonnel" // L'utilisateur choisit entre client et admin
  | "login" // L'administrateur se connecte
  | "adminActions" // L'administrateur choisit de poster ou supprimer
  | "createPost" // L'administrateur est sur le formulaire de création de post
  | "deletePost"; // L'administrateur est sur l'interface de suppression

export default function Rang() {
  // L'état principal pour contrôler la vue affichée
  const [currentStep, setCurrentStep] = useState<AdminStep>("choixPersonnel");
  // L'état pour savoir si l'administrateur est connecté
  const [isAdminConnected, setIsAdminConnected] = useState<boolean>(false);

  // Récupération des variables d'environnement (vérifiez que .env est bien configuré)
  const ADMIN_NAME = import.meta.env.VITE_ADMIN_NAME;
  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

  // Fonctions de transition d'état, utilisant useCallback pour l'optimisation

  const handleAdminChoice = useCallback(() => {
    setCurrentStep("login");
  }, []);

  const handlePostAction = useCallback(() => {
    setCurrentStep("createPost");
  }, []);

  const handleDeleteAction = useCallback(() => {
    setCurrentStep("deletePost");
  }, []);

  // Fonction de soumission du formulaire de connexion
  const handleLoginSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const nomEntree = (
        e.currentTarget.querySelector('input[name="nom"]') as HTMLInputElement
      )?.value;
      const passwordEntree = (
        e.currentTarget.querySelector(
          'input[name="password"]'
        ) as HTMLInputElement
      )?.value;

      if (nomEntree === ADMIN_NAME && passwordEntree === ADMIN_PASSWORD) {
        setIsAdminConnected(true);
        setCurrentStep("adminActions");
        alert("Bienvenue " + nomEntree + ", heureux de vous revoir.");
      } else {
        alert("Nom d'utilisateur ou mot de passe incorrect.");
      }
    },
    [ADMIN_NAME, ADMIN_PASSWORD] // Dépendances pour useCallback
  );

  // Fonction pour revenir en arrière
  const handleBack = useCallback(() => {
    switch (currentStep) {
      case "login":
        setCurrentStep("choixPersonnel");
        break;
      case "adminActions":
        setIsAdminConnected(false); // Se déconnecte en revenant à la page de connexion
        setCurrentStep("login");
        break;
      case "createPost":
      case "deletePost":
        setCurrentStep("adminActions");
        break;
      default:
        // Pour les cas inattendus, revenir à l'écran de choix initial
        setCurrentStep("choixPersonnel");
        setIsAdminConnected(false);
        break;
    }
  }, [currentStep]); // Dépendance: currentStep pour la logique de retour

  return (
    <div className="admin">
      {/* La Navbar n'apparaît que si l'admin est connecté */}
      {isAdminConnected && <Navbar admin={true}></Navbar>}

      {/* Rendu conditionnel basé sur l'état `currentStep` */}
      {currentStep === "choixPersonnel" && (
        <Choix Admin={handleAdminChoice}></Choix>
      )}

      {currentStep === "login" && (
        <div className="formulaire">
          <Formulaire Valid={handleLoginSubmit}></Formulaire>
          <Back click={handleBack}></Back>
        </div>
      )}

      {currentStep === "adminActions" && (
        <div className="action">
          <ChoixAdmin post={handlePostAction} suppr={handleDeleteAction}></ChoixAdmin>
          <Back click={handleBack}></Back>
        </div>
      )}

      {currentStep === "createPost" && (
        <div className="post">
          <FormulairePost></FormulairePost>
          <Back click={handleBack}></Back>
        </div>
      )}

      {currentStep === "deletePost" && (
        <div className="supression">
          <Suppression></Suppression>
          <Back click={handleBack}></Back>
        </div>
      )}
    </div>
  );
}