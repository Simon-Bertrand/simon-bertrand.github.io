
import {
    Accordion,
    AccordionItem,
    AccordionItemHeading,
    AccordionItemButton,
    AccordionItemPanel,
} from 'react-accessible-accordion';



export default function RessourcesPage() {
    return <>
        <h1 className="text-center p-5">Ressources</h1>
        <Accordion allowZeroExpanded>
            <AccordionItem>
                <AccordionItemHeading>
                    <AccordionItemButton>
                        Rapports de travaux
                    </AccordionItemButton>
                </AccordionItemHeading>
                <AccordionItemPanel>
                    <p>
                        <a className='flex' target="_blank" href="storage/Rapport-Thales.pdf" title="Rapport Thales">
                            <div className="pdf" />
                            <p className='my-auto'>Rapport segmentation sémantique de vidéos par deep learning - Thales</p>
                        </a>
                        <a className='flex' target="_blank" href="storage/Rapport-iCube.pdf" title="Rapport iCube">
                            <div className="pdf" />
                            <p className='my-auto'>Rapport analyse de qualité des clusters non-supervisés - iCube</p>
                        </a>
                    </p>
                </AccordionItemPanel>
            </AccordionItem>
            <AccordionItem>
                <AccordionItemHeading>
                    <AccordionItemButton>
                        Tutoriels
                    </AccordionItemButton>
                </AccordionItemHeading>
                <AccordionItemPanel>
                    <p>
                        <h4 className='text-center p-2 normal-case'>Démonstration et implémentation du perceptron simple</h4>
                        <iframe width="560" height="315" className='mx-auto' src="https://www.youtube.com/embed/whm1VQsnIv4" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
                    </p>
                </AccordionItemPanel>
            </AccordionItem>
        </Accordion>
    </>
}