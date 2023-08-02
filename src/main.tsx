import React from 'react'
import ReactDOM from 'react-dom/client'
import './style/index.css'
import { HashRouter } from 'react-router-dom'
import { NavLink, Routes, Route } from "react-router-dom";
import { Menus, SocialMedias } from "./params";
import Pages from "./partials/Page";


function App() {

  return (
    <>
    <div className='layout'>
      <div className='p-3'>
        <div className="bg-color rounded-xl p-3 shadow-xl h-full flex items-center">
          <div className='w-full'>
            <img src="avatar.jpg" alt="Simon Bertrand" title="Simon Bertrand Photo" className="avatar" />
            <h1 className="title">Simon Bertrand</h1>
            <h5 className="subtitle">Ingénieur en Intelligence Artificielle</h5>
            <div className="flex text-stone-400 justify-center gap-1 pt-3">
            {
              SocialMedias.map(x => {
                return (
                  <a href={x.href} target='_blank' title={x.name + " Simon Bertrand"} >{x.svg}</a>
                )
              })
            }
            </div>
            <div className="rounded-2xl ">
                <div className="flex items-center justify-center">
                </div>
                <nav className="mt-6">
                    <div>
                      {
                        Menus.map((x) =>
                          <NavLink 
                          className={({ isActive }) => isActive ? "menu-item-active" : "menu-item"}
                          to={x.href} >
                            <span className="text-left">
                                {x.svg}
                            </span>
                            <span className="mx-4 text-sm font-normal">
                                {x.name}
                            </span>
                          </NavLink>
                        )
                      }
                    </div>
                </nav>
            </div>
          </div>
        </div>


      </div>
      <div className='col-span-2 md:overflow-auto p-3'>
        <Routes>
            {
              Menus.map(x => {return <Route path = {x.href} element={<Pages href={x.href}>{x.page}</Pages>} />})
            }
           <Route path = "*" element={<Pages href={Menus[0].href}>{Menus[0].page}</Pages>} />
        </Routes>
      </div>
      
    </div>
    <div className="flex justify-center items-center">
        <footer className="text-stone-400">
          © {new Date().getFullYear()} Simon Bertrand. Tous droits réservés.
        </footer>
    </div>
    </>
  )
}


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
      <HashRouter>
        <App />
      </HashRouter>
  </React.StrictMode>,
)
