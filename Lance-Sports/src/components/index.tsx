import React, { useEffect, useState } from 'react';
import App from './App';

const IntroPage: React.FC = () => {
  const [showApp, setShowApp] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [imageOpacity, setImageOpacity] = useState(0);

  // Basic debugging
  console.log('IntroPage rendering...', { showApp, animationComplete });

  useEffect(() => {
    console.log('IntroPage useEffect running...');
    
    // Start image fade-in immediately
    const imageTimer = setTimeout(() => {
      setImageOpacity(1);
    }, 500); // Start fade-in after 0.5 seconds
    
    // Navigate to main app after 3 seconds
    const appTimer = setTimeout(() => {
      console.log('Animation complete, navigating to main app...');
      setAnimationComplete(true);
      setShowApp(true); // Automatically go to main app after 3 seconds
    }, 8000); // 3 second delay

    return () => {
      clearTimeout(imageTimer);
      clearTimeout(appTimer);
    };
  }, []);


  if (showApp) {
    return <App />;
  }

  return (
    <div
      style={{
        height: '100vh',
        backgroundColor: 'black',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        color: 'white',
        fontFamily: 'Arial, sans-serif',
        position: 'relative'
      }}
    >
    

      {/* Bottom Left Sports Star */}
        <img 
          src="/images/pngwing.com.png" 
          alt="Messi"
        style={{
          position: 'absolute',
          bottom: '0px',
          left: '-100px',
          width: 'fit',
          height: '900px',
          objectFit: 'cover',
          borderRadius: '0%',
          opacity: imageOpacity-0.6,
          transition: 'opacity 4s ease-in-out',
          zIndex: 1,
          backgroundColor: 'transparent',
          background: 'none',
          mixBlendMode: 'screen'
        }}
      />

      {/* Bottom Right Sports Star */}
      <img 
        src="/images/pngegg (1).png"
        alt="Sports Star 4"
        style={{
          position: 'absolute',
          bottom: '-0px',
          right: '-0px',
          width: 'fit',
          height: '1000px',
          objectFit: 'cover',
          borderRadius: '0%',
          opacity: imageOpacity-0.6,
          transition: 'opacity 4s ease-in-out',
          zIndex: 1
        }}
      />

      {/* Center Content */}
      <div style={{ zIndex: 10 }}>
         <div style={{ fontSize: '28px', fontFamily: 'Helvetica Neue, Arial, sans-serif',backgroundColor:"transparent", fontWeight: '100', letterSpacing: '0px', marginBottom: '5px',marginLeft:"80px", color: "rgba(1, 255, 128,0.5)", textShadow: '0 0 8px rgb(1, 255, 128)' }}></div>
         <div style={{ fontSize: '48px', fontWeight: 'bold', color: 'white', backgroundColor:"transparent",marginBottom: '20px' }}>
           <img 
             src="/images/img2.png" 
             alt="LanceSports Logo"
             style={{
              marginTop: "00px",
               opacity: (imageOpacity),
               transition: 'opacity 4s ease-in-out',
               width: 'fit',
               height: '300px'
             }}
           />
         </div>
      </div>
      
      {animationComplete && (
        <div style={{ 
          position: 'absolute', 
          bottom: '50px', 
          color: '#888',
          fontSize: '14px'
        }}>
          
        </div>
      )}
    </div>
  );
};

export default IntroPage;