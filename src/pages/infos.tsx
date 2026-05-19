import { InfosStats } from "../params";

const focusAreas = [
  "Computer Vision",
  "Deep Learning Research",
  "Software Engineering",
  "Robust AI Systems",
];



export default function InfosPage() {
  return (
    <>
      <div className="profile-hero">
        <h2 className="text-3xl font-extrabold sm:text-4xl text-white">
          <span className="block">Simon Bertrand</span>
          <span className="color">Doctorant en deep learning</span>
        </h2>

        <p className="hero-summary">
          Ingénieur-doctorant spécialisé en vision par ordinateur, recalage
          multimodal et systèmes IA robustes, avec une expérience croisée en
          recherche appliquée, industrie et ingénierie logicielle.
        </p>

        <div className="focus-tags">
          {focusAreas.map((area) => (
            <span key={area}>{area}</span>
          ))}
        </div>

        <div className="hero-actions">
          <a
            className="primary-action"
            href="https://www.linkedin.com/in/simonbertrand-engineering/"
            target="_blank"
            rel="noreferrer"
          >
            Me contacter
          </a>
          <a
            className="secondary-action"
            href="https://github.com/Simon-Bertrand"
            target="_blank"
            rel="noreferrer"
          >
            Voir GitHub
          </a>
          <a
            className="secondary-action"
            href="storage/Article1-These.pdf"
            target="_blank"
            rel="noreferrer"
          >
            Publication
          </a>
        </div>

        <section>
          <div className="hero-stats">
            {InfosStats.map((x) => (
              <div key={x.name}>
                <h5 className="text-5xl font-bold text-white">
                  <span className="inline text-white">{x.value}</span>
                  {x.name !== "Articles" && <span className="color">+</span>}
                </h5>
                <p className="text-xs font-medium tracking-wide text-indigo-100 uppercase">
                  {x.name}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>



      <div className="max-w-screen-xl p-3 mx-auto section-block">
        <div className="section-heading">
          <p>Stack technique</p>
          <h2>
          Domaines techniques
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 text-center items-center gap-8">

          <div className="p-4 overflow-hidden bg-color2 shadow-lg rounded-2xl">
            <div className="w-full">
              <p className="mb-2 text-md lg:text-lg font-medium text-white">
                Programmation
              </p>
              <p className="text-xs text-gray-400">
                Rust, Python, C#, C++, C, TypeScript, JavaScript
              </p>
            </div>
          </div>

          <div className="p-4 overflow-hidden bg-color2 shadow-lg rounded-2xl">
            <div className="w-full">
              <p className="mb-2 text-md lg:text-lg font-medium text-white">
                Intelligence artificielle
              </p>
              <p className="text-xs text-gray-400">
                Deep Learning, Vision par ordinateur, Traitement du signal et des images, Statistiques
              </p>
            </div>
          </div>

          <div className="p-4 overflow-hidden bg-color2 shadow-lg rounded-2xl">
            <div className="w-full">
              <p className="mb-2 text-md lg:text-lg font-medium text-white">
                Outils Data Science
              </p>
              <p className="text-xs text-gray-400">
                PyTorch, TensorFlow, JAX, HF, Scipy, Scikit-Learn, Pandas, Polars, Statsmodels
              </p>
            </div>
          </div>

          <div className="p-4 overflow-hidden bg-color2 shadow-lg rounded-2xl">
            <div className="w-full">
              <p className="mb-2 text-md lg:text-lg font-medium text-white">
                Ingénierie logicielle
              </p>
              <p className="text-xs text-gray-400">
                Git, Docker, CI/CD, Tests, Bash, SSH
              </p>
            </div>
          </div>

          <div className="p-4 overflow-hidden bg-color2 shadow-lg rounded-2xl">
            <div className="w-full">
              <p className="mb-2 text-md lg:text-lg font-medium text-white">
                Développement Web
              </p>
              <p className="text-xs text-gray-400">
                API REST, FastAPI, Next.js, React, HTML, CSS, Tailwind CSS
              </p>
            </div>
          </div>

          <div className="p-4 overflow-hidden bg-color2 shadow-lg rounded-2xl">
            <div className="w-full">
              <p className="mb-2 text-md lg:text-lg font-medium text-white">
                Bases de données
              </p>
              <p className="text-xs text-gray-400">
                PostgreSQL, SQL, NoSQL, Redis
              </p>
            </div>
          </div>

          <div className="p-4 overflow-hidden bg-color2 shadow-lg rounded-2xl">
            <div className="w-full">
              <p className="mb-2 text-md lg:text-lg font-medium text-white">
                Systèmes réseaux
              </p>
              <p className="text-xs text-gray-400">
                Linux, TCP/IP, UDP, DHCP, DNS, NAT, VPN, SSL/TLS, Reverse Proxy, HTTP, WebSocket
              </p>
            </div>
          </div>

          <div className="p-4 overflow-hidden bg-color2 shadow-lg rounded-2xl">
            <div className="w-full">
              <p className="mb-2 text-md lg:text-lg font-medium text-white">
                Sécurité, Rétro-ingénierie
              </p>
              <p className="text-xs text-gray-400">
                Chiffrement, Analyse statique, Analyse dynamique, Décompilation
              </p>
            </div>
          </div>

          <div className="p-4 overflow-hidden bg-color2 shadow-lg rounded-2xl">
            <div className="w-full">
              <p className="mb-2 text-md lg:text-lg font-medium text-white">
                Électronique embarquée
              </p>
              <p className="text-xs text-gray-400">
                ESP32, Arduino, Raspberry Pi, EasyEDA, Fusion 360
              </p>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
