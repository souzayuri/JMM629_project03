document.addEventListener('DOMContentLoaded', function() {
  // Reference to the container
  const tapirContainer = document.getElementById('tapir-container');
  if (!tapirContainer) return;
  
  // Animation variables
  let tapirFrames = [];
  let currentFrame = 0;
  let isPlaying = false;
  let animationInterval;
  let animationSpeed = 300; // milliseconds per frame
  
  // For the movement animation
  let moveInterval;
  let currentPosition = -350; // Start off-screen to the left
  let targetPosition = 0; // Center position (percentage)
  let moveStep = 2; // How many pixels to move per step
  let moveSpeed = 30; // milliseconds per movement step
  
  // Head movement animation variables
  let headFrames = [];
  let currentHeadFrame = 0;
  let headAnimationInterval;
  let headAnimationSpeed = 800; // milliseconds per head movement frame
  
  // Load your SVG files for walking animation
  function loadSVGs() {
    // Paths to your SVG files
    const svgUrls = [
      'figures/SVG/Asset 4.svg',
      'figures/SVG/Asset 5.svg',
    ];
    
    // Clear existing content
    tapirContainer.innerHTML = '';
    
    // Create frames for each SVG
    svgUrls.forEach((url, index) => {
      const frameDiv = document.createElement('div');
      frameDiv.className = 'tapir-svg';
      
      // Set initial horizontal position to start off-screen from the left
      frameDiv.style.left = currentPosition + '%';
      
      // Set the first frame as visible initially
      if (index === 0) {
        frameDiv.classList.add('visible');
      }
      
      // Load SVG content
      fetch(url)
        .then(response => response.text())
        .then(svgContent => {
          frameDiv.innerHTML = svgContent;
          tapirContainer.appendChild(frameDiv);
          tapirFrames.push(frameDiv);
        })
        .catch(error => {
          console.error('Error loading SVG:', error);
          
          // Fallback content in case SVG loading fails
          frameDiv.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#f0f0f0;border-radius:10px;">Frame ${index + 1}</div>`;
          tapirContainer.appendChild(frameDiv);
          tapirFrames.push(frameDiv);
        });
    });
    
    // Load head movement SVGs
    loadHeadMovementSVGs();
  }
  
  // Load SVGs for head movement animation
  function loadHeadMovementSVGs() {
    const headSvgUrls = [
      'figures/SVG/pixel_move3_center.svg',
      'figures/SVG/pixel_move3_left.svg',
      'figures/SVG/pixel_move3_right.svg'
    ];
    
    // Create frames for each head movement SVG
    headSvgUrls.forEach((url, index) => {
      const frameDiv = document.createElement('div');
      frameDiv.className = 'tapir-head-svg';
      
      // Initialize with the same position as walking frames
      // We'll update this position when the walking animation ends
      frameDiv.style.left = currentPosition + '%';
      
      // Hide all head movement frames initially
      frameDiv.style.display = 'none';
      
      // Load SVG content
      fetch(url)
        .then(response => response.text())
        .then(svgContent => {
          frameDiv.innerHTML = svgContent;
          tapirContainer.appendChild(frameDiv);
          headFrames.push(frameDiv);
        })
        .catch(error => {
          console.error('Error loading head movement SVG:', error);
          
          // Fallback content
          frameDiv.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#f0f0f0;border-radius:10px;">Head ${index + 1}</div>`;
          tapirContainer.appendChild(frameDiv);
          headFrames.push(frameDiv);
        });
    });
  }
  
  // Function to toggle between SVG frames (walking animation)
  function animateTapir() {
    tapirFrames.forEach((frame, index) => {
      if (index === currentFrame) {
        frame.classList.add('visible');
      } else {
        frame.classList.remove('visible');
      }
    });
    
    currentFrame = (currentFrame + 1) % tapirFrames.length;
  }
  
  // Function to animate head movement
  function animateHead() {
    headFrames.forEach((frame, index) => {
      if (index === currentHeadFrame) {
        frame.style.display = 'block';
      } else {
        frame.style.display = 'none';
      }
    });
    
    currentHeadFrame = (currentHeadFrame + 1) % headFrames.length;
  }
  
  // Function to move the tapir from left edge to middle
  function moveTapir() {
    // Check if current position has reached or exceeded target
    if (currentPosition >= targetPosition) {
      // Stop movement when target position is reached
      clearInterval(moveInterval);
      
      // Stop the walking frame animation
      clearInterval(animationInterval);
      isPlaying = false;
      
      console.log('Walking animation stopped: Target position reached');
      
      // Get the exact final position where the walking animation stopped
      const finalPosition = currentPosition;
      
      // Update all head frames to be at exactly the same position
      headFrames.forEach(frame => {
        frame.style.left = finalPosition + '%';
      });
      
      // Hide all walking frames
      tapirFrames.forEach(frame => {
        frame.style.display = 'none';
      });
      
      // Start head movement animation
      startHeadAnimation();

          // SHOW THE TEXT AFTER WALKING ANIMATION COMPLETES
    const tapirText = document.getElementById('tapir-text');
    if (tapirText) {
      // Wait a moment after the head animation starts (optional)
      setTimeout(() => {
        tapirText.classList.remove('hidden-text');
        tapirText.classList.add('visible-text');
      }, 300); // Small delay for better effect
    }
    
      
      return;
    }
    
    // Increment position
    currentPosition += moveStep;
    
    // Apply position to all frames
    tapirFrames.forEach(frame => {
      frame.style.left = currentPosition + '%';
    });
  }
  
  // Function to start the head movement animation
  function startHeadAnimation() {
    console.log('Starting head movement animation');
    
    // Show the first head frame immediately
    if (headFrames.length > 0) {
      headFrames[0].style.display = 'block';
    }
    
    // Start the head animation loop
    headAnimationInterval = setInterval(animateHead, headAnimationSpeed);
  }
  
  // Function to start the walking animation
  function startAnimation() {
    if (isPlaying) return;
    isPlaying = true;
    
    // Reset position to start from left edge
    currentPosition = -350;
    
    // Reset walking frames
    tapirFrames.forEach(frame => {
      frame.style.left = currentPosition + '%';
      frame.classList.remove('visible');
      frame.style.display = 'block'; // Make sure walking frames are visible
    });
    
    // Make first frame visible
    if (tapirFrames.length > 0) {
      tapirFrames[0].classList.add('visible');
    }
    
    // Reset current frame index
    currentFrame = 0;
    
    // Hide all head movement frames
    headFrames.forEach(frame => {
      frame.style.display = 'none';
    });
    
    // Clear any existing head animation
    if (headAnimationInterval) {
      clearInterval(headAnimationInterval);
    }
    
    // Start frame animation immediately
    animateTapir(); // Call once immediately to show first frame
    animationInterval = setInterval(animateTapir, animationSpeed);
    
    // Start movement animation
    moveInterval = setInterval(moveTapir, moveSpeed);
  }
  
  // Load SVGs
  loadSVGs();
  
  // Automatically start the animation after a short delay
  setTimeout(startAnimation, 200);
  
  // Check if we're using scrollama for triggering
  if (window.scroller) {
    // Trigger animation on scroll if using scrollama
    scroller.on('step-enter', response => {
      if (response.index === 0 && !isPlaying) {
        startAnimation();
      }
    });
  }
  
  // Restart animation by clicking on the container
  tapirContainer.addEventListener('click', function() {
    // Stop any existing head animation
    if (headAnimationInterval) {
      clearInterval(headAnimationInterval);
    }
    
    if (!isPlaying) {
      startAnimation();
    }
  });
});