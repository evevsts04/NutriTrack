import React, { useState, useEffect, useMemo } from 'react';
import { Activity, Apple, Scale, Calculator as CalcIcon, Plus, Trash2, Home, Menu, X, Target, TrendingUp, Calendar, Droplet } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, collection, addDoc, deleteDoc } from 'firebase/firestore';

// --- FIREBASE INITIALIZATION ---
// Usando as variáveis globais fornecidas pelo ambiente
const firebaseConfig = {
  apiKey: "AIzaSyAxpQwy3PhdfAmxKxprnx85-qAigWq-JNw",
  authDomain: "nutritrack-c9f96.firebaseapp.com",
  projectId: "nutritrack-c9f96",
  storageBucket: "nutritrack-c9f96.firebasestorage.app",
  messagingSenderId: "817935027576",
  appId: "1:817935027576:web:e4dca43c6188d93bac0c8d"
};

export default function App() {
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

  useEffect(() => {
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

  useEffect(() => {
    if (!user) return;

    setIsLoading(true);
    const userId = user.uid;

    // Listeners para Coleções (Sem queries complexas, ordenação feita no JS)
    const mealsRef = collection(db, 'artifacts', appId, 'users', userId, 'meals');
    const unsubMeals = onSnapshot(mealsRef, (snapshot) => {
      const mealsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Ordenando do mais recente para o mais antigo no JS
      mealsData.sort((a, b) => b.timestamp - a.timestamp);
      setMeals(mealsData);
    }, (err) => console.error("Erro ao carregar refeições:", err));

    const weightsRef = collection(db, 'artifacts', appId, 'users', userId, 'weights');
    const unsubWeights = onSnapshot(weightsRef, (snapshot) => {
      const weightsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Ordenando do mais recente para o mais antigo no JS
      weightsData.sort((a, b) => b.timestamp - a.timestamp);
      setWeights(weightsData);
    }, (err) => console.error("Erro ao carregar pesos:", err));

    const waterRef = collection(db, 'artifacts', appId, 'users', userId, 'water');
    const unsubWater = onSnapshot(waterRef, (snapshot) => {
      const waterData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      waterData.sort((a, b) => b.timestamp - a.timestamp);
      setWaterLogs(waterData);
    }, (err) => console.error("Erro ao carregar água:", err));

    const settingsRef = collection(db, 'artifacts', appId, 'users', userId, 'settings');
    const unsubSettings = onSnapshot(settingsRef, (snapshot) => {
      const settingsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const profileInfo = settingsData.find(s => s.id === 'profile');
      if (profileInfo) {
        setSettings(profileInfo);
      }
      setIsLoading(false);
    }, (err) => {
      console.error("Erro ao carregar configurações:", err);
      setIsLoading(false);
    });

    return () => {
      unsubMeals();
      unsubWeights();
      unsubWater();
      unsubSettings();
    };
  }, [user]);

  const handleAddMeal = async (e) => {
    e.preventDefault();
    if (!user || !mealName || !mealCalories) return;
    
    try {
      const mealsRef = collection(db, 'artifacts', appId, 'users', user.uid, 'meals');
      await addDoc(mealsRef, {
        name: mealName,
        calories: Number(mealCalories),
        timestamp: Date.now()
      });
      setMealName('');
      setMealCalories('');
    } catch (err) {
      console.error("Erro ao adicionar refeição", err);
    }
  };

  const handleDeleteMeal = async (id) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'meals', id));
    } catch (err) {
      console.error("Erro ao deletar refeição", err);
    }
  };

  const handleAddWeight = async (e) => {
    e.preventDefault();
    if (!user || !weightValue) return;
    
    try {
      const weightsRef = collection(db, 'artifacts', appId, 'users', user.uid, 'weights');
      await addDoc(weightsRef, {
        weight: Number(weightValue),
        timestamp: Date.now()
      });
      setWeightValue('');
    } catch (err) {
      console.error("Erro ao adicionar peso", err);
    }
  };

  const handleDeleteWeight = async (id) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'weights', id));
    } catch (err) {
      console.error("Erro ao deletar peso", err);
    }
  };

  const handleAddWater = async (amountToAdd) => {
    if (!user || !amountToAdd) return;
    try {
      const waterRef = collection(db, 'artifacts', appId, 'users', user.uid, 'water');
      await addDoc(waterRef, {
        amount: Number(amountToAdd),
        timestamp: Date.now()
      });
      setWaterAmount('');
    } catch (err) {
      console.error("Erro ao adicionar água", err);
    }
  };

  const handleDeleteWater = async (id) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'water', id));
    } catch (err) {
      console.error("Erro ao deletar registro de água", err);
    }
  };

  const calculateCalories = async (e) => {
    e.preventDefault();
    if (!calcAge || !calcWeight || !calcHeight) return;

    // Fórmula Mifflin-St Jeor
    let bmr = (10 * Number(calcWeight)) + (6.25 * Number(calcHeight)) - (5 * Number(calcAge));
    bmr = calcGender === 'male' ? bmr + 5 : bmr - 161;

    let tdee = bmr * Number(calcActivity);
    
    let finalCalories = tdee;
    if (calcGoal === 'lose') finalCalories -= 500;
    if (calcGoal === 'gain') finalCalories += 500;

    const roundedCalories = Math.round(finalCalories);

    if (user) {
      try {
        const profileRef = doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'profile');
        await setDoc(profileRef, { calorieGoal: roundedCalories }, { merge: true });
        setActiveTab('dashboard');
      } catch (err) {
        console.error("Erro ao salvar meta", err);
      }
    }
  };

  // Calcular calorias de hoje
  const todayMeals = useMemo(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    return meals.filter(meal => {
      const mealDate = new Date(meal.timestamp).setHours(0, 0, 0, 0);
      return mealDate === today;
    });
  }, [meals]);

  const caloriesConsumedToday = todayMeals.reduce((acc, meal) => acc + meal.calories, 0);
  const calorieGoal = settings?.calorieGoal || 2000;
  const caloriePercentage = Math.min((caloriesConsumedToday / calorieGoal) * 100, 100);

  const todayWaterLogs = useMemo(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    return waterLogs.filter(log => {
      const logDate = new Date(log.timestamp).setHours(0, 0, 0, 0);
      return logDate === today;
    });
  }, [waterLogs]);

  const waterConsumedToday = todayWaterLogs.reduce((acc, log) => acc + log.amount, 0);
  const waterGoal = settings?.waterGoal || 2500;
  const waterPercentage = Math.min((waterConsumedToday / waterGoal) * 100, 100);

  // Dados do gráfico de peso (Cronológico)
  const weightChartData = useMemo(() => {
    const sorted = [...weights].sort((a, b) => a.timestamp - b.timestamp);
    return sorted.map(w => ({
      date: new Date(w.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      peso: w.weight
    }));
  }, [weights]);

  const currentWeight = weights.length > 0 ? weights[0].weight : '--';

  const renderDashboard = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Calorie Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-4 left-4 text-emerald-500">
            <Activity size={24} />
          </div>
          <h3 className="text-slate-500 text-sm font-medium mb-4 mt-2">Calorias Consumidas (Hoje)</h3>
          
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={`${caloriePercentage > 100 ? 'text-rose-500' : 'text-emerald-500'} transition-all duration-1000 ease-out`}
                strokeWidth="3"
                strokeDasharray={`${caloriePercentage}, 100`}
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-bold text-slate-800">{caloriesConsumedToday}</span>
              <span className="text-xs text-slate-400">/ {calorieGoal} kcal</span>
            </div>
          </div>
        </div>

        {/* Weight Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
             <div className="p-2 bg-blue-50 text-blue-500 rounded-lg">
                <Scale size={24} />
             </div>
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
          <div className="absolute top-4 left-4 text-cyan-500">
            <Droplet size={24} />
          </div>
          <h3 className="text-slate-500 text-sm font-medium mb-4 mt-2">Água (Hoje)</h3>
          
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-cyan-500 transition-all duration-1000 ease-out"
                strokeWidth="3"
                strokeDasharray={`${waterPercentage}, 100`}
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-xl font-bold text-slate-800">{waterConsumedToday}</span>
              <span className="text-xs text-slate-400">/ {waterGoal} ml</span>
            </div>
          </div>
        </div>

        {/* Quick Add Meal */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-2xl shadow-sm text-white flex flex-col justify-center cursor-pointer transition-transform hover:scale-[1.02]" onClick={() => setActiveTab('meals')}>
           <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
             <Plus size={24} className="text-white" />
           </div>
           <h3 className="text-lg font-bold mb-1">Nova Refeição</h3>
           <p className="text-emerald-100 text-sm">Registre o que você comeu agora mesmo.</p>
        </div>
      </div>

      {/* Mini Weight Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="text-blue-500" size={20} />
          <h3 className="text-slate-800 font-bold">Evolução de Peso</h3>
        </div>
        <div className="h-64 w-full">
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
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="peso" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorPeso)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
             <div className="h-full flex items-center justify-center text-slate-400 flex-col gap-2">
               <Scale size={32} className="opacity-20" />
               <p>Registre mais de um peso para ver o gráfico.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderMeals = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Apple className="text-emerald-500" /> Registrar Refeição
        </h2>
        <form onSubmit={handleAddMeal} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-500 mb-1">Alimento / Refeição</label>
            <input 
              type="text" 
              required
              placeholder="Ex: Frango com batata doce"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
              value={mealName}
              onChange={(e) => setMealName(e.target.value)}
            />
          </div>
          <div className="md:w-48">
            <label className="block text-sm font-medium text-slate-500 mb-1">Calorias (kcal)</label>
            <input 
              type="number" 
              required
              min="1"
              placeholder="Ex: 450"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
              value={mealCalories}
              onChange={(e) => setMealCalories(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <button type="submit" className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-600 text-white font-medium p-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
              <Plus size={20} /> Adicionar
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Histórico de Refeições</h3>
        {meals.length === 0 ? (
          <div className="text-center py-8 text-slate-400">Nenhuma refeição registrada ainda.</div>
        ) : (
          <div className="space-y-3">
            {meals.map(meal => (
              <div key={meal.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                <div>
                  <h4 className="font-medium text-slate-800">{meal.name}</h4>
                  <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                    <Calendar size={14} /> 
                    {new Date(meal.timestamp).toLocaleDateString('pt-BR')} às {new Date(meal.timestamp).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">{meal.calories} kcal</span>
                  <button onClick={() => handleDeleteMeal(meal.id)} className="text-slate-400 hover:text-rose-500 transition-colors p-2 rounded-lg hover:bg-rose-50">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderWeight = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Scale className="text-blue-500" /> Registrar Peso
        </h2>
        <form onSubmit={handleAddWeight} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-500 mb-1">Peso (kg)</label>
            <input 
              type="number" 
              required
              step="0.1"
              min="1"
              placeholder="Ex: 75.5"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              value={weightValue}
              onChange={(e) => setWeightValue(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <button type="submit" className="w-full md:w-auto bg-blue-500 hover:bg-blue-600 text-white font-medium p-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
              <Plus size={20} /> Adicionar
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Histórico de Peso</h3>
        {weights.length === 0 ? (
          <div className="text-center py-8 text-slate-400">Nenhum peso registrado ainda.</div>
        ) : (
          <div className="space-y-3">
            {weights.map(w => (
              <div key={w.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <h4 className="font-bold text-slate-800 text-lg">{w.weight} kg</h4>
                  <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                    <Calendar size={14} /> 
                    {new Date(w.timestamp).toLocaleDateString('pt-BR')} às {new Date(w.timestamp).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>
                <button onClick={() => handleDeleteWeight(w.id)} className="text-slate-400 hover:text-rose-500 transition-colors p-2 rounded-lg hover:bg-rose-50">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderCalculator = () => (
    <div className="animate-fade-in max-w-3xl mx-auto">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-50 text-indigo-500 rounded-xl">
             <CalcIcon size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Calculadora de Calorias</h2>
            <p className="text-slate-500 text-sm mt-1">Descubra sua meta diária baseada no seu perfil.</p>
          </div>
        </div>

        <form onSubmit={calculateCalories} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Gênero</label>
              <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" value={calcGender} onChange={(e) => setCalcGender(e.target.value)}>
                <option value="male">Masculino</option>
                <option value="female">Feminino</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Idade</label>
              <input type="number" required min="10" max="120" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" value={calcAge} onChange={(e) => setCalcAge(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Peso (kg)</label>
              <input type="number" required step="0.1" min="30" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" value={calcWeight} onChange={(e) => setCalcWeight(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Altura (cm)</label>
              <input type="number" required min="100" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" value={calcHeight} onChange={(e) => setCalcHeight(e.target.value)} />
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 mb-2">Nível de Atividade</label>
             <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" value={calcActivity} onChange={(e) => setCalcActivity(e.target.value)}>
                <option value="1.2">Sedentário (pouco ou nenhum exercício)</option>
                <option value="1.375">Levemente ativo (exercício leve 1 a 3 dias/semana)</option>
                <option value="1.55">Moderadamente ativo (exercício moderado 3 a 5 dias/semana)</option>
                <option value="1.725">Muito ativo (exercício pesado 6 a 7 dias/semana)</option>
                <option value="1.9">Extremamente ativo (trabalho físico ou treino intenso 2x/dia)</option>
              </select>
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 mb-2">Objetivo</label>
             <div className="grid grid-cols-3 gap-3">
               <button type="button" onClick={() => setCalcGoal('lose')} className={`p-3 rounded-xl border font-medium transition-all ${calcGoal === 'lose' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>Perder Peso</button>
               <button type="button" onClick={() => setCalcGoal('maintain')} className={`p-3 rounded-xl border font-medium transition-all ${calcGoal === 'maintain' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>Manter</button>
               <button type="button" onClick={() => setCalcGoal('gain')} className={`p-3 rounded-xl border font-medium transition-all ${calcGoal === 'gain' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>Ganhar Massa</button>
             </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md shadow-indigo-200">
              <Target size={20} /> Calcular e Salvar Meta Diária
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'meals', label: 'Refeições', icon: Apple },
    { id: 'water', label: 'Água', icon: Droplet },
    { id: 'weight', label: 'Peso', icon: Scale },
    { id: 'calculator', label: 'Calculadora', icon: CalcIcon },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-800 selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2 text-emerald-600 font-black text-xl tracking-tight">
          <Activity size={24} strokeWidth={3} /> NutriTrack
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-500">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <nav className={`
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 transition-transform duration-300 ease-in-out
        fixed md:static inset-y-0 left-0 z-10 w-64 bg-white border-r border-slate-200 shadow-xl md:shadow-none
        flex flex-col
      `}>
        <div className="hidden md:flex p-6 items-center gap-2 text-emerald-600 font-black text-2xl tracking-tight border-b border-slate-100">
          <Activity size={28} strokeWidth={3} /> NutriTrack
        </div>
        <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                  isActive 
                    ? 'bg-emerald-50 text-emerald-700 shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-emerald-500' : 'text-slate-400'} />
                {item.label}
              </button>
            )
          })}
        </div>
        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-50 p-4 rounded-xl">
             <p className="text-xs text-slate-500 font-medium mb-1">Meta Diária</p>
             <p className="text-lg font-bold text-slate-800">{calorieGoal} <span className="text-sm font-normal text-slate-500">kcal</span></p>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full max-w-6xl mx-auto">
        <header className="mb-8 hidden md:block">
          <h1 className="text-3xl font-bold text-slate-800">
            {navItems.find(i => i.id === activeTab)?.label}
          </h1>
          <p className="text-slate-500 mt-1">Acompanhe seu progresso e mantenha-se saudável.</p>
        </header>

        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'meals' && renderMeals()}
        {activeTab === 'water' && renderWater()}
        {activeTab === 'weight' && renderWeight()}
        {activeTab === 'calculator' && renderCalculator()}
      </main>

    </div>
  );
}