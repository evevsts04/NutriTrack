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
        .animate-fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .view-section { display: none; }
        .view-section.active { display: block; animation: fadeIn 0.4s ease-out; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
    </style>
</head>
<body class="bg-slate-50 text-slate-800 font-sans antialiased selection:bg-emerald-100 selection:text-emerald-900 min-h-screen flex flex-col md:flex-row">

    <!-- Loading Spinner Inicial -->
    <div id="loading-screen" class="fixed inset-0 bg-slate-50 z-[100] flex flex-col items-center justify-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mb-4"></div>
        <p class="text-slate-500 font-medium">Carregando seus dados...</p>
    </div>

    <div id="auth-screen" class="hidden fixed inset-0 z-50 flex items-center justify-center bg-slate-50">
        <div class="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 w-full max-w-md mx-4 animate-fade-in">
            <div class="flex items-center justify-center gap-2 text-emerald-600 font-black text-3xl mb-8 tracking-tight">
                <i data-lucide="activity" class="w-8 h-8"></i> NutriTrack
            </div>
            <h2 id="auth-title" class="text-2xl font-bold text-slate-800 mb-6 text-center">Entrar</h2>
            
            <form id="form-auth" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <input type="email" id="auth-email" required placeholder="seu@email.com" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none">
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Senha</label>
                    <input type="password" id="auth-pass" required placeholder="••••••••" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none">
                </div>
                <button type="submit" id="auth-submit-btn" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-md transition-all">Entrar</button>
            </form>
            
            <p id="auth-toggle-text" class="text-center text-sm text-slate-500 mt-6">
                Não tem uma conta? <span class="text-emerald-600 cursor-pointer hover:underline font-medium" onclick="toggleAuthMode()">Criar agora</span>
            </p>
        </div>
    </div>

    <!-- Mobile Header -->
    <div class="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div class="flex items-center gap-2 text-emerald-600 font-black text-xl tracking-tight">
            <i data-lucide="activity"></i> NutriTrack
        </div>
        <button onclick="toggleMenu()" class="p-2 text-slate-500 bg-slate-50 rounded-lg">
            <i data-lucide="menu"></i>
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
                <i data-lucide="calculator"></i> Calculadora de Metas
            </button>
        </div>
        
        <div class="p-4 border-t border-slate-100">
            <button onclick="handleLogout()" class="w-full flex items-center justify-center gap-2 px-4 py-2 mb-4 rounded-xl transition-all duration-200 font-medium text-rose-500 hover:bg-rose-50">
                <i data-lucide="log-out" class="w-4 h-4"></i> Sair da Conta
            </button>
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

                <!-- Macros do Dia -->
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center">
                    <div class="flex items-center justify-between mb-3">
                        <div class="p-2 bg-amber-50 text-amber-500 rounded-lg"><i data-lucide="pie-chart"></i></div>
                        <span class="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded-full">Estimativa IA</span>
                    </div>
                    <h3 class="text-slate-500 text-sm font-medium mb-3">Nutrientes de Hoje</h3>
                    <div class="space-y-2 text-sm font-medium">
                        <div class="flex justify-between items-center">
                            <span class="flex items-center gap-2"><div class="w-2 h-2 rounded-full bg-blue-400"></div> Carbo</span>
                            <span id="dash-carbs" class="text-slate-800">0g</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="flex items-center gap-2"><div class="w-2 h-2 rounded-full bg-rose-400"></div> Proteína</span>
                            <span id="dash-protein" class="text-slate-800">0g</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="flex items-center gap-2"><div class="w-2 h-2 rounded-full bg-amber-400"></div> Gordura</span>
                            <span id="dash-fat" class="text-slate-800">0g</span>
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
                <form id="form-meal" class="flex flex-col gap-4">
                    <input type="hidden" id="editing-meal-id" value="">
                    <div class="flex flex-col md:flex-row gap-4">
                        <div class="flex-1">
                            <label class="block text-sm font-medium text-slate-500 mb-1">O que você comeu?</label>
                            <input type="text" id="meal-name" required placeholder="Ex: Arroz, feijão e 1 bife" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                        </div>
                        <div class="md:w-48">
                            <label class="block text-sm font-medium text-slate-500 mb-1">Calorias (Opcional c/ IA)</label>
                            <input type="number" id="meal-cal" min="1" placeholder="Ex: 400" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                        </div>
                    </div>
                    
                    <div class="flex flex-col md:flex-row items-center gap-3 pt-2">
                        <button type="submit" id="btn-submit-meal" class="w-full md:w-auto bg-slate-800 hover:bg-slate-900 text-white font-medium px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
                            <i data-lucide="plus" class="w-5 h-5"></i> Salvar Manual
                        </button>
                        
                        <!-- Botão Inteligência Artificial -->
                        <button type="button" id="btn-ai-add" onclick="addMealWithAI()" class="w-full md:w-auto bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md">
                            <i data-lucide="sparkles" class="w-5 h-5"></i> Analisar Macros com IA
                        </button>

                        <button type="button" id="btn-cancel-edit" onclick="cancelEdit()" class="hidden w-full md:w-auto bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
                            Cancelar
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
                    </button>
                    <button onclick="addWaterRecord(350)" class="flex flex-col items-center justify-center p-4 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 rounded-xl border border-cyan-100 transition-colors">
                        <i data-lucide="droplet" class="mb-2 w-7 h-7"></i>
                        <span class="font-bold">350 ml</span>
                    </button>
                    <button onclick="addWaterRecord(500)" class="flex flex-col items-center justify-center p-4 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 rounded-xl border border-cyan-100 transition-colors">
                        <i data-lucide="droplet" class="mb-2 w-8 h-8"></i>
                        <span class="font-bold">500 ml</span>
                    </button>
                    <div class="flex flex-col justify-end">
                        <div class="flex items-center gap-2">
                            <input type="number" id="water-custom" placeholder="Outro (ml)" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:outline-none">
                            <button onclick="addCustomWater()" class="bg-cyan-500 hover:bg-cyan-600 text-white p-3 rounded-xl"><i data-lucide="plus"></i></button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 class="text-lg font-bold text-slate-800 mb-4">Histórico (Hoje)</h3>
                <div id="water-list" class="space-y-3"></div>
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
                <div id="weight-list" class="space-y-3"></div>
            </div>
        </div>

        <!-- VIEW: CALCULATOR -->
        <div id="view-calculator" class="view-section">
            <header class="mb-8 hidden md:block">
                <h1 class="text-3xl font-bold text-slate-800">Calculadora de Metas</h1>
            </header>
            <div class="max-w-3xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <div class="flex items-center gap-3 mb-6">
                    <div class="p-3 bg-indigo-50 text-indigo-500 rounded-xl"><i data-lucide="calculator"></i></div>
                    <div>
                        <h2 class="text-2xl font-bold text-slate-800">Seu Perfil de Saúde</h2>
                        <p class="text-slate-500 text-sm mt-1">Configure seus dados para calcularmos suas metas diárias.</p>
                    </div>
                </div>
                <form id="form-calc" class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-2">Gênero</label>
                            <select id="calc-gender" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"><option value="male">Masculino</option><option value="female">Feminino</option></select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-2">Idade</label>
                            <input type="number" id="calc-age" required min="1" placeholder="Ex: 30" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-2">Peso Inicial (kg)</label>
                            <input type="number" id="calc-weight" required step="0.1" min="1" placeholder="Ex: 75.5" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-2">Altura (cm)</label>
                            <input type="number" id="calc-height" required min="50" placeholder="Ex: 175" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500">
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-2">Nível de Atividade Física</label>
                        <select id="calc-activity" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500">
                            <option value="1.2">Sedentário</option><option value="1.375">Leve</option><option value="1.55">Moderado</option><option value="1.725">Intenso</option><option value="1.9">Muito Intenso</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-2">Qual seu objetivo principal?</label>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <button type="button" onclick="setGoal('lose')" id="btn-lose" class="goal-btn p-3 rounded-xl border border-slate-200 bg-white text-slate-600 font-medium">Perder Peso</button>
                            <button type="button" onclick="setGoal('maintain')" id="btn-maintain" class="goal-btn p-3 rounded-xl border border-indigo-500 bg-indigo-50 text-indigo-700 font-medium">Manter o Peso</button>
                            <button type="button" onclick="setGoal('gain')" id="btn-gain" class="goal-btn p-3 rounded-xl border border-slate-200 bg-white text-slate-600 font-medium">Ganhar Massa</button>
                        </div>
                    </div>
                    <div class="pt-6 border-t border-slate-100">
                        <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-md transition-all flex justify-center items-center gap-2"><i data-lucide="save"></i> Salvar Perfil e Calcular Metas</button>
                    </div>
                </form>
            </div>
        </div>

    </main>

    <script type="module">
        import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
        import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
        import { getFirestore, doc, setDoc, updateDoc, onSnapshot, collection, addDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

        // Obtendo configurações da plataforma (Variáveis Injetadas pelo Canvas)
        let firebaseConfig;
        try {
            firebaseConfig = JSON.parse(__firebase_config);
        } catch (e) {
            console.error("Erro ao carregar configurações do banco de dados.", e);
        }

        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);
        
        // Regra Estrita 1: Uso da App ID fornecida
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

        let currentUser = null;
        let mealsData = [];
        let weightsData = [];
        let waterData = [];
        let userSettings = { calorieGoal: 2000, waterGoal: 2500, macros: { carbs: 50, protein: 30, fat: 20 } };
        let selectedGoal = 'maintain'; 
        let weightChartInstance = null; 

        lucide.createIcons();

        // Utilitário de Notificação (Substitui os alerts nativos)
        window.showToast = (message, type = 'success') => {
            const toast = document.createElement('div');
            const bgColor = type === 'error' ? 'bg-rose-500' : 'bg-emerald-500';
            toast.className = `fixed bottom-4 left-1/2 transform -translate-x-1/2 md:translate-x-0 md:left-auto md:right-8 px-6 py-3 rounded-xl shadow-lg font-medium text-white transition-all z-[999] animate-fade-in ${bgColor}`;
            toast.innerHTML = `<div class="flex items-center gap-2"><i data-lucide="${type === 'error' ? 'alert-circle' : 'check-circle'}"></i> ${message}</div>`;
            document.body.appendChild(toast);
            lucide.createIcons();
            
            setTimeout(() => {
                toast.style.opacity = '0';
                setTimeout(() => toast.remove(), 400);
            }, 3000);
        };

        // --- Funções de Navegação ---
        window.switchTab = (tabId) => {
            document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
            document.getElementById('view-' + tabId).classList.add('active');
            
            document.querySelectorAll('.nav-btn').forEach(btn => {
                btn.className = 'nav-btn w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-800';
            });
            const activeBtn = document.getElementById('nav-' + tabId);
            if (activeBtn) activeBtn.className = 'nav-btn w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium bg-emerald-50 text-emerald-700 shadow-sm';
            
            if (tabId === 'dashboard') setTimeout(renderChart, 50);
            if (window.innerWidth < 768 && !document.getElementById('sidebar').classList.contains('-translate-x-full')) {
                window.toggleMenu();
            }
        };

        window.toggleMenu = () => {
            const sidebar = document.getElementById('sidebar');
            const overlay = document.getElementById('mobile-overlay');
            sidebar.classList.toggle('-translate-x-full');
            overlay.classList.toggle('hidden');
        };

        window.setGoal = (goalType) => {
            selectedGoal = goalType;
            document.querySelectorAll('.goal-btn').forEach(btn => btn.className = 'goal-btn p-3 rounded-xl border font-medium border-slate-200 bg-white text-slate-600');
            const active = document.getElementById(`btn-${goalType}`);
            if(active) active.className = 'goal-btn p-3 rounded-xl border font-medium border-indigo-500 bg-indigo-50 text-indigo-700';
        };

        // --- Autenticação ---
        const initAuth = async () => {
            try {
                // Tenta logar com o token do Canvas, se falhar ou não existir, faz login anônimo
                if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                    await signInWithCustomToken(auth, __initial_auth_token);
                } else {
                    await signInAnonymously(auth);
                }
            } catch (err) {
                console.error("Auth falhou:", err);
                document.getElementById('loading-screen').classList.add('hidden');
                document.getElementById('auth-screen').classList.remove('hidden');
            }
        };

        onAuthStateChanged(auth, (user) => {
            currentUser = user;
            if (user) {
                document.getElementById('auth-screen').classList.add('hidden');
                attachListeners();
            } else {
                document.getElementById('auth-screen').classList.remove('hidden');
                document.getElementById('loading-screen').classList.add('hidden');
            }
        });

        initAuth();

        function attachListeners() {
            if (!currentUser) return;
            const uid = currentUser.uid;

            // Regra Estrita 1: Caminhos padronizados
            onSnapshot(collection(db, 'artifacts', appId, 'users', uid, 'meals'), (snap) => {
                mealsData = snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => b.timestamp - a.timestamp);
                updateUI();
            }, (error) => console.error(error));

            onSnapshot(collection(db, 'artifacts', appId, 'users', uid, 'weights'), (snap) => {
                weightsData = snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => b.timestamp - a.timestamp);
                updateUI();
            }, (error) => console.error(error));

            onSnapshot(collection(db, 'artifacts', appId, 'users', uid, 'water'), (snap) => {
                waterData = snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => b.timestamp - a.timestamp);
                updateUI();
            }, (error) => console.error(error));

            onSnapshot(collection(db, 'artifacts', appId, 'users', uid, 'settings'), (snap) => {
                const s = snap.docs.find(d => d.id === 'profile');
                if (s) {
                    userSettings = { ...userSettings, ...s.data() };
                    
                    // Preenche campos da calculadora se existirem
                    if(s.data().gender) document.getElementById('calc-gender').value = s.data().gender;
                    if(s.data().age) document.getElementById('calc-age').value = s.data().age;
                    if(s.data().height) document.getElementById('calc-height').value = s.data().height;
                    if(s.data().activity) document.getElementById('calc-activity').value = s.data().activity;
                    if(s.data().goal) window.setGoal(s.data().goal);
                }
                
                document.getElementById('loading-screen').classList.add('hidden');
                updateUI();
            }, (error) => console.error(error));
        }

        function updateUI() {
            renderDashboard();
            renderLists();
            if(document.getElementById('view-dashboard').classList.contains('active')) renderChart();
            lucide.createIcons(); 
        }

        function renderDashboard() {
            const hoje = new Date().setHours(0,0,0,0);
            
            const refeicoesHoje = mealsData.filter(m => new Date(m.timestamp).setHours(0,0,0,0) === hoje);
            const calorias = refeicoesHoje.reduce((sum, m) => sum + (m.calories || 0), 0);
            
            const totalCarbs = refeicoesHoje.reduce((sum, m) => sum + (m.carbs || 0), 0);
            const totalProtein = refeicoesHoje.reduce((sum, m) => sum + (m.protein || 0), 0);
            const totalFat = refeicoesHoje.reduce((sum, m) => sum + (m.fat || 0), 0);
            
            document.getElementById('dash-carbs').innerText = totalCarbs + 'g';
            document.getElementById('dash-protein').innerText = totalProtein + 'g';
            document.getElementById('dash-fat').innerText = totalFat + 'g';

            const aguaHoje = waterData.filter(w => new Date(w.timestamp).setHours(0,0,0,0) === hoje);
            const agua = aguaHoje.reduce((sum, w) => sum + w.amount, 0);
            const peso = weightsData.length > 0 ? weightsData[0].weight : '--';

            document.getElementById('sidebar-goal').innerText = userSettings.calorieGoal;
            document.getElementById('cal-goal-display').innerText = userSettings.calorieGoal + ' kcal';
            document.getElementById('cal-consumed').innerText = calorias;
            document.getElementById('current-weight').innerText = peso;
            document.getElementById('water-goal-display').innerText = userSettings.waterGoal;
            document.getElementById('water-consumed').innerText = agua;

            let percCal = Math.min((calorias / userSettings.calorieGoal) * 100, 100) || 0;
            const pathCal = document.getElementById('cal-progress');
            pathCal.setAttribute('stroke-dasharray', `${percCal}, 100`);
            pathCal.classList.toggle('text-rose-500', calorias > userSettings.calorieGoal);
            pathCal.classList.toggle('text-emerald-500', calorias <= userSettings.calorieGoal);

            let percAgua = Math.min((agua / userSettings.waterGoal) * 100, 100) || 0;
            document.getElementById('water-progress').setAttribute('stroke-dasharray', `${percAgua}, 100`);
        }

        function renderLists() {
            const mealsList = document.getElementById('meals-list');
            if (mealsData.length === 0) mealsList.innerHTML = '<div class="text-center py-8 text-slate-400">Nenhuma refeição registrada.</div>';
            else mealsList.innerHTML = mealsData.map(m => `
                <div class="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 gap-4">
                    <div>
                        <h4 class="font-medium text-slate-800">${m.name}</h4>
                        <p class="text-xs text-slate-500 flex items-center gap-1 mt-1">
                            <i data-lucide="clock" class="w-3 h-3"></i> ${new Date(m.timestamp).toLocaleDateString()} às ${new Date(m.timestamp).toLocaleTimeString([],{hour:'2-digit', minute:'2-digit'})}
                        </p>
                        ${m.carbs !== undefined ? `
                        <div class="text-xs text-slate-600 mt-2 flex flex-wrap gap-3 font-medium">
                            <span class="flex items-center gap-1"><div class="w-2 h-2 rounded-full bg-blue-400"></div> ${m.carbs}g Carbo</span>
                            <span class="flex items-center gap-1"><div class="w-2 h-2 rounded-full bg-rose-400"></div> ${m.protein}g Prot</span>
                            <span class="flex items-center gap-1"><div class="w-2 h-2 rounded-full bg-amber-400"></div> ${m.fat}g Gord</span>
                        </div>` : ''}
                    </div>
                    <div class="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
                        <span class="font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-sm whitespace-nowrap">${m.calories} kcal</span>
                        <div class="flex gap-1">
                            <button onclick="window.editMeal('${m.id}')" class="text-slate-400 hover:text-indigo-500 p-2 rounded-lg hover:bg-indigo-50"><i data-lucide="edit-2" class="w-4 h-4"></i></button>
                            <button onclick="window.delRecord('meals', '${m.id}')" class="text-slate-400 hover:text-rose-500 p-2 rounded-lg hover:bg-rose-50"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                        </div>
                    </div>
                </div>
            `).join('');

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

        window.delRecord = async (colName, id) => {
            if(!currentUser) return;
            try { 
                await deleteDoc(doc(db, 'artifacts', appId, 'users', currentUser.uid, colName, id)); 
                window.showToast('Item removido com sucesso!');
            } catch (e) { 
                console.error(e); 
                window.showToast('Erro ao remover o item.', 'error');
            }
        };

        window.editMeal = (id) => {
            const meal = mealsData.find(m => m.id === id);
            if(!meal) return;
            
            document.getElementById('meal-name').value = meal.name;
            document.getElementById('meal-cal').value = meal.calories || '';
            document.getElementById('editing-meal-id').value = meal.id;
            
            const btnSubmit = document.getElementById('btn-submit-meal');
            btnSubmit.innerHTML = '<i data-lucide="save" class="w-5 h-5"></i> Atualizar';
            btnSubmit.classList.replace('bg-slate-800', 'bg-indigo-600');
            btnSubmit.classList.replace('hover:bg-slate-900', 'hover:bg-indigo-700');
            
            document.getElementById('btn-cancel-edit').classList.remove('hidden');
            document.getElementById('btn-ai-add').classList.add('hidden');
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
            lucide.createIcons();
        };

        window.cancelEdit = () => {
            document.getElementById('meal-name').value = '';
            document.getElementById('meal-cal').value = '';
            document.getElementById('editing-meal-id').value = '';
            
            const btnSubmit = document.getElementById('btn-submit-meal');
            btnSubmit.innerHTML = '<i data-lucide="plus" class="w-5 h-5"></i> Salvar Manual';
            btnSubmit.classList.replace('bg-indigo-600', 'bg-slate-800');
            btnSubmit.classList.replace('hover:bg-indigo-700', 'hover:bg-slate-900');
            
            document.getElementById('btn-cancel-edit').classList.add('hidden');
            document.getElementById('btn-ai-add').classList.remove('hidden');
            lucide.createIcons();
        };

        document.getElementById('form-meal').addEventListener('submit', async (e) => {
            e.preventDefault();
            if(!currentUser) return;
            
            const name = document.getElementById('meal-name').value;
            const cal = document.getElementById('meal-cal').value;
            const editId = document.getElementById('editing-meal-id').value;

            if(!cal) {
                window.showToast("Para salvar manualmente, insira as calorias. Ou use o botão de IA.", 'error');
                return;
            }

            try {
                if(editId) {
                    const docRef = doc(db, 'artifacts', appId, 'users', currentUser.uid, 'meals', editId);
                    await updateDoc(docRef, { name: name, calories: Number(cal) });
                    window.showToast('Refeição atualizada!');
                    window.cancelEdit();
                } else {
                    await addDoc(collection(db, 'artifacts', appId, 'users', currentUser.uid, 'meals'), { 
                        name: name, calories: Number(cal), timestamp: Date.now() 
                    });
                    window.showToast('Refeição adicionada!');
                    document.getElementById('meal-name').value = '';
                    document.getElementById('meal-cal').value = '';
                }
            } catch(err) { 
                console.error(err); 
                window.showToast('Ocorreu um erro ao salvar.', 'error');
            }
        });

        // --- Integração Gemini IA Automática ---
        window.addMealWithAI = async () => {
            if(!currentUser) return;
            const nameInput = document.getElementById('meal-name').value;
            
            if (!nameInput) { 
                window.showToast('Digite o que você comeu primeiro!', 'error'); 
                document.getElementById('meal-name').focus();
                return; 
            }

            const btn = document.getElementById('btn-ai-add');
            const originalHtml = btn.innerHTML;
            btn.innerHTML = '<i class="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full block"></i> Calculando...';
            btn.disabled = true;

            try {
                const prompt = `Estime as informações nutricionais para a seguinte refeição: "${nameInput}". 
                Responda APENAS com um objeto JSON perfeitamente válido (sem textos antes ou depois, sem formatação markdown). 
                O JSON deve conter as seguintes chaves numéricas inteiras:
                "calories" (kcal estimadas), "carbs" (carboidratos em gramas), "protein" (proteínas em gramas), "fat" (gorduras em gramas).`;
                
                // Regra Mestra: Chave API é enviada vazia para auto-injeção e usa o modelo padrão
                const apiKey = "";
                const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;
                
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { responseMimeType: "application/json" }
                    })
                });

                if(!response.ok) throw new Error("Falha na API Gemini");

                const data = await response.json();
                let textContent = data.candidates[0].content.parts[0].text;
                const macros = JSON.parse(textContent);

                await addDoc(collection(db, 'artifacts', appId, 'users', currentUser.uid, 'meals'), { 
                    name: nameInput, 
                    calories: macros.calories || 0,
                    carbs: macros.carbs || 0,
                    protein: macros.protein || 0,
                    fat: macros.fat || 0,
                    timestamp: Date.now() 
                });
                
                window.showToast('Refeição gerada e adicionada!');
                document.getElementById('meal-name').value = '';
                document.getElementById('meal-cal').value = '';
                
            } catch (error) {
                console.error(error);
                window.showToast("Não foi possível analisar a refeição. Tente digitar de outra forma.", 'error');
            } finally {
                btn.innerHTML = originalHtml;
                btn.disabled = false;
                lucide.createIcons();
            }
        };

        window.addWaterRecord = async (amount) => {
            if(!currentUser || !amount) return;
            try {
                await addDoc(collection(db, 'artifacts', appId, 'users', currentUser.uid, 'water'), { amount: Number(amount), timestamp: Date.now() });
                window.showToast(`+${amount}ml adicionados!`);
            } catch (e) { console.error(e); }
        };

        window.addCustomWater = () => {
            const val = document.getElementById('water-custom').value;
            if(val) {
                window.addWaterRecord(val);
                document.getElementById('water-custom').value = '';
            }
        };

        document.getElementById('form-weight').addEventListener('submit', async (e) => {
            e.preventDefault();
            if(!currentUser) return;
            const val = document.getElementById('weight-val').value;
            try {
                await addDoc(collection(db, 'artifacts', appId, 'users', currentUser.uid, 'weights'), { weight: Number(val), timestamp: Date.now() });
                document.getElementById('weight-val').value = '';
                window.showToast('Peso registrado com sucesso!');
            } catch(err) { console.error(err); }
        });

        document.getElementById('form-calc').addEventListener('submit', async (e) => {
            e.preventDefault();
            if(!currentUser) return;

            const gender = document.getElementById('calc-gender').value;
            const age = Number(document.getElementById('calc-age').value);
            const weight = Number(document.getElementById('calc-weight').value);
            const height = Number(document.getElementById('calc-height').value);
            const activity = Number(document.getElementById('calc-activity').value);

            let bmr = (10 * weight) + (6.25 * height) - (5 * age);
            bmr = gender === 'male' ? bmr + 5 : bmr - 161;

            let finalCals = bmr * activity;
            if(selectedGoal === 'lose') finalCals -= 500;
            if(selectedGoal === 'gain') finalCals += 500;

            const roundedCals = Math.round(finalCals);
            const waterGoal = Math.round(weight * 35);

            let macros = { carbs: 50, protein: 30, fat: 20 };
            if (selectedGoal === 'lose') macros = { carbs: 40, protein: 40, fat: 20 };
            if (selectedGoal === 'gain') macros = { carbs: 50, protein: 25, fat: 25 };

            try {
                const docRef = doc(db, 'artifacts', appId, 'users', currentUser.uid, 'settings', 'profile');
                await setDoc(docRef, { 
                    calorieGoal: roundedCals,
                    waterGoal: waterGoal,
                    gender: gender,
                    age: age,
                    height: height,
                    activity: activity,
                    goal: selectedGoal,
                    macros: macros,
                    updatedAt: Date.now()
                }, { merge: true });

                if (weightsData.length === 0) {
                     await addDoc(collection(db, 'artifacts', appId, 'users', currentUser.uid, 'weights'), { 
                         weight: weight, 
                         timestamp: Date.now() 
                     });
                }

                window.showToast('Configurações Salvas com Sucesso!');
                setTimeout(() => window.switchTab('dashboard'), 1500);

            } catch(err) { 
                console.error(err); 
                window.showToast("Erro ao salvar perfil. Tente novamente.", "error"); 
            }
        });

        function renderChart() {
            if (weightsData.length < 2) {
                document.getElementById('empty-chart-msg').style.display = 'flex';
                if (weightChartInstance) weightChartInstance.destroy();
                return;
            }
            document.getElementById('empty-chart-msg').style.display = 'none';
            const ctx = document.getElementById('weightChart').getContext('2d');
            const sorted = [...weightsData].sort((a,b) => a.timestamp - b.timestamp);
            const labels = sorted.map(w => new Date(w.timestamp).toLocaleDateString([], {day:'2-digit', month:'2-digit'}));
            const data = sorted.map(w => w.weight);

            if (weightChartInstance) weightChartInstance.destroy();
            let gradient = ctx.createLinearGradient(0, 0, 0, 250);
            gradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
            gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');

            weightChartInstance = new Chart(ctx, {
                type: 'line',
                data: { labels: labels, datasets: [{ label: 'Peso (kg)', data: data, borderColor: '#3b82f6', backgroundColor: gradient, borderWidth: 3, fill: true, tension: 0.4, pointBackgroundColor: '#ffffff', pointBorderColor: '#3b82f6', pointRadius: 4 }] },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, border: {display: false} }, y: { grid: { color: '#f1f5f9' }, border: {display: false} } } }
            });
        }

        // Lógica de Tela de Login Manual
        window.toggleAuthMode = () => {
            const isLogin = document.getElementById('auth-title').innerText === 'Entrar';
            document.getElementById('auth-title').innerText = isLogin ? 'Criar Conta' : 'Entrar';
            document.getElementById('auth-submit-btn').innerText = isLogin ? 'Cadastrar' : 'Entrar';
            document.getElementById('auth-toggle-text').innerHTML = isLogin 
                ? 'Já tem uma conta? <span class="text-emerald-600 cursor-pointer hover:underline font-medium" onclick="toggleAuthMode()">Entrar</span>' 
                : 'Não tem uma conta? <span class="text-emerald-600 cursor-pointer hover:underline font-medium" onclick="toggleAuthMode()">Criar agora</span>';
        };

        document.getElementById('form-auth').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('auth-email').value;
            const pass = document.getElementById('auth-pass').value;
            const isLogin = document.getElementById('auth-title').innerText === 'Entrar';
            const btn = document.getElementById('auth-submit-btn');
            
            btn.innerHTML = '<i class="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mx-auto block"></i>';
            
            try {
                if (isLogin) {
                    await signInWithEmailAndPassword(auth, email, pass);
                } else {
                    await createUserWithEmailAndPassword(auth, email, pass);
                }
            } catch (error) {
                window.showToast('Erro: Email ou senha inválidos', 'error');
                btn.innerHTML = isLogin ? 'Entrar' : 'Cadastrar';
            }
        });

        window.handleLogout = async () => {
            await signOut(auth);
            mealsData = []; weightsData = []; waterData = [];
            document.getElementById('auth-email').value = '';
            document.getElementById('auth-pass').value = '';
            document.getElementById('auth-submit-btn').innerHTML = 'Entrar';
        };
        
    </script>
</body>
</html>