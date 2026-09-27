import { useEffect, useRef } from "react";

const COLORS = {
  base: "#1fe7c9",
  warning: "#ffb020",
  critical: "#ff4d5e",
};

/**
 * A continuously scrolling waveform — the "vital sign" of the bank's
 * economic nervous system. Ambient noise represents normal operation;
 * spikes are injected whenever a new event lands, sized by severity.
 */
export default function PulseMonitor({ spikeRef }) {
  const canvasRef = useRef(null);
  const dataRef = useRef(new Array(220).fill(0));
  const colorStateRef = useRef(0); // 0..1 intensity toward critical color

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let raf;
    let frame = 0;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    function tick() {
      frame++;
      if (frame % 3 === 0) {
        const data = dataRef.current;
        data.shift();

        let pending = spikeRef.current;
        let val = (Math.random() - 0.5) * 6;
        if (pending && pending.strength > 0) {
          val += pending.strength;
          pending.strength *= 0.72;
          colorStateRef.current = Math.min(1, colorStateRef.current + 0.35);
          if (pending.strength < 1) spikeRef.current = null;
        } else {
          colorStateRef.current = Math.max(0, colorStateRef.current - 0.03);
        }
        data.push(val);
      }

      draw();
      raf = requestAnimationFrame(tick);
    }

    function draw() {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      const data = dataRef.current;
      const mid = h / 2;
      const stepX = w / (data.length - 1);

      const intensity = colorStateRef.current;
      let strokeColor = COLORS.base;
      if (intensity > 0.6) strokeColor = COLORS.critical;
      else if (intensity > 0.25) strokeColor = COLORS.warning;

      // glow
      ctx.shadowBlur = 14;
      ctx.shadowColor = strokeColor;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1.75;
      ctx.beginPath();
      data.forEach((v, i) => {
        const x = i * stepX;
        const y = mid - v * 4.2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.shadowBlur = 0;

      // baseline
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, mid);
      ctx.lineTo(w, mid);
      ctx.stroke();
    }

    tick();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [spikeRef]);

  return <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />;
}
