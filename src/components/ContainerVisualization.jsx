import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const ContainerVisualization = ({ products, truckSpecs }) => {
  const mountRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const animatedBoxes = useRef([]);
  const [currentPackage, setCurrentPackage] = useState(0);
  const [totalPackages, setTotalPackages] = useState(0);
  const [viewMode, setViewMode] = useState('normal'); // 'normal' or 'wireframe'
  const animationRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const animationTimeoutRef = useRef(null);
  
  // Function to generate random colors for boxes
  const getRandomColor = () => {
    const colors = [
      0x4CAF50, // Green
      0x2196F3, // Blue
      0xFFC107, // Amber
      0xFF5722, // Deep Orange
      0x9C27B0, // Purple
      0x3F51B5  // Indigo
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  
  // Create and position a box with sequential animation
  const createSequentialBox = (scene, x, y, z, length, width, height, index) => {
    const boxGeometry = new THREE.BoxGeometry(length, height, width);
    const boxMaterial = new THREE.MeshPhongMaterial({
      color: getRandomColor(),
      transparent: true,
      opacity: 0.85
    });
    const box = new THREE.Mesh(boxGeometry, boxMaterial);
    
    // Initial position (outside the container)
    box.position.set(
      truckSpecs.length * 1.5, // Start further outside
      y,
      z
    );
    
    // Add package number text
    const textCanvas = document.createElement('canvas');
    const context = textCanvas.getContext('2d');
    textCanvas.width = 128;
    textCanvas.height = 128;
    context.fillStyle = '#ffffff';
    context.font = 'Bold 60px Arial';
    context.textAlign = 'center';
    context.fillText(index + 1, 64, 80);
    
    const texture = new THREE.CanvasTexture(textCanvas);
    const textMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide
    });
    
    const textGeometry = new THREE.PlaneGeometry(length * 0.6, length * 0.6);
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.set(0, 0, width / 2 + 1);
    box.add(textMesh);
    
    // Add box outline
    const wireframe = new THREE.LineSegments(
      new THREE.EdgesGeometry(boxGeometry),
      new THREE.LineBasicMaterial({ color: 0x000000 })
    );
    box.add(wireframe);
    
    // Keep box invisible initially
    box.visible = false;
    
    // Add to scene
    scene.add(box);
    
    return {
      mesh: box,
      startPosition: new THREE.Vector3(truckSpecs.length * 1.5, y, z),
      targetPosition: new THREE.Vector3(x, y, z),
      index: index,
      active: false,
      completed: false
    };
  };

  // Calculate total packages from products
  useEffect(() => {
    const total = products.reduce((sum, product) => sum + (parseInt(product.quantity) || 0), 0);
    setTotalPackages(total);
  }, [products]);

  // Animation functions
  const animateNextPackage = useCallback(() => {
    if (currentPackage < totalPackages - 1) {
      const nextIdx = currentPackage + 1;
      if (animatedBoxes.current[nextIdx]) {
        animatedBoxes.current[nextIdx].mesh.visible = true;
        animatedBoxes.current[nextIdx].active = true;
        setCurrentPackage(nextIdx);
      }
    } else {
      // Ensure all boxes are visible after loading
      animatedBoxes.current.forEach(box => {
        box.mesh.visible = true;
      });
    }
  }, [currentPackage, totalPackages]);

  const animate = useCallback(() => {
    if (isAnimating) {
      const currentBox = animatedBoxes.current[currentPackage];
      
      if (currentBox && !currentBox.completed) {
        const currentPos = currentBox.mesh.position;
        const targetPos = currentBox.targetPosition;
        const distance = currentPos.distanceTo(targetPos);

        if (distance > 1) {
          currentPos.lerp(targetPos, 0.05);
        } else {
          currentPos.copy(targetPos);
          currentBox.completed = true;

          // Move to next box after a short delay
          if (currentPackage < totalPackages - 1) {
            animationTimeoutRef.current = setTimeout(() => {
              setCurrentPackage(prev => prev + 1);
              animateNextPackage();
            }, 200);
          }
        }
      }
    }

    if (controlsRef.current) {
      controlsRef.current.update();
    }
    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
    animationRef.current = requestAnimationFrame(animate);
  }, [isAnimating, currentPackage, totalPackages, animateNextPackage]);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      65,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      20000
    );
    
    camera.position.set(truckSpecs.length * 0.8, truckSpecs.height * 0.8, truckSpecs.width * 1.5);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = truckSpecs.length * 3;
    controls.minDistance = truckSpecs.length * 0.5;
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1000, 1000, 1000);
    scene.add(directionalLight);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight2.position.set(-1000, 500, -1000);
    scene.add(directionalLight2);

    // Create container
    const containerGeometry = new THREE.BoxGeometry(
      truckSpecs.length,
      truckSpecs.height,
      truckSpecs.width
    );
    const containerMaterial = new THREE.MeshPhongMaterial({
      color: 0x808080,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide
    });
    const container = new THREE.Mesh(containerGeometry, containerMaterial);
    container.position.set(0, 0, 0);
    scene.add(container);

    // Create wireframe for container
    const wireframe = new THREE.LineSegments(
      new THREE.EdgesGeometry(containerGeometry),
      new THREE.LineBasicMaterial({ color: 0x000000 })
    );
    container.add(wireframe);

    // Create door indicator
    const doorWidth = truckSpecs.width * 0.8;
    const doorHeight = truckSpecs.height * 0.8;
    const doorGeometry = new THREE.PlaneGeometry(doorWidth, doorHeight);
    const doorMaterial = new THREE.MeshBasicMaterial({
      color: 0x333333,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(truckSpecs.length/2, 0, 0);
    door.rotation.y = Math.PI / 2;
    container.add(door);

    // Add floor with grid
    const gridHelper = new THREE.GridHelper(Math.max(truckSpecs.length, truckSpecs.width) * 1.5, 20);
    gridHelper.position.y = -truckSpecs.height/2 - 10;
    scene.add(gridHelper);

    // Calculate box dimensions and positions
    const boxSize = Math.min(300, truckSpecs.width / 4);
    const spacing = 50;
    const boxesPerLength = Math.floor((truckSpecs.length - spacing) / (boxSize + spacing));
    const boxesPerWidth = Math.floor((truckSpecs.width - spacing) / (boxSize + spacing));
    const boxesPerHeight = Math.floor((truckSpecs.height - spacing) / (boxSize + spacing));
    
    // Create positions for boxes
    const positions = [];
    for (let z = 0; z < boxesPerWidth; z++) {
      for (let x = 0; x < boxesPerLength; x++) {
        for (let y = 0; y < boxesPerHeight; y++) {
          if (positions.length < totalPackages) {
            positions.push({
              x: -truckSpecs.length/2 + spacing + x * (boxSize + spacing),
              y: -truckSpecs.height/2 + spacing + y * (boxSize + spacing),
              z: -truckSpecs.width/2 + spacing + z * (boxSize + spacing)
            });
          }
        }
      }
    }
    
    // Create boxes
    for (let i = 0; i < totalPackages; i++) {
      const pos = positions[i];
      const box = createSequentialBox(
        scene,
        pos.x,
        pos.y,
        pos.z,
        boxSize,
        boxSize,
        boxSize,
        i
      );
      animatedBoxes.current.push(box);
    }

    // Start animation
    animationTimeoutRef.current = setTimeout(() => {
      setIsAnimating(true);
      setCurrentPackage(0);
      if (animatedBoxes.current[0]) {
        animatedBoxes.current[0].mesh.visible = true;
        animatedBoxes.current[0].active = true;
      }
    }, 1000);

    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      if (cameraRef.current) {
        cameraRef.current.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
        cameraRef.current.updateProjectionMatrix();
      }
      if (rendererRef.current) {
        rendererRef.current.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (mountRef.current && rendererRef.current?.domElement) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      sceneRef.current = null;
      rendererRef.current = null;
      cameraRef.current = null;
      controlsRef.current = null;
      animatedBoxes.current = [];
    };
  }, [products, truckSpecs, animate]);

  const restartAnimation = () => {
    setIsAnimating(false);
    
    // Clear any existing timeouts
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
    
    // Reset all boxes
    animatedBoxes.current.forEach(box => {
      box.mesh.position.copy(box.startPosition);
      box.mesh.visible = false;
      box.active = false;
      box.completed = false;
    });
    
    // Restart animation
    animationTimeoutRef.current = setTimeout(() => {
      setCurrentPackage(0);
      setIsAnimating(true);
      if (animatedBoxes.current[0]) {
        animatedBoxes.current[0].mesh.visible = true;
        animatedBoxes.current[0].active = true;
      }
    }, 500);
  };

  return (
    <div>
    <div 
      ref={mountRef} 
      style={{ 
        width: '100%', 
          height: '500px', // Taller visualization
        border: '1px solid #ddd',
        borderRadius: '4px'
      }}
    />
      <div className="mt-2 d-flex justify-content-between align-items-center">
        <div>
          <span className="me-2">Loading Package: {currentPackage + 1} of {totalPackages}</span>
          <div className="progress" style={{ width: '200px', height: '20px' }}>
            <div 
              className="progress-bar bg-success" 
              role="progressbar" 
              style={{ width: `${((currentPackage + 1) / totalPackages) * 100}%` }}
              aria-valuenow={currentPackage + 1} 
              aria-valuemin="0" 
              aria-valuemax={totalPackages}
            >
              {Math.round(((currentPackage + 1) / totalPackages) * 100)}%
            </div>
          </div>
        </div>
        <div>
          <button 
            className="btn btn-outline-secondary me-2" 
            onClick={() => setViewMode(viewMode === 'normal' ? 'wireframe' : 'normal')}
          >
            {viewMode === 'normal' ? 'Wireframe View' : 'Normal View'}
          </button>

          <button 
            className="btn btn-primary" 
            onClick={restartAnimation}
            disabled={!isAnimating}
          >
            Restart Loading
          </button>
        </div>
      </div>
      <div className="mt-2 small text-muted text-center">
        <i>Tip: Click and drag to rotate view. Scroll to zoom in/out.</i>
      </div>
    </div>
  );
};

export default ContainerVisualization; 


