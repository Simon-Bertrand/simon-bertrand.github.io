import { useEffect, useMemo, useState } from "react";

type GithubRepo = {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  topics?: string[];
  archived: boolean;
  fork: boolean;
};

type SortMode = "featured" | "stars" | "recent";

const REPOS_URL = "https://api.github.com/users/Simon-Bertrand/repos";
const PAGE_SIZE = 6;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function ProjectsPage() {
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [sortMode, setSortMode] = useState<SortMode>("featured");

  useEffect(() => {
    const controller = new AbortController();

    async function loadRepos() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`${REPOS_URL}?per_page=100`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Impossible de charger les projets GitHub.");
        }

        const data = (await response.json()) as GithubRepo[];
        setRepos(data);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        setError(
          err instanceof Error
            ? err.message
            : "Impossible de charger les projets GitHub.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadRepos();

    return () => controller.abort();
  }, []);

  const sortedRepos = useMemo(() => {
    return [...repos].sort((a, b) => {
      const starsDiff = b.stargazers_count - a.stargazers_count;
      const recentDiff =
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();

      if (sortMode === "stars") {
        return starsDiff || recentDiff;
      }

      if (sortMode === "recent") {
        return recentDiff || starsDiff;
      }

      return starsDiff || recentDiff;
    });
  }, [repos, sortMode]);

  const totalPages = Math.max(1, Math.ceil(sortedRepos.length / PAGE_SIZE));
  const visibleRepos = sortedRepos.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function goToPage(nextPage: number) {
    setPage(Math.min(Math.max(nextPage, 1), totalPages));
  }

  function updateSortMode(nextSortMode: SortMode) {
    setSortMode(nextSortMode);
    setPage(1);
  }

  return (
    <>
      <div className="section-heading projects-heading">
        <p>GitHub</p>
        <h1>Projets</h1>
        <span>
          Dépôts publics chargés depuis l'API GitHub
        </span>
      </div>

      {isLoading && (
        <div className="project-state">
          <p>Chargement des projets GitHub...</p>
        </div>
      )}

      {error && (
        <div className="project-state project-state-error">
          <p>{error}</p>
          <a href={REPOS_URL} target="_blank" rel="noreferrer">
            Ouvrir l'API GitHub
          </a>
        </div>
      )}

      {!isLoading && !error && (
        <>
          <div className="projects-toolbar">
            <p>
              {sortedRepos.length} dépôts publics · page {page}/{totalPages}
            </p>
            <div className="project-sort">
              <button
                type="button"
                className={sortMode === "featured" ? "project-sort-active" : undefined}
                onClick={() => updateSortMode("featured")}
              >
                Étoiles + récent
              </button>
              <button
                type="button"
                className={sortMode === "stars" ? "project-sort-active" : undefined}
                onClick={() => updateSortMode("stars")}
              >
                Plus étoilés
              </button>
              <button
                type="button"
                className={sortMode === "recent" ? "project-sort-active" : undefined}
                onClick={() => updateSortMode("recent")}
              >
                Plus récents
              </button>
            </div>
            <a href="https://github.com/Simon-Bertrand" target="_blank" rel="noreferrer">
              Profil GitHub
            </a>
          </div>

          <div className="projects-grid">
            {visibleRepos.map((repo) => (
              <a
                className="project-card"
                href={repo.html_url}
                target="_blank"
                rel="noreferrer"
                key={repo.id}
              >
                <div className="project-card-header">
                  <h2>{repo.name}</h2>
                  <span>{repo.language ?? "Code"}</span>
                </div>

                <p>
                  {repo.description ??
                    "Projet public GitHub, consultable directement depuis le dépôt."}
                </p>

                {repo.topics && repo.topics.length > 0 && (
                  <div className="project-topics">
                    {repo.topics.slice(0, 4).map((topic) => (
                      <span key={topic}>{topic}</span>
                    ))}
                  </div>
                )}

                <div className="project-meta">
                  <span>{repo.stargazers_count} stars</span>
                  <span>{repo.forks_count} forks</span>
                  <span>Mis à jour {formatDate(repo.updated_at)}</span>
                  {repo.fork && <span>Fork</span>}
                  {repo.archived && <span>Archivé</span>}
                </div>
              </a>
            ))}
          </div>

          <div className="pagination">
            <button type="button" onClick={() => goToPage(page - 1)} disabled={page === 1}>
              Précédent
            </button>
            <div>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (pageNumber) => (
                  <button
                    type="button"
                    className={pageNumber === page ? "pagination-active" : undefined}
                    onClick={() => goToPage(pageNumber)}
                    key={pageNumber}
                  >
                    {pageNumber}
                  </button>
                ),
              )}
            </div>
            <button
              type="button"
              onClick={() => goToPage(page + 1)}
              disabled={page === totalPages}
            >
              Suivant
            </button>
          </div>
        </>
      )}
    </>
  );
}
