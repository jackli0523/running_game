title = "RUNRUNRUN";

description = `
Green is shield
Red is bad
Blue is good

[Tap] Jump
[Tap in air] Double Jump
`;

characters = [
  `
 llll
l    l
l    l
l    l
l    l
 llll
`,
  `
  l
  l
 lll
 l l
  l
 l
`,
  `
    l
   l
 lllll
l ll 
 l  l
l   l
`,
];


options = {
  viewSize: { x: 200, y: 100 },
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 50,
};

let barrels;
let barrelAddingTicks;
let pos;
let vel;
let mode;
let anim;
let doubleJumpUsed;
let lasers;
let shield, shieldActive, shieldTimer;

function update() {
  if (!ticks) {
    barrels = [];
    barrelAddingTicks = 0;
    pos = vec(9, 86);
    vel = vec();
    mode = "run";
    anim = 0;
    doubleJumpUsed = false;
    lasers = [];
    shield = null;
    shieldActive = false;
    shieldTimer = 50; // æŠ¤ç›¾ç”Ÿæˆé¢‘çŽ‡ x2 (æ¯2ç§’ä¸€ä¸ª)
  }

  color("black");
  rect(0, 90, 200, 9);
  const df = sqrt(difficulty);
  barrelAddingTicks -= df;
  if (barrelAddingTicks < 0) {
    //play("laser");
    barrels.push({
      pos: vec(rnd(mode === "run" ? 10 : 100, 200), -5),
      clr: rnd(0, 1) < 0.5 ? 'red' : 'blue',
      vy: 0,
      speed: rnd(0.1, df),
      mode: "fall",
      angle: rnd(60, 180),
    });
    barrelAddingTicks += rndi(40, 100); // éšœç¢ç‰©å‡ºçŽ°é¢‘çŽ‡ x2
  }

  updateShield();
  updateLasers();
  updatePlayer();
  updateBarrels();
  checkCollisions();
}

function updateShield() {
  if (shieldActive) {
    color("light_green");
    arc(pos, 4, 2);
    return;
  }

  if (shieldTimer > 0) {
    shieldTimer--;
    return;
  }
  if (shield === null) {
    shield = { pos: vec(100, 0) };
    shieldTimer = 50;
  }
  if (shield) {
    color("green");
    arc(shield.pos, 3, 2);
    
    shield.pos.x -= 2;
    shield.pos.y += 2;
    if (pos.distanceTo(shield.pos) < 5) {
      shieldActive = true;
      shield = null;
      play("coin");
    }

    if (shield.pos.y > 100) {
      shield = null;
    }
  }
}

function updateLasers() {
  if (ticks % 60 === 0) { // æ¿€å…‰å‡ºçŽ°é¢‘çŽ‡ x2
    const laserY = rnd(50, 90); // ç¡®ä¿æ¿€å…‰ä¸ä¼šç©¿è¿‡åœ°æ¿
    lasers.push({ pos: vec(203, laserY), vel: vec(-2, 0), active: true, clr: rnd(0, 1) < 0.5 ? 'red' : 'blue' });
  }
  color("black");
  lasers.forEach((laser, i) => {
    laser.pos.add(laser.vel);
    color(laser.clr);
    rect(laser.pos, 15, 2); // æ”¹ä¸ºéšœç¢ç‰©å½¢å¼
    if (laser.pos.x < 0) {
      lasers.splice(i, 1);
    }
  });
}

function updatePlayer() {
  const df = sqrt(difficulty);
  vel.x = df * 2;
  addScore(vel.x - df);

  if (mode === "run") {
    if (input.isJustPressed) {
      play("jump");
      mode = "jump";
      vel.y = -3.6;
      doubleJumpUsed = false;
    }
  } else {
    if (input.isJustPressed && !doubleJumpUsed) {
      play("jump");
      vel.y = -3.6;
      doubleJumpUsed = true;
    }
    pos.y += vel.y;
    vel.y += 0.2;
    if (pos.y > 85) {
      pos.y = 86;
      mode = "run";
    }
  }

  anim += df * 0.2 * (mode === "run" ? 1 : 0.5);
  color("black")
  char(addWithCharCode("b", floor(anim % 2)), pos);
}

function updateBarrels() {
  const df = sqrt(difficulty);
  barrels = barrels.filter((b) => {
    if (b.mode === "fall") {
      b.vy += b.speed * 0.1;
      b.vy *= 1;
      b.pos.y += b.vy * sqrt(df);
      if (b.pos.y > 85) {
        play("select");
        b.pos.y = 86;
        b.mode = "roll";
      }
    } else {
      b.pos.x -= b.speed * df;
      b.angle += b.speed * df * 0.2;
    }
    b.pos.x -= vel.x;
    color(b.clr);
    arc(b.pos, 3, 2)
    return b.pos.x > -5;
  });
}

function checkCollisions() {
  barrels.forEach((barrel) => {
    if (barrel.clr === "red" &&  pos.distanceTo(barrel.pos) < 4) {
      if (shieldActive) {
        shieldActive = false;
        barrels.splice(barrels.indexOf(barrel), 1);
      } else {
        play("explosion");
        end();
      }
    }
  });

  lasers.forEach((laser) => {
    if (laser.clr === "red" && laser.active && pos.distanceTo(laser.pos) < 6) {
      if (shieldActive) {
        shieldActive = false;
        laser.active = false;
      } else {
        play("explosion");
        end();
      }
    }
  });
}
