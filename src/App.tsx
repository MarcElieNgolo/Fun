import  {BrowserRouter as Routeur , Routes, Route, useNavigate} from "react-router-dom"
import Acceuil from "./../pages/Acceuil"
import Rang from "../pages/Rang"
import Architecture from "./../pages/Architecture"
import Classique from "./../pages/Classique"
import Ecologique from "./../pages/Ecologique"
import Ingenieur from "./../pages/Ingenieur"
import Terrain from "./../pages/Terrain"
import { useEffect } from "react"


export default function App(){
  return(
    <Routeur>
      <Routes>
        <Route path="/" element={<Redirect/>}></Route>
        <Route path="/acceuil" element={<Acceuil/>}></Route>
        <Route path="/architecture" element={<Architecture/>}></Route>
        <Route path="/terrain" element={<Terrain/>}></Route>
        <Route path="/ecologique" element={<Ecologique/>}></Route>
        <Route path="/classique" element={<Classique/>}></Route>
        <Route path="/ingenieur" element={<Ingenieur/>}></Route>
        <Route path="/rang" element={<Rang/>}></Route>
      </Routes>
    </Routeur>
  )
}

function Redirect(){
  const navigate = useNavigate()
  useEffect(()=>{
    navigate("/rang")
  })
  return null
}