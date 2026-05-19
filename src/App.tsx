import { motion } from "framer-motion";
import { NavLink, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { Menus, SocialMedias } from "./params";
import Pages from "./partials/Page";

const AnimationLayout = () => {
  const { pathname } = useLocation();
  return (
    <motion.div
      key={pathname}
      initial="initial"
      animate="in"
      variants={{
        initial: {
          opacity: 0,
        },
        in: {
          opacity: 1,
        },
        out: {
          opacity: 0,
        },
      }}
      transition={{
        ease: "easeInOut",
        duration: 0.3,
      }}
    >
      <Outlet />
    </motion.div>
  );
};

export default function App() {
  return (
    <>
      <div className="layout">
        <aside className="profile-shell">
          <div className="profile-card">
            <div className="w-full">
              <img
                src="avatar.jpg"
                alt="Simon Bertrand"
                title="Simon Bertrand Photo"
                className="avatar"
              />
              <h1 className="title">Simon Bertrand</h1>
              <h5 className="subtitle">Doctorant en deep learning</h5>
              <div className="social-links">
                {SocialMedias.map((x) => {
                  return (
                    <a
                      href={x.href}
                      target="_blank"
                      rel="noreferrer"
                      title={x.name + " Simon Bertrand"}
                      key={x.name}
                    >
                      {x.svg}
                    </a>
                  );
                })}
              </div>
              <div>
                <div className="flex items-center justify-center"></div>
                <nav className="site-nav">
                  <div className="site-nav-list">
                    {Menus.map((x) => (
                      <NavLink
                        className={({ isActive }) =>
                          isActive ? "menu-item-active" : "menu-item"
                        }
                        to={x.href}
                        key={x.name}
                      >
                        <span className="text-left">{x.svg}</span>
                        <span className="mx-4 text-sm font-normal">
                          {x.name}
                        </span>
                      </NavLink>
                    ))}
                  </div>
                </nav>
              </div>
            </div>
          </div>
        </aside>
        <main className="content-shell">
          <Routes>
            <Route element={<AnimationLayout />}>
              {Menus.map((x) => {
                return (
                  <Route
                    path={x.href}
                    element={<Pages href={x.href}>{x.page}</Pages>}
                    key={x.name}
                  />
                );
              })}
              <Route
                path="*"
                element={<Pages href={Menus[0].href}>{Menus[0].page}</Pages>}
              />
            </Route>
          </Routes>
        </main>
      </div>
      <div className="footer-shell">
        <footer>
          © {new Date().getFullYear()} Simon Bertrand. Tous droits réservés.
        </footer>
      </div>
    </>
  );
}
