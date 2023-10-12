import { EducationItems } from "../params"

function EducationEntity({title, description, date, option, src} : {title : string, description : string, date: string, option : string, src:string }) {
    return (
        <div className="flex max-w-md overflow-hidden bg-color2 rounded-lg shadow-lg">
            <div className="w-full p-4 text-center my-auto">
                <h1 className="text-lg font-bold text-white">
                    {title}
                </h1>
                <h2 className="text-xs italic text-gray-400">
                    Option : {option}
                </h2>
                <p className="mt-2 text-sm text-gray-400">
                    {description}
                </p>
                <img className="w-1/2 mx-auto m-3 object-contain grayscale brightness-120	" src={"logos/"+src} />
                <div className="flex justify-center mt-3 item-center">
                    <p className="text-xl text-center text-gray-200">
                        {date}
                    </p>
                </div>
            </div>
        </div>
    )
}

export default function EducationPage() {
    return (
        <>
            <h1 className="text-center p-5">Éducation</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                {
                    EducationItems.map((x)=>  <EducationEntity {...x}></EducationEntity>
                    )
                }
            </div>
        </>
    )
}