import React, { useState } from "react";
import { useGemini } from "../components/GeminiContext";
import { 
  Film, 
  Play, 
  Search, 
  ChevronRight, 
  LayoutGrid, 
  Flame,
  Star,
  Clock,
  ArrowLeft,
  X,
  Volume2,
  Subtitles,
  Maximize2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../components/ui/button";

export default function EnglishMovies() {
  const { materials, isPremium } = useGemini();
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMovie, setSelectedMovie] = useState<any>(null);

  const movieMaterials = materials.filter(m => m.category === "English Movies");
  
  const subCategories = ["All", "Films", "Cartoons", "Anime"];

  const filteredMovies = movieMaterials.filter(movie => {
    const matchesCategory = selectedSubCategory === "All" || movie.subCategory === selectedSubCategory;
    const matchesSearch = movie.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const MoviePlayer = ({ movie, onClose }: { movie: any, onClose: () => void }) => {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
      >
        <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={onClose} />
        
        <div className="relative w-full max-w-6xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10 group">
          <div className="absolute top-6 left-6 right-6 z-20 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
            <h3 className="text-xl font-black text-white drop-shadow-lg">{movie.name}</h3>
            <button 
              onClick={onClose}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md text-white transition-all hover:scale-110"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="w-full h-full relative">
            {movie.content.includes("youtube.com") || movie.content.includes("youtu.be") ? (
              <iframe
                src={`https://www.youtube.com/embed/${movie.content.split('v=')[1] || movie.content.split('/').pop()}?autoplay=1&rel=0`}
                className="w-full h-full border-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video 
                src={movie.content} 
                controls 
                autoPlay
                className="w-full h-full"
                poster={movie.thumbnail}
              >
                {movie.subtitles && (
                  <track 
                    label="English"
                    kind="subtitles"
                    srcLang="en"
                    src={movie.subtitles}
                    default
                  />
                )}
              </video>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-full text-xs font-black uppercase tracking-widest">
              <Film className="h-3 w-3" /> Cinema Experience
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight">
              English <span className="text-cyan-500">Movies</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl font-medium">
              Improve your listening and vocabulary naturally while watching your favorite movies, cartoons, and anime.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search movies..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm focus:ring-2 focus:ring-cyan-500 outline-none transition-all font-medium"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap items-center gap-3 mb-12">
          {subCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedSubCategory(cat)}
              className={`px-8 py-3 rounded-2xl text-sm font-bold transition-all ${
                selectedSubCategory === cat
                  ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/25"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Movies Grid */}
        {filteredMovies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredMovies.map((movie, idx) => (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group relative flex flex-col"
              >
                <div 
                  onClick={() => setSelectedMovie(movie)}
                  className="relative aspect-[2/3] rounded-[2rem] overflow-hidden cursor-pointer shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-cyan-500/20"
                >
                  <img 
                    src={movie.thumbnail || "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop"} 
                    alt={movie.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <div className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[10px] font-black text-white uppercase tracking-widest">
                      {movie.subCategory}
                    </div>
                  </div>

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100">
                    <div className="w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center shadow-2xl">
                      <Play className="h-8 w-8 text-white fill-current" />
                    </div>
                  </div>

                  {/* Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl font-bold text-white mb-2 leading-tight">{movie.name}</h3>
                    <div className="flex items-center gap-4 text-xs text-slate-300 font-bold uppercase tracking-wider">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3" /> 1h 45m
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Subtitles className="h-3 w-3" /> Subtitles Available
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-xl">
            <Film className="h-20 w-20 text-slate-200 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No movies found</h3>
            <p className="text-slate-500">Try adjusting your search or category filters.</p>
          </div>
        )}
      </div>

      {/* Video Player Modal */}
      <AnimatePresence>
        {selectedMovie && (
          <MoviePlayer movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
