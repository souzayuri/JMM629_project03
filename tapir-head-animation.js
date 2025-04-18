/**
 * Tapir Head Animation Script
 * 
 * This script handles the animated head movement of the tapir character.
 * It can be used independently from the walking animation in different
 * sections of a scrolly page.
 */

document.addEventListener('DOMContentLoaded', function() {
  // Configuration - customize these values as needed
  const headAnimationSpeed = 800; // milliseconds per head movement frame
  
  /**
   * Initialize a tapir head animation in the specified container
   * @param {string} containerId - The ID of the container element
   * @param {number} initialPosition - Starting position (0 = center)
   * @param {boolean} autoStart - Whether to start animation automatically
   * @param {Function} onAnimationComplete - Optional callback when animation completes
   */
  function initTapirHeadAnimation(containerId, initialPosition = 0, autoStart = true, onAnimationComplete = null) {
    // Reference to the container
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container with ID "${containerId}" not found`);
      return;
    }
    
    // Head movement animation variables
    let headFrames = [];
    let currentHeadFrame = 0;
    let headAnimationInterval;
    let isAnimating = false;
    
    // Load SVGs for head movement animation
    function loadHeadMovementSVGs() {
      const headSvgUrls = [
        'figures/SVG/pixel_move3_center.svg',
        'figures/SVG/pixel_move3_left.svg',
        'figures/SVG/pixel_move3_right.svg'
      ];
      
      // Clear existing content
      container.innerHTML = '';
      
      // Create frames for each head movement SVG
      headSvgUrls.forEach((url, index) => {
        const frameDiv = document.createElement('div');
        frameDiv.className = 'tapir-head-svg';
        
        // Initialize with the specified position
        frameDiv.style.left = initialPosition + '%';
        
        // Hide all head movement frames initially
        frameDiv.style.display = 'none';
        
        // Load SVG content
        fetch(url)
          .then(response => response.text())
          .then(svgContent => {
            frameDiv.innerHTML = svgContent;
            container.appendChild(frameDiv);
            headFrames.push(frameDiv);
            
            // Once all frames are loaded, start animation if autoStart is true
            if (autoStart && index === headSvgUrls.length - 1) {
              startHeadAnimation();
            }
          })
          .catch(error => {
            console.error('Error loading head movement SVG:', error);
            
            // Fallback content
            frameDiv.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#f0f0f0;border-radius:10px;">Head ${index + 1}</div>`;
            container.appendChild(frameDiv);
            headFrames.push(frameDiv);
          });
      });
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
    
    // Function to start the head movement animation
    function startHeadAnimation() {
      if (isAnimating) return;
      isAnimating = true;
      
      console.log('Starting head movement animation');
      
      // Show the first head frame immediately
      if (headFrames.length > 0) {
        headFrames[0].style.display = 'block';
      }
      
      // Start the head animation loop
      headAnimationInterval = setInterval(animateHead, headAnimationSpeed);
      
      // Call the completion callback if provided
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    }
    
    // Function to stop the head animation
    function stopHeadAnimation() {
      if (!isAnimating) return;
      
      clearInterval(headAnimationInterval);
      isAnimating = false;
      
      // Hide all frames
      headFrames.forEach(frame => {
        frame.style.display = 'none';
      });
    }
    
    // Function to update position of all head frames
    function updatePosition(newPosition) {
      headFrames.forEach(frame => {
        frame.style.left = newPosition + '%';
      });
    }
    
    // Load SVGs
    loadHeadMovementSVGs();
    
    // Make functions available for external use
    return {
      start: startHeadAnimation,
      stop: stopHeadAnimation,
      updatePosition: updatePosition
    };
  }
  
  // Make the function globally available
  window.initTapirHeadAnimation = initTapirHeadAnimation;
  
  // Add the setup for the tapir head on the satellite image (step 6)
  setupStep6Animation();
  
  // Function to setup the animation for step 6
  function setupStep6Animation() {
    // Add CSS for positioning the animation
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .step[data-index="6"] .content {
        position: relative;
      }
      
      #tapirHeadContainer {
        position: absolute;
        top: 20%;  /* Adjust vertical position as needed */
        left: 50%;  /* Adjust horizontal position as needed */
        transform: translate(-50%, -50%);
        width: 300px;  /* Adjust size as needed */
        height: 300px;  /* Adjust size as needed */
        z-index: 10;  /* Ensures it appears in front of the image */
      }
    `;
    document.head.appendChild(styleElement);
    
    // Find the step with data-index="6"
    const step6 = document.querySelector('.step[data-index="6"] .content');
    if (step6) {
      // Create container for tapir head animation
      const tapirContainer = document.createElement('div');
      tapirContainer.id = 'tapirHeadContainer';
      
      // Insert the container at the beginning of the content div (before the image)
      step6.insertBefore(tapirContainer, step6.firstChild);
      
      // Initialize the animation
      const tapirAnimation = initTapirHeadAnimation('tapirHeadContainer', 0, true);
      
      // Optional: Start/stop animation based on visibility
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            tapirAnimation.start();
          } else {
            tapirAnimation.stop();
          }
        });
      }, { threshold: 0.5 });
      
      observer.observe(step6.closest('.step'));
    } else {
      console.warn('Step 6 element not found. The tapir head animation could not be initialized.');
    }
  }
});