import React, { useEffect, useRef } from 'react';

interface DottedNetworkBackgroundProps {
  className?: string;
  density?: 'high' | 'medium' | 'low';
  interactive?: boolean;
}

interface Particle3D {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  radius: number;
  color: string;
}

export const DottedNetworkBackground: React.FC<DottedNetworkBackgroundProps> = ({
  className = '',
  interactive = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Mouse tracking for 3D parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      targetMouseX = (e.clientX - width / 2) * 0.4;
      targetMouseY = (e.clientY - height / 2) * 0.4;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Particle pool in 3D coordinate space
    const particleCount = Math.min(130, Math.floor((width * height) / 10000) + 40);
    const particles: Particle3D[] = [];

    const depthRange = 800;
    const fov = 400;

    const colors = [
      'rgba(49, 94, 245, 0.85)',   // Primary Accent Blue
      'rgba(22, 160, 133, 0.90)',  // Teal Accent
      'rgba(59, 130, 246, 0.75)',  // Soft Electric Blue
      'rgba(20, 184, 166, 0.80)',  // Cyan/Mint
    ];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: (Math.random() - 0.5) * width * 1.5,
        y: (Math.random() - 0.5) * height * 1.5,
        z: Math.random() * depthRange - 100,
        vx: (Math.random() - 0.5) * 0.65,
        vy: (Math.random() - 0.5) * 0.65,
        vz: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 2.2 + 1.8,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let time = 0;

    const render = () => {
      time += 0.005;

      // Smooth mouse interpolation
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      // Clear with slight trail or crisp clear
      ctx.clearRect(0, 0, width, height);

      // Camera view rotation angle
      const rotAngle = time * 0.15;
      const cosR = Math.cos(rotAngle);
      const sinR = Math.sin(rotAngle);

      // Projected 2D points cache
      const projected: { x: number; y: number; z: number; scale: number; p: Particle3D }[] = [];

      // Update positions in 3D
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        // Wave undulation
        p.y += Math.sin(time * 2 + p.x * 0.005) * 0.3;

        // Boundary wrap in 3D volume
        const halfW = (width * 1.5) / 2;
        const halfH = (height * 1.5) / 2;
        if (p.x < -halfW) p.x = halfW;
        if (p.x > halfW) p.x = -halfW;
        if (p.y < -halfH) p.y = halfH;
        if (p.y > halfH) p.y = -halfH;
        if (p.z < -100) p.z = depthRange;
        if (p.z > depthRange) p.z = -100;

        // Apply mouse tilt and slight camera rotation
        const rotatedX = p.x * cosR - (p.z - 300) * sinR * 0.15 + mouseX;
        const rotatedY = p.y + mouseY;
        const rotatedZ = p.z + 250;

        // Perspective 3D -> 2D projection
        const scale = fov / Math.max(50, rotatedZ);
        const projX = width / 2 + rotatedX * scale;
        const projY = height / 2 + rotatedY * scale;

        projected.push({
          x: projX,
          y: projY,
          z: rotatedZ,
          scale,
          p,
        });
      }

      // Draw connecting lines between nearby 3D points
      const maxDistance = 150;
      ctx.lineWidth = 1;

      for (let i = 0; i < projected.length; i++) {
        const p1 = projected[i];

        // Skip if outside viewport
        if (p1.x < -100 || p1.x > width + 100 || p1.y < -100 || p1.y > height + 100) continue;

        for (let j = i + 1; j < projected.length; j++) {
          const p2 = projected[j];

          // 2D distance for rendering threshold
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.hypot(dx, dy);

          if (dist < maxDistance) {
            // Depth-based line alpha
            const avgScale = (p1.scale + p2.scale) * 0.5;
            const distRatio = 1 - dist / maxDistance;
            const lineAlpha = Math.min(0.65, Math.max(0.08, distRatio * avgScale * 1.2));

            // Gradient line
            const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
            grad.addColorStop(0, `rgba(49, 94, 245, ${lineAlpha})`);
            grad.addColorStop(1, `rgba(22, 160, 133, ${lineAlpha})`);

            ctx.strokeStyle = grad;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // Draw dots with glowing 3D depth
      for (let i = 0; i < projected.length; i++) {
        const pt = projected[i];
        if (pt.x < -50 || pt.x > width + 50 || pt.y < -50 || pt.y > height + 50) continue;

        const dotRadius = Math.max(1.8, pt.p.radius * pt.scale * 2.2);
        const dotAlpha = Math.min(0.95, Math.max(0.2, pt.scale * 1.4));

        // Outer glow
        const glowRadius = dotRadius * 2.5;
        const glowGrad = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, glowRadius);
        glowGrad.addColorStop(0, `rgba(49, 94, 245, ${dotAlpha * 0.5})`);
        glowGrad.addColorStop(1, 'rgba(49, 94, 245, 0)');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Core dot
        ctx.fillStyle = pt.p.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [interactive]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={{ opacity: 0.95 }}
    />
  );
};
export default DottedNetworkBackground;
