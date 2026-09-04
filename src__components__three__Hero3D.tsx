import { useEffect, useRef, useState } from "react";

function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

/**
 * High quality scroll-linked 3D hero animation.
 * Lazy-loads three.js only on mount so it never blocks first paint / TTI.
 * Falls back to a static gradient + CSS animation when WebGL is unavailable.
 */
export default function Hero3D({ heroSelector }: { heroSelector: string }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [supported] = useState(isWebGLAvailable);

  useEffect(() => {
    if (!supported || !mountRef.current) return;
    let cleanup = () => {};
    let cancelled = false;

    // dynamic import -> code split, keeps three.js out of the main bundle
    import("three").then((THREE) => {
      if (cancelled || !mountRef.current) return;
      cleanup = mountScene(THREE, mountRef.current, heroSelector);
    });

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [supported, heroSelector]);

  if (!supported) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-black to-neutral-800">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-40 h-56 rounded-3xl bg-gradient-to-b from-neutral-600 to-neutral-800 animate-pulse" />
        </div>
      </div>
    );
  }

  return <div ref={mountRef} className="absolute inset-0" />;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mountScene(THREE: any, mount: HTMLDivElement, heroSelector: string) {
  const width = mount.clientWidth;
  const height = mount.clientHeight;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(0, 0, 9);

  const isMobile = window.innerWidth < 768;
  const renderer = new THREE.WebGLRenderer({
    antialias: !isMobile,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
  mount.appendChild(renderer.domElement);

  const ambient = new THREE.AmbientLight(0xffffff, 0.35);
  scene.add(ambient);
  const key = new THREE.PointLight(0xffffff, 2.2, 30);
  key.position.set(4, 5, 6);
  scene.add(key);
  const rim = new THREE.PointLight(0x9aa5b1, 1.4, 30);
  rim.position.set(-6, -3, -4);
  scene.add(rim);

  const group = new THREE.Group();
  scene.add(group);

  const bodyGeo = new THREE.CylinderGeometry(1.05, 1.3, 3.2, 64, 8, false);
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.85, roughness: 0.18 });
  group.add(new THREE.Mesh(bodyGeo, bodyMat));

  const capGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.7, 32);
  const capMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.3, roughness: 0.35 });
  const cap = new THREE.Mesh(capGeo, capMat);
  cap.position.y = 1.95;
  group.add(cap);

  const haloGeo = new THREE.TorusGeometry(2.6, 0.02, 16, 120);
  const haloMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35 });
  const halo = new THREE.Mesh(haloGeo, haloMat);
  halo.rotation.x = Math.PI / 2.3;
  group.add(halo);

  const wireGeo = new THREE.IcosahedronGeometry(3.6, 1);
  const wireMat = new THREE.MeshBasicMaterial({ color: 0xcccccc, wireframe: true, transparent: true, opacity: 0.12 });
  const wireShell = new THREE.Mesh(wireGeo, wireMat);
  scene.add(wireShell);

  const particleCount = isMobile ? 60 : 160;
  const particleGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    const r = 4 + Math.random() * 4;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const particleMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.02, transparent: true, opacity: 0.5 });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  let scrollProgress = 0;
  let targetProgress = 0;
  const heroEl = document.querySelector(heroSelector) as HTMLElement | null;

  function computeScroll() {
    if (!heroEl) return 0;
    const rect = heroEl.getBoundingClientRect();
    const total = rect.height + window.innerHeight;
    const passed = window.innerHeight - rect.top;
    return Math.min(Math.max(passed / total, 0), 1);
  }

  function onScroll() {
    targetProgress = computeScroll();
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  let raf = 0;
  const clock = new THREE.Clock();
  function animate() {
    raf = requestAnimationFrame(animate);
    const dt = clock.getDelta();

    scrollProgress += (targetProgress - scrollProgress) * 0.06;

    group.rotation.y += dt * 0.25 + scrollProgress * 0.01;
    group.rotation.x = Math.sin(scrollProgress * Math.PI) * 0.15;
    group.position.y = -scrollProgress * 1.4;
    group.scale.setScalar(1 - scrollProgress * 0.25);

    wireShell.rotation.y -= dt * 0.08;
    wireShell.rotation.x += dt * 0.04;
    wireShell.material.opacity = 0.12 + scrollProgress * 0.08;

    particles.rotation.y += dt * 0.03;

    camera.position.z = 9 - scrollProgress * 2.5;
    camera.position.x = Math.sin(scrollProgress * Math.PI) * 1.2;
    camera.lookAt(0, group.position.y, 0);

    key.intensity = 2.2 - scrollProgress * 0.8;
    rim.color.setHSL(0, 0, 0.55 + scrollProgress * 0.3);

    renderer.render(scene, camera);
  }
  animate();

  function onResize() {
    const w = mount.clientWidth;
    const h = mount.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener("resize", onResize);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onResize);
    renderer.dispose();
    bodyGeo.dispose();
    bodyMat.dispose();
    capGeo.dispose();
    capMat.dispose();
    wireGeo.dispose();
    wireMat.dispose();
    particleGeo.dispose();
    particleMat.dispose();
    if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
  };
}
