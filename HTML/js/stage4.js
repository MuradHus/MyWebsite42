function startStage4() {
    stage = 4;
    Composite.clear(engine.world);
    Engine.clear(engine);
    document.getElementById('qualifiers-container').innerHTML = '';

    const titles = {
        'ar': { main: "المرحلة 4: هدايا مجهولة", sub: "صناديق من مجهول.. انت وحظك!" },
        'en': { main: "Stage 4: Mystery Gifts", sub: "Boxes from unknown.. it's your luck!" }
    };
    document.getElementById('main-title').innerText = titles[currentLang].main;
    document.getElementById('sub-title').innerText = titles[currentLang].sub;
    document.getElementById('main-title').className = "text-xl sm:text-2xl font-black text-blue-500 tracking-wider animate-bounce";

    stage4State = 'waiting'; 
    s4WaitingStartTime = Date.now();
    s4Boxes = [];
    s4FinalCountdown = 6;
    
    const minDim = Math.min(width, height);
    s4Scale = Math.max(0.6, Math.min(1.3, minDim / 600)); 

    const columns = 2;
    const rows = Math.ceil(qualifiedFlags.length / columns);
    const centerX = width / 2;
    
    // تكبير الصناديق
    const flagRadius = 30 * s4Scale;
    const boxSize = 90 * s4Scale; 
    
    const colOffset = boxSize * 1.6; 
    const rowGap = boxSize * 1.5;    
    
    const totalGridHeight = (rows - 1) * rowGap;
    const topMargin = Math.max(height * 0.2, 120 * s4Scale); 
    const startY = (height / 2) - (totalGridHeight / 2) + (topMargin * 0.2); 

    // توزيع الجوائز
    let uniquePrizes = [
        { type: 'bomb', emoji: '💣', title: 'متفجرات' },
        { type: 'oil', emoji: '🛢️', title: 'براميل نفط', value: 15 },
        { type: 'money', emoji: '💰', title: 'أموال', value: () => Math.floor(Math.random() * 11) + 5 },
        { type: 'gold', emoji: '🥇', title: 'ذهب', value: 10 },
        { type: 'wood', emoji: '🪵', title: 'خشب', value: 5 },
        { type: 'chips', emoji: '💾', title: 'شرائح إلكترونية', value: 'shield' },
        { type: 'insects', emoji: '🦗', title: 'حشرات', value: -10 },
        { type: 'missing', emoji: '💨', title: 'مفقودة', value: -5 }
    ];
    
    uniquePrizes.sort(() => Math.random() - 0.5);

    qualifiedFlags.forEach((flag, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        
        const x = centerX + (col === 0 ? -colOffset : colOffset);
        const y = startY + row * rowGap;

        const flagBody = Bodies.circle(x, y, flagRadius, {
            isStatic: true,
            label: 'stage4Flag',
            render: { fillStyle: 'transparent' }
        });
        flagBody.flagData = flag;
        if (!flag.points) flag.points = 0;
        if (!flag.shields) flag.shields = 0;
        flagBody.size = flagRadius; 

        // الصندوق
        const spacing = flagRadius + (boxSize/2) + (10 * s4Scale);
        const boxX = x + (col === 0 ? -spacing : spacing);
        
        const startY_Box = -200 - (i * (100 * s4Scale)); 

        const boxBody = Bodies.rectangle(boxX, startY_Box, boxSize, boxSize, {
            isStatic: true,
            label: 'stage4Box'
        });
        
        boxBody.targetY = y;
        boxBody.prize = uniquePrizes[i] || { type: 'wood', emoji: '🪵', title: 'خشب', value: 5 };
        boxBody.assignedFlag = flag;
        boxBody.assignedFlagBody = flagBody;
        boxBody.isOpen = false;
        boxBody.isExploding = false;
        boxBody.isArrived = false;
        boxBody.size = boxSize;
        
        s4Boxes.push(boxBody);
        Composite.add(engine.world, [flagBody, boxBody]);
    });

    s4RecallTimer = Date.now();
}

function updateStage4Logic() {
    const now = Date.now();
    
    if (stage4State === 'waiting') {
        if (now - s4WaitingStartTime > 5000) {
            stage4State = 'falling';
        }
        return;
    }

    if (stage4State === 'falling') {
        let allArrived = true;
        s4Boxes.forEach(b => {
            if (!b.isArrived) {
                const nextY = b.position.y + 7;
                if (nextY >= b.targetY) {
                    Body.setPosition(b, { x: b.position.x, y: b.targetY });
                    b.isArrived = true;
                } else {
                    Body.setPosition(b, { x: b.position.x, y: nextY });
                    allArrived = false;
                }
            }
        });
        if (allArrived) {
            stage4State = 'opening';
            s4RevealTimer = now;
        }
        return;
    }

    const unopened = s4Boxes.filter(b => !b.isOpen);

    if (stage4State === 'opening') {
        if (unopened.length > 2) {
            if (now - s4RevealTimer > 2000) { 
                let candidates = unopened.filter(b => b.prize.type !== 'bomb');
                if (candidates.length > 0) {
                    const target = candidates[Math.floor(Math.random() * candidates.length)];
                    openBox(target);
                }
                s4RevealTimer = now;
            }
        } else if (unopened.length === 2) {
            stage4State = 'countdown';
            s4CountdownTimer = now;
            s4FinalCountdown = 6;
        }
    } else if (stage4State === 'countdown') {
        if (now - s4CountdownTimer > 1000) {
            s4FinalCountdown--;
            s4CountdownTimer = now;
            if (s4FinalCountdown <= 0) {
                stage4State = 'explosion';
                revealFinalTwo();
            }
        }
    }
}

function openBox(box) {
    if (box.isOpen) return;
    box.isOpen = true;
    const prize = box.prize;
    const flag = box.assignedFlag;

    if (prize.type === 'oil') flag.points += 15;
    else if (prize.type === 'money') {
        const val = (typeof prize.value === 'function' ? prize.value() : prize.value);
        flag.points += val;
        prize.displayVal = val;
    }
    else if (prize.type === 'gold') flag.points += 10;
    else if (prize.type === 'wood') flag.points += 5;
    else if (prize.type === 'chips') {
        flag.points += 3;
        flag.hasShield = true;
    }
    else if (prize.type === 'insects') flag.points -= 10;
    else if (prize.type === 'missing') flag.points -= 5;
}

function revealFinalTwo() {
    const unopened = s4Boxes.filter(b => !b.isOpen);
    const safe = unopened.find(b => b.prize.type !== 'bomb');
    const bomb = unopened.find(b => b.prize.type === 'bomb');

    if (safe) {
        openBox(safe);
    }
    
    setTimeout(() => {
        if (bomb) {
            bomb.assignedFlagBody.isVibrating = true;
            
            setTimeout(() => {
                bomb.isOpen = true;
                bomb.isExploding = true;
                
                setTimeout(() => {
                    const loser = bomb.assignedFlag;
                    const index = qualifiedFlags.findIndex(f => f.name === loser.name);
                    if (index > -1) qualifiedFlags.splice(index, 1);
                    
                    endStage4(loser);
                }, 2000);
            }, 2000); 
        }
    }, 2000);
}

function endStage4(loser) {
    stage = 4.5;
    showStageResults(loser, qualifiedFlags, startStage5);
}

function drawStage4(ctx) {
    if (stage4State === 'waiting') {
        ctx.save();
        const msgHeight = 60 * s4Scale;
        const msgY = height * 0.15; 
        
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, msgY - msgHeight/2, width, msgHeight);
        
        ctx.fillStyle = "#fbbf24";
        ctx.font = `bold ${24 * s4Scale}px Cairo`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(currentLang === 'ar' ? "انتظار تسليم الموارد..." : "Waiting for resources...", width/2, msgY);
        ctx.restore();
    }

    const roundRect = (ctx, x, y, width, height, radius) => {
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
    };

    const bodies = Composite.allBodies(engine.world);
    bodies.forEach(body => {
        if (body.label === 'stage4Flag') {
            ctx.save();
            let dx = 0, dy = 0;
            if (body.isVibrating) {
                dx = (Math.random() - 0.5) * (8 * s4Scale);
                dy = (Math.random() - 0.5) * (8 * s4Scale);
            }
            ctx.translate(body.position.x + dx, body.position.y + dy);

            const radius = body.size || 28;
            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 3 * s4Scale;
            ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
            ctx.beginPath();
            ctx.arc(0, 0, radius + 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.font = `${24 * s4Scale}px Arial`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(body.flagData.emoji, 0, 0);
            
            ctx.font = `bold ${10 * s4Scale}px Cairo`;
            ctx.fillStyle = '#fff';
            ctx.fillText(body.flagData.name, 0, radius + 15);
            ctx.restore();
        }
    });

    s4Boxes.forEach(box => {
        if (stage4State === 'waiting') return; 

        const pos = box.position;
        const size = box.size || 75;
        
        ctx.save();
        ctx.translate(pos.x, pos.y);

        if (box.isOpen) {
            if (box.isExploding) {
                const scale = 1 + Math.sin(Date.now() * 0.02) * 0.2;
                ctx.scale(scale, scale);
                ctx.font = `${60 * s4Scale}px Arial`;
                ctx.shadowColor = "red";
                ctx.shadowBlur = 20;
                ctx.fillText("💥", 0, 0);
            } else {
                ctx.font = `${35 * s4Scale}px Arial`;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(box.prize.emoji, 0, 0);
                
                ctx.font = `bold ${12 * s4Scale}px Cairo`;
                ctx.fillStyle = "#fbbf24";
                ctx.fillText(box.prize.title, 0, -size/2 - (10 * s4Scale));
                
                if (box.prize.value !== 'shield') {
                    const val = box.prize.displayVal || box.prize.value;
                    ctx.font = `bold ${14 * s4Scale}px Arial`;
                    ctx.fillStyle = val >= 0 ? "#4ade80" : "#ef4444";
                    ctx.fillText(val >= 0 ? `+${val}` : val, 0, size/2 + (12 * s4Scale));
                }
            }
        } else {
            ctx.strokeStyle = '#92400e'; 
            ctx.lineWidth = 3 * s4Scale;
            ctx.fillStyle = '#d97706'; 
            
            roundRect(ctx, -size/2, -size/2, size, size, 12 * s4Scale);
            ctx.fill();
            ctx.stroke();

            ctx.strokeStyle = 'rgba(0,0,0,0.1)';
            ctx.lineWidth = 2 * s4Scale;
            ctx.beginPath();
            ctx.moveTo(-size/2, 0);
            ctx.lineTo(size/2, 0);
            ctx.stroke();
            
            if (stage4State === 'countdown') {
                const unopenedCount = s4Boxes.filter(b => !b.isOpen).length;
                if (unopenedCount === 2) {
                        ctx.fillStyle = "#fff";
                        ctx.font = `bold ${30 * s4Scale}px Arial`;
                        ctx.textAlign = "center";
                        ctx.textBaseline = "middle";
                        ctx.shadowColor = "#000";
                        ctx.shadowBlur = 10;
                        ctx.fillText(s4FinalCountdown, 0, 0);
                        ctx.shadowBlur = 0;
                }
            }
        }
        ctx.restore();
    });
}
