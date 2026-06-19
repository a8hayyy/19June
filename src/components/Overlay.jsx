import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion'

export default function Overlay({ layout, setLayout, selectedIndex, setSelectedIndex, images, hoverData }) {
  
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)
  const springX = useSpring(cursorX, { stiffness: 600, damping: 25 })
  const springY = useSpring(cursorY, { stiffness: 600, damping: 25 })

  const [isFlipped, setIsFlipped] = useState(false)

  useEffect(() => {
    const moveCursor = (e) => {
      cursorX.set(e.clientX) // Removed the -8 offset so we can center elements perfectly
      cursorY.set(e.clientY)
    }
    window.addEventListener('mousemove', moveCursor)
    return () => window.removeEventListener('mousemove', moveCursor)
  }, [cursorX, cursorY])

  const handleNext = (e) => {
    e.stopPropagation()
    setSelectedIndex((prev) => (prev + 1) % images.length)
    setIsFlipped(false) 
  }

  const handlePrev = (e) => {
    e.stopPropagation()
    setSelectedIndex((prev) => (prev - 1 + images.length) % images.length)
    setIsFlipped(false)
  }

  const handleClose = () => {
    setSelectedIndex(null)
    setIsFlipped(false)
  }

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}>

      {/* THE CUSTOM LENS CURSOR */}
      {/* Hide the entire cursor mechanism if a 3D card is open to avoid distraction */}
      {selectedIndex === null && (
        <motion.div 
          style={{
            x: springX,
            y: springY,
            position: 'fixed',
            top: 0,
            left: 0,
            pointerEvents: 'none',
            zIndex: 9999,
          }}
        >
          {/* The Expanding Circle (Yellow Dot -> Frosted Lens) */}
          <motion.div
            animate={{
              width: hoverData.active ? '40px' : '16px',
              height: hoverData.active ? '40px' : '16px',
              backgroundColor: hoverData.active ? 'rgba(255, 255, 255, 0.1)' : '#ffe600',
              backdropFilter: hoverData.active ? 'blur(10px)' : 'none',
              border: hoverData.active ? '1px solid rgba(255, 255, 255, 0.4)' : 'none',
              borderRadius: '50%',
              x: hoverData.active ? -20 : -8, // Centers the circle properly on the cursor
              y: hoverData.active ? -20 : -8,
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            style={{ position: 'absolute' }}
          >
            {/* Inner + crosshair indicator inside the lens (Optional, K95 style) */}
            {hoverData.active && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '10px' }}>
                +
              </div>
            )}
          </motion.div>

          {/* The Text Popup Beside the Lens */}
          <AnimatePresence>
            {hoverData.active && (
              <motion.div
                initial={{ opacity: 0, x: 0 }}
                animate={{ opacity: 1, x: 30 }} // Slides out beside the 40px lens
                exit={{ opacity: 0, x: 0, transition: { duration: 0.15 } }}
                style={{
                  position: 'absolute',
                  top: '-15px', // Aligns vertically with the lens center
                  color: 'white',
                  background: 'rgba(0,0,0,0.4)',
                  backdropFilter: 'blur(8px)',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  fontSize: '0.85rem',
                  fontFamily: 'sans-serif',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                }}
              >
                {hoverData.text}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', right: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'auto', zIndex: 2 }}>
        
        {/* THE PREMIUM GLOWING SVG HEART */}
        <motion.div 
          animate={{ 
            scale: [1, 1.08, 1],
            // Adds a subtle red glowing shadow that expands and contracts with the pulse
            filter: ['drop-shadow(0px 0px 2px rgba(255,0,85,0.3))', 'drop-shadow(0px 0px 10px rgba(255,0,85,0.8))', 'drop-shadow(0px 0px 2px rgba(255,0,85,0.3))'] 
          }} 
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            background: 'rgba(255, 255, 255, 0.05)', 
            backdropFilter: 'blur(10px)', 
            border: '1px solid rgba(255, 255, 255, 0.2)', 
            width: '45px', 
            height: '45px', 
            borderRadius: '50%',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
          }}
        >
          {/* Razor-sharp, perfectly centered SVG Heart */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff0055" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </motion.div>

        <div style={{ display: 'flex', position: 'relative', background: 'rgba(255, 255, 255, 0.1)', padding: '0.25rem', borderRadius: '40px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
          {['rings', 'spiral'].map((tab) => (
            <button
              key={tab}
              onClick={() => setLayout(tab)}
              style={{
                position: 'relative',
                padding: 'clamp(0.3rem, 2vw, 0.5rem) clamp(1rem, 3vw, 1.5rem)',
                borderRadius: '30px',
                border: 'none',
                background: 'transparent',
                color: layout === tab ? '#0c00ff' : 'white',
                fontFamily: 'monospace',
                fontSize: 'clamp(0.7rem, 2vw, 0.9rem)',
                letterSpacing: '1px',
                fontWeight: layout === tab ? 'bold' : 'normal',
                zIndex: 2,
                cursor: 'pointer' 
              }}
            >
              {layout === tab && (
                <motion.div
                  layoutId="active-pill"
                  style={{ position: 'absolute', inset: 0, backgroundColor: 'white', borderRadius: '30px', zIndex: -1 }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              {tab.toUpperCase()}
            </button>
          ))}
        </div>
        
        <div style={{ width: 'clamp(0px, 10vw, 150px)' }}></div>
      </div>

      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div 
            style={{ 
              position: 'absolute', 
              inset: 0, 
              background: 'rgba(0, 0, 0, 0.7)', 
              backdropFilter: 'blur(15px)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              pointerEvents: 'auto', 
              zIndex: 3 
            }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleClose}
          >
            
            <button 
              onClick={handlePrev} 
              style={{ position: 'absolute', left: '5%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: '50%', width: '50px', height: '50px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)', zIndex: 10 }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>

            <div 
              style={{ 
                width: '90%', 
                maxWidth: '400px', 
                aspectRatio: '3/4', 
                perspective: '1000px',
                position: 'relative'
              }}
              onClick={(e) => e.stopPropagation()} 
            >
              <motion.div
                style={{
                  width: '100%',
                  height: '100%',
                  position: 'relative',
                  transformStyle: 'preserve-3d',
                  cursor: 'pointer'
                }}
                initial={false}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                onClick={() => setIsFlipped(!isFlipped)}
              >
                
                <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden' }}>
                  {/* Important: Grab the url from the object now -> images[selectedIndex].url */}
                  <img 
                    src={images[selectedIndex]?.url} 
                    alt="Memory" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '5px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }} 
                  />
                  <div style={{ position: 'absolute', bottom: '15px', right: '15px', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', color: 'white', padding: '5px 10px', borderRadius: '20px', fontSize: '0.8rem', fontFamily: 'sans-serif' }}>
                    Tap to flip ⟳
                  </div>
                </div>

                <div style={{ 
                  position: 'absolute', 
                  inset: 0, 
                  backfaceVisibility: 'hidden', 
                  transform: 'rotateY(180deg)', 
                  background: '#111', 
                  borderRadius: '5px', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  padding: '2rem', 
                  textAlign: 'center',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                }}>
                  <div>
                    {/* Important: Grab the text from the object now -> images[selectedIndex].text */}
                    <h3 style={{ color: 'white', fontFamily: 'sans-serif', margin: '0 0 1rem 0' }}>{images[selectedIndex]?.text}</h3>
                    <p style={{ color: '#ccc', fontSize: '1.1rem', lineHeight: '1.6', fontFamily: 'serif' }}>
                      {images[selectedIndex]?.about}
                    </p>
                  </div>
                </div>

              </motion.div>
            </div>

            <button 
              onClick={handleNext} 
              style={{ position: 'absolute', right: '5%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: '50%', width: '50px', height: '50px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)', zIndex: 10 }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>

            <button 
              style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'none', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer', zIndex: 10 }} 
              onClick={handleClose}
            >
              ✕ Close
            </button>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}