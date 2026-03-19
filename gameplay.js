function arrancarJuego() {
  if (gameInstance) {
    gameInstance.input.keyboard.enabled = true;
    gameInstance.scene.start('GameScene');
    return;
  }

  const W = 480, H = 640;
  const WALL = 14;

  const CAPAS = [
    { nombre: 'ATMÓSFERA', desde: 0, hasta: 12000, bg: 0x04041a, platColor: 0x1133cc, glow: 0x3355ff, enemyColor: 0xff3333, enemySize: 22, move: 'horizontal', speed: 70 },
    { nombre: 'ESTRATÓSFERA', desde: 12000, hasta: 50000, bg: 0x0d0420, platColor: 0x6611bb, glow: 0xaa33ff, enemyColor: 0xff9933, enemySize: 24, move: 'vertical', speed: 75 },
    { nombre: 'MESÓSFERA', desde: 50000, hasta: 85000, bg: 0x041408, platColor: 0x117733, glow: 0x22ff66, enemyColor: 0xffff33, enemySize: 26, move: 'sine', speed: 85 },
    { nombre: 'TERMÓSFERA', desde: 85000, hasta: 150000, bg: 0x180404, platColor: 0xaa3300, glow: 0xff5500, enemyColor: 0x66e3ff, enemySize: 28, move: 'dash', speed: 105 },
    { nombre: 'EXÓSFERA', desde: 150000, hasta: 220000, bg: 0x041414, platColor: 0x007788, glow: 0x00ffee, enemyColor: 0xff66ff, enemySize: 30, move: 'circle', speed: 115 },
    { nombre: 'ESPACIO', desde: 220000, hasta: 999999, bg: 0x010108, platColor: 0x555555, glow: 0x999999, enemyColor: 0x888888, enemySize: 32, move: 'asteroid', speed: 130 }
  ];

  const ESCALA_METROS = 6;

  const elMetros = document.getElementById('hud-metros');
  const elFuel = document.getElementById('hud-fuel');
  const elVida = document.getElementById('hud-vida');
  const elNivel = document.getElementById('hud-nivel');
  const elBar = document.getElementById('hud-bar');

  function getCapa(metrosReales) {
    for (let i = CAPAS.length - 1; i >= 0; i--) {
      if (metrosReales >= CAPAS[i].desde) return i;
    }
    return 0;
  }

  function dibujarJugador(scene, x, y) {
    const g = scene.add.graphics();
    g.fillStyle(0x00ffcc, 1); g.fillRoundedRect(-10, -16, 20, 28, 3);
    g.fillStyle(0x001a14, 1); g.fillRect(-5, -12, 10, 7);
    g.fillStyle(0x007755, 1); g.fillRect(7, -10, 7, 14);
    g.fillStyle(0x004433, 1); g.fillRect(8, 2, 5, 5);
    g.fillStyle(0x005533, 1); g.fillRect(-10, 10, 8, 6);
    g.fillRect(2, 10, 8, 6);
    g.x = x; g.y = y;
    return g;
  }

  function dibujarEnemigo(scene, x, y, capa) {
    const g = scene.add.graphics();

    if (capa.move === 'asteroid') {
      g.fillStyle(0x666666, 1);
      g.fillCircle(0, 0, 15);
      g.fillStyle(0x8f8f8f, 0.85);
      g.fillCircle(-4, -1, 5);
      g.fillCircle(5, 4, 3);
      g.fillStyle(0x333333, 1);
      g.fillCircle(2, -5, 3);
    } else {
      const r = Math.max(8, Math.floor(capa.enemySize / 2));

      g.fillStyle(capa.enemyColor, 1);
      g.fillCircle(0, 0, r);

      if (capa.move === 'vertical') {
        g.fillStyle(0xffffff, 0.18);
        g.fillCircle(0, -2, r - 4);
      } else if (capa.move === 'sine') {
        g.fillStyle(0xffffff, 0.22);
        g.fillTriangle(0, -r - 2, 6, -2, -6, -2);
      } else if (capa.move === 'dash') {
        g.fillStyle(0xffffff, 0.20);
        g.fillRect(-r + 3, -2, (r - 3) * 2, 4);
      } else if (capa.move === 'circle') {
        g.lineStyle(2, 0xffffff, 0.45);
        g.strokeCircle(0, 0, r + 4);
      }

      g.fillStyle(0x111111, 1);
      g.fillCircle(-4, -2, 2);
      g.fillCircle(4, -2, 2);
      g.fillStyle(0xffffff, 0.7);
      g.fillRect(-3, 4, 6, 2);
    }

    g.x = x;
    g.y = y;
    return g;
  }

  function dibujarPlataforma(scene, x, y, w, color, glow, rot) {
    const g = scene.add.graphics();
    g.fillStyle(glow, 0.12); g.fillRect(-w / 2 - 2, -2, w + 4, 14);
    g.fillStyle(color, 1); g.fillRect(-w / 2, 0, w, 8);
    g.fillStyle(glow, 0.9); g.fillRect(-w / 2, 0, w, 2);
    g.fillStyle(0xffffff, 0.25); g.fillRect(-w / 2 + 4, 0, 8, 1);
    g.x = x; g.y = y; g.rotation = rot || 0;
    return g;
  }

  function dibujarPickup(scene, x, y) {
    const g = scene.add.graphics();
    g.fillStyle(0x00ff88, 0.35); g.fillCircle(0, 0, 11);
    g.fillStyle(0x00ff88, 1); g.fillTriangle(0, -10, 9, 5, -9, 5);
    g.fillStyle(0xffffff, 0.9); g.fillRect(-1, -8, 2, 10);
    g.fillRect(-4, -2, 8, 2);
    g.x = x; g.y = y;
    return g;
  }

  function dibujarCorazon(scene, x, y) {
    const g = scene.add.graphics();

    g.fillStyle(0xff4d88, 0.10);
    g.fillCircle(0, 0, 34);
    g.fillStyle(0xff66aa, 0.14);
    g.fillCircle(0, 0, 26);

    g.fillStyle(0xff3366, 0.18);
    g.fillCircle(-16, -10, 18);
    g.fillCircle(16, -10, 18);
    g.fillTriangle(-32, 0, 32, 0, 0, 38);

    g.fillStyle(0xff5577, 1);
    g.fillCircle(-13, -8, 14);
    g.fillCircle(13, -8, 14);
    g.fillTriangle(-26, 2, 26, 2, 0, 30);

    g.fillStyle(0xffffff, 0.30);
    g.fillCircle(-18, -12, 5);
    g.fillCircle(6, -14, 3);

    g.lineStyle(3, 0xff99cc, 0.28);
    g.strokeCircle(0, 2, 28);

    g.x = x;
    g.y = y;
    return g;
  }

  function dibujarBoost(scene, x, y) {
    const g = scene.add.graphics();

    g.fillStyle(0xffdd33, 0.18);
    g.fillCircle(0, 0, 26);
    g.fillStyle(0xffff88, 0.10);
    g.fillCircle(0, 0, 36);

    g.fillStyle(0xffcc00, 1);
    g.fillTriangle(0, -18, 8, -2, -8, -2);
    g.fillTriangle(18, 0, 2, 8, 2, -8);
    g.fillTriangle(0, 18, 8, 2, -8, 2);
    g.fillTriangle(-18, 0, -2, 8, -2, -8);

    g.fillStyle(0xffffff, 0.9);
    g.fillCircle(-5, -6, 3);
    g.fillStyle(0xffaa00, 1);
    g.fillCircle(0, 0, 7);

    g.lineStyle(2, 0xffffcc, 0.35);
    g.strokeCircle(0, 0, 21);

    g.x = x;
    g.y = y;
    return g;
  }

  class GameScene extends Phaser.Scene {
    constructor() { super('GameScene'); }

    create() {
      document.getElementById('hud').style.display = 'block';
      this.cameras.main.setBackgroundColor(CAPAS[0].bg);

      const bg = this.add.graphics().setScrollFactor(0.04);
      for (let i = 0; i < 90; i++) {
        const x = Phaser.Math.Between(0, W);
        const y = Phaser.Math.Between(-6000, H);
        const s = Math.random() * 1.4 + 0.2;
        const a = 0.15 + Math.random() * 0.5;
        bg.fillStyle([0xffffff, 0xaaaaff, 0x88ccff][Math.floor(Math.random() * 3)], a);
        bg.fillRect(x, y, s, s);
      }

      this.wallGfx = this.add.graphics();
      this.hitOverlay = this.add.graphics().setScrollFactor(0).setDepth(9999);
      this.hitFlashAlpha = 0;

      this.playerGfx = dibujarJugador(this, W / 2, H - 60);
      this.player = this.add.rectangle(W / 2, H - 60, 20, 30, 0x000000, 0);
      this.physics.add.existing(this.player);
      this.player.body.setCollideWorldBounds(false);

      this.llamaGfx = this.add.graphics();

      const sueloGfx = this.add.graphics();
      sueloGfx.fillStyle(0x223344, 1);
      sueloGfx.fillRect(0, H - 16, W, 16);
      sueloGfx.fillStyle(0x00ffcc, 0.3);
      sueloGfx.fillRect(0, H - 16, W, 2);

      const suelo = this.add.rectangle(W / 2, H - 8, W, 16, 0x000000, 0);
      this.physics.add.existing(suelo, true);
      this.physics.add.collider(this.player, suelo);

      this.fuel = 100;
      this.maxFuel = 100;
      this.metrosJuego = 0;
      this.metrosReales = 0;
      this.vivo = true;
      this.nivelActual = 0;
      this._ultimaCapaMostrada = { 0: true };
      this.alturaBase = this.player.y;
      this.ultimaGenY = H - 16;
      this.vida = 3;
      this.iFrames = 0;
      this.shootCD = 0;
      this.lastHeartBand = 0;

      this.boostActivo = false;
      this.boostHasta = 0;
      this.nextBoostAt = Phaser.Math.Between(10000, 18000);

      this.plats = [];
      this.platGfx = [];
      this.enems = [];
      this.enemGfx = [];
      this.pickups = [];
      this.pickGfx = [];
      this.heartItems = [];
      this.heartGfx = [];
      this.boostItems = [];
      this.boostGfx = [];
      this.balas = [];
      this.balaGfx = [];

      this.generarChunk(H - 16, H - 820);

      this.cursors = this.input.keyboard.createCursorKeys();
      this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
      this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
      this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
      this.keyX = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);

      this.cameras.main.startFollow(this.player, true, 1, 0.09);
    }

    drawWalls() {
      const topY = this.cameras.main.scrollY - 200;
      this.wallGfx.clear();
      this.wallGfx.fillStyle(0x00ffcc, 0.08);
      this.wallGfx.fillRect(0, topY, WALL, 1200);
      this.wallGfx.fillRect(W - WALL, topY, WALL, 1200);
      this.wallGfx.fillStyle(0x00ffcc, 0.22);
      this.wallGfx.fillRect(WALL - 2, topY, 2, 1200);
      this.wallGfx.fillRect(W - WALL, topY, 2, 1200);
    }

    drawHitOverlay() {
      this.hitOverlay.clear();
      if (this.hitFlashAlpha <= 0) return;

      this.hitOverlay.fillStyle(0xff2244, this.hitFlashAlpha);
      this.hitOverlay.fillRect(0, 0, W, H);

      this.hitOverlay.lineStyle(6, 0xffffff, this.hitFlashAlpha * 0.45);
      this.hitOverlay.strokeRect(3, 3, W - 6, H - 6);

      this.hitFlashAlpha = Math.max(0, this.hitFlashAlpha - 0.024);
    }

    metrosDesdeY(y) {
      const metrosJuego = Math.max(0, Math.floor((this.alturaBase - y) / 8));
      return metrosJuego * ESCALA_METROS;
    }

    generarChunk(desdeY, hastaY) {
      for (let y = desdeY - 100; y > hastaY; y -= Phaser.Math.Between(90, 145)) {
        const metrosFila = this.metrosDesdeY(y);
        const capaIndex = getCapa(metrosFila);
        const capa = CAPAS[capaIndex];
        const enEspacio = capa.move === 'asteroid';

        if (!enEspacio) {
          const anchoMin = Math.max(55, 110 - capaIndex * 8);
          const anchoMax = Math.max(95, 150 - capaIndex * 10);
          const pw = Phaser.Math.Between(anchoMin, anchoMax);
          const px = Phaser.Math.Between(pw / 2 + WALL + 8, W - pw / 2 - WALL - 8);
          const rot = (capaIndex >= 2 && Math.random() < 0.28)
            ? Phaser.Math.FloatBetween(-0.16, 0.16)
            : 0;

          const pg = dibujarPlataforma(this, px, y, pw, capa.platColor, capa.glow, rot);
          const plat = this.add.rectangle(px, y + 4, pw, 8, 0x000000, 0);
          this.physics.add.existing(plat, true);
          this.physics.add.collider(this.player, plat);
          this.plats.push(plat);
          this.platGfx.push(pg);

          if (Phaser.Math.Between(0, 5) === 0) {
            const fx = Phaser.Math.Between(WALL + 20, W - WALL - 20);
            const fg = dibujarPickup(this, fx, y - 22);
            const fu = this.add.rectangle(fx, y - 22, 14, 14, 0x000000, 0);
            this.physics.add.existing(fu, true);
            this.pickups.push(fu);
            this.pickGfx.push(fg);
            this.tweens.add({
              targets: fg,
              y: '+=7',
              duration: 900,
              yoyo: true,
              repeat: -1,
              ease: 'Sine.easeInOut'
            });
          }
        }

        const enemyDensity = enEspacio ? 0 : (capaIndex >= 3 ? 2 : 1);

        for (let n = 0; n < enemyDensity; n++) {
          if (enEspacio) break;

          const ex = Phaser.Math.Between(WALL + 24, W - WALL - 24);
          const ey = y - 28 - (n * 18);

          const eg = dibujarEnemigo(this, ex, ey, capa);
          const en = this.add.rectangle(ex, ey, capa.enemySize, capa.enemySize, 0x000000, 0);
          this.physics.add.existing(en);
          en.body.setAllowGravity(false);
          en.moveType = capa.move;
          en.enemySpeed = capa.speed + (n * 8);
          en.baseX = ex;
          en.baseY = ey;
          en.phase = Math.random() * Math.PI * 2;
          en.radius = Phaser.Math.Between(20, 35);
          en.dashCD = Phaser.Math.Between(30, 70);

          if (en.moveType === 'horizontal') {
            en.body.setVelocityX(en.enemySpeed * (Math.random() > 0.5 ? 1 : -1));
          } else if (en.moveType === 'vertical') {
            en.body.setVelocityY(en.enemySpeed * (Math.random() > 0.5 ? 1 : -1));
          } else if (en.moveType === 'sine') {
            en.body.setVelocity(0, 0);
          } else if (en.moveType === 'dash') {
            en.body.setVelocityX(en.enemySpeed * (Math.random() > 0.5 ? 1 : -1));
          } else if (en.moveType === 'circle') {
            en.body.setVelocity(0, 0);
            en.radius = Phaser.Math.Between(24, 42);
          }

          this.enems.push(en);
          this.enemGfx.push(eg);
        }
      }

      const metrosCentroChunk = this.metrosDesdeY((desdeY + hastaY) / 2);
      const capaCentro = CAPAS[getCapa(metrosCentroChunk)];

      if (capaCentro.move === 'asteroid') {
        for (let i = 0; i < 5; i++) {
          const ex = Phaser.Math.Between(WALL + 20, W - WALL - 20);
          const ey = Phaser.Math.Between(hastaY, desdeY - 100);
          const eg = dibujarEnemigo(this, ex, ey, capaCentro);
          const en = this.add.rectangle(ex, ey, 30, 30, 0x000000, 0);
          this.physics.add.existing(en);
          en.body.setAllowGravity(false);
          en.body.setVelocity(
            Phaser.Math.Between(-90, 90),
            Phaser.Math.Between(90, 170)
          );
          en.moveType = 'asteroid';
          en.enemySpeed = capaCentro.speed;
          en.baseX = ex;
          en.baseY = ey;
          en.phase = Math.random() * Math.PI * 2;
          en.radius = Phaser.Math.Between(20, 35);
          en.dashCD = Phaser.Math.Between(30, 70);
          en.rotSpeed = Phaser.Math.FloatBetween(-0.05, 0.05);

          this.enems.push(en);
          this.enemGfx.push(eg);
        }
      }

      this.ultimaGenY = hastaY;
    }

    spawnHeart() {
      for (let i = this.heartItems.length - 1; i >= 0; i--) {
        const h = this.heartItems[i];
        const hg = this.heartGfx[i];
        if (h && h.active) h.destroy();
        if (hg) hg.destroy();
        this.heartItems.splice(i, 1);
        this.heartGfx.splice(i, 1);
      }

      const hx = Phaser.Math.Between(WALL + 60, W - WALL - 60);
      const hy = this.player.y - Phaser.Math.Between(140, 190);

      const hg = dibujarCorazon(this, hx, hy);
      const heart = this.add.rectangle(hx, hy, 54, 54, 0x000000, 0);
      this.physics.add.existing(heart);
      heart.body.setAllowGravity(false);

      const dirX = Math.random() > 0.5 ? 1 : -1;
      const dirY = Math.random() > 0.5 ? 1 : -1;
      const velX = Phaser.Math.Between(95, 120) * dirX;
      const velY = Phaser.Math.Between(75, 95) * dirY;

      heart.body.setVelocity(velX, velY);
      heart.moveVX = velX;
      heart.moveVY = velY;

      this.heartItems.push(heart);
      this.heartGfx.push(hg);

      this.tweens.add({
        targets: hg,
        scaleX: 1.08,
        scaleY: 1.08,
        alpha: 0.88,
        duration: 420,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    spawnBoost() {
      if (this.boostItems.length > 0) return;

      const x = Phaser.Math.Between(WALL + 60, W - WALL - 60);
      const y = this.player.y - Phaser.Math.Between(170, 250);

      const g = dibujarBoost(this, x, y);
      const b = this.add.rectangle(x, y, 32, 32, 0x000000, 0);
      this.physics.add.existing(b);
      b.body.setAllowGravity(false);

      b.baseX = x;
      b.baseY = y;
      b.phase = Math.random() * Math.PI * 2;
      b.radius = Phaser.Math.Between(18, 28);

      this.boostItems.push(b);
      this.boostGfx.push(g);

      this.tweens.add({
        targets: g,
        scaleX: 1.16,
        scaleY: 1.16,
        alpha: 0.92,
        duration: 380,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    hit(a, b, mg) {
      mg = mg || 0;
      if (!a.active || !b.active) return false;
      return Math.abs(a.x - b.x) < (a.width + b.width) / 2 - mg &&
        Math.abs(a.y - b.y) < (a.height + b.height) / 2 - mg;
    }

    clampPlayer() {
      if (this.player.x < WALL + 10) {
        this.player.x = WALL + 10;
        if (this.player.body.velocity.x < 0) this.player.body.setVelocityX(0);
      }
      if (this.player.x > W - WALL - 10) {
        this.player.x = W - WALL - 10;
        if (this.player.body.velocity.x > 0) this.player.body.setVelocityX(0);
      }
    }

    updateEnemies() {
      const t = this.time.now * 0.001;

      for (let i = this.enems.length - 1; i >= 0; i--) {
        const e = this.enems[i];
        const g = this.enemGfx[i];

        if (!e || !e.active) {
          if (g) g.destroy();
          this.enems.splice(i, 1);
          this.enemGfx.splice(i, 1);
          continue;
        }

        if (g) {
          g.x = e.x;
          g.y = e.y;
        }

        if (e.moveType === 'horizontal') {
          if (e.x < WALL + 12) e.body.setVelocityX(Math.abs(e.body.velocity.x));
          if (e.x > W - WALL - 12) e.body.setVelocityX(-Math.abs(e.body.velocity.x));
        } else if (e.moveType === 'vertical') {
          if (e.y < this.cameras.main.scrollY - 10) e.body.setVelocityY(Math.abs(e.enemySpeed));
          if (e.y > this.cameras.main.scrollY + H - 30) e.body.setVelocityY(-Math.abs(e.enemySpeed));
        } else if (e.moveType === 'sine') {
          e.y += 0.8;
          e.x = e.baseX + Math.sin(t * 2.2 + e.phase) * 52;
        } else if (e.moveType === 'dash') {
          e.dashCD--;
          if (e.dashCD <= 0) {
            const dir = this.player.x < e.x ? -1 : 1;
            e.body.setVelocityX(dir * 180);
            e.dashCD = Phaser.Math.Between(30, 70);
          }
          if (e.x < WALL + 12) e.body.setVelocityX(Math.abs(e.body.velocity.x));
          if (e.x > W - WALL - 12) e.body.setVelocityX(-Math.abs(e.body.velocity.x));
        } else if (e.moveType === 'circle') {
          e.phase += 0.04;
          e.x = e.baseX + Math.cos(e.phase) * e.radius;
          e.y = e.baseY + Math.sin(e.phase) * e.radius;
        } else if (e.moveType === 'asteroid') {
          if (g) g.rotation += e.rotSpeed || 0.02;
          if (e.x < WALL + 12 || e.x > W - WALL - 12) e.body.setVelocityX(-e.body.velocity.x);
        }

        if (e.y > this.cameras.main.scrollY + H + 220) {
          e.destroy();
          if (g) g.destroy();
          this.enems.splice(i, 1);
          this.enemGfx.splice(i, 1);
          continue;
        }
      }
    }

    updateHUD() {
      elMetros.textContent = '⬆ ' + this.metrosReales.toLocaleString('es-AR') + ' m';
      elFuel.textContent = this.boostActivo
        ? '⚡ OVERDRIVE'
        : '⚡ Fuel: ' + Math.floor(this.fuel) + '%';
      elVida.textContent = '❤ Vida: ' + this.vida;
      elNivel.textContent = CAPAS[this.nivelActual].nombre;
      elBar.style.width = this.boostActivo
        ? '100px'
        : (this.fuel / this.maxFuel) * 100 + 'px';
    }

    update() {
      if (!this.vivo) return;

      this.drawWalls();
      this.drawHitOverlay();

      const pb = this.player.body;
      const izq = this.cursors.left.isDown || this.keyA.isDown;
      const der = this.cursors.right.isDown || this.keyD.isDown;
      const arr = this.cursors.up.isDown || this.keyW.isDown;

      this.metrosJuego = Math.max(0, Math.floor((this.alturaBase - this.player.y) / 8));
      this.metrosReales = this.metrosJuego * ESCALA_METROS;

      const currentHeartBand = Math.floor(this.metrosReales / 6000);
      if (currentHeartBand > this.lastHeartBand) {
        this.lastHeartBand = currentHeartBand;
        if (currentHeartBand >= 1) {
          this.spawnHeart();
        }
      }

      if (this.metrosReales >= this.nextBoostAt) {
        this.spawnBoost();
        this.nextBoostAt += Phaser.Math.Between(10000, 18000);
      }

      const nuevaCapa = getCapa(this.metrosReales);
      if (nuevaCapa !== this.nivelActual) {
        this.nivelActual = nuevaCapa;
        this.cameras.main.setBackgroundColor(CAPAS[this.nivelActual].bg);

        if (!this._ultimaCapaMostrada[this.nivelActual]) {
          this._ultimaCapaMostrada[this.nivelActual] = true;
          mostrarTransicionCapa(CAPAS[this.nivelActual].nombre);
          this.cameras.main.flash(220, 180, 255, 255, false);
        }
      }

      pb.setVelocityX(izq ? -250 : der ? 250 : 0);

      this.clampPlayer();

      this.playerGfx.x = this.player.x;
      this.playerGfx.y = this.player.y;
      this.playerGfx.scaleX = izq ? -1 : 1;

      this.llamaGfx.clear();

      if (this.boostActivo) {
        pb.checkCollision.none = true;
        pb.setVelocityX(0);
        pb.setVelocityY(-980);

        this.playerGfx.alpha = 0.86;

        this.llamaGfx.fillStyle(0xffff66, 0.95);
        this.llamaGfx.fillTriangle(
          this.player.x - 8, this.player.y + 16,
          this.player.x + 8, this.player.y + 16,
          this.player.x, this.player.y + 42
        );
        this.llamaGfx.fillStyle(0xff8800, 0.85);
        this.llamaGfx.fillTriangle(
          this.player.x - 5, this.player.y + 16,
          this.player.x + 5, this.player.y + 16,
          this.player.x, this.player.y + 34
        );

        if (this.metrosReales >= this.boostHasta) {
          this.boostActivo = false;
          pb.checkCollision.none = false;
          this.playerGfx.alpha = 1;
        }

      } else if (arr && this.fuel > 0) {
        pb.checkCollision.none = false;
        startJetpackSound();
        updateJetpackSound();
        pb.setVelocityY(-400);
        this.fuel = Math.max(0, this.fuel - 0.6);

        this.llamaGfx.fillStyle(0xff6600, 0.9);
        this.llamaGfx.fillTriangle(
          this.player.x - 5, this.player.y + 16,
          this.player.x + 5, this.player.y + 16,
          this.player.x, this.player.y + 16 + Phaser.Math.Between(10, 22)
        );
        this.llamaGfx.fillStyle(0xffcc00, 0.6);
        this.llamaGfx.fillTriangle(
          this.player.x - 3, this.player.y + 16,
          this.player.x + 3, this.player.y + 16,
          this.player.x, this.player.y + 16 + Phaser.Math.Between(6, 14)
        );
      } else {
        pb.checkCollision.none = false;
        stopJetpackSound();
        if (!arr) this.fuel = Math.min(this.maxFuel, this.fuel + 0.14);
      }

      for (let i = 0; i < this.pickups.length; i++) {
        const p = this.pickups[i];
        const pg = this.pickGfx[i];
        if (!p || !p.active || !pg) continue;
        pg.x = p.x;
      }

      for (let i = this.boostItems.length - 1; i >= 0; i--) {
        const b = this.boostItems[i];
        const bg = this.boostGfx[i];

        if (!b || !b.active) {
          if (bg) bg.destroy();
          this.boostItems.splice(i, 1);
          this.boostGfx.splice(i, 1);
          continue;
        }

        b.phase += 0.05;
        b.x = b.baseX + Math.cos(b.phase) * b.radius;
        b.y = b.baseY + Math.sin(b.phase * 1.3) * (b.radius * 0.55);

        if (bg) {
          bg.x = b.x;
          bg.y = b.y;
          bg.rotation += 0.035;
        }

        if (this.hit(this.player, b, 2)) {
          b.destroy();
          if (bg) bg.destroy();
          this.boostItems.splice(i, 1);
          this.boostGfx.splice(i, 1);

          this.boostActivo = true;
          this.boostHasta = this.metrosReales + 4000;
          this.iFrames = 0;
          sfxBoost();
          this.cameras.main.flash(180, 255, 255, 120, false);
          this.cameras.main.shake(120, 0.01);
        } else if (b.y > this.cameras.main.scrollY + H + 120) {
          b.destroy();
          if (bg) bg.destroy();
          this.boostItems.splice(i, 1);
          this.boostGfx.splice(i, 1);
        }
      }

      for (let i = this.heartItems.length - 1; i >= 0; i--) {
        const h = this.heartItems[i];
        const hg = this.heartGfx[i];

        if (!h || !h.active) {
          if (hg) hg.destroy();
          this.heartItems.splice(i, 1);
          this.heartGfx.splice(i, 1);
          continue;
        }

        if (h.x < WALL + 20) {
          h.body.setVelocityX(Math.abs(h.moveVX || 110));
          h.moveVX = Math.abs(h.moveVX || 110);
        }
        if (h.x > W - WALL - 20) {
          h.body.setVelocityX(-Math.abs(h.moveVX || 110));
          h.moveVX = -Math.abs(h.moveVX || 110);
        }

        const topLimit = this.cameras.main.scrollY + 30;
        const bottomLimit = this.cameras.main.scrollY + H - 90;

        if (h.y < topLimit) {
          h.body.setVelocityY(Math.abs(h.moveVY || 90));
          h.moveVY = Math.abs(h.moveVY || 90);
        }
        if (h.y > bottomLimit) {
          h.body.setVelocityY(-Math.abs(h.moveVY || 90));
          h.moveVY = -Math.abs(h.moveVY || 90);
        }

        if (hg) {
          hg.x = h.x;
          hg.y = h.y;
          hg.rotation += 0.025;
        }

        if (this.hit(this.player, h, 2)) {
          const fx = this.add.graphics();
          fx.fillStyle(0xff6699, 0.55);
          fx.fillCircle(h.x, h.y, 34);
          fx.fillStyle(0xffffff, 0.18);
          fx.fillCircle(h.x, h.y, 18);

          this.tweens.add({
            targets: fx,
            alpha: 0,
            scaleX: 2.6,
            scaleY: 2.6,
            duration: 320,
            onComplete: () => fx.destroy()
          });

          h.destroy();
          if (hg) hg.destroy();
          this.heartItems.splice(i, 1);
          this.heartGfx.splice(i, 1);

          this.vida = Math.min(4, this.vida + 1);
          sfxHeart();
        }
      }

      this.shootCD--;
      if (!this.boostActivo && this.keyX.isDown && this.shootCD <= 0) {
        sfxShoot();
        this.shootCD = 16;

        const br = this.add.rectangle(this.player.x, this.player.y - 28, 4, 12, 0x000000, 0);
        this.physics.add.existing(br);
        br.body.setVelocityY(-680);
        br.body.setAllowGravity(false);

        const bgfx = this.add.graphics();
        bgfx.fillStyle(0xffff00, 1);
        bgfx.fillRect(-2, -6, 4, 12);
        bgfx.fillStyle(0xffffff, 0.6);
        bgfx.fillRect(-1, -6, 2, 12);

        this.balas.push(br);
        this.balaGfx.push(bgfx);

        this.time.delayedCall(1500, () => {
          if (br && br.active) {
            br.destroy();
            bgfx.destroy();
          }
        });
      }

      for (let i = 0; i < this.balas.length; i++) {
        const b = this.balas[i];
        const bgfx = this.balaGfx[i];
        if (!b || !b.active || !bgfx) continue;
        bgfx.x = b.x;
        bgfx.y = b.y;
      }

      for (let i = this.balas.length - 1; i >= 0; i--) {
        const b = this.balas[i];
        if (!b.active) {
          this.balas.splice(i, 1);
          this.balaGfx.splice(i, 1);
          continue;
        }

        let balaDestruida = false;

        for (let p = this.plats.length - 1; p >= 0; p--) {
          const plat = this.plats[p];
          if (!plat || !plat.active) continue;

          if (this.hit(b, plat, 2)) {
            const spark = this.add.graphics();
            spark.fillStyle(0x66ccff, 0.75);
            spark.fillCircle(b.x, b.y, 6);
            this.tweens.add({
              targets: spark,
              alpha: 0,
              scaleX: 1.8,
              scaleY: 1.8,
              duration: 180,
              onComplete: () => spark.destroy()
            });

            b.destroy();
            this.balaGfx[i].destroy();
            this.balas.splice(i, 1);
            this.balaGfx.splice(i, 1);
            balaDestruida = true;
            break;
          }
        }

        if (balaDestruida) continue;

        for (let j = this.enems.length - 1; j >= 0; j--) {
          const e = this.enems[j];
          if (!e.active) {
            this.enems.splice(j, 1);
            this.enemGfx.splice(j, 1);
            continue;
          }

          if (this.hit(b, e)) {
            const ex = this.add.graphics();
            ex.fillStyle(0xff4400, 0.8);
            ex.fillCircle(e.x, e.y, 18);
            ex.fillStyle(0xffcc00, 0.6);
            ex.fillCircle(e.x, e.y, 10);
            this.tweens.add({
              targets: ex,
              alpha: 0,
              scaleX: 2,
              scaleY: 2,
              duration: 300,
              onComplete: () => ex.destroy()
            });

            b.destroy();
            this.balaGfx[i].destroy();
            this.balas.splice(i, 1);
            this.balaGfx.splice(i, 1);

            e.destroy();
            this.enemGfx[j].destroy();
            this.enems.splice(j, 1);
            this.enemGfx.splice(j, 1);
            break;
          }
        }
      }

      for (let i = this.heartItems.length - 1; i >= 0; i--) {
        const h = this.heartItems[i];
        const hg = this.heartGfx[i];

        if (!h || !h.active) {
          if (hg) hg.destroy();
          this.heartItems.splice(i, 1);
          this.heartGfx.splice(i, 1);
          continue;
        }

        if (h.y > this.cameras.main.scrollY + H + 120) {
          h.destroy();
          if (hg) hg.destroy();
          this.heartItems.splice(i, 1);
          this.heartGfx.splice(i, 1);
        }
      }

      for (let i = this.pickups.length - 1; i >= 0; i--) {
        const p = this.pickups[i];
        if (!p.active) {
          this.pickups.splice(i, 1);
          this.pickGfx.splice(i, 1);
          continue;
        }

        if (this.hit(this.player, p)) {
          const fl = this.add.graphics();
          fl.fillStyle(0x00ff88, 0.5);
          fl.fillCircle(p.x, p.y, 20);
          this.tweens.add({
            targets: fl,
            alpha: 0,
            scaleX: 2,
            scaleY: 2,
            duration: 250,
            onComplete: () => fl.destroy()
          });

          p.destroy();
          this.pickGfx[i].destroy();
          this.pickups.splice(i, 1);
          this.pickGfx.splice(i, 1);
          this.fuel = Math.min(this.maxFuel, this.fuel + 40);
          sfxFuel();
        }
      }

      this.updateEnemies();

      if (this.boostActivo) {
        // durante boost no recibe daño
      } else if (this.iFrames > 0) {
        this.iFrames--;
        this.playerGfx.alpha = this.iFrames % 8 < 4 ? 0.3 : 1;
      } else {
        this.playerGfx.alpha = 1;
        for (const e of this.enems) {
          if (!e.active) continue;
          if (this.hit(this.player, e, 4)) {
            this.vida--;
            this.iFrames = 110;
            this.hitFlashAlpha = 0.38;
            sfxHit();
            this.cameras.main.shake(260, 0.02);
            this.cameras.main.flash(120, 255, 70, 70, false);

            const golpe = this.add.graphics();
            golpe.fillStyle(0xff3344, 0.70);
            golpe.fillCircle(this.player.x, this.player.y, 24);
            golpe.fillStyle(0xffffff, 0.18);
            golpe.fillCircle(this.player.x, this.player.y, 12);
            this.tweens.add({
              targets: golpe,
              alpha: 0,
              scaleX: 2.1,
              scaleY: 2.1,
              duration: 220,
              onComplete: () => golpe.destroy()
            });

            const dir = this.player.x < e.x ? -1 : 1;
            pb.setVelocityX(dir * 180);
            pb.setVelocityY(220);

            if (this.vida <= 0) {
              this.vivo = false;
              stopJetpackSound();
              sfxDeath();
              mostrarGameOver(this.metrosReales);
              return;
            }
            break;
          }
        }
      }

      if (this.cameras.main.scrollY < this.ultimaGenY + 400) {
        this.generarChunk(this.ultimaGenY, this.ultimaGenY - 800);
      }

      if (this.player.y > this.cameras.main.scrollY + H + 100) {
        this.vivo = false;
        stopJetpackSound();
        sfxDeath();
        mostrarGameOver(this.metrosReales);
        return;
      }

      this.updateHUD();
    }
  }

  gameInstance = new Phaser.Game({
    type: Phaser.AUTO,
    width: W,
    height: H,
    backgroundColor: '#04041a',
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 480 },
        debug: false
      }
    },
    scene: [GameScene]
  });
}
