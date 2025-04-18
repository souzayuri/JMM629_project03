        // Array of box classes
        const boxes = ['.box-1', '.box-2', '.box-3', '.box-4'];
        // Delay between each box appearing (in milliseconds)
        const delay = 1500; 
        
        // Function to show boxes sequentially
        function showBoxesSequentially() {
            // Hide all boxes initially
            boxes.forEach((boxClass, index) => {
                const box = document.querySelector(boxClass);
                box.classList.remove('visible');
            });
            
            // Show boxes with delay
            boxes.forEach((boxClass, index) => {
                setTimeout(() => {
                    const box = document.querySelector(boxClass);
                    box.classList.add('visible');
                }, delay * index);
            });
        }
        
        // Function to restart the animation
        function restartAnimation() {
            showBoxesSequentially();
        }
        
        // Start the animation when the page loads
        window.addEventListener('load', showBoxesSequentially);