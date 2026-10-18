/* Shot-specific 3D camera positions and timing, in source time (30 fps). */
window.CloneStaging = {
  camera(s, t, camera) {
    const P = (x, y, z, tx, ty, tz) => {
      camera.position.set(x, y, z);
      camera.lookAt(tx, ty, tz);
    };
    camera.fov = 38.2;
    if (s.kind === "ceiling") {
      P(0, 1.4, 3, 0, 8.7, -1);
      camera.rotateZ(0.1 * (1 - Math.min(t, 1)));
    } else if (s.kind === "hospital") {
      P(-0.5, 3.5, 15, -0.5, 3.5, 0);
    } else if (s.kind === "patient") {
      P(-2, 2.9, 8, -2, 2.9, 0);
    } else if (s.kind === "doctor") {
      P(2.7, 3.6, 6.4, 2.7, 3.6, 0);
    } else if (s.kind === "grade") {
      P(0, 4.2, 13, 0, 4.2, 0);
    } else if (s.kind === "pedal") {
      P(0, 1.2, 5, 0, 1.2, 0);
    } else if (s.kind === "car") {
      P(3, 2, 5.5, 0, 1.6, 0);
      camera.fov = 53;
    } else if (s.kind === "street-hero") {
      P(-3, 3.5, 4.8, -3, 3.5, 0);
    } else if (s.kind === "city") {
      if (s.camera === "driving") {
        P(0, 1.5, 8 - t * 2, 0, 2, -30 - t * 2);
        camera.fov = 65;
      }
      if (s.camera === "roadside-low") {
        P(5.5, 0.45, 5, 0, 1.1, -10);
        camera.fov = 64;
      }
      if (s.camera === "roadside") {
        P(5.8, 1.2, 7, 0, 1.6, -10);
        camera.fov = 64;
      }
      if (s.camera === "front") {
        P(0, 1.8, 7, 0, 2, -30);
        camera.fov = 62;
      }
      if (s.camera === "crosswalk") {
        P(6, 2.7, 9, 0, 2, -4);
        camera.fov = 55;
      }
    } else if (s.kind === "desk" || s.kind === "meal") {
      P(2.2, 3.3, 9, 2.2, 3.3, 0);
    } else if (s.kind === "bedroom" && s.action === "phone-in-bed") {
      P(-5, 3, 8, -5, 3, 0);
    } else {
      P(0, 4.1, 13, 0, 4.1, 0);
    }
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
  },
};
