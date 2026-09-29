<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NutriTrack Dashboard</title>
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest"></script>
    
    <!-- Chart.js para o Gráfico -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

    <style>
        /* Animações e ajustes globais */
        .animate-fade-in {
            animation: fadeIn 0.4s ease-out;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .view-section {
            display: none;
        }
        .view-section.active {
            display: block;
            animation: fadeIn 0.4s ease-out;
        }
        /* Oculta scrollbar mas mantém funcionalidade */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
    </style>
</head>
<body class="bg-slate-50 text-slate-800 font-sans antialiased selection:bg-emerald-100 selection:text-emerald-900 min-h-screen flex flex-col md:flex-row">

    <!-- Mobile Header -->
    <div class="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-20">
        <div class="flex items-center gap-2 text-emerald-600 font-black text-xl tracking-tight">
            <i data-lucide="activity"></i> NutriTrack
        </div>
        <button id="mobile-menu-btn" class="p-2 text-slate-500">
            <i data-lucide="menu" id="menu-icon"></i>
        </button>
    </div>

    <!-- Sidebar Navigation -->
    <nav id="sidebar" class="-translate-x-full md:translate-x-0 transition-transform duration-300 ease-in-out fixed md:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 shadow-xl md:shadow-none flex flex-col">
        <div class="hidden md:flex p-6 items-center gap-2 text-emerald-600 font-black text-2xl tracking-tight border-b border-slate-100">
            <i data-lucide="activity"></i> NutriTrack
        </div>
        
        <div class="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
            <button onclick="switchTab('dashboard')" id="nav-dashboard" class="nav-btn w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium bg-emerald-50 text-emerald-700 shadow-sm">
                <i data-lucide="home"></i> Dashboard
            </button>
            <button onclick="switchTab('meals')" id="nav-meals" class="nav-btn w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-800">
                <i data-lucide="apple"></i> Refeições
            </button>
            <button onclick="switchTab('water')" id="nav-water" class="nav-btn w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-800">
                <i data-lucide="droplet"></i> Água
            </button>
            <button onclick="switchTab('weight')" id="nav-weight" class="nav-btn w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-800">
                <i data-lucide="scale"></i> Peso
            </button>
            <button onclick="switchTab('calculator')" id="nav-calculator" class="nav-btn w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-800">
                <i data-lucide="calculator"></i> Calculadora
            </button>
        </div>
        
        <div class="p-4 border-t border-slate-100">
            <div class="bg-slate-50 p-4 rounded-xl">
                <p class="text-xs text-slate-500 font-medium mb-1">Meta Diária</p>
                <p class="text-lg font-bold text-slate-800"><span id="sidebar-goal">2000</span> <span class="text-sm font-normal text-slate-500">kcal</span></p>
            </div>
        </div>
    </nav>

    <!-- Overlay Mobile -->
    <div id="mobile-overlay" class="hidden fixed inset-0 bg-slate-900/50 z-20 md:hidden" onclick="toggleMenu()"></div>

    <!-- Main Content Area -->
    <main class="flex-1 p-4 md:p-8 overflow-y-auto w-full max-w-6xl mx-auto relative">
        
        <!-- Loading Spinner -->
        <div id="loading-screen" class="absolute inset-0 bg-slate-50 z-10 flex items-center justify-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>

        <!-- VIEW: DASHBOARD -->
        <div id="view-dashboard" class="view-section active">
            <header class="mb-8 hidden md:block">
                <h1 class="text-3xl font-bold text-slate-800">Dashboard</h1>
                <p class="text-slate-500 mt-1">Acompanhe seu progresso diário.</p>
            </header>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <!-- Calorias Card -->
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center relative overflow-hidden">
                    <div class="absolute top-4 left-4 text-emerald-500"><i data-lucide="activity"></i></div>
                    <h3 class="text-slate-500 text-sm font-medium mb-4 mt-2">Calorias (Hoje)</h3>
                    <div class="relative w-32 h-32 flex items-center justify-center">
                        <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <path class="text-slate-100" stroke-width="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <path id="cal-progress" class="text-emerald-500 transition-all duration-1000 ease-out" stroke-width="3" stroke-dasharray="0, 100" stroke-linecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        </svg>
                        <div class="absolute flex flex-col items-center">
                            <span id="cal-consumed" class="text-2xl font-bold text-slate-800">0</span>
                            <span class="text-xs text-slate-400">/ <span id="cal-goal-display">2000</span></span>
                        </div>
                    </div>
                </div>

                <!-- Peso Card -->
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
                    <div class="flex items-center justify-between mb-4">
                        <div class="p-2 bg-blue-50 text-blue-500 rounded-lg"><i data-lucide="scale"></i></div>
                        <span class="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded-full">Atual</span>
                    </div>
                    <div>
                        <h3 class="text-slate-500 text-sm font-medium">Peso Registrado</h3>
                        <div class="flex items-baseline gap-1 mt-1">
                            <span id="current-weight" class="text-4xl font-bold text-slate-800">--</span>
                            <span class="text-slate-400 font-medium">kg</span>
                        </div>
                    </div>
                </div>

                <!-- Água Card -->
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center relative overflow-hidden">
                    <div class="absolute top-4 left-4 text-cyan-500"><i data-lucide="droplet"></i></div>
                    <h3 class="text-slate-500 text-sm font-medium mb-4 mt-2">Água (Hoje)</h3>
                    <div class="relative w-32 h-32 flex items-center justify-center">
                        <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <path class="text-slate-100" stroke-width="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <path id="water-progress" class="text-cyan-500 transition-all duration-1000 ease-out" stroke-width="3" stroke-dasharray="0, 100" stroke-linecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        </svg>
                        <div class="absolute flex flex-col items-center">
                            <span id="water-consumed" class="text-xl font-bold text-slate-800">0</span>
                            <span class="text-xs text-slate-400">/ <span id="water-goal-display">2500</span> ml</span>
                        </div>
                    </div>
                </div>

                <!-- Atalho Nova Refeição -->
                <div onclick="switchTab('meals')" class="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-2xl shadow-sm text-white flex flex-col justify-center cursor-pointer transition-transform hover:scale-[1.02]">
                    <div class="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mb-4"><i data-lucide="plus"></i></div>
                    <h3 class="text-lg font-bold mb-1">Nova Refeição</h3>
                    <p class="text-emerald-100 text-sm">Registre o que você comeu agora.</p>
                </div>
            </div>

            <!-- Gráfico de Peso -->
            <div class="mt-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div class="flex items-center gap-2 mb-6">
                    <i data-lucide="trending-up" class="text-blue-500"></i>
                    <h3 class="text-slate-800 font-bold">Evolução de Peso</h3>
                </div>
                <div class="w-full h-64 relative">
                    <canvas id="weightChart"></canvas>
                    <div id="empty-chart-msg" class="absolute inset-0 flex flex-col items-center justify-center bg-white z-10 text-slate-400 gap-2">
                        <i data-lucide="scale" class="opacity-30" style="width: 40px; height: 40px;"></i>
                        <p>Registre mais de um peso para ver o gráfico.</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- VIEW: MEALS -->
        <div id="view-meals" class="view-section">
            <header class="mb-8 hidden md:block">
                <h1 class="text-3xl font-bold text-slate-800">Refeições</h1>
            </header>

            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
                <h2 class="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><i data-lucide="apple" class="text-emerald-500"></i> Registrar Refeição</h2>
                <form id="form-meal" class="flex flex-col md:flex-row gap-4">
                    <div class="flex-1">
                        <label class="block text-sm font-medium text-slate-500 mb-1">Alimento</label>
                        <input type="text" id="meal-name" required placeholder="Ex: Arroz com frango" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                    </div>
                    <div class="md:w-48">
                        <label class="block text-sm font-medium text-slate-500 mb-1">Calorias (kcal)</label>
                        <input type="number" id="meal-cal" required min="1" placeholder="Ex: 400" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                    </div>
                    <div class="flex items-end">
                        <button type="submit" class="w-full md:w-auto bg-emerald-500 hover:bg-emerald-600 text-white font-medium p-3 rounded-xl flex items-center justify-center gap-2">
                            <i data-lucide="plus"></i> Adicionar
                        </button>
                    </div>
                </form>
            </div>

            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 class="text-lg font-bold text-slate-800 mb-4">Histórico Completo</h3>
                <div id="meals-list" class="space-y-3">
                    <!-- Preenchido via JS -->
                </div>
            </div>
        </div>

        <!-- VIEW: WATER -->
        <div id="view-water" class="view-section">
            <header class="mb-8 hidden md:block">
                <h1 class="text-3xl font-bold text-slate-800">Água</h1>
            </header>

            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
                <h2 class="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><i data-lucide="droplet" class="text-cyan-500"></i> Registrar Água</h2>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <button onclick="addWaterRecord(200)" class="flex flex-col items-center justify-center p-4 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 rounded-xl border border-cyan-100 transition-colors">
                        <i data-lucide="droplet" class="mb-2"></i>
                        <span class="font-bold">200 ml</span>
                        <span class="text-xs opacity-70">Copo Padrão</span>
                    </button>
                    <button onclick="addWaterRecord(350)" class="flex flex-col items-center justify-center p-4 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 rounded-xl border border-cyan-100 transition-colors">
                        <i data-lucide="droplet" class="mb-2 w-7 h-7"></i>
                        <span class="font-bold">350 ml</span>
                        <span class="text-xs opacity-70">Caneca</span>
                    </button>
                    <button onclick="addWaterRecord(500)" class="flex flex-col items-center justify-center p-4 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 rounded-xl border border-cyan-100 transition-colors">
                        <i data-lucide="droplet" class="mb-2 w-8 h-8"></i>
                        <span class="font-bold">500 ml</span>
                        <span class="text-xs opacity-70">Garrafa</span>
                    </button>
                    <div class="flex flex-col justify-end">
                        <div class="flex items-center gap-2">
                            <input type="number" id="water-custom" placeholder="Outro (ml)" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:outline-none">
                            <button onclick="addCustomWater()" class="bg-cyan-500 hover:bg-cyan-600 text-white p-3 rounded-xl">
                                <i data-lucide="plus"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 class="text-lg font-bold text-slate-800 mb-4">Histórico (Hoje)</h3>
                <div id="water-list" class="space-y-3">
                    <!-- Preenchido via JS -->
                </div>
            </div>
        </div>

        <!-- VIEW: WEIGHT -->
        <div id="view-weight" class="view-section">
            <header class="mb-8 hidden md:block">
                <h1 class="text-3xl font-bold text-slate-800">Peso</h1>
            </header>

            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
                <h2 class="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><i data-lucide="scale" class="text-blue-500"></i> Registrar Peso</h2>
                <form id="form-weight" class="flex flex-col md:flex-row gap-4">
                    <div class="flex-1">
                        <label class="block text-sm font-medium text-slate-500 mb-1">Peso Atual (kg)</label>
                        <input type="number" id="weight-val" required step="0.1" placeholder="Ex: 75.5" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none">
                    </div>
                    <div class="flex items-end">
                        <button type="submit" class="w-full md:w-auto bg-blue-500 hover:bg-blue-600 text-white font-medium p-3 rounded-xl flex items-center justify-center gap-2">
                            <i data-lucide="plus"></i> Adicionar
                        </button>
                    </div>
                </form>
            </div>

            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 class="text-lg font-bold text-slate-800 mb-4">Histórico Completo</h3>
                <div id="weight-list" class="space-y-3">
                    <!-- Preenchido via JS -->
                </div>
            </div>
        </div>

        <!-- VIEW: CALCULATOR -->
        <div id="view-calculator" class="view-section">
            <header class="mb-8 hidden md:block">
                <h1 class="text-3xl font-bold text-slate-800">Calculadora</h1>
            </header>

            <div class="max-w-3xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <div class="flex items-center gap-3 mb-6">
                    <div class="p-3 bg-indigo-50 text-indigo-500 rounded-xl"><i data-lucide="calculator"></i></div>
                    <div>
                        <h2 class="text-2xl font-bold text-slate-800">Calculadora de Calorias</h2>
                        <p class="text-slate-500 text-sm mt-1">Descubra sua meta diária ideal.</p>
                    </div>
                </div>

                <form id="form-calc" class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-2">Gênero</label>
                            <select id="calc-gender" class="w-full p-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                                <option value="male">Masculino</option>
                                <option value="female">Feminino</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-2">Idade</label>
                            <input type="number" id="calc-age" required class="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-2">Peso (kg)</label>
                            <input type="number" id="calc-weight" required step="0.1" class="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-2">Altura (cm)</label>
                            <input type="number" id="calc-height" required class="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500">
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-2">Atividade Física</label>
                        <select id="calc-activity" class="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500">
                            <option value="1.2">Sedentário</option>
                            <option value="1.375">Leve</option>
                            <option value="1.55">Moderado</option>
                            <option value="1.725">Intenso</option>
                            <option value="1.9">Muito Intenso</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-2">Objetivo</label>
                        <div class="grid grid-cols-3 gap-3">
                            <button type="button" onclick="setGoal('lose')" id="btn-lose" class="goal-btn p-3 rounded-xl border border-slate-200 bg-white text-slate-600 font-medium">Perder</button>
                            <button type="button" onclick="setGoal('maintain')" id="btn-maintain" class="goal-btn p-3 rounded-xl border border-indigo-500 bg-indigo-50 text-indigo-700 font-medium">Manter</button>
                            <button type="button" onclick="setGoal('gain')" id="btn-gain" class="goal-btn p-3 rounded-xl border border-slate-200 bg-white text-slate-600 font-medium">Ganhar</button>
                        </div>
                    </div>
                    <div class="pt-4 border-t border-slate-100">
                        <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-md transition-colors flex justify-center gap-2">
                            <i data-lucide="target"></i> Salvar Meta
                        </button>
                    </div>
                </form>
            </div>
        </div>

    </main>

    <!-- Módulos do Firebase (Versão 11.6.1 requerida pelas regras da plataforma) -->
    <script type="module">
        import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
        import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
        import { getFirestore, doc, setDoc, onSnapshot, collection, addDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

        // Firebase Configurações Fixas
        const firebaseConfig = {
            apiKey: "AIzaSyAxpQwy3PhdfAmxKxprnx85-qAigWq-JNw",
            authDomain: "nutritrack-c9f96.firebaseapp.com",
            projectId: "nutritrack-c9f96",
            storageBucket: "nutritrack-c9f96.firebasestorage.app",
            messagingSenderId: "817935027576",
            appId: "1:817935027576:web:e4dca43c6188d93bac0c8d"
        };

        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);
        
        // Define APP ID para não dar erro nos caminhos
        const __app_id = typeof window.__app_id !== 'undefined' ? window.__app_id : 'nutritrack-app';

        // Variáveis de Estado Global
        let currentUser = null;
        let mealsData = [];
        let weightsData = [];
        let waterData = [];
        let userSettings = { calorieGoal: 2000, waterGoal: 2500 };
        let selectedGoal = 'maintain'; // Para a calculadora
        let weightChartInstance = null; // Instância do Chart.js

        // Inicia Icones
        lucide.createIcons();

        // 1. Autenticação
        const initAuth = async () => {
            try {
                if (typeof window.__initial_auth_token !== 'undefined' && window.__initial_auth_token) {
                    await signInWithCustomToken(auth, window.__initial_auth_token);
                } else {
                    await signInAnonymously(auth);
                }
            } catch (err) {
                console.error("Auth falhou:", err);
            }
        };

        onAuthStateChanged(auth, (user) => {
            currentUser = user;
            if (user) {
                attachListeners();
            } else {
                document.getElementById('loading-screen').classList.add('hidden');
            }
        });

        initAuth();

        // 2. Ouvintes do Banco de Dados (Firestore)
        function attachListeners() {
            if (!currentUser) return;
            const uid = currentUser.uid;

            // Refs baseadas na Regra de Storage
            const mealsRef = collection(db, 'artifacts', __app_id, 'users', uid, 'meals');
            const weightsRef = collection(db, 'artifacts', __app_id, 'users', uid, 'weights');
            const waterRef = collection(db, 'artifacts', __app_id, 'users', uid, 'water');
            const settingsRef = collection(db, 'artifacts', __app_id, 'users', uid, 'settings');

            // Listeners
            onSnapshot(mealsRef, (snap) => {
                mealsData = snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => b.timestamp - a.timestamp);
                updateUI();
            }, console.error);

            onSnapshot(weightsRef, (snap) => {
                weightsData = snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => b.timestamp - a.timestamp);
                updateUI();
            }, console.error);

            onSnapshot(waterRef, (snap) => {
                waterData = snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => b.timestamp - a.timestamp);
                updateUI();
            }, console.error);

            onSnapshot(settingsRef, (snap) => {
                const s = snap.docs.find(d => d.id === 'profile');
                if (s) userSettings = { ...userSettings, ...s.data() };
                document.getElementById('loading-screen').classList.add('hidden');
                updateUI();
            }, console.error);
        }

        // 3. Atualizar toda a UI
        function updateUI() {
            renderDashboard();
            renderLists();
            renderChart();
            lucide.createIcons(); // Recriar icones recém adicionados via innerHTML
        }

        function renderDashboard() {
            // Cálculos
            const hoje = new Date().setHours(0,0,0,0);
            
            const refeicoesHoje = mealsData.filter(m => new Date(m.timestamp).setHours(0,0,0,0) === hoje);
            const calorias = refeicoesHoje.reduce((sum, m) => sum + m.calories, 0);
            
            const aguaHoje = waterData.filter(w => new Date(w.timestamp).setHours(0,0,0,0) === hoje);
            const agua = aguaHoje.reduce((sum, w) => sum + w.amount, 0);
            
            const peso = weightsData.length > 0 ? weightsData[0].weight : '--';

            // Atualiza Textos
            document.getElementById('sidebar-goal').innerText = userSettings.calorieGoal;
            document.getElementById('cal-goal-display').innerText = userSettings.calorieGoal + ' kcal';
            document.getElementById('cal-consumed').innerText = calorias;
            document.getElementById('current-weight').innerText = peso;
            document.getElementById('water-goal-display').innerText = userSettings.waterGoal;
            document.getElementById('water-consumed').innerText = agua;

            // Progresso Circular (Usando stroke-dasharray SVG)
            let percCal = Math.min((calorias / userSettings.calorieGoal) * 100, 100) || 0;
            const pathCal = document.getElementById('cal-progress');
            pathCal.setAttribute('stroke-dasharray', `${percCal}, 100`);
            pathCal.classList.toggle('text-rose-500', percCal >= 100 && calorias > userSettings.calorieGoal);
            pathCal.classList.toggle('text-emerald-500', percCal < 100 || calorias <= userSettings.calorieGoal);

            let percAgua = Math.min((agua / userSettings.waterGoal) * 100, 100) || 0;
            document.getElementById('water-progress').setAttribute('stroke-dasharray', `${percAgua}, 100`);
        }

        function renderLists() {
            // Lista de Refeições
            const mealsList = document.getElementById('meals-list');
            if (mealsData.length === 0) mealsList.innerHTML = '<div class="text-center py-8 text-slate-400">Nenhuma refeição registrada.</div>';
            else mealsList.innerHTML = mealsData.map(m => `
                <div class="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                        <h4 class="font-medium text-slate-800">${m.name}</h4>
                        <p class="text-sm text-slate-500 flex items-center gap-1 mt-1">
                            <i data-lucide="calendar" class="w-3 h-3"></i> ${new Date(m.timestamp).toLocaleDateString()} às ${new Date(m.timestamp).toLocaleTimeString([],{hour:'2-digit', minute:'2-digit'})}
                        </p>
                    </div>
                    <div class="flex items-center gap-4">
                        <span class="font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">${m.calories} kcal</span>
                        <button onclick="window.delRecord('meals', '${m.id}')" class="text-slate-400 hover:text-rose-500 p-2 rounded-lg hover:bg-rose-50"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                    </div>
                </div>
            `).join('');

            // Lista de Água (Apenas Hoje)
            const hoje = new Date().setHours(0,0,0,0);
            const waterList = document.getElementById('water-list');
            const aguaHoje = waterData.filter(w => new Date(w.timestamp).setHours(0,0,0,0) === hoje);
            
            if (aguaHoje.length === 0) waterList.innerHTML = '<div class="text-center py-8 text-slate-400">Nenhum registro hoje.</div>';
            else waterList.innerHTML = aguaHoje.map(w => `
                <div class="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                        <h4 class="font-bold text-slate-800 text-lg">${w.amount} ml</h4>
                        <p class="text-sm text-slate-500 flex items-center gap-1 mt-1">
                            <i data-lucide="clock" class="w-3 h-3"></i> ${new Date(w.timestamp).toLocaleTimeString([],{hour:'2-digit', minute:'2-digit'})}
                        </p>
                    </div>
                    <button onclick="window.delRecord('water', '${w.id}')" class="text-slate-400 hover:text-rose-500 p-2 rounded-lg hover:bg-rose-50"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                </div>
            `).join('');

            // Lista de Pesos
            const weightList = document.getElementById('weight-list');
            if (weightsData.length === 0) weightList.innerHTML = '<div class="text-center py-8 text-slate-400">Nenhum peso registrado.</div>';
            else weightList.innerHTML = weightsData.map(w => `
                <div class="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                        <h4 class="font-bold text-slate-800 text-lg">${w.weight} kg</h4>
                        <p class="text-sm text-slate-500 flex items-center gap-1 mt-1">
                            <i data-lucide="calendar" class="w-3 h-3"></i> ${new Date(w.timestamp).toLocaleDateString()}
                        </p>
                    </div>
                    <button onclick="window.delRecord('weights', '${w.id}')" class="text-slate-400 hover:text-rose-500 p-2 rounded-lg hover:bg-rose-50"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                </div>
            `).join('');
        }

        function renderChart() {
            if (weightsData.length < 2) {
                document.getElementById('empty-chart-msg').style.display = 'flex';
                if (weightChartInstance) weightChartInstance.destroy();
                return;
            }
            
            document.getElementById('empty-chart-msg').style.display = 'none';
            const ctx = document.getElementById('weightChart').getContext('2d');
            
            // Dados Cronológicos
            const sorted = [...weightsData].sort((a,b) => a.timestamp - b.timestamp);
            const labels = sorted.map(w => new Date(w.timestamp).toLocaleDateString([], {day:'2-digit', month:'2-digit'}));
            const data = sorted.map(w => w.weight);

            if (weightChartInstance) weightChartInstance.destroy();

            // Gradiente
            let gradient = ctx.createLinearGradient(0, 0, 0, 250);
            gradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
            gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');

            weightChartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Peso (kg)',
                        data: data,
                        borderColor: '#3b82f6',
                        backgroundColor: gradient,
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#ffffff',
                        pointBorderColor: '#3b82f6',
                        pointRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { grid: { display: false }, border: {display: false} },
                        y: { grid: { color: '#f1f5f9' }, border: {display: false} }
                    }
                }
            });
        }

        // 4. Ações Globais (Adicionadas ao Window para funcionar nos onClick do HTML)
        
        window.delRecord = async (colName, id) => {
            if(!currentUser) return;
            try { await deleteDoc(doc(db, 'artifacts', __app_id, 'users', currentUser.uid, colName, id)); } 
            catch (e) { console.error(e); }
        };

        window.addWaterRecord = async (amount) => {
            if(!currentUser || !amount) return;
            try {
                await addDoc(collection(db, 'artifacts', __app_id, 'users', currentUser.uid, 'water'), { amount: Number(amount), timestamp: Date.now() });
            } catch (e) { console.error(e); }
        };

        window.addCustomWater = () => {
            const val = document.getElementById('water-custom').value;
            if(val) {
                window.addWaterRecord(val);
                document.getElementById('water-custom').value = '';
            }
        };

        document.getElementById('form-meal').addEventListener('submit', async (e) => {
            e.preventDefault();
            if(!currentUser) return;
            const name = document.getElementById('meal-name').value;
            const cal = document.getElementById('meal-cal').value;
            try {
                await addDoc(collection(db, 'artifacts', __app_id, 'users', currentUser.uid, 'meals'), { name: name, calories: Number(cal), timestamp: Date.now() });
                document.getElementById('meal-name').value = '';
                document.getElementById('meal-cal').value = '';
            } catch(err) { console.error(err); }
        });

        document.getElementById('form-weight').addEventListener('submit', async (e) => {
            e.preventDefault();
            if(!currentUser) return;
            const val = document.getElementById('weight-val').value;
            try {
                await addDoc(collection(db, 'artifacts', __app_id, 'users', currentUser.uid, 'weights'), { weight: Number(val), timestamp: Date.now() });
                document.getElementById('weight-val').value = '';
            } catch(err) { console.error(err); }
        });

        // 5. Calculadora de Calorias
        window.setGoal = (goalType) => {
            selectedGoal = goalType;
            // Atualiza Estilos dos Botões
            document.querySelectorAll('.goal-btn').forEach(btn => {
                btn.className = 'goal-btn p-3 rounded-xl border font-medium border-slate-200 bg-white text-slate-600';
            });
            const active = document.getElementById(`btn-${goalType}`);
            active.className = 'goal-btn p-3 rounded-xl border font-medium border-indigo-500 bg-indigo-50 text-indigo-700';
        };

        document.getElementById('form-calc').addEventListener('submit', async (e) => {
            e.preventDefault();
            if(!currentUser) return;

            const gender = document.getElementById('calc-gender').value;
            const age = Number(document.getElementById('calc-age').value);
            const weight = Number(document.getElementById('calc-weight').value);
            const height = Number(document.getElementById('calc-height').value);
            const activity = Number(document.getElementById('calc-activity').value);

            // Harris-Benedict (Mifflin-St Jeor)
            let bmr = (10 * weight) + (6.25 * height) - (5 * age);
            bmr = gender === 'male' ? bmr + 5 : bmr - 161;

            let finalCals = bmr * activity;
            if(selectedGoal === 'lose') finalCals -= 500;
            if(selectedGoal === 'gain') finalCals += 500;

            const rounded = Math.round(finalCals);

            try {
                const docRef = doc(db, 'artifacts', __app_id, 'users', currentUser.uid, 'settings', 'profile');
                await setDoc(docRef, { calorieGoal: rounded }, { merge: true });
                window.switchTab('dashboard'); // Volta pro dashboard após salvar
            } catch(err) { console.error(err); }
        });

    </script>

    <script>
        // Navegação de Abas (Tabs) Vanilla JS
        function switchTab(tabId) {
            // Esconde todas as views
            document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
            // Mostra a selecionada
            document.getElementById(`view-${tabId}`).classList.add('active');
            
            // Atualiza botões do sidebar
            document.querySelectorAll('.nav-btn').forEach(btn => {
                btn.className = 'nav-btn w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-800';
            });
            const activeBtn = document.getElementById(`nav-${tabId}`);
            if(activeBtn) activeBtn.className = 'nav-btn w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium bg-emerald-50 text-emerald-700 shadow-sm';
            
            // Fecha menu mobile
            toggleMenu(true);
        }

        // Mobile Menu Toggle
        let menuOpen = false;
        function toggleMenu(forceClose = false) {
            const sidebar = document.getElementById('sidebar');
            const overlay = document.getElementById('mobile-overlay');
            const icon = document.getElementById('menu-icon');

            if (menuOpen || forceClose) {
                sidebar.classList.add('-translate-x-full');
                overlay.classList.add('hidden');
                icon.setAttribute('data-lucide', 'menu');
                menuOpen = false;
            } else {
                sidebar.classList.remove('-translate-x-full');
                overlay.classList.remove('hidden');
                icon.setAttribute('data-lucide', 'x');
                menuOpen = true;
            }
            lucide.createIcons();
        }

        document.getElementById('mobile-menu-btn').addEventListener('click', () => toggleMenu());
    </script>
</body>
</html>