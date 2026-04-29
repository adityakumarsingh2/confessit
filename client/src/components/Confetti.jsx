import { useEffect, useRef } from 'react';
import styles from './Confetti.module.css';

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#a855f7', '#f43f5e'];

function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

function createParticle(canvas) {
    return {
        x: randomBetween(0, canvas.width),
        y: randomBetween(-20, -10),
        r: randomBetween(6, 14),
        d: randomBetween(0.5, 2.5),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        tilt: randomBetween(-10, 10),
        tiltAngle: 0,
        tiltAngleIncrementalSign: Math.random() < 0.5 ? -1 : 1,
        shape: Math.random() < 0.5 ? 'circle' : 'square',
    };
}

export default function Confetti({ active, onDone }) {
    const canvasRef = useRef(null);
    const particlesRef = useRef([]);
    const rafRef = useRef(null);

    useEffect(() => {
        if (!active) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        particlesRef.current = Array.from({ length: 160 }, () => createParticle(canvas));

        let done = false;
        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particlesRef.current.forEach((p, i) => {
                p.tiltAngle += 0.15 * p.tiltAngleIncrementalSign;
                p.y += Math.cos(p.d) + 1.5;
                p.x += Math.sin(p.d * 0.4);
                p.tilt = Math.sin(p.tiltAngle) * 12;

                ctx.beginPath();
                ctx.fillStyle = p.color;
                ctx.globalAlpha = Math.max(0, 1 - (p.y / canvas.height));
                if (p.shape === 'circle') {
                    ctx.arc(p.x + p.tilt, p.y, p.r, 0, Math.PI * 2);
                } else {
                    ctx.fillRect(p.x + p.tilt, p.y, p.r, p.r * 0.6);
                }
                ctx.fill();
            });

            ctx.globalAlpha = 1;

            // Regenerate particles that fall off screen for 3 seconds
            if (!done) {
                particlesRef.current = particlesRef.current.map(p =>
                    p.y > canvas.height ? createParticle(canvas) : p
                );
            }

            const allOut = particlesRef.current.every(p => p.y > canvas.height);
            if (done && allOut) {
                cancelAnimationFrame(rafRef.current);
                if (onDone) onDone();
                return;
            }

            rafRef.current = requestAnimationFrame(draw);
        };

        rafRef.current = requestAnimationFrame(draw);

        // Stop spawning after 2.5 seconds
        const stopSpawn = setTimeout(() => { done = true; }, 2500);

        return () => {
            cancelAnimationFrame(rafRef.current);
            clearTimeout(stopSpawn);
        };
    }, [active, onDone]);

    if (!active) return null;

    return <canvas ref={canvasRef} className={styles.canvas} />;
}
