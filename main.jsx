import React, { useState, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { 
  Calendar, Music, Palette, Mic2, Trees, Ticket, Utensils, Star, Search, MapPin, 
  Shuffle, ExternalLink, ChevronRight, Clock, DollarSign, X, Sparkles, 
  Heart, RefreshCw, Info, Flame, GlassWater, Music2, Globe, Compass, ChevronLeft, ChevronRight as ChevronRightIcon
} from 'lucide-react';

const apiKey = import.meta.env.VITE_GEMINI_KEY;

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
  { id: 105, name: "Shizen", neighborhood: "Mission", cuisine: "Vegetarian", rating: 4.8, price: "$$", link: "https://shizensf.com" },
];

const INITIAL_VENUES = [
  { id: 201, name: "The Fillmore", neighborhood: "Fillmore", genre: "Rock / Pop", rating: 4.9, price: "$$", link: "https://thefillmore.com", nextShow: "Mar 5" },
  { id: 202, name: "Great American Music Hall", neighborhood: "Tenderloin", genre: "Indie / Jazz", rating: 4.8, price: "$$", link: "https://slimspresents.com", nextShow: "Mar 6" },
  { id: 203, name: "Bottom of the Hill", neighborhood: "Potrero Hill", genre: "Indie / Punk", rating: 4.7, price: "$", link: "https://bottomofthehill.com", nextShow: "Mar 7" },
  { id: 204, name: "Slim's", neighborhood: "SOMA", genre: "Blues / Rock", rating: 4.6, price: "$$", link: "https://slimspresents.com", nextShow: "Mar 8" },
  { id: 205, name: "The Independent", neighborhood: "Divisadero", genre: "Alternative", rating: 4.7, price: "$$", link: "https://theindependentsf.com", nextShow: "Mar 9" },
  { id: 206, name: "Jazz at Pearl's", neighborhood: "North Beach", genre: "Jazz", rating: 4.8, price: "Free", link: "https://jazzatpearls.com", nextShow: "Nightly" },
  { id: 207, name: "Café du Nord", neighborhood: "Castro", genre: "Eclectic / Folk", rating: 4.6, price: "$", link: "https://cafedunord.com", nextShow: "Mar 10" },
  { id: 208, name: "August Hall", neighborhood: "Union Square", genre: "EDM / Pop", rating: 4.5, price: "$$$", link: "https://augusthallsf.com", nextShow: "Mar 12" },
];

// Calendar tab component
const CalendarTab = ({ events }) => {
  const today = new Date(2026, 2, 3); // March 3, 2026
  const [currentMonth, setCurrentMonth] = useState({ year: 2026, month: 2 }); // 0-indexed month

  const eventDates = useMemo(() => {
    const set = new Set();
    events.forEach(e => {
      if (e.date) set.add(e.date);
    });
    return set;
  }, [events]);

  const daysInMonth = new Date(currentMonth.year, currentMonth.month + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentMonth.year, currentMonth.month, 1).getDay();
  const monthName = new Date(currentMonth.year, currentMonth.month, 1).toLocaleString('default', { month: 'long' });

  const prevMonth = () => {
    setCurrentMonth(p => {
      const d = new Date(p.year, p.month - 1, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };
  const nextMonth = () => {
    setCurrentMonth(p => {
      const d = new Date(p.year, p.month + 1, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };

  const eventsThisMonth = events.filter(e => {
    if (!e.date) return false;
    const d = new Date(e.date);
    return d.getFullYear() === currentMonth.year && d.getMonth() === currentMonth.month;
  });

  const [selectedDay, setSelectedDay] = useState(null);
  const eventsOnDay = selectedDay
    ? events.filter(e => e.date === `${currentMonth.year}-${String(currentMonth.month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`)
    : [];

  return (
    <div className="animate-in fade-in">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={prevMonth} className="p-2 rounded-full bg-white border shadow-sm">
          <ChevronLeft className="h-4 w-4 text-slate-600" />
        </button>
        <h2 className="font-black text-lg text-slate-900">{monthName} {currentMonth.year}</h2>
        <button onClick={nextMonth} className="p-2 rounded-full bg-white border shadow-sm">
          <ChevronRightIcon className="h-4 w-4 text-slate-600" />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-2">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
          <div key={d} className="text-center text-[10px] font-black text-slate-400 uppercase">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 mb-6">
        {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`empty-${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${currentMonth.year}-${String(currentMonth.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const hasEvent = eventDates.has(dateStr);
          const isToday = day === today.getDate() && currentMonth.month === today.getMonth() && currentMonth.year === today.getFullYear();
          const isSelected = selectedDay === day;
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(isSelected ? null : day)}
              className={`aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-bold transition-all
                ${isSelected ? 'bg-indigo-600 text-white shadow-lg' : isToday ? 'bg-indigo-50 text-indigo-600' : 'bg-white text-slate-700 border border-slate-100'}
                ${hasEvent && !isSelected ? 'ring-2 ring-indigo-300' : ''}
              `}
            >
              {day}
              {hasEvent && <span className={`w-1 h-1 rounded-full mt-0.5 ${isSelected ? 'bg-white' : 'bg-indigo-500'}`} />}
            </button>
          );
        })}
      </div>

      {/* Selected day events */}
      {selectedDay && (
        <div className="mb-6">
          <h3 className="font-black text-sm text-slate-500 uppercase tracking-widest mb-3">
            {eventsOnDay.length > 0 ? `Events on ${monthName} ${selectedDay}` : `No events on ${monthName} ${selectedDay}`}
          </h3>
          {eventsOnDay.map(e => (
            <div key={e.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-3">
              <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase mb-1 inline-block">{e.category}</span>
              <h4 className="font-bold text-slate-900">{e.title}</h4>
              <p className="text-xs text-slate-500 mt-1">{e.location} • {e.cost}</p>
              <a href={e.link} target="_blank" rel="noreferrer" className="text-indigo-600 font-bold text-xs mt-2 inline-block">Details →</a>
            </div>
          ))}
        </div>
      )}

      {/* Upcoming events list */}
      <h3 className="font-black text-sm text-slate-500 uppercase tracking-widest mb-3">This Month</h3>
      {eventsThisMonth.length > 0 ? eventsThisMonth.map(e => (
        <div key={e.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-3 flex items-center gap-4">
          <div className="bg-indigo-600 text-white rounded-xl w-12 h-12 flex flex-col items-center justify-center flex-shrink-0">
            <span className="text-[10px] font-black uppercase">{monthName.slice(0,3)}</span>
            <span className="text-lg font-black leading-none">{parseInt(e.date.split('-')[2])}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-slate-900 truncate">{e.title}</h4>
            <p className="text-xs text-slate-500">{e.location} • {e.cost}</p>
          </div>
          <a href={e.link} target="_blank" rel="noreferrer" className="text-indigo-600 font-bold text-xs">→</a>
        </div>
      )) : (
        <p className="text-center py-10 text-slate-400 italic">No events this month.</p>
      )}
    </div>
  );
};

const App = () => {
  const [activeTab, setActiveTab] = useState('food');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [restaurants, setRestaurants] = useState(INITIAL_RESTAURANTS);
  const [venues, setVenues] = useState(INITIAL_VENUES);
  const [bookmarks, setBookmarks] = useState({ events: [], music: [], food: [] });
  const [foodFilter, setFoodFilter] = useState({ neighborhood: 'All Areas', cuisine: 'All Cuisines' });
  const [musicSearch, setMusicSearch] = useState('');

  const syncLiveData = async () => {
    if (!apiKey) {
      alert("No API key found. Add VITE_GEMINI_KEY in Vercel Environment Variables and redeploy.");
      return;
    }
    setLoading(true);
    try {
      const prompt = `Find SF events and restaurants for March 2026. Return as JSON.`;
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], tools: [{ "google_search": {} }], generationConfig: { responseMimeType: "application/json" } })
      });
      const data = await response.json();
      const result = JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text || "{}");
      if (result.events) setEvents(prev => [...result.events, ...prev]);
      if (result.restaurants) setRestaurants(prev => [...result.restaurants, ...prev]);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const filteredFood = useMemo(() => {
    return restaurants.filter(r => {
      const nameMatch = r.name.toLowerCase().includes(search.toLowerCase());
      const currentHood = foodFilter.neighborhood.toLowerCase().trim();
      const itemHood = r.neighborhood.toLowerCase().trim();
      const currentCuisine = foodFilter.cuisine.toLowerCase().trim();
      const itemCuisine = r.cuisine.toLowerCase().trim();
      const hoodMatch = foodFilter.neighborhood === 'All Areas' || itemHood === currentHood;
      const cuisineMatch = foodFilter.cuisine === 'All Cuisines' || itemCuisine === currentCuisine;
      return nameMatch && hoodMatch && cuisineMatch;
    });
  }, [restaurants, search, foodFilter]);

  const filteredVenues = useMemo(() => {
    return venues.filter(v =>
      v.name.toLowerCase().includes(musicSearch.toLowerCase()) ||
      v.genre.toLowerCase().includes(musicSearch.toLowerCase()) ||
      v.neighborhood.toLowerCase().includes(musicSearch.toLowerCase())
    );
  }, [venues, musicSearch]);

  const Card = ({ item, type }) => {
    const isBookmarked = bookmarks[type]?.includes(item.id);
    return (
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-4 relative">
        <button onClick={() => setBookmarks(p => ({...p, [type]: isBookmarked ? p[type].filter(i => i !== item.id) : [...p[type], item.id]}))} className={`absolute top-4 right-4 p-2 rounded-full ${isBookmarked ? 'bg-rose-50 text-rose-500' : 'text-slate-300'}`}>
          <Heart className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
        </button>
        <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase mb-2 inline-block">{item.cuisine || item.genre || "SF Vibe"}</span>
        <h3 className="text-xl font-bold text-slate-900 leading-tight">{item.name || item.title}</h3>
        <p className="text-sm text-slate-500 mb-4">{item.rating} <Star className="inline h-3 w-3 fill-current text-amber-500" /> • {item.neighborhood || item.location}</p>
        <div className="flex justify-between items-center pt-4 border-t border-slate-50">
          <span className="text-xs text-slate-400">{item.nextShow || item.date || "Open Daily"}</span>
          <a href={item.link} target="_blank" rel="noreferrer" className="text-indigo-600 font-bold text-xs">Details</a>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FBFBFE] flex flex-col font-sans">
      <header className="bg-white/95 backdrop-blur-md border-b sticky top-0 z-50 px-4 h-16 flex items-center justify-between">
        <h1 className="font-black italic text-xl tracking-tighter">SF VIBE</h1>
        <button onClick={syncLiveData} className="bg-slate-900 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> {loading ? 'SYNCING...' : 'SYNC LIVE'}
        </button>
      </header>

      <main className="p-4 flex-1 pb-32 max-w-2xl mx-auto w-full">

        {/* Food filters */}
        {activeTab === 'food' && (
          <div className="grid grid-cols-2 gap-2 mb-8 animate-in fade-in">
            <select className="bg-white border shadow-sm text-xs font-bold px-4 py-3 rounded-2xl outline-none" value={foodFilter.neighborhood} onChange={(e) => setFoodFilter({...foodFilter, neighborhood: e.target.value})}>{NEIGHBORHOODS.map(n => <option key={n} value={n}>{n}</option>)}</select>
            <select className="bg-white border shadow-sm text-xs font-bold px-4 py-3 rounded-2xl outline-none" value={foodFilter.cuisine} onChange={(e) => setFoodFilter({...foodFilter, cuisine: e.target.value})}>{CUISINES.map(c => <option key={c} value={c}>{c}</option>)}</select>
          </div>
        )}

        {/* Music search */}
        {activeTab === 'music' && (
          <div className="mb-6 animate-in fade-in">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search venues or genres..."
                value={musicSearch}
                onChange={e => setMusicSearch(e.target.value)}
                className="w-full bg-white border shadow-sm text-sm pl-10 pr-4 py-3 rounded-2xl outline-none"
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          {activeTab === 'food' && (filteredFood.length > 0 ? filteredFood.map(f => <Card key={f.id} item={f} type="food" />) : <div className="text-center py-20 text-slate-400">No matches found for this filter.</div>)}
          {activeTab === 'events' && events.map(e => <Card key={e.id} item={e} type="events" />)}
          {activeTab === 'music' && (filteredVenues.length > 0 ? filteredVenues.map(v => <Card key={v.id} item={v} type="music" />) : <div className="text-center py-20 text-slate-400">No venues found.</div>)}
          {activeTab === 'calendar' && <CalendarTab events={events} />}
          {activeTab === 'saved' && (Object.values(bookmarks).flat().length > 0
            ? [
                ...events.filter(e => bookmarks.events.includes(e.id)).map(x => ({...x, t: 'events'})),
                ...venues.filter(v => bookmarks.music.includes(v.id)).map(x => ({...x, t: 'music'})),
                ...restaurants.filter(r => bookmarks.food.includes(r.id)).map(x => ({...x, t: 'food'}))
              ].map(i => <Card key={i.id} item={i} type={i.t} />)
            : <p className="text-center py-20 text-slate-400 italic">Nothing saved yet.</p>
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
