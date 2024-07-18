import EducationPage from "./pages/education";
import ExperiencesPage from "./pages/experiences";
import InfosPage from "./pages/infos";
import RessourcesPage from "./pages/ressources";

export const Menus = [
  {
    name: "À propos",
    href: "",
    page: <InfosPage />,
    svg: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
      >
        <path
          fill="currentColor"
          d="M12 19.2c-2.5 0-4.71-1.28-6-3.2c.03-2 4-3.1 6-3.1s5.97 1.1 6 3.1a7.232 7.232 0 0 1-6 3.2M12 5a3 3 0 0 1 3 3a3 3 0 0 1-3 3a3 3 0 0 1-3-3a3 3 0 0 1 3-3m0-3A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10c0-5.53-4.5-10-10-10Z"
        />
      </svg>
    ),
  },
  {
    name: "Éducation",
    href: "education",
    page: <EducationPage />,
    svg: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
      >
        <path
          fill="currentColor"
          d="M2 3h20c1.05 0 2 .95 2 2v14c0 1.05-.95 2-2 2H2c-1.05 0-2-.95-2-2V5c0-1.05.95-2 2-2m12 3v1h8V6h-8m0 2v1h8V8h-8m0 2v1h7v-1h-7m-6 3.91C6 13.91 2 15 2 17v1h12v-1c0-2-4-3.09-6-3.09M8 6a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3Z"
        />
      </svg>
    ),
  },
  {
    name: "Expériences",
    href: "experiences",
    page: <ExperiencesPage />,
    svg: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
      >
        <path
          fill="currentColor"
          d="M4 6h16v10H4m16 2a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H4c-1.11 0-2 .89-2 2v10a2 2 0 0 0 2 2H0v2h24v-2h-4Z"
        />
      </svg>
    ),
  },
  {
    name: "Ressources",
    href: "ressources",
    page: <RessourcesPage />,
    svg: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
      >
        <path
          fill="currentColor"
          d="M15 7h5.5L15 1.5V7M8 0h8l6 6v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2M4 4v18h16v2H4a2 2 0 0 1-2-2V4h2Z"
        />
      </svg>
    ),
  },
];

export const SocialMedias = [
  {
    name: "LinkedIn",
    svg: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
      >
        <path
          fill="currentColor"
          d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77Z"
        />
      </svg>
    ),
    href: "https://www.linkedin.com/in/simonbertrand-engineering/",
  },
  {
    name: "GitHub",
    svg: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
      >
        <path
          fill="currentColor"
          d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33c.85 0 1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z"
        />
      </svg>
    ),
    href: "https://github.com/Simon-Bertrand",
  },
  {
    name: "Twitter",
    svg: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
      >
        <path
          fill="currentColor"
          d="M22.46 6c-.77.35-1.6.58-2.46.69c.88-.53 1.56-1.37 1.88-2.38c-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29c0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15c0 1.49.75 2.81 1.91 3.56c-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07a4.28 4.28 0 0 0 4 2.98a8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21C16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56c.84-.6 1.56-1.36 2.14-2.23Z"
        />
      </svg>
    ),
    href: "https://twitter.com/SiMB_dev",
  },
  {
    name: "YouTube",
    svg: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
      >
        <path
          fill="currentColor"
          d="m10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9c.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83c-.25.9-.83 1.48-1.73 1.73c-.47.13-1.33.22-2.65.28c-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44c-.9-.25-1.48-.83-1.73-1.73c-.13-.47-.22-1.1-.28-1.9c-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83c.25-.9.83-1.48 1.73-1.73c.47-.13 1.33-.22 2.65-.28c1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44c.9.25 1.48.83 1.73 1.73Z"
        />
      </svg>
    ),
    href: "https://www.youtube.com/@simonb.9716/videos",
  },
];

export const InfosStats = [
  {
    name: "Années d'études",
    value:
      new Date().getFullYear() - 2017 > 9
        ? "9"
        : (new Date().getFullYear() - 2017).toString(),
  },
  { name: "Articles", value: "0" },
  {
    name: "Années de développement",
    value: (new Date().getFullYear() - 2012).toString(),
  },
];

export const EducationItems = [
  {
    title: "[En cours] Diplôme de doctorat",
    description:
      "École doctorale n°209 - Sciences physiques et de l'ingénieur - Univ. Bordeaux",
    date: "2023-2026",
    option: "Automatique, productique, signal et image, ingénierie cognitique",
    src: "U-Bordeaux.png",
  },
  {
    title: "Diplôme d'ingénieur généraliste",
    description: "Télécom Physique Strasbourg",
    date: "2020-2023",
    option: "Images, signaux et science des données",
    src: "TelecomPhysiqueStrasbourg.png",
  },
  {
    title: "Master Recherche IRIV",
    description: "Université de Strasbourg",
    date: "2021-2023",
    option: "Images et données",
    src: "MasterIRIV.png",
  },
  {
    title: "Classes préparatoires aux grandes écoles",
    description: "Lycée Sainte-Marie Grand Lebrun",
    date: "2017-2020",
    option: "MPSI-MP",
    src: "SainteMarieGrandLeBrun.png",
  },
];

export const ExperienceItems = [
  {
    title: "Ingénieur doctorant en deep learning",
    company: "CEA",
    description:
      "Recalage d'images multimodales par réseaux de neurones pour la navigation hybridée",
    date: "3 ans - 2026",
    src: "CEA.png",
  },
  {
    title: "Ingénieur en deep learning",
    company: "Thales Nederland B.V.",
    description: "Segmentation sémantique de vidéos par deep learning",
    date: "6 mois - 2023",
    src: "Thales.png",
  },
  {
    title: "Ingénieur logiciel",
    company: "Groupama Grand Est",
    description: "Développement d'outils intranet C#, T-SQL et ASP .NET MVC",
    date: "3 mois - 2022",
    src: "Groupama.png",
  },
  {
    title: "Ingénieur en Data Mining",
    company: "iCube",
    description:
      "Développement d'outils d'analyse de qualité des clusters de données",
    date: "2 mois - 2021",
    src: "iCube.png",
  },
];
