function startStage2() {
    stage = 2;
    Composite.clear(engine.world);
    Engine.clear(engine);
    document.getElementById('qualifiers-container').innerHTML = '';
    
    const titles = {
        'ar': { main: "المرحلة 2: المعركة الدائرية", sub: "صاحب الـ 0 نقاط يغادر والبقية يتأهلون!" },
        'en': { main: "Stage 2: Circular Battle", sub: "Zero points means elimination! Survivors qualify." }
    };
    document.getElementById('main-title').innerText = titles[currentLang].main;
    document.getElementById('sub-title').innerText = titles[currentLang].sub;
    document.getElementById('main-title').className = "text-xl sm:text-2xl font-black text-red-500 tracking-wider animate-pulse";

    engine.gravity.y = 0; 
    engine.gravity.x = 0;
    stage2Flags = [];
    bullets = [];
    cannonState = 'aiming';
    shotCounter = 0;
    pickNewTargetAngle();

    const radius = Math.min(width, height) * 0.35;
    const centerX = width / 2;
    const centerY = height / 2;
    const angleStep = (Math.PI * 2) / qualifiedFlags.length;

    qualifiedFlags.forEach((flag, i) => {
        const angle = i * angleStep;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        const flagBody = Bodies.circle(x, y, 25, {
            isStatic: true,
            isSensor: true, 
            label: 'targetFlag',
            render: { fillStyle: '#1e293b', strokeStyle: '#fff', lineWidth: 2 }
        });
        flagBody.flagData = flag;
        flagBody.hp = 100;
        stage2Flags.push(flagBody);
        Composite.add(engine.world, flagBody);
    });
}

function repositionStage2Flags() {
    const radius = Math.min(width, height) * 0.35;
    const centerX = width / 2;
    const centerY = height / 2;
    const angleStep = (Math.PI * 2) / stage2Flags.length;

    stage2Flags.forEach((flagBody, i) => {
        const angle = i * angleStep;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        Body.setPosition(flagBody, { x, y });
    });
}

function pickNewTargetAngle() {
    if (stage2Flags.length > 0) {
        // اختيار علم عشوائي من الموجودين
        const targetFlag = stage2Flags[Math.floor(Math.random() * stage2Flags.length)];
        const cx = width / 2;
        const cy = height / 2;
        
        // حساب الزاوية نحو العلم المختار
        cannonTargetAngle = Math.atan2(targetFlag.position.y - cy, targetFlag.position.x - cx);
    } else {
        cannonTargetAngle = Math.random() * Math.PI * 2;
    }
    cannonState = 'aiming';
}

function updateCannonLogic() {
    if (cannonState === 'aiming') {
        let diff = cannonTargetAngle - cannonAngle;
        
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;

        const rotationSpeed = 0.12; 

        if (Math.abs(diff) < rotationSpeed) {
            cannonAngle = cannonTargetAngle;
            fireCannon();
            cannonState = 'cooldown';
            
            setTimeout(() => {
                if (stage === 2) pickNewTargetAngle();
            }, 500); 
        } else {
            cannonAngle += Math.sign(diff) * rotationSpeed;
        }
    }
}

function fireCannon() {
    const centerX = width / 2;
    const centerY = height / 2;
    
    shotCounter++;
    let bulletVal, bulletRadius, bulletColor;

    if (shotCounter % 10 === 0) {
        bulletVal = 25;
        bulletRadius = 16;
        bulletColor = '#fbbf24'; 
    } else {
        bulletVal = Math.floor(Math.random() * 10) + 6;
        bulletRadius = 10;
        bulletColor = '#8b5cf6'; 
    }

    const bullet = Bodies.circle(centerX, centerY, bulletRadius, {
        friction: 0,
        frictionAir: 0,
        label: 'bullet',
        render: { fillStyle: bulletColor }
    });
    bullet.value = bulletVal;
    bullet.isGolden = (shotCounter % 10 === 0);

    const speed = 5;
    Body.setVelocity(bullet, {
        x: Math.cos(cannonAngle) * speed,
        y: Math.sin(cannonAngle) * speed
    });

    bullets.push(bullet);
    Composite.add(engine.world, bullet);
}

function handleStage2Collisions(event) {
    event.pairs.forEach(pair => {
        const { bodyA, bodyB } = pair;
        let bullet = null;
        let target = null;
        if (bodyA.label === 'bullet' && bodyB.label === 'targetFlag') { bullet = bodyA; target = bodyB; }
        if (bodyB.label === 'bullet' && bodyA.label === 'targetFlag') { bullet = bodyB; target = bodyA; }

        if (bullet && target) {
            target.hp -= bullet.value; 
            if (target.hp < 0) target.hp = 0;
            
            Composite.remove(engine.world, bullet);
            const bIndex = bullets.indexOf(bullet);
            if(bIndex > -1) bullets.splice(bIndex, 1);

            if (target.hp <= 0) {
                const survivorIndex = qualifiedFlags.findIndex(f => f.name === target.flagData.name);
                if (survivorIndex > -1) {
                    qualifiedFlags.splice(survivorIndex, 1);
                }
                
                endStage2(target.flagData);
            }
        }
    });
}

function endStage2(loser) {
    stage = 2.5; 
    showStageResults(loser, qualifiedFlags, startStage3);
}

function drawStage2(ctx) {
    const cx = width / 2;
    const cy = height / 2;
    
    // Draw Cannon
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(cannonAngle);
    
    // Base
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI*2);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Barrel
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(0, -12, 60, 24); 
    
    ctx.restore();

    // Bullets
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    bullets.forEach(b => {
        if (b.isGolden) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#fbbf24';
        } else {
            ctx.shadowBlur = 0;
        }
        
        ctx.font = 'bold 12px Arial';
        ctx.fillStyle = 'black';
        ctx.fillText(b.value, b.position.x, b.position.y);
        
        ctx.shadowBlur = 0; 
    });

    // Flags
    stage2Flags.forEach(f => {
        const pos = f.position;
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#fff';
        ctx.fillText(f.flagData.emoji, pos.x, pos.y);

        ctx.font = 'bold 10px Cairo';
        ctx.fillStyle = '#cbd5e1';
        ctx.fillText(f.flagData.name, pos.x, pos.y + 25);

        const radius = 35;
        const percent = Math.max(f.hp / 100, 0);
        
        // HP Circle
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 4;
        ctx.stroke();

        const hue = percent * 120; 
        const color = `hsl(${hue}, 100%, 50%)`;

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius, -Math.PI/2, (-Math.PI/2) + (Math.PI * 2 * percent));
        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(Math.ceil(f.hp), pos.x, pos.y - 25);
    });
}
