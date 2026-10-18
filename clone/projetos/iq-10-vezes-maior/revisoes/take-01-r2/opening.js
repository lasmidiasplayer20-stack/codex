/* Editable 3D reconstruction of source frames 0–121.
   Background and subject measurements drive a two-depth dolly, independently
   of the character rig. No source video pixels are used as textures. */
window.Opening = {
  create(data, { width = 1280 } = {}) {
    const T = THREE,
      V = (x = 0, y = 0, z = 0) => new T.Vector3(x, y, z),
      pi = Math.PI,
      clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)),
      smooth = (a, b, t) => {
        const u = clamp((t - a) / (b - a));
        return u * u * (3 - 2 * u);
      },
      mix = (a, b, u) => a + (b - a) * u;
    const height = (width * 9) / 16,
      renderer = new T.WebGLRenderer({
        antialias: true,
        alpha: false,
        preserveDrawingBuffer: true,
      });
    renderer.setSize(width, height);
    renderer.outputEncoding = T.LinearEncoding;
    renderer.setClearColor(0x080b20);
    renderer.domElement.style.display = "none";
    document.body.appendChild(renderer.domElement);
    const output = document.createElement("canvas");
    output.width = width;
    output.height = height;
    document.body.appendChild(output);
    const ctx = output.getContext("2d", { alpha: false });
    const scene = new T.Scene(),
      world = new T.Group();
    scene.add(world);
    const camera = new T.PerspectiveCamera(20.4079, 16 / 9, 0.1, 100);
    camera.position.set(0, 0, 10);
    scene.add(new T.AmbientLight(0x9a9dd4, 0.4));
    const key = new T.DirectionalLight(0xffe9bd, 0.65);
    key.position.set(-3, 6, 8);
    scene.add(key);
    const rim = new T.DirectionalLight(0x7bc9ff, 0.45);
    rim.position.set(3, 2, -5);
    scene.add(rim);
    const gradient = new T.DataTexture(
      new Uint8Array([95, 165, 230, 255]),
      4,
      1,
      T.LuminanceFormat,
    );
    gradient.minFilter = gradient.magFilter = T.NearestFilter;
    gradient.needsUpdate = true;
    const mats = new Map();
    function material(col) {
      if (!mats.has(col))
        mats.set(
          col,
          new T.MeshToonMaterial({ color: col, gradientMap: gradient }),
        );
      return mats.get(col);
    }
    const ink = new T.MeshBasicMaterial({ color: 0x211d31, side: T.BackSide });
    function mesh(geo, col, parent = world, outline = false) {
      const m = new T.Mesh(geo, material(col));
      parent.add(m);
      if (outline) {
        const o = new T.Mesh(geo, ink);
        o.scale.setScalar(1.035);
        m.add(o);
      }
      return m;
    }
    function sphere(p, size, col, parent = world, outline = false) {
      const o = mesh(new T.SphereGeometry(1, 28, 20), col, parent, outline);
      o.position.copy(p);
      o.scale.copy(size);
      return o;
    }
    function box(p, size, col, parent = world) {
      const o = mesh(new T.BoxGeometry(1, 1, 1), col, parent);
      o.position.copy(p);
      o.scale.copy(size);
      return o;
    }
    function glowMat(col, alpha = 1) {
      return new T.MeshBasicMaterial({
        color: col,
        transparent: true,
        opacity: alpha,
        depthWrite: false,
        blending: T.AdditiveBlending,
      });
    }
    function line(
      points,
      col = 0x65c9f4,
      r = 0.006,
      alpha = 0.7,
      parent = world,
    ) {
      const curve = new T.CatmullRomCurve3(points),
        geo = new T.TubeGeometry(
          curve,
          Math.max(16, points.length * 8),
          r,
          5,
          false,
        ),
        o = new T.Mesh(geo, glowMat(col, alpha));
      parent.add(o);
      o.userData.alpha = alpha;
      return o;
    }
    const bg = new T.Group();
    world.add(bg);
    const B = (x, y, z = -7) => V((x - 320) * 0.017, (180 - y) * 0.017, z);
    const wall = new T.Mesh(
      new T.PlaneGeometry(20, 12),
      new T.ShaderMaterial({
        vertexShader:
          "varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
        fragmentShader:
          "varying vec2 v;void main(){vec3 a=vec3(.018,.025,.075);float p=exp(-length((v-vec2(.50,.35))*vec2(3.,7.)));vec3 c=a+vec3(.11,.025,.22)*p;float g=sin(v.y*400.)*.002;gl_FragColor=vec4(c+g,1.);}",
      }),
    );
    wall.position.set(0, 0, -7.4);
    bg.add(wall);
    for (const x of [45, 600]) {
      const o = new T.Mesh(
        new T.BoxGeometry(0.028, 10, 0.02),
        glowMat(x < 320 ? 0x4dcbff : 0xa774ee, 0.55),
      );
      o.position.copy(B(x, 180));
      bg.add(o);
      box(B(x - 9, 180), V(0.045, 10, 0.04), 0x10182d, bg);
    }
    const center = B(320, 132, -6.95);
    for (let ring = 0; ring < 4; ring++) {
      const radius = (140 + ring * 7) * 0.017;
      for (let i = 0; i < 36; i++) {
        if ((i + ring) % 4 === 0) continue;
        const a = (i / 36) * pi * 2,
          b = ((i + 0.65) / 36) * pi * 2;
        line(
          [
            V(
              center.x + radius * Math.cos(a),
              center.y + radius * Math.sin(a),
              center.z,
            ),
            V(
              center.x + radius * Math.cos((a + b) / 2),
              center.y + radius * Math.sin((a + b) / 2),
              center.z,
            ),
            V(
              center.x + radius * Math.cos(b),
              center.y + radius * Math.sin(b),
              center.z,
            ),
          ],
          ring % 2 ? 0x548cc7 : 0x67bedb,
          0.004,
          ring === 2 ? 0.85 : 0.4,
          bg,
        );
      }
    }
    function panel(x, y, w, h, type) {
      const g = new T.Group();
      bg.add(g);
      const p = B(x + w / 2, y + h / 2, -6.85);
      box(p, V(w * 0.017, h * 0.017, 0.014), 0x111e34, g);
      const border = new T.Line(
        new T.BufferGeometry().setFromPoints(
          [
            [x, y],
            [x + w, y],
            [x + w, y + h],
            [x, y + h],
            [x, y],
          ].map((p) => B(...p, -6.82)),
        ),
        new T.LineBasicMaterial({
          color: 0x7caeca,
          transparent: true,
          opacity: 0.65,
        }),
      );
      g.add(border);
      if (type === "wave") {
        const pts = [];
        for (let j = 0; j < 45; j++)
          pts.push(
            B(
              x + 7 + (j * (w - 14)) / 44,
              y + h * 0.5 + Math.sin(j * 0.23) * 8 + Math.sin(j * 0.53) * 2,
              -6.8,
            ),
          );
        line(pts, 0x9dd9e2, 0.007, 0.65, g);
      } else
        for (let j = 0; j < 10; j++) {
          const z = new T.Mesh(
            new T.BoxGeometry(0.065, 0.017 * (12 + ((j * 7) % 25)), 0.018),
            glowMat(0x9c8be5, 0.65),
          );
          z.position.copy(
            B(x + 10 + j * 7, y + h - 8 - (12 + ((j * 7) % 25)) / 2, -6.8),
          );
          g.add(z);
        }
    }
    panel(109, 50, 80, 49, "wave");
    panel(451, 40, 87, 59, "bar");
    const floor = mesh(new T.PlaneGeometry(40, 40), 0x0b1528);
    floor.rotation.x = -pi / 2 - Math.atan(0.074);
    floor.material = new T.MeshBasicMaterial({ color: 0x071326 });
    floor.position.y = -1.7;
    for (let i = 0; i < 4; i++) {
      const o = new T.Mesh(
        new T.TorusGeometry(1.02 + i * 0.07, 0.005, 5, 128),
        glowMat(0x61bce4, 0.22 + i * 0.05),
      );
      o.rotation.x = pi / 2;
      o.position.set(0, -1.685, 0);
      world.add(o);
    }
    const shadow = new T.Mesh(
      new T.CircleGeometry(0.24, 48),
      new T.MeshBasicMaterial({
        color: 0x020511,
        transparent: true,
        opacity: 0.65,
        depthWrite: false,
      }),
    );
    shadow.rotation.x = -pi / 2;
    shadow.scale.y = 0.5;
    shadow.position.set(0.1, -1.686, 0.03);
    world.add(shadow);
    let seed = 39;
    const rnd = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    const stars = [];
    for (let i = 0; i < 110; i++) {
      const p = B(30 + rnd() * 580, 20 + rnd() * 285, -6 + rnd() * 1.5);
      const o = sphere(p, V(0.008, 0.008, 0.008), 0xa8bfd5, bg);
      o.material = glowMat(0xa9c4e1, 0.12 + rnd() * 0.22);
      stars.push(o);
    }
    // Static, editable hologram mesh: outline, lobes, graph edges, and luminous nodes.
    const brain = new T.Group();
    bg.add(brain);
    const outlinePoints = data.outline.map((p) => B(p[0], p[1], -6.6));
    outlinePoints.push(outlinePoints[0].clone());
    const brainCurve = new T.CatmullRomCurve3(outlinePoints);
    const brainGeo = new T.TubeGeometry(brainCurve, 240, 0.008, 7, false),
      brainLine = new T.Mesh(brainGeo, glowMat(0xa9edff, 0.95));
    brain.add(brainLine);
    const halo = new T.Mesh(
      new T.TubeGeometry(brainCurve, 240, 0.028, 6, false),
      glowMat(0x55bfff, 0.55),
    );
    brain.add(halo);
    const nodeObjects = [],
      nodeClouds = [];
    const spriteCanvas = document.createElement("canvas");
    spriteCanvas.width = spriteCanvas.height = 64;
    const sx = spriteCanvas.getContext("2d"),
      sg = sx.createRadialGradient(32, 32, 0, 32, 32, 32);
    sg.addColorStop(0, "#ffffff");
    sg.addColorStop(0.15, "#d9faff");
    sg.addColorStop(0.35, "rgba(102,207,255,.45)");
    sg.addColorStop(1, "rgba(70,160,255,0)");
    sx.fillStyle = sg;
    sx.fillRect(0, 0, 64, 64);
    const spriteTex = new T.CanvasTexture(spriteCanvas);
    const positions = data.nodes.map((n) =>
      B(n.p[0], n.p[1], -6.5 + rnd() * 0.12),
    );
    for (let i = 0; i < positions.length; i++) {
      const sm = new T.SpriteMaterial({
        map: spriteTex,
        transparent: true,
        blending: T.AdditiveBlending,
        depthWrite: false,
        opacity: 0,
      });
      const s = new T.Sprite(sm);
      s.position.copy(positions[i]);
      s.scale.setScalar(0.1 + rnd() * 0.05);
      brain.add(s);
      nodeObjects.push(s);
      const cloud = new T.Sprite(
        new T.SpriteMaterial({
          map: spriteTex,
          color: 0x70cfff,
          transparent: true,
          blending: T.AdditiveBlending,
          depthWrite: false,
          opacity: 0,
        }),
      );
      cloud.position.copy(positions[i]).add(V(0, 0, -0.03));
      cloud.scale.setScalar(0.38 + rnd() * 0.15);
      brain.add(cloud);
      nodeClouds.push(cloud);
      const nearest = positions
        .map((p, j) => [j, p.distanceTo(positions[i])])
        .filter((q) => q[0] < i && q[1] < 1.1)
        .sort((a, b) => a[1] - b[1])
        .slice(0, 2);
      for (const [j] of nearest)
        line([positions[j], positions[i]], 0x82dbf3, 0.003, 0.27, brain);
    }
    const obs88 = data.rows[88].background;
    function from88(p) {
      const [a, b, tx, c, d, ty] = obs88,
        det = a * d - b * c;
      return B(
        (d * (p[0] - tx) - b * (p[1] - ty)) / det,
        (-c * (p[0] - tx) + a * (p[1] - ty)) / det,
        -6.55,
      );
    }
    for (const path of [
      [
        [155, 226],
        [202, 203],
        [265, 209],
        [314, 191],
        [370, 199],
        [449, 181],
        [480, 165],
      ],
      [
        [161, 180],
        [207, 160],
        [264, 154],
        [308, 123],
        [370, 126],
        [414, 100],
        [429, 78],
      ],
      [
        [194, 97],
        [239, 88],
        [272, 110],
        [315, 93],
        [354, 75],
        [382, 67],
      ],
      [
        [213, 249],
        [247, 236],
        [302, 230],
        [344, 216],
        [393, 223],
        [450, 211],
      ],
    ]) {
      line(path.map(from88), 0x79d8ff, 0.009, 0.46, brain);
      line(path.map(from88), 0x318bff, 0.024, 0.08, brain);
    }
    const volume = new T.Sprite(
      new T.SpriteMaterial({
        map: spriteTex,
        color: 0x205fff,
        transparent: true,
        blending: T.AdditiveBlending,
        depthWrite: false,
        opacity: 0,
      }),
    );
    volume.position.copy(B(325, 139, -6.7));
    volume.scale.set(5, 3.3, 1);
    brain.add(volume);
    // Character construction: rounded coat, fixed-length two-bone limbs, independent face.
    const hero = new T.Group();
    world.add(hero);
    const headRadius = data.rows[0].head[2] / 100,
      head = sphere(V(), V(headRadius, headRadius, headRadius), 0x151722, hero);
    head.material = new T.MeshStandardMaterial({
      color: 0x1b1a23,
      roughness: 0.9,
      metalness: 0,
    });
    const eyes = [0, 1].map(() =>
      sphere(V(), V(0.025, 0.05, 0.008), 0xfff9e8, hero),
    );
    for (const e of eyes)
      e.material = new T.MeshBasicMaterial({ color: 0xfff9e8 });
    const mouth = sphere(V(), V(0.016, 0.008, 0.006), 0xfff9e8, hero);
    mouth.material = new T.MeshBasicMaterial({ color: 0xfff9e8 });
    function coatGeometry() {
      const sh = new T.Shape();
      sh.moveTo(-0.08, 0.04);
      sh.quadraticCurveTo(0.03, 0.08, 0.1, 0.02);
      sh.quadraticCurveTo(0.16, -0.02, 0.16, -0.16);
      sh.lineTo(0.14, -0.91);
      sh.quadraticCurveTo(0.015, -0.94, -0.09, -0.9);
      sh.lineTo(-0.16, -0.71);
      sh.quadraticCurveTo(-0.16, -0.4, -0.09, -0.16);
      sh.closePath();
      const g = new T.ExtrudeGeometry(sh, {
        depth: 0.11,
        bevelEnabled: true,
        bevelThickness: 0.025,
        bevelSize: 0.025,
        bevelSegments: 3,
        steps: 1,
        curveSegments: 18,
      });
      g.translate(0, 0, -0.055);
      return g;
    }
    const torso = mesh(coatGeometry(), 0xf4ca23, hero, true);
    const hood = sphere(V(), V(0.11, 0.14, 0.09), 0xe3b319, hero);
    const neck = sphere(V(), V(0.035, 0.09, 0.035), 0x1b1b25, hero);
    const details = new T.Group();
    hero.add(details);
    line(
      [
        V(0.07, -0.03, 0.09),
        V(0.075, -0.18, 0.1),
        V(0.072, -0.45, 0.1),
        V(0.065, -0.87, 0.09),
      ],
      0xffdf68,
      0.006,
      0.5,
      details,
    );
    line(
      [
        V(0.06, -0.58, 0.095),
        V(0.145, -0.59, 0.1),
        V(0.14, -0.8, 0.1),
        V(0.045, -0.79, 0.1),
        V(0.06, -0.58, 0.095),
      ],
      0xe1ab23,
      0.005,
      0.65,
      details,
    );
    for (const x of [0.02, 0.07])
      line(
        [V(x, -0.07, 0.12), V(x + 0.006, -0.24, 0.12)],
        0xffefb2,
        0.006,
        0.9,
        details,
      );
    const limbGeo = new T.CylinderGeometry(1, 1, 1, 16),
      arms = [],
      legs = [],
      joints = [];
    for (let j = 0; j < 2; j++) {
      arms.push([
        mesh(limbGeo, j ? 0xf3c72a : 0xb98e19, hero, false),
        mesh(limbGeo, j ? 0xf3c72a : 0xb98e19, hero, false),
      ]);
      legs.push([
        mesh(limbGeo, j ? 0x2b2630 : 0x171a24, hero),
        mesh(limbGeo, j ? 0x2b2630 : 0x171a24, hero),
      ]);
      joints.push({
        elbow: sphere(
          V(),
          V(0.044, 0.044, 0.044),
          j ? 0xf3c72a : 0xb98e19,
          hero,
        ),
        knee: sphere(V(), V(0.022, 0.022, 0.022), 0x25212c, hero),
        hand: sphere(V(), V(0.043, 0.043, 0.043), 0x1c1b24, hero),
        shoe: sphere(V(), V(0.19, 0.049, 0.065), j ? 0xf3c72a : 0xb98e19, hero),
      });
    }
    function bone(o, a, b, r) {
      o.position.copy(a).add(b).multiplyScalar(0.5);
      const d = b.clone().sub(a);
      o.quaternion.setFromUnitVectors(V(0, 1, 0), d.clone().normalize());
      o.scale.set(r, d.length(), r);
    }
    function ik(a, target, l1, l2, pole) {
      const delta = target.clone().sub(a),
        raw = delta.length(),
        d = clamp(raw, 0.015, l1 + l2 - 0.001),
        axis = delta.clone().normalize(),
        b = pole.clone().addScaledVector(axis, -pole.dot(axis)).normalize(),
        x = (d * d + l1 * l1 - l2 * l2) / (2 * d),
        h = Math.sqrt(Math.max(0, l1 * l1 - x * x));
      return {
        a: a.clone(),
        m: a.clone().addScaledVector(axis, x).addScaledVector(b, h),
        b: a.clone().addScaledVector(axis, d),
        error: Math.max(0, raw - (l1 + l2)),
      };
    }
    const stats = {
      frames: 0,
      maxReachError: 0,
      maxBoneError: 0,
      maxHeadErrorPx: 0,
      finite: true,
    };
    let lastCamera;
    const arrLerp = (a, b, u) => a.map((v, i) => mix(v, b[i], u));
    function observation(t) {
      const f = clamp(t * 30, 0, 121),
        i = Math.floor(f),
        a = data.rows[i],
        b = data.rows[Math.min(i + 1, 121)],
        u = f - i;
      return {
        head: arrLerp(a.head, b.head, u),
        bg: arrLerp(a.background, b.background, u),
        eyes: a.eyes,
        mouth: a.mouth,
        flash: mix(a.flash, b.flash, u),
        f,
      };
    }
    function wrist(t) {
      const f = t * 30,
        k = data.nearWristKeys;
      let i = 0;
      while (i < k.length - 2 && f > k[i + 1][0]) i++;
      const a = k[i],
        b = k[i + 1],
        u = smooth(a[0], b[0], f);
      return [mix(a[1], b[1], u), mix(a[2], b[2], u)];
    }
    function ray(p, z) {
      const dir = V(p[0] / 320 - 1, 1 - p[1] / 180, 0.5)
        .unproject(camera)
        .sub(camera.position)
        .normalize();
      return camera.position
        .clone()
        .addScaledVector(dir, (z - camera.position.z) / dir.z);
    }
    function frame(t, { draw = true } = {}) {
      t = clamp(t, 0, 121.999 / 30);
      const r = observation(t),
        h = r.head,
        m = r.bg,
        baseR = data.rows[0].head[2],
        sf = h[2] / baseR,
        sb = Math.hypot(m[0], m[3]),
        ratio = sf / sb;
      let dolly = (170 - 170 * ratio) / (10 - 17 * ratio);
      dolly = clamp(dolly, -2, 7);
      const focalScale = (sf * (10 - dolly)) / 10,
        focal = 1000 * focalScale,
        theta = Math.atan2(m[3], m[0]),
        bx = m[0] * 320 + m[1] * 180 + m[2],
        by = m[3] * 320 + m[4] * 180 + m[5];
      camera.position.set(
        (-(bx - 320) * (17 - dolly)) / focal,
        ((by - 180) * (17 - dolly)) / focal,
        10 - dolly,
      );
      camera.quaternion.identity();
      camera.fov = (2 * Math.atan(180 / focal) * 180) / pi;
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld();
      world.rotation.z = -theta;
      world.updateMatrixWorld(true);
      const toLocal = (p) => world.worldToLocal(p),
        H = toLocal(ray([h[0], h[1]], 0.0));
      head.position.copy(H);
      const shoulder = H.clone().add(V(-0.025, -0.285, 0)),
        hip = shoulder.clone().add(V(0.075, -0.92, 0));
      torso.position.copy(shoulder);
      hood.position.copy(shoulder).add(V(-0.065, 0.005, -0.09));
      neck.position.copy(H).add(V(0.005, -0.195, 0));
      details.position.copy(shoulder);
      for (let j = 0; j < 2; j++) {
        const z = j ? 0.09 : -0.06,
          a = shoulder.clone().add(V(j ? -0.015 : 0.04, -0.025, z)),
          target = j
            ? toLocal(ray(wrist(t), z))
            : hip.clone().add(V(0.005, -0.03, z));
        const arm = ik(a, target, 0.51, 0.49, V(-1, -0.1, 0));
        bone(arms[j][0], arm.a, arm.m, 0.042);
        bone(arms[j][1], arm.m, arm.b, 0.038);
        joints[j].elbow.position.copy(arm.m);
        joints[j].hand.position.copy(arm.b);
        const legTop = hip
            .clone()
            .add(V(j ? 0.015 : -0.025, 0, j ? 0.035 : -0.035)),
          foot = V(j ? 0.09 : 0.035, -1.625, j ? 0.035 : -0.045);
        const leg = ik(legTop, foot, 0.5, 0.5, V(1, 0, 0.05));
        bone(legs[j][0], leg.a, leg.m, 0.022);
        bone(legs[j][1], leg.m, leg.b, 0.02);
        joints[j].knee.position.copy(leg.m);
        joints[j].shoe.position.copy(leg.b).add(V(0.035, -0.025, 0.025));
        for (const [ch, l] of [
          [arm, [0.51, 0.49]],
          [leg, [0.5, 0.5]],
        ]) {
          stats.maxReachError = Math.max(stats.maxReachError, ch.error);
          stats.maxBoneError = Math.max(
            stats.maxBoneError,
            Math.abs(ch.a.distanceTo(ch.m) - l[0]),
            Math.abs(ch.m.distanceTo(ch.b) - l[1]),
          );
        }
      }
      // Face samples are expression parameters only; all eye surfaces remain editable meshes.
      for (let j = 0; j < 2; j++) {
        const e = r.eyes[j];
        if (e) {
          const p = toLocal(ray(e.p, 0.202));
          eyes[j].position.copy(p);
          const scale = (10 - dolly - 0.202) / focal;
          eyes[j].scale.set(e.r[0] * scale, e.r[1] * scale, 0.006);
          eyes[j].visible = true;
        } else {
          eyes[j].position.copy(H).add(V(j ? 0.035 : -0.055, 0.015, 0.202));
          eyes[j].scale.set(0.025, 0.009, 0.006);
          eyes[j].visible = t < 3.87;
        }
      }
      if (r.mouth) {
        mouth.visible = true;
        mouth.position.copy(toLocal(ray(r.mouth.p, 0.202)));
        const scale = (10 - dolly - 0.202) / focal;
        mouth.scale.set(r.mouth.r[0] * scale, r.mouth.r[1] * scale, 0.006);
      } else mouth.visible = false;
      brain.visible = t > 1.08;
      volume.material.opacity = 0.42 * smooth(1.2, 2.2, t);
      const trace = smooth(1.08, 1.85, t);
      brainGeo.setDrawRange(
        0,
        Math.round((brainGeo.index.count * trace) / 42) * 42,
      );
      halo.geometry.setDrawRange(
        0,
        Math.round((halo.geometry.index.count * trace) / 36) * 36,
      );
      brain.children.forEach((o) => {
        if (o !== brainLine && o !== halo && o.material && !o.isSprite)
          o.material.opacity =
            (o.userData.alpha ?? 0.27) * smooth(1.45, 2.1, t);
      });
      nodeObjects.forEach((s, i) => {
        const f = Math.min(121, Math.floor(r.f)),
          u = r.f - f,
          a = data.nodes[i].light;
        s.material.opacity =
          mix(a[f], a[Math.min(121, f + 1)], u) * smooth(1.35, 1.7, t);
        nodeClouds[i].material.opacity = s.material.opacity * 0.38;
      });
      world.updateMatrixWorld(true);
      const hp = head.getWorldPosition(V()).project(camera),
        err = Math.hypot((hp.x + 1) * 320 - h[0], (1 - hp.y) * 180 - h[1]);
      stats.maxHeadErrorPx = Math.max(stats.maxHeadErrorPx, err);
      stats.finite &&= [
        ...H.toArray(),
        ...camera.position.toArray(),
        camera.fov,
      ].every(Number.isFinite);
      stats.frames++;
      if (draw) {
        renderer.render(scene, camera);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.drawImage(renderer.domElement, 0, 0);
        ctx.save();
        ctx.scale(width / 640, height / 360);
        const v = ctx.createRadialGradient(320, 170, 90, 320, 170, 370);
        v.addColorStop(0, "rgba(4,5,20,0)");
        v.addColorStop(1, "rgba(4,5,20,.32)");
        ctx.fillStyle = v;
        ctx.fillRect(0, 0, 640, 360);
        let words = [],
          x = 442,
          active = -1;
        if (t >= 0.1 && t < 0.67) {
          words = ["WHAT", "IF", "YOUR"];
          active = t < 0.34 ? 0 : t < 0.44 ? 1 : 2;
        } else if (t >= 0.67 && t < 2) {
          words = ["IQ", "WAS", "10"];
          active = t < 0.96 ? 0 : t < 1.2 ? 1 : 2;
        } else if (t >= 2 && t < 3) {
          words = ["TIMES", "HIGHER?"];
          x = 410;
          active = t < 2.25 ? 0 : 1;
        }
        ctx.font = "900 24px Arial";
        ctx.lineJoin = "round";
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#080913";
        ctx.textBaseline = "alphabetic";
        for (let i = 0; i < words.length; i++) {
          ctx.strokeText(words[i], x, 128);
          ctx.fillStyle = i === active ? "#f8ff00" : "#fffdf1";
          ctx.fillText(words[i], x, 128);
          x += ctx.measureText(words[i] + " ").width;
        }
        if (t > 3.78) {
          const flash = clamp(r.flash * 1.4),
            g = ctx.createRadialGradient(300, 168, 0, 300, 168, 420);
          g.addColorStop(0, `rgba(228,253,255,${flash})`);
          g.addColorStop(0.5, `rgba(205,249,255,${flash * 0.93})`);
          g.addColorStop(1, `rgba(130,214,255,${flash * 0.3})`);
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, 640, 360);
        }
        ctx.restore();
      }
      return { time: t, stats, camera: { dolly, fov: camera.fov } };
    }
    return { canvas: output, frame, stats, scene, camera };
  },
};
