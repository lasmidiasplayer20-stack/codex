/* Independently reconstructed scenes. Supplied video supplies shot references;
   the Cozy ZIP supplies material/lighting direction, not staging or geography. */
(function (root) {
  "use strict";
  const T = root.THREE,
    PI = Math.PI,
    TAU = PI * 2,
    clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)),
    mix = (a, b, u) => a + (b - a) * u,
    ease = (x) => {
      x = clamp(x);
      return x * x * (3 - 2 * x);
    },
    smooth = (t, a, b) => ease((t - a) / (b - a));
  const V = (x = 0, y = 0, z = 0) => new T.Vector3(x, y, z),
    ink = 0x21172e;
  function create(opts = {}) {
    const renderer = new T.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true,
      alpha: false,
    });
    renderer.setSize(opts.width || 1280, opts.height || 720);
    renderer.setPixelRatio(1);
    renderer.outputEncoding = T.LinearEncoding;
    renderer.setClearColor(0x201d38);
    document.body.appendChild(renderer.domElement);
    const compositor = CloneCompositor.create(renderer.domElement);
    const scene = new T.Scene(),
      camera = new T.PerspectiveCamera(38.2, 16 / 9, 0.1, 140);
    camera.position.set(0, 4.5, 13);
    camera.lookAt(0, 4.5, 0);
    scene.add(new T.AmbientLight(0xc6c3ed, 0.8));
    const key = new T.DirectionalLight(0xffe4c4, 1.05);
    key.position.set(-6, 11, 8);
    scene.add(key);
    const fill = new T.DirectionalLight(0x8395dd, 0.3);
    fill.position.set(8, 5, -5);
    scene.add(fill);
    const rampData = new Uint8Array([90, 140, 190, 255]),
      ramp = new T.DataTexture(rampData, 4, 1, T.LuminanceFormat);
    ramp.minFilter = ramp.magFilter = T.NearestFilter;
    ramp.needsUpdate = true;
    const mats = new Map();
    function mat(color, rough = false) {
      const key = color + ":" + rough;
      if (!mats.has(key)) {
        const base = new T.Color(color),
          shadow = base
            .clone()
            .multiplyScalar(0.57)
            .lerp(new T.Color(0x3a3159), 0.2);
        mats.set(
          key,
          new T.ShaderMaterial({
            vertexShader: CloneMaterials.vertex,
            fragmentShader: CloneMaterials.fragment
              .replace("0.58;", color < 0x333333 ? "0.06;" : "0.24;")
              .replace(
                "float spec = step(",
                rough ? "float spec = 0.0 * step(" : "float spec = step(",
              ),
            uniforms: {
              uBaseColor: { value: base },
              uShadowColor: { value: shadow },
              uRimColor: { value: new T.Color(0xf8d78e) },
              uLightDir: { value: V(-18, 28, 20).normalize() },
              uHitFlash: { value: 0 },
              uPatternMode: { value: 0 },
            },
          }),
        );
      }
      return mats.get(key);
    }
    const basicMats = new Map();
    const basic = (color) => {
      if (!basicMats.has(color))
        basicMats.set(color, new T.MeshBasicMaterial({ color }));
      return basicMats.get(color);
    };
    const outline = new T.MeshBasicMaterial({ color: ink, side: T.BackSide });
    const geo = {
      sphere: new T.SphereGeometry(1, 16, 12),
      cylinder: new T.CylinderGeometry(1, 1, 1, 12),
      box: new T.BoxGeometry(1, 1, 1),
    };
    let world = new T.Group();
    scene.add(world);
    let actors = [],
      props = [],
      activeKind = "",
      stats = { frames: 0, finite: true, maxBoneError: 0, maxReachError: 0 };
    function mesh(g, color, parent = world, edge = false) {
      const o = new T.Mesh(
        g,
        edge ? mat(color, g.type === "BoxGeometry") : basic(color),
      );
      parent.add(o);
      if (edge) {
        const h = new T.Mesh(g, outline);
        h.scale.setScalar(1.025);
        o.add(h);
      }
      return o;
    }
    function sphere(p, s, col, parent = world, edge = true) {
      const o = mesh(geo.sphere, col, parent, edge);
      o.position.copy(p);
      o.scale.copy(s);
      return o;
    }
    function box(p, s, col, parent = world, edge = true) {
      const o = mesh(geo.box, col, parent, edge);
      o.position.copy(p);
      o.scale.copy(s);
      return o;
    }
    function segment(a, b, r, col, parent = world, edge = true) {
      const o = mesh(geo.cylinder, col, parent, edge);
      between(o, a, b, r);
      return o;
    }
    function between(o, a, b, r) {
      o.position.copy(a).add(b).multiplyScalar(0.5);
      const d = b.clone().sub(a);
      o.quaternion.setFromUnitVectors(V(0, 1, 0), d.clone().normalize());
      o.scale.set(r, d.length(), r);
    }
    function text(
      txt,
      p,
      w = 3,
      h = 0.7,
      col = "#f5f1e7",
      bg = null,
      parent = world,
      size = 48,
    ) {
      const c = document.createElement("canvas");
      c.width = 1024;
      c.height = Math.max(64, Math.round((1024 * h) / w));
      const x = c.getContext("2d");
      if (bg) {
        x.fillStyle = bg;
        x.fillRect(0, 0, c.width, c.height);
      }
      x.fillStyle = col;
      x.font = `600 ${Math.round(c.height * 0.6)}px Arial`;
      x.textAlign = "center";
      x.textBaseline = "middle";
      x.fillText(txt, c.width / 2, c.height / 2, c.width - 30);
      const tx = new T.CanvasTexture(c);
      tx.encoding = T.LinearEncoding;
      const o = new T.Mesh(
        new T.PlaneGeometry(w, h),
        new T.MeshBasicMaterial({
          map: tx,
          transparent: true,
          depthWrite: false,
        }),
      );
      o.position.copy(p);
      parent.add(o);
      return o;
    }
    function ellipseShadow(x, z, rx = 0.5, rz = 0.23) {
      const m = new T.Mesh(
        new T.CircleGeometry(1, 32),
        new T.MeshBasicMaterial({
          color: 0x21162e,
          transparent: true,
          opacity: 0.22,
          depthWrite: false,
        }),
      );
      m.rotation.x = -PI / 2;
      m.position.set(x, 0.016, z);
      m.scale.set(rx, rz, 1);
      world.add(m);
      return m;
    }
    function ik(a, target, l0, l1, pole = V(0, -1, 0.35)) {
      const delta = target.clone().sub(a),
        raw = delta.length(),
        d = clamp(raw, Math.abs(l0 - l1) + 0.001, l0 + l1 - 0.003),
        axis = delta.clone().normalize();
      let bend = pole.clone().addScaledVector(axis, -pole.dot(axis));
      if (bend.lengthSq() < 1e-5)
        bend = V(1, 0, 0).addScaledVector(axis, -axis.x);
      bend.normalize();
      const along = (l0 * l0 + d * d - l1 * l1) / (2 * d),
        height = Math.sqrt(Math.max(0, l0 * l0 - along * along));
      return {
        a: a.clone(),
        q: a.clone().addScaledVector(axis, along).addScaledVector(bend, height),
        b: a.clone().addScaledVector(axis, d),
        excess: Math.max(0, raw - d),
      };
    }
    function actor({
      x = 0,
      z = 0,
      scale = 1,
      color = 0xf2cb27,
      coat = false,
      facing = 1,
      glasses = false,
    } = {}) {
      const group = new T.Group();
      world.add(group);
      group.position.set(x, 0, z);
      group.scale.setScalar(scale);
      const torsoLength = coat ? 1.3 : 1.65,
        headRadius = coat ? 0.39 : 0.35;
      const dark = coat
          ? 0x738692
          : new T.Color(color).multiplyScalar(0.64).getHex(),
        legs = [[], []],
        arms = [[], []];
      for (let j = 0; j < 2; j++) {
        for (let k = 0; k < 2; k++) {
          legs[j].push(
            mesh(geo.cylinder, j ? 0x302a30 : 0x211b28, group, true),
          );
          arms[j].push(mesh(geo.cylinder, j ? color : dark, group, true));
        }
      }
      const joints = Array.from({ length: 8 }, () =>
        sphere(V(), V(0.105, 0.105, 0.105), color, group, false),
      );
      const torso = box(
          V(0, 2.05, 0),
          V(0.63, torsoLength + 0.05, 0.39),
          color,
          group,
          true,
        ),
        hood = sphere(
          V(0, 2.65, -0.08),
          V(0.34, 0.27, 0.25),
          color,
          group,
          true,
        );
      const head = sphere(
          V(0, 3.13, 0.03),
          V(headRadius, headRadius, headRadius),
          0x171724,
          group,
          true,
        ),
        face = new T.Group();
      head.add(face);
      for (const xx of [-0.16, 0.16])
        sphere(
          V(xx, 0.13, 1.01),
          V(0.072, 0.17, 0.035),
          0xfffaf0,
          face,
          false,
        ).material = new T.MeshBasicMaterial({ color: 0xfffaf0 });
      sphere(V(0.04, -0.14, 1.02), V(0.035, 0.02, 0.02), 0xf7f2e6, face, false);
      if (glasses) {
        for (const xx of [-0.16, 0.16]) {
          const ring = new T.Mesh(
            new T.TorusGeometry(0.15, 0.018, 6, 24),
            basic(0xd9ccb1),
          );
          ring.position.set(xx, 0.13, 1.028);
          face.add(ring);
        }
        segment(
          V(-0.02, 0.13, 1.028),
          V(0.02, 0.13, 1.028),
          0.015,
          0xd9ccb1,
          face,
          false,
        );
      }
      const hands = [
        sphere(V(), V(0.12, 0.12, 0.12), 0x211c29, group, true),
        sphere(V(), V(0.12, 0.12, 0.12), 0x211c29, group, true),
      ];
      const shoes = [
        sphere(V(), V(0.19, 0.11, 0.3), dark, group, true),
        sphere(V(), V(0.19, 0.11, 0.3), color, group, true),
      ];
      if (coat) {
        box(V(0, 1.66, 0.02), V(0.7, 0.6, 0.4), color, group, true);
        text("+", V(0.2, 2.25, 0.222), 0.18, 0.2, "#de5b68", null, group);
      }
      const a = {
        group,
        torso,
        hood,
        head,
        hands,
        shoes,
        arms,
        legs,
        joints,
        face,
        facing,
        scale,
        color,
        headRadius,
        torsoLength,
        isHero: color === 0xf2cb27,
        isCoat: coat,
        shadow: ellipseShadow(x, z, 0.45 * scale, 0.26 * scale),
      };
      a.pose = (t, o = {}) => {
        const faceDirection = o.facing ?? a.facing;
        a.lastOptions = { t, o: { ...o } };
        const contacts = [true, true],
          floor = 0.13,
          pelvis = V(0, o.sit ? 1.02 : 2.01, 0),
          feet = [V(-0.14, floor, -0.13), V(0.14, floor, 0.13)];
        if (o.walk) {
          const travel = o.travel ?? t,
            phase = travel / 1.35;
          for (let j = 0; j < 2; j++) {
            const u = (((phase + j * 0.5) % 1) + 1) % 1;
            contacts[j] = u < 0.62;
            feet[j].x =
              1.35 *
              (u < 0.62
                ? 0.31 - u
                : mix(-0.31, 0.31, ease((u - 0.62) / 0.38))) *
              faceDirection;
            feet[j].y =
              floor +
              (u < 0.62 ? 0 : Math.sin(((u - 0.62) / 0.38) * PI) * 0.23);
          }
        }
        if (o.sit) {
          feet[0].x = 0.66 * faceDirection;
          feet[1].x = 0.81 * faceDirection;
        }
        if (o.pelvisY !== undefined) pelvis.y = o.pelvisY;
        if (o.recline !== undefined) {
          pelvis.set(0, 0, 0);
          feet[0].set(1.77, -0.05, -0.13);
          feet[1].set(1.83, -0.04, 0.13);
        }
        const hips = [
          pelvis.clone().add(V(-0.12, 0, -0.12)),
          pelvis.clone().add(V(0.12, 0, 0.12)),
        ];
        for (let j = 0; j < 2; j++) {
          const dx = feet[j].x - hips[j].x,
            dz = feet[j].z - hips[j].z,
            limit = Math.sqrt(Math.max(0.01, 1.9 ** 2 - dx * dx - dz * dz));
          if (hips[j].y - feet[j].y > limit) {
            const drop = hips[j].y - feet[j].y - limit;
            pelvis.y -= drop;
            for (const h of hips) h.y -= drop;
          }
        }
        const bodyAngle = o.recline ?? null,
          shoulder = pelvis
            .clone()
            .add(
              bodyAngle === null
                ? V(Math.sin(o.lean || 0), torsoLength, 0)
                : V(
                    -Math.cos(bodyAngle) * torsoLength,
                    Math.sin(bodyAngle) * torsoLength,
                    0,
                  ),
            ),
          headPos = shoulder
            .clone()
            .add(
              bodyAngle === null
                ? V(0.03 * faceDirection, 0.5, 0)
                : V(-Math.cos(bodyAngle) * 0.5, Math.sin(bodyAngle) * 0.5, 0),
            );
        const shoulders = [
          shoulder.clone().add(V(-0.23, -0.03, -0.16)),
          shoulder.clone().add(V(0.23, -0.03, 0.16)),
        ];
        let wrists = [
          shoulders[0].clone().add(V(-0.04, -1.45, 0.05)),
          shoulders[1].clone().add(V(0.04, -1.45, 0.08)),
        ];
        if (o.walk) {
          const sw = Math.sin(((o.travel ?? t) / 1.35) * TAU);
          wrists[0].x += sw * 0.23;
          wrists[1].x -= sw * 0.23;
        }
        if (o.phone)
          wrists[1] = shoulder.clone().add(V(0.72 * faceDirection, -0.68, 0.2));
        if (o.think)
          wrists[1] = headPos.clone().add(V(0.5 * faceDirection, -0.15, 0.4));
        if (o.reach)
          wrists[1] = shoulder
            .clone()
            .add(V(0.95 * faceDirection, -0.28, 0.12));
        if (o.write) {
          wrists[0] = shoulder.clone().add(V(0.7 * faceDirection, -0.4, -0.1));
          wrists[1] = shoulder
            .clone()
            .add(V(0.94 * faceDirection, -0.4 + Math.sin(t * 7) * 0.04, 0.16));
        }
        if (o.raise) {
          wrists[1] = shoulder.clone().add(V(0.85 * faceDirection, 0.95, 0.1));
        }
        if (bodyAngle !== null) {
          wrists = [V(-1, 0.55, -0.16), V(-0.35, -0.05, 0.16)];
          if (o.think) wrists[0] = headPos.clone().add(V(0.2, 0.65, -0.16));
        }
        if (o.hands)
          for (let j = 0; j < 2; j++)
            if (o.hands[j]) wrists[j].copy(o.hands[j]);
        const chains = [];
        for (let j = 0; j < 2; j++) {
          const leg = ik(
            hips[j],
            feet[j],
            0.96,
            0.96,
            V(0.8 * faceDirection, 0.05, 0.01),
          );
          const arm = ik(
            shoulders[j],
            wrists[j],
            0.8,
            0.78,
            V(0.1 * faceDirection, -1, 0.3),
          );
          chains.push(leg, arm);
          between(legs[j][0], leg.a, leg.q, 0.075);
          between(legs[j][1], leg.q, leg.b, 0.07);
          between(arms[j][0], arm.a, arm.q, 0.115);
          between(arms[j][1], arm.q, arm.b, 0.105);
          hands[j].position.copy(arm.b);
          shoes[j].position
            .copy(leg.b)
            .add(V(0.05 * faceDirection, -0.01, 0.1));
          for (let k = 0; k < 4; k++) {
            const node = [leg.q, leg.a, arm.q, arm.a][k];
            joints[j * 4 + k].position.copy(node);
            joints[j * 4 + k].material = mat(
              k < 2 ? (j ? 0x302a30 : 0x211b28) : j ? color : dark,
            );
            joints[j * 4 + k].scale.setScalar(k < 2 ? 0.076 : 0.11);
          }
        }
        torso.position.copy(pelvis).lerp(shoulder, 0.49);
        torso.rotation.z =
          bodyAngle === null ? -(o.lean || 0) : PI / 2 - bodyAngle;
        hood.position.copy(shoulder).add(V(0, 0, -0.08));
        head.position.copy(headPos);
        head.rotation.y = faceDirection * 0.2 + Math.sin(t * 1.7) * 0.025;
        for (const c of chains) {
          stats.finite &&= [c.a, c.q, c.b].every((v) =>
            [v.x, v.y, v.z].every(Number.isFinite),
          );
          stats.maxReachError = Math.max(stats.maxReachError, c.excess);
          const lens =
            c === chains[0] || c === chains[2] ? [0.96, 0.96] : [0.8, 0.78];
          stats.maxBoneError = Math.max(
            stats.maxBoneError,
            Math.abs(c.a.distanceTo(c.q) - lens[0]),
            Math.abs(c.q.distanceTo(c.b) - lens[1]),
          );
        }
        a.last = { pelvis, shoulder, head: headPos, chains, feet, contacts };
        return a.last;
      };
      actors.push(a);
      return a;
    }
    function reset(bg = 0x43374e) {
      if (scene.background) scene.background.dispose();
      scene.background = null;
      scene.remove(world);
      world.traverse((o) => {
        if (o.material && o.material.map && o.material.map !== ramp)
          o.material.map.dispose();
      });
      world = new T.Group();
      scene.add(world);
      actors = [];
      props = [];
      renderer.setClearColor(bg);
      camera.position.set(0, 4.5, 13);
      camera.lookAt(0, 4.5, 0);
      camera.fov = 38.2;
      camera.updateProjectionMatrix();
    }
    function room(bg = 0x554456, floor = 0x756068) {
      box(V(0, 4.5, -2.5), V(26, 11, 0.2), bg, world, false);
      box(V(0, -0.12, 0), V(28, 0.2, 17), floor, world, false);
      for (let i = -9; i <= 9; i++)
        box(V(i, 0.004, 0), V(0.018, 0.01, 14), 0x4c434c, world, false);
    }
    function windowPane(x, y = 4, z = -2.35, w = 2.7, h = 4, warm = true) {
      box(V(x, y, z), V(w + 0.2, h + 0.2, 0.12), 0xe9dec4);
      box(
        V(x, y, z + 0.08),
        V(w, h, 0.04),
        warm ? 0xf5cea2 : 0x879bc9,
        world,
        false,
      );
      box(V(x, y, z + 0.12), V(0.045, h, 0.04), 0xf9edd5, world, false);
      box(V(x, y, z + 0.12), V(w, 0.045, 0.04), 0xf9edd5, world, false);
      const treeZ = z + 0.1;
      sphere(
        V(x + 0.2, y - 0.3, treeZ),
        V(0.7, 1.1, 0.03),
        0x87a469,
        world,
        false,
      );
      box(
        V(x + 0.2, y - 0.9, z + 0.16),
        V(0.035, 1.6, 0.035),
        0x69794b,
        world,
        false,
      );
    }
    function desk(x, z = 0, y = 2.15, w = 2.3) {
      box(V(x, y, z), V(w, 0.14, 0.95), 0xc49b67);
      for (const dx of [-w * 0.42, w * 0.42])
        for (const dz of [-0.36, 0.36])
          box(V(x + dx, y / 2, z + dz), V(0.065, y, 0.065), 0x5d5364);
      box(V(x, y + 0.1, z + 0.05), V(0.72, 0.015, 0.4), 0xf9eed4, world, false);
    }
    function chair(x, z = 0) {
      box(V(x, 0.91, z), V(0.72, 0.1, 0.65), 0x7d6367);
      box(V(x, 0.47, z - 0.26), V(0.065, 0.92, 0.065), 0x514757);
      box(V(x, 0.47, z + 0.26), V(0.065, 0.92, 0.065), 0x514757);
      box(V(x - 0.3, 1.4, z), V(0.09, 0.9, 0.65), 0xa3917b);
    }
    function board(label = "Quadratic Equations") {
      box(V(3.8, 4.4, -2.2), V(6.1, 2.8, 0.12), 0xa38364);
      box(V(3.8, 4.4, -2.1), V(5.9, 2.6, 0.08), 0x294f43);
      text(label, V(3.8, 5.35, -2), 5.4, 0.35, "#e8e6c6");
      for (const [i, s] of [
        "∫₀^∞ e^(−x²) dx = √π / 2",
        "2x² − 8x + 6 = 0",
        "x² − 4x + 3 = 0",
        "(x − 1)(x − 3) = 0",
      ].entries())
        text(s, V(3.8, 4.8 - i * 0.45, -1.99), 5.2, 0.36, "#e1e2c4");
    }
    function clock(x, y = 7, z = -2.2) {
      sphere(V(x, y, z), V(0.22, 0.22, 0.04), 0xeee9d8);
      segment(V(x, y, z + 0.06), V(x, y + 0.14, z + 0.06), 0.012, ink);
      segment(V(x, y, z + 0.06), V(x + 0.13, y - 0.05, z + 0.06), 0.014, ink);
    }
    function classroom(exam = false) {
      room(0x645464, 0x8c786f);
      windowPane(-5.6, 4.4, -2.3, 2.4, 4.9);
      windowPane(-1.9, 4.4, -2.3, 2.4, 4.9);
      board(exam ? "FINAL EXAM" : "Quadratic Equations");
      clock(0.3, 7);
      for (const x of [-5, -1.5, 2]) {
        desk(x, 1, 2.15, 2.5);
        chair(x - 1.2, 1);
      }
      desk(-5.5, -1.3, 3.25, 2.4);
    }
    function lab() {
      room(0x19182f, 0x24223c);
      for (let i = -9; i < 10; i += 3) {
        box(V(i, 4.4, -2.25), V(0.025, 8, 0.04), 0x4c6b96);
      }
      for (let i = 0; i < 4; i++) {
        const x = -6 + i * 3.8;
        box(V(x, 6.7, -2.22), V(3.3, 1.85, 0.13), 0x66758b);
        box(V(x, 6.7, -2.12), V(3.15, 1.68, 0.04), 0x152539);
        for (let j = 0; j < 19; j++) {
          const a = V(
              x - 1.4 + j * 0.15,
              6.7 + Math.sin(j * (i === 1 ? 1.2 : 0.6)) * 0.43,
              -2.06,
            ),
            b = V(
              x - 1.25 + j * 0.15,
              6.7 + Math.sin((j + 1) * (i === 1 ? 1.2 : 0.6)) * 0.43,
              -2.06,
            );
          segment(a, b, 0.012, i === 1 ? 0x9ed2ea : 0x6bdbc4, world, false);
        }
      }
      box(V(0, 1.8, -1.6), V(24, 0.2, 1.1), 0x4b4562);
      for (let j = 0; j < 19; j++) {
        box(V(-10 + j * 1.2, 0.85, -1.9), V(1.08, 1.6, 0.5), 0x2a2940);
        if (j % 3 === 0) {
          for (let q = 0; q < 4; q++)
            segment(
              V(-10 + j * 1.2 + q * 0.15, 1.9, -1.4),
              V(-10 + j * 1.2 + q * 0.15, 2.2 + q * 0.12, -1.4),
              0.045,
              [0x8fd0b5, 0xc9a3d3, 0xdaa19b, 0x9fb8df][q],
            );
        }
      }
      for (const x of [-5, 0, 5]) {
        const ring = new T.Mesh(
          new T.TorusGeometry(1, 0.025, 6, 64),
          basic(0x87e4e2),
        );
        ring.rotation.x = -PI / 2;
        ring.position.set(x, 0.03, 0);
        world.add(ring);
        sphere(V(x, 0.09, 0), V(1.1, 0.05, 1.1), 0x3e5966);
      }
    }
    function hospital() {
      room(0x93a8bb, 0x9eacb5);
      windowPane(-5.5, 4.5, -2.25, 2.5, 4.7, false);
      box(V(-2.6, 1.05, 0.1), V(5.9, 0.2, 1.5), 0xd7e8eb);
      box(V(-2.6, 1.24, 0.1), V(5.4, 0.3, 1.35), 0xf4f3ec);
      for (const x of [-5.3, 0.1]) {
        box(V(x, 0.7, 0.1), V(0.16, 1.5, 1.6), 0xb2cbd6);
        for (const z of [-0.65, 0.75])
          sphere(V(x, 0.15, z), V(0.12, 0.12, 0.08), 0x5a6876);
      }
      box(V(-6.4, 1.1, 0.2), V(1.1, 2.2, 1.1), 0xdce2df);
      box(V(-4.6, 5, -2), V(1.8, 1.25, 0.1), 0x234a52);
      text("72  ∿∿", V(-4.6, 5.05, -1.9), 1.6, 0.7, "#81e7b1");
      box(V(-3.5, 4, -2), V(8, 0.16, 0.13), 0xf3f1df);
      clock(5.5, 7);
    }
    function bedRoom() {
      room(0x51405b, 0x61516a);
      windowPane(-1, 4.3, -2.3, 6.8, 5.1, false);
      for (let j = 0; j < 18; j++) {
        const x = -4 + j * 0.39;
        box(
          V(x, 1.6 + ((j * 13) % 7) * 0.1, -2.1),
          V(0.3, 1.2 + ((j * 7) % 4) * 0.2, 0.1),
          0x272943,
          world,
          false,
        );
      }
      box(V(-5.7, 1, 0.4), V(4.1, 0.4, 2), 0x807d9d);
      box(V(-5.7, 1.25, 0.4), V(4.1, 0.2, 2), 0xa3a3bb);
      for (const x of [-7.7, -3.7])
        box(V(x, 0.7, 0.4), V(0.16, 1.6, 2.15), 0x51445d);
      desk(3.5, 0.2, 2.45, 3);
      chair(2.2, 0.2);
      box(V(3.8, 3.6, -0.2), V(1.4, 1.1, 0.13), 0x8a90a2);
      box(V(3.8, 3.6, -0.1), V(1.25, 0.95, 0.04), 0xcfdfdc);
      text("01 02 03 04 05", V(3.8, 3.8, -0.05), 1.2, 0.22, "#668491");
      box(V(6.8, 3.4, -2.25), V(2, 6.6, 0.15), 0xcca77d);
    }
    function sky(top, bottom) {
      const c = document.createElement("canvas");
      c.width = 16;
      c.height = 256;
      const x = c.getContext("2d"),
        g = x.createLinearGradient(0, 0, 0, 256);
      g.addColorStop(0, top);
      g.addColorStop(1, bottom);
      x.fillStyle = g;
      x.fillRect(0, 0, 16, 256);
      scene.background = new T.CanvasTexture(c);
    }
    function campus() {
      sky("#90a8bf", "#f2dfb9");
      box(V(0, -0.12, -8), V(34, 0.2, 40), 0xc1b495, world, false);
      box(V(0, 1.6, -4), V(28, 3.2, 0.4), 0xb96f53);
      for (let j = 0; j < 18; j++)
        box(V(-12 + j * 1.4, 2, -3.75), V(0.48, 1, 0.1), 0x4e5269);
      box(V(-2, 4.2, -3.8), V(1.7, 6, 0.6), 0xc8997e);
      clock(-2, 6.3, -3.4);
      for (const x of [-6, 1.8, 6]) {
        box(V(x, 1.2, -1.8), V(0.09, 2.4, 0.09), 0x736347);
        sphere(V(x, 3, -1.8), V(0.8, 1, 0.6), 0x87ac65);
      }
    }
    function city(interior = false) {
      sky("#896b91", "#f8cba3");
      box(V(0, -0.13, -20), V(14, 0.22, 90), 0x565967, world, false);
      for (let side of [-1, 1]) {
        box(V(side * 7, 0.04, -23), V(3, 0.22, 90), 0xbbaf9f);
        for (let i = 0; i < 12; i++) {
          const z = -i * 5,
            x = side * 10,
            h = 8 + ((i * 7) % 6);
          box(
            V(x, h / 2, z),
            V(6, h, 4.9),
            i % 3 === 0 ? 0xd7bfaf : i % 3 === 1 ? 0xb7b3b7 : 0xd5b7a1,
          );
          box(V(x, 0.2 + h, z), V(6.2, 0.2, 5), 0xe2c9b2);
          for (let y = 2.8; y < h; y += 1.5)
            for (let dx of [-1.7, 0, 1.7]) {
              box(
                V(x + dx, y, z + 2.47),
                V(0.74, 1.05, 0.025),
                0x53566e,
                world,
                false,
              );
              box(
                V(x + dx, y - 0.55, z + 2.5),
                V(0.9, 0.06, 0.04),
                0xe5cbbb,
                world,
                false,
              );
            }
          box(V(x, 1, z + 2.51), V(5.8, 1.9, 0.05), 0x4b4a5e);
          box(
            V(x, 2.15, z + 2.7),
            V(6, 0.26, 0.65),
            i % 2 ? 0xc08b57 : 0x65947d,
          );
          for (let q = -2.7; q < 3; q += 0.6)
            box(
              V(x + q, 2.16, z + 2.75),
              V(0.28, 0.27, 0.7),
              0xe5cd8b,
              world,
              false,
            );
          for(let level=2.8;level<h;level+=1.5)for(const dz of [-1.5,0,1.5]) {
          box(V(side*6.96,level,z+dz),V(.025,.95,.72),0x50566b,world,false);
          box(V(side*6.93,level-.51,z+dz),V(.04,.055,.86),0xe0c9b4,world,false);
        }
        box(V(side*6.9,1.1,z),V(.04,1.8,4.65),0x484b5b,world,false);
        box(V(side*6.6,2.15,z),V(.7,.25,4.95),i%2?0xc28d57:0x759c85);
        for(let q=-2.2;q<2.5;q+=.6)box(V(side*6.6,2.17,z+q),V(.74,.26,.28),0xe7cd92,world,false);
        if (i % 2 === 0) {
            const xx = side * 6.2;
            segment(V(xx, 0.2, z), V(xx, 3.6, z), 0.07, 0x796b5a);
            for (let q = 0; q < 3; q++)
              sphere(
                V(xx + Math.sin(q * 2) * 0.3, 3.8 + q * 0.35, z),
                V(0.8, 1.1, 0.8),
                0x8ba76d,
              );
            segment(
              V(side * 5.8, 0.2, z + 2),
              V(side * 5.8, 4.6, z + 2),
              0.045,
              0x484e5a,
            );
            sphere(V(side * 5.8, 4.65, z + 2), V(0.19, 0.19, 0.19), 0xf3d6a2);
          }
        }
      }
      for (let i = 0; i < 30; i++) {
        box(
          V(-0.13, 0.005, -i * 3),
          V(0.035, 0.01, 2.1),
          0xedc76d,
          world,
          false,
        );
        box(
          V(0.13, 0.005, -i * 3),
          V(0.035, 0.01, 2.1),
          0xedc76d,
          world,
          false,
        );
        for (let side of [-1, 1])
          box(
            V(side * 2.8, 0.006, -i * 3),
            V(0.07, 0.01, 1.2),
            0xe7e5d8,
            world,
            false,
          );
      }
      for (let i = 0; i < 8; i++)
        box(
          V(-4 + i * 1.05, 0.009, 1),
          V(0.56, 0.015, 2.6),
          0xf1e7d8,
          world,
          false,
        );
      const car = new T.Group();
      world.add(car);
      box(V(0, 0.65, 0), V(1.85, 0.65, 3.5), 0x86a7a1, car);
      box(V(0, 1.21, -0.25), V(1.65, 0.6, 1.8), 0x86a7a1, car);
      box(V(0, 1.27, 0.68), V(1.45, 0.46, 0.02), 0x323c4e, car, false);
      for (let x of [-0.82, 0.82]) {
        box(V(x, 1.27, -0.23), V(0.02, 0.4, 1.55), 0x3f4c5a, car, false);
        for (let z of [-1.05, 1.05]) {
          const w = mesh(geo.cylinder, 0x282936, car, true);
          w.position.set(x, 0.39, z);
          w.rotation.z = PI / 2;
          w.scale.set(0.34, 0.16, 0.34);
          sphere(V(x * 1.12, 0.39, z), V(0.025, 0.17, 0.17), 0x83939d, car);
        }
      }
      box(V(0, 0.66, 1.77), V(1.5, 0.22, 0.02), 0x35424e, car);
      for (let x of [-0.65, 0.65])
        box(V(x, 0.84, 1.78), V(0.39, 0.21, 0.03), 0xfff0b6, car, false);
      box(V(0, 0.36, 1.8), V(0.6, 0.12, 0.03), 0xcfd8d5, car, false);
      props.push({ car });
    }
    let brainNodes = [];
    function brain() {
      lab();
      const b = new T.Group();
      world.add(b);
      b.position.set(-0.5, 4.7, -0.6);
      brainNodes = [];
      for (let j = 0; j < 55; j++) {
        const a = j * 2.3999,
          r = 3.25 * Math.sqrt((j + 0.5) / 55),
          p = V(Math.cos(a) * r, Math.sin(a) * r * 0.73, 0.08 * Math.sin(j));
        const n = sphere(p, V(0.04, 0.04, 0.04), 0xc8f9ff, b, false);
        brainNodes.push(n);
        if (j > 1) {
          const neighbours = brainNodes
            .slice(0, -1)
            .map((n) => n.position)
            .sort((a, c) => a.distanceTo(p) - c.distanceTo(p))
            .slice(0, 2);
          for (const prev of neighbours)
            if (prev.distanceTo(p) < 1.6)
              segment(prev, p, 0.009, 0x73d5ff, b, false);
        }
      }
      const contour = [
        [-2.8, -0.7],
        [-3, -0.1],
        [-2.8, 0.9],
        [-2.1, 1.6],
        [-1, 1.9],
        [0.5, 1.8],
        [1.9, 1.5],
        [2.8, 0.9],
        [3, -0.2],
        [2.7, -1.1],
        [1.7, -1.3],
        [0.6, -1.25],
        [0, -1.8],
        [-0.5, -1.6],
        [-0.7, -1.1],
        [-1.8, -1.1],
      ].map((q) => V(q[0], q[1], 0.15));
      const path = new T.CatmullRomCurve3(contour, true);
      const brainOutline = new T.Mesh(
        new T.TubeGeometry(path, 100, 0.025, 5, true),
        basic(0x97e8ff),
      );
      b.add(brainOutline);
      const ring = new T.Mesh(
        new T.TorusGeometry(3.5, 0.02, 5, 70),
        new T.MeshBasicMaterial({ color: 0x7de4ff }),
      );
      ring.scale.y = 0.78;
      b.add(ring);
      props.push({ brain: b });
    }
    function homeEntrance() {
      room(0x8a746e, 0x7d6359);
      box(V(-3.4, 3.3, -2.2), V(3.4, 6.6, 0.18), 0xe6c7a1);
      box(V(-3.4, 3.3, -2.08), V(3, 6.3, 0.05), 0x292a4b);
      box(V(-3.7, 3.3, -1.95), V(0.15, 6.1, 0.2), 0x875f51);
      box(V(-5.8, 0.7, -1.7), V(2.6, 1.4, 0.8), 0x6c5251);
      box(V(-5.8, 1.45, -1.7), V(2.8, 0.12, 1), 0xc6a67d);
      box(V(0.4, 5, -2.2), V(3.4, 0.13, 0.2), 0x98754e);
      for (let i = 0; i < 4; i++) {
        const cloth = box(
          V(-0.8 + i * 0.8, 3.8, -2),
          V(0.5, 1.7, 0.12),
          [0x5a7d99, 0xb36d65, 0x929c97, 0xa39371][i],
        );
        cloth.rotation.z = i % 2 ? 0.08 : -0.08;
      }
      windowPane(6.2, 4.3, -2.3, 3.2, 4.6, false);
      sphere(V(3.5, 4.6, -2.12), V(0.65, 0.95, 0.04), 0xc9b68a);
      sphere(V(3.5, 4.6, -2.04), V(0.56, 0.85, 0.02), 0x9fb7bd, world, false);
      desk(3.5, -1.2, 1.75, 2.3);
      box(V(-6.5, 5, -2.1), V(1, 1.5, 0.1), 0xb98f6b);
      box(V(-6.5, 5, -2.02), V(0.8, 1.3, 0.02), 0xdec49d, world, false);
    }
    function mealRoom() {
      room(0x9a7c6d, 0x7d6357);
      box(V(-4.5, 2, -1.7), V(5, 4, 0.6), 0xb5a391);
      box(V(-4.5, 3.9, -1.3), V(5.1, 0.2, 1.5), 0xc2b39b);
      for (let i = 0; i < 3; i++)
        box(V(-6.1 + i * 1.6, 2, -1.34), V(1.5, 3.6, 0.07), 0x8e887e);
      desk(2, 0.3, 2.15, 5.6);
      chair(-0.2, 0.3);
      const dish = mesh(geo.cylinder, 0xeee7d0);
      dish.position.set(2, 2.26, 0.3);
      dish.scale.set(0.48, 0.035, 0.48);
      for (let i = 0; i < 7; i++)
        sphere(
          V(2 + Math.sin(i) * 0.2, 2.32, 0.3 + Math.cos(i) * 0.2),
          V(0.1, 0.08, 0.08),
          i % 2 ? 0xbd7950 : 0xc9ac67,
        );
      box(V(3.6, 2.52, 0.2), V(0.25, 0.5, 0.25), 0xc7dad9);
      windowPane(6.2, 4.4, -2.3, 3.3, 4.8, false);
      sphere(V(2, 6.7, 0.2), V(0.7, 0.08, 0.7), 0xe6c991);
      segment(V(2, 6.8, 0.2), V(2, 9, 0.2), 0.015, ink);
    }
    function carInterior() {
      sky("#cf967f", "#f8d7a0");
      room(0x635660, 0x333240);
      for (let i = -6; i <= 6; i++) {
        box(V(i * 2, 3, -2.35), V(1.6, 6, 0.1), 0x9a8289, world, false);
        for (let j = 0; j < 3; j++)
          box(
            V(i * 2, 3 + j, -2.25),
            V(0.65, 0.5, 0.02),
            0xd6bea7,
            world,
            false,
          );
      }
      box(V(0, 1, 1), V(12, 1.3, 2), 0x35323d);
      box(V(-2.4, 2, 0.6), V(1.9, 3.9, 0.8), 0x282633);
      box(V(-2.4, 3.7, 0.65), V(1.3, 1.1, 0.7), 0x2f2b38);
      const steering = new T.Mesh(
        new T.TorusGeometry(0.65, 0.06, 8, 32),
        mat(0x252532),
      );
      steering.position.set(0.5, 2.1, 1);
      steering.rotation.y = 0.3;
      world.add(steering);
      for (let i = 0; i < 2; i++) {
        const r = new T.Mesh(
          new T.TorusGeometry(0.14, 0.02, 6, 20),
          basic(0x9ed5e0),
        );
        r.position.set(1.5 + i * 0.45, 1.55, 1.31);
        world.add(r);
      }
      segment(V(3.3, 0, 1), V(4.2, 8, 1), 0.13, 0x262431);
    }
    function pedalScene() {
      room(0x242330, 0x1b1c28);
      box(V(0.9, 0.9, 0), V(0.3, 0.7, 0.25), 0x696779);
      box(V(2.3, 0.9, 0), V(0.3, 0.7, 0.25), 0x696779);
      const shoe = new T.Group();
      world.add(shoe);
      segment(V(-2.8, 3.8, 0.2), V(-0.4, 1.45, 0.25), 0.18, 0x565974, shoe);
      sphere(V(0, 1.3, 0.3), V(0.65, 0.21, 0.3), 0x392b32, shoe);
      props.push({ pedalFoot: shoe });
    }
    function setup(kind, shot) {
      reset();
      activeKind = kind;
      if (kind === "grade") {
        room(0x8d633c, 0x8d633c);
        for (let j = -20; j < 20; j++)
          box(V(0, j * 0.32, -2.1), V(25, 0.012, 0.01), 0xa57a4c, world, false);
      } else if (kind.startsWith("class") || kind === "exam")
        classroom(kind === "exam");
      else if (kind === "brain") brain();
      else if (kind === "lab") {
        lab();
        if (shot.camera === "scientist") {
          const holo = new T.Mesh(
            new T.CylinderGeometry(1.1, 0.62, 2.5, 32, 1, true),
            new T.MeshBasicMaterial({
              color: 0x76e0bd,
              transparent: true,
              opacity: 0.16,
              side: T.DoubleSide,
              depthWrite: false,
            }),
          );
          holo.position.set(1.4, 2.8, 0.2);
          world.add(holo);
          const m = new T.Group();
          m.position.set(1.4, 3.5, 0.2);
          world.add(m);
          sphere(V(), V(0.13, 0.13, 0.13), 0xe77f93, m);
          for (let i = 0; i < 7; i++) {
            const p = V(
              Math.cos(i * 2.4) * 0.65,
              Math.sin(i * 2.4) * 0.55,
              Math.sin(i) * 0.4,
            );
            sphere(p, V(0.08, 0.08, 0.08), 0xe47593, m);
            segment(V(), p, 0.025, 0xbf7294, m);
          }
          props.push({ molecule: m });
        } else {
          box(V(-3.2, 1.25, 1), V(0.8, 2.5, 0.6), 0x66788f);
          for (let i = 0; i < 4; i++)
            sphere(
              V(-3.5 + i * 0.18, 2.5, 1.2),
              V(0.06, 0.05, 0.06),
              i % 2 ? 0xf5cf7e : 0x84bda5,
            );
        }
      } else if (kind === "hospital" || kind === "doctor" || kind === "patient")
        hospital();
      else if (kind === "entrance") homeEntrance();
      else if (kind === "meal") mealRoom();
      else if (["bedroom", "desk"].includes(kind)) bedRoom();
      else if (kind === "campus" || kind === "friends") campus();
      else if (kind === "discharge") {
        room(0x9eaeba, 0xb2bec2);
        box(V(4.3, 3.4, -2.2), V(3.3, 6.8, 0.15), 0xe9e3c8);
        box(V(4.3, 3.3, -2.1), V(2.9, 6.3, 0.1), 0xf7eac7);
        text("EXIT →", V(4.3, 6.8, -2), 2, 0.4, "#418473");
        for (const x of [-4, -3, -2]) {
          box(V(x, 1, -1.6), V(0.7, 0.15, 0.7), 0x7ca0ba);
          box(V(x, 1.5, -1.9), V(0.7, 0.9, 0.15), 0x7ca0ba);
        }
        for (const x of [-5.8, 2.5]) {
          box(V(x, 0.6, -0.7), V(0.6, 1.2, 0.6), 0xeee8d6);
          for (let j = 0; j < 3; j++)
            sphere(
              V(x + Math.sin(j * 2) * 0.2, 1.6 + j * 0.35, -0.7),
              V(0.19, 0.6, 0.1),
              0x719f73,
            );
        }
      } else if (kind === "ceiling") {
        room(0xadbcc5, 0xabbac4);
        box(V(0, 8.7, -1), V(24, 0.1, 14), 0xd5dee1);
        for (let i = -10; i < 11; i++)
          box(V(i, 8.62, -1), V(0.012, 0.015, 14), 0xb0bec5);
        box(V(0, 8.5, -1), V(2.8, 0.05, 1.3), 0xfffdf3);
        camera.position.set(0, 2, 5);
        camera.lookAt(0, 8.7, -1);
      } else if (kind === "car") carInterior();
      else if (kind === "pedal") pedalScene();
      else if (["city", "street-hero"].includes(kind)) city();
      else if (kind === "atm") {
        room();
        box(V(2, 2.25, 0), V(2.2, 4.5, 0.9), 0x697391);
        box(V(2, 3.1, 0.48), V(1.55, 1, 0.04), 0x253f56);
        text("$0.00", V(2, 3.1, 0.53), 1.4, 0.55, "#a4d8ea");
        text("CAMPUS CREDIT UNION", V(2, 4.2, 0.53), 2, 0.2, "#f9e0a2");
        for (let i = 0; i < 12; i++)
          box(
            V(1.55 + (i % 3) * 0.26, 2.15 - Math.floor(i / 3) * 0.17, 0.51),
            V(0.19, 0.1, 0.03),
            0xd0d3d9,
          );
        box(V(5, 2.4, -1.5), V(1.7, 4.8, 0.6), 0xa34053);
        for (let i = 0; i < 20; i++)
          box(
            V(4.5 + (i % 4) * 0.32, 4.2 - Math.floor(i / 4) * 0.45, -1.16),
            V(0.2, 0.3, 0.03),
            [0xe4ce7f, 0x8fbdc2, 0x91b293, 0xcd8b99][i % 4],
            world,
            false,
          );
        box(V(-3.7, 4.4, -2.2), V(3.1, 2.1, 0.08), 0xb59569);
        for (let i = 0; i < 4; i++) {
          const p = box(
            V(-4.7 + i * 0.65, 4.3 + (i % 2) * 0.3, -2.1),
            V(0.7, 1.1, 0.02),
            i % 2 ? 0xe0e6e5 : 0xeee0aa,
          );
          p.rotation.z = i % 2 ? 0.1 : -0.1;
        }
      } else if (kind === "wealth") {
        room(0x664463, 0x4c354d);
        windowPane(0, 4.5, -2.2, 14, 7, true);
        for (let i = 0; i < 9; i++)
          box(
            V(-4 + i, 0.2 + (i % 3) * 0.16, 1),
            V(0.7, 0.3 + (i % 3) * 0.25, 0.7),
            0x6ca77a,
          );
        for (let i = 0; i < 18; i++) {
          const h = 0.8 + ((i * 13) % 6);
          box(
            V(-8 + i * 0.9, h / 2, -1.95),
            V(0.7, h, 0.02),
            0x473b5b,
            world,
            false,
          );
          for (let y = 0.5; y < h; y += 0.4)
            box(
              V(-8 + i * 0.9, y, -1.91),
              V(0.05, 0.06, 0.015),
              0xcac17a,
              world,
              false,
            );
        }
        box(V(3.5, 2, 0.8), V(4, 2.8, 1.2), 0x76514b);
        box(V(3.5, 3.5, 0.8), V(5, 0.18, 1.8), 0xb58a66);
        box(V(5.5, 5, -1.7), V(4.3, 2.8, 0.04), 0x534c50);
        for (let i = 0; i < 6; i++) {
          box(
            V(4 + i * 0.55, 4.2 + i * 0.25, -1.6),
            V(0.3, 0.5 + i * 0.5, 0.02),
            0x8bc78e,
            world,
            false,
          );
          if (i < 5)
            segment(
              V(4 + i * 0.55, 4.5 + i * 0.28, -1.5),
              V(4.55 + i * 0.55, 4.78 + i * 0.28, -1.5),
              0.025,
              0xb7e49c,
              world,
              false,
            );
        }
        for (let i = 0; i < 8; i++) {
          const b = box(
            V(-4 + i * 0.9, 5.4 + (i % 3) * 0.6, 0.3),
            V(0.4, 0.17, 0.018),
            0xb3d5a7,
          );
          b.rotation.z = i * 0.7;
          props.push({ bill: b, phase: i });
        }
      } else if (kind === "black") renderer.setClearColor(0x000000);
    }
    const shots = CloneTimeline.shots;
    let shotIndex = -1,
      openingLabels = [],
      referenceRows = [],
      trackingEnabled = true,
      fitter = null;
    const referenceAnchors = new Map();
    function paperCard(x, y, z, label = "80", col = "#bd4948", owner = "hero") {
      const g = new T.Group();
      world.add(g);
      g.position.set(x, y, z);
      box(V(), V(1.05, 1.4, 0.035), 0xf4e9cf, g);
      text(label, V(0, 0.1, 0.03), 0.88, 0.75, col, null, g);
      text("RESULT", V(0, 0.52, 0.03), 0.85, 0.16, "#314059", null, g);
      props.push({ card: g, owner });
      return g;
    }
    function buildActors(s) {
      const k = s.kind;
      if (k === "black" || k === "ceiling") return;
      if (k === "grade") {
        const p = box(V(0, 4, 4), V(4.2, 5.2, 0.04), 0xf4e7c8);
        p.rotation.z = 0.1;
        text("IQ TEST RESULT", V(0, 6.15, 4.05), 3.8, 0.5, "#294568");
        text("80", V(0, 4.3, 4.08), 3, 1.8, "#be4746");
        text("SCORE CALCULATED BY AGE", V(0, 2.1, 4.05), 3.5, 0.3, "#6c625c");
        return;
      }
      if (k === "classroom" && s.start > 18.7) {
        paperCard(
          s.start < 20 ? -1.2 : 0.4,
          2.6,
          2,
          s.start < 20 ? "80" : "F",
          "#bd4948",
          s.start < 20 ? "hero" : "coat",
        );
      }
      if (k === "exam" && s.start >= 26) {
        paperCard(0.1, 3.5, 1.5, "51%", "#458a69", "coat");
      }
      if (k === "classroom" || k === "exam") {
        actor({ x: -2.8, z: 1, scale: 0.95 });
        actor({
          x: -5.4,
          z: -1.3,
          scale: 0.82,
          color: 0x71bca6,
        }).group.position.y = 1.15;
        actor({ x: 2.6, z: -1.2, scale: 0.9, color: 0xe88c86 });
        actor({
          x: 4.3,
          z: 1,
          scale: 1.08,
          color: 0xecf2ed,
          coat: true,
          facing: -1,
          glasses: true,
        });
      } else if (k === "hospital" || k === "patient" || k === "doctor") {
        actor({ x: -2.6, z: 0.6, scale: 0.95, color: 0xb8d8e3 }).isPatient =
          true;
        actor({
          x: 4,
          z: 1,
          scale: 1.05,
          color: 0xf0f3e9,
          coat: true,
          facing: -1,
        });
      } else if (k === "discharge") {
        actor({ x: 1, z: 1, scale: 1.08 });
        actor({ x: -1.2, z: 1, scale: 1.05, color: 0xf1f1e8, coat: true });
        actor({ x: 5.2, z: -1, scale: 0.85, color: 0x72b8aa });
      } else if (k === "campus" || k === "friends") {
        actor({ x: 0, z: 1, scale: 1.12 });
        if (k === "friends") {
          actor({ x: -1.5, z: 1.1, scale: 1.05, color: 0x68b7a7 });
          actor({ x: 1.5, z: 1, scale: 1.1, color: 0xe88b8b });
        }
      } else if (k === "lab") {
        actor({ x: -1, z: 1, scale: 1.12, color: 0xeaece8, coat: true });
        actor({ x: -1, z: 1, scale: 1.12 });
        sphere(V(5, 0.28, 1), V(0.17, 0.2, 0.17), 0xdf4b57);
      } else if (["bedroom", "desk", "entrance", "meal"].includes(k)) {
        actor({ x: 2.1, z: 1, scale: 1.12 });
      } else if (k === "car") {
        const driver = actor({ x: -1.1, z: 1.2, scale: 0.78, color: 0x646579 });
        driver.isDriver = true;
      } else if (k === "city") {
        if(s.camera === "crosswalk")actor({x:-5.2,z:1,scale:1});
      } else if (k === "pedal") {} else
        actor({
          x:
            k === "atm"
              ? -1
              : k === "wealth"
                ? -1.2
                : k === "bedroom"
                  ? 2.1
                  : -1,
          z: 1,
          scale: 1.12,
        });
    }
    function addAccessories(s) {
      for (const a of actors)
        if (
          a.isHero &&
          ["campus", "friends", "street-hero", "entrance", "bedroom"].includes(
            s.kind,
          )
        ) {
          if (
            ["campus", "friends", "street-hero", "entrance"].includes(s.kind)
          ) {
            box(V(-0.2, 2.8, -0.36), V(0.65, 1.2, 0.35), 0x6c9d91, a.group);
            segment(
              V(0.22, 3.3, 0.23),
              V(0.22, 2.35, 0.23),
              0.035,
              0x343342,
              a.group,
            );
          }
          const phone = new T.Group();
          world.add(phone);
          box(V(), V(0.3, 0.56, 0.045), 0x222b42, phone);
          box(V(0, 0.02, 0.03), V(0.24, 0.44, 0.015), 0xa7cccd, phone, false);
          props.push({ phone, owner: a });
        }
    }
    function frame(global, opt = {}) {
      if (fitter && trackingEnabled) fitter.restore();
      const t = clamp(global, 0, 59.99999),
        index = shots.findIndex((s) => t >= s.start && t < s.end),
        s = shots[index];
      if (index !== shotIndex) {
        setup(s.kind, s);
        buildActors(s);
        addAccessories(s);
        for (const a of actors) {
          a.nominalPosition = a.group.position.clone();
          a.nominalScale = a.group.scale.clone();
        }
        openingLabels = [];
        if (s.kind === "brain")
          openingLabels = ["WHAT IF YOUR", "IQ WAS 10", "TIMES HIGHER?"].map(
            (q) => text(q, V(), 3.2, 0.48, "#fff25b"),
          );
        shotIndex = index;
      }
      const local = t - s.start,
        k = s.kind;
      actors.forEach((a, j) => {
        a.group.position.copy(a.nominalPosition);
        a.group.scale.copy(a.nominalScale);
        a.group.rotation.set(0, 0, 0);
        let o = {};
        if (k === "classroom" || k === "exam") {
          o =
            j < 3
              ? {
                  sit: true,
                  write: j === 0,
                  reach: j === 0 && s.action === "receive-f",
                  think:
                    j === 0 && s.action === "write" && Math.sin(local) > 0.7,
                }
              : {
                  reach: s.start > 18,
                  walk: true,
                  travel: (Math.sin(local * 0.6) * 1.2) / a.scale,
                };
          if (j === 3) a.group.position.x = 4.3 - Math.sin(local * 0.6) * 1.2;
        } else if (k === "brain") {
          o = { reach: local > 1.4 };
          for (const n of brainNodes)
            n.scale.setScalar(
              0.04 * (0.8 + 0.2 * Math.sin(t * 4 + n.position.x * 8)),
            );
        } else if (k === "lab") {
          a.group.visible =
            j === 0 ? s.camera === "scientist" : s.camera === "teleporter";
          o = { reach: j === 0, think: j === 1 && local > 0.3 };
        } else if (["bedroom", "desk", "entrance", "meal"].includes(k)) {
          if (j === 1) o = {};
          else if (s.action === "fall-on-bed") {
            o = { raise: true };
            a.group.position.set(
              mix(0, -2.2, smooth(local, 0.3, 1)),
              mix(0, 1.6, smooth(local, 0.2, 0.9)),
              0.5,
            );
            a.group.rotation.z = mix(0, PI / 2, smooth(local, 0.2, 1));
          } else if (k === "desk" || k === "meal") {
            a.group.position.x = k === "meal" ? -0.2 : 2.1;
            o = { sit: true, write: k === "desk", think: k === "meal" };
            a.facing = 1;
          } else if (k === "entrance") {
            const q = smooth(local, 0, 0.9);
            a.group.position.x = mix(-3.4, -1.8, q);
            o = { walk: true, travel: (1.6 * q) / a.scale };
            a.facing = 1;
          } else {
            o = { sit: true, phone: true };
            a.group.position.set(-6, 1.15, 0.5);
            a.facing = -1;
          }
        } else if (k === "hospital" || k === "patient" || k === "doctor") {
          if (j === 0) {
            const sitting =
              k === "patient"
                ? s.action === "sit-up"
                  ? smooth(local, 0.1, 0.9)
                  : 1 - smooth(local, 1.4, 2.1)
                : 0;
            o = {
              recline: mix(0, 0.88, sitting),
              think: k === "hospital" && local < 1.5,
            };
            a.group.rotation.z = 0;
            a.group.position.set(-2.8, 1.6, 0.4);
          } else {
            o = {
              raise: k === "doctor",
              reach: k === "patient",
              walk: k === "hospital",
              travel: (2 * smooth(local, 0.1, 2)) / a.scale,
            };
            a.group.position.x = mix(4, 2, smooth(local, 0.1, 2));
          }
          if (k === "doctor") {
            camera.position.set(2.6, 4.1, 7.5);
            camera.lookAt(2.6, 3, 0);
          }
        } else if (k === "discharge") {
          if (j === 0) {
            a.group.position.x = 1 + smooth(local, 0.5, 2) * 2;
            o = {
              walk: true,
              travel: (smooth(local, 0.5, 2) * 2) / a.scale,
              reach: local < 0.5,
            };
          } else o = { reach: j === 1 };
        } else if (k === "campus" || k === "friends") {
          o = {
            walk: true,
            travel: (local * 0.18) / a.scale,
            phone: j === 0,
            reach: j > 0 && Math.sin(local * 3 + j) > 0.5,
          };
          a.group.position.x =
            (j === 0 ? -0.6 : j === 1 ? -2 : 1) + local * 0.18;
        } else if (k === "car") {
          o = { sit: true, reach: true };
          a.group.position.set(-1.1, 0.1, 1.2);
        } else if (k === "street-hero") {
          o = {};
          a.group.position.set(-3, 0, 0);
        } else if (k === "city") {
          o = {walk:true,travel:local*1.2};
          a.group.position.set(-5.2+local*1.2,0,1);
        } else if (k === "atm") o = { think: local > 1 };
        else o = { reach: true };
        a.pose(local, o);
      });
      for (const p of props) {
        if (p.car) {
          p.car.position.set(
            s.camera === "driving" ? -2.5 : 0,
            0,
            s.camera === "crosswalk"
              ? mix(-7, 6, smooth(local, 0, 0.4))
              : s.camera === "front"
                ? mix(-12, 4, smooth(local, 0, 0.7))
                : s.camera === "roadside-low"
                  ? mix(-7, 3, smooth(local, 0, 0.4))
                  : s.camera === "driving"
                    ? mix(6, -35, smooth(local, 0, 2.4))
                    : mix(-15, 5, smooth(local, 0, 1.1)),
          );
        }
        if (p.molecule) {
          p.molecule.rotation.y = local * 1.1;
          p.molecule.rotation.z = Math.sin(local * 2) * 0.15;
        }
        if (p.bill) {
          p.bill.position.y =
            5.4 + (p.phase % 3) * 0.6 + Math.sin(local * 2 + p.phase) * 0.4;
          p.bill.rotation.z = p.phase * 0.7 + local * 0.3;
        }
        if (p.pedalFoot) {
          p.pedalFoot.rotation.z = -0.25 * smooth(local, 0.1, 0.3);
        }
      }
      CloneStaging.camera(s, local, camera);
      if (fitter && trackingEnabled) fitter.fit(t, actors, world, s);
      world.updateMatrixWorld(true);
      for (const p of props)
        if (p.phone) {
          p.phone.position
            .copy(p.owner.hands[1].getWorldPosition(V()))
            .add(V(0, 0.25, 0.1));
        }
      for (const p of props)
        if (p.card) {
          const a = actors.find((a) =>
            p.owner === "hero" ? a.isHero : a.isCoat,
          );
          if (a) {
            const at = a.hands[1].getWorldPosition(V());
            p.card.position.copy(at).add(V(a.facing * 0.32, 0.48, 0.1));
          }
        }
      if (openingLabels.length) {
        camera.updateMatrixWorld();
        const h = 2 * 3 * Math.tan((camera.fov * PI) / 360);
        for (let j = 0; j < openingLabels.length; j++) {
          const label = openingLabels[j];
          label.visible =
            local > 0.25 && j === (local < 0.8 ? 0 : local < 1.7 ? 1 : 2);
          label.position.copy(
            V(h * 0.5, 0.24 * h, -3).applyMatrix4(camera.matrixWorld),
          );
          label.quaternion.copy(camera.quaternion);
          label.scale.setScalar(h * 0.16);
        }
      }
      if (opt.draw !== false) {
        renderer.render(scene, camera);
        compositor.compose(
          t,
          s,
          referenceRows[Math.min(1799, Math.floor(t * 30))],
        );
      }
      stats.frames++;
      return { time: t, shot: index, kind: k, stats };
    }
    return {
      frame,
      canvas: compositor.canvas,
      stats,
      shots,
      actors: () => actors,
      renderer,
      scene,
      camera,
      trackingReports: () => fitter?.reports,
      useTracking: (rows) => {
        referenceRows = rows;
        fitter = ReferenceFitter.make(rows, camera);
        referenceAnchors.clear();
        for (const row of rows)
          if (
            !referenceAnchors.has(row.take) &&
            row.hero &&
            row.hero.confidence > 0.6
          )
            referenceAnchors.set(row.take, row);
      },
      setTracking: (value) => (trackingEnabled = !!value),
    };
  }
  root.CloneFilm = { create };
})(window);
