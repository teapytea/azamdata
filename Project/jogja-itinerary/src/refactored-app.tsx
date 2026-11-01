import { createContext, type FormEvent, type ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { Link, Outlet, useNavigate, useParams } from "@tanstack/react-router";

const brandLogo = "/jogja-itenerary-logo.png";
// Only parangtritisImage is genuinely Yogyakarta. The rest are stock shots inherited from the
// original UI kit, kept as placeholders under Jogja names until real photography lands.
const parangtritisImage = "/images/welcome.webp";
const merapiImage = "/assets/photos/home-hero.png";
const kaliurangImage = "/assets/photos/home-trip.png";
const candiImage = "/assets/photos/itinerary-bali.jpeg";
const malioboroImage = "/assets/photos/itinerary-tokyo.png";
const jomblangImage = "/assets/photos/explore-ibiza.png";
const kotagedeImage = "/assets/photos/explore-dubai.png";
const gunungkidulImage = "/assets/photos/explore-newzealand.jpeg";
const batikImage = "/assets/photos/explore-greece.jpeg";
const profileImage = "/assets/photos/profile.png";

type NavSection = "home" | "explore" | "itinerary" | "account";
type Trip = {
  id: string;
  date: string;
  destination: string;
  image: string;
};
type PhotoItem = {
  title: string;
  meta: string;
  extra?: string;
  image: string;
};

const trips: Trip[] = [
  { id: "kaliurang", date: "Sep 21 → Sep 24", destination: "Kaliurang, Sleman", image: kaliurangImage },
  { id: "gunungkidul", date: "Oct 04 → Oct 08", destination: "Gunungkidul, DIY", image: gunungkidulImage },
  { id: "kotagede", date: "Nov 15 → Nov 17", destination: "Kotagede, Yogyakarta", image: kotagedeImage },
];

const recentlyViewed: PhotoItem[] = [
  { title: "3 days trip to Gunungkidul", meta: "2 hotels · 5 destinations", extra: "+7 more", image: gunungkidulImage },
  { title: "2 days trip to Malioboro", meta: "1 hotel · 6 destinations", extra: "+4 more", image: malioboroImage },
  { title: "4 days trip to Kaliurang", meta: "2 hotels · 4 destinations", extra: "+3 more", image: kaliurangImage },
];

const popularItineraries: PhotoItem[] = [
  { title: "4 days trip to Borobudur & Prambanan", meta: "3 hotels · 5 destinations", extra: "+6 more", image: candiImage },
  { title: "2 days trip to Parangtritis", meta: "1 hotel · 4 destinations", extra: "+2 more", image: parangtritisImage },
  { title: "5 days trip to Jogja Heritage", meta: "3 hotels · 8 destinations", extra: "+9 more", image: kotagedeImage },
];

const popularActivities: PhotoItem[] = [
  { title: "Jeep Lava Tour Merapi", meta: "300 visitors", image: merapiImage },
  { title: "Susur Goa Jomblang", meta: "180 visitors", image: jomblangImage },
  { title: "Kelas membatik Kotagede", meta: "120 visitors", image: batikImage },
  { title: "Sunset berkuda Parangtritis", meta: "260 visitors", image: parangtritisImage },
];

const matchTitle = (items: PhotoItem[], query: string) =>
  items.filter((item) => item.title.toLowerCase().includes(query.trim().toLowerCase()));

type ActivityKind = "transport" | "hotel" | "restaurant" | "location" | "cafe" | "event";
type RundownActivity = {
  id: string;
  time: string;
  title: string;
  kind: ActivityKind;
  address?: string;
  hours?: string;
  distance?: string;
  rating?: string;
  directions?: boolean;
  image?: string;
};
type RundownDay = {
  id: string;
  label: string;
  ordinal: string;
  activities: RundownActivity[];
};
type FlightLeg = {
  id: string;
  departTime: string;
  departCode: string;
  departCity: string;
  arriveTime: string;
  arriveCode: string;
  arriveCity: string;
  duration: string;
  number: string;
  gate: string;
  seat: string;
};

const activityIcons: Record<ActivityKind, string> = {
  transport: "✈",
  hotel: "▣",
  restaurant: "♜",
  location: "◉",
  cafe: "▤",
  event: "▦",
};

const initialRundown: RundownDay[] = [
  {
    id: "day-1",
    label: "Thursday, 21 Aug",
    ordinal: "1st day",
    activities: [
      { id: "a1", time: "07:35 AM", title: "Tiba di Bandara YIA Kulon Progo", kind: "transport" },
      { id: "a2", time: "11:00 AM", title: "Gudeg Yu Djum Wijilan", kind: "restaurant", address: "Jl. Wijilan No.167, Panembahan", hours: "Open now – 10:00 PM", distance: "6,4 Km", rating: "4.6 from 2.735 reviews", directions: true, image: batikImage },
      { id: "a3", time: "02:00 PM", title: "Keraton Ngayogyakarta Hadiningrat", kind: "location", address: "Jl. Rotowijayan Blok No. 1", hours: "8 AM – 2 PM", distance: "1,2 Km", directions: true },
      { id: "a4", time: "05:00 PM", title: "Menyusuri Malioboro", kind: "location", address: "Jl. Malioboro, Sosromenduran", distance: "2,1 Km" },
      { id: "a5", time: "08:00 PM", title: "Greenhost Boutique Hotel", kind: "hotel", address: "Jl. Prawirotaman II No.629", hours: "Aug 21 – Aug 24", distance: "3,5 Km", image: kotagedeImage },
    ],
  },
  {
    id: "day-2",
    label: "Friday, 22 Aug",
    ordinal: "2nd day",
    activities: [
      { id: "b1", time: "04:30 AM", title: "Sunrise Punthuk Setumbu", kind: "location", address: "Karangrejo, Borobudur", hours: "4 AM – 9 AM", distance: "38 Km", directions: true },
      { id: "b2", time: "08:00 AM", title: "Candi Borobudur", kind: "location", address: "Jl. Badrawati, Borobudur", hours: "6 AM – 5 PM", distance: "41 Km", directions: true },
      { id: "b3", time: "12:30 PM", title: "Bale Raos Restaurant", kind: "restaurant", address: "Jl. Magangan Kulon No.1", hours: "Open now – 9:00 PM", distance: "4,6 Km", rating: "4.5 from 1.204 reviews", directions: true, image: candiImage },
      { id: "b4", time: "03:00 PM", title: "Candi Prambanan", kind: "location", address: "Jl. Raya Solo – Yogyakarta No.16", hours: "6:30 AM – 5 PM", distance: "17 Km", directions: true },
      { id: "b5", time: "07:00 PM", title: "Greenhost Boutique Hotel", kind: "hotel", address: "Jl. Prawirotaman II No.629", hours: "Aug 21 – Aug 24", distance: "3,5 Km", image: kotagedeImage },
    ],
  },
  {
    id: "day-3",
    label: "Saturday, 23 Aug",
    ordinal: "3rd day",
    activities: [
      { id: "c1", time: "06:00 AM", title: "Jeep Lava Tour Merapi", kind: "event", address: "Kaliurang, Sleman", hours: "5 AM – 4 PM", distance: "26 Km", directions: true },
      { id: "c2", time: "11:00 AM", title: "Kopi Klotok Pakem", kind: "cafe", address: "Jl. Kaliurang KM 16, Pakem", hours: "Open now – 8:00 PM", distance: "18 Km", rating: "4.4 from 3.118 reviews", image: jomblangImage },
      { id: "c3", time: "02:00 PM", title: "Workshop perak Kotagede", kind: "event", address: "Jl. Kemasan, Kotagede", hours: "9 AM – 5 PM", distance: "7,8 Km", directions: true },
      { id: "c4", time: "05:00 PM", title: "Sunset Pantai Parangtritis", kind: "location", address: "Kretek, Bantul", hours: "24 hours", distance: "28 Km", directions: true },
      { id: "c5", time: "09:00 PM", title: "Greenhost Boutique Hotel", kind: "hotel", address: "Jl. Prawirotaman II No.629", hours: "Aug 21 – Aug 24", distance: "3,5 Km", image: kotagedeImage },
    ],
  },
];

const flightLegs: FlightLeg[] = [
  { id: "out", departTime: "6:20 AM", departCode: "CGK", departCity: "Jakarta", arriveTime: "7:35 AM", arriveCode: "YIA", arriveCity: "Yogyakarta", duration: "1h 15m", number: "GA 204", gate: "B2", seat: "G8" },
  { id: "back", departTime: "7:10 PM", departCode: "YIA", departCity: "Yogyakarta", arriveTime: "8:25 PM", arriveCode: "CGK", arriveCity: "Jakarta", duration: "1h 15m", number: "GA 219", gate: "A4", seat: "12C" },
];

const filterKinds: Record<string, { title: string; kind: ActivityKind }> = {
  restaurant: { title: "Restaurant", kind: "restaurant" },
  hotel: { title: "Hotel", kind: "hotel" },
};

const daysOfKind = (days: RundownDay[], kind: ActivityKind) =>
  days
    .map((day) => ({ ...day, activities: day.activities.filter((activity) => activity.kind === kind) }))
    .filter((day) => day.activities.length > 0);

type AppState = {
  hasItinerary: boolean;
  setHasItinerary: (value: boolean) => void;
  itineraryDraft: {
    name: string;
    startDate: string;
    endDate: string;
    flightNumber: string;
    flightSaved: boolean;
  };
  updateItineraryDraft: (patch: Partial<AppState["itineraryDraft"]>) => void;
  rundown: RundownDay[];
  removeActivity: (id: string) => void;
  toast: (message: string) => void;
};

const AppStateContext = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [hasItinerary, setHasItinerary] = useState(false);
  const [itineraryDraft, setItineraryDraft] = useState<AppState["itineraryDraft"]>({
    name: "",
    startDate: "",
    endDate: "",
    flightNumber: "AK 5798",
    flightSaved: false,
  });
  const [rundown, setRundown] = useState<RundownDay[]>(initialRundown);
  const [message, setMessage] = useState<string | null>(null);

  const toast = (nextMessage: string) => {
    setMessage(nextMessage);
    window.setTimeout(() => setMessage(null), 2200);
  };

  const removeActivity = (id: string) =>
    setRundown((current) =>
      current.map((day) => ({ ...day, activities: day.activities.filter((activity) => activity.id !== id) })),
    );

  return (
    <AppStateContext.Provider value={{
      hasItinerary,
      setHasItinerary,
      itineraryDraft,
      updateItineraryDraft: (patch) => setItineraryDraft((current) => ({ ...current, ...patch })),
      rundown,
      removeActivity,
      toast,
    }}>
      {children}
      {message && <div className="toast" role="status">{message}</div>}
    </AppStateContext.Provider>
  );
}

function useAppState() {
  const state = useContext(AppStateContext);
  if (!state) throw new Error("AppStateProvider is missing");
  return state;
}

function BrandLogo() {
  return (
    <Link className="ui-brand" to="/home" aria-label="JogjaItinerary home">
      <img src={brandLogo} alt="JogjaItinerary" />
    </Link>
  );
}

function StatusChrome({ dark = false }: { dark?: boolean }) {
  return (
    <div className={`ui-status ${dark ? "ui-status-dark" : ""}`} aria-hidden="true">
      <span>9:41</span>
      <div className="ui-status-icons"><i /><i /><i /><b /></div>
    </div>
  );
}

function HomeIndicator() {
  return <div className="ui-home-indicator" aria-hidden="true" />;
}

function PhonePage({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <main className={`ui-phone ${className}`}>{children}<HomeIndicator /></main>;
}

function SearchField({ value, onChange, placeholder = "Search your destination" }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <label className="ui-search">
      <span aria-hidden="true">⌕</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  );
}

function BottomNav({ active, onAdd }: { active: NavSection; onAdd?: () => void }) {
  const items: Array<{ key: NavSection; label: string; to: string; icon: string }> = [
    { key: "home", label: "Home", to: "/home", icon: "⌂" },
    { key: "explore", label: "Explore", to: "/explore", icon: "◈" },
    { key: "itinerary", label: "Itinerary", to: "/itinerary", icon: "▥" },
    { key: "account", label: "Account", to: "/account", icon: "●" },
  ];

  return (
    <nav className="ui-bottom-nav" aria-label="Primary navigation">
      {items.slice(0, 2).map((item) => (
        <Link key={item.key} to={item.to} className={`ui-nav-item ${active === item.key ? "active" : ""}`} activeOptions={{ exact: true }}>
          <span className="ui-nav-icon" aria-hidden="true">{item.icon}</span><span>{item.label}</span>
        </Link>
      ))}
      <button className="ui-nav-add" type="button" aria-label="New itinerary" onClick={onAdd}>＋</button>
      {items.slice(2).map((item) => (
        <Link key={item.key} to={item.to} className={`ui-nav-item ${active === item.key ? "active" : ""}`} activeOptions={{ exact: true }}>
          <span className="ui-nav-icon" aria-hidden="true">{item.icon}</span><span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}

function CategoryTabs({ active, onChange }: { active: string; onChange: (value: string) => void }) {
  const categories = ["All", "◈ Candi", "〰 Pantai", "▲ Gunung", "♣ Alam", "❖ Budaya", "♨ Kuliner"];
  return (
    <div className="ui-category-tabs" role="tablist" aria-label="Destination categories">
      {categories.map((category) => (
        <button key={category} className={active === category ? "active" : ""} type="button" role="tab" aria-selected={active === category} onClick={() => onChange(category)}>
          {category}
        </button>
      ))}
    </div>
  );
}

function TripCard({ trip, onClick }: { trip: Trip; onClick: () => void }) {
  return (
    <button className="trip-card" type="button" onClick={onClick}>
      <img src={trip.image} alt="" />
      <span className="trip-card-shade" />
      <span className="trip-date">{trip.date}</span>
      <span className="trip-card-copy"><small>Travel to</small><strong>{trip.destination}</strong></span>
      <span className="trip-members"><i /><i />→</span>
    </button>
  );
}

function PhotoTile({ item, onClick }: { item: PhotoItem; onClick: () => void }) {
  return (
    <button className="photo-tile" type="button" onClick={onClick}>
      <img src={item.image} alt="" />
      <span className="photo-tile-title">{item.title}</span>
      <small>{item.meta}{item.extra && <em> {item.extra}</em>}</small>
    </button>
  );
}

function HomePage() {
  const navigate = useNavigate();
  const { hasItinerary, toast } = useAppState();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [welcomeVisible, setWelcomeVisible] = useState(true);

  const recent = useMemo(() => matchTitle(recentlyViewed, search), [search]);
  const itineraries = useMemo(() => matchTitle(popularItineraries, search), [search]);
  const activities = useMemo(() => matchTitle(popularActivities, search), [search]);
  const noResults = recent.length === 0 && itineraries.length === 0 && activities.length === 0;

  const addItinerary = () => {
    void navigate({ to: "/itinerary/create/$step", params: { step: "4" } });
  };

  return (
    <PhonePage className="ui-page home-page">
      <StatusChrome dark />
      <div className="ui-scroll-area">
        <section className="home-hero">
          <img src={merapiImage} alt="" />
          <div className="home-hero-overlay" />
          <div className="home-location"><strong>Gunung Merapi</strong><span>● Sleman, DI Yogyakarta</span></div>
          <SearchField value={search} onChange={setSearch} />
        </section>
        <CategoryTabs active={category} onChange={setCategory} />
        <div className="home-content">
          {hasItinerary ? (
            <section className="home-section trip-section">
              <h2>Your trip</h2>
              <TripCard trip={trips[0]} onClick={() => navigate({ to: "/itinerary" })} />
            </section>
          ) : welcomeVisible ? (
            <section className="welcome-card">
              <button className="welcome-close" type="button" aria-label="Dismiss welcome" onClick={() => setWelcomeVisible(false)}>×</button>
              <h2>Welcome Traveler!</h2>
              <p>Start your journey with your first trip<br />and plan your itinerary</p>
              <button type="button" onClick={addItinerary}>＋ New Itinerary</button>
            </section>
          ) : (
            <button className="empty-trip-cta" type="button" onClick={addItinerary}>＋ Create your first itinerary</button>
          )}
          {recent.length > 0 && (
            <section className="home-section">
              <h2>Recently viewed</h2>
              <div className="horizontal-tiles">{recent.map((item) => <PhotoTile key={item.title} item={item} onClick={() => toast(`${item.title} dibuka`)} />)}</div>
            </section>
          )}
          {itineraries.length > 0 && (
            <section className="home-section">
              <h2>Popular itinerary</h2>
              <div className="horizontal-tiles">{itineraries.map((item) => <PhotoTile key={item.title} item={item} onClick={() => toast(`${item.title} dipilih`)} />)}</div>
            </section>
          )}
          {activities.length > 0 && (
            <section className="home-section">
              <h2>Popular Activities</h2>
              <div className="horizontal-tiles">{activities.map((item) => <PhotoTile key={item.title} item={item} onClick={() => toast(`${item.title} dipilih`)} />)}</div>
            </section>
          )}
          {noResults && <p className="home-empty">Tidak ada hasil untuk “{search}”.</p>}
        </div>
      </div>
      <BottomNav active="home" onAdd={addItinerary} />
    </PhonePage>
  );
}

function ExplorePage() {
  const navigate = useNavigate();
  const { toast } = useAppState();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const categories = ["All", "Flight", "Cars", "Gym", "Restaurant", "Cafe", "Events"];
  const recent = matchTitle(recentlyViewed, search);
  const itineraries = matchTitle(popularItineraries, search);

  return (
    <PhonePage className="ui-page section-page explore-page">
      <StatusChrome />
      <div className="ui-scroll-area">
        <SearchField value={search} onChange={setSearch} />
        <div className="explore-category-grid" role="list">
          {categories.slice(1).map((category) => <button key={category} type="button" className={selectedCategory === category ? "selected" : ""} onClick={() => { setSelectedCategory(category); toast(`${category} dipilih`); }}><span>{category === "Flight" ? "✈" : category === "Cars" ? "▣" : category === "Gym" ? "⌁" : category === "Restaurant" ? "♜" : category === "Cafe" ? "▤" : "▦"}</span>{category}</button>)}
        </div>
        <ContentSection title="Recently viewed">
          <div className="horizontal-tiles">{recent.map((item) => <PhotoTile key={item.title} item={item} onClick={() => toast(`${item.title} dibuka`)} />)}</div>
        </ContentSection>
        <ContentSection title="Popular itinerary">
          <div className="horizontal-tiles">{itineraries.map((item) => <PhotoTile key={item.title} item={item} onClick={() => toast(`${item.title} dibuka`)} />)}</div>
        </ContentSection>
      </div>
      <BottomNav active="explore" onAdd={() => navigate({ to: "/itinerary/create/$step", params: { step: "4" } })} />
    </PhonePage>
  );
}

function ContentSection({ title, children }: { title: string; children: ReactNode }) {
  return <section className="ui-content-section"><h2>{title}</h2>{children}</section>;
}

function DetailSheet({ trip, onClose, onView }: { trip: Trip; onClose: () => void; onView: () => void }) {
  return (
    <div className="sheet-backdrop" role="presentation" onClick={onClose}>
      <section className="detail-sheet" role="dialog" aria-modal="true" aria-label={trip.destination} onClick={(event) => event.stopPropagation()}>
        <button className="sheet-close" type="button" aria-label="Close" onClick={onClose}>×</button>
        <img src={trip.image} alt="" />
        <p>{trip.date}</p>
        <h2>{trip.destination}</h2>
        <button className="primary-action" type="button" onClick={onView}>View itinerary</button>
      </section>
    </div>
  );
}

function ItineraryPage() {
  const navigate = useNavigate();
  const { toast, updateItineraryDraft } = useAppState();
  const [tab, setTab] = useState<"all" | "upcoming">("all");
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const visible = tab === "all" ? trips : trips.slice(1);

  const viewTrip = (trip: Trip) => {
    const [startDate, endDate] = trip.date.split(" → ");
    updateItineraryDraft({ name: `Travel to ${trip.destination}`, startDate, endDate });
    void navigate({ to: "/itinerary/rundown" });
  };

  return (
    <PhonePage className="ui-page section-page itinerary-page">
      <StatusChrome />
      <div className="itinerary-heading"><h1>Itinerary</h1></div>
      <div className="itinerary-tabs" role="tablist">
        <button className={tab === "all" ? "active" : ""} type="button" role="tab" onClick={() => setTab("all")} aria-selected={tab === "all"}>☰ &nbsp;All Trip</button>
        <button className={tab === "upcoming" ? "active" : ""} type="button" role="tab" onClick={() => setTab("upcoming")} aria-selected={tab === "upcoming"}>♧ &nbsp;Upcoming Itinerary</button>
      </div>
      <div className="ui-scroll-area itinerary-list">{visible.map((trip) => <TripCard key={trip.id} trip={trip} onClick={() => setSelectedTrip(trip)} />)}</div>
      <BottomNav active="itinerary" onAdd={() => navigate({ to: "/itinerary/create/$step", params: { step: "4" } })} />
      {selectedTrip && <DetailSheet trip={selectedTrip} onClose={() => setSelectedTrip(null)} onView={() => viewTrip(selectedTrip)} />}
    </PhonePage>
  );
}

type CreateItineraryStep = "4" | "5" | "6";

function FlowTopBar({
  rightLabel,
  title,
  onBack,
  onCancel,
  onSave,
}: {
  rightLabel?: string;
  title?: string;
  onBack?: () => void;
  onCancel?: () => void;
  onSave?: () => void;
}) {
  return (
    <div className={`flow-topbar ${title ? "flow-topbar-modal" : ""}`}>
      {title ? <button type="button" className="flow-action flow-cancel" onClick={onCancel}>Cancel</button> : <button type="button" className="flow-back" aria-label="Back" onClick={onBack}>‹</button>}
      {title && <strong>{title}</strong>}
      {title ? <button type="button" className="flow-action flow-save" onClick={onSave}>Save</button> : <span className="flow-days">{rightLabel}</span>}
    </div>
  );
}

function ItinerarySurface({ step, onBack, onNewActivity, onContinue, withFlight = false, onNameFocus, onDateFocus }: {
  step: CreateItineraryStep;
  onBack?: () => void;
  onNewActivity: () => void;
  onContinue?: () => void;
  withFlight?: boolean;
  onNameFocus?: () => void;
  onDateFocus?: () => void;
}) {
  const { itineraryDraft, updateItineraryDraft } = useAppState();
  const isFinal = step === "6";
  const name = itineraryDraft.name || (step === "5" ? "Travel to" : isFinal ? "Travel to Zurich, Switzerland" : "");
  const startDate = itineraryDraft.startDate || (isFinal ? "August 21, 2023" : "");
  const endDate = itineraryDraft.endDate || (isFinal ? "September 2, 2023" : "");
  const activityCount = withFlight ? 1 : 0;

  return (
    <div className="itinerary-surface">
      <FlowTopBar rightLabel={isFinal ? "12 days" : "0 days"} onBack={onBack} />
      <section className="itinerary-draft-card">
        <div className="itinerary-name-row">
          <input aria-label="Itinerary name" value={name} placeholder="Itinerary name" onFocus={onNameFocus} onChange={(event) => updateItineraryDraft({ name: event.target.value })} />
        </div>
        <div className="itinerary-date-row">
          <label><span>{isFinal ? "Sunday" : "Starts"}</span><input aria-label="Start date" value={startDate} placeholder="Start Dates" onFocus={onDateFocus} onChange={(event) => updateItineraryDraft({ startDate: event.target.value })} /></label>
          <span className="date-arrow">→</span>
          <label className="date-end"><span>{isFinal ? "Friday" : "Ends"}</span><input aria-label="End date" value={endDate} placeholder="End Dates" onChange={(event) => updateItineraryDraft({ endDate: event.target.value })} /></label>
        </div>
      </section>
      <div className="activity-tile-row">
        {withFlight && <button className="activity-tile activity-tile-flight" type="button" onClick={() => undefined}><span className="activity-icon flight-icon">✈</span><span>Flight</span><b>{activityCount}</b></button>}
        <button className="activity-tile" type="button" onClick={onNewActivity}><span className="activity-icon">⊕</span><span>New activity</span></button>
      </div>
      {onContinue && <button className="itinerary-continue" type="button" onClick={onContinue}>Continue</button>}
    </div>
  );
}

export function CreateItineraryPage() {
  const { step } = useParams({ from: "/itinerary/create/$step" });
  const navigate = useNavigate();
  const safeStep: CreateItineraryStep = step === "4" || step === "5" || step === "6" ? step : "4";
  const previous = safeStep === "6" ? "5" : safeStep === "5" ? "4" : "4";
  return (
    <PhonePage className="itinerary-flow-page">
      <StatusChrome />
      <ItinerarySurface
        step={safeStep}
        onBack={() => navigate({ to: safeStep === "4" ? "/home" : "/itinerary/create/$step", params: { step: previous } })}
        onNewActivity={() => navigate({ to: "/itinerary/flight/$step", params: { step: "8" } })}
        onNameFocus={() => { if (safeStep === "4") void navigate({ to: "/itinerary/create/$step", params: { step: "5" } }); }}
        onDateFocus={() => { if (safeStep === "5") void navigate({ to: "/itinerary/create/$step", params: { step: "6" } }); }}
      />
    </PhonePage>
  );
}

type FlightStep = "8" | "9" | "10" | "11" | "12" | "13";

const activityTypes = [
  ["Hotel", "Lodging, Motel", "▣"],
  ["Restaurant", "Breakfast, Lunch, Food", "♜"],
  ["Events", "Concert, Festival", "▣"],
  ["Location", "Landmark, Tourism places", "◉"],
  ["Cafe", "Coffee, Snacks", "▰"],
  ["Fitness", "Sport", "✚"],
  ["Shopping", "Mall, Market, Store", "▱"],
];

function FlightSummaryCard({ onClick }: { onClick: () => void }) {
  const { itineraryDraft } = useAppState();
  return (
    <button className="flight-summary-card" type="button" onClick={onClick} aria-label="Open flight detail">
      <div className="flight-summary-route">
        <div><span>⌁ 6:20 PM</span><strong>CGK</strong><small>Jakarta</small></div>
        <div className="flight-arc"><span>16h 15m</span></div>
        <div className="flight-arrival"><span>1:00 AM ⌁</span><strong>ZRH</strong><small>Zurich</small></div>
      </div>
      <div className="flight-summary-blue"><strong>{itineraryDraft.flightNumber || "AK 5798"}</strong><span>B2</span><span>G8</span><small>Flight number</small><small>Gate no.</small><small>Seat no.</small></div>
    </button>
  );
}

function FlightTypeList({ step, onFlight, onCheckFlight }: { step: "9" | "10"; onFlight: () => void; onCheckFlight: (flightNumber: string) => void }) {
  const { itineraryDraft, updateItineraryDraft } = useAppState();
  const [search, setSearch] = useState("");
  const flightValue = step === "9" ? "" : itineraryDraft.flightNumber;
  return (
    <div className="flight-type-content">
      <label className="flight-search"><span>⌕</span><input placeholder="Search your destination" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
      <div className="flight-type-list">
        <button className="flight-type-row flight-type-selected" type="button" onClick={onFlight}>
          <span className="type-icon">✈</span><span><strong>Flight</strong><small>Flight, Transport</small></span>
        </button>
        <form className="flight-check-form" onSubmit={(event) => { event.preventDefault(); onCheckFlight(flightValue || "AK 5798"); }}>
          <input aria-label="Flight number" placeholder="Flight number (e.g AA107)" value={flightValue} onChange={(event) => updateItineraryDraft({ flightNumber: event.target.value })} />
          <button type="submit">Check flight</button>
        </form>
        {activityTypes.filter(([title, subtitle]) => `${title} ${subtitle}`.toLowerCase().includes(search.toLowerCase())).map(([title, subtitle, icon]) => <button className="flight-type-row" key={title} type="button" onClick={() => undefined}><span className="type-icon">{icon}</span><span><strong>{title}</strong><small>{subtitle}</small></span></button>)}
      </div>
    </div>
  );
}

function FlightDetailSheet() {
  const segment = (airline: string) => (
    <div className="flight-detail-segment">
      <div className="segment-heading"><span className="airline-mark">{airline}</span><strong>DBX&nbsp; → &nbsp;ZRH</strong><time>▣&nbsp; Aug 20, 2023</time></div>
      <div className="segment-title"><span>Jakarta to Zurich</span><span>AA 127</span></div>
      <div className="segment-body"><div><strong>Jakarta (CGK)</strong><time>10:45 AM</time><small>Soekarno Hatta Intl. Airport</small><small>Terminal 3</small></div><p>8 hours 5 minutes</p><div><strong>Dubai (DXB)</strong><time>10:40 PM</time><small>Dubai Intl. Airport</small><small>Terminal 7</small></div></div>
    </div>
  );
  return (
    <div className="flight-detail-card">
      <div className="flight-detail-summary"><div><span>⌁ 6:20 PM</span><strong>CGK</strong><small>Jakarta</small></div><div className="flight-arc"><span>16h 15m</span></div><div className="flight-arrival"><span>1:00 AM ⌁</span><strong>ZRH</strong><small>Zurich</small></div></div>
      <div className="flight-detail-body">{segment("Emirates")}{segment("◉")}</div>
    </div>
  );
}

export function AddFlightPage() {
  const { step } = useParams({ from: "/itinerary/flight/$step" });
  const navigate = useNavigate();
  const { setHasItinerary, updateItineraryDraft } = useAppState();
  const safeStep: FlightStep = ["8", "9", "10", "11", "12", "13"].includes(step) ? step as FlightStep : "8";
  const backToCreate = () => navigate({ to: "/itinerary/create/$step", params: { step: "6" } });
  const saveFlight = () => { updateItineraryDraft({ flightSaved: true }); navigate({ to: "/itinerary/flight/$step", params: { step: "13" } }); };

  if (safeStep === "8") {
    return (
      <PhonePage className="flight-sheet-page">
        <StatusChrome dark />
        <ItinerarySurface step="6" onBack={backToCreate} onNewActivity={() => undefined} />
        <div className="flight-backdrop" />
        <section className="new-activity-sheet" role="dialog" aria-label="New Activity">
          <FlowTopBar title="New Activity" onCancel={backToCreate} />
          <div className="new-activity-form"><button type="button" onClick={() => navigate({ to: "/itinerary/flight/$step", params: { step: "9" } })}>Select activity type <span>↗</span></button><div><button type="button">Start date <span>↗</span></button><button type="button">End date <span>↗</span></button></div><textarea placeholder="Write notes" /></div>
        </section>
      </PhonePage>
    );
  }

  if (safeStep === "9" || safeStep === "10") {
    return (
      <PhonePage className="flight-type-page">
        <StatusChrome dark />
        <div className="flight-modal-panel"><FlowTopBar title="Activity Type" onCancel={backToCreate} onSave={saveFlight} /><FlightTypeList step={safeStep} onFlight={() => navigate({ to: "/itinerary/flight/$step", params: { step: "10" } })} onCheckFlight={(flightNumber) => { updateItineraryDraft({ flightNumber }); navigate({ to: "/itinerary/flight/$step", params: { step: "11" } }); }} /></div>
      </PhonePage>
    );
  }

  if (safeStep === "11") {
    return <PhonePage className="flight-type-page"><StatusChrome dark /><div className="flight-modal-panel"><FlowTopBar title="Flight Detail" onCancel={backToCreate} onSave={saveFlight} /><FlightSummaryCard onClick={() => navigate({ to: "/itinerary/flight/$step", params: { step: "12" } })} /></div></PhonePage>;
  }

  if (safeStep === "12") {
    return <PhonePage className="flight-type-page flight-detail-page"><StatusChrome dark /><div className="flight-modal-panel"><FlowTopBar title="Flight Detail" onCancel={backToCreate} onSave={saveFlight} /><FlightDetailSheet /></div></PhonePage>;
  }

  return (
    <PhonePage className="itinerary-flow-page">
      <StatusChrome />
      <ItinerarySurface step="6" onBack={backToCreate} onNewActivity={() => navigate({ to: "/itinerary/flight/$step", params: { step: "8" } })} withFlight onContinue={() => { setHasItinerary(true); navigate({ to: "/itinerary" }); }} />
    </PhonePage>
  );
}

const accountOptions = [
  { label: "Edit Profile", icon: "◎" },
  { label: "Notifications", icon: "♧" },
  { label: "Invite & Earn", icon: "♧" },
  { label: "Calendar", icon: "□" },
  { label: "Itinerary", icon: "▥" },
];

const settingOptions = [
  { label: "General", icon: "⚙" },
  { label: "Help Center", icon: "?" },
  { label: "Legal & Privacy", icon: "◌" },
];

function AccountPage() {
  const navigate = useNavigate();
  const { toast } = useAppState();
  const [selected, setSelected] = useState<string | null>(null);
  const option = selected ? [...accountOptions, ...settingOptions].find((item) => item.label === selected) : null;

  return (
    <PhonePage className="ui-page section-page account-page">
      <StatusChrome />
      <div className="account-header">
        <h1>Account</h1>
        <div className="account-profile"><img src={profileImage} alt="" /><span><strong>Alfonso Schleifer</strong><small>● Inglewood, US</small></span></div>
      </div>
      <div className="account-scroll ui-scroll-area">
        <div className="account-shortcuts">
          {["🎁 Rewards", "♥ Wishlist", "▣ Moment", "♣ Friends"].map((item) => <button key={item} type="button" onClick={() => toast(`${item.split(" ")[1]} dibuka`)}>{item.split(" ")[0]}<span>{item.substring(item.indexOf(" ") + 1)}</span></button>)}
        </div>
        <AccountGroup title="Account" items={accountOptions} onSelect={setSelected} />
        <AccountGroup title="Settings" items={settingOptions} onSelect={setSelected} />
      </div>
      <BottomNav active="account" onAdd={() => navigate({ to: "/itinerary/create/$step", params: { step: "4" } })} />
      {option && <div className="toast account-toast" role="status"><strong>{option.label}</strong><span>Screen detail siap dihubungkan ke backend.</span><button type="button" onClick={() => setSelected(null)}>×</button></div>}
    </PhonePage>
  );
}

function AccountGroup({ title, items, onSelect }: { title: string; items: typeof accountOptions; onSelect: (label: string) => void }) {
  return <section className="account-group"><h2>{title}</h2>{items.map((item) => <button className="account-row" type="button" key={item.label} onClick={() => onSelect(item.label)}><span><i>{item.icon}</i>{item.label}</span><b>→</b></button>)}</section>;
}

function AuthFrame({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <PhonePage className={`auth-page ${className}`}><StatusChrome />{children}</PhonePage>;
}

function AuthWelcome() {
  const navigate = useNavigate();
  return <AuthFrame className="auth-welcome"><BrandLogo /><div className="auth-visual"><span>✈</span><span>◉</span><span>⌁</span><span>▣</span></div><div className="auth-welcome-copy"><h1>Your Journey,<br />Made Effortless</h1><p>Discover smarter travel with your personal AI companion from planning to exploring.</p></div><button className="primary-action auth-submit" type="button" onClick={() => navigate({ to: "/login/$step", params: { step: "2" } })}>Sign in</button></AuthFrame>;
}

function LoginPage() {
  const { step } = useParams({ from: "/login/$step" });
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  if (step === "1") return <AuthWelcome />;
  if (step === "3") return <AuthFrame className="auth-sheet-page"><div className="auth-sheet"><button type="button" className="sheet-back" onClick={() => navigate({ to: "/login/$step", params: { step: "2" } })}>‹</button><h2>Sign in with Apple</h2><BrandLogo /><p>Start organizing your trips in one place — easy, fast, and personalized.</p><div className="apple-account"><b>AS</b><span>Alfonso Schleifer<small>Your Apple account</small></span></div><button className="primary-action" type="button" onClick={() => navigate({ to: "/home" })}>Continue as Alfonso</button></div></AuthFrame>;
  return <AuthFrame className="auth-form-page"><BrandLogo /><div className="auth-copy-block"><h1>Sign in or create an Account</h1><p>Start organizing your trips in one place — easy, fast, and personalized.</p></div><form className="auth-real-form" onSubmit={(event) => { event.preventDefault(); navigate({ to: "/home" }); }}><label>Email<input type="email" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><button className="primary-action" type="submit">Continue</button><span className="auth-or">Or</span><button className="social-real" type="button">🌈 Sign in with Google</button><button className="social-real dark" type="button" onClick={() => navigate({ to: "/login/$step", params: { step: "3" } })}>● Sign in with Apple</button><button className="social-real" type="button">ⓕ Sign in with Facebook</button><p>Don’t have an Account? <button type="button" onClick={() => navigate({ to: "/onboarding/$step", params: { step: "3" } })}>Create account</button></p></form></AuthFrame>;
}

function RegisterPage() {
  const { step } = useParams({ from: "/onboarding/$step" });
  const navigate = useNavigate();
  if (step === "1") return <AuthWelcome />;
  if (step === "2") return <AuthFrame className="auth-welcome"><BrandLogo /><div className="auth-welcome-copy"><h1>Your Journey,<br />Made Effortless</h1><p>Discover smarter travel with your personal AI companion from planning to exploring.</p></div><button className="primary-action auth-submit" type="button" onClick={() => navigate({ to: "/login/$step", params: { step: "2" } })}>Sign in</button></AuthFrame>;
  const next = step === "3" ? "4" : step === "4" ? "6" : step === "6" ? "7" : "9";
  const final = step === "9";
  return <AuthFrame className="register-page"><div className="register-progress"><span /><span className={step !== "3" ? "active" : ""} /><span className={["6", "7", "9"].includes(step) ? "active" : ""} /><span className={["7", "9"].includes(step) ? "active" : ""} /></div><BrandLogo /><div className="auth-copy-block"><h1>{step === "3" ? "Sign in or create an Account" : step === "4" ? "Please Verify your email" : step === "6" ? "What name do you use on your JogjaItinerary ID?" : step === "7" ? "Enter your password" : "You’re ready to explore"}</h1><p>{step === "4" ? "We’ve sent a confirmation link to your email. Please verify your email to continue." : "Complete this step to personalize your travel experience."}</p></div>{final ? <button className="primary-action auth-submit" type="button" onClick={() => navigate({ to: "/home" })}>Explore JogjaItinerary</button> : <form className="auth-real-form register-form" onSubmit={(event) => { event.preventDefault(); navigate({ to: "/onboarding/$step", params: { step: next } }); }}><label>{step === "3" ? "Email" : step === "4" ? "Code" : step === "6" ? "First name" : "Password"}<input type={step === "7" ? "password" : "text"} placeholder={step === "4" ? "Code" : "Enter value"} required /></label>{step === "6" && <label>Surname<input placeholder="surname" required /></label>}<button className="primary-action" type="submit">{step === "7" ? "Done" : "Continue"}</button></form>}</AuthFrame>;
}

function ActivityActionSheet({ title, onEdit, onShare, onDelete, onClose }: { title: string; onEdit: () => void; onShare: () => void; onDelete: () => void; onClose: () => void }) {
  return (
    <div className="sheet-backdrop" role="presentation" onClick={onClose}>
      <section className="action-sheet" role="dialog" aria-label={`Actions for ${title}`} onClick={(event) => event.stopPropagation()}>
        <p>{title}</p>
        <button type="button" onClick={onShare}>Share</button>
        <button type="button" onClick={onEdit}>Edit</button>
        <button type="button" className="action-danger" onClick={onDelete}>Delete</button>
        <button type="button" className="action-cancel" onClick={onClose}>Cancel</button>
      </section>
    </div>
  );
}

function DeleteActivityDialog({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="sheet-backdrop dialog-backdrop" role="presentation" onClick={onCancel}>
      <section className="confirm-dialog" role="alertdialog" aria-label="Delete Activity?" onClick={(event) => event.stopPropagation()}>
        <h2>Delete Activity?</h2>
        <p>Aktivitas ini akan dihapus dari itinerary kamu dan tidak bisa dikembalikan.</p>
        <button type="button" className="confirm-delete" onClick={onConfirm}>Delete</button>
        <button type="button" className="confirm-cancel" onClick={onCancel}>Cancel</button>
      </section>
    </div>
  );
}

function ShareItinerarySheet({ onClose, onShared }: { onClose: () => void; onShared: () => void }) {
  const targets = ["AirDrop", "WhatsApp", "Messages", "Mail", "Telegram", "Copy Link"];
  return (
    <div className="sheet-backdrop" role="presentation" onClick={onClose}>
      <section className="share-sheet" role="dialog" aria-label="Share itinerary" onClick={(event) => event.stopPropagation()}>
        <div className="share-summary">
          <div>
            <small>YIA</small>
            <strong>Yogyakarta</strong>
          </div>
          <div className="share-weather"><span>☀</span><b>28°</b></div>
        </div>
        <div className="share-trip">
          <strong>Jogja Trip Rundown</strong>
          <small>Aug 21 – Aug 23, 2026 · 3 days</small>
        </div>
        <p className="share-note">Bagikan rundown ini supaya teman seperjalanan bisa melihat jadwal yang sama.</p>
        <div className="share-grid">
          {targets.map((target) => (
            <button key={target} type="button" onClick={onShared}><span aria-hidden="true">◉</span>{target}</button>
          ))}
        </div>
        <button type="button" className="primary-action" onClick={onClose}>Continue</button>
      </section>
    </div>
  );
}

function RundownItem({ activity, onMore }: { activity: RundownActivity; onMore: () => void }) {
  return (
    <li className="rundown-item">
      <span className="rundown-time">{activity.time}</span>
      <span className="rundown-marker" aria-hidden="true">{activityIcons[activity.kind]}</span>
      <div className="rundown-card">
        <div className="rundown-card-head">
          <strong>{activity.title}</strong>
          <button type="button" className="row-more" aria-label={`Actions for ${activity.title}`} onClick={onMore}>⋯</button>
        </div>
        {activity.address && <small>{activity.address}</small>}
        {activity.directions && <button type="button" className="rundown-directions">⌖ Get directions</button>}
        {activity.hours && <small className="rundown-meta">◷ {activity.hours}</small>}
        {activity.rating && <small className="rundown-meta">☆ {activity.rating}</small>}
      </div>
    </li>
  );
}

export function RundownPage() {
  const navigate = useNavigate();
  const { rundown, removeActivity, toast } = useAppState();
  const [pending, setPending] = useState<RundownActivity | null>(null);
  const [confirming, setConfirming] = useState<RundownActivity | null>(null);
  const [sharing, setSharing] = useState(false);
  const totalActivities = rundown.reduce((count, day) => count + day.activities.length, 0);

  return (
    <PhonePage className="rundown-page">
      <StatusChrome dark />
      <div className="ui-scroll-area">
        <header className="rundown-hero">
          <img src={merapiImage} alt="" />
          <div className="rundown-hero-overlay" />
          <div className="rundown-hero-bar">
            <button type="button" aria-label="Back" onClick={() => navigate({ to: "/itinerary" })}>‹</button>
            <span>
              <button type="button" aria-label="Share itinerary" onClick={() => setSharing(true)}>⇪</button>
              <button type="button" aria-label="Itinerary settings" onClick={() => toast("Pengaturan itinerary")}>⚙</button>
            </span>
          </div>
          <div className="rundown-hero-copy">
            <h1>Jogja Trip Rundown</h1>
            <p>▤ Aug 21, 2026 – Aug 23, 2026 · {totalActivities} aktivitas</p>
          </div>
        </header>
        <div className="rundown-filters">
          <button type="button" onClick={() => navigate({ to: "/itinerary/rundown/$filter", params: { filter: "restaurant" } })}>♜ Restaurant</button>
          <button type="button" onClick={() => navigate({ to: "/itinerary/rundown/$filter", params: { filter: "hotel" } })}>▣ Hotel</button>
          <button type="button" onClick={() => navigate({ to: "/itinerary/rundown/$filter", params: { filter: "flight" } })}>✈ Flight</button>
        </div>
        <div className="rundown-body">
          {rundown.map((day) => (
            <section className="rundown-day" key={day.id}>
              <div className="rundown-day-head"><strong>{day.label}</strong><span>{day.ordinal}</span></div>
              <ol className="rundown-timeline">
                {day.activities.map((activity) => <RundownItem key={activity.id} activity={activity} onMore={() => setPending(activity)} />)}
              </ol>
            </section>
          ))}
        </div>
      </div>
      <BottomNav active="itinerary" onAdd={() => navigate({ to: "/itinerary/flight/$step", params: { step: "8" } })} />
      {pending && (
        <ActivityActionSheet
          title={pending.title}
          onShare={() => { setPending(null); setSharing(true); }}
          onEdit={() => { setPending(null); navigate({ to: "/itinerary/flight/$step", params: { step: "8" } }); }}
          onDelete={() => { setConfirming(pending); setPending(null); }}
          onClose={() => setPending(null)}
        />
      )}
      {confirming && (
        <DeleteActivityDialog
          onConfirm={() => { removeActivity(confirming.id); toast(`${confirming.title} dihapus`); setConfirming(null); }}
          onCancel={() => setConfirming(null)}
        />
      )}
      {sharing && <ShareItinerarySheet onClose={() => setSharing(false)} onShared={() => { setSharing(false); toast("Rundown dibagikan"); }} />}
    </PhonePage>
  );
}

function FlightCard({ leg }: { leg: FlightLeg }) {
  return (
    <div className="flight-summary-card flight-summary-static">
      <div className="flight-summary-route">
        <div><span>⌁ {leg.departTime}</span><strong>{leg.departCode}</strong><small>{leg.departCity}</small></div>
        <div className="flight-arc"><span>{leg.duration}</span></div>
        <div className="flight-arrival"><span>{leg.arriveTime} ⌁</span><strong>{leg.arriveCode}</strong><small>{leg.arriveCity}</small></div>
      </div>
      <div className="flight-summary-blue">
        <strong>{leg.number}</strong><span>{leg.gate}</span><span>{leg.seat}</span>
        <small>Flight number</small><small>Gate no.</small><small>Seat no.</small>
      </div>
    </div>
  );
}

export function RundownFilterPage() {
  const { filter } = useParams({ from: "/itinerary/rundown/$filter" });
  const navigate = useNavigate();
  const { rundown, removeActivity, toast } = useAppState();
  const [pending, setPending] = useState<RundownActivity | null>(null);
  const [confirming, setConfirming] = useState<RundownActivity | null>(null);
  const close = () => navigate({ to: "/itinerary/rundown" });
  const config = filterKinds[filter];
  const days = config ? daysOfKind(rundown, config.kind) : [];

  return (
    <PhonePage className="filter-page">
      <StatusChrome />
      <header className="filter-head">
        <span className="filter-icon" aria-hidden="true">{config ? activityIcons[config.kind] : "✈"}</span>
        <div><strong>{config ? config.title : "Flight"}</strong><small>Trip to Yogyakarta</small></div>
        <button type="button" aria-label="Filter options" onClick={() => toast("Filter tambahan")}>⚙</button>
        <button type="button" aria-label="Close" onClick={close}>×</button>
      </header>
      <div className="ui-scroll-area filter-scroll">
        {!config ? (
          <div className="filter-flights">{flightLegs.map((leg) => <FlightCard key={leg.id} leg={leg} />)}</div>
        ) : days.length === 0 ? (
          <p className="home-empty">Belum ada {config.title.toLowerCase()} di itinerary ini.</p>
        ) : (
          days.map((day) => (
            <section className="filter-day" key={day.id}>
              <h3>{day.label}</h3>
              {day.activities.map((activity) => (
                <article className="filter-row" key={activity.id}>
                  <img src={activity.image || candiImage} alt="" />
                  <div>
                    <strong>{activity.title}</strong>
                    <small>{activity.address}</small>
                    <span>◷ {activity.hours} &nbsp; ⇢ {activity.distance}</span>
                  </div>
                  <button type="button" className="row-more" aria-label={`Actions for ${activity.title}`} onClick={() => setPending(activity)}>⋯</button>
                </article>
              ))}
            </section>
          ))
        )}
      </div>
      {pending && (
        <ActivityActionSheet
          title={pending.title}
          onShare={() => { setPending(null); toast("Aktivitas dibagikan"); }}
          onEdit={() => { setPending(null); navigate({ to: "/itinerary/flight/$step", params: { step: "8" } }); }}
          onDelete={() => { setConfirming(pending); setPending(null); }}
          onClose={() => setPending(null)}
        />
      )}
      {confirming && (
        <DeleteActivityDialog
          onConfirm={() => { removeActivity(confirming.id); toast(`${confirming.title} dihapus`); setConfirming(null); }}
          onCancel={() => setConfirming(null)}
        />
      )}
    </PhonePage>
  );
}

export function AppRoot() {
  return <Outlet />;
}

export function IndexPage() {
  const navigate = useNavigate();
  useEffect(() => { void navigate({ to: "/onboarding/$step", params: { step: "1" }, replace: true }); }, [navigate]);
  return <div className="route-loading">Loading JogjaItinerary…</div>;
}

export { AccountPage, ExplorePage, HomePage, ItineraryPage, LoginPage, RegisterPage };
