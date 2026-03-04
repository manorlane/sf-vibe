import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { 
  Calendar, Music, Palette, Mic2, Trees, Ticket, Utensils, Star, Search, MapPin, 
  Filter, Shuffle, ExternalLink, ChevronRight, Clock, DollarSign, X, Sparkles, 
  Heart, RefreshCw, Info, Flame, GlassWater, Music2, Globe, Compass, ChevronLeft, ChevronRight as ChevronRightIcon
} from 'lucide-react';

/**
 * SF VIBE - FINAL VERSION
 * Paste your API Key from AI Studio into the quotes below.
 */
const apiKey = "AIzaSyBfI7qF1zWFWbnmtR1_GRNi3cp3QxnOY3U"; 

const NEIGHBORHOODS = ["All Areas", "Mission", "Chinatown", "North Beach", "Hayes Valley", "SOMA", "Richmond", "Sunset", "Marina", "Castro", "Fillmore", "Dogpatch", "Nob Hill", "Bernal Heights", "Potrero Hill", "Haight-Ashbury", "Embarcadero", "Presidio"];
const CUISINES = ["All Cuisines", "Italian", "Chinese", "Thai", "Mexican", "American", "Seafood", "Japanese", "French", "Vegetarian", "Bakery", "Korean", "Steakhouse", "Indian", "Greek", "Brunch", "Mediterranean"];

const NAV_TABS = [
  { id: 'events', icon: Compass, label: 'Explore' },
  { id: 'music', icon: Music2, label: 'Live' },
  { id: 'food', icon: Utensils, label: 'Dining' },
  { id: 'calendar', icon: Calendar, label: 'Dates' },
  { id: 'saved', icon: Heart, label: 'Saved' }
];

const INITIAL_EVENTS = [
  { id: 1, title: "Golden Gate Park Bandshell", date: "2026-03-08", category: "Music", cost: "Free", location: "Golden Gate Park", rating: 4.8, link: "https://sf.funcheap.com" },
  { id: 4, title: "Cobb's Comedy Showcase", date: "2026-03-04", category: "Comedy", cost: "$$", location: "North Beach", rating: 4.5, link: "https://cobbscomedy.com" },
  { id: 5, title: "Chinese New Year Parade", date: "2026-03-07", category: "Art", cost: "Free", location: "Chinatown", rating: 4.9, link: "https://chineseparade.com" },
];

const INITIAL_RESTAURANTS = [
  { id: 130, name: "Tony's Pizza Napoletana", neighborhood: "North Beach", cuisine: "Italian", rating: 4.8, price: "$$", link: "https://tonyspizzanapoletana.com" },
  { id: 131, name: "Original Joe's", neighborhood: "North Beach", cuisine: "Italian", rating: 4.6, price: "$$$", link: "https://originaljoes.com" },
  { id: 111, name: "Sotto Mare", neighborhood: "North Beach", cuisine: "Seafood", rating: 4.7, price: "$$", link: "https://sottomaresf.com" },
  { id: 103, name: "El Techo", neighborhood: "Mission", cuisine: "Mexican", rating: 4.5, price: "$$", link: "https://eltechosf.com" },
];

const App = () => {
  const [activeTab, setActiveTab] = useState('food');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [syncError, setSyncError] = useState(null);
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [restaurants, setRestaurants] = useState(INITIAL_RESTAURANTS);
  const [bookmarks, setBookmarks] = useState({ events: [], music: [], food: [] });
  const [foodFilter, setFoodFilter] = useState({ neighborhood: 'All Areas', cuisine: 'All Cuisines' });

  const syncLiveData = async () => {
    if (!apiKey) {
      setSyncError("Paste your API Key in main.jsx to enable live sync.");
      return;
    }
    setLoading(true);
    setSyncError(null);
    try {
      const prompt = `Find REAL upcoming events and 4.5+ star restaurants in SF for March 2026. Return JSON: { "events": [], "music": [], "restaurants": [] }.`;
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          tools: [{ "google_search": {} }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });
      const data = await response.json();
      const result = JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text || "{}");
      if (result.events) setEvents(prev => [...result.events, ...prev]);
      if (result.restaurants) setRestaurants(prev => [...result.restaurants, ...prev]);
    } catch (e) {
      setSyncError("Live Sync unavailable.");
    } finally {
      setLoading(false);
    }
  };

  const filteredFood = useMemo(() => {
    return restaurants.filter(r => {
      const nameMatch = r.name.toLowerCase().includes(search.toLowerCase());
      
      // FIXED: Smart Filtering that matches even if cases or spaces are weird
      const currentHood = foodFilter.neighborhood.toLowerCase().trim();
      const itemHood = r.neighborhood.toLowerCase().trim();
      const currentCuisine = foodFilter.cuisine.toLowerCase().trim();
      const itemCuisine = r.cuisine.toLowerCase().trim();

      const hoodMatch = foodFilter.neighborhood === 'All Areas' || itemHood === currentHood;
      const cuisineMatch = foodFilter.cuisine === 'All Cuisines' || itemCuisine === currentCuisine;
      
      return nameMatch && hoodMatch && cuisineMatch;
    });
  }, [restaurants, search, foodFilter]);

  const Card = ({ item, type }) => {
    const isBookmarked = bookmarks[type]?.includes(item.id);
    return (
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-4 relative">
        <button onClick={() => setBookmarks(p => ({...p, [type]: isBookmarked ? p[type].filter(i => i !== item.id) : [...p[type], item.id]}))} className={`absolute top-4 right-4 p-2 rounded-full ${isBookmarked ? 'bg-rose-50 text-rose-500' : 'text-slate-300'}`}>
          <Heart className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
        </button>
        <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase mb-2 inline-block tracking-wider">{item.cuisine || item.category || "Vibe"}</span>
        <h3 className="text-xl font-bold text-slate-900 mb-1 leading-tight">{item.name || item.title}</h3>
        <div className="flex items-center gap-2 mb-4 text-sm text-slate-500">
          <Star className="h-4 w-4 text-amber-500 fill-current" /> {item.rating} • {item.neighborhood}
        </div>
        <div className="flex justify-between items-center pt-4 border-t border-slate-50">
          <span className="text-xs text-slate-400">{item.date || "Open Daily"}</span>
          <a href={item.link} target="_blank" rel="noreferrer" className="text-indigo-600 font-bold text-xs">Details <ExternalLink className="h-3 w-3 inline" /></a>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FBFBFE] flex flex-col font-sans">
      <header className="bg-white border-b sticky top-0 z-50 px-4 h-16 flex items-center justify-between">
        <h1 className="font-black italic text-xl tracking-tighter">SF VIBE</h1>
        <button onClick={syncLiveData} className="bg-slate-900 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> {loading ? 'SYNCING...' : 'SYNC LIVE'}
        </button>
      </header>
      <main className="p-4 flex-1 pb-32 max-w-2xl mx-auto w-full">
        {activeTab === 'food' && (
          <div className="grid grid-cols-2 gap-2 mb-8">
            <select className="bg-white border shadow-sm text-xs font-bold px-4 py-3 rounded-2xl outline-none" value={foodFilter.neighborhood} onChange={(e) => setFoodFilter({...foodFilter, neighborhood: e.target.value})}>{NEIGHBORHOODS.map(n => <option key={n} value={n}>{n}</option>)}</select>
            <select className="bg-white border shadow-sm text-xs font-bold px-4 py-3 rounded-2xl outline-none" value={foodFilter.cuisine} onChange={(e) => setFoodFilter({...foodFilter, cuisine: e.target.value})}>{CUISINES.map(c => <option key={c} value={c}>{c}</option>)}</select>
          </div>
        )}
        <div className="space-y-2">
          {activeTab === 'food' && (filteredFood.length > 0 ? filteredFood.map(f => <Card key={f.id} item={f} type="food" />) : <div className="text-center py-20 text-slate-400 italic">No matches found.</div>)}
          {activeTab === 'events' && events.map(e => <Card key={e.id} item={e} type="events" />)}
          {activeTab === 'calendar' && (
            <div className="bg-white p-6 rounded-3xl border text-center shadow-sm">
              <h2 className="font-black mb-6 uppercase tracking-widest text-slate-400 text-xs">March 2026</h2>
              <div className="grid grid-cols-7 gap-1">
                {['S','M','T','W','T','F','S'].map(d => <div key={d} className="text-[10px] text-slate-300 font-bold">{d}</div>)}
                {[...Array(31)].map((_, i) => <div key={i} className={`aspect-square flex items-center justify-center font-bold text-sm rounded-xl ${i+1 === 3 ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-700'}`}>{i+1}</div>)}
              </div>
            </div>
          )}
          {activeTab === 'saved' && (
            <div>
              <h2 className="font-black text-2xl mb-4">Saved</h2>
              {[...events.filter(e => bookmarks.events.includes(e.id)).map(x => ({...x, t: 'events'})), ...restaurants.filter(r => bookmarks.food.includes(r.id)).map(x => ({...x, t: 'food'}))].map(i => <Card key={i.id} item={i} type={i.t} />)}
            </div>
          )}
        </div>
      </main>
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-1.5 flex gap-1 w-[90%] max-w-md shadow-2xl z-50">
        {NAV_TABS.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 flex flex-col items-center py-3 rounded-[2.2rem] transition-all ${activeTab === tab.id ? 'bg-white text-indigo-600 shadow-xl' : 'text-slate-200 hover:text-white'}`}>
            <tab.icon className="h-5 w-5 mb-1" />
            <span className="text-[8px] font-black uppercase tracking-tighter">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode><App /></React.StrictMode>);

