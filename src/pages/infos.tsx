import { InfosStats } from "../params";

export default function InfosPage() {
  return (
    <>
      <div className="text-center w-full mx-auto  px-4 sm:px-6 lg:py-10 lg:px-8 z-20">
        <h2 className="text-3xl font-extrabold sm:text-4xl text-white">
          <span className="block">Simon Bertrand</span>
          <span className="color">Ingénieur doctorant en deep learning</span>
        </h2>
        <p className="text-xl my-4 max-w-xl mx-auto text-gray-400">
          <ul>
            <li>Science des données et IA (ML, DL, CV)</li>
            <li>Software Engineering (Web, Logiciels)</li>
          </ul>
        </p>
        <section>
          <div className="container flex justify-around pt-3">
            {InfosStats.map((x) => (
              <div>
                <h5 className="text-5xl font-bold text-white">
                  <span className="inline text-white">{x.value}</span>
                  <span className="color">+</span>
                </h5>
                <p className="text-xs font-medium tracking-wide text-indigo-100 uppercase">
                  {x.name}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="max-w-screen-xl p-3 mx-auto">
        <h2 className="mb-8 text-3xl font-extrabold border-b-4">
          Domaines techniques
        </h2>

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
