/* Procedural transition/effect compositor. No source-video pixels are sampled. */
window.CloneCompositor = {
  create(glCanvas) {
    const canvas = document.createElement("canvas");
    canvas.width = glCanvas.width;
    canvas.height = glCanvas.height;
    const ctx = canvas.getContext("2d", { alpha: false }),
      old = document.createElement("canvas");
    old.width = canvas.width;
    old.height = canvas.height;
    const ox = old.getContext("2d");
    glCanvas.style.display = "none";
    document.body.appendChild(canvas);
    let lastShot = -1;
    const W = canvas.width,
      H = canvas.height;
    return {
      canvas,
      compose(t, shot, row) {
        if (lastShot !== shot.id) {
          ox.drawImage(canvas, 0, 0);
          lastShot = shot.id;
        }
        ctx.save();
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, W, H);
        const f = t * 30,
          transition = CloneTimeline.transitions.find(
            (a) => f >= a.startFrame && f <= a.endFrame,
          ),
          u = transition
            ? (f - transition.startFrame) /
              (transition.endFrame - transition.startFrame)
            : 0,
          blur =
            transition && transition.type.includes("blur")
              ? (Math.sin(u * Math.PI) * W) / 110
              : 0;
        ctx.filter = blur ? "blur(" + blur + "px)" : "none";
        ctx.drawImage(glCanvas, 0, 0);
        ctx.filter = "none";
        if (
          transition &&
          f >= shot.startFrame &&
          shot.startFrame > transition.startFrame &&
          f - shot.startFrame < 5
        ) {
          ctx.globalAlpha = (1 - (f - shot.startFrame) / 5) * 0.65;
          ctx.drawImage(old, 0, 0);
          ctx.globalAlpha = 1;
        }
        if (transition?.type === "horizontal-whip-blur") {
          ctx.globalAlpha = 0.1;
          for (let i = -4; i <= 4; i++)
            ctx.drawImage(glCanvas, i * W * 0.01 * Math.sin(u * Math.PI), 0);
          ctx.globalAlpha = 1;
        }
        if (transition?.type === "warm-flash-dissolve") {
          ctx.fillStyle =
            "rgba(255,243,201," + 0.6 * Math.sin(u * Math.PI) + ")";
          ctx.fillRect(0, 0, W, H);
        }
        if (t < 4.067 && row?.neuralLights) {
          ctx.globalCompositeOperation = "screen";
          for (const p of row.neuralLights) {
            const x = (p[0] / 640) * W,
              y = (p[1] / 360) * H,
              r = W / 160;
            const g = ctx.createRadialGradient(x, y, 0, x, y, r * 2);
            g.addColorStop(0, "rgba(210,249,255,.65)");
            g.addColorStop(0.3, "rgba(111,201,255,.25)");
            g.addColorStop(1, "rgba(84,159,255,0)");
            ctx.fillStyle = g;
            ctx.fillRect(x - r * 2, y - r * 2, r * 4, r * 4);
          }
          ctx.globalCompositeOperation = "source-over";
        }
        if (shot.action === "windshield") {
          ctx.fillStyle = "#426372";
          ctx.beginPath();
          ctx.moveTo(W * 0.3, H);
          ctx.lineTo(W * 0.44, H * 0.85);
          ctx.lineTo(W * 0.56, H * 0.85);
          ctx.lineTo(W * 0.7, H);
          ctx.fill();
          if (t > 35.25 && t < 35.95) {
            const phase = (t - 35.25) / 0.7,
              a = Math.sin(phase * Math.PI) * 1.7 - 0.8;
            ctx.save();
            ctx.translate(W * 0.48, H * 1.06);
            ctx.rotate(a);
            ctx.strokeStyle = "#262936";
            ctx.lineWidth = W * 0.017;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(-W * 0.12, -H * 0.65);
            ctx.stroke();
            ctx.restore();
          }
        }
        const vignette = ctx.createRadialGradient(
          W * 0.5,
          H * 0.5,
          H * 0.24,
          W * 0.5,
          H * 0.5,
          W * 0.64,
        );
        vignette.addColorStop(0, "rgba(20,14,33,0)");
        vignette.addColorStop(1, "rgba(20,14,33,.28)");
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, W, H);
        if (t >= 41.9 && t < 44.3 && row?.visibleBlackMattes) {
          ctx.fillStyle = "#000";
          for (const path of row.visibleBlackMattes) {
            ctx.beginPath();
            path.forEach((p, i) =>
              i
                ? ctx.lineTo((p[0] / 639) * W, (p[1] / 359) * H)
                : ctx.moveTo((p[0] / 639) * W, (p[1] / 359) * H),
            );
            ctx.closePath();
            ctx.fill();
          }
        }
        ctx.restore();
      },
    };
  },
};
