import React, { useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

// Debug component to log scene information
const Debug = () => {
  const { scene, camera } = useThree();
  useEffect(() => {
    console.log('Scene:', scene);
    console.log('Camera:', camera);
  }, [scene, camera]);
  return null;
};

// Simple box component
const Box = ({ position, size, color }) => {
  const mesh = useRef();
  
  return (
    <mesh position={position} ref={mesh}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

// Container component
const Container = ({ type }) => {
  // Container dimensions in meters
  const dimensions = {
    '20ft': [5.9, 2.39, 2.35],
    '40ft': [12.03, 2.39, 2.35],
    '40HC': [12.03, 2.69, 2.35]
  };

  const size = dimensions[type] || dimensions['20ft'];
  console.log('Container size:', size); // Debug log

  return (
    <mesh position={[0, size[1]/2, 0]}>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color="#cccccc"
        transparent
        opacity={0.2}
        wireframe
      />
    </mesh>
  );
};

// Main visualization component
const LoadVisualization = ({ cargoItems, containerType }) => {
  console.log('Cargo items:', cargoItems); // Debug log
  console.log('Container type:', containerType); // Debug log

  return (
    <div style={{ 
      width: '100%', 
      height: '500px', 
      background: '#f0f0f0',
      position: 'relative'
    }}>
      <Canvas shadows>
        <PerspectiveCamera
          makeDefault
          position={[5, 5, 5]}
          fov={50}
          near={0.1}
          far={1000}
        />
        
        <color attach="background" args={['#f0f0f0']} />
        
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, 10]}
          intensity={1}
          castShadow
        />
        <directionalLight
          position={[-10, 10, -10]}
          intensity={0.5}
        />
        
        {/* Grid */}
        <Grid
          args={[30, 30]}
          position={[0, -0.01, 0]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#6f6f6f"
          sectionSize={3}
          sectionThickness={1}
          sectionColor="#9d4b4b"
          fadeDistance={30}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid={true}
        />
        
        {/* Container */}
        <Container type={containerType} />
        
        {/* Cargo Items */}
        {cargoItems && cargoItems.map((item, index) => {
          const size = [
            item.length / 100, // Convert cm to meters
            item.height / 100,
            item.width / 100
          ];
          
          // Calculate position to place items inside container
          const containerSize = containerType === '20ft' ? 5.9 : 12.03;
          const xOffset = (containerSize / 2) - (size[0] / 2);
          
          const position = [
            xOffset,
            (index * size[1]) + (size[1] / 2),
            0
          ];
          
          console.log(`Item ${index} size:`, size); // Debug log
          console.log(`Item ${index} position:`, position); // Debug log
          
          return (
            <Box
              key={index}
              position={position}
              size={size}
              color={item.isFragile ? '#ff4444' : '#4444ff'}
            />
          );
        })}
        
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={50}
          target={[0, 0, 0]}
        />
        
        <Debug />
      </Canvas>
    </div>
  );
};

export default LoadVisualization; 