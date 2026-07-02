import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { VideoItem } from '../types';
import { Play } from 'lucide-react';

interface ThreeDGalleryProps {
  videos: VideoItem[];
  selectedIndex: number;
  onSelectVideo: (index: number) => void;
  colorFilters: {
    exposure: number;
    saturation: number;
    contrast: number;
    hue: number;
  };
  onPlayVideo: (video: VideoItem) => void;
}

export default function ThreeDGallery({
  videos,
  selectedIndex,
  onSelectVideo,
  colorFilters,
  onPlayVideo,
}: ThreeDGalleryProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [positions, setPositions] = useState<{ id: string; x: number; y: number; z: number; scale: number; opacity: number }[]>([]);

  // Keep references for animation state to avoid recreating Three.js contexts
  const stateRef = useRef({
    rotationY: 0,
    targetRotationY: 0,
    isDragging: false,
    startX: 0,
    startRotationY: 0,
    width: 0,
    height: 0,
  });

  // Track total video count
  const videoCount = videos.length;

  // Let selectedIndex trigger a scroll to the correct target rotation
  useEffect(() => {
    if (!stateRef.current.isDragging && videoCount > 0) {
      const anglePerItem = (Math.PI * 2) / videoCount;
      stateRef.current.targetRotationY = -selectedIndex * anglePerItem;
    }
  }, [selectedIndex, videoCount]);

  useEffect(() => {
    if (!mountRef.current || !canvasRef.current || videoCount === 0) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    stateRef.current.width = width;
    stateRef.current.height = height;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2('#09090b', 0.04);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 15);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 3. Dynamic Colorful Ambient Lighting
    const ambientLight = new THREE.AmbientLight('#18181b', 1.5);
    scene.add(ambientLight);

    const pointLightRed = new THREE.PointLight('#ec4899', 8, 30);
    pointLightRed.position.set(-10, 5, 5);
    scene.add(pointLightRed);

    const pointLightBlue = new THREE.PointLight('#06b6d4', 8, 30);
    pointLightBlue.position.set(10, -5, 5);
    scene.add(pointLightBlue);

    const pointLightPurple = new THREE.PointLight('#a855f7', 10, 25);
    pointLightPurple.position.set(0, 10, -5);
    scene.add(pointLightPurple);

    // 4. Colorful Glowing Star Particle System
    const particleCount = 400;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const colorPalette = [
      new THREE.Color('#ec4899'), // neon pink
      new THREE.Color('#a855f7'), // purple
      new THREE.Color('#06b6d4'), // cyan
      new THREE.Color('#eab308'), // yellow
    ];

    for (let i = 0; i < particleCount; i++) {
      const r = 12 + Math.random() * 20;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      particlePositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = r * Math.cos(phi);

      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      particleColors[i * 3] = color.r;
      particleColors[i * 3 + 1] = color.g;
      particleColors[i * 3 + 2] = color.b;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const createStarTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 16;
      canvas.height = 16;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 16, 16);
      }
      return new THREE.CanvasTexture(canvas);
    };

    const starMaterial = new THREE.PointsMaterial({
      size: 0.15,
      map: createStarTexture(),
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const starPoints = new THREE.Points(particleGeometry, starMaterial);
    scene.add(starPoints);

    // 5. 3D WebGL Nodes for Projecting Card Coordinates
    const galleryGroup = new THREE.Group();
    scene.add(galleryGroup);

    const radius = 8.5;
    const verticalAmplitude = 2.0;
    const cardNodes: THREE.Object3D[] = [];

    videos.forEach((video, index) => {
      const node = new THREE.Object3D();
      const angle = (index / videoCount) * Math.PI * 2;
      
      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius;
      const y = Math.sin(angle * 2) * verticalAmplitude;

      node.position.set(x, y, z);
      node.lookAt(0, y, 0);
      
      galleryGroup.add(node);
      cardNodes.push(node);
    });

    // 6. Render Loop and Projection Calculation
    const tempV = new THREE.Vector3();
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Spin points and background starfield
      starPoints.rotation.y += 0.0006;
      starPoints.rotation.x += 0.0002;

      // Smooth interpolation of standard carousel rotation
      const rotationSpeed = 0.08;
      stateRef.current.rotationY += (stateRef.current.targetRotationY - stateRef.current.rotationY) * rotationSpeed;
      galleryGroup.rotation.y = stateRef.current.rotationY;

      // Project coordinates
      const projectedPositions = videos.map((video, idx) => {
        const node = cardNodes[idx];
        if (!node) return { id: video.id, x: -1000, y: -1000, z: 0, scale: 0, opacity: 0 };

        node.getWorldPosition(tempV);
        tempV.project(camera);

        const x = (tempV.x * 0.5 + 0.5) * stateRef.current.width;
        const y = (1 - (tempV.y * 0.5 + 0.5)) * stateRef.current.height;
        
        const nodeWorldPos = new THREE.Vector3();
        node.getWorldPosition(nodeWorldPos);
        const distance = camera.position.distanceTo(nodeWorldPos);

        const maxDist = 24;
        const minDist = 6.0;
        const normalizedDist = Math.max(0, Math.min(1, (distance - minDist) / (maxDist - minDist)));
        
        const scale = Math.max(0.2, 1.15 - normalizedDist * 0.9);
        const opacity = Math.max(0.05, 1.0 - normalizedDist * 0.95);
        const zIndex = Math.round((1.0 - normalizedDist) * 100);

        return {
          id: video.id,
          x,
          y,
          z: zIndex,
          scale,
          opacity,
        };
      });

      setPositions(projectedPositions);
      renderer.render(scene, camera);
    };

    animate();

    // 7. Handle Window Resizing
    const handleResize = () => {
      if (!mountRef.current || !canvasRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;

      stateRef.current.width = w;
      stateRef.current.height = h;

      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      particleGeometry.dispose();
      starMaterial.dispose();
    };
  }, [videos, videoCount]);

  const getFilterStyle = () => {
    return {
      filter: `brightness(${colorFilters.exposure}%) saturate(${colorFilters.saturation}%) contrast(${colorFilters.contrast}%) hue-rotate(${colorFilters.hue}deg)`,
    };
  };

  // Drag and Swiping handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    stateRef.current.isDragging = true;
    stateRef.current.startX = e.clientX;
    stateRef.current.startRotationY = stateRef.current.rotationY;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!stateRef.current.isDragging) return;
    const deltaX = e.clientX - stateRef.current.startX;
    
    stateRef.current.targetRotationY = stateRef.current.startRotationY + deltaX * 0.003;
    
    const anglePerItem = (Math.PI * 2) / videoCount;
    const currentRot = -stateRef.current.targetRotationY;
    let approxIndex = Math.round(currentRot / anglePerItem) % videoCount;
    if (approxIndex < 0) approxIndex += videoCount;
    
    if (approxIndex !== selectedIndex && approxIndex >= 0 && approxIndex < videoCount) {
      onSelectVideo(approxIndex);
    }
  };

  const handleMouseUpOrLeave = () => {
    if (!stateRef.current.isDragging) return;
    stateRef.current.isDragging = false;
    
    const anglePerItem = (Math.PI * 2) / videoCount;
    const snapIndex = Math.round(-stateRef.current.targetRotationY / anglePerItem);
    stateRef.current.targetRotationY = -snapIndex * anglePerItem;

    let finalIndex = snapIndex % videoCount;
    if (finalIndex < 0) finalIndex += videoCount;
    onSelectVideo(finalIndex);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 0) return;
    stateRef.current.isDragging = true;
    stateRef.current.startX = e.touches[0].clientX;
    stateRef.current.startRotationY = stateRef.current.rotationY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!stateRef.current.isDragging || e.touches.length === 0) return;
    const deltaX = e.touches[0].clientX - stateRef.current.startX;
    stateRef.current.targetRotationY = stateRef.current.startRotationY + deltaX * (0.003 * 1.5);

    const anglePerItem = (Math.PI * 2) / videoCount;
    const currentRot = -stateRef.current.targetRotationY;
    let approxIndex = Math.round(currentRot / anglePerItem) % videoCount;
    if (approxIndex < 0) approxIndex += videoCount;
    
    if (approxIndex !== selectedIndex && approxIndex >= 0 && approxIndex < videoCount) {
      onSelectVideo(approxIndex);
    }
  };

  return (
    <div
      ref={mountRef}
      className="relative w-full h-full select-none overflow-hidden cursor-grab active:cursor-grabbing bg-zinc-950"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUpOrLeave}
      id="three-canvas-container"
    >
      {/* Real-time WebGL Canvas in background */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Grid line guidelines for FCP workspace feel */}
      <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 opacity-5 pointer-events-none">
        <div className="border-r border-b border-zinc-500"></div>
        <div className="border-r border-b border-zinc-500"></div>
        <div className="border-r border-b border-zinc-500"></div>
        <div className="border-b border-zinc-500"></div>
        <div className="border-r border-b border-zinc-500"></div>
        <div className="border-r border-b border-zinc-500"></div>
        <div className="border-r border-b border-zinc-500"></div>
        <div className="border-b border-zinc-500"></div>
        <div className="border-r border-b border-zinc-500"></div>
        <div className="border-r border-b border-zinc-500"></div>
        <div className="border-r border-b border-zinc-500"></div>
        <div className="border-b border-zinc-500"></div>
      </div>

      {/* Dynamic Projected HTML Cards */}
      {positions.map((pos, idx) => {
        const video = videos[idx];
        const isSelected = idx === selectedIndex;
        if (!video) return null;

        if (pos.x < -150 || pos.x > stateRef.current.width + 150 || pos.y < -150 || pos.y > stateRef.current.height + 150) {
          return null;
        }

        return (
          <div
            key={video.id}
            id={`projected-card-${video.id}`}
            style={{
              position: 'absolute',
              left: `${pos.x}px`,
              top: `${pos.y}px`,
              transform: `translate(-50%, -50%) scale(${pos.scale})`,
              zIndex: pos.z,
              opacity: pos.opacity,
              transition: 'transform 0.1s ease-out, opacity 0.1s ease-out',
            }}
            className={`w-64 aspect-[16/10] rounded-xl overflow-hidden bg-zinc-900 border-2 transition-all shadow-2xl ${
              isSelected
                ? 'border-cyan-400 ring-4 ring-cyan-500/20 shadow-cyan-500/20'
                : 'border-zinc-800 hover:border-zinc-500'
            }`}
          >
            <div
              className="absolute inset-0 w-full h-full cursor-pointer z-10 group"
              onClick={(e) => {
                e.stopPropagation();
                if (isSelected) {
                  onPlayVideo(video);
                } else {
                  onSelectVideo(idx);
                }
              }}
            >
              <img
                src={video.thumbnail}
                alt={video.title}
                referrerPolicy="no-referrer"
                style={isSelected ? getFilterStyle() : undefined}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />

              <div className="absolute bottom-2 right-2 z-20 bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-mono text-zinc-300">
                {video.duration}
              </div>

              <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-300 ${
                isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-50 group-hover:opacity-80 group-hover:scale-100'
              }`}>
                <div className="w-12 h-12 rounded-full bg-cyan-500/90 text-white flex items-center justify-center shadow-lg shadow-cyan-500/50 transform group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
