import { Link } from "wouter";
import { ChevronLeft } from "lucide-react";

const sites = [
  { id: "pornhub", name: "Pornhub", url: "https://www.pornhub.com" },
  { id: "xvideos", name: "XVideos", url: "https://www.xvideos.com" },
  { id: "xnxx", name: "XNXX", url: "https://www.xnxx.com" },
  { id: "redtube", name: "RedTube", url: "https://www.redtube.com" }
];

const AdultContent = () => {
  const handleClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="h-14 border-b border-gray-200 flex items-center px-4">
        <Link href="/" className="flex items-center gap-2">
          <ChevronLeft className="h-5 w-5 text-gray-700" />
          <span className="text-xl">Adult Content</span>
        </Link>
      </div>

      <div className="flex">
        {sites.map(site => (
          <button
            key={site.id}
            onClick={() => handleClick(site.url)}
            className={`flex-1 h-12 text-center focus:outline-none ${
              site.id === "pornhub"
                ? "bg-blue-600 text-white"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            {site.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdultContent;