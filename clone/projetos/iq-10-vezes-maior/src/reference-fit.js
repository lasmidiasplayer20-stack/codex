/* Supervised 2D observations constrain editable 3D staging. They do not solve
   hidden joints or 3D camera extrinsics. The original image is never rendered. */
(function (root) {
  const T = root.THREE,
    V = (x = 0, y = 0, z = 0) => new T.Vector3(x, y, z),
    clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const inv = (m) => {
      const d = m[0] * m[4] - m[1] * m[3];
      return [
        m[4] / d,
        -m[1] / d,
        (m[1] * m[5] - m[4] * m[2]) / d,
        -m[3] / d,
        m[0] / d,
        (m[3] * m[2] - m[0] * m[5]) / d,
      ];
    },
    mul = (a, b) => [
      a[0] * b[0] + a[1] * b[3],
      a[0] * b[1] + a[1] * b[4],
      a[0] * b[2] + a[1] * b[5] + a[2],
      a[3] * b[0] + a[4] * b[3],
      a[3] * b[1] + a[4] * b[4],
      a[3] * b[2] + a[4] * b[5] + a[5],
    ];
  function sample(rows, t) {
    const f = clamp(t * 30, 0, rows.length - 1),
      i = Math.floor(f),
      a = rows[i],
      b = rows[Math.min(i + 1, rows.length - 1)],
      u = f - i;
    if (a.take !== b.take) return a;
    const r = { ...a };
    for (const k of ["cameraFromTakeStart"])
      if (a[k] && b[k]) r[k] = a[k].map((v, j) => v + (b[k][j] - v) * u);
    if (a.subject && b.subject && a.subject.role === b.subject.role)
      r.subject = {
        ...a.subject,
        center: a.subject.center.map(
          (v, j) => v + (b.subject.center[j] - v) * u,
        ),
        box: a.subject.box.map((v, j) => v + (b.subject.box[j] - v) * u),
      };
    return r;
  }
  function make(rows, camera) {
    let base = null;
    const anchors = new Map(),
      reports = {
        frames: 0,
        cameraAnchors: 0,
        headFits: 0,
        wristFits: 0,
        unreachableWristTargets: 0,
        missingSubject: 0,
      predictedFrames: 0,
        maxHeadXErrorPx: 0,
        maxHeadYErrorPx: 0,
      };
    const project = (p) => {
        const q = p.clone().project(camera);
        return [(q.x + 1) * 320, (1 - q.y) * 180];
      },
      ray = (p, z) => {
        const d = V(p[0] / 320 - 1, 1 - p[1] / 180, 0.5)
          .unproject(camera)
          .sub(camera.position)
          .normalize();
        return camera.position
          .clone()
          .addScaledVector(d, (z - camera.position.z) / d.z);
      };
    const restore = () => {
      if (base) {
        camera.position.copy(base.position);
        camera.quaternion.copy(base.quaternion);
        camera.fov = base.fov;
        camera.updateProjectionMatrix();
        camera.updateMatrixWorld();
      }
    };
    function fit(t, actors, world, shot) {
      base = {
        position: camera.position.clone(),
        quaternion: camera.quaternion.clone(),
        fov: camera.fov,
      };
      const row = sample(rows, t);
      if (!row) return;
      reports.frames++;
      world.updateMatrixWorld(true);
      const obs = row.subject?.confidence > 0.43 ? row.subject : null,
        role = obs?.role || anchors.get(row.take)?.role,
        main = actors.find(
          (a) =>
            a.group.visible &&
            (role === "hero"
              ? a.isHero
              : role === "coat"
                ? a.isCoat
                : role === "patient"
                  ? a.isPatient
                  : role === "driver"
                    ? a.isDriver
                    : false),
        );
      if (!main || (!obs && !anchors.has(row.take))) {
        reports.missingSubject++;
        return;
      }
      const nominalPosition = main.group.position.clone();
      if (!anchors.has(row.take)) {
        const head = main.head.getWorldPosition(V()),
          size = Math.max(...obs.box.slice(2)) * 1.04,
          hWorld = 2 * main.headRadius * main.group.scale.y,
          d = clamp(
            (hWorld * 360) /
              (2 * Math.tan((camera.fov * Math.PI) / 360) * size),
            3.2,
            28,
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
              ((-(obs.center[0] - 320) / 640) * h * 16) / 9,
            )
            .addScaledVector(up, (-(180 - obs.center[1]) / 360) * h);
        anchors.set(row.take, {
          position: p,
          quaternion: camera.quaternion.clone(),
          fov: camera.fov,
          affine: row.cameraFromTakeStart || [1, 0, 0, 0, 1, 0],
          originX: main.group.position.x,
          role,
        });
        reports.cameraAnchors++;
      }
      const anchor = anchors.get(row.take);
      camera.position.copy(anchor.position);
      camera.quaternion.copy(anchor.quaternion);
      camera.fov = anchor.fov;
      let m = row.cameraFromTakeStart;
      if (m) {
        m = mul(m, inv(anchor.affine));
        const scale = clamp(Math.hypot(m[0], m[3]), 0.45, 2.8),
          theta = Math.atan2(m[3], m[0]),
          dx = m[0] * 320 + m[1] * 180 + m[2] - 320,
          dy = m[3] * 320 + m[4] * 180 + m[5] - 180,
          h =
            2 *
            Math.max(3, camera.position.z - 1) *
            Math.tan((camera.fov * Math.PI) / 360),
          right = V(1, 0, 0).applyQuaternion(camera.quaternion),
          up = V(0, 1, 0).applyQuaternion(camera.quaternion);
        camera.position
          .addScaledVector(right, (-dx * h * 16) / 9 / 640 / scale)
          .addScaledVector(up, (dy * h) / 360 / scale);
        camera.fov =
          (2 *
            Math.atan(Math.tan((camera.fov * Math.PI) / 360) / scale) *
            180) /
          Math.PI;
        camera.quaternion.multiply(
          new T.Quaternion().setFromAxisAngle(V(0, 0, 1), -theta),
        );
      }
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld();
      const cameraYBeforeSubject = camera.position.y;
      if (!obs) {
        reports.missingSubject++;
        const prior = anchor.prediction;
        if (prior) {
          main.group.position.x += prior.dx;
          main.group.position.y += prior.dy;
          const options = {...main.lastOptions.o};
          if(prior.pelvisY!==undefined) options.pelvisY=prior.pelvisY;
          if(prior.recline!==undefined) options.recline=prior.recline;
          main.pose(main.lastOptions.t,options);
          camera.position.y += prior.cameraDy;
          camera.updateMatrixWorld();
          world.updateMatrixWorld(true);
          reports.predictedFrames++;
        }
        return;
      }
      let head = main.head.getWorldPosition(V()),
        target = ray(obs.center, head.z),
        opt = { ...main.lastOptions.o };
      if (main.isPatient) {
        const hip = main.group.localToWorld(main.last.pelvis.clone()),
          length = (main.torsoLength + 0.5) * main.scale;
        opt.recline = clamp(
          Math.asin(clamp((target.y - hip.y) / length, 0, 0.94)),
          0,
          1.22,
        );
      } else if (Math.abs(main.group.rotation.z) > 0.1) {
        main.group.position.x += target.x - head.x;
        main.group.position.y += target.y - head.y;
      } else {
        main.group.position.x += target.x - head.x;
        if (opt.walk)
          opt.travel =
            (main.group.position.x - anchor.originX) /
            (main.scale * main.facing);
        const nominal = opt.sit ? 1.02 : 2.01,
          local = main.group.worldToLocal(ray(obs.center, head.z));
        opt.pelvisY = clamp(
          local.y - main.torsoLength - 0.5,
          nominal - 0.16,
          nominal + 0.025,
        );
      }
      main.pose(main.lastOptions.t, opt);
      world.updateMatrixWorld(true);
      if (!main.isPatient) {
        head = main.head.getWorldPosition(V());
        target = ray(obs.center, head.z);
        camera.position.y += head.y - target.y;
        camera.updateMatrixWorld();
      }
      if (main.isHero && row.hero) {
        const points = row.hero.wristCandidates || [],
          hands = [null, null],
          used = new Set();
        for (let j = 1; j >= 0; j--) {
          const here = main.hands[j].getWorldPosition(V()),
            pix = project(here);
          let chosen = -1,
            best = obs.box[2] * 1.5;
          points.forEach((c, i) => {
            const d = Math.hypot(c.center[0] - pix[0], c.center[1] - pix[1]);
            if (!used.has(i) && d < best) {
              best = d;
              chosen = i;
            }
          });
          if (chosen >= 0) {
            const q = main.group.worldToLocal(
                ray(points[chosen].center, here.z),
              ),
              shoulder = main.last.chains[j * 2 + 1].a;
            if (
              q.distanceTo(shoulder) < 1.53 &&
              q.distanceTo(shoulder) > 0.49
            ) {
              hands[j] = q;
              used.add(chosen);
              reports.wristFits++;
            } else reports.unreachableWristTargets++;
          }
        }
        opt.hands = hands;
        main.pose(main.lastOptions.t, opt);
      }
      main.shadow.position.set(
        main.group.position.x,
        0.016,
        main.group.position.z,
      );
      world.updateMatrixWorld(true);
      const q = project(main.head.getWorldPosition(V()));
      anchor.prediction = {
        dx: main.group.position.x-nominalPosition.x,
        dy: main.group.position.y-nominalPosition.y,
        cameraDy: camera.position.y-cameraYBeforeSubject,
        pelvisY: opt.pelvisY, recline: opt.recline
      };
      reports.headFits++;
      reports.maxHeadXErrorPx = Math.max(
        reports.maxHeadXErrorPx,
        Math.abs(q[0] - obs.center[0]),
      );
      reports.maxHeadYErrorPx = Math.max(
        reports.maxHeadYErrorPx,
        Math.abs(q[1] - obs.center[1]),
      );
    }
    return { fit, restore, reports, sample: (t) => sample(rows, t) };
  }
  root.ReferenceFitter = { make, sample };
})(window);
