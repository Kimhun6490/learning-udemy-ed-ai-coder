/* global THREE */
(function initArenaFps() {
  "use strict";

  if (typeof THREE === "undefined") {
    console.error("Three.js did not load. Check network or use a local copy of three.min.js.");
    return;
  }

const ARENA_HALF = 20;
const WALL_THICK = 1.2;
const INNER = ARENA_HALF - WALL_THICK - 0.5;
const PLAYER_RADIUS = 0.45;
const ENEMY_RADIUS = 0.55;
const PLAYER_HEIGHT = 1.65;
const EYE_HEIGHT = 1.55;
const MOVE_SPEED = 9;
const ROT_SPEED = 2.2;
const BULLET_SPEED = 48;
const BULLET_RADIUS = 0.32;
/** Spawn in front of the camera so the sphere is not clipped by the near plane. */
const MUZZLE_OFFSET = 1.25;
const DAMAGE = 12;
const FIRE_COOLDOWN = 0.35;
const ENEMY_MOVE_SPEED = 4.2;
const ENEMY_ROT_SPEED = 1.8;

/** Active keys by KeyboardEvent.code (capture phase so the page keeps input). */
const keys = new Set();
/** Set by left-click; consumed when a shot fires (backup if Space is swallowed). */
let shootRequested = false;
let playerHp = 100;
let enemyHp = 100;
let gameOver = false;
let playerFireCd = 0;
let enemyFireCd = 0;

const canvas = document.getElementById("c");
const playerHpEl = document.getElementById("player-hp");
const enemyHpEl = document.getElementById("enemy-hp");
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlay-title");
const overlayMsg = document.getElementById("overlay-msg");
const restartBtn = document.getElementById("restart");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0c0e18);
scene.fog = new THREE.Fog(0x0c0e18, 18, 55);

const camera = new THREE.PerspectiveCamera(
  72,
  window.innerWidth / window.innerHeight,
  0.1,
  120
);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const hemi = new THREE.HemisphereLight(0x8899cc, 0x1a1020, 0.55);
scene.add(hemi);
const dir = new THREE.DirectionalLight(0xfff4e8, 0.95);
dir.position.set(12, 28, 10);
dir.castShadow = true;
dir.shadow.mapSize.set(2048, 2048);
dir.shadow.camera.near = 2;
dir.shadow.camera.far = 70;
dir.shadow.camera.left = -30;
dir.shadow.camera.right = 30;
dir.shadow.camera.top = 30;
dir.shadow.camera.bottom = -30;
scene.add(dir);

function makeArena() {
  const g = new THREE.Group();
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x1e2438,
    roughness: 0.85,
    metalness: 0.08,
  });
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x2a3148,
    roughness: 0.7,
    metalness: 0.12,
  });
  const stripeMat = new THREE.MeshStandardMaterial({
    color: 0x3d4a6e,
    roughness: 0.65,
    metalness: 0.15,
  });

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(ARENA_HALF * 2, ARENA_HALF * 2),
    floorMat
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  g.add(floor);

  const wallH = 6;
  const w = ARENA_HALF * 2 + WALL_THICK * 2;
  const faces = [
    { pos: [0, wallH / 2, -ARENA_HALF - WALL_THICK / 2], size: [w, wallH, WALL_THICK] },
    { pos: [0, wallH / 2, ARENA_HALF + WALL_THICK / 2], size: [w, wallH, WALL_THICK] },
    { pos: [-ARENA_HALF - WALL_THICK / 2, wallH / 2, 0], size: [WALL_THICK, wallH, w] },
    { pos: [ARENA_HALF + WALL_THICK / 2, wallH / 2, 0], size: [WALL_THICK, wallH, w] },
  ];
  for (const f of faces) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(...f.size), wallMat);
    m.position.set(...f.pos);
    m.castShadow = true;
    m.receiveShadow = true;
    g.add(m);
  }

  for (let i = -4; i <= 4; i++) {
    const b = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.08, ARENA_HALF * 1.6),
      stripeMat
    );
    b.position.set(i * 4, 0.04, 0);
    b.receiveShadow = true;
    g.add(b);
  }

  scene.add(g);
  return g;
}

makeArena();

const wallMeshes = [];
const colliderGroup = new THREE.Group();
scene.add(colliderGroup);

function addWallCollider(box) {
  const geo = new THREE.BoxGeometry(box.w, box.h, box.d);
  const mesh = new THREE.Mesh(
    geo,
    new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
    })
  );
  mesh.position.set(box.x, box.y, box.z);
  colliderGroup.add(mesh);
  wallMeshes.push(mesh);
}

for (const f of [
  { x: 0, y: 3, z: -ARENA_HALF - WALL_THICK / 2, w: ARENA_HALF * 2, h: 6, d: WALL_THICK },
  { x: 0, y: 3, z: ARENA_HALF + WALL_THICK / 2, w: ARENA_HALF * 2, h: 6, d: WALL_THICK },
  { x: -ARENA_HALF - WALL_THICK / 2, y: 3, z: 0, w: WALL_THICK, h: 6, d: ARENA_HALF * 2 },
  { x: ARENA_HALF + WALL_THICK / 2, y: 3, z: 0, w: WALL_THICK, h: 6, d: ARENA_HALF * 2 },
]) {
  addWallCollider(f);
}

const player = new THREE.Group();
player.position.set(0, 0, INNER - 2);
player.add(camera);
camera.position.y = EYE_HEIGHT;
scene.add(player);

const enemy = new THREE.Group();
enemy.position.set(0, 0, -INNER + 2);

function buildEnemyModel(root) {
  const armorDark = new THREE.MeshStandardMaterial({
    color: 0x12161e,
    roughness: 0.42,
    metalness: 0.65,
  });
  const armorCrimson = new THREE.MeshStandardMaterial({
    color: 0x7a1520,
    roughness: 0.48,
    metalness: 0.35,
  });
  const jointMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a22,
    roughness: 0.55,
    metalness: 0.25,
  });
  const visorMat = new THREE.MeshStandardMaterial({
    color: 0x050508,
    roughness: 0.18,
    metalness: 0.75,
  });
  const eyeGlow = new THREE.MeshStandardMaterial({
    color: 0xff2a1a,
    emissive: 0xff2200,
    emissiveIntensity: 1.8,
    roughness: 0.35,
    metalness: 0.2,
  });
  const gunMetal = new THREE.MeshStandardMaterial({
    color: 0x2a3038,
    roughness: 0.35,
    metalness: 0.8,
  });

  function add(mesh, x, y, z, rx, ry, rz, sx, sy, sz) {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.set(x, y, z);
    if (rx || ry || rz) mesh.rotation.set(rx || 0, ry || 0, rz || 0);
    if (sx !== undefined) mesh.scale.set(sx, sy, sz);
    root.add(mesh);
    return mesh;
  }

  add(
    new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.45, 0.35, 10), jointMat),
    0,
    0.2,
    0
  );

  add(
    new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.95, 0.58), armorCrimson),
    0,
    0.85,
    0
  );

  add(
    new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.55, 0.2), armorDark),
    0,
    0.92,
    0.38
  );

  add(
    new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.22, 0.12), armorDark),
    0,
    0.45,
    0.34,
    0.35,
    0,
    0
  );

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.48, 0.52), armorDark);
  add(head, 0, 1.52, 0);

  add(
    new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.12, 0.44), armorCrimson),
    0,
    1.78,
    0
  );

  add(
    new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.14, 0.2), visorMat),
    0,
    1.48,
    0.32
  );

  add(new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), eyeGlow), -0.12, 1.5, 0.34);
  add(new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), eyeGlow), 0.12, 1.5, 0.34);

  add(
    new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.35, 6), armorCrimson),
    0,
    1.98,
    0.12,
    0,
    0,
    0,
    1,
    1,
    1
  );

  const shoulderGeo = new THREE.DodecahedronGeometry(0.22, 0);
  add(new THREE.Mesh(shoulderGeo, armorDark), -0.62, 1.18, 0, 0, 0, 0, 1.2, 0.95, 0.8);
  add(new THREE.Mesh(shoulderGeo.clone(), armorDark), 0.62, 1.18, 0, 0, 0, 0, 1.2, 0.95, 0.8);

  add(
    new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.45, 8), jointMat),
    -0.72,
    0.72,
    0,
    0,
    0,
    Math.PI / 2.2
  );
  add(
    new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.45, 8), jointMat),
    0.72,
    0.72,
    0,
    0,
    0,
    -Math.PI / 2.2
  );

  const gun = new THREE.Group();
  gun.position.set(0.55, 1.05, 0.15);
  gun.rotation.set(0.05, 0.15, 0);
  root.add(gun);

  const stock = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.2, 0.42), gunMetal);
  stock.castShadow = true;
  stock.position.set(0, 0, -0.18);
  gun.add(stock);

  const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.18, 0.28), gunMetal);
  receiver.castShadow = true;
  receiver.position.set(0, 0.02, 0.12);
  gun.add(receiver);

  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.55, 8), gunMetal);
  barrel.castShadow = true;
  barrel.rotation.x = Math.PI / 2;
  barrel.position.set(0, 0.04, 0.52);
  gun.add(barrel);

  const muzzleMat = eyeGlow.clone();
  muzzleMat.emissiveIntensity = 2.4;
  const muzzle = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.05, 0.08, 8), muzzleMat);
  muzzle.castShadow = true;
  muzzle.rotation.x = Math.PI / 2;
  muzzle.position.set(0, 0.04, 0.82);
  gun.add(muzzle);

  const pack = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.5, 0.28), armorDark);
  add(pack, 0, 1.0, -0.38);

  add(
    new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.18, 6), eyeGlow),
    -0.14,
    1.12,
    -0.52,
    Math.PI / 2,
    0,
    0
  );
  add(
    new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.18, 6), eyeGlow),
    0.14,
    1.12,
    -0.52,
    Math.PI / 2,
    0,
    0
  );
}

buildEnemyModel(enemy);

scene.add(enemy);

const bullets = [];
const bulletGeo = new THREE.SphereGeometry(BULLET_RADIUS, 12, 12);
/** Basic + no fog so shots stay visible in the arena mist. */
const playerBulletMat = new THREE.MeshBasicMaterial({
  color: 0x7af0ff,
  fog: false,
});
const enemyBulletMat = new THREE.MeshBasicMaterial({
  color: 0xffaa66,
  fog: false,
});

const raycaster = new THREE.Raycaster();

function clampToArena(x, z, radius) {
  const lim = INNER - radius;
  return {
    x: THREE.MathUtils.clamp(x, -lim, lim),
    z: THREE.MathUtils.clamp(z, -lim, lim),
  };
}

function tryMove(group, dx, dz, radius) {
  const nx = group.position.x + dx;
  const nz = group.position.z + dz;
  const cx = clampToArena(nx, group.position.z, radius);
  if (Math.abs(cx.x - nx) < 1e-6) group.position.x = nx;
  else group.position.x = cx.x;
  const cz = clampToArena(group.position.x, nz, radius);
  if (Math.abs(cz.z - nz) < 1e-6) group.position.z = nz;
  else group.position.z = cz.z;
}

function spawnBullet(origin, dir, owner) {
  const mesh = new THREE.Mesh(
    bulletGeo,
    owner === "player" ? playerBulletMat : enemyBulletMat
  );
  mesh.position.copy(origin);
  mesh.castShadow = true;
  scene.add(mesh);
  const vel = dir.clone().normalize().multiplyScalar(BULLET_SPEED);
  bullets.push({ mesh, vel, owner, life: 2.2 });
}

function lineOfSight(from, to) {
  const dir = new THREE.Vector3().subVectors(to, from);
  const dist = dir.length();
  if (dist < 0.01) return true;
  dir.normalize();
  raycaster.set(from, dir);
  const hits = raycaster.intersectObjects(wallMeshes, false);
  if (hits.length === 0) return true;
  return hits[0].distance > dist - 0.15;
}

function horizontalForward(yaw) {
  return new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
}

function updateHud() {
  playerHpEl.textContent = String(Math.max(0, Math.round(playerHp)));
  enemyHpEl.textContent = String(Math.max(0, Math.round(enemyHp)));
}

function showEnd(won) {
  gameOver = true;
  overlay.classList.remove("hidden");
  overlayTitle.textContent = won ? "You win" : "You lose";
  overlayMsg.textContent = won
    ? "You cleared the arena."
    : "The bot got the better shots. Try again.";
}

function resetGame() {
  playerHp = 100;
  enemyHp = 100;
  gameOver = false;
  shootRequested = false;
  playerFireCd = 0;
  enemyFireCd = 0;
  player.position.set(0, 0, INNER - 2);
  player.rotation.y = Math.PI;
  enemy.position.set(0, 0, -INNER + 2);
  enemy.rotation.y = 0;
  for (const b of bullets) scene.remove(b.mesh);
  bullets.length = 0;
  overlay.classList.add("hidden");
  updateHud();
  try {
    canvas.focus({ preventScroll: true });
  } catch {
    canvas.focus();
  }
}

function shouldBlockBrowserAction(code) {
  return (
    code === "ArrowUp" ||
    code === "ArrowDown" ||
    code === "ArrowLeft" ||
    code === "ArrowRight" ||
    code === "Space" ||
    code === "KeyW" ||
    code === "KeyA" ||
    code === "KeyS" ||
    code === "KeyD"
  );
}

function onKeyDown(e) {
  if (shouldBlockBrowserAction(e.code)) e.preventDefault();
  keys.add(e.code);
  if (e.code === "Space" || e.key === " ") keys.add("Space");
}

function onKeyUp(e) {
  if (shouldBlockBrowserAction(e.code)) e.preventDefault();
  keys.delete(e.code);
  if (e.code === "Space" || e.key === " ") keys.delete("Space");
}

window.addEventListener("keydown", onKeyDown, { capture: true });
window.addEventListener("keyup", onKeyUp, { capture: true });
window.addEventListener("blur", function () {
  keys.clear();
  shootRequested = false;
});

restartBtn.addEventListener("click", resetGame);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const clock = new THREE.Clock();
const tmpV = new THREE.Vector3();
const tmpFrom = new THREE.Vector3();
const tmpTo = new THREE.Vector3();

function tick() {
  const dt = Math.min(clock.getDelta(), 0.05);

  if (!gameOver) {
    let yaw = player.rotation.y;
    if (keys.has("ArrowLeft") || keys.has("KeyA")) yaw += ROT_SPEED * dt;
    if (keys.has("ArrowRight") || keys.has("KeyD")) yaw -= ROT_SPEED * dt;
    player.rotation.y = yaw;

    const fwd = horizontalForward(yaw);
    let moveX = 0;
    let moveZ = 0;
    if (keys.has("ArrowUp") || keys.has("KeyW")) {
      moveX += fwd.x * MOVE_SPEED * dt;
      moveZ += fwd.z * MOVE_SPEED * dt;
    }
    if (keys.has("ArrowDown") || keys.has("KeyS")) {
      moveX -= fwd.x * MOVE_SPEED * dt;
      moveZ -= fwd.z * MOVE_SPEED * dt;
    }
    tryMove(player, moveX, moveZ, PLAYER_RADIUS);

    playerFireCd -= dt;
    const wantsFire = keys.has("Space") || shootRequested;
    if (wantsFire && playerFireCd <= 0) {
      shootRequested = false;
      playerFireCd = FIRE_COOLDOWN;
      tmpV.copy(fwd);
      tmpFrom.copy(player.position);
      tmpFrom.y = EYE_HEIGHT;
      tmpFrom.addScaledVector(fwd, MUZZLE_OFFSET);
      spawnBullet(tmpFrom, tmpV, "player");
    }

    const ex = enemy.position.x;
    const ez = enemy.position.z;
    const px = player.position.x;
    const pz = player.position.z;
    const toP = new THREE.Vector2(px - ex, pz - ez);
    const dist = toP.length();
    if (dist > 0.05) {
      const targetYaw = Math.atan2(toP.x, toP.y);
      let dy = targetYaw - enemy.rotation.y;
      while (dy > Math.PI) dy -= Math.PI * 2;
      while (dy < -Math.PI) dy += Math.PI * 2;
      const turn = THREE.MathUtils.clamp(dy, -ENEMY_ROT_SPEED * dt, ENEMY_ROT_SPEED * dt);
      enemy.rotation.y += turn;
    }

    tmpFrom.set(ex, ENEMY_RADIUS + 1.0, ez);
    tmpTo.set(px, EYE_HEIGHT, pz);
    const canSee = lineOfSight(tmpFrom, tmpTo);

    enemyFireCd -= dt;
    if (canSee && enemyFireCd <= 0 && dist > 1.2) {
      enemyFireCd = FIRE_COOLDOWN * 1.15;
      const shotDir = new THREE.Vector3().subVectors(tmpTo, tmpFrom);
      const origin = tmpFrom
        .clone()
        .add(shotDir.clone().normalize().multiplyScalar(MUZZLE_OFFSET * 0.85));
      spawnBullet(origin, shotDir, "enemy");
    } else if (!canSee && dist > 2.5) {
      const ef = horizontalForward(enemy.rotation.y);
      tryMove(enemy, ef.x * ENEMY_MOVE_SPEED * dt, ef.z * ENEMY_MOVE_SPEED * dt, ENEMY_RADIUS);
    } else if (!canSee) {
      const ef = horizontalForward(enemy.rotation.y);
      tryMove(enemy, ef.x * ENEMY_MOVE_SPEED * 0.35 * dt, ef.z * ENEMY_MOVE_SPEED * 0.35 * dt, ENEMY_RADIUS);
    } else if (canSee && dist > 6) {
      const ef = horizontalForward(enemy.rotation.y);
      tryMove(enemy, ef.x * ENEMY_MOVE_SPEED * 0.5 * dt, ef.z * ENEMY_MOVE_SPEED * 0.5 * dt, ENEMY_RADIUS);
    }
  }

  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    b.life -= dt;
    b.mesh.position.addScaledVector(b.vel, dt);

    const p = b.mesh.position;
    const lim = INNER + 1;
    if (Math.abs(p.x) > lim || Math.abs(p.z) > lim || p.y > 8 || p.y < -1 || b.life <= 0) {
      scene.remove(b.mesh);
      bullets.splice(i, 1);
      continue;
    }

    if (!gameOver) {
      if (b.owner === "player") {
        tmpV.set(enemy.position.x, ENEMY_RADIUS + 0.9, enemy.position.z);
        if (p.distanceTo(tmpV) < ENEMY_RADIUS + BULLET_RADIUS + 0.15) {
          enemyHp -= DAMAGE;
          scene.remove(b.mesh);
          bullets.splice(i, 1);
          updateHud();
          if (enemyHp <= 0) showEnd(true);
          continue;
        }
      } else {
        tmpV.copy(player.position);
        tmpV.y = EYE_HEIGHT;
        if (p.distanceTo(tmpV) < PLAYER_RADIUS + BULLET_RADIUS + 0.2) {
          playerHp -= DAMAGE;
          scene.remove(b.mesh);
          bullets.splice(i, 1);
          updateHud();
          if (playerHp <= 0) showEnd(false);
          continue;
        }
      }
    }
  }

  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}

updateHud();
tick();

  function focusGame() {
    try {
      canvas.focus({ preventScroll: true });
    } catch {
      canvas.focus();
    }
  }

  canvas.addEventListener("pointerdown", function (e) {
    focusGame();
    if (!gameOver && e.button === 0) {
      shootRequested = true;
    }
  });
  window.addEventListener("load", focusGame);
})();

