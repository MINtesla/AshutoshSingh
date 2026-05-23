import * as THREE from 'three';

// ===================== PORTFOLIO DATA =====================
const SECTIONS = [
  {
    id: 'welcome', title: 'Welcome', subtitle: "I'm Ashutosh Singh",
    color: '#ffba08', x: 0, z: -16,
    body: `<p>Software Development Engineer with <b>3+ years</b> of experience building scalable, low-latency backend systems using <b>Java</b> and <b>Spring Boot</b>.</p>
           <p>Strong foundation in DSA, OOP, and Distributed Systems.</p>
           <p style="color:#d62828;margin-top:12px"><b>Drive around with W A S D</b> — get close to a signpost and press <b>E</b>.</p>`,
  },
  {
    id: 'senior', title: 'Senior SE', subtitle: 'Comviva · Dec 2024 – Present',
    color: '#d62828', x: -28, z: -38,
    body: `<ul>
      <li>Designed real-time backend systems handling <b>millions of TPS</b> using Java, Spring Boot, Kafka, gRPC.</li>
      <li>Owned end-to-end SDLC with <b>zero critical production failures</b>.</li>
      <li>Improved scalability and throughput by <b>35%</b> on telecom-grade platforms (MRTM v7.12.2, J4U USSD).</li>
      <li>Shipped <b>20+ production features</b> with <b>100% First-Time-Right</b> &amp; <b>100% On-Time Delivery</b>.</li>
      <li>Reduced production incidents by <b>40%</b> via monitoring, RCA, and load testing.</li>
      <li>Optimized PostgreSQL via indexes, execution plans, batching.</li>
      <li>Architected multi-tenant SaaS telecom platform.</li>
      <li>Multithreading via Executor framework + CompletableFuture.</li>
    </ul>`,
  },
  {
    id: 'sde', title: 'Software Engineer', subtitle: 'Comviva · Jan 2023 – Dec 2024',
    color: '#3a86ff', x: 28, z: -38,
    body: `<ul>
      <li>Maintained MRTM v5.6 and v7.11.1 — feature dev, enhancements, critical prod fixes.</li>
      <li>Delivered <b>15+ customer-facing change requests</b>, reduced response time by <b>25%</b>.</li>
      <li>Built backend microservices using Java, Spring Boot, Kafka, REST APIs.</li>
      <li>Worked with QA / support during SIT &amp; UAT for zero-defect releases.</li>
    </ul>`,
  },
  {
    id: 'mrtm', title: 'Project: MRTM', subtitle: 'Mobilytix Realtime Marketing',
    color: '#06a77d', x: -32, z: -68,
    body: `<p>Telecom-grade real-time marketing decisioning platform processing subscriber behavior, transaction patterns, and contextual signals.</p>
           <p>Built scalable microservices for campaign evaluation, offer prioritization, eligibility checks, and delivery orchestration — handling <b>millions of events / day</b> with low latency.</p>`,
  },
  {
    id: 'cuig', title: 'Project: CUIG', subtitle: 'Centralized Integration Gateway',
    color: '#f4a261', x: 32, z: -68,
    body: `<p>Centralized integration gateway for upstream / downstream comms across telecom platforms.</p>
           <p>HTTP and Kafka-based async integrations with config-driven routing. PostgreSQL + Consul for dynamic config — reduced deployment / integration effort by <b>40%</b>.</p>`,
  },
  {
    id: 'skills', title: 'Skills', subtitle: 'Tech I work with',
    color: '#8338ec', x: 0, z: -94,
    body: `<p><b>Languages:</b> Java (Core, 8+, Concurrency), Python, SQL, Shell</p>
           <p><b>Backend &amp; Distributed:</b> Spring Boot, Microservices, Kafka, Hibernate/JPA, REST, gRPC</p>
           <p><b>Data:</b> PostgreSQL, MySQL, SingleStore, VoltDB, Hazelcast, Oracle</p>
           <p><b>Cloud &amp; Infra:</b> Docker, Kubernetes, Spring Cloud Gateway, CI/CD, Linux, AWS, GCP</p>
           <p><b>Practices:</b> Agile, TDD (JUnit, Mockito), System Design, OOP, DSA</p>`,
  },
  {
    id: 'education', title: 'Education', subtitle: 'B.Tech CS · CGPA 8.8',
    color: '#ff006e', x: -26, z: -118,
    body: `<p><b>Maharaja Surajmal Institute of Technology</b><br>2019 – 2023 · New Delhi · CGPA <b>8.8</b></p>`,
  },
  {
    id: 'achievements', title: 'Achievements', subtitle: 'Some wins',
    color: '#fb5607', x: 26, z: -118,
    body: `<ul>
      <li><b>4★ on CodeChef</b> — peak rating <b>1925</b>.</li>
      <li>Recognized as <b>Top Performer (FY 2024–2025)</b> at Comviva.</li>
    </ul>`,
  },
  {
    id: 'contact', title: 'Get in touch', subtitle: 'Send me a message',
    color: '#ffba08', x: 0, z: -144,
    body: `<p>Got a project, opportunity, or just want to chat?</p>
           <p>Press <b>E</b> here or click below to send a message — it lands directly in my inbox.</p>
           <button class="cta-btn" id="open-contact-from-billboard">Send a message</button>`,
    isContact: true,
  },
];

export class GameService {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private car!: THREE.Group;
  private wheels: THREE.Group[] = [];
  private signs: THREE.Group[] = [];
  private keys: Record<string, boolean> = {};
  private velocity = 0;
  private heading = 0;
  private panelOpen = false;
  private nearSign: THREE.Group | null = null;
  private frame = 0;
  private mouseNX = 0;
  private mouseNY = 0;
  private autoMode = false;
  private autoState = 0; // 0=stopped, 1=driving, 2=reading
  private autoWpIdx = 0;
  private autoReadFrames = 0;
  private rafId = 0;

  private boundMouseMove: (e: MouseEvent) => void;
  private boundKeyDown: (e: KeyboardEvent) => void;
  private boundKeyUp: (e: KeyboardEvent) => void;
  private boundResize: () => void;

  // Physics constants
  private readonly MAX_SPEED = 1.1;
  private readonly REV_SPEED = 0.35;
  private readonly ACCEL = 0.012;
  private readonly BRAKE = 0.022;
  private readonly FRICTION = 0.014;
  private readonly STEER_RATE = 0.032;
  private readonly PLAYGROUND = 360;
  private readonly AUTO_READ_DUR = 50;
  private readonly AUTO_SPEED: number;
  private readonly AUTO_ARRIVE = 5;
  private readonly PLAYGROUND_RADIUS: number;

  constructor(private canvas: HTMLCanvasElement, private cb: any) {
    this.AUTO_SPEED = this.MAX_SPEED * 0.95;
    this.PLAYGROUND_RADIUS = this.PLAYGROUND / 2 - 6;
    this.boundMouseMove = this.onMouseMove.bind(this);
    this.boundKeyDown = this.onKeyDown.bind(this);
    this.boundKeyUp = this.onKeyUp.bind(this);
    this.boundResize = this.onResize.bind(this);
    this.init();
  }

  private init() {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xc4d8e6);
    this.scene.fog = new THREE.Fog(0xc4d8e6, 80, 220);

    // Camera
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500);
    this.camera.position.set(0, 6, 14);
    this.camera.lookAt(0, 1, 0);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    // Lighting
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    this.scene.add(new THREE.HemisphereLight(0xb8d8e8, 0xeae0c8, 0.55));
    const sun = new THREE.DirectionalLight(0xfff2d9, 1.1);
    sun.position.set(40, 60, 30);
    this.scene.add(sun);

    // Ground
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(this.PLAYGROUND, this.PLAYGROUND),
      new THREE.MeshStandardMaterial({ color: 0xeae0c8, roughness: 1 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.z = -90;
    this.scene.add(ground);

    // Grid overlay
    const grid = new THREE.GridHelper(this.PLAYGROUND, 60, 0xc7baa0, 0xd4c8ad);
    grid.position.set(0, 0.01, -90);
    (grid.material as THREE.Material & { transparent: boolean; opacity: number }).transparent = true;
    (grid.material as THREE.Material & { transparent: boolean; opacity: number }).opacity = 0.35;
    this.scene.add(grid);

    // Decorative scatter
    this.buildDecor();

    // Signs
    this.buildSigns();

    // Car
    this.buildCar();

    // Events
    window.addEventListener('mousemove', this.boundMouseMove);
    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('keyup', this.boundKeyUp);
    window.addEventListener('resize', this.boundResize);

    this.rafId = requestAnimationFrame(this.update.bind(this));
  }

  private rand(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }

  private buildDecor() {
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8b6f47, roughness: 0.9 });
    const leafMatA = new THREE.MeshStandardMaterial({ color: 0x6abf69, roughness: 0.85, flatShading: true });
    const leafMatB = new THREE.MeshStandardMaterial({ color: 0x4f9b50, roughness: 0.85, flatShading: true });
    const coneMat = new THREE.MeshStandardMaterial({ color: 0xff6d00, flatShading: true });
    const blockColors = [0xff5b6e, 0x3a86ff, 0xffba08, 0x06a77d, 0x8338ec, 0xfb5607];

    const isNearSection = (x: number, z: number) =>
      SECTIONS.some(s => Math.hypot(s.x - x, s.z - z) < 8);

    const makeTree = (x: number, z: number) => {
      const g = new THREE.Group();
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 1.6, 6), trunkMat);
      trunk.position.y = 0.8;
      g.add(trunk);
      const leaves = new THREE.Mesh(
        new THREE.ConeGeometry(1.4, 2.6, 7),
        Math.random() < 0.5 ? leafMatA : leafMatB
      );
      leaves.position.y = 2.7;
      g.add(leaves);
      g.position.set(x, 0, z);
      this.scene.add(g);
    };

    const makeCone = (x: number, z: number) => {
      const m = new THREE.Mesh(new THREE.ConeGeometry(0.4, 1, 12), coneMat);
      m.position.set(x, 0.5, z);
      this.scene.add(m);
    };

    const makeBlock = (x: number, z: number) => {
      const w = this.rand(1, 3), h = this.rand(0.6, 2.5), d = this.rand(1, 3);
      const mat = new THREE.MeshStandardMaterial({
        color: blockColors[Math.floor(Math.random() * blockColors.length)],
        roughness: 0.6, flatShading: true,
      });
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      m.position.set(x, h / 2, z);
      m.rotation.y = this.rand(0, Math.PI);
      this.scene.add(m);
    };

    for (let i = 0; i < 60; i++) {
      const x = this.rand(-this.PLAYGROUND / 2 + 10, this.PLAYGROUND / 2 - 10);
      const z = this.rand(-180, 30);
      if (isNearSection(x, z)) continue;
      if (Math.abs(x) < 6 && z > -160 && z < 20) continue;
      const r = Math.random();
      if (r < 0.45) makeTree(x, z);
      else if (r < 0.75) makeBlock(x, z);
      else makeCone(x, z);
    }

    // Hills
    const hillMat = new THREE.MeshStandardMaterial({ color: 0xa8c5a0, roughness: 1, flatShading: true });
    for (let i = 0; i < 18; i++) {
      const angle = (i / 18) * Math.PI * 2;
      const dist = 160 + Math.random() * 30;
      const h = 8 + Math.random() * 14;
      const hill = new THREE.Mesh(new THREE.ConeGeometry(this.rand(8, 16), h, 6), hillMat);
      hill.position.set(Math.cos(angle) * dist, h / 2, -90 + Math.sin(angle) * dist);
      this.scene.add(hill);
    }
  }

  private makeSignTexture(section: any, index: number): THREE.CanvasTexture {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 768;
    const ctx = c.getContext('2d')!;

    ctx.fillStyle = section.color;
    ctx.fillRect(0, 0, 512, 280);
    ctx.fillStyle = '#fdfdfa';
    ctx.fillRect(0, 280, 512, 488);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`STATION ${String(index + 1).padStart(2, '0')}`, 256, 60);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 90px sans-serif';
    ctx.fillText('✦', 256, 180);

    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 44px sans-serif';
    const title = section.title.length > 18 ? section.title.slice(0, 16) + '…' : section.title;
    ctx.fillText(title, 256, 360);

    ctx.fillStyle = '#5a5a5a';
    ctx.font = '24px sans-serif';
    if (section.subtitle) {
      const words = section.subtitle.split(' ');
      let line = '';
      let y = 410;
      for (const w of words) {
        const test = line + w + ' ';
        if (ctx.measureText(test).width > 460 && line) {
          ctx.fillText(line.trim(), 256, y);
          line = w + ' '; y += 30;
        } else {
          line = test;
        }
      }
      if (line) ctx.fillText(line.trim(), 256, y);
    }

    ctx.fillStyle = section.color;
    ctx.fillRect(180, 580, 152, 4);

    ctx.fillStyle = section.color;
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText('Press [ E ]', 256, 660);
    ctx.fillStyle = '#1a1a1a';
    ctx.font = '20px sans-serif';
    ctx.fillText('to read more', 256, 700);

    const tex = new THREE.CanvasTexture(c);
    tex.minFilter = THREE.LinearFilter;
    return tex;
  }

  private buildSigns() {
    SECTIONS.forEach((section, i) => {
      const group = new THREE.Group();
      group.position.set(section.x, 0, section.z);

      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(2.2, 2.5, 0.4, 16),
        new THREE.MeshStandardMaterial({ color: 0xd9cdb1, roughness: 1 })
      );
      base.position.y = 0.2;
      group.add(base);

      const postMat = new THREE.MeshStandardMaterial({ color: 0x3a3633, roughness: 0.7 });
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.4, 5, 0.4), postMat);
      post.position.y = 2.7;
      group.add(post);

      const panel = new THREE.Mesh(
        new THREE.PlaneGeometry(4, 6),
        new THREE.MeshBasicMaterial({ map: this.makeSignTexture(section, i), side: THREE.DoubleSide })
      );
      panel.position.y = 6.2;
      group.add(panel);

      const back = panel.clone();
      back.rotation.y = Math.PI;
      back.position.z = -0.02;
      group.add(back);

      const halo = new THREE.PointLight(new THREE.Color(section.color), 1.2, 14);
      halo.position.set(0, 6, 0);
      group.add(halo);

      group.userData = { section, halo, basePos: new THREE.Vector3(section.x, 0, section.z) };
      this.signs.push(group);
      this.scene.add(group);
    });
  }

  private buildCar() {
    this.car = new THREE.Group();
    const CAR_BODY_COLOR = 0xffba08;

    const chassis = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.4, 4),
      new THREE.MeshStandardMaterial({ color: 0xe09800, metalness: 0.4, roughness: 0.5 })
    );
    chassis.position.y = 0.5;
    this.car.add(chassis);

    const body = new THREE.Mesh(
      new THREE.BoxGeometry(2, 0.7, 3.6),
      new THREE.MeshStandardMaterial({ color: CAR_BODY_COLOR, metalness: 0.4, roughness: 0.4, flatShading: true })
    );
    body.position.y = 1.05;
    this.car.add(body);

    const hood = new THREE.Mesh(
      new THREE.BoxGeometry(1.7, 0.4, 1),
      new THREE.MeshStandardMaterial({ color: CAR_BODY_COLOR, metalness: 0.4, roughness: 0.4 })
    );
    hood.position.set(0, 0.85, -1.8);
    this.car.add(hood);

    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(1.7, 0.7, 1.7),
      new THREE.MeshStandardMaterial({ color: 0x222428, metalness: 0.6, roughness: 0.2 })
    );
    cabin.position.set(0, 1.7, 0.1);
    this.car.add(cabin);

    [[-0.6, 0.6], [0.6, 0.6]].forEach(([x, z]) => {
      const r = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.1, 1.7),
        new THREE.MeshStandardMaterial({ color: 0x111111 })
      );
      r.position.set(x, 2.1, z);
      this.car.add(r);
    });

    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.7 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.7 });
    const wheelGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.4, 18);

    [[-1.15, -1.4], [1.15, -1.4], [-1.15, 1.4], [1.15, 1.4]].forEach(([x, z]) => {
      const wheelGroup = new THREE.Group();
      const tire = new THREE.Mesh(wheelGeo, wheelMat);
      tire.rotation.z = Math.PI / 2;
      wheelGroup.add(tire);
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.42, 6), rimMat);
      rim.rotation.z = Math.PI / 2;
      wheelGroup.add(rim);
      wheelGroup.position.set(x, 0.5, z);
      this.car.add(wheelGroup);
      this.wheels.push(wheelGroup);
    });

    const headlightMat = new THREE.MeshBasicMaterial({ color: 0xffeebb });
    [[-0.55, -2.01], [0.55, -2.01]].forEach(([x, z]) => {
      const disc = new THREE.Mesh(new THREE.CircleGeometry(0.18, 16), headlightMat);
      disc.position.set(x, 1, z);
      disc.rotation.y = Math.PI;
      this.car.add(disc);
    });

    const tailMat = new THREE.MeshBasicMaterial({ color: 0xff3344 });
    [[-0.55, 1.81], [0.55, 1.81]].forEach(([x, z]) => {
      const disc = new THREE.Mesh(new THREE.CircleGeometry(0.16, 12), tailMat);
      disc.position.set(x, 1, z);
      this.car.add(disc);
    });

    this.scene.add(this.car);
  }

  private openPanel(section: any) {
    this.panelOpen = true;
    this.cb.onPanelOpen(section);
  }

  closePanel() {
    this.panelOpen = false;
    this.cb.onPanelClose();
  }

  toggleAutoTour() {
    this.autoMode = !this.autoMode;
    if (this.autoMode) {
      this.resetCar();
      this.autoState = 1;
      this.autoWpIdx = 0;
      this.closePanel();
    } else {
      this.autoState = 0;
      this.closePanel();
    }
    this.cb.onAutoModeChange(this.autoMode);
  }

  resetCar() {
    this.car.position.set(0, 0, 0);
    this.velocity = 0;
    this.heading = 0;
    this.car.rotation.set(0, 0, 0);
  }

  private onMouseMove(e: MouseEvent) {
    this.mouseNX = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouseNY = (e.clientY / window.innerHeight) * 2 - 1;
  }

  private onKeyDown(e: KeyboardEvent) {
    if (document.activeElement && ['INPUT', 'TEXTAREA'].includes((document.activeElement as HTMLElement).tagName)) return;

    const k = e.key.toLowerCase();
    this.keys[k] = true;

    const DRIVE_KEYS = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'];
    if (this.autoMode && DRIVE_KEYS.includes(k)) {
      this.autoMode = false;
      this.autoState = 0;
      this.closePanel();
      this.cb.onAutoModeChange(false);
    }

    if (e.key === 'Escape') this.closePanel();
    if (k === 'e') {
      if (this.panelOpen) this.closePanel();
      else if (this.nearSign) this.openPanel(this.nearSign.userData['section']);
    }
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
  }

  private onKeyUp(e: KeyboardEvent) {
    this.keys[e.key.toLowerCase()] = false;
  }

  private onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private update() {
    this.frame++;

    // Manual drive
    if (!this.autoMode) {
      if (!this.panelOpen) {
        if (this.keys['w'] || this.keys['arrowup']) {
          this.velocity = Math.min(this.velocity + this.ACCEL, this.MAX_SPEED);
        } else if (this.keys['s'] || this.keys['arrowdown']) {
          if (this.velocity > 0) this.velocity = Math.max(this.velocity - this.BRAKE, 0);
          else this.velocity = Math.max(this.velocity - this.ACCEL * 0.7, -this.REV_SPEED);
        } else {
          this.velocity *= (1 - this.FRICTION);
          if (Math.abs(this.velocity) < 0.0008) this.velocity = 0;
        }

        const steerInput = (this.keys['a'] || this.keys['arrowleft'] ? 1 : 0) - (this.keys['d'] || this.keys['arrowright'] ? 1 : 0);
        const speedFactor = Math.min(Math.abs(this.velocity) / this.MAX_SPEED, 1);
        const dir = this.velocity >= 0 ? 1 : -1;
        this.heading += steerInput * this.STEER_RATE * (0.25 + 0.75 * speedFactor) * dir;

        this.car.position.x += Math.sin(this.heading) * this.velocity;
        this.car.position.z += -Math.cos(this.heading) * this.velocity;

        const distFromCenter = Math.hypot(this.car.position.x, this.car.position.z + 90);
        if (distFromCenter > this.PLAYGROUND_RADIUS) {
          const angle = Math.atan2(this.car.position.x, -(this.car.position.z + 90));
          this.car.position.x = Math.sin(angle) * this.PLAYGROUND_RADIUS;
          this.car.position.z = -Math.cos(angle) * this.PLAYGROUND_RADIUS - 90;
          this.velocity *= 0.5;
        }

        this.car.rotation.y = this.heading;
        this.car.rotation.z = THREE.MathUtils.lerp(this.car.rotation.z, steerInput * 0.04 * speedFactor, 0.15);
      } else {
        this.car.rotation.z = THREE.MathUtils.lerp(this.car.rotation.z, 0, 0.1);
      }
    }

    // Auto tour
    if (this.autoMode) {
      if (this.autoState === 1) { // AUTO_DRIVING
        const target = SECTIONS[this.autoWpIdx];
        const dx = target.x - this.car.position.x;
        const dz = target.z - this.car.position.z;
        const dist = Math.hypot(dx, dz);

        let desired = Math.atan2(dx, -dz);
        let diff = desired - this.heading;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        this.heading += diff * 0.045;

        const brakeDist = 14;
        if (dist > brakeDist) {
          this.velocity = Math.min(this.velocity + this.ACCEL * 1.8, this.AUTO_SPEED);
        } else {
          this.velocity = Math.max(this.velocity - this.BRAKE * 1.4, 0.01);
        }

        if (dist <= this.AUTO_ARRIVE) {
          this.velocity = 0;
          this.car.rotation.y = this.heading;
          this.autoState = 2; // AUTO_READING
          this.autoReadFrames = 0;
          this.openPanel(SECTIONS[this.autoWpIdx]);
        } else {
          this.car.position.x += Math.sin(this.heading) * this.velocity;
          this.car.position.z += -Math.cos(this.heading) * this.velocity;
          this.car.rotation.y = this.heading;
          this.car.rotation.z = THREE.MathUtils.lerp(this.car.rotation.z, diff * 0.06, 0.12);
        }
      }

      if (this.autoState === 2) { // AUTO_READING
        this.autoReadFrames++;
        if (this.autoReadFrames >= this.AUTO_READ_DUR) {
          this.closePanel();
          this.autoWpIdx++;
          if (this.autoWpIdx >= SECTIONS.length) {
            this.autoMode = false;
            this.autoState = 0;
            this.cb.onAutoModeChange(false);
          } else {
            this.autoState = 1;
          }
        }
      }
    }

    // Wheel spin
    this.wheels.forEach(w => { w.rotation.x -= this.velocity * 0.5; });

    // Camera
    const yawOffset = this.panelOpen ? 0 : this.mouseNX * 0.65;
    const pitchOffset = this.panelOpen ? 0 : this.mouseNY * 2.0;

    const camYaw = this.heading + yawOffset;
    const camDist = 11;
    const camTX = this.car.position.x - Math.sin(camYaw) * camDist;
    const camTZ = this.car.position.z + Math.cos(camYaw) * camDist;
    const camTY = Math.max(2, 5 - pitchOffset);

    this.camera.position.x += (camTX - this.camera.position.x) * 0.06;
    this.camera.position.y += (camTY - this.camera.position.y) * 0.06;
    this.camera.position.z += (camTZ - this.camera.position.z) * 0.06;

    this.camera.lookAt(
      this.car.position.x + Math.sin(this.heading) * 2,
      this.car.position.y + 1.5,
      this.car.position.z - Math.cos(this.heading) * 2
    );

    // Proximity check
    let near: THREE.Group | null = null;
    let nearestDist = Infinity;
    for (const s of this.signs) {
      const d = Math.hypot(s.userData['basePos'].x - this.car.position.x, s.userData['basePos'].z - this.car.position.z);
      if (d < 7 && d < nearestDist) { near = s; nearestDist = d; }
    }
    this.nearSign = near;

    // Halo pulse
    for (const s of this.signs) {
      const t = (s === this.nearSign) ? 2.5 + Math.sin(this.frame * 0.12) * 0.8 : 1.1;
      s.userData['halo'].intensity += (t - s.userData['halo'].intensity) * 0.1;
    }

    // HUD updates via callbacks
    this.cb.onSpeedUpdate(Math.round(Math.abs(this.velocity) * 220));
    this.cb.onDistUpdate(Math.round(Math.hypot(this.car.position.x, this.car.position.z)));

    if (this.nearSign) {
      this.cb.onSectionUpdate(this.nearSign.userData['section'].title, this.nearSign.userData['section'].color);
      this.cb.onHintUpdate(this.panelOpen ? 'Press [Esc] or [E] to close' : 'Press [E] to open');
    } else {
      this.cb.onSectionUpdate('— Drive around · find signposts —', '#1a1a1a');
      this.cb.onHintUpdate('');
    }

    this.renderer.render(this.scene, this.camera);
    this.rafId = requestAnimationFrame(this.update.bind(this));
  }

  destroy() {
    cancelAnimationFrame(this.rafId);
    window.removeEventListener('mousemove', this.boundMouseMove);
    window.removeEventListener('keydown', this.boundKeyDown);
    window.removeEventListener('keyup', this.boundKeyUp);
    window.removeEventListener('resize', this.boundResize);
    this.renderer.dispose();
  }
}
