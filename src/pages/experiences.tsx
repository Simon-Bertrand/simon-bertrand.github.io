import { ExperienceItems } from "../params"

function ExperienceEntity({title, description, date, company, src} : {title : string, description : string, date: string, company : string, src:string }) {
    return (
        <div className="flex max-w-md overflow-hidden bg-color2 rounded-lg shadow-lg">
            <div className="w-full p-4 text-center my-auto">
                <h1 className="text-lg font-bold text-white">
                    {title}
                </h1>
                <p className="mt-2 text-sm text-gray-400">
                    {company}
                </p>
                <p className="mt-2 text-xs text-gray-400">
                    {description}
                </p>
                <div className="flex justify-center mt-3 item-center">
                    <p className="text-sm text-center text-gray-200">
                        {date}
                    </p>
                </div>
                <img className="w-1/2 mx-auto m-3 object-contain grayscale brightness-150	" src={"logos/"+src} />
    
            </div>
        </div>
    )
}

export default function ExperiencesPage() {
    return  <>
        <h1 className="text-center p-5">Expériences</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            {
                ExperienceItems.map(x => <ExperienceEntity {...x}></ExperienceEntity>)
            }
         

        </div>
    </>
}