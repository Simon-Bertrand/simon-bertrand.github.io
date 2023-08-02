import { InfosStats } from "../params";



export default function InfosPage() {


    return <>
    

        <div className="text-center text-white w-full mx-auto  px-4 sm:px-6 lg:py-16 lg:px-8 z-20">
            <h2 className="text-3xl font-extrabold text-black dark:text-white sm:text-4xl">
                <span className="block">
                    I'm Simon Bertrand
                </span>
                <span className="block text-indigo-500">
                    a French engineer in Computer Science
                </span>
            </h2>
            <p className="text-xl mt-4 max-w-md mx-auto text-gray-400">
                Software Engineering (Web, Application) and Data Science (ML, DL, CV) with Python, Rust, C#, SQL and ReactJS.
            </p>
            <section>
                <div className="container grid grid-cols-2 gap-8 pt-8 mx-auto text-center md:grid-cols-4">
                    {
                        InfosStats.map(x => 
                            <div>
                                <h5 className="text-5xl font-bold text-white">
                                    <span className="inline text-white">
                                        {x.value}
                                    </span>
                                    <span className="text-indigo-200">
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
                Technical fields
            </h2>
            <ul className="flex flex-wrap items-start gap-8">
                <li className="w-2/5">
                    <p className="text-lg font-medium leading-6">
                        AI / Machine Learning 
                    </p>
                    <p className="mt-2">
                        <p className="text-base leading-6 text-gray-500">
                            TensorFlow, Keras, PyTorch, Jax, Sci-kit Learn, Ray
                        </p>
                    </p>
                </li>
                <li className="w-2/5">
                    <p className="text-lg font-medium leading-6">
                        Images & Signals Processing
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
                        Data Vizualisation & Analysis
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
                        Web Development
                    </p>
                    <p className="mt-2">
                        <p className="text-base leading-6 text-gray-500">
                            HTML, CSS, JavaScript, C# (ASP .NET), Node.js, TypeScript, ReactJS, Next.js, Tailwind CSS, Bootstrap
                        </p>
                    </p>
                </li>
                <li className="w-2/5">
                    <p className="text-lg font-medium leading-6 ">
                        Low-level Programming
                    </p>
                    <p className="mt-2">
                        <p className="text-base leading-6 text-gray-500">
                            Rust, C/C++ 
                        </p>
                    </p>
                </li>
                <li className="w-2/5">
                    <p className="text-lg font-medium leading-6 ">
                        Systems administration
                    </p>
                    <p className="mt-2">
                        <p className="text-base leading-6 text-gray-500">
                            Ubuntu Server, Docker, SSH
                        </p>
                    </p>
                </li>
            </ul>
        </div>



    </>
}
