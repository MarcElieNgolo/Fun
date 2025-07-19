import Navbar from "./../components/navbar"
import ScrollButton from "./../components/scrollbutton"
import ApiBot from "../components/ApiBot"
import { useState } from "react"


export default function Acceuil(){

    const [Api,setApi] = useState<boolean>(false)
    const activeBot = ()=>{
      setApi(!Api)
    }
    return(
        <div className="Acceuil">
            
            <Navbar></Navbar> 
            <ApiBot click={Api} cliquer={activeBot}></ApiBot>
            <header className="bg-gradient-to-r from-orange-500 to-orange-700 text-white py-20 text-center h-screen">
        <div className="container mx-auto px-8 mt-8">
          <h1 className="text-2xl md:text-7xl font-extrabold mb-4 leading-tight drop-shadow-lg">BATI-PRO-INGENIERIE</h1>
          <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
            Votre partenaire d'excellence en Architecture, Ingénierie et Construction Durable en Côte d'Ivoire.
          </p>
          <a href="#contact" className="mt-10 inline-block bg-white text-orange-600 hover:bg-orange-100 font-bold py-4 px-10 rounded-full text-lg shadow-xl transition duration-300">
            Découvrez nos solutions
          </a>
        </div>
      </header>

      {/* Section "À Propos" */}
      <section id="about" className="py-24 bg-gray-50">
        <div className="container mx-auto px-8 text-center">
          <h2 className="text-5xl font-extrabold text-gray-900 mb-8 leading-tight">Qui sommes-nous ?</h2>
          <p className="text-xl text-gray-700 max-w-5xl mx-auto leading-relaxed mb-6">
            BATI-PRO-INGENIERIE est une entreprise de construction dynamique et innovante basée en Côte d'Ivoire, avec son siège social à Cocody Riviera Palmeraie, Cité du Bonheur, un emplacement stratégique au cœur d'Abidjan.
          </p>
          <p className="text-xl text-gray-700 max-w-5xl mx-auto leading-relaxed">
            Spécialisés dans le Bâtiment et les Travaux Publics (BTP), nous offrons des solutions complètes et adaptées aux besoins de nos clients, qu'ils soient publics ou privés. Notre engagement est de fournir des prestations de qualité, respectueuses des délais, des normes de sécurité, et intégrant les enjeux environnementaux pour un développement durable.
          </p>
        </div>
      </section>

      {/* Section "Nos Services" */}
      <section id="services" className="py-24 bg-white">
        <div className="container mx-auto px-8">
          <h2 className="text-5xl font-extrabold text-center text-gray-900 mb-16">Nos Services d'Expertise</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">

            {/* Service: Architecture */}
            <div className="bg-white p-10 rounded-2xl shadow-xl hover:shadow-2xl transition duration-300 transform hover:-translate-y-2 text-center border-t-8 border-orange-500">
              <div className="text-orange-600 mb-6 mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-orange-100">
                <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2 2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Architecture</h3>
              <p className="text-gray-700 leading-relaxed">Conception architecturale moderne, durable et adaptée au contexte ivoirien et africain. Inclut études préliminaires, conception architecturale, dossiers de permis de construire et suivi de chantier.</p>
            </div>

            {/* Service: Études d'Ingénierie */}
            <div className="bg-white p-10 rounded-2xl shadow-xl hover:shadow-2xl transition duration-300 transform hover:-translate-y-2 text-center border-t-8 border-orange-500">
              <div className="text-orange-600 mb-6 mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-orange-100">
                <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Études d'Ingénierie</h3>
              <p className="text-gray-700 leading-relaxed">Analyses et conceptions techniques pour optimiser les projets avant exécution. Inclut études géotechniques, dimensionnement des structures, plans d'exécution et assistance à la maîtrise d'ouvrage.</p>
            </div>

            {/* Service: Construction Classique */}
            <div className="bg-white p-10 rounded-2xl shadow-xl hover:shadow-2xl transition duration-300 transform hover:-translate-y-2 text-center border-t-8 border-orange-500">
              <div className="text-orange-600 mb-6 mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-orange-100">
                <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m-1 4h1m-4-4h1m-1 4h1m-1 4h1m-4-4h1m-1 4h1m-1 4h1m-4-4h1m-1 4h1"></path>
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Construction Classique</h3>
              <p className="text-gray-700 leading-relaxed">Réalisation de tous types de bâtiments (résidentiels, professionnels, infrastructures publiques) et travaux de gros et second œuvre, avec un suivi rigoureux.</p>
            </div>

            {/* Service: Construction Écologique (BTCS) */}
            <div className="bg-white p-10 rounded-2xl shadow-xl hover:shadow-2xl transition duration-300 transform hover:-translate-y-2 text-center border-t-8 border-orange-500">
              <div className="text-orange-600 mb-6 mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-orange-100">
                <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Construction Écologique (BTCS)</h3>
              <p className="text-gray-700 leading-relaxed">Solutions durables avec les Blocs de Terre Comprimée et Stabilisée (BTCS). Nous gérons la fabrication, la conception et la construction, valorisant les performances environnementales et l'économie locale.</p>
            </div>

            {/* Service: Réhabilitation et Rénovation */}
            <div className="bg-white p-10 rounded-2xl shadow-xl hover:shadow-2xl transition duration-300 transform hover:-translate-y-2 text-center border-t-8 border-orange-500">
              <div className="text-orange-600 mb-6 mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-orange-100">
                <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004 12V8m5.356-9H9v4m-4 5h4m-4 9h4m6.356-9H15v4m-4 5h4m-4 9h4m6.356-9H20v4"></path>
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Réhabilitation & Rénovation</h3>
              <p className="text-gray-700 leading-relaxed">Modernisation, transformation et remise à neuf de bâtiments anciens, incluant l'intégration d'extensions en BTCS et la conservation du style architectural traditionnel ou moderne.</p>
            </div>

            {/* Service: Vente de Terrain */}
            <div className="bg-white p-10 rounded-2xl shadow-xl hover:shadow-2xl transition duration-300 transform hover:-translate-y-2 text-center border-t-8 border-orange-500">
              <div className="text-orange-600 mb-6 mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-orange-100">
                <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Vente de Terrain</h3>
              <p className="text-gray-700 leading-relaxed">Nous vous proposons des terrains stratégiquement situés pour vos projets de construction et vous accompagnons tout au long du processus, de l'acquisition à la construction.</p>
            </div>

          </div>
        </div>
      </section>

      {/* Section "Nos Valeurs & Atouts" */}
      <section id="values-advantages" className="py-24 bg-gray-50">
        <div className="container mx-auto px-8 text-center">
          <h2 className="text-5xl font-extrabold text-gray-900 mb-16">Nos Valeurs & Atouts : Votre Satisfaction, Notre Priorité</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {/* Valeur/Atout 1: Transparence & Qualité */}
            <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition duration-300 transform hover:-translate-y-2">
              <div className="text-orange-600 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Transparence & Qualité</h3>
              <p className="text-gray-700 leading-relaxed">Nous nous engageons à offrir des prestations de qualité supérieure, respectueuses des délais et des normes de sécurité, en toute transparence avec nos clients.</p>
            </div>
            {/* Valeur/Atout 2: Professionnalisme & Innovation */}
            <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition duration-300 transform hover:-translate-y-2">
              <div className="text-orange-600 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 19V5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Professionnalisme & Innovation</h3>
              <p className="text-gray-700 leading-relaxed">Nous misons sur l'innovation technique, l'expertise sur mesure et un savoir-faire reconnu pour construire durablement et anticiper les besoins du marché.</p>
            </div>
            {/* Valeur/Atout 3: Expertise & Proximité Client */}
            <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition duration-300 transform hover:-translate-y-2">
              <div className="text-orange-600 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H2m2-2v.001M10 10H2m2-2v.001m9-1h-1M2 14h6m-4 0v.001m-3 6h6"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Expertise & Suivi Personnalisé</h3>
              <p className="text-gray-700 leading-relaxed">Dotés d'équipements de pointe et d'une équipe jeune et dynamique, nous assurons un suivi rapproché et plaçons la satisfaction client au cœur de nos stratégies.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section "Notre Mission & Vision" */}
      <section id="mission-vision" className="py-24 bg-white">
        <div className="container mx-auto px-8 text-center">
          <h2 className="text-5xl font-extrabold text-gray-900 mb-16">Notre Mission et Vision</h2>
          <div className="flex flex-col md:flex-row justify-center items-stretch md:space-x-16 space-y-12 md:space-y-0">
            {/* Mission Card */}
            <div className="bg-orange-50 p-10 rounded-2xl shadow-xl max-w-xl w-full flex flex-col justify-between">
              <h3 className="text-4xl font-bold text-orange-700 mb-6">Notre Mission</h3>
              <p className="text-gray-800 text-lg leading-relaxed">
                Fournir des solutions de construction innovantes et durables pour améliorer les infrastructures sur le territoire ivoirien.
              </p>
            </div>
            {/* Vision Card */}
            <div className="bg-orange-50 p-10 rounded-2xl shadow-xl max-w-xl w-full flex flex-col justify-between">
              <h3 className="text-4xl font-bold text-orange-700 mb-6">Notre Vision</h3>
              <p className="text-gray-800 text-lg leading-relaxed">
                Être un acteur de référence en construction durable et en ingénierie du bâtiment en Côte d'Ivoire et en Afrique de l'Ouest, contribuant au développement socio-économique et à l'amélioration du cadre de vie. Nous aspirons à devenir le leader du BTP en Afrique, reconnu pour la qualité et la durabilité de nos projets.
              </p>
            </div>
          </div>
        </div>
      </section>

    <section id="contact" className="py-24 bg-gray-900 text-white text-center">
      <div className="container mx-auto px-8">
        <h2 className="text-5xl font-extrabold mb-8 leading-tight drop-shadow">Prêt à Bâtir Votre Projet ?</h2>
        <p className="text-2xl mb-10 max-w-4xl mx-auto opacity-90">
          Contactez BATI-PRO-INGENIERIE dès aujourd'hui pour discuter de vos besoins en architecture, ingénierie et construction.
        </p>

        {/* Bouton WhatsApp */}
        <a 
          href="https://wa.me/2250757524050?text=Bonjour%20Monsieur%2FMadame%2C%20je%20souhaite%20obtenir%20des%20renseignements%20concernant%20vos%20services." 
          target="_blank" 
          rel="noopener noreferrer" // Bonne pratique pour target="_blank"
          className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-bold py-5 px-14 rounded-full text-xl shadow-lg hover:shadow-xl 
                     transition duration-300 transform hover:-translate-y-1 active:opacity-75" // Ajusté pour des classes Tailwind valides
        >
          Contactez-nous sur WhatsApp
        </a>

        {/* Lien Facebook */}
        <p className="mt-8 text-2xl mb-4 max-w-4xl mx-auto opacity-90">
          Suivez-nous sur les réseaux sociaux :
        </p>
        <a 
          href="https://www.facebook.com/profile.php?id=61555187213086" 
          target="_blank" 
          rel="noopener noreferrer" // Bonne pratique pour target="_blank"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-full text-lg shadow-lg hover:shadow-xl 
                     transition duration-300 transform hover:-translate-y-1"
        >
          Découvrez notre page Facebook
        </a>

        {/* Numéros de téléphone */}
        <p className="mt-6 text-lg opacity-80 p-2">
          Ou appelez-nous : 
          
        </p>
        <a href="tel:+2250757524050" 
             className=" bg-green-600 text-sm hover:bg-green-700 text-white p-2 rounded-full ml-2 active:opacity-75 transition duration-300">
            +225 07 57 52 40 50
          </a>
      </div>
    </section>

      {/* Pied de page */}
      <footer className="bg-gray-950 text-gray-400 py-8 text-center border-t border-gray-800">
        <div className="container mx-auto px-8">
          <p>&copy; 2025 BATI-PRO-INGENIERIE. Tous droits réservés.</p>
          <p className="text-sm mt-2">Situé à Cocody Riviera Palmeraie, Cité du Bonheur, Abidjan, Côte d'Ivoire.</p>
        </div>
      </footer>
        <ScrollButton></ScrollButton>

        </div>
    )
}