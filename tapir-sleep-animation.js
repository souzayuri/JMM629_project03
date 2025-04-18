document.addEventListener('DOMContentLoaded', function() {
    // Configuration - customize these values as needed
    const sleepAnimationSpeed = 800; // milliseconds per sleeping frame
      
    /**
     * Initialize a sleeping tapir animation in the specified container
     */
    function initSleepingTapirAnimation() {
      // Reference to the container
      const container = document.querySelector('.step[data-index="17"] .content');
      if (!container) {
        console.error('Container for step 17 not found');
        return;
      }
          
      // Create container for sleeping tapir animation
      const sleepContainer = document.createElement('div');
      sleepContainer.id = 'sleepingTapirContainer';
      sleepContainer.style.position = 'relative';
      sleepContainer.style.width = '300px';
      sleepContainer.style.height = '300px';
      sleepContainer.style.margin = '10px auto';
      sleepContainer.style.display = 'block';
          
      // Add the container after the existing content
      container.appendChild(sleepContainer);
          
      // Sleeping animation variables
      let sleepFrames = [];
      let currentSleepFrame = 0;
          
      // Image paths for sleeping animation
      const sleepImageUrls = [
        'figures/SVG/sleeping1.svg',
        'figures/SVG/sleeping2.svg',
        'figures/SVG/sleeping3.svg'
      ];
          
      // Create frames for each sleeping image
      sleepImageUrls.forEach((url, index) => {
        const frameDiv = document.createElement('div');
        frameDiv.className = 'tapir-sleep-frame';
        frameDiv.style.position = 'absolute';
        frameDiv.style.top = '0';
        frameDiv.style.left = '0';
        frameDiv.style.width = '100%';
        frameDiv.style.height = '100%';
        frameDiv.style.display = 'none';
              
        // Create image element
        const img = document.createElement('img');
        img.src = url;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'contain';
              
        frameDiv.appendChild(img);
        sleepContainer.appendChild(frameDiv);
        sleepFrames.push(frameDiv);
              
        // Show the first frame initially
        if (index === 0) {
          frameDiv.style.display = 'block';
        }
      });
          
      // Function to animate sleeping frames
      function animateSleep() {
        sleepFrames.forEach((frame, index) => {
          if (index === currentSleepFrame) {
            frame.style.display = 'block';
          } else {
            frame.style.display = 'none';
          }
        });
              
        currentSleepFrame = (currentSleepFrame + 1) % sleepFrames.length;
      }
          
      // Run the animation continuously
      const sleepInterval = setInterval(animateSleep, sleepAnimationSpeed);
    }
      
    // Initialize the sleeping tapir animation
    initSleepingTapirAnimation();
      
    // Add CSS for better positioning
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .step[data-index="17"] .content {
        position: relative;
        text-align: center;
      }
          
      #sleepingTapirContainer {
        margin-top: 20px;
      }
    `;
    document.head.appendChild(styleElement);
  });