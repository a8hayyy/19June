import { useState, useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, useGLTF, Float } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import Gallery from './components/Gallery'
import Overlay from './components/Overlay'

// 1. UPGRADED DATA STRUCTURE: Objects with url and text
// const basePics = [
//   { url: '../../public/images/1000215592.jpg', text: 'Queen', about: 'Description for image 1' },
//   { url: '../../public/images/1000215593.jpg', text: 'Patolaaa', about: 'Description for image 2' },
//   { url: '../../public/images/1000215594.jpg', text: 'Rampal ki lachari', about: 'Description for image 3' },
//   { url: '../../public/images/1000215599.jpg', text: 'Brain with Beauty', about: 'Description for image 4' },
//   { url: '../../public/images/1000215601.jpg', text: 'Goooglgappa', about: 'Description for image 5' },
//   { url: '../../public/images/1000215604.jpg', text: 'Afterbath', about: 'Description for image 6' },
//   { url: '../../public/images/1000215616.jpg', text: 'The cutest kid everrrrr', about: 'Description for image 7' },
//   { url: '../../public/images/1000215619.jpg', text: 'Rampal biwi ka gulam', about: 'Description for image 8' },
//   { url: '../../public/images/1000215620.jpg', text: 'Strongest Together', about: 'Description for image 9' },
//   { url: '../../public/images/1000215621.jpg', text: 'Kharchili Girlfriend', about: 'Description for image 10' },
//   { url: '../../public/images/1000215629.jpg', text: 'The strongest shoulder', about: 'Description for image 11' },
//   { url: '../../public/images/1000215632.jpg', text: 'Someone to lean on', about: 'Description for image 12' },
//   { url: '../../public/images/1000215633.jpg', text: 'Jaan dedenge aapke liye', about: 'Description for image 13' },
//   { url: '../../public/images/1000215635.jpg', text: 'Made for each other', about: 'Description for image 14' },
//   { url: '../../public/images/1000215643.jpg', text: 'The booty queen', about: 'Description for image 15' },
//   { url: '../../public/images/1000215645.jpg', text: 'Beauty in formals', about: 'Description for image 16' },
//   { url: '../../public/images/1000215646.jpg', text: 'Mera Rasgulla', about: 'Description for image 17' },
//   { url: '../../public/images/1000215648.jpg', text: 'Bagwan ki bhi manzoori leliiiii', about: 'Description for image 18' },
//   { url: '../../public/images/1000215652.jpg', text: 'The Hikki', about: 'Description for image 19' },
//   { url: '../../public/images/1000215654.jpg', text: 'Pagal Ashique', about: 'Description for image 20' },
//   { url: '../../public/images/1000215661.jpg', text: 'My Source of strength', about: 'Description for image 21' },
//   { url: '../../public/images/1000215663.jpg', text: 'My Cutipieee', about: 'Description for image 22' },
//   { url: '../../public/images/1000215681.jpg', text: 'First Photo By you personal photographer', about: 'Description for image 23' },
//   { url: '../../public/images/1000215687.jpg', text: 'The endless laughter', about: 'Description for image 24' },
// ]

const basePics = [
  { url: '/images/1000215592.jpg', text: 'Queen', about: 'Ruling my heart and my world since day one. You wear the invisible crown perfectly.' },
  { url: '/images/1000215593.jpg', text: 'Patolaaa', text: 'Patolaaa', about: 'Absolutely dropping jaws and breaking hearts. You always know how to take my breath away.' },
  { url: '/images/1000215594.jpg', text: 'Rampal ki lachari', about: 'Completely helpless when you look at me like that. I’d happily surrender to you every single time.' },
  { url: '/images/1000215599.jpg', text: 'Brain with Beauty', about: 'Fierce, smart, and absolutely stunning. I am constantly in awe of how brilliant you are.' },
  { url: '/images/1000215601.jpg', text: 'Goooglgappa', about: 'Sweet, spicy, and my absolute favorite. I just want to pull those cute cheeks all day!' },
  { url: '/images/1000215604.jpg', text: 'Afterbath', about: 'No makeup, wet hair, just pure natural glow. This is when you look the most beautiful to me.' },
  { url: '/images/1000215616.jpg', text: 'The cutest kid everrrrr', about: 'Protecting that beautiful, pure, innocent inner child of yours is my favorite full-time job.' },
  { url: '/images/1000215619.jpg', text: 'Rampal biwi ka gulam', about: 'Happily wrapped around your little finger. Your wish is literally my command, ma’am.' },
  { url: '/images/1000215620.jpg', text: 'Strongest Together', about: 'Nothing in this world can beat us when we are standing side by side. We make the ultimate team.' },
  { url: '/images/1000215621.jpg', text: 'Kharchili Girlfriend', about: 'My wallet might cry sometimes, but seeing that happy, excited smile on your face is worth every single penny.' },
  { url: '/images/1000215629.jpg', text: 'The strongest shoulder', about: 'Whenever the world gets too heavy, resting my head right here makes absolutely everything alright.' },
  { url: '/images/1000215632.jpg', text: 'Someone to lean on', about: 'Through every single up and down, knowing I have you right by my side makes this journey beautiful.' },
  { url: '/images/1000215633.jpg', text: 'Jaan dedenge aapke liye', about: 'No movie dialogues, just pure truth. I would cross any ocean and fight any battle just to see you smile.' },
  { url: '/images/1000215635.jpg', text: 'Made for each other', about: 'Like two puzzle pieces that fit perfectly. We were definitely written in the stars long before we met.' },
  { url: '/images/1000215643.jpg', text: 'The booty queen', about: 'Looking effortlessly fine as always! Just a little reminder that I am the luckiest guy in the room.' },
  { url: '/images/1000215645.jpg', text: 'Beauty in formals', about: 'Total boss-lady energy. Watching you conquer the world in formals makes me fall for you all over again.' },
  { url: '/images/1000215646.jpg', text: 'Mera Rasgulla', about: 'The sweetest, softest, most addictive part of my life. I can never, ever get enough of you.' },
  { url: '/images/1000215648.jpg', text: 'Bagwan ki bhi manzoori leliiiii', about: 'When the universe aligns and even the heavens smile down on us. The divine stamp on our love story.' },
  { url: '/images/1000215652.jpg', text: 'The Hikki', about: 'A mischievous little secret just between us. A permanent reminder that you are entirely mine.' },
  { url: '/images/1000215654.jpg', text: 'Pagal Ashique', about: 'Completely, hopelessly, and wonderfully mad about you. And I wouldn’t have it any other way.' },
  { url: '/images/1000215661.jpg', text: 'My Source of strength', about: 'You are the anchor that keeps me grounded and the wind that pushes me forward. Thank you for believing in me.' },
  { url: '/images/1000215663.jpg', text: 'My Cutipieee', about: 'Just looking at this picture instantly melts my heart. How on earth did I get so lucky to call you mine?' },
  { url: '/images/1000215681.jpg', text: 'First Photo By you personal photographer', about: 'The exact moment I realized I want to capture your gorgeous smile through my lens for the rest of my life.' },
  { url: '/images/1000215687.jpg', text: 'The endless laughter', about: 'Those moments where we laugh together until our stomachs hurt. You are my favorite kind of happiness.' },
]

const PICS = Array(12).fill(basePics).flat()

function CenterModel() {
  const modelRef = useRef()
  const { scene } = useGLTF('https://ilcaswazxvirszvuzsei.supabase.co/storage/v1/object/public/herModel/her-model-v1.glb')
  
  useFrame((state, delta) => {
    if (modelRef.current) {
      modelRef.current.rotation.y += delta * 0.5
    }
  })

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={1.5}>
      <group ref={modelRef} rotation={[0, Math.PI, 0]} position={[0, -2, 0]}>
        <primitive object={scene} scale={7} />
      </group>
    </Float>
  )
}

useGLTF.preload('https://ilcaswazxvirszvuzsei.supabase.co/storage/v1/object/public/herModel/her-model-v1.glb')

// 2. THE SIMPLE, GLITCH-FREE SPLASH SCREEN
function SplashLoader() {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Fades out safely after 3.5 seconds
    const timer = setTimeout(() => setIsVisible(false), 3500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }} // Long, cinematic fade
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: '#020024',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none' // Ensures it doesn't block clicks while fading
          }}
        >
          <div style={{ fontFamily: 'cursive', fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
            made with 
            <motion.span 
              animate={{ scale: [1, 1.2, 1] }} 
              transition={{ repeat: Infinity, duration: 1.2 }}
              style={{ color: '#ff0055', display: 'inline-block' }}
            >
              ❤
            </motion.span> 
            by a8hay
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function App() {
  const [layout, setLayout] = useState('rings')
  const [selectedIndex, setSelectedIndex] = useState(null)
  const [hoverData, setHoverData] = useState({ active: false, text: '' })

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      
      <Canvas camera={{ position: [0, 0, 22], fov: 45 }} gl={{ alpha: true }}>
        <fog attach="fog" args={['#020044', 15, 45]} /> 
        <ambientLight intensity={0.5} />
        <Environment preset="city" />

        <Gallery 
          images={PICS} 
          layout={layout} 
          setSelectedIndex={setSelectedIndex} 
          setHoverData={setHoverData} 
        />
        <CenterModel />
      </Canvas>

      {/* DROP THE SAFE LOADER HERE */}
      <SplashLoader />

      <Overlay 
        layout={layout} 
        setLayout={setLayout} 
        selectedIndex={selectedIndex} 
        setSelectedIndex={setSelectedIndex} 
        images={PICS} 
        hoverData={hoverData} 
      />
    </div>
  )
}