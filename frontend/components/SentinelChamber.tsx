"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { Shield, Zap, RotateCcw, Play, Activity } from "lucide-react";

interface SentinelChamberProps {
  onTriggerSimulate?: () => void;
  isSimulating?: boolean;
  attackCount?: number;
}

interface SparkParticle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
  color: THREE.Color;
}

export const SentinelChamber: React.FC<SentinelChamberProps> = ({
  onTriggerSimulate,
  isSimulating = false,
  attackCount = 0,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isArmed, setIsArmed] = useState(true);
  const [deflectionCount, setDeflectionCount] = useState(attackCount || 12);
  const [autoRotate, setAutoRotate] = useState(true);
  const [hudMessage, setHudMessage] = useState("COMPLETE MEDIATION ACTIVE · 0 BYPASS VECTORS");

  // Ref to trigger deflection from external simulation props
  const triggerDeflectionRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (attackCount > 0) {
      setDeflectionCount(attackCount);
    }
  }, [attackCount]);

  useEffect(() => {
    if (!canvasRef.current || !mountRef.current) return;

    const canvas = canvasRef.current;
    const container = mountRef.current;

    // Dimensions
    let width = container.clientWidth || 800;
    let height = container.clientHeight || 460;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x02050b, 0.035);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 2.5, 9);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x02050b, 0);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0x0a192f, 2.5);
    scene.add(ambientLight);

    const cyanPointLight = new THREE.PointLight(0x06b6d4, 4, 30);
    cyanPointLight.position.set(0, 0, 0);
    scene.add(cyanPointLight);

    const topLight = new THREE.DirectionalLight(0x38bdf8, 2);
    topLight.position.set(5, 10, 7);
    scene.add(topLight);

    const rimLight = new THREE.DirectionalLight(0xf43f5e, 1.2);
    rimLight.position.set(-8, -4, -5);
    scene.add(rimLight);

    // 3. Central Shield Core (Reference Monitor Boundary)
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    // Inner faceted refractive icosahedron
    const coreGeom = new THREE.IcosahedronGeometry(1.4, 1);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0x06b6d4,
      emissive: 0x082f49,
      emissiveIntensity: 0.6,
      roughness: 0.15,
      metalness: 0.1,
      transmission: 0.85,
      ior: 1.45,
      transparent: true,
      opacity: 0.75,
      wireframe: false,
    });
    const coreMesh = new THREE.Mesh(coreGeom, coreMat);
    coreGroup.add(coreMesh);

    // Outer wireframe lattice
    const wireGeom = new THREE.IcosahedronGeometry(1.65, 1);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const wireMesh = new THREE.Mesh(wireGeom, wireMat);
    coreGroup.add(wireMesh);

    // Glowing Vertex Nodes on Wireframe
    const vertexCount = wireGeom.attributes.position.count;
    const vertexPointsGeom = new THREE.BufferGeometry();
    vertexPointsGeom.setAttribute(
      "position",
      wireGeom.attributes.position.clone()
    );
    const vertexPointsMat = new THREE.PointsMaterial({
      color: 0x67e8f9,
      size: 0.12,
      transparent: true,
      opacity: 0.9,
    });
    const vertexPoints = new THREE.Points(vertexPointsGeom, vertexPointsMat);
    coreGroup.add(vertexPoints);

    // 4. Orbital Energy Rings (Shield Boundary Lattices)
    const ringGroup = new THREE.Group();
    scene.add(ringGroup);

    const createShieldRing = (radius: number, tiltX: number, tiltY: number, color: number) => {
      const ringGeom = new THREE.TorusGeometry(radius, 0.02, 16, 100);
      const ringMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.45,
      });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.rotation.x = tiltX;
      ring.rotation.y = tiltY;
      return ring;
    };

    const ring1 = createShieldRing(2.6, Math.PI / 3, 0, 0x06b6d4);
    const ring2 = createShieldRing(3.2, -Math.PI / 4, Math.PI / 6, 0x0284c7);
    const ring3 = createShieldRing(3.9, Math.PI / 2.2, -Math.PI / 5, 0x38bdf8);
    ringGroup.add(ring1);
    ringGroup.add(ring2);
    ringGroup.add(ring3);

    // 5. Orbital Agent & Tool Sensor Nodes
    interface OrbitalNodeDef {
      mesh: THREE.Group;
      angle: number;
      speed: number;
      radius: number;
      type: "untrusted" | "trusted" | "sink";
      label: string;
      color: number;
    }

    const orbitalNodes: OrbitalNodeDef[] = [];

    const createOrbitalSensor = (
      type: "untrusted" | "trusted" | "sink",
      label: string,
      color: number,
      radius: number,
      speed: number,
      initialAngle: number
    ) => {
      const group = new THREE.Group();

      // Sensor sphere
      const sphereGeom = new THREE.SphereGeometry(0.18, 16, 16);
      const sphereMat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.8,
        roughness: 0.2,
      });
      const sphere = new THREE.Mesh(sphereGeom, sphereMat);
      group.add(sphere);

      // Sensor halo ring
      const haloGeom = new THREE.RingGeometry(0.26, 0.3, 24);
      const haloMat = new THREE.MeshBasicMaterial({
        color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6,
      });
      const halo = new THREE.Mesh(haloGeom, haloMat);
      halo.rotation.x = Math.PI / 2;
      group.add(halo);

      scene.add(group);

      return {
        mesh: group,
        angle: initialAngle,
        speed,
        radius,
        type,
        label,
        color,
      };
    };

    // Node 1: Untrusted Web Scrape / Ingestion (Rose)
    orbitalNodes.push(
      createOrbitalSensor("untrusted", "Untrusted Web Scrape", 0xf43f5e, 4.3, 0.008, 0)
    );
    // Node 2: Untrusted Invoice PDF Ingestion (Amber)
    orbitalNodes.push(
      createOrbitalSensor("untrusted", "Vendor Invoice PDF", 0xf59e0b, 4.7, -0.006, 1.8)
    );
    // Node 3: Untrusted Customer Support Ticket (Rose)
    orbitalNodes.push(
      createOrbitalSensor("untrusted", "Customer Ticket Webhook", 0xf43f5e, 4.1, 0.007, 3.4)
    );
    // Node 4: User Trusted Context (Cyan)
    orbitalNodes.push(
      createOrbitalSensor("trusted", "User Verified Session", 0x06b6d4, 3.7, -0.009, 4.6)
    );
    // Node 5: Protected Execution Sink (Emerald)
    orbitalNodes.push(
      createOrbitalSensor("sink", "Protected Shell/DB Sink", 0x10b981, 3.3, 0.005, 5.7)
    );

    // 6. Ambient Defense Particle Force-Field
    const particleCount = 280;
    const particleGeom = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities: { x: number; y: number; z: number }[] = [];

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 2.0 + Math.random() * 3.2;

      particlePositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = r * Math.cos(phi);

      particleVelocities.push({
        x: (Math.random() - 0.5) * 0.006,
        y: (Math.random() - 0.5) * 0.006,
        z: (Math.random() - 0.5) * 0.006,
      });
    }

    particleGeom.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3)
    );

    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.045,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeom, particleMat);
    scene.add(particleSystem);

    // 7. Shockwave Deflection Ring
    const shockwaveGeom = new THREE.RingGeometry(1.6, 1.75, 48);
    const shockwaveMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    const shockwaveMesh = new THREE.Mesh(shockwaveGeom, shockwaveMat);
    scene.add(shockwaveMesh);

    // 8. Dynamic Taint Attack Beam & Radial Spark Burst Physics
    interface BeamPacket {
      mesh: THREE.Mesh;
      startPos: THREE.Vector3;
      targetPos: THREE.Vector3;
      progress: number;
      speed: number;
      active: boolean;
    }

    const activeBeams: BeamPacket[] = [];
    const activeSparks: SparkParticle[] = [];

    // Spark points mesh
    const maxSparks = 200;
    const sparkGeom = new THREE.BufferGeometry();
    const sparkPositions = new Float32Array(maxSparks * 3);
    const sparkColors = new Float32Array(maxSparks * 3);
    sparkGeom.setAttribute("position", new THREE.BufferAttribute(sparkPositions, 3));
    sparkGeom.setAttribute("color", new THREE.BufferAttribute(sparkColors, 3));

    const sparkMat = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
    });
    const sparkSystem = new THREE.Points(sparkGeom, sparkMat);
    scene.add(sparkSystem);

    // Helper: spawn deflection sparks
    const spawnDeflectionSparks = (hitPos: THREE.Vector3) => {
      const sparkCount = 45;
      for (let i = 0; i < sparkCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const speed = 0.08 + Math.random() * 0.16;

        activeSparks.push({
          x: hitPos.x,
          y: hitPos.y,
          z: hitPos.z,
          vx: Math.sin(phi) * Math.cos(theta) * speed,
          vy: Math.sin(phi) * Math.sin(theta) * speed,
          vz: Math.cos(phi) * speed,
          life: 0,
          maxLife: 25 + Math.random() * 20,
          color: Math.random() > 0.4 ? new THREE.Color(0xf43f5e) : new THREE.Color(0x38bdf8),
        });
      }

      // Trigger shockwave ring
      shockwaveMesh.position.copy(hitPos);
      shockwaveMesh.lookAt(camera.position);
      shockwaveMesh.scale.set(1, 1, 1);
      shockwaveMat.opacity = 0.9;

      // Pulse core
      coreMat.emissive.setHex(0x06b6d4);
      coreMat.emissiveIntensity = 2.2;
    };

    // Helper: launch simulated attack beam
    const fireTaintAttack = () => {
      // Pick untrusted node as origin
      const sourceNode = orbitalNodes[0];
      const startPos = sourceNode.mesh.position.clone();
      const targetPos = new THREE.Vector3(0, 0, 0);

      // Create glowing beam packet
      const geom = new THREE.SphereGeometry(0.12, 12, 12);
      const mat = new THREE.MeshBasicMaterial({
        color: 0xf43f5e,
        transparent: true,
        opacity: 0.95,
      });
      const beamMesh = new THREE.Mesh(geom, mat);
      beamMesh.position.copy(startPos);
      scene.add(beamMesh);

      activeBeams.push({
        mesh: beamMesh,
        startPos,
        targetPos,
        progress: 0,
        speed: 0.035,
        active: true,
      });

      setHudMessage("INTERCEPTING TAINT BEAM · SINK BARRIER ENGAGED");
    };

    // Attach function to ref for external button triggers
    triggerDeflectionRef.current = fireTaintAttack;

    // 9. Interactive Mouse Drag / Tilt Controls (Drei / Orbit style)
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    const rotationVelocity = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) {
        // Subtle parallax camera tilt on hover
        const rect = canvas.getBoundingClientRect();
        const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
        camera.position.x = normX * 0.6;
        camera.position.y = 2.5 + normY * 0.4;
        camera.lookAt(0, 0, 0);
        return;
      }

      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      rotationVelocity.x = deltaY * 0.005;
      rotationVelocity.y = deltaX * 0.005;

      coreGroup.rotation.y += rotationVelocity.y;
      coreGroup.rotation.x += rotationVelocity.x;
      ringGroup.rotation.y += rotationVelocity.y;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z = THREE.MathUtils.clamp(
        camera.position.z + e.deltaY * 0.005,
        5.5,
        14.0
      );
    };

    canvas.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });

    // Touch support for mobile / tablets
    let touchStart = { x: 0, y: 0 };
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - touchStart.x;
      const deltaY = e.touches[0].clientY - touchStart.y;
      coreGroup.rotation.y += deltaX * 0.008;
      coreGroup.rotation.x += deltaY * 0.008;
      touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const onTouchEnd = () => {
      isDragging = false;
    };
    canvas.addEventListener("touchstart", onTouchStart);
    canvas.addEventListener("touchmove", onTouchMove);
    canvas.addEventListener("touchend", onTouchEnd);

    // 10. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Ambient rotations
      if (autoRotate && !isDragging) {
        coreGroup.rotation.y += 0.004;
        coreGroup.rotation.x += 0.001;
        ringGroup.rotation.y += 0.002;
        ringGroup.rotation.z += 0.0015;
      }

      // Restore core emissive intensity gradually
      if (coreMat.emissiveIntensity > 0.6) {
        coreMat.emissiveIntensity = THREE.MathUtils.lerp(
          coreMat.emissiveIntensity,
          0.6,
          0.05
        );
      }

      // Orbital nodes revolution
      orbitalNodes.forEach((node) => {
        node.angle += node.speed;
        node.mesh.position.x = Math.cos(node.angle) * node.radius;
        node.mesh.position.z = Math.sin(node.angle) * node.radius;
        node.mesh.position.y = Math.sin(node.angle * 2) * 0.45;
        node.mesh.rotation.y += 0.02;
      });

      // Ambient particles circulation
      const positions = particleGeom.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const vel = particleVelocities[i];
        positions[i * 3] += vel.x;
        positions[i * 3 + 1] += vel.y;
        positions[i * 3 + 2] += vel.z;

        // Wrap around boundary radius
        const d = Math.sqrt(
          positions[i * 3] ** 2 +
            positions[i * 3 + 1] ** 2 +
            positions[i * 3 + 2] ** 2
        );
        if (d > 5.5 || d < 1.7) {
          positions[i * 3] *= -0.85;
          positions[i * 3 + 1] *= -0.85;
          positions[i * 3 + 2] *= -0.85;
        }
      }
      particleGeom.attributes.position.needsUpdate = true;

      // Active Taint Beams progression & deflection
      for (let b = activeBeams.length - 1; b >= 0; b--) {
        const beam = activeBeams[b];
        beam.progress += beam.speed;

        // Interpolate along line to shield boundary
        beam.mesh.position.lerpVectors(beam.startPos, beam.targetPos, beam.progress);

        // Check if reached shield boundary (r <= 1.8)
        const dist = beam.mesh.position.length();
        if (dist <= 1.8 && beam.active) {
          beam.active = false;
          spawnDeflectionSparks(beam.mesh.position.clone());
          scene.remove(beam.mesh);
          activeBeams.splice(b, 1);

          setDeflectionCount((prev) => prev + 1);
          setHudMessage("VIOLENT TAINT DEFLECTION · SINK SANITIZED (0.038ms)");
        }
      }

      // Spark particles physics update
      const sparkPosAttr = sparkGeom.attributes.position.array as Float32Array;
      const sparkColAttr = sparkGeom.attributes.color.array as Float32Array;

      let sparkIdx = 0;
      for (let s = activeSparks.length - 1; s >= 0; s--) {
        const spark = activeSparks[s];
        spark.life++;

        spark.x += spark.vx;
        spark.y += spark.vy;
        spark.z += spark.vz;

        // Drag friction
        spark.vx *= 0.94;
        spark.vy *= 0.94;
        spark.vz *= 0.94;

        if (spark.life >= spark.maxLife) {
          activeSparks.splice(s, 1);
        } else if (sparkIdx < maxSparks) {
          const fade = 1 - spark.life / spark.maxLife;
          sparkPosAttr[sparkIdx * 3] = spark.x;
          sparkPosAttr[sparkIdx * 3 + 1] = spark.y;
          sparkPosAttr[sparkIdx * 3 + 2] = spark.z;

          sparkColAttr[sparkIdx * 3] = spark.color.r * fade;
          sparkColAttr[sparkIdx * 3 + 1] = spark.color.g * fade;
          sparkColAttr[sparkIdx * 3 + 2] = spark.color.b * fade;

          sparkIdx++;
        }
      }

      // Clear remaining spark buffers
      for (let k = sparkIdx; k < maxSparks; k++) {
        sparkPosAttr[k * 3] = 0;
        sparkPosAttr[k * 3 + 1] = 0;
        sparkPosAttr[k * 3 + 2] = 0;
        sparkColAttr[k * 3] = 0;
        sparkColAttr[k * 3 + 1] = 0;
        sparkColAttr[k * 3 + 2] = 0;
      }
      sparkGeom.attributes.position.needsUpdate = true;
      sparkGeom.attributes.color.needsUpdate = true;

      // Shockwave ring expansion & decay
      if (shockwaveMat.opacity > 0) {
        shockwaveMesh.scale.multiplyScalar(1.04);
        shockwaveMat.opacity -= 0.03;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 11. Resize Handler
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);

      // Dispose Three.js objects
      coreGeom.dispose();
      coreMat.dispose();
      wireGeom.dispose();
      wireMat.dispose();
      particleGeom.dispose();
      particleMat.dispose();
      sparkGeom.dispose();
      sparkMat.dispose();
      renderer.dispose();
    };
  }, [autoRotate]);

  const handleManualDeflect = () => {
    if (triggerDeflectionRef.current) {
      triggerDeflectionRef.current();
    }
    if (onTriggerSimulate) {
      onTriggerSimulate();
    }
  };

  return (
    <div
      ref={mountRef}
      className="relative w-full h-[480px] lg:h-[520px] rounded-3xl overflow-hidden cyber-card border border-cyan-500/20 shadow-[0_12px_48px_-8px_rgba(0,0,0,0.85)] group select-none"
    >
      {/* 3D WebGL Canvas */}
      <canvas ref={canvasRef} className="w-full h-full cursor-grab active:cursor-grabbing block" />

      {/* Military-Grade HUD Telemetry Overlay (Top Bar) */}
      <div className="absolute top-5 left-6 right-6 flex flex-wrap items-center justify-between gap-4 pointer-events-none">
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-sans font-bold flex items-center gap-2 backdrop-blur-md">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span>REFERENCE MONITOR BOUNDARY · ARMED</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/70 border border-slate-800 text-slate-300 text-xs font-sans font-medium backdrop-blur-md">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>Anderson 1972 Invariant</span>
          </div>
        </div>

        {/* Tactile Control Pill Buttons */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={handleManualDeflect}
            className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 text-rose-200 text-xs font-sans font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(244,63,94,0.3)] transition cursor-pointer backdrop-blur-md active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-rose-300 text-rose-300" />
            <span>Deflect Taint Beam</span>
          </button>

          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-2 rounded-xl border text-xs transition cursor-pointer backdrop-blur-md ${
              autoRotate
                ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-300"
                : "bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white"
            }`}
            title="Toggle Orbit Rotation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Orbit & Tilt Legend (Middle-Right) */}
      <div className="absolute right-6 top-24 hidden md:flex flex-col gap-2.5 p-3 rounded-2xl bg-black/60 border border-slate-800/80 text-[11px] font-sans text-slate-300 backdrop-blur-md pointer-events-none">
        <div className="font-bold text-xs text-cyan-300 mb-0.5">3D SENTINEL LATTICE</div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <span>Faceted Reference Shield</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-400" />
          <span>Untrusted Web Scrapes</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>Invoice Memo Injections</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Sandboxed Tool Sink</span>
        </div>
        <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800">
          Drag to rotate · Scroll to zoom
        </div>
      </div>

      {/* HUD Telemetry Ticker (Bottom Bar) */}
      <div className="absolute bottom-4 left-6 right-6 flex flex-wrap items-center justify-between gap-4 pointer-events-none">
        <div className="flex items-center gap-3 text-xs font-mono text-cyan-300/90 bg-black/60 px-4 py-2 rounded-xl border border-cyan-500/20 backdrop-blur-md">
          <Activity className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: "6s" }} />
          <span>{hudMessage}</span>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono bg-black/60 px-4 py-2 rounded-xl border border-slate-800 backdrop-blur-md">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span>DEFLECTED:</span>
            <span className="text-emerald-400 font-bold">{deflectionCount}</span>
          </div>
          <div className="text-slate-600">|</div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span>LATENCY:</span>
            <span className="text-cyan-400 font-bold">&lt;0.038ms</span>
          </div>
          <div className="text-slate-600">|</div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span>BYPASS:</span>
            <span className="text-emerald-400 font-bold">0.0%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
