import { useRef, useEffect, useMemo, forwardRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

const BentImage = forwardRef(({ item, velocityRef, onClick, setHoverData }, ref) => {
  // Use item.url for the texture
  const texture = useTexture(item.url)
  const materialRef = useRef()
  const meshRef = useRef()
  const [hovered, setHover] = useState(false)

  const uniforms = useMemo(() => ({
    uTexture: { value: texture },
    uBend: { value: 0.0 }
  }), [texture])

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uBend.value = THREE.MathUtils.clamp(velocityRef.current * 0.05, -0.1, 0.1)
    }
    
    if (meshRef.current) {
      const targetScale = hovered ? 1.15 : 1
      const targetZ = hovered ? 0.8 : 0
      
      meshRef.current.scale.setScalar(THREE.MathUtils.damp(meshRef.current.scale.x, targetScale, 12, delta))
      meshRef.current.position.z = THREE.MathUtils.damp(meshRef.current.position.z, targetZ, 12, delta)
    }
  })

  return (
    <group ref={ref} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      <mesh
        ref={meshRef}
        onPointerOver={(e) => { 
          e.stopPropagation()
          setHover(true)
          // Hide native cursor to let the custom lens take over
          document.body.style.cursor = 'none' 
          // Send the specific image text to the lens overlay
          setHoverData({ active: true, text: item.text })
        }}
        onPointerOut={(e) => { 
          setHover(false)
          document.body.style.cursor = 'auto'
          setHoverData({ active: false, text: '' })
        }}
      >
        <planeGeometry args={[3.3, 4.4, 16, 16]} />
        <shaderMaterial
          ref={materialRef}
          uniforms={uniforms}
          transparent={true}
          side={THREE.DoubleSide}
          vertexShader={`
            uniform float uBend;
            varying vec2 vUv;
            void main() {
              vUv = uv;
              vec3 pos = position;
              pos.z += pos.y * pos.y * uBend;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
          `}
          fragmentShader={`
            uniform sampler2D uTexture;
            varying vec2 vUv;
            void main() {
              gl_FragColor = texture2D(uTexture, vUv);
            }
          `}
        />
      </mesh>
    </group>
  )
})

export default function Gallery({ images, layout, setSelectedIndex, setHoverData }) {
  const groupRef = useRef()
  const gridRef = useRef()
  const imageRefs = useRef([])

  const manualScroll = useRef(0)
  const currentManualScroll = useRef(0)

  const idleRot = useRef(0)
  const idleY = useRef(0)
  const scrollVelocity = useRef(0)
  
  // NEW: Tracks the layout transition smoothly between 0 (rings) and 1 (spiral)
  const transitionTracker = useRef(layout === 'spiral' ? 1 : 0)

  useEffect(() => {
    const handleWheel = (e) => {
      const clampedDelta = THREE.MathUtils.clamp(e.deltaY, -50, 50)
      manualScroll.current += clampedDelta * 0.005
    }

    let touchStartY = 0
    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY
    }
    const handleTouchMove = (e) => {
      const touchY = e.touches[0].clientY
      const deltaY = touchStartY - touchY
      const force = THREE.MathUtils.clamp(deltaY, -30, 30)
      manualScroll.current += force * 0.012 
      touchStartY = touchY
    }

    window.addEventListener('wheel', handleWheel)
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })

    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
    }
  }, [])

  useFrame((state, delta) => {
    
    // RESPONSIVE 3D SCALING
    const isMobile = state.viewport.aspect < 1
    const targetScale = isMobile ? 0.75 : 1
    if (groupRef.current) {
      groupRef.current.scale.setScalar(THREE.MathUtils.damp(groupRef.current.scale.x, targetScale, 4, delta))
    }

    // SCROLL PHYSICS
    const prevScroll = currentManualScroll.current
    currentManualScroll.current = THREE.MathUtils.damp(currentManualScroll.current, manualScroll.current, 3, delta)
    scrollVelocity.current = currentManualScroll.current - prevScroll

    if (Math.abs(scrollVelocity.current) < 0.001) {
      idleRot.current += delta * 0.15 
      if (layout === 'spiral') {
        idleY.current += delta * 0.05
      }
    }

    const totalRotScroll = currentManualScroll.current + idleRot.current
    const totalYScroll = currentManualScroll.current + idleY.current

    if (groupRef.current) {
      groupRef.current.rotation.y = totalRotScroll * 0.4
    }
    if (gridRef.current) {
      gridRef.current.rotation.y = totalRotScroll * 0.03
    }

    // --- GLOBAL TRANSITION TRACKER ---
    const targetTransition = layout === 'spiral' ? 1 : 0
    transitionTracker.current = THREE.MathUtils.damp(transitionTracker.current, targetTransition, 2.5, delta)
    const t = transitionTracker.current

    const total = images.length
    
    // --- THE UNIFIED MATH ---
    // By using 10 photos per circle for BOTH layouts, they never cross paths.
    // They just slide elegantly up and down into place!
    const itemsPerCircle = 10 
    
    const spacingY_spiral = 1.4
    const totalHeight_spiral = total * spacingY_spiral
    const radiusSpiral = 9

    const spacingY_rings = 12.0 
    const numRings = Math.ceil(total / itemsPerCircle)
    const totalHeight_rings = numRings * spacingY_rings
    const radiusRings = 12

    // Blend the heights and radii globally
    const activeHeight = THREE.MathUtils.lerp(totalHeight_rings, totalHeight_spiral, t)
    const targetRadius = THREE.MathUtils.lerp(radiusRings, radiusSpiral, t)
    const tiltX = THREE.MathUtils.lerp(0, -0.1, t)

    imageRefs.current.forEach((ref, index) => {
      if (!ref) return

      // THE MAGIC: One single angle calculation for both layouts!
      // This stops the tornado spinning completely.
      const angle = (index / itemsPerCircle) * Math.PI * 2
      
      // Ring Y: Stacks them in perfectly flat rows
      const rawYRings = Math.floor(index / itemsPerCircle) * spacingY_rings
      // Spiral Y: Stacks them like a staircase
      const rawYSpiral = index * spacingY_spiral
      
      // Blend the Y positions smoothly (The "Elevator" slide)
      const rawY = THREE.MathUtils.lerp(rawYRings, rawYSpiral, t) + (totalYScroll * 1.8)
      
      // Wrap the Y position to create the infinite scroll
      const targetY = ((rawY % activeHeight) + activeHeight) % activeHeight - (activeHeight / 2)

      const targetX = Math.cos(angle) * targetRadius
      const targetZ = Math.sin(angle) * targetRadius
      const targetRotY = -angle - Math.PI / 2

      // Apply physics
      ref.position.x = THREE.MathUtils.damp(ref.position.x, targetX, 10, delta)
      ref.position.z = THREE.MathUtils.damp(ref.position.z, targetZ, 10, delta)

      // Instantly wrap if scrolling past the bounds, otherwise slide smoothly
      if (Math.abs(targetY - ref.position.y) > activeHeight / 2) {
          ref.position.y = targetY
      } else {
          ref.position.y = THREE.MathUtils.damp(ref.position.y, targetY, 15, delta)
      }

      ref.rotation.x = THREE.MathUtils.damp(ref.rotation.x, tiltX, 10, delta)
      ref.rotation.y = THREE.MathUtils.damp(ref.rotation.y, targetRotY, 10, delta)
    })
  })

  return (
    <>
      <mesh ref={gridRef}>
        <cylinderGeometry args={[25, 25, 100, 64, 1]} />
        <shaderMaterial
          transparent={true}
          side={THREE.DoubleSide}
          depthWrite={false}
          uniforms={{
            color: { value: new THREE.Color('#000000') },
            opacity: { value: 0.25 }
          }}
          vertexShader={`
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            varying vec2 vUv;
            uniform vec3 color;
            uniform float opacity;
            void main() {
              vec2 grid = fract(vUv * vec2(60.0, 40.0)); 
              float thickness = 0.008;
              float lineX = step(1.0 - thickness, grid.x) + step(grid.x, thickness);
              float lineY = step(1.0 - thickness, grid.y) + step(grid.y, thickness);
              float line = max(lineX, lineY);
              gl_FragColor = vec4(color, line * opacity);
            }
          `}
        />
      </mesh>
      
      <group ref={groupRef}>
        {images.map((item, index) => (
          <BentImage
            key={index}
            ref={(el) => (imageRefs.current[index] = el)}
            item={item} // Passing the full object instead of just url
            velocityRef={scrollVelocity}
            onClick={() => setSelectedIndex(index)} 
            setHoverData={setHoverData} 
          />
        ))}
      </group>
    </>
  )
}