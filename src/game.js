(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const hud = document.getElementById('hud');

  const TILE = 24;
  const GRAVITY = 1200;
  const DT = 1 / 60;
  const LOCK_LIMIT = 2;
  const SCORE_KEY = 'shadow_step_theater_scores_v1';

  const keys = new Set();
  addEventListener('keydown', e => {
    keys.add(e.code);
    if (e.code === 'KeyR') resetStage();
  });
  addEventListener('keyup', e => keys.delete(e.code));


  const touchButtons = Array.from(document.querySelectorAll('[data-key]'));
  function setMobileKey(code, pressed) {
    if (pressed) keys.add(code);
    else keys.delete(code);
  }
  touchButtons.forEach(btn => {
    const code = btn.dataset.key;
    const press = e => { e.preventDefault(); setMobileKey(code, true); };
    const release = e => { e.preventDefault(); setMobileKey(code, false); };
    btn.addEventListener('pointerdown', press);
    btn.addEventListener('pointerup', release);
    btn.addEventListener('pointercancel', release);
    btn.addEventListener('pointerleave', release);
  });


  const stages = [
    {
      name: 'Stage 1: はじめての照明',
      solids: [[0,20,40,2],[8,16,4,1],[18,14,4,1],[28,12,5,1],[35,10,4,1]],
      occluders: [{x:13,y:8,w:2,h:8}], switches: [], traps: [], checkpoints:[{x:22,y:13}],
      spawn:{x:2,y:18}, key:{x:30,y:10}, door:{x:37,y:8},
      lights:[{x:8,y:4,angle:0,range:11,locked:false}], hint: '影を作って足場を渡る'
    },
    {
      name: 'Stage 2: 二重の段取り',
      solids: [[0,20,44,2],[6,17,3,1],[12,14,3,1],[20,16,2,1],[26,12,3,1],[34,10,2,1],[39,8,4,1]],
      occluders: [{x:10,y:7,w:2,h:7},{x:24,y:6,w:2,h:6}],
      switches: [{x:17,y:19,w:2,h:1,active:false,t:0,target:'bridge'}],
      bridge:{x:21,y:18,w:4,h:1,enabled:false},
      traps: [{x:23,y:19,w:2,h:1,type:'spike'}],
      checkpoints:[{x:14,y:13},{x:32,y:9}],
      spawn:{x:2,y:18}, key:{x:40,y:7}, door:{x:42,y:7},
      lights:[{x:6,y:4,angle:20,range:9,locked:false},{x:28,y:4,angle:-10,range:10,locked:false}], hint: '先に橋を開通させる'
    },
    {
      name: 'Stage 3: 幕間の試練',
      solids: [[0,20,52,2],[6,17,3,1],[11,14,3,1],[17,12,3,1],[24,15,3,1],[30,12,4,1],[39,9,3,1],[46,8,4,1]],
      occluders: [{x:14,y:6,w:2,h:7},{x:27,y:5,w:2,h:7},{x:36,y:4,w:2,h:6}],
      switches: [{x:22,y:19,w:2,h:1,active:false,t:0,target:'bridge'}],
      bridge:{x:25,y:17,w:4,h:1,enabled:false},
      traps: [{x:33,y:19,w:2,h:1,type:'spike'},{x:41,y:18,w:2,h:1,type:'spike'}],
      checkpoints:[{x:18,y:11},{x:35,y:8}],
      keyShapeSensor:{x:43,y:7,w:3,h:2,threshold:0.82,active:false,score:0,pattern:[[1,1,1],[1,0,1]]},
      spawn:{x:2,y:18}, key:{x:48,y:7}, door:{x:50,y:7},
      lights:[{x:9,y:4,angle:10,range:9,locked:false},{x:23,y:4,angle:0,range:10,locked:false},{x:34,y:4,angle:-10,range:11,locked:false}], hint: '鍵形センサーの輪郭を影で満たす'
    }
  ];

  let stageIndex = 0, stage = buildStage(stages[stageIndex]), hasKey = false, time = 0;
  let deaths = 0;
  let stageClearMessage = '';
  let stageClearUntil = 0;
  let checkpointFlash = 0;
  let checkpoint = {x: stage.spawn.x, y: stage.spawn.y};
  const scores = loadScores();
  const player = {x:stage.spawn.x*TILE,y:stage.spawn.y*TILE,vx:0,vy:0,w:16,h:22,onGround:false};
  window.__shadowDebug = {
    setStage(i) {
      stageIndex = Math.max(0, Math.min(stages.length - 1, i));
      resetStage();
    }
  };

  function loadScores() {
    try { return JSON.parse(localStorage.getItem(SCORE_KEY) || '{}'); } catch { return {}; }
  }
  function saveScore() {
    const stageName = stages[stageIndex].name;
    const current = scores[stageName];
    const result = { time: Number(time.toFixed(1)), deaths };
    if (!current || result.time < current.time || (result.time === current.time && result.deaths < current.deaths)) {
      scores[stageName] = result;
      localStorage.setItem(SCORE_KEY, JSON.stringify(scores));
    }
  }

  function buildStage(raw){ return JSON.parse(JSON.stringify(raw)); }
  function rectsFromSolids(solids){ return solids.map(([x,y,w,h])=>({x:x*TILE,y:y*TILE,w:w*TILE,h:h*TILE})); }
  function intersect(a,b){ return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y; }

  function dieAndRespawn(){ deaths += 1; player.x = checkpoint.x*TILE; player.y = checkpoint.y*TILE; player.vx=0; player.vy=0; }

  function resetStage(){
    stage = buildStage(stages[stageIndex]); hasKey=false; time=0; deaths=0;
    checkpoint = {x: stage.spawn.x, y: stage.spawn.y};
    player.x = checkpoint.x*TILE; player.y = checkpoint.y*TILE; player.vx=0; player.vy=0;
  }

  function nextStage(){
    saveScore();
    stageClearMessage = `${stages[stageIndex].name} clear!`;
    stageClearUntil = performance.now() + 1200;
    stageIndex = (stageIndex + 1) % stages.length;
    resetStage();
  }

  function shadowCells(){
    const cells = [];
    for(const l of stage.lights){
      const rad = l.angle * Math.PI / 180;
      const sx = l.x*TILE, sy=l.y*TILE;
      for(const o of stage.occluders){
        const ox = (o.x+o.w/2)*TILE, oy=(o.y+o.h/2)*TILE;
        const dx = ox-sx, dy=oy-sy;
        const d = Math.hypot(dx,dy);
        if(d > l.range*TILE) continue;
        const th = Math.atan2(dy,dx);
        if(Math.abs(th-rad)>0.9) continue;
        for(let i=0;i<8;i++) cells.push(`${Math.floor((ox + dx*0.2 + i*Math.cos(th)*TILE*0.8)/TILE)},${Math.floor((oy + dy*0.2 + i*Math.sin(th)*TILE*0.8)/TILE)}`);
      }
    }
    return [...new Set(cells)].map(s=>{const [x,y]=s.split(',').map(Number); return {x,y};});
  }

  function computeKeyShapeScore(shadowSet){
    if(!stage.keyShapeSensor) return 0;
    const ks = stage.keyShapeSensor;
    let matched = 0; let target = 0; let falsePositive = 0;
    for(let y=0;y<ks.h;y++){
      for(let x=0;x<ks.w;x++){
        const needed = ks.pattern[y][x] === 1;
        const occupied = shadowSet.has(`${ks.x + x},${ks.y + y}`);
        if(needed) { target += 1; if(occupied) matched += 1; }
        if(!needed && occupied) falsePositive += 1;
      }
    }
    return target === 0 ? 0 : Math.max(0, (matched - falsePositive * 0.25) / target);
  }

  function anyShadowInRect(shadowSet, x, y, w, h) {
    for (let iy = y; iy < y + h; iy++) {
      for (let ix = x; ix < x + w; ix++) {
        if (shadowSet.has(`${ix},${iy}`)) return true;
      }
    }
    return false;
  }

  function update(){
    time += DT;

    const light = stage.lights.find(l=>!l.locked) || stage.lights[0];
    if(keys.has('KeyA')) light.angle -= 90*DT;
    if(keys.has('KeyD')) light.angle += 90*DT;
    if(keys.has('KeyW')) light.range = Math.min(14, light.range + 6*DT);
    if(keys.has('KeyS')) light.range = Math.max(4, light.range - 6*DT);
    if(keys.has('KeyE') && !update.eLatch){
      update.eLatch = true; light.locked = !light.locked;
      const locked = stage.lights.filter(l=>l.locked); if(locked.length > LOCK_LIMIT) locked[0].locked = false;
    }
    if(!keys.has('KeyE')) update.eLatch = false;

    player.vx = ((keys.has('ArrowLeft')?-1:0) + (keys.has('ArrowRight')?1:0)) * 220;
    if(keys.has('Space') && player.onGround){ player.vy=-460; player.onGround=false; }
    player.vy += GRAVITY*DT;

    const solids = rectsFromSolids(stage.solids);
    const sh = shadowCells();
    const shadowSet = new Set(sh.map(c => `${c.x},${c.y}`));
    sh.forEach(c=>solids.push({x:c.x*TILE,y:c.y*TILE,w:TILE,h:TILE,shadow:true}));
    if(stage.bridge?.enabled) solids.push({x:stage.bridge.x*TILE,y:stage.bridge.y*TILE,w:stage.bridge.w*TILE,h:TILE});

    player.x += player.vx*DT;
    let p = {x:player.x,y:player.y,w:player.w,h:player.h};
    for(const s of solids){ if(intersect(p,s)){ if(player.vx>0) player.x = s.x-player.w; if(player.vx<0) player.x=s.x+s.w; player.vx=0; p.x=player.x; }}
    player.y += player.vy*DT; player.onGround=false; p = {x:player.x,y:player.y,w:player.w,h:player.h};
    for(const s of solids){ if(intersect(p,s)){ if(player.vy>0){ player.y=s.y-player.h; player.onGround=true; } if(player.vy<0){ player.y=s.y+s.h; } player.vy=0; p.y=player.y; }}

    if(player.y > canvas.height+200) dieAndRespawn();
    checkpointFlash = Math.max(0, checkpointFlash - DT);

    for(const trap of stage.traps || []){
      const trapRect = {x:trap.x*TILE,y:trap.y*TILE,w:trap.w*TILE,h:trap.h*TILE};
      if(intersect({...player}, trapRect)) dieAndRespawn();
    }

    for(const cp of stage.checkpoints || []){
      const cpRect = {x:cp.x*TILE+2,y:cp.y*TILE+2,w:20,h:20};
      if(intersect({...player}, cpRect)) {
        if (checkpoint.x !== cp.x || checkpoint.y !== cp.y) checkpointFlash = 0.25;
        checkpoint = {x: cp.x, y: cp.y};
      }
    }

    const keyRect = {x:stage.key.x*TILE+4,y:stage.key.y*TILE+4,w:16,h:16};
    if(!hasKey && intersect({...player}, keyRect)) hasKey=true;

    for(const sw of stage.switches){
      const active = anyShadowInRect(shadowSet, sw.x, sw.y, sw.w, sw.h);
      sw.t = active ? sw.t + DT : 0; sw.active = sw.t > 0.15;
      if(sw.target==='bridge') stage.bridge.enabled = sw.active;
    }

    if(stage.keyShapeSensor){
      const score = computeKeyShapeScore(shadowSet);
      stage.keyShapeSensor.score = score;
      stage.keyShapeSensor.active = score >= stage.keyShapeSensor.threshold;
    }

    const doorRect = {x:stage.door.x*TILE,y:stage.door.y*TILE,w:20,h:30};
    const canOpenDoor = hasKey && (!stage.keyShapeSensor || stage.keyShapeSensor.active);
    if(canOpenDoor && intersect({...player}, doorRect)) nextStage();

    render(sh, solids, canOpenDoor);
  }

  function render(sh, solids, canOpenDoor){
    ctx.fillStyle='#141414'; ctx.fillRect(0,0,canvas.width,canvas.height);
    solids.forEach(s=>{ ctx.fillStyle = s.shadow ? 'rgba(120,120,170,0.65)' : '#444'; ctx.fillRect(s.x,s.y,s.w,s.h); });
    stage.occluders.forEach(o=>{ ctx.fillStyle='#666'; ctx.fillRect(o.x*TILE,o.y*TILE,o.w*TILE,o.h*TILE); });
    for(const cp of stage.checkpoints || []){
      const glow = checkpointFlash > 0 ? '#8fffd3' : '#3c8';
      ctx.fillStyle=glow;
      ctx.fillRect(cp.x*TILE+6,cp.y*TILE+6,12,12);
    }

    for(const trap of stage.traps || []){
      const pulse = 120 + Math.floor((Math.sin(time * 8) + 1) * 40);
      ctx.fillStyle = `rgb(${pulse},40,40)`;
      for(let i=0;i<trap.w;i++) ctx.fillRect((trap.x+i)*TILE, trap.y*TILE + 12, TILE-2, 12);
    }

    for(const l of stage.lights){
      const x=l.x*TILE,y=l.y*TILE; ctx.fillStyle=l.locked?'#ffd35a':'#fff8b0'; ctx.beginPath(); ctx.arc(x,y,7,0,Math.PI*2); ctx.fill();
      const rad=l.angle*Math.PI/180; ctx.strokeStyle='rgba(255,245,180,0.65)'; ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+Math.cos(rad)*l.range*TILE,y+Math.sin(rad)*l.range*TILE); ctx.stroke();
    }

    ctx.fillStyle = hasKey ? '#6bd18a' : '#d1c76b'; ctx.fillRect(stage.key.x*TILE+4,stage.key.y*TILE+4,16,16);
    ctx.strokeStyle= canOpenDoor ? '#6bd18a' : '#6b8fd1'; ctx.strokeRect(stage.door.x*TILE,stage.door.y*TILE,20,30);

    stage.switches.forEach(sw=>{ctx.fillStyle=sw.active?'#6bd18a':'#8b4a4a';ctx.fillRect(sw.x*TILE,sw.y*TILE,sw.w*TILE,sw.h*TILE);});
    if(stage.bridge){ctx.fillStyle=stage.bridge.enabled?'#6bd18a':'#333';ctx.fillRect(stage.bridge.x*TILE,stage.bridge.y*TILE,stage.bridge.w*TILE,TILE);}
    if(stage.keyShapeSensor){
      ctx.strokeStyle = stage.keyShapeSensor.active ? '#6bd18a' : '#cc8844';
      ctx.strokeRect(stage.keyShapeSensor.x*TILE,stage.keyShapeSensor.y*TILE,stage.keyShapeSensor.w*TILE,stage.keyShapeSensor.h*TILE);
    }

    ctx.fillStyle='#f5f5f5'; ctx.fillRect(player.x,player.y,player.w,player.h);
    const shape = stage.keyShapeSensor ? ` | Shape: ${Math.round(stage.keyShapeSensor.score*100)}%` : '';
    const best = scores[stages[stageIndex].name];
    const bestText = best ? ` | Best ${best.time}s/${best.deaths}d` : '';
    if (stageClearUntil > performance.now()) {
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(260, 20, 440, 46);
      ctx.fillStyle = '#fff';
      ctx.font = '22px system-ui';
      ctx.fillText(stageClearMessage, 285, 50);
    }
    hud.innerHTML =
      `<strong>${stages[stageIndex].name}</strong><br>` +
      `Time: ${time.toFixed(1)}s | Deaths: ${deaths}${bestText} | Key: ${hasKey?'YES':'NO'} | Locks: ${stage.lights.filter(l=>l.locked).length}/${LOCK_LIMIT}${shape}<br>` +
      `<span class="muted">Hint: ${stage.hint}</span><br>` +
      `<span class="muted">Arrows: move, Space: jump, A/D: angle, W/S: range, E: lock, R: reset</span>` +
      `<br><span class="muted">Mobile: use on-screen buttons for movement/light controls</span>`;
  }

  resetStage();
  setInterval(update, DT*1000);
})();
