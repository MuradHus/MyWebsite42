function startStage3() {
    stage = 3;
    Composite.clear(engine.world);
    Engine.clear(engine);
    document.getElementById('qualifiers-container').innerHTML = '';

    const titles = {
        'ar': { main: "المرحلة 3: تجنب الليزر", sub: "الليزر سيقضي على الأقل حظاً!" },
        'en': { main: "Stage 3: Laser Dodge", sub: "Lasers will eliminate the unlucky!" }
    };
    document.getElementById('main-title').innerText = titles[currentLang].main;
    document.getElementById('sub-title').innerText = titles[currentLang].sub;
    document.getElementById('main-title').className = "text-xl sm:text-2xl font-black text-purple-500 tracking-wider animate-pulse";

    stage3Flags = [];
    lasers = [];
    activeLaserCount = 1;
    laserCycle = 0;
    laserState = 'idle'; // idle -> warning -> firing -> idle
    
    // إضافة حدود لمنع خروج الأعلام من الشاشة
    const walls = [
        Bodies.rectangle(width / 2, -10, width, 20, { isStatic: true }),
        Bodies.rectangle(width / 2, height + 10, width, 20, { isStatic: true }),
        Bodies.rectangle(-10, height / 2, 20, height, { isStatic: true }),
        Bodies.rectangle(width + 10, height / 2, 20, height, { isStatic: true })
    ];
    Composite.add(engine.world, walls);
    
    // Grid Setup (3x3)
    // حساب حجم العلم - متجاوب وأصغر للهواتف لتجنب التقارب
    const isMobile = width < 600;
    flagRadius = Math.min(isMobile ? 20 : 28, width * (isMobile ? 0.045 : 0.06));
    const spacing = flagRadius * (isMobile ? 3.5 : 3);
    const centerX = width / 2;
    const centerY = height / 2;
    
    qualifiedFlags.forEach((flag, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const x = centerX + (col - 1) * spacing;
        const y = centerY + (row - 1) * spacing;
        
        const flagBody = Bodies.circle(x, y, flagRadius, {
            isStatic: false,
            frictionAir: 0.1,
            restitution: 0.5,
            label: 'stage3Flag',
            render: { fillStyle: 'transparent' }
        });
        flagBody.flagData = flag;
        flagBody.hp = 100;
        flagBody.i = i; // حفظ الفهرس للاستخدام في الرسم
        
        // تعيين لون خلفية فريد لكل علم (توزيع متساوي على عجلة الألوان)
        const hue = (i * (360 / qualifiedFlags.length)) % 360;
        flagBody.bgColor = `hsla(${hue}, 70%, 50%, 0.25)`;
        flagBody.glowColor = `hsla(${hue}, 100%, 60%, 0.8)`;
        
        stage3Flags.push(flagBody);
        Composite.add(engine.world, flagBody);
    });

    runLaserSequence();
}

function runLaserSequence() {
    if (stage !== 3) return;

    // 1. Determine Lasers
    laserCycle++;
    activeLaserCount = Math.min(3, 1 + Math.floor(laserCycle / 7));
    generateLasers();
    
    // 2. Warning Phase
    laserState = 'warning';
    setTimeout(() => {
        if (stage !== 3) return;

        // 3. Firing Phase
        laserState = 'firing';
        checkLaserHits();
        
        setTimeout(() => {
            if (stage !== 3) return;
            
            // 4. Cool Down (فاصل أطول بعد الضربة لإعطاء شعور بالفخامة)
            laserState = 'idle'; 
            
            setTimeout(() => {
                if (stage !== 3) return;
                
                // 5. Smooth Move (حركة الأعلام)
                moveFlagsToRandomPositions();
                
                setTimeout(() => {
                    if (stage !== 3) return;
                    runLaserSequence(); // الدورة التالية
                }, 2500); // زيادة فاصل الراحة بعد الحركة

            }, 1200); // زيادة فاصل الهدوء بعد اختفاء الليزر

        }, 1200); // مدة ضرب الليزر

    }, 2000); // زيادة مدة التحذير للمسة احترافية
}

function moveFlagsToRandomPositions() {
    stage3Flags.forEach(flag => {
        const margin = 120;
        const targetX = margin + Math.random() * (width - margin * 2);
        const targetY = margin + Math.random() * (height - margin * 2);

        // جولة البحث: دفعات متكررة ناعمة لتبدو وكأنها تبحث
        let searchCount = 0;
        const searchInterval = setInterval(() => {
            if (stage !== 3) { clearInterval(searchInterval); return; }
            
            // إضافة حركة عشوائية ( jitter ) للبحث
            const jitterX = (Math.random() - 0.5) * 15;
            const jitterY = (Math.random() - 0.5) * 15;
            
            const dx = (targetX + jitterX) - flag.position.x;
            const dy = (targetY + jitterY) - flag.position.y;
            
            Body.setVelocity(flag, { 
                x: dx * 0.08 + jitterX * 0.2, 
                y: dy * 0.08 + jitterY * 0.2 
            });
            
            searchCount++;
            if (searchCount > 15) { // انتهاء جولة البحث
                clearInterval(searchInterval);
                // استقرار نهائي
                Body.setVelocity(flag, { x: dx * 0.05, y: dy * 0.05 });
            }
        }, 60);
    });
}

function generateLasers() {
    lasers = [];
    for(let i=0; i < activeLaserCount; i++) {
        // ليزر بزوايا عشوائية تماماً - ضمام عدم ظهور الليزر موازياً للحواف بشكل ممل
        const p1 = getRandomBoundaryPoint(80); // هامش 80 بكسل من الزوايا
        let p2 = getRandomBoundaryPoint(80);
        
        // التأكد من أن الليزر يقطع مساحة كافية من الشاشة (طوله كافٍ)
        const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
        if (dist < 300) {
            i--; // إعادة المحاولة لهذه الفتحة
            continue;
        }
        lasers.push({ p1, p2 });
    }
}

function getRandomBoundaryPoint(margin = 0) {
    const edge = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
    switch(edge) {
        case 0: return { x: margin + Math.random() * (width - margin * 2), y: 0 };
        case 1: return { x: width, y: margin + Math.random() * (height - margin * 2) };
        case 2: return { x: margin + Math.random() * (width - margin * 2), y: height };
        case 3: return { x: 0, y: margin + Math.random() * (height - margin * 2) };
    }
}

function checkLaserHits() {
    let deadFlags = [];
    
    lasers.forEach(laser => {
        stage3Flags.forEach(flag => {
            const dist = distToSegment(flag.position, laser.p1, laser.p2);
            if (dist < 35) { 
                const damage = Math.floor(Math.random() * 11) + 10; // ضرر عشوائي 10-20
                flag.hp -= damage;
                
                damageTexts.push({
                    x: flag.position.x,
                    y: flag.position.y - 40,
                    text: `-${damage}`,
                    opacity: 1,
                    timer: Date.now()
                });
            }
        });
    });

    // Check deaths
    stage3Flags.forEach(flag => {
        if (flag.hp <= 0) {
            deadFlags.push(flag);
        }
    });

    if (deadFlags.length === 1) {
         const loser = deadFlags[0].flagData;
         const survivorIndex = qualifiedFlags.findIndex(f => f.name === loser.name);
         if (survivorIndex > -1) {
             qualifiedFlags.splice(survivorIndex, 1);
         }
        endStage3(loser);
    } else if (deadFlags.length > 1) {
        // Tie Breaker
        deadFlags.forEach(flag => {
            if (!diceRolls.find(d => d.flag === flag)) {
                diceRolls.push({
                    flag: flag,
                    value: 1,
                    timer: Date.now(),
                    rollsLeft: 20 
                });
            }
        });
    }
}

function updateStage3Logic() {
    // 1. Update Damage Texts
    for (let i = damageTexts.length - 1; i >= 0; i--) {
        const dt = damageTexts[i];
        dt.y -= 1; 
        dt.opacity -= 0.02;
        if (dt.opacity <= 0) {
            damageTexts.splice(i, 1);
        }
    }

    // 2. Smooth Damping (تباطؤ تدريجي ناعم)
    stage3Flags.forEach(flag => {
        Body.setVelocity(flag, {
            x: flag.velocity.x * 0.92,
            y: flag.velocity.y * 0.92
        });
    });

    // 3. Dice Logic
    if (diceRolls.length > 0) {
        diceRolls.forEach(dice => {
            if (dice.rollsLeft > 0) {
                if (Date.now() - dice.timer > 100) {
                    dice.value = Math.floor(Math.random() * 6) + 1;
                    dice.rollsLeft--;
                    dice.timer = Date.now();
                }
            }
        });

        // Check if all rolled
        const rolling = diceRolls.filter(d => d.rollsLeft > 0);
        if (rolling.length === 0) {
            // Find lowest
            diceRolls.sort((a, b) => a.value - b.value);
            const lowest = diceRolls[0];
            const ties = diceRolls.filter(d => d.value === lowest.value);
            
            if (ties.length === 1) {
                const loser = lowest.flag.flagData;
                const survivorIndex = qualifiedFlags.findIndex(f => f.name === loser.name);
                if (survivorIndex > -1) qualifiedFlags.splice(survivorIndex, 1);
                endStage3(loser);
                diceRolls = []; // Clear
            } else {
                // Reroll for ties
                ties.forEach(d => {
                    d.rollsLeft = 20; 
                });
                diceRolls = diceRolls.filter(d => ties.includes(d)); // Keep only ties
            }
        }
    }
}

function endStage3(loser) {
    stage = 3.5;
    showStageResults(loser, qualifiedFlags, startStage4);
}

function drawStage3(ctx) {
    // 1. Draw Lasers first (Behind everything)
    if (laserState === 'warning' || laserState === 'firing') {
        lasers.forEach(laser => {
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(laser.p1.x, laser.p1.y);
            ctx.lineTo(laser.p2.x, laser.p2.y);
            
            if (laserState === 'warning') {
                // تصميم تحذير ممتاز: نبضات ضوء
                const pulse = Math.sin(Date.now() * 0.01) * 0.2 + 0.4;
                ctx.strokeStyle = `rgba(239, 68, 68, ${pulse})`;
                ctx.lineWidth = 1.5; // ليزر أنحف للتحذير
                ctx.setLineDash([10, 8]);
                ctx.shadowColor = '#ef4444';
                ctx.shadowBlur = 5;
            } else if (laserState === 'firing') {
                // تصميم ليزر "مرعب" ومتوهج
                ctx.strokeStyle = '#fff'; // قلب الليزر أبيض
                ctx.lineWidth = 2.5; // ليزر أنحف للضرب
                ctx.shadowColor = '#ef4444';
                ctx.shadowBlur = 20;
                
                // رسم هالة الليزر
                ctx.stroke();
                ctx.strokeStyle = '#ef4444';
                ctx.lineWidth = 8; // هالة أنحف
                ctx.shadowBlur = 0;
            }
            ctx.stroke();
            ctx.restore();
        });
    }

    // 2. Draw Flags
    stage3Flags.forEach(f => {
        const pos = f.position;
        
        ctx.save();
        const hpPercent = Math.max(f.hp / 100, 0);
        const healthHue = hpPercent * 120;
        
        // الهالة الضوئية الملونة (Glow)
        ctx.shadowBlur = 25;
        ctx.shadowColor = f.glowColor;
        
        // خلفية الدائرة الملونة الفريدة لكل علم
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, flagRadius * 1.1, 0, Math.PI * 2);
        ctx.fillStyle = f.bgColor;
        ctx.fill();
        
        // إطار النيون المتناسق (نفس لون الخلفية ولكن مشرق)
        const borderHue = (f.i * (360 / qualifiedFlags.length)) % 360;
        ctx.strokeStyle = `hsl(${borderHue}, 100%, 75%)`;
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // إضافة لمعان صغير
        ctx.beginPath();
        ctx.arc(pos.x - flagRadius * 0.3, pos.y - flagRadius * 0.3, flagRadius * 0.15, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fill();
        ctx.restore();

        // الرموز والاسم
        ctx.fillStyle = '#ffffff'; // تأكيد اللون الأبيض للرمز
        const emojiSize = Math.floor(flagRadius * 1.1);
        ctx.font = `${emojiSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(f.flagData.emoji, pos.x, pos.y);
        
        ctx.font = `bold ${Math.floor(flagRadius * 0.4)}px Cairo`;
        ctx.fillStyle = '#f1f5f9';
        ctx.fillText(f.flagData.name, pos.x, pos.y + flagRadius * 1.3);
        
        const hp = Math.ceil(f.hp);
        ctx.font = `bold ${Math.floor(flagRadius * 0.6)}px Arial`;
        ctx.fillStyle = `hsl(${healthHue}, 100%, 50%)`;
        ctx.shadowBlur = 5;
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        if (hp < 30 && Date.now() % 500 < 250) ctx.globalAlpha = 0.5;
        ctx.fillText(hp, pos.x, pos.y - flagRadius * 1.5);
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
    });

    // 3. Draw Damage Texts
    damageTexts.forEach(dt => {
        ctx.save();
        ctx.globalAlpha = dt.opacity;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 30px Cairo';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ef4444';
        ctx.textAlign = 'center';
        ctx.fillText(dt.text, dt.x, dt.y);
        ctx.restore();
    });
    
    // 4. Draw Dice
    diceRolls.forEach(dice => {
        const pos = dice.flag.position;
        ctx.save();
        ctx.translate(pos.x, pos.y + 65);
        ctx.fillStyle = '#fff';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 15;
        roundRect(ctx, -22, -22, 44, 44, 10);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 26px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(dice.value, 0, 2);
        ctx.restore();
    });
}

// Helper for rounded rect (if not global)
function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}
