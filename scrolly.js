// Initialize scrollama
const scroller = scrollama();

// Track which sections have been visited
const visitedSections = new Set();

// Setup the instance with both step classes
scroller
  .setup({
    step: ".step, .two-column-container", // Include both section types
    offset: 0.8,                          // Trigger when section is 80% in viewport
    offsetExit: 0.8,                      // Exit trigger offset for scrolling backwards
    debug: false                          // Set to true for debugging
  })
  .onStepEnter(handleStepEnter)
  .onStepExit(handleStepExit);

// Handle when a section enters the viewport
function handleStepEnter(response) {
  // Add 'is-active' class to the current section
  response.element.classList.add('is-active');
  
  // Get the current index
  const currentIndex = response.element.dataset.index;
  
  console.log(`Entering section ${currentIndex}`);
  
  // Check if this section has been visited before
  const wasVisited = visitedSections.has(currentIndex);
  
  // Mark this section as visited
  visitedSections.add(currentIndex);
  
  // Check if this is the first section (data-index="0-1")
  if (currentIndex === "0-1") {
    // Apply first section's highlight behavior (longer delays)
    const highlights = response.element.querySelectorAll('.highlight-brush');
    highlights.forEach((highlight, index) => {
      // Clear any existing timeout for this highlight
      if (highlight.timeoutId) {
        clearTimeout(highlight.timeoutId);
      }
      
      // If we're returning to this section, use shorter delay
      if (wasVisited) {
        // Use a shorter delay when returning to the section
        highlight.timeoutId = setTimeout(() => {
          highlight.classList.add('highlight-active');
        }, 500 + (index * 300)); // 0.5 second base delay + 0.3 second per highlight
      } else {
        // First-time visit, use original longer delays
        highlight.timeoutId = setTimeout(() => {
          highlight.classList.add('highlight-active');
        }, 7000 + (index * 1000)); // 7 second base delay + 1 second per highlight
      }
    });
  } else {
    // Apply standard highlight behavior for all other sections
    const highlights = response.element.querySelectorAll('.highlight-brush');
    highlights.forEach((highlight, index) => {
      // Clear any existing timeout for this highlight
      if (highlight.timeoutId) {
        clearTimeout(highlight.timeoutId);
      }
      
      // Set a new timeout with standard delays
      highlight.timeoutId = setTimeout(() => {
        highlight.classList.add('highlight-active');
      }, 1500 + (index * 1000)); // 1 second base delay + 300ms per highlight
    });
  }
  
  // If this is the two-column-container, handle layout adjustments
  if (response.element.classList.contains('two-column-container')) {
    console.log('Entering two-column section with chart and map');
    
    // Add check for mobile layouts
    if (window.innerWidth <= 768) {
      adjustForMobileLayout(response.element);
    } else {
      adjustForDesktopLayout(response.element);
    }
  }
}

// New function to handle mobile layout adjustments
function adjustForMobileLayout(element) {
  // Find chart and map containers
  const chartColumn = element.querySelector('.column:nth-child(1)');
  const mapColumn = element.querySelector('.column:nth-child(2)');
  
  if (chartColumn && mapColumn) {
    // Adjust transition delays for better mobile experience
    chartColumn.style.transitionDelay = '0s';
    mapColumn.style.transitionDelay = '0.2s';
    
    // Any other mobile-specific adjustments
    // For example, you might want to adjust chart dimensions
    const chartContainer = chartColumn.querySelector('#main-chart');
    if (chartContainer) {
      // Trigger chart resize if you have a resize function
      if (typeof updateChartSize === 'function') {
        updateChartSize();
      }
    }
  }
}

// New function to handle desktop layout adjustments
function adjustForDesktopLayout(element) {
  // Find chart and map containers
  const chartColumn = element.querySelector('.column:nth-child(1)');
  const mapColumn = element.querySelector('.column:nth-child(2)');
  
  if (chartColumn && mapColumn) {
    // Reset to original transition delays
    chartColumn.style.transitionDelay = '0.3s';
    mapColumn.style.transitionDelay = '0s';
    
    // Any other desktop-specific adjustments
    const chartContainer = chartColumn.querySelector('#main-chart');
    if (chartContainer) {
      // Trigger chart resize if you have a resize function
      if (typeof updateChartSize === 'function') {
        updateChartSize();
      }
    }
  }
}

// Handle when a section exits the viewport
function handleStepExit(response) {
  // Remove 'is-active' class from the section that's leaving
  response.element.classList.remove('is-active');
  
  // Get the current index
  const currentIndex = response.element.dataset.index;
  
  console.log(`Exiting section ${currentIndex}`);
  
  // Reset all highlights in this section
  const highlights = response.element.querySelectorAll('.highlight-brush');
  highlights.forEach(highlight => {
    // Clear any pending timeouts
    if (highlight.timeoutId) {
      clearTimeout(highlight.timeoutId);
      highlight.timeoutId = null;
    }
    
    // Remove the active class
    highlight.classList.remove('highlight-active');
  });
}

// Enhanced resize event handler with debouncing
let resizeTimeout;
function handleResize() {
  // Clear the timeout if it exists
  if (resizeTimeout) {
    clearTimeout(resizeTimeout);
  }
  
  // Set a timeout to prevent excessive resize calculations
  resizeTimeout = setTimeout(() => {
    // Resize scrollama
    scroller.resize();
    
    // Check for active sections and adjust their layout based on new screen size
    const activeSection = document.querySelector('.is-active');
    if (activeSection && activeSection.classList.contains('two-column-container')) {
      if (window.innerWidth <= 768) {
        adjustForMobileLayout(activeSection);
      } else {
        adjustForDesktopLayout(activeSection);
      }
    }
    
    // Resize any other responsive elements (e.g., charts, maps)
    if (typeof updateChartSize === 'function') {
      updateChartSize();
    }
    
    // Check for tapir container and adjust as needed
    const tapirContainer = document.getElementById('tapir-container');
    if (tapirContainer) {
      adjustTapirSize();
    }
  }, 200); // 200ms debounce time
}

// New function to adjust tapir size based on screen size
function adjustTapirSize() {
  const tapirContainer = document.getElementById('tapir-container');
  const tapirSvgs = document.querySelectorAll('.tapir-svg, .tapir-head-svg');
  
  if (tapirContainer && tapirSvgs.length) {
    // If we're on a very small screen, adjust position
    if (window.innerWidth <= 480) {
      tapirContainer.style.marginTop = '-30px';
      tapirSvgs.forEach(svg => {
        svg.style.marginTop = '40px';
      });
    } else {
      // Reset to default values for larger screens
      tapirContainer.style.marginTop = '-50px';
      tapirSvgs.forEach(svg => {
        svg.style.marginTop = '70px';
      });
    }
  }
}

// Function to handle touch interaction for mobile devices
function setupTouchInteractions() {
  // Add touch event support for interactive elements
  const interactiveElements = document.querySelectorAll('.tapir-finger, .tapir-finger-label');
  
  interactiveElements.forEach(element => {
    element.addEventListener('touchstart', function(e) {
      // On some mobile browsers, touchstart can trigger unexpected behavior
      // This prevents the default action which might be a click or scroll
      e.preventDefault();
      
      // Simulate a click event
      element.click();
    }, { passive: false });
  });
  
  // Adjust modal positions for mobile
  const modals = document.querySelectorAll('.biome-modal');
  if (modals.length && window.innerWidth <= 768) {
    modals.forEach(modal => {
      // For mobile, position modals beneath the element instead of to the side
      if (modal.style.display === 'block') {
        const parent = modal.closest('.tapir-selector-container');
        if (parent) {
          modal.style.left = '50%';
          modal.style.top = '100%';
          modal.style.transform = 'translate(-50%, -100%)';
        }
      }
    });
  }
}

// Add resize event listener
window.addEventListener('resize', handleResize);

// Add touch events for mobile
document.addEventListener('DOMContentLoaded', function() {
  setupTouchInteractions();
  
  // Initial check for screen size adjustments
  if (window.innerWidth <= 768) {
    const twoColumnContainers = document.querySelectorAll('.two-column-container');
    twoColumnContainers.forEach(container => {
      if (container.classList.contains('is-active')) {
        adjustForMobileLayout(container);
      }
    });
  }
  
  // Initial tapir size adjustment
  adjustTapirSize();
  
  // Initialize all highlights to be inactive
  const allHighlights = document.querySelectorAll('.highlight-brush');
  allHighlights.forEach(highlight => {
    highlight.classList.remove('highlight-active');
  });
});

//##################################################
// Button click event handler
//##################################################

document.addEventListener('DOMContentLoaded', function() {
  const scrollButton = document.getElementById('scroll-down-button');
  const scrollContainer = document.querySelector('.scroll-container');
  let hasScrolled = false; // Track if user has scrolled
  
// Function to handle button click and refresh when returning to top
function handleButtonClick() {
  // Check if we're in "return to top" mode
  if (scrollButton.classList.contains('return-to-top')) {
    // First scroll to the top of the page
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    // After the scroll animation completes, refresh the page
    setTimeout(() => {
      window.location.reload();
    }, 800); // Wait for scroll animation (about 800ms)
  } else {
    // Regular scroll down behavior
    scrollToNextSection();
  }
}
  
  // Function to scroll to the next section
  function scrollToNextSection() {
    const currentPosition = window.scrollY;
    const windowHeight = window.innerHeight;
    const sections = document.querySelectorAll('.step, .two-column-container');
    
    // Find the next section to scroll to
    let targetSection = null;
    
    for (const section of sections) {
      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      if (sectionTop > currentPosition + 50) {  // 50px buffer
        targetSection = section;
        break;
      }
    }
    
    // If we found a target section, scroll to it
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      // If no section found, just scroll down one viewport height
      window.scrollTo({
        top: currentPosition + windowHeight,
        behavior: 'smooth'
      });
    }
  }
  
  // Enhanced function to check scroll position and update button state
  function updateButtonState() {
    const scrollHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY;
    const clientHeight = document.documentElement.clientHeight;
    
    // If we're near the bottom of the page (within 100px of the bottom)
    if (scrollHeight - scrollTop - clientHeight < 100) {
      scrollButton.classList.add('return-to-top');
    } else {
      scrollButton.classList.remove('return-to-top');
    }
    
    // If this is the first time the user has scrolled beyond a threshold
    if (!hasScrolled && scrollTop > 100) {
      hasScrolled = true;
      scrollButton.classList.add('scrolled');
    }
    
    // If the user goes back to the top, reset the pulse
    if (scrollTop < 100) {
      hasScrolled = false;
      scrollButton.classList.remove('scrolled');
    }
    
    // Enhance button visibility on mobile
    if (window.innerWidth <= 480) {
      // Make button slightly more visible on mobile
      scrollButton.style.opacity = scrollTop > 100 ? '0.9' : '0.8';
      
      // Position the button slightly higher on mobile to avoid overlapping with content
      scrollButton.style.bottom = '15px';
    } else {
      // Reset for larger screens
      scrollButton.style.opacity = '';
      scrollButton.style.bottom = '';
    }
  }
  
  // Add event listeners
  window.addEventListener('scroll', updateButtonState);
  scrollButton.addEventListener('click', handleButtonClick);
  
  // Add touch event for mobile
  scrollButton.addEventListener('touchstart', function(e) {
    e.preventDefault(); // Prevent double-firing
    handleButtonClick();
  }, { passive: false });
  
  // Initial check
  updateButtonState();
});

// Function placeholder for chart resizing - implement this in your chart JS file
function updateChartSize() {
  // This is a placeholder - implement this in your chart JS file
  // This function should be called when the window is resized
  console.log('Chart resize function called');
  
  // Example implementation:
  const chartContainer = document.getElementById('main-chart');
  if (!chartContainer) return;
  
}