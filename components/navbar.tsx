import { useEffect, useState } from "react"


export default function Navbar(){
    const [tailleImage,setTailleImage] = useState<number>(0)
    const [clickMenu,setclickMenu] = useState<boolean>(false)
    const [constructionType,setConstructionType] = useState<boolean>(false)
     
    
    const menuCliquer = ()=>{
        setclickMenu(!clickMenu)
    }
    const constructionCliquer = ()=>{
        setConstructionType(!constructionType)
    }

    useEffect(()=>{

        const largeurEcran = window.innerWidth
        if(largeurEcran < 640){
            setTailleImage(100)
        }
        else if (largeurEcran < 768){
            setTailleImage(120)
        }
        else if(largeurEcran < 1024){
            setTailleImage(150)
        }
        else{
            setTailleImage(170)
        }
    })
    return(
        <div>
            {/* navbar */}

            <nav className="Navbar flex shadow-lg p-2 ">

            {/* logo */}

            <a className="logo" href="/acceuil">
                <img src="/logo.jpg" alt="logo" width={tailleImage} className="rounded-full " />
            </a>

            {/* menu */}

{/* tablettes , ordis et télé */}
           <ul className="flex items-center space-x-1 ml-auto p-3 mt-6 hidden md:flex">
  <li><a href="/acceuil" className="text-white p-2 bg-gradient-to-r from-orange-400 to-orange-600 font-bold rounded-xl text-sm active:bg-white active:text-orange-500 transition duration-500">Accueil</a></li>

  <li><a href="/architecture" className="text-white p-2 bg-gradient-to-r from-orange-400 to-orange-600 font-bold rounded-xl text-sm active:bg-white active:text-orange-500 transition duration-500">Architecture</a></li>

  <li className="relative">
    <button onClick={constructionCliquer} className="text-white p-2 bg-gradient-to-r from-orange-400 to-orange-600 font-bold rounded-xl text-sm active:bg-white active:text-orange-500 transition duration-500">
      Construction ▾
    </button>

    {constructionType && (
      <ul className="absolute mt-2 bg-white shadow-lg rounded-lg py-2 space-y-1 w-40 z-50">
        <li><a href="/ecologique" className="block px-4 py-2 text-sm text-gray-800 hover:bg-orange-100 transition">Écologique (BTSC) </a></li>
        <li><a href="/classique" className="block px-4 py-2 text-sm text-gray-800 hover:bg-orange-100 transition">Classique (agglo) </a></li>
      </ul>
    )}
  </li>

  <li><a href="/terrain" className="text-white p-2 bg-gradient-to-r from-orange-400 to-orange-600 font-bold rounded-xl text-sm active:bg-white active:text-orange-500 transition duration-500">Terrain</a></li>

  <li><a href="/ingenieur" className="text-white p-2 bg-gradient-to-r from-orange-400 to-orange-600 font-bold rounded-xl text-sm active:bg-white active:text-orange-500 transition duration-500">Étude d'ingénieur</a></li>

</ul>

{/* pour mobile , montre etc... */}
            <button className="md:hidden flex ml-auto mt-3 p-2" onClick={menuCliquer}>
                 <svg className="w-8 h-8" fill="none" stroke="CurrentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>  
            </button>

            {clickMenu && (
  <div className="fixed inset-0 bg-gradient-to-br from-orange-400 to-orange-600 w-screen h-screen overflow-y-auto z-100 p-4">

    {/* Bouton de fermeture */}
    <button onClick={menuCliquer} className="ml-auto flex text-white">
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
    </button>

    {/* Liens */}
    <ul className="space-y-4 mt-10 text-center">
      <li><a href="/acceuil" className="text-white text-lg font-bold hover:text-yellow-200 transition duration-300">Accueil</a></li>

      <li><a href="/architecture" className="text-white text-lg font-bold hover:text-yellow-200 transition duration-300">Architecture</a></li>

      {/* Construction avec sous-menu visible si constructionType */}
      <li><button onClick={constructionCliquer} className="text-white text-lg font-bold hover:text-yellow-200 transition duration-300">Construction ▾</button></li>

      {constructionType && (
        <div className="space-y-2 text-white text-md font-semibold mt-2">
          <li><a href="/ecologique" className="block hover:text-yellow-100 transition">Écologique</a></li>
          <li><a href="/classique" className="block hover:text-yellow-100 transition">Classique</a></li>
        </div>
      )}

      <li><a href="/terrain" className="text-white text-lg font-bold hover:text-yellow-200 transition duration-300">Terrain</a></li>

      <li><a href="/ingenieur" className="text-white text-lg font-bold hover:text-yellow-200 transition duration-300">Étude d'ingénieur</a></li>

    </ul>
  </div>
)}

            </nav>
        </div>
    )
}