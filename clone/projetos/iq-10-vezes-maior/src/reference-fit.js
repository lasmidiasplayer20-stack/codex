/* R3: independently fitted camera, actor scale, pose and expression.
   No character residual is ever added back to the camera. */
(function (root) {
  const T = root.THREE,
    V = (x = 0, y = 0, z = 0) => new T.Vector3(x, y, z),
    clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function inv(m) {
    const d = m[0] * m[4] - m[1] * m[3];
    return [
      m[4] / d,
      -m[1] / d,
      (m[1] * m[5] - m[4] * m[2]) / d,
      -m[3] / d,
      m[0] / d,
      (m[3] * m[2] - m[0] * m[5]) / d,
    ];
  }
  function mul(a, b) {
    return [
      a[0] * b[0] + a[1] * b[3],
      a[0] * b[1] + a[1] * b[4],
      a[0] * b[2] + a[1] * b[5] + a[2],
      a[3] * b[0] + a[4] * b[3],
      a[3] * b[1] + a[4] * b[4],
      a[3] * b[2] + a[4] * b[5] + a[5],
    ];
  }
  function sample(rows, t) {
    const f = clamp(t * 30, 0, rows.length - 1),
      i = Math.floor(f),
      a = rows[i],
      b = rows[Math.min(i + 1, rows.length - 1)],
      u = f - i;
    if (a.take !== b.take) return a;
    const r = { ...a };
    r.cameraFromTakeStart = a.cameraFromTakeStart.map(
      (v, j) => v + (b.cameraFromTakeStart[j] - v) * u,
    );
    if (a.refined && b.refined) {
      r.refined = {
        ...a.refined,
        bg: a.refined.bg.map((v, j) => v + (b.refined.bg[j] - v) * u),
      };
      if (a.refined.subject && b.refined.subject)
        r.refined.subject = {
          ...a.refined.subject,
          head: a.refined.subject.head.map(
            (v, j) => v + (b.refined.subject.head[j] - v) * u,
          ),
        };
    }
    return r;
  }
  function make(rows, camera) {
    let base;
    const anchors = new Map(),
      reports = {
        frames: 0,
        cameraAnchors: 0,
        headFits: 0,
        wristFits: 0,
        missingSubject: 0,
        maxHeadErrorPx: 0,
        independentCamera: true,
      };
    const project = (p) => {
      const q = p.clone().project(camera);
      return [(q.x + 1) * 320, (1 - q.y) * 180];
    };
    function ray(p, z) {
      const d = V(p[0] / 320 - 1, 1 - p[1] / 180, 0.5)
        .unproject(camera)
        .sub(camera.position)
        .normalize();
      return camera.position
        .clone()
        .addScaledVector(d, (z - camera.position.z) / d.z);
    }
    function restore() {
      if (!base) return;
      camera.position.copy(base.p);
      camera.quaternion.copy(base.q);
      camera.fov = base.f;
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld();
    }
    function fit(t, actors, world, shot) {
      base = {
        p: camera.position.clone(),
        q: camera.quaternion.clone(),
        f: camera.fov,
      };
      const row = sample(rows, t),
        ref = row?.refined,
        obs = ref?.subject;
      reports.frames++;
      if (shot.id === 25) {
        const actor = actors.find((a) => a.isHero);
        if (actor) {
          world.updateMatrixWorld(true);
          let h = actor.head.getWorldPosition(V()),
            p = project(h),
            q = project(
              h
                .clone()
                .addScaledVector(
                  V(1, 0, 0).applyQuaternion(camera.quaternion),
                  actor.headRadius * actor.group.scale.x,
                ),
            ),
            r = Math.hypot(p[0] - q[0], p[1] - q[1]);
          actor.group.scale.multiplyScalar(7 / r);
          world.updateMatrixWorld(true);
          h = actor.head.getWorldPosition(V());
          const dir = V(
              (294 + (t - shot.start) * 50) / 320 - 1,
              1 - 151 / 180,
              0.5,
            )
              .unproject(camera)
              .sub(camera.position)
              .normalize(),
            normal = camera.getWorldDirection(V()),
            target = camera.position
              .clone()
              .addScaledVector(
                dir,
                h.clone().sub(camera.position).dot(normal) / dir.dot(normal),
              );
          actor.group.position.add(target.sub(h));
          if (!actor.impactStyle) {
            actor.group.traverse((o) => {
              if (o.isMesh)
                o.material = new T.MeshBasicMaterial({
                  color: 0xfbe0a0,
                  transparent: true,
                  opacity: 0.2,
                  depthWrite: false,
                });
            });
            actor.impactStyle = true;
          }
        }
        return;
      }
      if (!obs) {
        reports.missingSubject++;
        return;
      }
      const main = actors.find(
        (a) =>
          a.group.visible &&
          (obs.role === "hero"
            ? a.isHero
            : obs.role === "coat"
              ? a.isCoat
              : obs.role === "patient"
                ? a.isPatient
                : obs.role === "driver"
                  ? a.isDriver
                  : false),
      );
      if (!main) {
        reports.missingSubject++;
        return;
      }
      world.updateMatrixWorld(true);
      let anchor = anchors.get(shot.id);
      if (!anchor) {
        const anchorFrame = ref.anchorFrame ?? row.f,
          anchorRef = rows[anchorFrame].refined,
          anchorObs = anchorRef.subject || obs,
          saved = {
            p: main.group.position.clone(),
            q: main.group.quaternion.clone(),
            s: main.group.scale.clone(),
            t: main.lastOptions.t,
            o: { ...main.lastOptions.o },
          };
        main.group.position.copy(main.nominalPosition);
        main.group.quaternion.identity();
        main.group.scale.copy(main.nominalScale);
        if (main.isPatient) main.group.position.set(-2.8, 1.6, 0.4);
        if (shot.action === "phone-in-bed")
          main.group.position.set(-1.5, 1.15, 0.5);
        let anchorOptions = { ...saved.o };
        if (main.isPatient)
          anchorOptions.recline = shot.action === "lie-back" ? 0.85 : 0.35;
        main.pose((anchorFrame - shot.startFrame) / 30, anchorOptions);
        CloneStaging.camera(shot, (anchorFrame - shot.startFrame) / 30, camera);
        world.updateMatrixWorld(true);
        const head = main.head.getWorldPosition(V()),
          size = anchorObs.head[2] * 2,
          hWorld = 2 * main.headRadius * main.nominalScale.y,
          d = clamp(
            (hWorld * 360) /
              (2 * Math.tan((camera.fov * Math.PI) / 360) * size),
            2.7,
            35,
          ),
          forward = camera.getWorldDirection(V()),
          right = V(1, 0, 0).applyQuaternion(camera.quaternion),
          up = V(0, 1, 0).applyQuaternion(camera.quaternion),
          h = 2 * d * Math.tan((camera.fov * Math.PI) / 360),
          p = head
            .clone()
            .addScaledVector(forward, -d)
            .addScaledVector(
              right,
              ((-(anchorObs.head[0] - 320) / 640) * h * 16) / 9,
            )
            .addScaledVector(up, (-(180 - anchorObs.head[1]) / 360) * h);
        anchor = {
          p,
          q: camera.quaternion.clone(),
          f: camera.fov,
          bg: anchorRef.bg,
          scale: main.nominalScale.x,
        };
        anchors.set(shot.id, anchor);
        reports.cameraAnchors++;
        main.group.position.copy(saved.p);
        main.group.quaternion.copy(saved.q);
        main.group.scale.copy(saved.s);
        main.pose(saved.t, saved.o);
        world.updateMatrixWorld(true);
      }

      camera.position.copy(anchor.p);
      camera.quaternion.copy(anchor.q);
      camera.fov = anchor.f;
      const m = mul(ref.bg, inv(anchor.bg)),
        scale = clamp(Math.hypot(m[0], m[3]), 0.3, 4),
        theta = Math.atan2(m[3], m[0]),
        dx = m[0] * 320 + m[1] * 180 + m[2] - 320,
        dy = m[3] * 320 + m[4] * 180 + m[5] - 180,
        h =
          2 *
          Math.max(2, camera.position.z - main.group.position.z) *
          Math.tan((camera.fov * Math.PI) / 360),
        right = V(1, 0, 0).applyQuaternion(camera.quaternion),
        up = V(0, 1, 0).applyQuaternion(camera.quaternion);
      camera.position
        .addScaledVector(right, (-dx * h * 16) / 9 / 640 / scale)
        .addScaledVector(up, (dy * h) / 360 / scale);
      camera.fov =
        (2 * Math.atan(Math.tan((anchor.f * Math.PI) / 360) / scale) * 180) /
        Math.PI;
      camera.quaternion.multiply(
        new T.Quaternion().setFromAxisAngle(V(0, 0, 1), -theta),
      );
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld();
      let head = main.head.getWorldPosition(V()),
        a = project(head),
        b = project(
          head
            .clone()
            .addScaledVector(
              V(1, 0, 0).applyQuaternion(camera.quaternion),
              main.headRadius * main.group.scale.y,
            ),
        ),
        rp = Math.hypot(a[0] - b[0], a[1] - b[1]),
        sc = clamp(obs.head[2] / rp, 0.55, 1.8);
      main.group.scale.multiplyScalar(sc);
      main.scale = main.group.scale.y;
      let options = { ...main.lastOptions.o };
      if (main.isPatient) {
        const f = t * 30;
        let angle = 0.35;
        if (shot.action === "sit-up")
          angle = 0.35 + 0.5 * clamp((f - shot.startFrame) / 25, 0, 1);
        if (shot.action === "lie-back")
          angle = 0.85 - 0.5 * clamp((f - shot.startFrame - 30) / 27, 0, 1);
        options.recline = angle;
        options.restArms = shot.action === "lie-back";
      }
      main.pose(main.lastOptions.t, options);
      world.updateMatrixWorld(true);
      head = main.head.getWorldPosition(V());
      const target = ray(obs.head, head.z);
      if (main.isPatient) {
        main.group.position.set(-2.8, 1.6, 0.4);
        main.group.scale.copy(main.nominalScale);
        main.scale = main.group.scale.y;
        const hip = main.group.localToWorld(new T.Vector3(0, 0, 0));
        options.recline = clamp(
          Math.atan2(target.y - hip.y, hip.x - target.x),
          0.05,
          1.35,
        );
        main.pose(main.lastOptions.t, options);
      } else main.group.position.add(target.sub(head));
      world.updateMatrixWorld(true);
      // Screen-space hand targets are gated by anatomical reach and their prior pose.
      if (main.isHero && row.hero?.wristCandidates) {
        const hands = [null, null],
          used = new Set();
        for (let j = 1; j >= 0; j--) {
          const here = main.hands[j].getWorldPosition(V()),
            pix = project(here);
          let best = obs.head[2] * 2.1,
            pick;
          for (const [c, k] of row.hero.wristCandidates.map((c, k) => [c, k])) {
            const d = Math.hypot(c.center[0] - pix[0], c.center[1] - pix[1]);
            if (!used.has(k) && d < best) {
              best = d;
              pick = k;
            }
          }
          if (pick !== undefined) {
            const q = main.group.worldToLocal(
                ray(row.hero.wristCandidates[pick].center, here.z),
              ),
              shoulder = main.last.chains[j * 2 + 1].a;
            if (
              q.distanceTo(shoulder) < 1.55 &&
              q.distanceTo(shoulder) > 0.35
            ) {
              hands[j] = q;
              used.add(pick);
              reports.wristFits++;
            }
          }
        }
        options.hands = hands;
      }
      // Supports are expressed in actor coordinates, independent from head fitting.
      main.pose(main.lastOptions.t, options);
      world.updateMatrixWorld(true);
      head = main.head.getWorldPosition(V());
      main.head.quaternion.copy(
        main.group
          .getWorldQuaternion(new T.Quaternion())
          .invert()
          .multiply(camera.quaternion),
      );
      if (ref.eyes) {
        const z = head.z + main.headRadius * main.group.scale.x;
        for (let j = 0; j < 2; j++) {
          const eye = main.face.children[j],
            e = ref.eyes[j];
          if (e) {
            const p = main.head.worldToLocal(ray(e.p, z));
            eye.position.copy(p);
            eye.position.z = 1.015;
            const radius = main.headRadius * main.group.scale.x;
            eye.scale.set(
              clamp(e.r[0] / obs.head[2], 0.025, 0.16),
              clamp(e.r[1] / obs.head[2], 0.016, 0.32),
              0.03,
            );
            eye.visible = true;
          } else if (ref.eyes.length) {
            eye.visible = false;
          } else {
            eye.visible = true;
            eye.position.set(j ? 0.15 : -0.15, 0.1, 1.015);
            eye.scale.set(0.07, 0.018, 0.03);
          }
        }
        const mouth = main.face.children[2];
        mouth.visible = !!ref.mouth;
        if (ref.mouth) {
          mouth.position.copy(main.head.worldToLocal(ray(ref.mouth.p, z)));
          mouth.position.z = 1.015;
          mouth.scale.set(
            shot.kind === "meal"
              ? Math.min(0.14, ref.mouth.r[0] / obs.head[2])
              : ref.mouth.r[0] / obs.head[2],
            shot.kind === "meal"
              ? Math.min(0.06, ref.mouth.r[1] / obs.head[2])
              : ref.mouth.r[1] / obs.head[2],
            0.03,
          );
        }
      }
      if (shot.kind === "doctor") {
        const patient = actors.find((a) => a.isPatient);
        if (patient) {
          world.updateMatrixWorld(true);
          const h = patient.head.getWorldPosition(V()),
            a = project(h),
            b = project(
              h
                .clone()
                .addScaledVector(
                  V(1, 0, 0).applyQuaternion(camera.quaternion),
                  patient.headRadius * patient.group.scale.x,
                ),
            ),
            r = Math.hypot(a[0] - b[0], a[1] - b[1]);
          patient.group.scale.multiplyScalar(43 / r);
          world.updateMatrixWorld(true);
          const head = patient.head.getWorldPosition(V());
          patient.group.position.add(ray([54, 286], head.z).sub(head));
          patient.face.visible = false;
          patient.group.children.forEach((o) => {
            o.visible = o === patient.head;
          });
        }
      }
      main.shadow.position.set(
        main.group.position.x,
        0.016,
        main.group.position.z,
      );
      world.updateMatrixWorld(true);
      const q = project(main.head.getWorldPosition(V()));
      const err = Math.hypot(q[0] - obs.head[0], q[1] - obs.head[1]);
      if (err > reports.maxHeadErrorPx) {
        reports.maxHeadErrorPx = err;
        reports.worst = { frame: t * 30, take: shot.id, kind: shot.kind };
      }
      reports.headFits++;
    }
    return { fit, restore, reports, sample: (t) => sample(rows, t) };
  }
  root.ReferenceFitter = { make, sample };
})(window);
