import { InfosStats } from "../params";



export default function InfosPage() {


    return <>
    

        <div className="text-center w-full mx-auto  px-4 sm:px-6 lg:py-10 lg:px-8 z-20">
            <h2 className="text-3xl font-extrabold sm:text-4xl text-white">
                <span className="block">
                    Simon Bertrand
                </span>
                <span className="color">
                   Ingénieur dans les technologies de l'information
                </span>
            </h2>
            <p className="text-xl my-4 max-w-xl mx-auto text-gray-400">
                Science des données & IA (ML, DL, CV) et Software Engineering (Web, IHM) avec Python, Rust, C#, SQL et ReactJS.
            </p>
            <section>
                <div className="container flex justify-around py-3">
                    {
                        InfosStats.map(x => 
                            <div>
                                <h5 className="text-5xl font-bold text-white">
                                    <span className="inline text-white">
                                        {x.value}
                                    </span>
                                    <span className="color">
                                        +
                                    </span>
                                </h5>
                                <p className="text-xs font-medium tracking-wide text-indigo-100 uppercase">
                                    {x.name}
                                </p>
                            </div>
                        )
                    }
                </div>
            </section>
        </div>
        
        <div className="max-w-screen-xl p-3 mx-auto">
            <h2 className="mb-12 text-3xl font-extrabold border-b-4">
                Domaines techniques
            </h2>
            <ul className="flex flex-wrap items-start gap-8">
                <li className="w-2/5">
                    <p className="text-lg font-medium leading-6">
                        IA / Machine Learning 
                    </p>
                    <p className="mt-2">
                        <p className="text-base leading-6 text-gray-500">
                            TensorFlow, Keras, PyTorch, Jax, Sci-kit Learn, Ray
                        </p>
                    </p>
                </li>
                <li className="w-2/5">
                    <p className="text-lg font-medium leading-6">
                        Traitement du signal et des images
                    </p>
                    <p className="mt-2">
                        <p className="text-base leading-6 text-gray-500">
                            OpenCV, SciPy, Numpy, Pandas, Statsmodels
                        </p>
                        <p className="text-base leading-6 text-gray-500">
                            MATLAB Toolbox
                        </p>
                    </p>
                </li>
                <li className="w-2/5">
                    <p className="text-lg font-medium leading-6">
                        Visualisation et analyse de données
                    </p>
                    <p className="mt-2">
                        <p className="text-base leading-6 text-gray-500">
                            Matplotlib, Plotly, Seaborn, Apache ECharts
                        </p>
                    </p>
                </li>
                <li className="w-2/5">
                    <p className="text-lg font-medium leading-6">
                        Data Engineering
                    </p>
                    <p className="mt-2">
                        <p className="text-base leading-6 text-gray-500">
                            SQL, No-SQL, T-SQL, PL/pgSQL, PySpark, ORM, ETL
                        </p>
                    </p>
                </li>
                <li className="w-2/5">
                    <p className="text-lg font-medium leading-6 ">
                        Développement web
                    </p>
                    <p className="mt-2">
                        <p className="text-base leading-6 text-gray-500">
                            HTML, CSS, JavaScript, C# (ASP .NET), Node.js, TypeScript, ReactJS, Next.js, Tailwind CSS, Bootstrap
                        </p>
                    </p>
                </li>
                <li className="w-2/5">
                    <p className="text-lg font-medium leading-6 ">
                        Programmation bas niveau
                    </p>
                    <p className="mt-2">
                        <p className="text-base leading-6 text-gray-500">
                            Rust, C/C++ 
                        </p>
                    </p>
                </li>
                <li className="w-2/5">
                    <p className="text-lg font-medium leading-6 ">
                        Réseau et administration système
                    </p>
                    <p className="mt-2">
                        <p className="text-base leading-6 text-gray-500">
                            Windows, Linux, Ubuntu Server, Serveurs HTTP, SSL, Docker, SSH. <br />
                            Notions en réseau
                        </p>
                    </p>
                </li>
            </ul>
        </div>



    </>
}
