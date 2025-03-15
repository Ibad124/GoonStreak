import { useState } from "react";
import { Link } from "wouter";
import { ChevronLeft } from "lucide-react";

const sites = [
  { id: "pornhub", name: "Pornhub", url: "https://www.pornhub.com" },
  { id: "xvideos", name: "XVideos", url: "https://www.xvideos.com" },
  { id: "xnxx", name: "XNXX", url: "https://www.xnxx.com" },
  { id: "redtube", name: "RedTube", url: "https://www.redtube.com" }
];

export default function AdultContent() {
  const [selectedSite, setSelectedSite] = useState("pornhub");

  return (
    <div>
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200">
        <div className="flex items-center h-14 px-4">
          <Link href="/" className="flex items-center gap-2">
            <ChevronLeft className="h-5 w-5 text-gray-700" />
            <span className="text-xl font-semibold">Adult Content</span>
          </Link>
        </div>
      </div>

      <div className="fixed top-14 left-0 right-0 bg-white border-b border-gray-200">
        <div className="flex">
          {sites.map(site => (
            <button
              key={site.id}
              onClick={() => setSelectedSite(site.id)}
              className={`flex-1 h-12 text-center focus:outline-none ${
                selectedSite === site.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {site.name}
            </button>
          ))}
        </div>
      </div>

      <iframe
        src={sites.find(site => site.id === selectedSite)?.url}
        className="fixed top-[104px] left-0 right-0 bottom-0 w-full h-[calc(100vh-104px)]"
        style={{ border: 'none' }}
      />
    </div>
  );
}