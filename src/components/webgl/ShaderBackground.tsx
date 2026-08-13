"use client";

import { useEffect, useRef } from "react";
import { useBackground } from "./BackgroundProvider";
import {
  SCENE_PALETTE,
  VERTEX_SHADER,
  getScene,
  hexToRgb,
} from "@/lib/webgl/scenes";

/**
 * The live background.
 *
 * A single full-screen triangle in WebGL2, one fragment shader swapped at
 * runtime. Everything that could make this expensive is guarded:
 *
 *  - device pixel ratio is capped at 1.5; a noise field gains nothing from 3x
 *  - the loop stops entirely when the tab is hidden or the canvas scrolls out
 *  - `prefers-reduced-motion` renders exactly one frame and then stops, so the
 *    texture is still there but nothing moves
 *  - if WebGL2 is unavailable the canvas stays empty and the CSS gradient
 *    underneath it is what the reader sees — no error, no blank page
 */
export function ShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { scene, enabled } = useBackground();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !enabled) return;

    const gl = canvas.getContext("webgl2", {
      antialias: false,
      alpha: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
    });
    if (!gl) return; // CSS fallback shows through

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ---------------------------------------------------------- compile */
    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.error("[background] shader error:", gl.getShaderInfoLog(sh));
        gl.deleteShader(sh);
        return null;
      }
      return sh;
    };

    const vs = compile(gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = compile(gl.FRAGMENT_SHADER, getScene(scene).fragment);
    if (!vs || !fs) return;

    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error("[background] link error:", gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    // One triangle that covers the viewport — cheaper than a quad and avoids
    // the diagonal seam a two-triangle quad can show in gradients.
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const loc = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const U = {
      res: gl.getUniformLocation(prog, "u_res"),
      time: gl.getUniformLocation(prog, "u_time"),
      mouse: gl.getUniformLocation(prog, "u_mouse"),
      light: gl.getUniformLocation(prog, "u_light"),
      a: gl.getUniformLocation(prog, "u_a"),
      b: gl.getUniformLocation(prog, "u_b"),
      c: gl.getUniformLocation(prog, "u_c"),
      intensity: gl.getUniformLocation(prog, "u_intensity"),
    };

    /* ---------------------------------------------------------- palette */
    let paletteRgb: [number, number, number][] = [];
    let isLight = 0;

    const readTheme = () => {
      const theme =
        document.documentElement.getAttribute("data-theme") === "light"
          ? "light"
          : "dark";
      isLight = theme === "light" ? 1 : 0;
      paletteRgb = SCENE_PALETTE[theme][scene].map(hexToRgb);
    };
    readTheme();

    const themeObserver = new MutationObserver(readTheme);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    /* ------------------------------------------------------------ sizing */
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.floor(canvas.clientWidth * dpr);
      const h = Math.floor(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    /* ------------------------------------------------------------- input */
    const target = { x: 0, y: 0 };
    const eased = { x: 0, y: 0 };
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    const onMove = (e: PointerEvent) => {
      target.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.y = 1 - (e.clientY / window.innerHeight) * 2;
    };
    if (fine && !reduced) window.addEventListener("pointermove", onMove, { passive: true });

    /* -------------------------------------------------------------- loop */
    let raf = 0;
    let running = false;
    let start = performance.now();
    let elapsed = 0;

    const draw = (now: number) => {
      elapsed = (now - start) / 1000;
      eased.x += (target.x - eased.x) * 0.045;
      eased.y += (target.y - eased.y) * 0.045;

      gl.uniform2f(U.res, canvas.width, canvas.height);
      gl.uniform1f(U.time, elapsed);
      gl.uniform2f(U.mouse, eased.x, eased.y);
      gl.uniform1f(U.light, isLight);
      if (paletteRgb.length === 3) {
        gl.uniform3fv(U.a, paletteRgb[0]);
        gl.uniform3fv(U.b, paletteRgb[1]);
        gl.uniform3fv(U.c, paletteRgb[2]);
      }
      gl.uniform1f(U.intensity, isLight ? 0.65 : 0.85);

      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (running) raf = requestAnimationFrame(draw);
    };

    const startLoop = () => {
      if (running || reduced) return;
      running = true;
      start = performance.now() - elapsed * 1000;
      raf = requestAnimationFrame(draw);
    };
    const stopLoop = () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    // Only run while actually on screen.
    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting && !document.hidden ? startLoop() : stopLoop()),
      { threshold: 0 },
    );
    io.observe(canvas);

    const onVisibility = () => (document.hidden ? stopLoop() : startLoop());
    document.addEventListener("visibilitychange", onVisibility);

    // Reduced motion still gets the texture — just frozen.
    draw(performance.now());
    if (!reduced) startLoop();

    return () => {
      stopLoop();
      io.disconnect();
      ro.disconnect();
      themeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onMove);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buf);
    };
  }, [scene, enabled]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-50 overflow-hidden"
    >
      {enabled && (
        <canvas
          ref={canvasRef}
          className="h-full w-full opacity-90 transition-opacity duration-1000"
        />
      )}
      {/* Light reading scrim */}
      <div className="absolute inset-0 bg-void/15" />
    </div>
  );
}
