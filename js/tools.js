// --- Golden Gears Animation ---
const canvas = document.getElementById('gearsCanvas');
const ctx = canvas.getContext('2d');
let width, height;

function resize() {
    width = canvas.parentElement.offsetWidth;
    height = 250;
    canvas.width = width;
    canvas.height = height;
}
window.addEventListener('resize', resize);
resize();

class Gear {
    constructor(x, y, teeth, radius, speed, color) {
        this.x = x;
        this.y = y;
        this.teeth = teeth;
        this.radius = radius;
        this.speed = speed;
        this.angle = 0;
        this.color = color;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        ctx.fillStyle = this.color;
        
        // Draw teeth
        for (let i = 0; i < this.teeth; i++) {
            ctx.rotate(Math.PI * 2 / this.teeth);
            ctx.fillRect(-5, -this.radius - 8, 10, 10);
        }

        // Draw main circle
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Draw inner hole
        ctx.fillStyle = '#012e1f'; // Background color match
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Visual decoration ring
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 0.7, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    }

    update() {
        this.angle += this.speed;
    }
}

const gears = [
    new Gear(100, 100, 12, 40, 0.02, '#d4af37'),
    new Gear(175, 100, 20, 60, -0.012, '#b8860b'), // Interlocking approximation
    new Gear(280, 120, 15, 50, 0.015, '#ffd700'),
    new Gear(width - 100, 150, 24, 80, 0.005, '#d4af37'),
    new Gear(width - 200, 80, 10, 30, -0.02, '#daa520')
];

function animateGears() {
    ctx.clearRect(0, 0, width, height);
    gears.forEach(gear => {
        gear.update();
        gear.draw();
    });
    // Update gear positions if screen resizes drastically? 
    // Simplified for now.
    requestAnimationFrame(animateGears);
}
animateGears();


// --- Tool Logic ---

const modal = document.getElementById('tool-modal');
const modalBody = document.getElementById('modal-body');

function closeModal() {
    modal.style.display = 'none';
    // Safety check: stop stopwatch if running
    if (typeof swInterval !== 'undefined') clearInterval(swInterval);
    swRunning = false;
}

function openTool(toolType) {
    let html = '';
    switch(toolType) {
        case 'freefall':
            html = `
                <h2>⏱️ حساب الارتفاع بالسقوط الحر</h2>
                <p>أسقط حجراً واحسب الزمن حتى تسمع صوت الارتطام (أو تراه يلمس الأرض).</p>
                <div class="input-group">
                    <label>الزمن (ثواني):</label>
                    <input type="number" id="time-input" step="0.1">
                </div>
                <button class="calc-btn" onclick="calcFreeFall()">احسب الارتفاع</button>
                <div class="result" id="result-area"></div>
                <p class="note">* إهمال مقاومة الهواء</p>
            `;
            break;
        case 'number9':
            html = `
                <h2>9️⃣ أسرار الرقم 9</h2>
                <div class="input-group">
                    <label>أدخل أي رقم:</label>
                    <input type="number" id="n9-input">
                </div>
                <button class="calc-btn" onclick="calcNine()">حلل الرقم</button>
                <div class="result" id="result-area"></div>
            `;
            break;
        case 'shapes':
            html = `
                <h2>📐 المساحة والمحيط</h2>
                <div class="input-group">
                    <label>اختر الشكل:</label>
                    <select id="shape-select" onchange="updateShapeInputs()">
                        <option value="square">مربع</option>
                        <option value="circle">دائرة</option>
                        <option value="rect">مستطيل</option>
                    </select>
                </div>
                <div id="shape-inputs">
                    <!-- Dynamic inputs -->
                </div>
                <button class="calc-btn" onclick="calcShape()">احسب</button>
                <div class="result" id="result-area"></div>
            `;
            setTimeout(updateShapeInputs, 0); // Init inputs
            break;
        case 'thumb':
            html = `
                <h2>👍 مقياس الإبهام</h2>
                <p>أغلق عيناً واحدة، وغطِ الهدف بإبهامك. ثم بدّل العين المفتوحة وقدر إزاحة الهدف جانبياً.</p>
                <div class="input-group">
                    <label>الإزاحة الجانبية المقدرة (متر):</label>
                    <input type="number" id="jump-dist">
                </div>
                <button class="calc-btn" onclick="calcThumb()">احسب المسافة</button>
                <div class="result" id="result-area"></div>
                <p class="note">* المسافة = الإزاحة × 10 تقريباً</p>
            `;
            break;
        case 'lightning':
            html = `
                <h2>⚡ بُعد البرق</h2>
                <p>ابدأ العد عند رؤية البرق، وتوقف عند سماع الرعد.</p>
                <div class="input-group">
                    <label>عدد الثواني:</label>
                    <input type="number" id="thunder-time">
                </div>
                <button class="calc-btn" onclick="calcLightning()">احسب البعد</button>
                <div class="result" id="result-area"></div>
            `;
            break;
        case 'age':
            html = `
                <h2>🎂 حساب العمر</h2>
                <div class="input-group">
                    <label>تاريخ ميلادك:</label>
                    <input type="date" id="birth-date">
                </div>
                <button class="calc-btn" onclick="calcAge()">احسب عمري</button>
                <div class="result" id="result-area"></div>
            `;
            break;
        case 'bmi':
            html = `
                <h2>⚖️ مؤشر كتلة الجسم (BMI)</h2>
                <div class="input-group">
                    <label>الوزن (كغ):</label>
                    <input type="number" id="bmi-weight">
                    <br><br>
                    <label>الطول (سم):</label>
                    <input type="number" id="bmi-height">
                </div>
                <button class="calc-btn" onclick="calcBMI()">احسب</button>
                <div class="result" id="result-area"></div>
            `;
            break;
        case 'stopwatch':
            html = `
                <h2>⏱️ ساعة إيقاف</h2>
                <div style="font-size: 3rem; margin: 2rem 0; font-family: monospace; color: #ffd700;" id="stopwatch-display">00:00:00</div>
                <button class="calc-btn" onclick="toggleStopwatch()" id="sw-btn">ابدأ</button>
                <button class="calc-btn" style="background:#d43737; color:white;" onclick="resetStopwatch()">تصفير</button>
            `;
            break;
        case 'units':
            html = `
                <h2>🔄 محول الوحدات</h2>
                <div class="input-group">
                    <label>النوع:</label>
                    <select id="unit-type" onchange="updateUnitInputs()">
                        <option value="len">طول (متر <> قدم)</option>
                        <option value="weight">وزن (كغ <> باوند)</option>
                    </select>
                </div>
                <div class="input-group">
                    <input type="number" id="unit-val" placeholder="القيمة" oninput="calcUnits()">
                </div>
                <div class="result" id="result-area">النتيجة ستظهر هنا</div>
            `;
            break;
        case 'binary':
            html = `
                <h2>0️⃣1️⃣ محول ثنائي</h2>
                <div class="input-group">
                    <label>النص العادي:</label>
                    <input type="text" id="text-input" placeholder="اكتب شيئاً" oninput="textToBinary()">
                </div>
                <div class="result" id="result-area" style="word-break: break-all; font-family: monospace;"></div>
            `;
            break;
        case 'unicode':
            html = `
                <h2>🔣 رمز يونيكود</h2>
                <div class="input-group">
                    <label>أدخل حرفاً أو رمزاً:</label>
                    <input type="text" id="uni-char" maxlength="1" oninput="calcUnicode()">
                </div>
                <div class="result" id="result-area"></div>
            `;
            break;
        case 'color':
            html = `
                <h2>🎨 رمز اللون</h2>
                <div class="input-group">
                    <label>اختر لوناً:</label>
                    <input type="color" id="color-picker" oninput="calcColor()" value="#d4af37" style="height: 50px; cursor: pointer;">
                </div>
                <div class="result" id="result-area"></div>
            `;
            setTimeout(calcColor, 0);
            break;
        case 'constants':
            html = `
                <h2>π الثوابت الرياضية</h2>
                <div class="input-group">
                    <label>اختر ثابت:</label>
                    <select id="const-select" onchange="showConstant()">
                        <option value="pi">Pi (π)</option>
                        <option value="e">Euler's Number (e)</option>
                        <option value="phi">Golden Ratio (φ)</option>
                        <option value="c">Speed of Light (c)</option>
                        <option value="g">Gravity (g)</option>
                    </select>
                </div>
                <div class="result" id="result-area"></div>
            `;
            setTimeout(showConstant, 0);
            break;
        case 'speed':
            html = `
                <h2>🚀 حساب السرعة</h2>
                <div class="input-group">
                    <label>المسافة (متر):</label>
                    <input type="number" id="spd-dist">
                    <br><br>
                    <label>الزمن (ثانية):</label>
                    <input type="number" id="spd-time">
                </div>
                <button class="calc-btn" onclick="calcSpeed()">احسب السرعة</button>
                <div class="result" id="result-area"></div>
            `;
            break;
        case 'bricks':
            html = `
                <h2>🧱 حساب الطوب</h2>
                <div class="input-group">
                    <label>مساحة الجدار (متر مربع):</label>
                    <input type="number" id="wall-area">
                </div>
                <div class="input-group">
                    <label>أبعاد الطوبة (سم):</label>
                    <input type="number" id="brick-w" placeholder="الطول (مثلاً 20)">
                    <input type="number" id="brick-h" placeholder="الارتفاع (مثلاً 10)" style="margin-top:5px">
                </div>
                <button class="calc-btn" onclick="calcBricks()">احسب العدد</button>
                <div class="result" id="result-area"></div>
                <p class="note">* الحساب تقريبي (بدون مونة)</p>
            `;
            break;
    }
    modalBody.innerHTML = html;
    modal.style.display = 'flex';
}

// Check for deep link on load
window.addEventListener('load', () => {
    const params = new URLSearchParams(window.location.search);
    const tool = params.get('tool');
    if (tool) {
        openTool(tool);
    }
});

// --- Calculators ---

// Batch 3 Tool Calculators

function calcUnicode() {
    const char = document.getElementById('uni-char').value;
    if (!char) {
        document.getElementById('result-area').innerHTML = '';
        return;
    }
    const code = char.codePointAt(0);
    const hex = code.toString(16).toUpperCase();
    document.getElementById('result-area').innerHTML = `
        الرمز: <strong>${char}</strong><br>
        الكود (Decimal): ${code}<br>
        الكود (Hex): U+${hex}
    `;
}

function calcColor() {
    const color = document.getElementById('color-picker').value;
    document.getElementById('result-area').innerHTML = `
        Hex Code: <strong>${color}</strong><br>
        <span style="color:${color}; font-size: 2rem;">■■■■</span>
    `;
}

function showConstant() {
    const val = document.getElementById('const-select').value;
    let info = "";
    if (val === 'pi') info = "<strong>3.14159...</strong><br>النسبة بين محيط الدائرة وقطرها.";
    else if (val === 'e') info = "<strong>2.71828...</strong><br>العدد النيبيري، أساس اللوغاريتم الطبيعي.";
    else if (val === 'phi') info = "<strong>1.61803...</strong><br>النسبة الذهبية، سر الجمال في الطبيعة.";
    else if (val === 'c') info = "<strong>299,792,458 م/ث</strong><br>سرعة الضوء في الفراغ.";
    else if (val === 'g') info = "<strong>9.81 م/ث²</strong><br>تسارع الجاذبية الأرضية القياسي.";
    
    document.getElementById('result-area').innerHTML = info;
}

function calcSpeed() {
    const d = parseFloat(document.getElementById('spd-dist').value);
    const t = parseFloat(document.getElementById('spd-time').value);
    if (!d || !t) return;
    const s = d / t;
    const kmh = s * 3.6;
    document.getElementById('result-area').innerHTML = `
        السرعة: <strong>${s.toFixed(2)}</strong> م/ث<br>
        (حوالي <strong>${kmh.toFixed(2)}</strong> كم/ساعة)
    `;
}

function calcBricks() {
    const area = parseFloat(document.getElementById('wall-area').value);
    const bw = parseFloat(document.getElementById('brick-w').value) / 100; // cm to m
    const bh = parseFloat(document.getElementById('brick-h').value) / 100;
    
    if (!area || !bw || !bh) return;
    
    const brickArea = bw * bh;
    const count = Math.ceil(area / brickArea);
    // Add 10% waste
    const withWaste = Math.ceil(count * 1.1);
    
    document.getElementById('result-area').innerHTML = `
        تحتاج تقريباً: <strong>${count}</strong> طوبة.<br>
        مع احتياطي (10%): <strong>${withWaste}</strong> طوبة.
    `;
}

// New Tools Logic

function calcAge() {
    const dobInput = document.getElementById('birth-date').value;
    if (!dobInput) return;
    
    const dob = new Date(dobInput);
    const now = new Date();
    
    let years = now.getFullYear() - dob.getFullYear();
    let months = now.getMonth() - dob.getMonth();
    let days = now.getDate() - dob.getDate();
    
    if (days < 0) {
        months--;
        days += 30; // approx
    }
    if (months < 0) {
        years--;
        months += 12;
    }
    
    document.getElementById('result-area').innerHTML = `
        عمرك هو:<br>
        <strong>${years}</strong> سنة و <strong>${months}</strong> شهر و <strong>${days}</strong> يوم.
    `;
}

function calcBMI() {
    const w = parseFloat(document.getElementById('bmi-weight').value);
    const h = parseFloat(document.getElementById('bmi-height').value) / 100; // convert to m
    
    if (!w || !h) return;
    
    const bmi = w / (h * h);
    let status = "";
    if (bmi < 18.5) status = "نحافة";
    else if (bmi < 25) status = "وزن طبيعي ✅";
    else if (bmi < 30) status = "زيادة وزن";
    else status = "سمنة";
    
    document.getElementById('result-area').innerHTML = `
        مؤشر الكتلة: <strong>${bmi.toFixed(1)}</strong><br>
        التصنيف: <strong>${status}</strong>
    `;
}

// Stopwatch Vars
let swInterval;
let swTime = 0;
let swRunning = false;

function toggleStopwatch() {
    const btn = document.getElementById('sw-btn');
    if (!swRunning) {
        swRunning = true;
        btn.innerText = "إيقاف";
        btn.style.background = "#e6b800";
        const startTime = Date.now() - swTime;
        swInterval = setInterval(() => {
            swTime = Date.now() - startTime;
            updateSWDisplay();
        }, 10);
    } else {
        swRunning = false;
        btn.innerText = "استكمال";
        btn.style.background = "#d4af37";
        clearInterval(swInterval);
    }
}

function resetStopwatch() {
    swRunning = false;
    clearInterval(swInterval);
    swTime = 0;
    updateSWDisplay();
    document.getElementById('sw-btn').innerText = "ابدأ";
}

function updateSWDisplay() {
    const totalMs = swTime;
    const ms = Math.floor((totalMs % 1000) / 10);
    const sec = Math.floor((totalMs / 1000) % 60);
    const min = Math.floor((totalMs / 60000) % 60);
    
    const fmt = (n) => n.toString().padStart(2, '0');
    document.getElementById('stopwatch-display').innerText = 
        `${fmt(min)}:${fmt(sec)}:${fmt(ms)}`;
}

function updateUnitInputs() {
    document.getElementById('unit-val').value = '';
    document.getElementById('result-area').innerText = '';
}

function calcUnits() {
    const type = document.getElementById('unit-type').value;
    const val = parseFloat(document.getElementById('unit-val').value);
    const resDiv = document.getElementById('result-area');
    
    if (isNaN(val)) {
        resDiv.innerText = "";
        return;
    }
    
    if (type === 'len') {
        const ft = val * 3.28084;
        const m = val / 3.28084;
        resDiv.innerHTML = `${val} متر = <strong>${ft.toFixed(2)}</strong> قدم<br>${val} قدم = <strong>${m.toFixed(2)}</strong> متر`;
    } else {
        const lb = val * 2.20462;
        const kg = val / 2.20462;
        resDiv.innerHTML = `${val} كغ = <strong>${lb.toFixed(2)}</strong> باوند<br>${val} باوند = <strong>${kg.toFixed(2)}</strong> كغ`;
    }
}

function textToBinary() {
    const text = document.getElementById('text-input').value;
    let binary = "";
    for (let i = 0; i < text.length; i++) {
        binary += text[i].charCodeAt(0).toString(2) + " ";
    }
    document.getElementById('result-area').innerText = binary;
}

// Old Tools Logic

function calcFreeFall() {
    const t = parseFloat(document.getElementById('time-input').value);
    if (!t) return;
    const g = 9.8;
    const h = 0.5 * g * t * t;
    const result = document.getElementById('result-area');
    result.innerHTML = `الارتفاع التقريبي: <strong>${h.toFixed(2)} متر</strong>`;
    result.style.opacity = 1;
}

function calcNine() {
    const n = document.getElementById('n9-input').value;
    if (!n) return;
    const sum = n.toString().split('').reduce((a, b) => parseInt(a) + parseInt(b), 0);
    let msg = `مجموع الخانات: ${sum}<br>`;
    if (sum % 9 === 0) msg += "✅ هذا الرقم يقبل القسمة على 9!<br>";
    else msg += `❌ الباقي عند القسمة على 9 هو ${sum % 9}<br>`;
    
    msg += `الرقم × 9 = ${n * 9} (اجمع خانات الناتج ستجدها 9 او مضاعفاتها!)`;
    
    document.getElementById('result-area').innerHTML = msg;
}

function updateShapeInputs() {
    const type = document.getElementById('shape-select').value;
    const div = document.getElementById('shape-inputs');
    if (type === 'square') {
        div.innerHTML = `<label>طول الضلع:</label><input type="number" id="s-l">`;
    } else if (type === 'circle') {
        div.innerHTML = `<label>نصف القطر:</label><input type="number" id="c-r">`;
    } else if (type === 'rect') {
        div.innerHTML = `<label>الطول:</label><input type="number" id="r-l"><br><label>العرض:</label><input type="number" id="r-w">`;
    }
}

function calcShape() {
    const type = document.getElementById('shape-select').value;
    let area = 0, perimeter = 0;
    
    if (type === 'square') {
        const l = parseFloat(document.getElementById('s-l').value);
        area = l * l;
        perimeter = 4 * l;
    } else if (type === 'circle') {
        const r = parseFloat(document.getElementById('c-r').value);
        area = Math.PI * r * r;
        perimeter = 2 * Math.PI * r;
    } else if (type === 'rect') {
        const l = parseFloat(document.getElementById('r-l').value);
        const w = parseFloat(document.getElementById('r-w').value);
        area = l * w;
        perimeter = 2 * (l + w);
    }
    
    document.getElementById('result-area').innerHTML = `
        المساحة: <strong>${area.toFixed(2)}</strong><br>
        المحيط: <strong>${perimeter.toFixed(2)}</strong>
    `;
}

function calcThumb() {
    const w = parseFloat(document.getElementById('jump-dist').value);
    const d = w * 10;
    document.getElementById('result-area').innerHTML = `المسافة التقريبية للهدف: <strong>${d} متر</strong>`;
}

function calcLightning() {
    const t = parseFloat(document.getElementById('thunder-time').value);
    const d = t * 340; // Speed of sound approx
    document.getElementById('result-area').innerHTML = `
        يبعد البرق عنك: <strong>${d} متر</strong><br>
        (${d/1000} كم)
    `;
}
