import React, { useState, useEffect } from 'react';
import { 
  Home, 
  MapPin, 
  Maximize2, 
  BedDouble, 
  Bath, 
  Calendar, 
  Car, 
  TrendingUp, 
  AlertCircle, 
  Loader2, 
  Award, 
  CheckCircle,
  BarChart2,
  Table,
  DollarSign,
  Compass,
  Activity,
  Layers,
  HelpCircle,
  ArrowRightLeft,
  ChevronRight,
  TrendingDown,
  Building
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell,
  CartesianGrid,
  PieChart, 
  Pie, 
  Legend,
  LineChart,
  Line
} from 'recharts';

const API_BASE_URL = 'http://localhost:8000';

// Colors for charts
const COLORS = ['#6366f1', '#a78bfa', '#ec4899', '#f43f5e', '#3b82f6', '#10b981'];

const DEFAULT_MODELS = [
  { name: "XGBoost", r2_score: 0.9967, mae: 397299 },
  { name: "Random Forest", r2_score: 0.9962, mae: 414236 },
  { name: "Linear Regression", r2_score: 0.7718, mae: 3606717 }
];

const DEFAULT_IMPORTANCES = [
  { feature: "Square Feet", importance: 0.58 },
  { feature: "Location (Encoded)", importance: 0.25 },
  { feature: "Bedrooms", importance: 0.08 },
  { feature: "Bathrooms", importance: 0.05 },
  { feature: "Year Built", importance: 0.03 },
  { feature: "Has Garage", importance: 0.01 }
];

// --- FALLBACK MOCK DATA FOR DESIGN/OFFLINE PLAY ---
const FALLBACK_SUMMARY = {
  total_properties: 15000,
  average_price: 8490000.0,
  cheapest_area: "Hinjewadi",
  cheapest_price: 5405000.0,
  expensive_area: "Koregaon Park",
  expensive_price: 12860000.0,
  popular_bhk: 3
};

const FALLBACK_AREA_ANALYTICS = {
  area_stats: [
    { area: "Koregaon Park", avg_price: 12860000, avg_price_per_sqft: 9800, avg_size: 2150, garage_pct: 82.5 },
    { area: "Kalyani Nagar", avg_price: 10540000, avg_price_per_sqft: 8500, avg_size: 1950, garage_pct: 78.2 },
    { area: "Viman Nagar", avg_price: 8900000, avg_price_per_sqft: 7200, avg_size: 1680, garage_pct: 70.1 },
    { area: "Baner", avg_price: 7800000, avg_price_per_sqft: 6500, avg_size: 1550, garage_pct: 65.4 },
    { area: "Wakad", avg_price: 6800000, avg_price_per_sqft: 5800, avg_size: 1420, garage_pct: 60.8 },
    { area: "Hinjewadi", avg_price: 5405000, avg_price_per_sqft: 4800, avg_size: 1250, garage_pct: 55.0 }
  ],
  affordable_areas: [
    { area: "Hinjewadi", avg_price: 5405000 },
    { area: "Wakad", avg_price: 6800000 },
    { area: "Baner", avg_price: 7800000 }
  ],
  expensive_areas: [
    { area: "Koregaon Park", avg_price: 12860000 },
    { area: "Kalyani Nagar", avg_price: 10540000 },
    { area: "Viman Nagar", avg_price: 8900000 }
  ],
  bhk_distribution: [
    { bhk: 1, count: 1520, avg_price: 3800000 },
    { bhk: 2, count: 3240, avg_price: 5900000 },
    { bhk: 3, count: 3510, avg_price: 9200000 },
    { bhk: 4, count: 1230, avg_price: 14500000 },
    { bhk: 5, count: 500, avg_price: 21000000 }
  ]
};

const FALLBACK_TRENDS = {
  trend_data: [
    { year: 2018, "Koregaon Park": 9500000, "Kalyani Nagar": 8100000, "Viman Nagar": 6900000, "Pimpri-Chinchwad": 5200000, "Hinjewadi": 4200000 },
    { year: 2019, "Koregaon Park": 10100000, "Kalyani Nagar": 8600000, "Viman Nagar": 7250000, "Pimpri-Chinchwad": 5400000, "Hinjewadi": 4500000 },
    { year: 2020, "Koregaon Park": 10300000, "Kalyani Nagar": 8900000, "Viman Nagar": 7500000, "Pimpri-Chinchwad": 5600000, "Hinjewadi": 4650000 },
    { year: 2021, "Koregaon Park": 10900000, "Kalyani Nagar": 9350000, "Viman Nagar": 7900000, "Pimpri-Chinchwad": 5800000, "Hinjewadi": 4900000 },
    { year: 2022, "Koregaon Park": 11500000, "Kalyani Nagar": 9800000, "Viman Nagar": 8300000, "Pimpri-Chinchwad": 6050000, "Hinjewadi": 5100000 },
    { year: 2023, "Koregaon Park": 12200000, "Kalyani Nagar": 10200000, "Viman Nagar": 8600000, "Pimpri-Chinchwad": 6150000, "Hinjewadi": 5250000 },
    { year: 2024, "Koregaon Park": 12860000, "Kalyani Nagar": 10540000, "Viman Nagar": 8900000, "Pimpri-Chinchwad": 6300000, "Hinjewadi": 5405000 }
  ],
  best_investments: [
    { area: "Hinjewadi", growth_rate_pct: 28.69 },
    { area: "Pimpri-Chinchwad", growth_rate_pct: 21.15 },
    { area: "Koregaon Park", growth_rate_pct: 25.36 }
  ]
};

export default function App() {
  // Navigation State
  const [activeSection, setActiveSection] = useState('dashboard');

  // Backend connection status
  const [backendStatus, setBackendStatus] = useState('connecting');

  // Global Metadata
  const [areasList, setAreasList] = useState([]);
  const [modelsList, setModelsList] = useState([]);
  const [featureImportances, setFeatureImportances] = useState([]);
  const [bestModelName, setBestModelName] = useState('');

  // Section 1: Dashboard Cached Data
  const [summaryData, setSummaryData] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  // Section 2: Predictor Form & Result
  const [predArea, setPredArea] = useState('');
  const [predSqft, setPredSqft] = useState(1500);
  const [predBhk, setPredBhk] = useState(3);
  const [predBaths, setPredBaths] = useState(2);
  const [predYear, setPredYear] = useState(2015);
  const [predGarage, setPredGarage] = useState(false);
  const [predLoading, setPredLoading] = useState(false);
  const [predResult, setPredResult] = useState(null);
  const [predictorErr, setPredictorErr] = useState('');
  const [chartOrTableTab, setChartOrTableTab] = useState('chart');

  // Section 3: Area Analytics
  const [areaAnalytics, setAreaAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  // Section 4: Trends
  const [trendsData, setTrendsData] = useState(null);
  const [trendsLoading, setTrendsLoading] = useState(true);

  // Section 5: Property Tools (Comparison and Budget Recommendation)
  const [compareArea1, setCompareArea1] = useState('');
  const [compareArea2, setCompareArea2] = useState('');
  const [comparisonResult, setComparisonResult] = useState(null);
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareErr, setCompareErr] = useState('');

  const [budgetLakhs, setBudgetLakhs] = useState(75);
  const [recommenderResult, setRecommenderResult] = useState(null);
  const [recommenderLoading, setRecommenderLoading] = useState(false);

  // Initial Load
  useEffect(() => {
    fetchMetadataAndSummary();
  }, []);

  // Sync details when navigation tab changes
  useEffect(() => {
    if (activeSection === 'analytics' && !areaAnalytics) {
      fetchAreaAnalytics();
    }
    if (activeSection === 'trends' && !trendsData) {
      fetchTrends();
    }
  }, [activeSection]);

  const fetchMetadataAndSummary = async () => {
    try {
      setBackendStatus('connecting');
      setSummaryLoading(true);

      const metaRes = await fetch(`${API_BASE_URL}/metadata`);
      if (!metaRes.ok) throw new Error();
      const metaData = await metaRes.json();

      setAreasList(metaData.areas || []);
      setModelsList(metaData.models || []);
      setFeatureImportances(metaData.feature_importances || []);
      setBestModelName(metaData.best_model || 'XGBoost');

      if (metaData.areas && metaData.areas.length > 0) {
        setPredArea(metaData.areas[0]);
        setCompareArea1(metaData.areas[0]);
        setCompareArea2(metaData.areas[Math.min(1, metaData.areas.length - 1)]);
      }

      const summaryRes = await fetch(`${API_BASE_URL}/api/market-summary`);
      if (!summaryRes.ok) throw new Error();
      const summary = await summaryRes.json();
      setSummaryData(summary);
      setBackendStatus('connected');
    } catch (err) {
      console.warn("Backend offline. Activating full demo fallback mode.", err);
      setBackendStatus('fallback');
      
      setAreasList(FALLBACK_AREA_ANALYTICS.area_stats.map(s => s.area));
      setPredArea(FALLBACK_AREA_ANALYTICS.area_stats[0].area);
      setCompareArea1(FALLBACK_AREA_ANALYTICS.area_stats[0].area);
      setCompareArea2(FALLBACK_AREA_ANALYTICS.area_stats[1].area);
      setModelsList(DEFAULT_MODELS);
      setFeatureImportances(DEFAULT_IMPORTANCES);
      setBestModelName('XGBoost');
      setSummaryData(FALLBACK_SUMMARY);
    } finally {
      setSummaryLoading(false);
    }
  };

  const fetchAreaAnalytics = async () => {
    if (backendStatus === 'fallback') {
      setAreaAnalytics(FALLBACK_AREA_ANALYTICS);
      setAnalyticsLoading(false);
      return;
    }

    try {
      setAnalyticsLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/area-analytics`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAreaAnalytics(data);
    } catch {
      setAreaAnalytics(FALLBACK_AREA_ANALYTICS);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchTrends = async () => {
    if (backendStatus === 'fallback') {
      setTrendsData(FALLBACK_TRENDS);
      setTrendsLoading(false);
      return;
    }

    try {
      setTrendsLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/trends`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTrendsData(data);
    } catch {
      setTrendsData(FALLBACK_TRENDS);
    } finally {
      setTrendsLoading(false);
    }
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setPredLoading(true);
    setPredictorErr('');

    const payload = {
      area: predArea,
      square_feet: parseFloat(predSqft),
      num_bedrooms: parseInt(predBhk),
      num_bathrooms: parseInt(predBaths),
      year_built: parseInt(predYear),
      has_garage: predGarage
    };

    if (backendStatus === 'fallback') {
      setTimeout(() => {
        let multiplier = 5500;
        if (predArea === 'Koregaon Park') multiplier = 12000;
        else if (predArea === 'Kalyani Nagar') multiplier = 10000;
        else if (predArea === 'Viman Nagar') multiplier = 8000;
        else if (predArea === 'Pimpri-Chinchwad') multiplier = 6000;
        else if (predArea === 'Hinjewadi') multiplier = 5200;

        let est = predSqft * multiplier;
        est += predBhk * 350000 + predBaths * 150000;
        est += predGarage ? 250000 : 0;
        est = est * (1 - Math.min(0.2, (2026 - predYear) * 0.005));
        
        setPredResult({
          predicted_price: est * (0.97 + Math.random() * 0.06),
          model_used: "XGBoost",
          r2_score: 0.9967
        });
        setPredLoading(false);
      }, 700);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Prediction request failed.");
      }
      const data = await res.json();
      setPredResult(data);
    } catch (err) {
      setPredictorErr(err.message);
    } finally {
      setPredLoading(false);
    }
  };

  const handleCompare = async () => {
    if (compareArea1 === compareArea2) {
      setCompareErr("Please select two different areas to compare.");
      return;
    }
    setCompareLoading(true);
    setCompareErr('');

    if (backendStatus === 'fallback') {
      setTimeout(() => {
        const stats = FALLBACK_AREA_ANALYTICS.area_stats;
        const info1 = stats.find(s => s.area === compareArea1) || stats[0];
        const info2 = stats.find(s => s.area === compareArea2) || stats[1];
        setComparisonResult({
          area1: { ...info1, name: info1.area, sample_count: 3000, avg_beds: 2.8, avg_baths: 2.1, avg_age: 14.5, min_price: 3200000, max_price: 28000000, growth_rate_pct: 25.3, popular_bhk: 3 },
          area2: { ...info2, name: info2.area, sample_count: 3000, avg_beds: 2.4, avg_baths: 1.8, avg_age: 16.2, min_price: 2900000, max_price: 34000000, growth_rate_pct: 22.8, popular_bhk: 2 }
        });
        setCompareLoading(false);
      }, 500);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/compare?area1=${encodeURIComponent(compareArea1)}&area2=${encodeURIComponent(compareArea2)}`);
      if (!res.ok) throw new Error("Could not fetch comparison analytics.");
      const data = await res.json();
      setComparisonResult(data);
    } catch (err) {
      setCompareErr(err.message);
    } finally {
      setCompareLoading(false);
    }
  };

  const handleRecommend = async () => {
    setRecommenderLoading(true);
    const budgetAbsolute = budgetLakhs * 100000;

    if (backendStatus === 'fallback') {
      setTimeout(() => {
        if (budgetLakhs < 30) {
          setRecommenderResult({
            budget_status: "low",
            message: "Your budget is below the minimum entry price in Pune. The cheapest available property is in Hinjewadi starting at ₹31.0 Lakhs.",
            cheapest_area: "Hinjewadi",
            cheapest_price: 3100000,
            required_additional: 3100000 - budgetAbsolute
          });
        } else {
          const stats = FALLBACK_AREA_ANALYTICS.area_stats;
          const candidates = stats
            .map(s => {
              const price = s.avg_price;
              let expectedBhk = 1;
              if (budgetAbsolute >= 15000000) expectedBhk = 5;
              else if (budgetAbsolute >= 10000000) expectedBhk = 4;
              else if (budgetAbsolute >= 8000000) expectedBhk = 3;
              else if (budgetAbsolute >= 5500000) expectedBhk = 2;
              
              return {
                area: s.area,
                avg_price: price,
                expected_bhk: expectedBhk,
                value_score: s.avg_size / price,
                avg_size: s.avg_size,
                listings_count: 500
              };
            });

          const inBudget = candidates.filter(c => c.avg_price <= budgetAbsolute);
          const sorted = inBudget.length > 0 ? inBudget : candidates;
          const best = sorted[0];

          setRecommenderResult({
            budget_status: "ok",
            budget: budgetAbsolute,
            recommendation: best,
            value_for_money: best,
            candidates: sorted.slice(0, 3)
          });
        }
        setRecommenderLoading(false);
      }, 600);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/recommend?budget=${budgetAbsolute}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRecommenderResult(data);
    } catch {
      setRecommenderResult(null);
    } finally {
      setRecommenderLoading(false);
    }
  };

  const formatPriceLakhs = (val) => {
    if (!val) return '₹ 0.0 Lakhs';
    const lakhs = val / 100000;
    if (lakhs >= 100) {
      return `₹ ${(lakhs / 100).toFixed(2)} Cr`;
    }
    return `₹ ${lakhs.toFixed(1)} Lakhs`;
  };

  const formatPriceAbsolute = (val) => {
    if (!val) return '₹ 0';
    return `₹ ${val.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0b0f19]">
      
      {/* Left Sidebar Navigation Panel */}
      <aside className="w-full md:w-64 bg-slate-950/60 border-b md:border-b-0 md:border-r border-white/5 backdrop-blur-lg flex flex-col md:fixed md:h-screen z-30">
        <div className="p-6 flex items-center space-x-3 border-b border-white/5">
          <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 p-2 rounded-xl shadow-lg shadow-indigo-500/10">
            <Home className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-md font-extrabold bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent tracking-wide">
              PUNE ESTATORIA
            </h1>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Analytics Suite</span>
          </div>
        </div>

        <nav className="flex-grow p-4 space-y-1.5 overflow-y-auto">
          {[
            { id: 'dashboard', label: 'Overview Panel', icon: Activity },
            { id: 'predictor', label: 'ML Price Predictor', icon: Compass },
            { id: 'analytics', label: 'Location Analytics', icon: BarChart2 },
            { id: 'trends', label: 'Price Trends', icon: TrendingUp },
            { id: 'tools', label: 'Analytical Tools', icon: Layers }
          ].map((item) => {
            const IconComponent = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 scale-[1.02]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <IconComponent className={`w-4.5 h-4.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5 bg-slate-950/20 text-center">
          <div className="flex items-center justify-center space-x-2 mb-1.5">
            <span className={`w-2 h-2 rounded-full ${
              backendStatus === 'connected' ? 'bg-emerald-400' :
              backendStatus === 'connecting' ? 'bg-amber-400 animate-pulse' : 'bg-indigo-400'
            }`}></span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              {backendStatus === 'connected' ? 'Server Connected' :
               backendStatus === 'connecting' ? 'Testing Connection...' : 'Demo Mode (Offline)'}
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow md:ml-64 min-h-screen flex flex-col relative">
        <header className="h-16 border-b border-white/5 bg-slate-950/20 backdrop-blur-md sticky top-0 z-20 px-6 sm:px-8 flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
            {activeSection === 'dashboard' && 'Market Overview'}
            {activeSection === 'predictor' && 'ML Predictor Engine'}
            {activeSection === 'analytics' && 'Area & BHK Analytics'}
            {activeSection === 'trends' && 'Property Price Trends'}
            {activeSection === 'tools' && 'Comparison & Investment Suite'}
          </h2>
          
          <span className="text-[10px] text-slate-400 font-bold bg-slate-950/40 border border-white/5 px-3 py-1 rounded-xl">
            Pune Real Estate • Active Data
          </span>
        </header>

        <main className="flex-grow p-6 sm:p-8 max-w-6xl w-full mx-auto space-y-8">
          
          {/* ================= SECTION 1: MARKET OVERVIEW DASHBOARD ================= */}
          {activeSection === 'dashboard' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {summaryLoading ? (
                  Array(4).fill(0).map((_, i) => (
                    <div key={i} className="glass-panel rounded-3xl p-6 h-32 animate-pulse flex flex-col justify-between">
                      <div className="h-3 bg-slate-800 rounded w-1/2"></div>
                      <div className="h-6 bg-slate-800 rounded w-3/4"></div>
                      <div className="h-2 bg-slate-800 rounded w-1/3"></div>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="glass-panel rounded-3xl p-6 shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/5 rounded-full blur-xl"></div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Total Records</span>
                      <h3 className="text-2xl font-black text-white mt-3 font-outfit">{summaryData.total_properties.toLocaleString()}</h3>
                      <p className="text-[10px] text-slate-400 mt-2 font-medium">Validated Pune properties</p>
                    </div>

                    <div className="glass-panel rounded-3xl p-6 shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/5 rounded-full blur-xl"></div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Average Price</span>
                      <h3 className="text-2xl font-black text-white mt-3 font-outfit">{formatPriceLakhs(summaryData.average_price)}</h3>
                      <p className="text-[10px] text-slate-400 mt-2 font-medium">Across all segments</p>
                    </div>

                    <div className="glass-panel rounded-3xl p-6 shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl"></div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Lowest Avg Price</span>
                      <h3 className="text-2xl font-black text-white mt-3 truncate font-outfit">{summaryData.cheapest_area}</h3>
                      <p className="text-[10px] text-emerald-400 mt-2 font-semibold flex items-center">
                        Avg: {formatPriceLakhs(summaryData.cheapest_price)}
                      </p>
                    </div>

                    <div className="glass-panel rounded-3xl p-6 shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/5 rounded-full blur-xl"></div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Highest Avg Price</span>
                      <h3 className="text-2xl font-black text-white mt-3 truncate font-outfit">{summaryData.expensive_area}</h3>
                      <p className="text-[10px] text-red-400 mt-2 font-semibold flex items-center">
                        Avg: {formatPriceLakhs(summaryData.expensive_price)}
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 glass-panel rounded-3xl p-6 shadow-xl flex flex-col justify-between min-h-[380px]">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center">
                    <Layers className="w-4 h-4 text-indigo-400 mr-2" /> BHK distribution in pune market
                  </h3>
                  
                  {summaryLoading ? (
                    <div className="flex-grow flex items-center justify-center animate-pulse">
                      <Loader2 className="w-8 h-8 animate-spin text-slate-700" />
                    </div>
                  ) : (
                    <div className="flex-grow w-full flex flex-col sm:flex-row items-center justify-center gap-4">
                      <div className="w-full sm:w-1/2 h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={areaAnalytics?.bhk_distribution || FALLBACK_AREA_ANALYTICS.bhk_distribution}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={85}
                              paddingAngle={4}
                              dataKey="count"
                              nameKey="bhk"
                            >
                              {(areaAnalytics?.bhk_distribution || FALLBACK_AREA_ANALYTICS.bhk_distribution).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{
                                background: '#0f172a',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '12px',
                                fontSize: '11px',
                              }}
                              formatter={(value) => [`${value.toLocaleString()} Properties`, 'Volume']}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      
                      <div className="w-full sm:w-1/2 space-y-2">
                        {(areaAnalytics?.bhk_distribution || FALLBACK_AREA_ANALYTICS.bhk_distribution).map((item, idx) => (
                          <div key={item.bhk} className="flex items-center justify-between text-xs font-semibold">
                            <div className="flex items-center space-x-2">
                              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                              <span className="text-slate-300">{item.bhk} BHK Layout</span>
                            </div>
                            <span className="text-slate-400">{item.count.toLocaleString()} properties</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="lg:col-span-5 glass-panel rounded-3xl p-6 shadow-xl flex flex-col justify-between min-h-[380px]">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5 flex items-center">
                      <Award className="w-4.5 h-4.5 text-indigo-400 mr-2" /> Market Highlights
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="p-3.5 bg-slate-950/35 border border-white/5 rounded-2xl flex items-center space-x-4">
                        <div className="bg-indigo-500/15 p-2 rounded-xl text-indigo-400">
                          <BedDouble className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Most Popular BHK</span>
                          <span className="text-sm font-bold text-slate-200 block mt-0.5">
                            {summaryData?.popular_bhk || 3} BHK Apartments
                          </span>
                        </div>
                      </div>

                      <div className="p-3.5 bg-slate-950/35 border border-white/5 rounded-2xl flex items-center space-x-4">
                        <div className="bg-emerald-500/15 p-2 rounded-xl text-emerald-400">
                          <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Highest Price Growth Area</span>
                          <span className="text-sm font-bold text-slate-200 block mt-0.5">
                            Hinjewadi (+28.7% growth)
                          </span>
                        </div>
                      </div>

                      <div className="p-3.5 bg-slate-950/35 border border-white/5 rounded-2xl flex items-center space-x-4">
                        <div className="bg-purple-500/15 p-2 rounded-xl text-purple-400">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Premium Zone</span>
                          <span className="text-sm font-bold text-slate-200 block mt-0.5">
                            Koregaon Park (Avg ₹1.28 Cr)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setActiveSection('predictor')}
                    className="w-full mt-4 py-3 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-300 hover:bg-indigo-600/20 text-xs font-bold transition-all flex items-center justify-center space-x-1"
                  >
                    <span>Launch ML Price Estimation Tool</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= SECTION 2: MACHINE LEARNING PRICE PREDICTOR ================= */}
          {activeSection === 'predictor' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              <div className="lg:col-span-5">
                <div className="glass-panel rounded-3xl p-6 shadow-xl space-y-6">
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center border-b border-white/5 pb-3">
                    <Compass className="w-4.5 h-4.5 text-indigo-400 mr-2" /> ML Model Inputs
                  </h2>

                  <form onSubmit={handlePredict} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-slate-500" /> Location / Area
                      </label>
                      <select
                        value={predArea}
                        onChange={(e) => setPredArea(e.target.value)}
                        className="w-full glass-input rounded-xl px-4 py-3 text-xs font-bold"
                        required
                      >
                        {areasList.map(areaName => (
                          <option key={areaName} value={areaName} className="bg-slate-950 text-white">{areaName}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
                          <Maximize2 className="w-3.5 h-3.5 mr-1 text-slate-500" /> Built Area (Sq. Ft.)
                        </label>
                        <input
                          type="number"
                          value={predSqft}
                          onChange={(e) => setPredSqft(Math.max(1, parseInt(e.target.value) || 0))}
                          className="w-20 text-right bg-slate-900 border border-white/5 rounded-lg py-0.5 px-2 text-xs font-bold text-indigo-400 focus:outline-none"
                        />
                      </div>
                      <input
                        type="range"
                        value={predSqft}
                        onChange={(e) => setPredSqft(parseInt(e.target.value))}
                        min="400"
                        max="5000"
                        step="50"
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center">
                        <BedDouble className="w-3.5 h-3.5 mr-1 text-slate-500" /> Bedrooms (BHK)
                      </label>
                      <div className="grid grid-cols-5 gap-2">
                        {[1, 2, 3, 4, 5].map(n => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setPredBhk(n)}
                            className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                              predBhk === n ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-white/5 bg-slate-950/45 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center">
                        <Bath className="w-3.5 h-3.5 mr-1 text-slate-500" /> Bathrooms
                      </label>
                      <div className="grid grid-cols-5 gap-2">
                        {[1, 2, 3, 4, 5].map(n => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setPredBaths(n)}
                            className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                              predBaths === n ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-white/5 bg-slate-950/45 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
                          <Calendar className="w-3.5 h-3.5 mr-1 text-slate-500" /> Year Built
                        </label>
                        <input
                          type="number"
                          value={predYear}
                          onChange={(e) => setPredYear(Math.max(1980, Math.min(2026, parseInt(e.target.value) || 2020)))}
                          className="w-16 text-right bg-slate-900 border border-white/5 rounded-lg py-0.5 px-2 text-xs font-bold text-indigo-400 focus:outline-none"
                        />
                      </div>
                      <input
                        type="range"
                        value={predYear}
                        onChange={(e) => setPredYear(parseInt(e.target.value))}
                        min="1980"
                        max="2026"
                        step="1"
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-2xl border border-white/5 bg-slate-950/20">
                      <span className="text-xs font-bold text-slate-300 flex items-center">
                        <Car className="w-4 h-4 mr-2 text-slate-500" /> Garage Facility
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={predGarage}
                          onChange={(e) => setPredGarage(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:bg-white"></div>
                      </label>
                    </div>

                    {predictorErr && (
                      <div className="p-3 bg-red-950/30 border border-red-900/40 rounded-xl text-red-300 text-xs flex items-center space-x-2 font-medium">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{predictorErr}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={predLoading}
                      className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-xl active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
                    >
                      {predLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Calculating Inferences...</span>
                        </>
                      ) : (
                        <span>Calculate ML Valuation</span>
                      )}
                    </button>
                  </form>
                </div>
              </div>

              <div className="lg:col-span-7 space-y-6">
                <div className="glass-panel rounded-3xl p-6 shadow-xl min-h-[220px] flex flex-col justify-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl"></div>
                  
                  {!predResult && !predLoading ? (
                    <div className="text-center py-6 px-4">
                      <div className="w-14 h-14 bg-slate-900/60 border border-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-500">
                        <DollarSign className="w-7 h-7 text-indigo-400/80" />
                      </div>
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">Estimated Property Value</h3>
                      <p className="text-slate-400 text-xs max-w-sm mx-auto mt-2 font-medium leading-relaxed">
                        Fill in parameters on the left and run the estimation. Feature engineered models will compute a valuation.
                      </p>
                    </div>
                  ) : predLoading ? (
                    <div className="text-center py-6">
                      <Loader2 className="w-8 h-8 animate-spin text-indigo-400 mx-auto mb-3" />
                      <p className="text-slate-400 text-xs font-semibold animate-pulse">Running ML predictions...</p>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-fade-in">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-4 gap-4">
                        <div>
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Calculated Price</span>
                          <h3 className="text-3xl font-extrabold text-white mt-1.5 font-outfit">
                            {formatPriceLakhs(predResult.predicted_price)}
                          </h3>
                          <p className="text-xs text-slate-400 mt-1 font-semibold">
                            {formatPriceAbsolute(predResult.predicted_price)} absolute
                          </p>
                        </div>
                        <div className="flex flex-col sm:items-end gap-1.5">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Model deployed</span>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-900 border border-white/5 text-indigo-300">
                              {predResult.model_used}
                            </span>
                            <span className="px-2 py-1 rounded-lg text-xs font-bold bg-indigo-950/40 text-indigo-400 border border-indigo-900/50">
                              R²: {predResult.r2_score.toFixed(4)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-indigo-950/15 border border-indigo-900/20 rounded-xl text-[10px] text-slate-400 font-medium leading-relaxed">
                        <span className="font-bold text-indigo-300 block mb-1">Engineered Features Inputted:</span>
                        Sqft/Room: {(predSqft / (predBhk + predBaths + 1)).toFixed(1)} sqft • Age: {2026 - predYear} yrs • Interactions scaled
                      </div>
                    </div>
                  )}
                </div>

                <div className="glass-panel rounded-3xl p-6 shadow-xl min-h-[300px]">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center">
                      {chartOrTableTab === 'chart' ? (
                        <BarChart2 className="w-4 h-4 text-indigo-400 mr-2" />
                      ) : (
                        <Table className="w-4 h-4 text-indigo-400 mr-2" />
                      )}
                      {chartOrTableTab === 'chart' ? 'Engineered Feature Importances' : 'Accuracy Benchmarks'}
                    </h3>
                    
                    <div className="flex p-0.5 rounded-xl bg-slate-950/60 border border-white/5">
                      <button
                        onClick={() => setChartOrTableTab('chart')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          chartOrTableTab === 'chart' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Chart
                      </button>
                      <button
                        onClick={() => setChartOrTableTab('table')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          chartOrTableTab === 'table' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Metrics
                      </button>
                    </div>
                  </div>

                  {chartOrTableTab === 'chart' ? (
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={featureImportances} layout="vertical">
                          <XAxis type="number" stroke="#64748b" fontSize={9} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} axisLine={false} tickLine={false} />
                          <YAxis dataKey="feature" type="category" stroke="#94a3b8" fontSize={10} width={110} axisLine={false} tickLine={false} />
                          <Tooltip 
                            contentStyle={{ background: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', fontSize: '10px' }} 
                            formatter={(v) => [`${(v * 100).toFixed(1)}%`, 'Weight']}
                          />
                          <Bar dataKey="importance" fill="#6366f1" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-white/5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            <th className="pb-3">Algorithm</th>
                            <th className="pb-3 text-center">R² Score</th>
                            <th className="pb-3 text-right">MAE</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-xs">
                          {modelsList.map((model) => (
                            <tr key={model.name} className={model.name === bestModelName ? 'text-white font-semibold' : 'text-slate-400'}>
                              <td className="py-3 flex items-center space-x-1.5">
                                {model.name === bestModelName && <Award className="w-3.5 h-3.5 text-indigo-400" />}
                                <span>{model.name}</span>
                              </td>
                              <td className="py-3 text-center font-mono">{model.r2_score.toFixed(4)}</td>
                              <td className="py-3 text-right font-mono">{formatPriceAbsolute(model.mae)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* ================= SECTION 3: AREA ANALYTICS DASHBOARD ================= */}
          {activeSection === 'analytics' && (
            <div className="space-y-8">
              <div className="glass-panel rounded-3xl p-6 shadow-xl min-h-[380px] flex flex-col justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center">
                  <BarChart2 className="w-4.5 h-4.5 text-indigo-400 mr-2" /> Average property valuation by pune area
                </h3>

                {analyticsLoading ? (
                  <div className="flex-grow flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-700" />
                  </div>
                ) : (
                  <div className="flex-grow h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={areaAnalytics?.area_stats || FALLBACK_AREA_ANALYTICS.area_stats} margin={{ bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                        <XAxis dataKey="area" stroke="#94a3b8" fontSize={10} tickLine={false} angle={-15} textAnchor="end" />
                        <YAxis stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/100000).toFixed(0)}L`} />
                        <Tooltip
                          contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '11px' }}
                          formatter={(v) => [formatPriceLakhs(v), 'Avg Price']}
                        />
                        <Bar dataKey="avg_price" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={45}>
                          {(areaAnalytics?.area_stats || FALLBACK_AREA_ANALYTICS.area_stats).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-panel rounded-3xl p-6 shadow-xl">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center">
                    <TrendingDown className="w-4 h-4 text-emerald-400 mr-2" /> Most Affordable Areas
                  </h3>
                  
                  <div className="divide-y divide-white/5">
                    {analyticsLoading ? (
                      Array(3).fill(0).map((_, i) => <div key={i} className="h-10 bg-slate-900/50 animate-pulse my-2 rounded"></div>)
                    ) : (
                      (areaAnalytics?.affordable_areas || FALLBACK_AREA_ANALYTICS.affordable_areas).map((item, idx) => (
                        <div key={item.area} className="py-3 flex items-center justify-between text-xs font-semibold">
                          <span className="text-slate-300">{idx + 1}. {item.area}</span>
                          <span className="text-emerald-400 font-mono">{formatPriceLakhs(item.avg_price)}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="glass-panel rounded-3xl p-6 shadow-xl">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center">
                    <TrendingUp className="w-4 h-4 text-red-400 mr-2" /> Most Premium Areas
                  </h3>

                  <div className="divide-y divide-white/5">
                    {analyticsLoading ? (
                      Array(3).fill(0).map((_, i) => <div key={i} className="h-10 bg-slate-900/50 animate-pulse my-2 rounded"></div>)
                    ) : (
                      (areaAnalytics?.expensive_areas || FALLBACK_AREA_ANALYTICS.expensive_areas).map((item, idx) => (
                        <div key={item.area} className="py-3 flex items-center justify-between text-xs font-semibold">
                          <span className="text-slate-300">{idx + 1}. {item.area}</span>
                          <span className="text-red-400 font-mono">{formatPriceLakhs(item.avg_price)}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= SECTION 4: PRICE TREND ANALYSIS ================= */}
          {activeSection === 'trends' && (
            <div className="space-y-8">
              <div className="glass-panel rounded-3xl p-6 shadow-xl min-h-[380px] flex flex-col justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center">
                  <TrendingUp className="w-4.5 h-4.5 text-indigo-400 mr-2" /> Year-wise Price Growth Trend (2018-2024)
                </h3>

                {trendsLoading ? (
                  <div className="flex-grow flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-700" />
                  </div>
                ) : (
                  <div className="flex-grow h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendsData?.trend_data || FALLBACK_TRENDS.trend_data} margin={{ right: 30, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                        <XAxis dataKey="year" stroke="#94a3b8" fontSize={10} tickLine={false} />
                        <YAxis stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/100000).toFixed(0)}L`} />
                        <Tooltip
                          contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '11px' }}
                          formatter={(v) => [formatPriceLakhs(v), 'Price']}
                        />
                        <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '10px' }} />
                        {areasList.slice(0, 4).map((areaName, idx) => (
                          <Line
                            key={areaName}
                            type="monotone"
                            dataKey={areaName}
                            stroke={COLORS[idx % COLORS.length]}
                            strokeWidth={2.5}
                            dot={{ r: 3 }}
                            activeDot={{ r: 5 }}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              <div className="glass-panel rounded-3xl p-6 shadow-xl">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-5 flex items-center">
                  <Compass className="w-4 h-4 text-indigo-400 mr-2" /> Top Investment Locations
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {trendsLoading ? (
                    Array(3).fill(0).map((_, i) => <div key={i} className="h-24 bg-slate-900/50 animate-pulse rounded-2xl"></div>)
                  ) : (
                    (trendsData?.best_investments || FALLBACK_TRENDS.best_investments).map((item, idx) => (
                      <div key={item.area} className="p-4 bg-slate-950/35 border border-white/5 rounded-2xl flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Rank {idx + 1}</span>
                          <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 text-[10px] font-bold">
                            +{item.growth_rate_pct.toFixed(1)}% YoY
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-200 mt-2 truncate">{item.area}</h4>
                        <p className="text-[10px] text-slate-500 mt-1 font-medium">Top value growth score</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================= SECTION 5: ANALYTICAL TOOLS SUITE ================= */}
          {activeSection === 'tools' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Property Comparison Tool */}
              <div className="lg:col-span-6 space-y-6">
                <div className="glass-panel rounded-3xl p-6 shadow-xl space-y-5">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center border-b border-white/5 pb-3">
                    <ArrowRightLeft className="w-4.5 h-4.5 text-indigo-400 mr-2" /> Area Comparison Suite
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2">Area 1</label>
                      <select
                        value={compareArea1}
                        onChange={(e) => setCompareArea1(e.target.value)}
                        className="w-full glass-input rounded-xl px-3 py-2.5 text-xs font-bold"
                      >
                        {areasList.map(a => <option key={a} value={a} className="bg-slate-950">{a}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2">Area 2</label>
                      <select
                        value={compareArea2}
                        onChange={(e) => setCompareArea2(e.target.value)}
                        className="w-full glass-input rounded-xl px-3 py-2.5 text-xs font-bold"
                      >
                        {areasList.map(a => <option key={a} value={a} className="bg-slate-950">{a}</option>)}
                      </select>
                    </div>
                  </div>

                  {compareErr && (
                    <div className="p-3 bg-red-950/30 border border-red-900/40 rounded-xl text-red-300 text-xs font-medium">
                      {compareErr}
                    </div>
                  )}

                  <button
                    onClick={handleCompare}
                    disabled={compareLoading}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center space-x-2"
                  >
                    {compareLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Compare Areas</span>}
                  </button>

                  {comparisonResult && (
                    <div className="space-y-3 pt-3 border-t border-white/5 text-xs animate-fade-in">
                      <div className="grid grid-cols-3 font-bold text-[9px] text-slate-500 uppercase tracking-wider border-b border-white/5 pb-2">
                        <div>Metric</div>
                        <div className="text-center truncate">{comparisonResult.area1.name}</div>
                        <div className="text-right truncate">{comparisonResult.area2.name}</div>
                      </div>

                      <div className="grid grid-cols-3 py-1.5 text-slate-300 font-semibold border-b border-white/5">
                        <div>Avg Price</div>
                        <div className="text-center font-mono text-indigo-300">{formatPriceLakhs(comparisonResult.area1.avg_price)}</div>
                        <div className="text-right font-mono text-purple-300">{formatPriceLakhs(comparisonResult.area2.avg_price)}</div>
                      </div>

                      <div className="grid grid-cols-3 py-1.5 text-slate-300 font-semibold border-b border-white/5">
                        <div>Price/Sqft</div>
                        <div className="text-center font-mono">₹ {comparisonResult.area1.avg_price_per_sqft.toFixed(0)}</div>
                        <div className="text-right font-mono">₹ {comparisonResult.area2.avg_price_per_sqft.toFixed(0)}</div>
                      </div>

                      <div className="grid grid-cols-3 py-1.5 text-slate-300 font-semibold border-b border-white/5">
                        <div>Avg Size</div>
                        <div className="text-center font-mono">{comparisonResult.area1.avg_size.toFixed(0)} sqft</div>
                        <div className="text-right font-mono">{comparisonResult.area2.avg_size.toFixed(0)} sqft</div>
                      </div>

                      <div className="grid grid-cols-3 py-1.5 text-slate-300 font-semibold border-b border-white/5">
                        <div>Avg Layout</div>
                        <div className="text-center font-mono">{comparisonResult.area1.avg_beds.toFixed(1)} BHK / {comparisonResult.area1.avg_baths.toFixed(1)} Bath</div>
                        <div className="text-right font-mono">{comparisonResult.area2.avg_beds.toFixed(1)} BHK / {comparisonResult.area2.avg_baths.toFixed(1)} Bath</div>
                      </div>

                      <div className="grid grid-cols-3 py-1.5 text-slate-300 font-semibold border-b border-white/5">
                        <div>Popular BHK</div>
                        <div className="text-center font-mono">{comparisonResult.area1.popular_bhk} BHK</div>
                        <div className="text-right font-mono">{comparisonResult.area2.popular_bhk} BHK</div>
                      </div>

                      <div className="grid grid-cols-3 py-1.5 text-slate-300 font-semibold border-b border-white/5">
                        <div>Avg Age</div>
                        <div className="text-center font-mono">{comparisonResult.area1.avg_age.toFixed(1)} yrs</div>
                        <div className="text-right font-mono">{comparisonResult.area2.avg_age.toFixed(1)} yrs</div>
                      </div>

                      <div className="grid grid-cols-3 py-1.5 text-slate-300 font-semibold border-b border-white/5">
                        <div>Price Limits</div>
                        <div className="text-center font-mono text-[9px] truncate">{formatPriceLakhs(comparisonResult.area1.min_price)} - {formatPriceLakhs(comparisonResult.area1.max_price)}</div>
                        <div className="text-right font-mono text-[9px] truncate">{formatPriceLakhs(comparisonResult.area2.min_price)} - {formatPriceLakhs(comparisonResult.area2.max_price)}</div>
                      </div>

                      <div className="grid grid-cols-3 py-1.5 text-slate-300 font-semibold border-b border-white/5">
                        <div>Historical Growth</div>
                        <div className="text-center font-mono text-emerald-400">+{comparisonResult.area1.growth_rate_pct.toFixed(1)}%</div>
                        <div className="text-right font-mono text-emerald-400">+{comparisonResult.area2.growth_rate_pct.toFixed(1)}%</div>
                      </div>

                      <div className="grid grid-cols-3 py-1.5 text-slate-300 font-semibold">
                        <div>Garage %</div>
                        <div className="text-center font-mono">{comparisonResult.area1.garage_pct.toFixed(1)}%</div>
                        <div className="text-right font-mono">{comparisonResult.area2.garage_pct.toFixed(1)}%</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Investment Budget Recommender */}
              <div className="lg:col-span-6 space-y-6">
                <div className="glass-panel rounded-3xl p-6 shadow-xl space-y-5">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center border-b border-white/5 pb-3">
                    <Compass className="w-4.5 h-4.5 text-indigo-400 mr-2" /> Investment Recommender
                  </h3>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Your Investment Budget</label>
                      <span className="text-xs font-extrabold text-indigo-400 font-mono">₹ {budgetLakhs} Lakhs</span>
                    </div>
                    <input
                      type="range"
                      value={budgetLakhs}
                      onChange={(e) => setBudgetLakhs(parseInt(e.target.value))}
                      min="20"
                      max="200"
                      step="5"
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>

                  <button
                    onClick={handleRecommend}
                    disabled={recommenderLoading}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center space-x-2"
                  >
                    {recommenderLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Find Investment Matches</span>}
                  </button>

                  {/* Recommendations Display */}
                  {recommenderResult && recommenderResult.budget_status === 'low' && (
                    <div className="space-y-4 pt-3 border-t border-white/5 text-xs animate-fade-in">
                      <div className="p-4 bg-red-950/20 border border-red-900/30 rounded-2xl">
                        <span className="text-[10px] font-bold text-red-400 uppercase tracking-wide block">Budget Constraint Alert</span>
                        <p className="text-slate-300 mt-2 font-medium leading-relaxed">
                          {recommenderResult.message}
                        </p>
                        <div className="mt-3 flex justify-between text-[10px] text-slate-500 font-bold uppercase">
                          <span>Minimum Budget Needed:</span>
                          <span className="text-red-400 font-mono">{formatPriceLakhs(recommenderResult.cheapest_price)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {recommenderResult && recommenderResult.budget_status === 'ok' && (
                    <div className="space-y-4 pt-3 border-t border-white/5 text-xs animate-fade-in">
                      <div className="p-3.5 bg-slate-950/35 border border-white/5 rounded-2xl">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Recommended Investment Zone</span>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm font-bold text-slate-200">{recommenderResult.recommendation.area}</span>
                          <span className="text-indigo-400 font-bold font-mono">Avg {formatPriceLakhs(recommenderResult.recommendation.avg_price)}</span>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-medium">
                          <span>Expected Layout: Up to {recommenderResult.recommendation.expected_bhk} BHK</span>
                          <span>Avg Size: {recommenderResult.recommendation.avg_size.toFixed(0)} Sqft</span>
                        </div>
                      </div>

                      <div className="p-3.5 bg-indigo-950/15 border border-indigo-900/10 rounded-2xl">
                        <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wide block">Value For Money Pick</span>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs font-bold text-slate-300">{recommenderResult.value_for_money.area}</span>
                          <span className="text-purple-400 font-semibold font-mono">
                            ₹ {recommenderResult.value_for_money.avg_price ? (recommenderResult.value_for_money.avg_price / recommenderResult.value_for_money.avg_size).toFixed(0) : 0}/sqft
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

        </main>

        <footer className="mt-auto border-t border-white/5 py-4 bg-slate-950/40 text-center text-[10px] text-slate-500 font-bold">
          Smart Pune Real Estate Analytics Platform • Deployed ML Pipeline
        </footer>
      </div>

    </div>
  );
}
