import React, { useState, useEffect, useMemo, Component } from 'react';
import { Activity, Apple, Scale, Calculator as CalcIcon, Plus, Trash2, Home, Menu, X, Target, TrendingUp, Calendar, Droplet } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, collection, addDoc, deleteDoc } from 'firebase/firestore';

// --- FIREBASE INITIALIZATION SAFEGUARD ---
// This function safely attempts to get the config.
const getFirebaseConfig = () => {
  // 1. Test Environment (Website)
  if (typeof __firebase_config !== 'undefined') {
    return JSON.parse(__firebase_config);
  }
  
  // 2. Vite Environment Variables (Local .env or Vercel Settings)
  // We use optional chaining and a fallback to prevent "Cannot read properties of undefined"
  const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {};
  
  if (env.VITE_FIREBASE_API_KEY) {
    return {
      apiKey: env.VITE_FIREBASE_API_KEY,
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: env.VITE_FIREBASE_APP_ID
    };
  }

  // 3. HARDCODED FALLBACK (Required if Vercel Env Vars are not set yet)
  // Ensure these are your actual Firebase keys.
  return {
    apiKey: "AIzaSyAxpQwy3PhdfAmxKxprnx85-qAigWq-JNw",
    authDomain: "nutritrack-c9f96.firebaseapp.com",
    projectId: "nutritrack-c9f96",
    storageBucket: "nutritrack-c9f96.firebasestorage.app",
    messagingSenderId: "817935027576",
    appId: "1:817935027576:web:e4dca43c6188d93bac0c8d"
  };
};

// Initialize Firebase securely outside the component to avoid re-initialization loops
let app, auth, db;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'nutritrack-app';

try {
  const config = getFirebaseConfig();
  // Prevent "Firebase App named '[DEFAULT]' already exists" error during hot-reloads
  app = !getApps().length ? initializeApp(config) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.error("Critical Firebase Initialization Error:", error);
}

// --- ERROR BOUNDARY ---
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto', background: '#fef2f2', minHeight: '100vh' }}>
          <h2 style={{ color: '#dc2626', borderBottom: '2px solid #fca5a5', paddingBottom: '10px', fontSize: '24px' }}>
            ⚠️ Ops! Ocorreu um erro no aplicativo.
          </h2>
          <p style={{ marginTop: '1rem', color: '#7f1d1d', fontWeight: 'bold' }}>Por favor, verifique se as bibliotecas foram instaladas corretamente ou copie o erro abaixo:</p>
          <pre style={{ background: '#1e293b', padding: '1rem', borderRadius: '8px', overflowX: 'auto', color: '#f8fafc', fontSize: '14px', marginTop: '10px' }}>
            {this.state.error && this.state.error.toString()}
            <br/><br/>
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- APP COMPONENT ---
function NutriTrackApp() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [meals, setMeals] = useState([]);
  const [weights, setWeights] = useState([]);
  const [waterLogs, setWaterLogs] = useState([]);
  const [settings, setSettings] = useState({ calorieGoal: 2000, waterGoal: 2500 });
  const [isLoading, setIsLoading] = useState(true);

  // Form States
  const [mealName, setMealName] = useState('');
  const [mealCalories, setMealCalories] = useState('');
  const [weightValue, setWeightValue] = useState('');
  const [waterAmount, setWaterAmount] = useState('');

  // Calculator States
  const [calcAge, setCalcAge] = useState('');
  const [calcGender, setCalcGender] = useState('male');
  const [calcWeight, setCalcWeight] = useState('');
  const [calcHeight, setCalcHeight] = useState('');
  const [calcActivity, setCalcActivity] = useState('1.2');
  const [calcGoal, setCalcGoal] = useState('maintain');

  // Inject Tailwind automatically if missing
  useEffect(() => {
    if (!document.getElementById('tailwind-cdn')) {
      const script = document.createElement('script');
      script.id = 'tailwind-cdn';
      script.src = 'https://cdn.tailwindcss.com';
      document.head.appendChild(script);
    }
  }, []);

  // AUTHENTICATION
  useEffect(() => {
    if (!auth) {
      console.error("Auth module is not initialized.");
      setIsLoading(false);
      return;
    }

    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Erro na autenticação:", error);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // DATA LOADING
  useEffect(() => {
    if (!user || !db) return;
    setIsLoading(true);
    const userId = user.uid;

    const mealsRef = collection(db, 'artifacts', appId, 'users', userId, 'meals');
    const unsubMeals = onSnapshot(mealsRef, (snapshot) => {
      const mealsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      mealsData.sort((a, b) => b.timestamp - a.timestamp);
      setMeals(mealsData);
    });

    const weightsRef = collection(db, 'artifacts', appId, 'users', userId, 'weights');
    const unsubWeights = onSnapshot(weightsRef, (snapshot) => {
      const weightsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      weightsData.sort((a, b) => b.timestamp - a.timestamp);
      setWeights(weightsData);
    });

    const waterRef = collection(db, 'artifacts', appId, 'users', userId, 'water');
    const unsubWater = onSnapshot(waterRef, (snapshot) => {
      const waterData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      waterData.sort((a, b) => b.timestamp - a.timestamp);
      setWaterLogs(waterData);
    });

    const settingsRef = collection(db, 'artifacts', appId, 'users', userId, 'settings');
    const unsubSettings = onSnapshot(settingsRef, (snapshot) => {
      const settingsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const profileInfo = settingsData.find(s => s.id === 'profile');
      if (profileInfo) setSettings(profileInfo);
      setIsLoading(false);
    });

    return () => { unsubMeals(); unsubWeights(); unsubWater(); unsubSettings(); };
  }, [user]);

  // ACTIONS
  const handleAddMeal = async (e) => {
    e.preventDefault();
    if (!user || !db || !mealName || !mealCalories) return;
    try {
      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'meals'), { name: mealName, calories: Number(mealCalories), timestamp: Date.now() });
      setMealName(''); setMealCalories('');
    } catch (err) { console.error(err); }
  };

  const handleDeleteMeal = async (id) => {
    if (!user || !db) return;
    try { await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'meals', id)); } catch (err) { console.error(err); }
  };

  const handleAddWeight = async (e) => {
    e.preventDefault();
    if (!user || !db || !weightValue) return;
    try {
      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'weights'), { weight: Number(weightValue), timestamp: Date.now() });
      setWeightValue('');
    } catch (err) { console.error(err); }
  };

  const handleDeleteWeight = async (id) => {
    if (!user || !db) return;
    try { await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'weights', id)); } catch (err) { console.error(err); }
  };

  const handleAddWater = async (amountToAdd) => {
    if (!user || !db || !amountToAdd) return;
    try {
      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'water'), { amount: Number(amountToAdd), timestamp: Date.now() });
      setWaterAmount('');
    } catch (err) { console.error(err); }
  };

  const handleDeleteWater = async (id) => {
    if (!user || !db) return;
    try { await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'water', id)); } catch (err) { console.error(err); }
  };

  const calculateCalories = async (e) => {
    e.preventDefault();
    if (!calcAge || !calcWeight || !calcHeight) return;
    let bmr = (10 * Number(calcWeight)) + (6.25 * Number(calcHeight)) - (5 * Number(calcAge));
    bmr = calcGender === 'male' ? bmr + 5 : bmr - 161;
    let finalCalories = (bmr * Number(calcActivity)) + (calcGoal === 'lose' ? -500 : calcGoal === 'gain' ? 500 : 0);
    
    if (user && db) {
      try {
        await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'profile'), { calorieGoal: Math.round(finalCalories) }, { merge: true });
        setActiveTab('dashboard');
      } catch (err) { console.error(err); }
    }
  };

  // CALCULATIONS
  const todayMeals = useMemo(() => meals.filter(m => new Date(m.timestamp).setHours(0,0,0,0) === new Date().setHours(0,0,0,0)), [meals]);
  const caloriesConsumedToday = todayMeals.reduce((acc, meal) => acc + meal.calories, 0);
  const calorieGoal = settings?.calorieGoal || 2000;
  const caloriePercentage = Math.min((caloriesConsumedToday / calorieGoal) * 100, 100);

  const todayWaterLogs = useMemo(() => waterLogs.filter(w => new Date(w.timestamp).setHours(0,0,0,0) === new Date().setHours(0,0,0,0)), [waterLogs]);
  const waterConsumedToday = todayWaterLogs.reduce((acc, log) => acc + log.amount, 0);
  const waterGoal = settings?.waterGoal || 2500;
  const waterPercentage = Math.min((waterConsumedToday / waterGoal) * 100, 100);

  const weightChartData = useMemo(() => [...weights].sort((a, b) => a.timestamp - b.timestamp).map(w => ({
    date: new Date(w.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }), peso: w.weight
  })), [weights]);
  const currentWeight = weights.length > 0 ? weights[0].weight : '--';

  // RENDER HELPERS
  const renderDashboard = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-4 left-4 text-emerald-500"><Activity size={24} /></div>
          <h3 className="text-slate-500 text-sm font-medium mb-4 mt-2">Calorias (Hoje)</h3>
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path className="text-slate-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className={`${caloriePercentage > 100 ? 'text-rose-500' : 'text-emerald-500'} transition-all duration-1000 ease-out`} strokeWidth="3" strokeDasharray={`${caloriePercentage}, 100`} strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-bold text-slate-800">{caloriesConsumedToday}</span>
              <span className="text-xs text-slate-400">/ {calorieGoal}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
             <div className="p-2 bg-blue-50 text-blue-500 rounded-lg"><Scale size={24} /></div>
             <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded-full">Atual</span>
          </div>
          <div>
            <h3 className="text-slate-500 text-sm font-medium">Peso Registrado</h3>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-4xl font-bold text-slate-800">{currentWeight}</span>
              <span className="text-slate-400 font-medium">kg</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-4 left-4 text-cyan-500"><Droplet size={24} /></div>
          <h3 className="text-slate-500 text-sm font-medium mb-4 mt-2">Água (Hoje)</h3>
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path className="text-slate-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="text-cyan-500 transition-all duration-1000 ease-out" strokeWidth="3" strokeDasharray={`${waterPercentage}, 100`} strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-xl font-bold text-slate-800">{waterConsumedToday}</span>
              <span className="text-xs text-slate-400">/ {waterGoal} ml</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-2xl shadow-sm text-white flex flex-col justify-center cursor-pointer transition-transform hover:scale-[1.02]" onClick={() => setActiveTab('meals')}>
           <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mb-4"><Plus size={24} /></div>
           <h3 className="text-lg font-bold mb-1">Nova Refeição</h3>
           <p className="text-emerald-100 text-sm">Registre o que você comeu agora.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-6"><TrendingUp className="text-blue-500" size={20} /><h3 className="text-slate-800 font-bold">Evolução de Peso</h3></div>
        <div className="h-64 w-full" style={{ minHeight: '256px' }}>
          {weightChartData.length > 1 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weightChartData}>
                <defs>
                  <linearGradient id="colorPeso" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }} />
                <Area type="monotone" dataKey="peso" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorPeso)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
             <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2"><Scale size={32} className="opacity-20" /><p>Registre mais de um peso para ver o gráfico.</p></div>
          )}
        </div>
      </div>
    </div>
  );

  const renderMeals = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><Apple className="text-emerald-500" /> Registrar Refeição</h2>
        <form onSubmit={handleAddMeal} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1"><label className="block text-sm font-medium text-slate-500 mb-1">Alimento</label><input type="text" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" value={mealName} onChange={e => setMealName(e.target.value)} /></div>
          <div className="md:w-48"><label className="block text-sm font-medium text-slate-500 mb-1">Calorias</label><input type="number" required min="1" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" value={mealCalories} onChange={e => setMealCalories(e.target.value)} /></div>
          <div className="flex items-end"><button type="submit" className="w-full md:w-auto bg-emerald-500 text-white p-3 rounded-xl flex items-center justify-center gap-2"><Plus size={20} /> Adicionar</button></div>
        </form>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Histórico</h3>
        {meals.length === 0 ? <div className="text-center py-8 text-slate-400">Vazio.</div> : <div className="space-y-3">{meals.map(m => (
          <div key={m.id} className="flex justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div><h4 className="font-medium text-slate-800">{m.name}</h4><p className="text-sm text-slate-500">{new Date(m.timestamp).toLocaleString('pt-BR')}</p></div>
            <div className="flex items-center gap-4"><span className="text-emerald-600 font-bold">{m.calories} kcal</span><button onClick={() => handleDeleteMeal(m.id)} className="text-slate-400 hover:text-rose-500"><Trash2 size={18}/></button></div>
          </div>
        ))}</div>}
      </div>
    </div>
  );

  const renderWeight = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><Scale className="text-blue-500" /> Registrar Peso</h2>
        <form onSubmit={handleAddWeight} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1"><label className="block text-sm font-medium text-slate-500 mb-1">Peso (kg)</label><input type="number" required step="0.1" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" value={weightValue} onChange={e => setWeightValue(e.target.value)} /></div>
          <div className="flex items-end"><button type="submit" className="w-full md:w-auto bg-blue-500 text-white p-3 rounded-xl flex items-center justify-center gap-2"><Plus size={20} /> Adicionar</button></div>
        </form>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Histórico</h3>
        {weights.length === 0 ? <div className="text-center py-8 text-slate-400">Vazio.</div> : <div className="space-y-3">{weights.map(w => (
          <div key={w.id} className="flex justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div><h4 className="font-bold text-lg">{w.weight} kg</h4><p className="text-sm text-slate-500">{new Date(w.timestamp).toLocaleString('pt-BR')}</p></div>
            <button onClick={() => handleDeleteWeight(w.id)} className="text-slate-400 hover:text-rose-500"><Trash2 size={18}/></button>
          </div>
        ))}</div>}
      </div>
    </div>
  );

  const renderWater = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><Droplet className="text-cyan-500" /> Registrar Água</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <button onClick={() => handleAddWater(200)} className="p-4 bg-cyan-50 text-cyan-700 rounded-xl font-bold">200 ml</button>
          <button onClick={() => handleAddWater(350)} className="p-4 bg-cyan-50 text-cyan-700 rounded-xl font-bold">350 ml</button>
          <button onClick={() => handleAddWater(500)} className="p-4 bg-cyan-50 text-cyan-700 rounded-xl font-bold">500 ml</button>
          <div className="flex items-center gap-2"><input type="number" placeholder="Outro" className="w-full p-3 bg-slate-50 border rounded-xl" value={waterAmount} onChange={e => setWaterAmount(e.target.value)} /><button onClick={() => handleAddWater(waterAmount)} className="bg-cyan-500 text-white p-3 rounded-xl"><Plus size={20}/></button></div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Histórico (Hoje)</h3>
        {todayWaterLogs.length === 0 ? <div className="text-center py-8 text-slate-400">Vazio.</div> : <div className="space-y-3">{todayWaterLogs.map(l => (
          <div key={l.id} className="flex justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div><h4 className="font-bold text-lg">{l.amount} ml</h4><p className="text-sm text-slate-500">{new Date(l.timestamp).toLocaleTimeString('pt-BR')}</p></div>
            <button onClick={() => handleDeleteWater(l.id)} className="text-slate-400 hover:text-rose-500"><Trash2 size={18}/></button>
          </div>
        ))}</div>}
      </div>
    </div>
  );

  const renderCalculator = () => (
    <div className="animate-fade-in max-w-3xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
      <div className="flex items-center gap-3 mb-6"><div className="p-3 bg-indigo-50 text-indigo-500 rounded-xl"><CalcIcon size={28} /></div><h2 className="text-2xl font-bold">Calculadora</h2></div>
      <form onSubmit={calculateCalories} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><label className="block text-sm font-medium mb-2">Gênero</label><select className="w-full p-3 border rounded-xl" value={calcGender} onChange={e => setCalcGender(e.target.value)}><option value="male">Masculino</option><option value="female">Feminino</option></select></div>
          <div><label className="block text-sm font-medium mb-2">Idade</label><input type="number" required className="w-full p-3 border rounded-xl" value={calcAge} onChange={e => setCalcAge(e.target.value)} /></div>
          <div><label className="block text-sm font-medium mb-2">Peso (kg)</label><input type="number" required className="w-full p-3 border rounded-xl" value={calcWeight} onChange={e => setCalcWeight(e.target.value)} /></div>
          <div><label className="block text-sm font-medium mb-2">Altura (cm)</label><input type="number" required className="w-full p-3 border rounded-xl" value={calcHeight} onChange={e => setCalcHeight(e.target.value)} /></div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Atividade</label>
          <select className="w-full p-3 border rounded-xl" value={calcActivity} onChange={e => setCalcActivity(e.target.value)}>
            <option value="1.2">Sedentário</option><option value="1.375">Leve</option><option value="1.55">Moderado</option><option value="1.725">Intenso</option><option value="1.9">Muito Intenso</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Objetivo</label>
          <div className="grid grid-cols-3 gap-3">
            <button type="button" onClick={() => setCalcGoal('lose')} className={`p-3 rounded-xl border ${calcGoal === 'lose' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white'}`}>Perder</button>
            <button type="button" onClick={() => setCalcGoal('maintain')} className={`p-3 rounded-xl border ${calcGoal === 'maintain' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white'}`}>Manter</button>
            <button type="button" onClick={() => setCalcGoal('gain')} className={`p-3 rounded-xl border ${calcGoal === 'gain' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white'}`}>Ganhar</button>
          </div>
        </div>
        <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl">Salvar Meta</button>
      </form>
    </div>
  );

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div></div>;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'meals', label: 'Refeições', icon: Apple },
    { id: 'water', label: 'Água', icon: Droplet },
    { id: 'weight', label: 'Peso', icon: Scale },
    { id: 'calculator', label: 'Calculadora', icon: CalcIcon }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-800">
      <div className="md:hidden bg-white p-4 flex justify-between items-center border-b">
        <div className="flex gap-2 text-emerald-600 font-black text-xl"><Activity /> NutriTrack</div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}><Menu /></button>
      </div>
      <nav className={`${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static inset-y-0 left-0 w-64 bg-white border-r z-20 flex flex-col transition-transform`}>
        <div className="hidden md:flex p-6 gap-2 text-emerald-600 font-black text-2xl border-b"><Activity /> NutriTrack</div>
        <div className="flex-1 p-4 space-y-2">
          {navItems.map(item => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 p-3 rounded-xl font-medium ${activeTab === item.id ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:bg-slate-50'}`}>
              <item.icon size={20} /> {item.label}
            </button>
          ))}
        </div>
        <div className="p-4 border-t"><div className="bg-slate-50 p-4 rounded-xl"><p className="text-xs text-slate-500">Meta</p><p className="font-bold">{calorieGoal} kcal</p></div></div>
      </nav>
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-6xl mx-auto w-full">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'meals' && renderMeals()}
        {activeTab === 'water' && renderWater()}
        {activeTab === 'weight' && renderWeight()}
        {activeTab === 'calculator' && renderCalculator()}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <NutriTrackApp />
    </ErrorBoundary>
  );
}