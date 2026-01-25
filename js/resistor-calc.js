const COLORS = [
    { name: 'Black', hex: '#000000', digit: 0, mult: 1, tol: null },
    { name: 'Brown', hex: '#8B4513', digit: 1, mult: 10, tol: 1 },
    { name: 'Red', hex: '#FF0000', digit: 2, mult: 100, tol: 2 },
    { name: 'Orange', hex: '#FFA500', digit: 3, mult: 1000, tol: null },
    { name: 'Yellow', hex: '#FFFF00', digit: 4, mult: 10000, tol: null },
    { name: 'Green', hex: '#008000', digit: 5, mult: 100000, tol: 0.5 },
    { name: 'Blue', hex: '#0000FF', digit: 6, mult: 1000000, tol: 0.25 },
    { name: 'Violet', hex: '#EE82EE', digit: 7, mult: 10000000, tol: 0.1 },
    { name: 'Grey', hex: '#808080', digit: 8, mult: 100000000, tol: 0.05 },
    { name: 'White', hex: '#FFFFFF', digit: 9, mult: 1000000000, tol: null },
    { name: 'Gold', hex: '#FFD700', digit: null, mult: 0.1, tol: 5 },
    { name: 'Silver', hex: '#C0C0C0', digit: null, mult: 0.01, tol: 10 }
];

let state = {
    bands: 4,
    b1: 1, // Brown
    b2: 0, // Black
    b3: 0, // Black (only for 5 band)
    bm: 2, // Red (x100) -> 100 * 10 = 1000 = 1k
    bt: 10 // Gold (5%)
};

// Elements
const els = {
    mode4: document.querySelector('[data-bands="4"]'),
    mode5: document.querySelector('[data-bands="5"]'),
    group3: document.getElementById('group3'),
    b1: document.getElementById('b1'),
    b2: document.getElementById('b2'),
    b3: document.getElementById('b3'),
    bm: document.getElementById('bm'),
    bt: document.getElementById('bt'),
    vis1: document.querySelector('.band-1'),
    vis2: document.querySelector('.band-2'),
    vis3: document.querySelector('.band-3'),
    vism: document.querySelector('.band-mul'),
    vist: document.querySelector('.band-tol'),
    resValue: document.getElementById('resValue'),
    resTol: document.getElementById('resTol')
};

// Init
initUI();
update();

function initUI() {
    // Mode Switch
    els.mode4.onclick = () => setMode(4);
    els.mode5.onclick = () => setMode(5);

    // Populate Lists based on valid columns
    // Digits: Black to White (0-9)
    populateList(els.b1, [0,1,2,3,4,5,6,7,8,9], 'b1');
    populateList(els.b2, [0,1,2,3,4,5,6,7,8,9], 'b2');
    populateList(els.b3, [0,1,2,3,4,5,6,7,8,9], 'b3');
    
    // Multipliers: All
    populateList(els.bm, [0,1,2,3,4,5,6,7,8,9,10,11], 'bm');
    
    // Tolerance: Only where tol != null
    const tolIndices = COLORS.map((c, i) => c.tol !== null ? i : -1).filter(i => i !== -1);
    populateList(els.bt, tolIndices, 'bt');
}

function populateList(container, colorIndices, key) {
    container.innerHTML = '';
    
    colorIndices.forEach(idx => {
        const c = COLORS[idx];
        const div = document.createElement('div');
        div.className = 'color-option';
        if (state[key] === idx) div.classList.add('selected');
        div.onclick = () => {
             state[key] = idx;
             update();
             // Re-render selections active class
             Array.from(container.children).forEach(child => child.classList.remove('selected'));
             div.classList.add('selected');
        };
        
        div.innerHTML = `
            <div class="color-box" style="background:${c.hex}"></div>
            <span>${c.name}</span>
        `;
        container.appendChild(div);
    });
}

function setMode(n) {
    state.bands = n;
    if (n === 4) {
        els.mode4.classList.add('active');
        els.mode5.classList.remove('active');
        els.group3.classList.add('hidden');
        els.vis3.style.display = 'none';
        
        // Reset defaults if needed or just keep
    } else {
        els.mode4.classList.remove('active');
        els.mode5.classList.add('active');
        els.group3.classList.remove('hidden');
        els.vis3.style.display = 'block';
    }
    update();
}

function update() {
    const c1 = COLORS[state.b1];
    const c2 = COLORS[state.b2];
    const c3 = COLORS[state.b3];
    const cm = COLORS[state.bm];
    const ct = COLORS[state.bt];
    
    // Visual Update
    els.vis1.style.background = c1.hex;
    els.vis2.style.background = c2.hex;
    els.vis3.style.background = c3.hex;
    els.vism.style.background = cm.hex;
    els.vist.style.background = ct.hex;
    
    // Calc
    let ohms = 0;
    if (state.bands === 4) {
        ohms = (c1.digit * 10 + c2.digit) * cm.mult;
    } else {
        ohms = (c1.digit * 100 + c2.digit * 10 + c3.digit) * cm.mult;
    }
    
    els.resValue.innerText = formatOhms(ohms);
    els.resTol.innerText = `±${ct.tol}%`;
}

function formatOhms(v) {
    if (v >= 1e9) return (v / 1e9).toFixed(1).replace(/\.0$/, '') + ' GΩ';
    if (v >= 1e6) return (v / 1e6).toFixed(1).replace(/\.0$/, '') + ' MΩ';
    if (v >= 1e3) return (v / 1e3).toFixed(1).replace(/\.0$/, '') + ' kΩ';
    return v.toFixed(1).replace(/\.0$/, '') + ' Ω';
}
