function startStage1() {
    engine.gravity.y = 1;

    const walls = [
        Bodies.rectangle(-10, height/2, 20, height*2, { isStatic: true }),
        Bodies.rectangle(width+10, height/2, 20, height*2, { isStatic: true }),
        Bodies.rectangle(width/2, height + 50, width, 100, { isStatic: true, label: 'finishLine', isSensor: true })
    ];
    Composite.add(engine.world, walls);

    const rows = 10; 
    const cols = Math.floor(width / 60);
    breakables = [];
    
    for(let r=1; r<rows; r++) {
        for(let c=1; c<cols; c++) {
            const x = (width / cols) * c + (r%2 === 0 ? 20 : -20);
            const y = (height / rows) * r + 50;
            
            const hp = Math.floor(Math.random() * 6) + 1;
            const radius = 13;
            
            const obstacle = Bodies.circle(x, y, radius, { 
                isStatic: true,
                label: 'breakable',
                render: { fillStyle: getObstacleColor(hp) } 
            });
            
            obstacle.hp = hp;
            obstacle.maxHp = hp;
            breakables.push(obstacle);
            Composite.add(engine.world, obstacle);
        }
    }

    const flags = flagsData[currentLang] || flagsData['ar'];
    const shuffled = [...flags].sort(() => Math.random() - 0.5);
    shuffled.forEach((flag, i) => {
        setTimeout(() => {
            if (stage !== 1) return;
            const x = Math.random() * (width - 40) + 20;
            const ball = Bodies.circle(x, -30, 16, {
                restitution: 0.5,
                friction: 0.001,
                label: 'flagBall',
                render: { fillStyle: '#ffffff' }
            });
            ball.flagData = flag;
            Composite.add(engine.world, ball);
        }, i * 150);
    });
}

function handleStage1Collisions(event) {
    event.pairs.forEach(pair => {
        const { bodyA, bodyB } = pair;

        if (qualifiedFlags.length >= 10) return; 

        let ball = null;
        if (bodyA.label === 'flagBall' && bodyB.label === 'finishLine') ball = bodyA;
        if (bodyB.label === 'flagBall' && bodyA.label === 'finishLine') ball = bodyB;
        if (ball && !qualifiedFlags.includes(ball.flagData)) {
            qualifiedFlags.push(ball.flagData);
            
            const container = document.getElementById('qualifiers-container');
            if(container) {
                const div = document.createElement('div');
                div.className = 'qualifier-item';
                div.innerHTML = `<span class="text-xl">${ball.flagData.emoji}</span> <span>${ball.flagData.name}</span>`;
                container.appendChild(div);
            }

            Composite.remove(engine.world, ball);

            if (qualifiedFlags.length >= 10) {
                stage = 1.5; 
                
                const allBodies = Composite.allBodies(engine.world);
                allBodies.forEach(b => {
                    if (b.label === 'flagBall' && !qualifiedFlags.includes(b.flagData)) {
                        Body.setStatic(b, true); 
                    }
                });
                
                showStageResults(null, qualifiedFlags, startStage2);
            }
        }

        if (ball && (bodyA.label === 'breakable' || bodyB.label === 'breakable')) {
            const obstacle = bodyA.label === 'breakable' ? bodyA : bodyB;
            obstacle.hp--;
            
            if (obstacle.hp <= 0) {
                Composite.remove(engine.world, obstacle);
                const index = breakables.indexOf(obstacle);
                if (index > -1) breakables.splice(index, 1);
            } else {
                obstacle.render.fillStyle = getObstacleColor(obstacle.hp);
            }
        }
    });
}
