/**
 * Light-touch Three.js hero backdrop: a slowly-rotating field of points with
 * proximity connection lines, evoking a global network without being a
 * literal globe. Only runs on pages with a `#hero-three-canvas` mount, caps
 * device pixel ratio for performance, and renders a single static frame
 * under `prefers-reduced-motion` instead of animating.
 *
 * The render loop is gated by an IntersectionObserver on the hero section,
 * not just tab visibility — a continuously-rendering WebGL scene is one of
 * the biggest contributors to scroll jank on a page like this, since it
 * competes with the main thread's scroll/composite work every frame even
 * after a visitor has scrolled well past it. Pausing it the moment the hero
 * leaves the viewport (and resuming if they scroll back up) removes that
 * cost from every scroll after the first screenful.
 */
(function () {
  function init() {
    const host = document.getElementById('hero-three-canvas');
    if (!host || typeof THREE === 'undefined') return;

    const reduced = window.Meridian?.a11y?.prefersReducedMotion?.();
    const width = host.clientWidth;
    const height = host.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.z = 9;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
    renderer.setSize(width, height);
    host.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const COUNT = 60;
    const radius = 4.2;
    const positions = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      const v = new THREE.Vector3().randomDirection().multiplyScalar(radius * (0.55 + Math.random() * 0.45));
      positions.set([v.x, v.y, v.z], i * 3);
    }

    const pointsGeo = new THREE.BufferGeometry();
    pointsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const pointsMat = new THREE.PointsMaterial({ color: 0x1E3A8A, size: 0.06, transparent: true, opacity: 0.75 });
    group.add(new THREE.Points(pointsGeo, pointsMat));

    const linePositions = [];
    const maxDist = 1.7;
    for (let i = 0; i < COUNT; i++) {
      for (let j = i + 1; j < COUNT; j++) {
        const dx = positions[i * 3] - positions[j * 3];
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < maxDist) {
          linePositions.push(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
          linePositions.push(positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]);
        }
      }
    }
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linePositions), 3));
    const lineMat = new THREE.LineBasicMaterial({ color: 0xFBBF24, transparent: true, opacity: 0.16 });
    group.add(new THREE.LineSegments(lineGeo, lineMat));

    let frameId = null;
    let tabVisible = true;
    let inViewport = true;

    function renderFrame() {
      renderer.render(scene, camera);
    }

    function animate() {
      if (!tabVisible || !inViewport) { frameId = null; return; }
      group.rotation.y += 0.0016;
      group.rotation.x += 0.0004;
      renderFrame();
      frameId = requestAnimationFrame(animate);
    }

    function maybeResume() {
      if (reduced) return;
      if (tabVisible && inViewport && !frameId) animate();
    }

    if (reduced) {
      group.rotation.set(0.3, 0.5, 0);
      renderFrame();
    } else {
      animate();
    }

    document.addEventListener('visibilitychange', () => {
      tabVisible = document.visibilityState === 'visible';
      maybeResume();
      if (!tabVisible && frameId) { cancelAnimationFrame(frameId); frameId = null; }
    });

    const viewportObserver = new IntersectionObserver((entries) => {
      inViewport = entries[0].isIntersecting;
      maybeResume();
      if (!inViewport && frameId) { cancelAnimationFrame(frameId); frameId = null; }
    }, { threshold: 0 });
    viewportObserver.observe(host.closest('.hero-m') || host);

    const resizeObserver = new ResizeObserver(() => {
      const w = host.clientWidth, h = host.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      if (reduced || !frameId) renderFrame();
    });
    resizeObserver.observe(host);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
