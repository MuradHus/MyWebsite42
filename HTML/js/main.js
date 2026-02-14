// --- المتغيرات العامة ---
const { Engine, Render, Runner, Bodies, Composite, Events, Body, Vector } = Matter;

let engine, render, runner;
let width, height;
let stage = 1; 
let qualifiedFlags = [];
let bullets = [];
let breakables = []; 
let stage2Flags = []; 
let stage3Flags = [];
let lasers = [];
let diceRolls = []; 
let damageTexts = [];
let currentLang = 'ar';

// متغيرات المدفع
let cannonAngle = 0;
let cannonTargetAngle = 0;
let cannonState = 'aiming'; 
let shotCounter = 0; 

// Stage 3 Variables
let laserCycle = 0;
let laserState = 'idle'; 
let laserTimer = 0;
let activeLaserCount = 1;
let winnerBannerAlpha = 0;

// Stage 4 Variables
let s4Boxes = [];
let stage4State = 'setup';
let s4RevealTimer = 0;
let s4FinalCountdown = 6;
let s4CountdownTimer = 0;
let s4WaitingStartTime = 0;
let s4RecallTimer = 0;
let s4Scale = 1;
let s4PrizeTypes = [
    { type: 'oil', emoji: '🛢️', title: 'براميل نفط', value: 15 },
    { type: 'money', emoji: '💰', title: 'أموال', value: () => Math.floor(Math.random() * 11) + 5 },
    { type: 'gold', emoji: '🥇', title: 'ذهب', value: 10 },
    { type: 'wood', emoji: '🪵', title: 'خشب', value: 5 },
    { type: 'chips', emoji: '💾', title: 'شرائح إلكترونية', value: 'shield' }, 
    { type: 'insects', emoji: '🦗', title: 'حشرات', value: -10 },
    { type: 'missing', emoji: '💨', title: 'مفقودة', value: -5 }
];

// Stage 5 Variables
let stage5State = 'waiting'; 
let s5Bomb = null;
let s5BombTimer = 0;
let s5ExplosionData = null; 
let s5Flags = [];

// --- بيانات الأعلام (مع دعم اللغات) ---
const flagsData = {
    "ar": [
        { name: "فلسطين", emoji: "🇵🇸" }, { name: "السعودية", emoji: "🇸🇦" }, { name: "مصر", emoji: "🇪🇬" },
        { name: "المغرب", emoji: "🇲🇦" }, { name: "الجزائر", emoji: "🇩🇿" }, { name: "الأردن", emoji: "🇯🇴" },
        { name: "العراق", emoji: "🇮🇶" }, { name: "الكويت", emoji: "🇰🇼" }, { name: "عُمان", emoji: "🇴🇲" },
        { name: "قطر", emoji: "🇶🇦" }, { name: "تونس", emoji: "🇹🇳" }, { name: "الإمارات", emoji: "🇦🇪" },
        { name: "البحرين", emoji: "🇧🇭" }, { name: "اليمن", emoji: "🇾🇪" }, { name: "لبنان", emoji: "🇱🇧" },
        { name: "ليبيا", emoji: "🇱🇾" }, { name: "سوريا", emoji: "🇸🇾" }, { name: "السودان", emoji: "🇸🇩" },
        { name: "موريتانيا", emoji: "🇲🇷" }, { name: "الصومال", emoji: "🇸🇴" }, { name: "جيبوتي", emoji: "🇩🇯" },
        { name: "جزر القمر", emoji: "🇰🇲" }, 
        { name: "تركيا", emoji: "🇹🇷" }, { name: "ألمانيا", emoji: "🇩🇪" }, { name: "فرنسا", emoji: "🇫🇷" },
        { name: "إسبانيا", emoji: "🇪🇸" }, { name: "إيطاليا", emoji: "🇮🇹" }, { name: "بريطانيا", emoji: "🇬🇧" },
        { name: "البرتغال", emoji: "🇵🇹" }, { name: "هولندا", emoji: "🇳🇱" }, { name: "بلجيكا", emoji: "🇧🇪" },
        { name: "سويسرا", emoji: "🇨🇭" }, { name: "السويد", emoji: "🇸🇪" }, { name: "النرويج", emoji: "🇳🇴" },
        { name: "الدنمارك", emoji: "🇩🇰" }, { name: "فنلندا", emoji: "🇫🇮" }, { name: "أيرلندا", emoji: "🇮🇪" },
        { name: "بولندا", emoji: "🇵🇱" }, { name: "النمسا", emoji: "🇦🇹" }, { name: "اليونان", emoji: "🇬🇷" },
        { name: "روسيا", emoji: "🇷🇺" }, { name: "أوكرانيا", emoji: "🇺🇦" }, { name: "صربيا", emoji: "🇷🇸" },
        { name: "كرواتيا", emoji: "🇭🇷" }, { name: "البوسنة", emoji: "🇧🇦" }, { name: "رومانيا", emoji: "🇷🇴" },
        { name: "بلغاريا", emoji: "🇧🇬" }, { name: "المجر", emoji: "🇭🇺" }, { name: "التشيك", emoji: "🇨🇿" },
        { name: "أمريكا", emoji: "🇺🇸" }, { name: "كندا", emoji: "🇨🇦" }, { name: "المكسيك", emoji: "🇲🇽" },
        { name: "البرازيل", emoji: "🇧🇷" }, { name: "الأرجنتين", emoji: "🇦🇷" }, { name: "تشيلي", emoji: "🇨🇱" },
        { name: "كولومبيا", emoji: "🇨🇴" }, { name: "بيرو", emoji: "🇵🇪" }, { name: "فنزويلا", emoji: "🇻🇪" },
        { name: "أوروغواي", emoji: "🇺🇾" }, { name: "باراغواي", emoji: "🇵🇾" }, { name: "الإكوادور", emoji: "🇪🇨" },
        { name: "الصين", emoji: "🇨🇳" }, { name: "اليابان", emoji: "🇯🇵" }, { name: "كوريا الجنوبية", emoji: "🇰🇷" },
        { name: "كوريا الشمالية", emoji: "🇰🇵" }, { name: "الهند", emoji: "🇮🇳" }, { name: "باكستان", emoji: "🇵🇰" },
        { name: "إندونيسيا", emoji: "🇮🇩" }, { name: "ماليزيا", emoji: "🇲🇾" }, { name: "الفلبين", emoji: "🇵🇭" },
        { name: "فيتنام", emoji: "🇻🇳" }, { name: "تايلاند", emoji: "🇹🇭" }, { name: "سنغافورة", emoji: "🇸🇬" },
        { name: "بنغلاديش", emoji: "🇧🇩" }, { name: "أفغانستان", emoji: "🇦🇫" }, { name: "إيران", emoji: "🇮🇷" },
        { name: "أستراليا", emoji: "🇦🇺" }, { name: "نيوزيلندا", emoji: "🇳🇿" }, 
        { name: "جنوب أفريقيا", emoji: "🇿🇦" }, { name: "نيجيريا", emoji: "🇳🇬" }, { name: "غانا", emoji: "🇬🇭" },
        { name: "السنغال", emoji: "🇸🇳" }, { name: "الكاميرون", emoji: "🇨🇲" }, { name: "كوديفوار", emoji: "🇨🇮" },
        { name: "كينيا", emoji: "🇰🇪" }, { name: "إثيوبيا", emoji: "🇪🇹" }, { name: "تنزانيا", emoji: "🇹🇿" }
    ],
    "en": [
        { name: "Palestine", emoji: "🇵🇸" }, { name: "Saudi Arabia", emoji: "🇸🇦" }, { name: "Egypt", emoji: "🇪🇬" },
        { name: "Morocco", emoji: "🇲🇦" }, { name: "Algeria", emoji: "🇩🇿" }, { name: "Jordan", emoji: "🇯🇴" },
        { name: "Iraq", emoji: "🇮🇶" }, { name: "Kuwait", emoji: "🇰🇼" }, { name: "Oman", emoji: "🇴🇲" },
        { name: "Qatar", emoji: "🇶🇦" }, { name: "Tunisia", emoji: "🇹🇳" }, { name: "UAE", emoji: "🇦🇪" },
        { name: "Bahrain", emoji: "🇧🇭" }, { name: "Yemen", emoji: "🇾🇪" }, { name: "Lebanon", emoji: "🇱🇧" },
        { name: "Libya", emoji: "🇱🇾" }, { name: "Syria", emoji: "🇸🇾" }, { name: "Sudan", emoji: "🇸🇩" },
        { name: "Mauritania", emoji: "🇲🇷" }, { name: "Somalia", emoji: "🇸🇴" }, { name: "Djibouti", emoji: "🇩🇯" },
        { name: "Comoros", emoji: "🇰🇲" }, 
        { name: "Turkey", emoji: "🇹🇷" }, { name: "Germany", emoji: "🇩🇪" }, { name: "France", emoji: "🇫🇷" },
        { name: "Spain", emoji: "🇪🇸" }, { name: "Italy", emoji: "🇮🇹" }, { name: "UK", emoji: "🇬🇧" },
        { name: "Portugal", emoji: "🇵🇹" }, { name: "Netherlands", emoji: "🇳🇱" }, { name: "Belgium", emoji: "🇧🇪" },
        { name: "Switzerland", emoji: "🇨🇭" }, { name: "Sweden", emoji: "🇸🇪" }, { name: "Norway", emoji: "🇳🇴" },
        { name: "Denmark", emoji: "🇩🇰" }, { name: "Finland", emoji: "🇫🇮" }, { name: "Ireland", emoji: "🇮🇪" },
        { name: "Poland", emoji: "🇵🇱" }, { name: "Austria", emoji: "🇦🇹" }, { name: "Greece", emoji: "🇬🇷" },
        { name: "Russia", emoji: "🇷🇺" }, { name: "Ukraine", emoji: "🇺🇦" }, { name: "Serbia", emoji: "🇷🇸" },
        { name: "Croatia", emoji: "🇭🇷" }, { name: "Bosnia", emoji: "🇧🇦" }, { name: "Romania", emoji: "🇷🇴" },
        { name: "Bulgaria", emoji: "🇧🇬" }, { name: "Hungary", emoji: "🇭🇺" }, { name: "Czechia", emoji: "🇨🇿" },
        { name: "USA", emoji: "🇺🇸" }, { name: "Canada", emoji: "🇨🇦" }, { name: "Mexico", emoji: "🇲🇽" },
        { name: "Brazil", emoji: "🇧🇷" }, { name: "Argentina", emoji: "🇦🇷" }, { name: "Chile", emoji: "🇨🇱" },
        { name: "Colombia", emoji: "🇨🇴" }, { name: "Peru", emoji: "🇵🇪" }, { name: "Venezuela", emoji: "🇻🇪" },
        { name: "Uruguay", emoji: "🇺🇾" }, { name: "Paraguay", emoji: "🇵🇾" }, { name: "Ecuador", emoji: "🇪🇨" },
        { name: "China", emoji: "🇨🇳" }, { name: "Japan", emoji: "🇯🇵" }, { name: "South Korea", emoji: "🇰🇷" },
        { name: "North Korea", emoji: "🇰🇵" }, { name: "India", emoji: "🇮🇳" }, { name: "Pakistan", emoji: "🇵🇰" },
        { name: "Indonesia", emoji: "🇮🇩" }, { name: "Malaysia", emoji: "🇲🇾" }, { name: "Philippines", emoji: "🇵🇭" },
        { name: "Vietnam", emoji: "🇻🇳" }, { name: "Thailand", emoji: "🇹🇭" }, { name: "Singapore", emoji: "🇸🇬" },
        { name: "Bangladesh", emoji: "🇧🇩" }, { name: "Afghanistan", emoji: "🇦🇫" }, { name: "Iran", emoji: "🇮🇷" },
        { name: "Australia", emoji: "🇦🇺" }, { name: "New Zealand", emoji: "🇳🇿" }, 
        { name: "South Africa", emoji: "🇿🇦" }, { name: "Nigeria", emoji: "🇳🇬" }, { name: "Ghana", emoji: "🇬🇭" },
        { name: "Senegal", emoji: "🇸🇳" }, { name: "Cameroon", emoji: "🇨🇲" }, { name: "Ivory Coast", emoji: "🇨🇮" },
        { name: "Kenya", emoji: "🇰🇪" }, { name: "Ethiopia", emoji: "🇪🇹" }, { name: "Tanzania", emoji: "🇹🇿" }
    ]
};

const canvas = document.getElementById('game-canvas');

function getSavedLanguage() {
    return localStorage.getItem('language') || 'ar';
}

function init() {
    // Stage 3 Variables Init
    stage3Flags = [];
    lasers = [];
    diceRolls = [];
    damageTexts = [];
    winnerBannerAlpha = 0;
    activeLaserCount = 1;
    laserState = 'idle';
    
    currentLang = getSavedLanguage();

    const titles = {
        'ar': { main: "المرحلة 1: سباق السقوط", sub: "أول 10 أعلام تصل للنهاية تتأهل!" },
        'en': { main: "Stage 1: The Drop Race", sub: "First 10 flags to reach the bottom qualify!" }
    };
    if(document.getElementById('main-title')) {
        document.getElementById('main-title').innerText = titles[currentLang].main;
        document.getElementById('sub-title').innerText = titles[currentLang].sub;
    }
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';

    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    engine = Engine.create();
    render = Render.create({
        canvas: canvas,
        engine: engine,
        options: {
            width: width,
            height: height,
            wireframes: false,
            background: 'transparent'
        }
    });

    window.addEventListener('resize', () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        render.options.height = height;
        
        if (stage === 2 && typeof repositionStage2Flags === 'function') {
            repositionStage2Flags();
        }
    });

    startStage1();
    
    Render.run(render);
    runner = Runner.create();
    Runner.run(runner, engine);

    Events.on(render, 'afterRender', renderCustomGraphics);
    Events.on(engine, 'beforeUpdate', updateLoop); 
    Events.on(engine, 'collisionStart', handleCollisions);
}

function resetGame() {
    stage = 1;
    qualifiedFlags = [];
    bullets = [];
    stage2Flags = [];
    cannonAngle = 0;
    cannonState = 'aiming';
    shotCounter = 0;

    document.getElementById('winner-ui').style.display = 'none';
    document.getElementById('qualifiers-container').innerHTML = '';
    document.getElementById('main-title').innerText = "المرحلة 1: سباق السقوط";
    document.getElementById('main-title').className = "text-2xl font-black text-yellow-500 tracking-wider";
    document.getElementById('sub-title').innerText = "أول 10 أعلام تصل للنهاية تتأهل!";

    Composite.clear(engine.world);
    Engine.clear(engine);

    startStage1();
}

function devJump(targetStage) {
    if (window.resultsTimer) clearInterval(window.resultsTimer);
    document.getElementById('stage-results-ui').style.display = 'none';
    document.getElementById('winner-ui').style.display = 'none';

    Composite.clear(engine.world);
    Engine.clear(engine);
    bullets = [];
    stage2Flags = [];
    stage3Flags = [];
    lasers = [];
    diceRolls = [];

    const allFlags = flagsData[currentLang] || flagsData['ar'];
    const shuffled = [...allFlags].sort(() => Math.random() - 0.5);

    if (targetStage === 1) {
        resetGame();
    } else if (targetStage === 2) {
        qualifiedFlags = shuffled.slice(0, 10);
        startStage2();
    } else if (targetStage === 3) {
        qualifiedFlags = shuffled.slice(0, 9);
        startStage3();
    } else if (targetStage === 4) {
        qualifiedFlags = shuffled.slice(0, 8);
        startStage4();
    } else if (targetStage === 5) {
        qualifiedFlags = shuffled.slice(0, 7);
        startStage5();
    }
}

function showStageResults(loser, qualifiers, nextStageFunc) {
    const ui = document.getElementById('stage-results-ui');
    const grid = document.getElementById('qualifiers-grid');
    const loserEmoji = document.getElementById('loser-emoji');
    const loserName = document.getElementById('loser-name');
    const loserSection = document.getElementById('loser-display').parentElement;
    const nextBtn = document.getElementById('next-stage-btn');
    const btnTimer = document.getElementById('btn-timer');
    
    if (loser) {
        loserSection.style.display = 'block';
        loserEmoji.innerText = loser.emoji;
        loserName.innerText = loser.name;
    } else {
        loserSection.style.display = 'none';
    }

    grid.innerHTML = '';
    qualifiers.forEach(f => {
        const item = document.createElement('div');
        // تصميم الدائرة الفاخرة لكل متأهل
        item.className = 'flex flex-col items-center group';
        item.innerHTML = `
            <div class="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-full bg-slate-800 border-2 border-slate-700 shadow-xl overflow-hidden transition-transform group-hover:scale-110">
                <div class="absolute inset-0 bg-gradient-to-tr from-slate-900/50 to-transparent"></div>
                <span class="text-3xl sm:text-4xl relative z-10">${f.emoji}</span>
            </div>
            <span class="text-[10px] sm:text-xs mt-2 text-slate-300 font-bold truncate w-24 text-center group-hover:text-yellow-400 transition-colors">${f.name}</span>
        `;
        grid.appendChild(item);
    });

    const qCount = document.getElementById('qualifiers-count');
    if (qCount) qCount.innerText = qualifiers.length;

    // تحسين شبكة المتأهلين لتنسجم مع الدوائر
    grid.className = "grid grid-cols-4 sm:grid-cols-5 gap-4 sm:gap-6 w-full justify-items-center mt-4";

    ui.style.display = 'flex';
    
    let timeLeft = 12;
    btnTimer.innerText = `(${timeLeft})`;
    
    const cleanup = () => {
        clearInterval(window.resultsTimer);
        ui.style.display = 'none';
        nextBtn.onclick = null;
    };

    nextBtn.onclick = () => {
        cleanup();
        if(nextStageFunc) nextStageFunc();
    };
    
    window.resultsTimer = setInterval(() => {
        timeLeft--;
        btnTimer.innerText = `(${timeLeft})`;
        if (timeLeft <= 0) {
            cleanup();
            if(nextStageFunc) nextStageFunc();
        }
    }, 1000);
}

// Helper to get color based on HP
function getObstacleColor(hp) {
    const colors = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#3b82f6'];
    return colors[hp - 1] || '#3b82f6';
}

function updateLoop() {
    if (stage === 2) {
        if(typeof updateCannonLogic === 'function') updateCannonLogic();
        
        for (let i = bullets.length - 1; i >= 0; i--) {
            const b = bullets[i];
            if (b.position.x < -50 || b.position.x > width + 50 || b.position.y < -50 || b.position.y > height + 50) {
                Composite.remove(engine.world, b);
                bullets.splice(i, 1);
            }
        }
    } else if (stage === 3) {
        if(typeof updateStage3Logic === 'function') updateStage3Logic();
    } else if (stage === 4) {
        if(typeof updateStage4Logic === 'function') updateStage4Logic();
    } else if (stage === 5) {
        if(typeof updateStage5Logic === 'function') updateStage5Logic();
    }
}

function renderCustomGraphics() {
    const ctx = render.context;

    if (stage === 1) {
        const bodies = Composite.allBodies(engine.world);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        bodies.forEach(b => {
            if (b.label === 'flagBall') {
                ctx.font = '20px Arial';
                ctx.fillStyle = '#000'; 
                ctx.fillText(b.flagData.emoji, b.position.x, b.position.y);
            }
            if (b.label === 'breakable') {
                ctx.font = 'bold 12px Arial';
                ctx.fillStyle = '#fff';
                ctx.fillText(b.hp, b.position.x, b.position.y);
            }
        });
    }
    else if (stage === 2) {
        if(typeof drawStage2 === 'function') drawStage2(ctx);
    }
    else if (stage === 3) {
        if(typeof drawStage3 === 'function') drawStage3(ctx);
    }
    else if (stage === 4) {
        if(typeof drawStage4 === 'function') drawStage4(ctx);
        
        // Flags are bodies in stage 4
        const bodies = Composite.allBodies(engine.world);
        bodies.forEach(body => {
            if (body.label === 'stage4Flag') {
                ctx.font = "24px Arial";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillStyle = '#fff';
                ctx.fillText(body.flagData.emoji, body.position.x, body.position.y);
                
                ctx.font = '10px Cairo';
                ctx.fillStyle = '#cbd5e1';
                ctx.fillText(body.flagData.name, body.position.x, body.position.y + 25);
            }
        });
    }
    else if (stage === 5) {
        if(typeof drawStage5 === 'function') drawStage5(ctx);
    }
}

function handleCollisions(event) {
    if (stage === 1 && typeof handleStage1Collisions === 'function') {
        handleStage1Collisions(event);
    }
    else if (stage === 2 && typeof handleStage2Collisions === 'function') {
        handleStage2Collisions(event);
    }
}

// Global helpers that might be used by stages
function distToSegment(p, v, w) {
    const l2 = (v.x - w.x)**2 + (v.y - w.y)**2;
    if (l2 == 0) return Math.hypot(p.x - v.x, p.y - v.y);
    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(p.x - (v.x + t * (w.x - v.x)), p.y - (v.y + t * (w.y - v.y)));
}

window.onload = init;
