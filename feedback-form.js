document.addEventListener('DOMContentLoaded', function() {
    // All countries list
    const countries = [
        "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua & Barbuda", "Argentina", "Armenia", "Australia", "Austria", 
        // ... rest of countries list
    ];
    
    // Element references
    const ageButton = document.getElementById('age-button');
    const locationButton = document.getElementById('location-button');
    const feedbackButton = document.getElementById('feedback-button');
    
    const ageContainer = document.getElementById('age-container');
    const locationContainer = document.getElementById('location-container');
    const feedbackContainer = document.getElementById('feedback-container');
    
    const ageInput = document.getElementById('age-input');
    const locationSelect = document.getElementById('location-select');
    const feedbackRadios = document.querySelectorAll('input[name="feedback"]');
    
    const submitContainer = document.getElementById('submit-container');
    const submitButton = document.getElementById('submit-button');
    const thankYouMessage = document.getElementById('thank-you');
    
    // Populate the country dropdown
    countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        locationSelect.appendChild(option);
    });
    
    // Form data 
    let formData = {
        age: '',
        location: '',
        feedback: ''
    };
    
    // Track which sections are completed and visible
    let sectionsVisible = {
        age: false,
        location: false,
        feedback: false
    };
    
    // Improved button click handler function that handles event propagation
    function handleButtonClick(button, container, sectionKey) {
        return function(event) {
            // Stop event propagation to prevent issues
            event.stopPropagation();
            
            // Make sure we're handling the click on the button itself
            const isVisible = container.classList.contains('active');
            
            // Toggle visibility using classes instead of direct style manipulation
            if (isVisible) {
                container.classList.remove('active');
                container.style.display = 'none';
                sectionsVisible[sectionKey] = false;
                button.classList.remove('selected-button');
            } else {
                container.classList.add('active');
                container.style.display = 'block';
                sectionsVisible[sectionKey] = true;
                button.classList.add('selected-button');
            }
            
            updateSubmitButtonVisibility();
        };
    }
    
    // Apply improved event handlers
    ageButton.addEventListener('click', handleButtonClick(ageButton, ageContainer, 'age'));
    locationButton.addEventListener('click', handleButtonClick(locationButton, locationContainer, 'location'));
    feedbackButton.addEventListener('click', handleButtonClick(feedbackButton, feedbackContainer, 'feedback'));
    
    // Event delegation for any child elements inside buttons
    // This ensures clicks on any part of the button (like text) still trigger the button
    [ageButton, locationButton, feedbackButton].forEach(button => {
        const children = button.querySelectorAll('*');
        children.forEach(child => {
            child.addEventListener('click', function(event) {
                // Prevent the event from bubbling up to parent elements
                event.stopPropagation();
                // Trigger a click on the parent button
                button.click();
            });
        });
    });
    
    // Update form data when inputs change
    ageInput.addEventListener('input', function() {
        formData.age = this.value;
        updateSubmitButtonVisibility();
    });
    
    locationSelect.addEventListener('change', function() {
        formData.location = this.value;
        updateSubmitButtonVisibility();
    });
    
    feedbackRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            formData.feedback = this.value;
            updateSubmitButtonVisibility();
        });
    });
    
    // Show submit button only if all three questions are answered
    function updateSubmitButtonVisibility() {
        // Check if all three form fields have values
        const allQuestionsAnswered = formData.age !== '' && 
                                     formData.location !== '' && 
                                     formData.feedback !== '';
        
        // Only show submit if all questions are answered
        submitContainer.style.display = allQuestionsAnswered ? 'block' : 'none';
    }
    
    // Function to send data to Google Form
    function sendToGoogleForm(data) {
        // Form submission URL
        const formUrl = "https://docs.google.com/forms/d/10hTG8qn5GtfG18Tg_b7isYTZ1spRt21vNSyqSt1rbwk/formResponse";
        
        // Create a FormData object with the correct entry IDs
        const formData = new FormData();
        formData.append('entry.168865574', data.age);         // Age field
        formData.append('entry.2085059612', data.location);   // Location field
        formData.append('entry.2116187728', data.feedback);   // Feedback field
        
        // Create an invisible iframe to submit the form (avoids CORS issues)
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        
        // Set up form in iframe
        iframe.onload = function() {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            const form = iframeDoc.createElement('form');
            form.method = 'POST';
            form.action = formUrl;
            
            // Add form data
            for (const [key, value] of formData.entries()) {
                const input = iframeDoc.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = value;
                form.appendChild(input);
            }
            
            // Add form to iframe and submit
            iframeDoc.body.appendChild(form);
            form.submit();
            console.log('Form submitted!', data);
            
            // Clean up after submission
            setTimeout(() => {
                document.body.removeChild(iframe);
            }, 1000);
        };
        
        // Set src to about:blank to trigger onload
        iframe.src = 'about:blank';
    }
    
    // Function to handle form submission with chart update
    function handleFormSubmission(data) {
        // Send data to Google Form
        sendToGoogleForm(data);
        
        // Wait a moment for the data to propagate to the spreadsheet
        // then check if the chart refresh function exists and call it
        setTimeout(() => {
            if (document.getElementById('lollipop-chart-container') && 
                typeof window.generateAgeLollipopChart === 'function') {
                window.generateAgeLollipopChart('lollipop-chart-container');
                console.log('Chart update triggered after form submission');
            }
        }, 1000); // 1 second delay to allow time for Google Form submission to update the sheet
    }

    // Improved submit button handler with stopPropagation
    submitButton.addEventListener('click', function(event) {
        // Stop event propagation
        event.stopPropagation();
        
        // Use the form submission handler that will also update the chart
        handleFormSubmission(formData);
        
        // Show thank you message
        thankYouMessage.style.display = 'block';
        submitContainer.style.display = 'none';
        
        // Hide all input containers
        ageContainer.style.display = 'none';
        locationContainer.style.display = 'none';
        feedbackContainer.style.display = 'none';
        
        // Reset sections visible state
        sectionsVisible.age = false;
        sectionsVisible.location = false;
        sectionsVisible.feedback = false;
        
        // Reset button colors by removing classes
        ageButton.classList.remove('selected-button');
        locationButton.classList.remove('selected-button');
        feedbackButton.classList.remove('selected-button');
    });

    // Initialize - hide all inputs
    ageContainer.style.display = 'none';
    locationContainer.style.display = 'none';
    feedbackContainer.style.display = 'none';
    submitContainer.style.display = 'none';
    thankYouMessage.style.display = 'none';
});