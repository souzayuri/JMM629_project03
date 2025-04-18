/**
 * Tapir Head Animation Integration with Scrolly Page
 * 
 * This script shows how to implement the tapir head animation
 * in multiple sections of a scrolly page using Scrollama.
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize scrollama
  const scroller = scrollama();
  
  // Array to track animation controllers for each section
  const animationControllers = {};
  
  // Add tapir head containers to specified sections
  function setupTapirHeads() {
    // Define which sections should have tapir heads
    // Format: sectionIndex: { containerId, position }
    const tapirSections = {
      "2": { containerId: "tapir-head-section-2", position: 0 },
      "3": { containerId: "tapir-head-section-3", position: 0 },
      "4": { containerId: "tapir-head-section-4", position: 0 },
      "5": { containerId: "tapir-head-section-5", position: 0 },
      "7": { containerId: "tapir-head-section-7", position: 0 },
      "8": { containerId: "tapir-head-section-8", position: 0 },
      "9": { containerId: "tapir-head-section-9", position: 0 }
    };
    
    // Create tapir containers in the specified sections
    Object.keys(tapirSections).forEach(sectionIndex => {
      const section = document.querySelector(`.step[data-index="${sectionIndex}"] .content`);
      if (!section) return;
      
      const { containerId, position } = tapirSections[sectionIndex];
      
      // Create a container for the tapir head
      const tapirContainer = document.createElement('div');
      tapirContainer.id = containerId;
      tapirContainer.className = 'tapir-animation-container';
      tapirContainer.style.margin = '0 auto 20px auto';
      
      // Prepend the container to the section content
      section.prepend(tapirContainer);
      
      // Initialize the tapir head animation (but don't start it yet)
      animationControllers[sectionIndex] = initTapirHeadAnimation(containerId, position, false, function() {
        // Optional: Show text after animation starts
        const textElement = section.querySelector('.tapir-text');
        if (textElement) {
          setTimeout(() => {
            textElement.classList.remove('hidden-text');
            textElement.classList.add('visible-text');
          }, 300);
        }
      });
    });
  }
  
  // Set up scrollama
  function setupScrollama() {
    // Initialize the scroller
    scroller
      .setup({
        step: '.step',
        offset: 0.5,
        debug: false
      })
      .onStepEnter(handleStepEnter)
      .onStepExit(handleStepExit);
    
    // Handle resizing
    window.addEventListener('resize', scroller.resize);
  }
  
  // Handle step enter
  function handleStepEnter(response) {
    const { index, direction } = response;
    
    // Get the section index from the data-index attribute
    const sectionIndex = response.element.getAttribute('data-index');
    
    // Start animation if this section has a tapir head
    if (animationControllers[sectionIndex]) {
      animationControllers[sectionIndex].start();
    }
  }
  
  // Handle step exit
  function handleStepExit(response) {
    const { index, direction } = response;
    
    // Get the section index from the data-index attribute
    const sectionIndex = response.element.getAttribute('data-index');
    
    // Stop animation when leaving the section
    if (animationControllers[sectionIndex]) {
      animationControllers[sectionIndex].stop();
    }
  }
  
  // Initialize everything
  setupTapirHeads();
  setupScrollama();
});