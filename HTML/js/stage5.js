function startStage5() {
    stage = 5;
    Composite.clear(engine.world);
    Engine.clear(engine);
    document.getElementById('qualifiers-container').innerHTML = '';

    const titles = {
        'ar': { main: "المرحلة 5: وقفة المجد (النهاية)", sub: "من سيبقى واقفاً للنهاية؟" },
        'en': { main: "Stage 5: Glory Stand (Final)", sub: "Who will stand until the end?" }
    };
    document.getElementById('main-title').innerText = titles[currentLang].main;
    document.getElementById('sub-title').innerText = titles[currentLang].sub;
    document.getElementById('main-title').className = "text-xl sm:text-2xl font-black text-yellow-600 tracking-wider animate-pulse";

    stage5State = 'updating_hp'; // حالة جديدة لعرض التحديثات
    s5Bomb = null;
    s5ExplosionData = null;
    s5Flags = [];

    // جدران غير مرئية لمنع خروج الأعلام
    const walls = [
        Bodies.rectangle(width/2, -50, width, 100, { isStatic: true }),
        Bodies.rectangle(width/2, height+50, width, 100, { isStatic: true }),
        Bodies.rectangle(-50, height/2, 100, height, { isStatic: true }),
        Bodies.rectangle(width+50, height/2, 100, height, { isStatic: true })
    ];
    Composite.add(engine.world, walls);

    // توزيع أساسي عشوائي للأعلام ضمن حدود الشاشة
    qualifiedFlags.forEach((flag, i) => {
        const margin = 100;
        const x = margin + Math.random() * (width - margin * 2);
        const y = margin + Math.random() * (height - margin * 2);
        
        const flagBody = Bodies.circle(x, y, 25, {
            restitution: 0.5,
            frictionAir: 0.1,
            label: 'stage5Flag'
        });
        flagBody.flagData = flag;
        // البدء بالصحة من المرحلة 3 (أو 100) وقبل إضافة نقاط المرحلة 4
        flagBody.hp = 100; // صحة أساسية
        flagBody.targetHP = 100; 
        flagBody.isUpdating = false;
        
        s5Flags.push(flagBody);
        Composite.add(engine.world, flagBody);
    });

    // بدء سلسلة التحديثات المتدرجة
    applyInitialHPUpdates();
}

function applyInitialHPUpdates() {
    let index = 0;
    
    function updateNext() {
        if (index >= s5Flags.length) {
            // انتهى عرض جميع التحديثات، انتظر قليلاً ثم ابدأ القنابل
            setTimeout(() => {
                stage5State = 'waiting';
                spawnBombSequence();
            }, 1500);
            return;
        }

        const flag = s5Flags[index];
        const points = flag.flagData.points || 0;
        
        if (points !== 0 || flag.flagData.hasShield) {
            flag.isUpdating = true;
            // حساب الصحة المستهدفة مع مراعاة الحدود (0-100)
            flag.targetHP = Math.max(0, Math.min(100, flag.hp + points));
            
            // إضافة نص الضرر أو الزيادة بتوقيت أطول
            damageTexts.push({
                x: flag.position.x,
                y: flag.position.y - 60,
                text: points > 0 ? `+${points}` : (points < 0 ? points : ""),
                opacity: 1,
                timer: Date.now(),
                isInitial: true // لتمييزه وتمديد وقته في update
            });

            if (flag.flagData.hasShield) {
                damageTexts.push({
                    x: flag.position.x,
                    y: flag.position.y - 90,
                    text: "🛡️ Shield!",
                    opacity: 1,
                    timer: Date.now() + 200,
                    isInitial: true
                });
            }

            // تحديث الصحة تدريجياً (أنيميشن)
            let steps = 20;
            let currentStep = 0;
            const diff = (flag.targetHP - flag.hp) / steps;
            
            const interval = setInterval(() => {
                flag.hp += diff;
                currentStep++;
                if (currentStep >= steps) {
                    flag.hp = flag.targetHP;
                    flag.isUpdating = false;
                    clearInterval(interval);
                }
            }, 30);

            index++;
            setTimeout(updateNext, 1200); // تأخير بين كل علم وآخر ليكون العرض مريحاً
        } else {
            // لا توجد نقاط لهذا العلم، انتقل للتالي فوراً أو بتأخير بسيط
            index++;
            setTimeout(updateNext, 200);
        }
    }

    setTimeout(updateNext, 1000); // تأخير أولي قبل بدء أول علم
}

function spawnBombSequence() {
    if (stage !== 5) return;

    stage5State = 'throwing';
    
    // رمي القنبلة من حافة عشوائية
    const side = Math.floor(Math.random() * 4);
    let startX, startY;
    const margin = -50;
    
    if (side === 0) { startX = Math.random() * width; startY = margin; }
    else if (side === 1) { startX = width - margin; startY = Math.random() * height; }
    else if (side === 2) { startX = Math.random() * width; startY = height - margin; }
    else { startX = margin; startY = Math.random() * height; }

    s5Bomb = Bodies.circle(startX, startY, 20, {
        restitution: 0.6,
        frictionAir: 0.05,
        label: 's5Bomb'
    });
    Composite.add(engine.world, s5Bomb);

    // توجيه القنبلة لمركز الشاشة تقريباً
    const targetX = width/4 + Math.random() * width/2;
    const targetY = height/4 + Math.random() * height/2;
    const dx = targetX - startX;
    const dy = targetY - startY;
    Body.setVelocity(s5Bomb, { x: dx * 0.05, y: dy * 0.05 });

    // انتظار استقرار القنبلة ثم التحذير ثم الانفجار
    setTimeout(() => {
        if (stage !== 5 || !s5Bomb) return;
        stage5State = 'warning'; // ظهور حدود الخطر
        
        setTimeout(() => {
            if (stage !== 5) return;
            triggerExplosion();
        }, 2000); // مدة التحذير بالدوائر

    }, 1500); // مدة "الطيران" والاستقرار
}

function triggerExplosion() {
    if (!s5Bomb) return;
    
    const bX = s5Bomb.position.x;
    const bY = s5Bomb.position.y;
    s5ExplosionData = { x: bX, y: bY, timer: Date.now() };
    stage5State = 'exploding';

    s5Flags.forEach(flagBody => {
        const dist = Math.hypot(flagBody.position.x - bX, flagBody.position.y - bY);
        let damage = 0;

        if (dist < 100) damage = Math.floor(Math.random() * 11) + 30;   // حمراء: 30-40
        else if (dist < 200) damage = Math.floor(Math.random() * 6) + 15;  // برتقالية: 15-20
        else if (dist < 300) damage = Math.floor(Math.random() * 6) + 5;   // صفراء: 5-10

        if (damage > 0) {
            flagBody.hp -= damage;
            flagBody.flagData.hp = flagBody.hp;

            damageTexts.push({
                x: flagBody.position.x, y: flagBody.position.y - 40,
                text: `-${damage}`, opacity: 1, timer: Date.now()
            });

            // قوة دفع الانفجار
            const forceMag = (400 - dist) * 0.0001;
            const angle = Math.atan2(flagBody.position.y - bY, flagBody.position.x - bX);
            Body.applyForce(flagBody, flagBody.position, {
                x: Math.cos(angle) * forceMag,
                y: Math.sin(angle) * forceMag
            });
        }
    });

    Composite.remove(engine.world, s5Bomb);
    s5Bomb = null;
    
    // فحص الخسارة أو استمرار الجولة
    const deadFlags = s5Flags.filter(f => f.hp <= 0);
    if (deadFlags.length > 0) {
        // أول من يصل لـ 0 يخرج
        const loser = deadFlags[0].flagData;
        const survivorIndex = qualifiedFlags.findIndex(f => f.name === loser.name);
        if (survivorIndex > -1) qualifiedFlags.splice(survivorIndex, 1);
        
        setTimeout(() => endGame(loser), 2000);
    } else {
        // هروب الأعلام ثم إعادة المشهد
        setTimeout(() => {
            if (stage !== 5) return;
            stage5State = 'escaping';
            escapeFlagsFromPoint(bX, bY);
            
            setTimeout(() => {
                if (stage !== 5) return;
                spawnBombSequence();
            }, 2500); // وقت راحة بعد الهروب

        }, 1000); // وقت بعد الانفجار للهروب
    }
}

function escapeFlagsFromPoint(ex, ey) {
    s5Flags.forEach(flag => {
        const margin = 100;
        const targetX = margin + Math.random() * (width - margin * 2);
        const targetY = margin + Math.random() * (height - margin * 2);

        // حركة انزلاقية سريعة للهروب
        const dx = targetX - flag.position.x;
        const dy = targetY - flag.position.y;
        Body.setVelocity(flag, { x: dx * 0.12, y: dy * 0.12 });
    });
}

function updateStage5Logic() {
    // تباطؤ تدريجي للأعلام
    s5Flags.forEach(flag => {
        Body.setVelocity(flag, {
            x: flag.velocity.x * 0.94,
            y: flag.velocity.y * 0.94
        });
    });

    // تحديث نصوص الضرر (بسرعة عرض مختلفة للتحديثات الأولية)
    for (let i = damageTexts.length - 1; i >= 0; i--) {
        const dt = damageTexts[i];
        dt.y -= 0.5; // صعود أبطأ
        dt.opacity -= dt.isInitial ? 0.008 : 0.02; // اختفاء أبطأ للتحديث الأول
        if (dt.opacity <= 0) damageTexts.splice(i, 1);
    }

    if (stage5State === 'exploding') {
        if (s5ExplosionData && Date.now() - s5ExplosionData.timer > 800) {
            s5ExplosionData = null;
        }
    }
}

function drawStage5(ctx) {
    // 1. رسم حدود الخطر (تحذير القنبلة)
    if (stage5State === 'warning' && s5Bomb) {
        const pos = s5Bomb.position;
        const pulse = Math.sin(Date.now() * 0.01) * 0.2 + 0.8;
        
        ctx.save();
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 10]);
        
        // المنطقة الصفراء (300)
        ctx.strokeStyle = `rgba(234, 179, 8, ${0.3 * pulse})`;
        ctx.beginPath(); ctx.arc(pos.x, pos.y, 300, 0, Math.PI*2); ctx.stroke();
        
        // المنطقة البرتقالية (200)
        ctx.strokeStyle = `rgba(249, 115, 22, ${0.5 * pulse})`;
        ctx.beginPath(); ctx.arc(pos.x, pos.y, 200, 0, Math.PI*2); ctx.stroke();
        
        // المنطقة الحمراء (100)
        ctx.strokeStyle = `rgba(239, 68, 68, ${0.8 * pulse})`;
        ctx.lineWidth = 4;
        ctx.setLineDash([]);
        ctx.beginPath(); ctx.arc(pos.x, pos.y, 100, 0, Math.PI*2); ctx.stroke();
        ctx.restore();
    }

    // 2. رسم الانفجار
    if (s5ExplosionData) {
        const elapsed = Date.now() - s5ExplosionData.timer;
        const radius = elapsed * 0.6;
        const alpha = Math.max(0, 1 - (elapsed / 800));
        ctx.save();
        ctx.globalAlpha = alpha;
        const grad = ctx.createRadialGradient(s5ExplosionData.x, s5ExplosionData.y, 0, s5ExplosionData.x, s5ExplosionData.y, radius);
        grad.addColorStop(0, '#fff');
        grad.addColorStop(0.2, '#fde047');
        grad.addColorStop(0.5, '#f97316');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(s5ExplosionData.x, s5ExplosionData.y, radius, 0, Math.PI*2); ctx.fill();
        ctx.restore();
    }

    // 3. رسم الأعلام
    s5Flags.forEach(f => {
        if (f.hp <= 0 && stage5State !== 'updating_hp') return;
        const pos = f.position;
        
        // دائرة خلفية نيون
        const hpPercent = Math.max(f.hp / 100, 0);
        const hue = hpPercent * 120;
        
        ctx.save();
        // هالة ضوئية أقوى أثناء التحديث
        ctx.shadowBlur = f.isUpdating ? 30 : 15;
        ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;
        
        ctx.beginPath(); ctx.arc(pos.x, pos.y, f.isUpdating ? 35 : 30, 0, Math.PI*2);
        ctx.fillStyle = `hsla(${hue}, 100%, 50%, ${f.isUpdating ? 0.3 : 0.15})`;
        ctx.fill();
        ctx.strokeStyle = `hsl(${hue}, 100%, 65%)`;
        ctx.lineWidth = f.isUpdating ? 5 : 3;
        ctx.stroke();
        ctx.restore();

        ctx.fillStyle = '#fff';
        ctx.font = f.isUpdating ? '40px Arial' : '32px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(f.flagData.emoji, pos.x, pos.y);
        
        // HP Bar صغير فوق العلم
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(pos.x - 20, pos.y - 45, 40, 5);
        ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
        ctx.fillRect(pos.x - 20, pos.y - 45, 40 * hpPercent, 5);
        
        // إضافة HP كنسبة مئوية بجانب الشريط
        ctx.fillStyle = "#fff";
        ctx.font = "bold 10px Arial";
        ctx.fillText(Math.ceil(f.hp), pos.x + 25, pos.y - 41);
    });

    // 4. رسم القنبلة
    if (s5Bomb) {
        const pos = s5Bomb.position;
        ctx.save();
        ctx.translate(pos.x, pos.y);
        const shake = stage5State === 'warning' ? Math.sin(Date.now() * 0.05) * 3 : 0;
        ctx.font = '45px Arial';
        ctx.fillText("💣", shake, shake);
        ctx.restore();
    }

    // 5. نصوص الضرر والتحديث
    damageTexts.forEach(dt => {
        ctx.save();
        ctx.globalAlpha = dt.opacity;
        ctx.fillStyle = '#fff';
        
        if (dt.isInitial) {
            const isPositive = dt.text.startsWith('+');
            ctx.fillStyle = isPositive ? '#4ade80' : (dt.text.startsWith('-') ? '#ef4444' : '#fff');
            ctx.font = 'bold 36px Cairo'; // نص أكبر للتحديثات الأولية
            ctx.shadowColor = isPositive ? '#22c55e' : '#ef4444';
        } else {
            ctx.font = 'bold 24px Cairo';
            ctx.shadowColor = '#ef4444';
        }
        
        ctx.shadowBlur = 15;
        ctx.textAlign = 'center';
        ctx.fillText(dt.text, dt.x, dt.y);
        ctx.restore();
    });
}

function endGame(loser) {
    stage = 6;
    showStageResults(loser, qualifiedFlags, () => {
        const finalWinner = qualifiedFlags[0];
        document.getElementById('winner-ui').style.display = 'flex';
        document.getElementById('winner-emoji').innerText = finalWinner.emoji;
        document.getElementById('winner-name').innerText = finalWinner.name;
    });
}
