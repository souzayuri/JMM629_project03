document.addEventListener('DOMContentLoaded', function() {
    // All countries list
    const countries = [
        "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua & Barbuda", "Argentina", "Armenia", "Australia", "Austria", 
        "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", 
        "Bolivia", "Bosnia & Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", 
        "Canada", "Cape Verde", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", 
        "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", 
        "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", 
        "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", 
        "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", 
        "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kosovo", 
        "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", 
        "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", 
        "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", 
        "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway", "Oman", 
        "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", 
        "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts & Nevis", "Saint Lucia", "Saint Vincent & the Grenadines", "Samoa", "San Marino", "São Tomé & Príncipe", 
        "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", 
        "South Africa", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", 
        "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad & Tobago", "Tunisia", "Turkey", "Turkmenistan", 
        "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", 
        "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
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
    
    // Add flag to track if form has been submitted
    let formSubmitted = false;
    
    // Clear submission state on page load/refresh
    sessionStorage.removeItem('formSubmitted');
    
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
    
    // Move the submit container to be next to feedback buttons
    // This is important for the new positioning
    const feedbackButtons = document.querySelector('.feedback-buttons');
    if (feedbackButtons && submitContainer) {
        // Check if submit container is not already a child of feedback buttons
        if (submitContainer.parentNode !== feedbackButtons) {
            // First, save a reference to the original parent
            const originalParent = submitContainer.parentNode;
            
            // Move the submit container into the feedback buttons container
            feedbackButtons.appendChild(submitContainer);
            
            console.log('Submit container moved to feedback buttons section');
        }
    }
    
    // Toggle sections when buttons are clicked
    ageButton.addEventListener('click', function() {
        // If form is already submitted, don't allow changes
        if (formSubmitted) {
            alert('Form has already been submitted. Please refresh the page to submit again.');
            return;
        }
        
        // If this container is already visible, hide it
        if (ageContainer.style.display === 'block') {
            ageContainer.style.display = 'none';
            sectionsVisible.age = false;
            // Remove the selected color
            this.style.backgroundColor = '';
        } else {
            // Show only this container
            ageContainer.style.display = 'block';
            sectionsVisible.age = true;
            // Set the selected button color
            this.style.backgroundColor = '#2a9d8f';
        }
        updateSubmitButtonVisibility();
    });
    
    locationButton.addEventListener('click', function() {
        // If form is already submitted, don't allow changes
        if (formSubmitted) {
            alert('Form has already been submitted. Please refresh the page to submit again.');
            return;
        }
        
        // If this container is already visible, hide it
        if (locationContainer.style.display === 'block') {
            locationContainer.style.display = 'none';
            sectionsVisible.location = false;
            // Remove the selected color
            this.style.backgroundColor = '';
        } else {
            // Show only this container
            locationContainer.style.display = 'block';
            sectionsVisible.location = true;
            // Set the selected button color
            this.style.backgroundColor = '#2a9d8f';
        }
        updateSubmitButtonVisibility();
    });
    
    feedbackButton.addEventListener('click', function() {
        // If form is already submitted, don't allow changes
        if (formSubmitted) {
            alert('Form has already been submitted. Please refresh the page to submit again.');
            return;
        }
        
        // If this container is already visible, hide it
        if (feedbackContainer.style.display === 'block') {
            feedbackContainer.style.display = 'none';
            sectionsVisible.feedback = false;
            // Remove the selected color
            this.style.backgroundColor = '';
        } else {
            // Show only this container
            feedbackContainer.style.display = 'block';
            sectionsVisible.feedback = true;
            // Set the selected button color
            this.style.backgroundColor = '#2a9d8f';
        }
        updateSubmitButtonVisibility();
    });
    
    // Update form data when inputs change
    ageInput.addEventListener('input', function() {
        // If form is already submitted, don't allow changes
        if (formSubmitted) {
            alert('Form has already been submitted. Please refresh the page to submit again.');
            this.value = formData.age; // Reset to previous value
            return;
        }
        
        formData.age = this.value;
        updateSubmitButtonVisibility();
    });
    
    locationSelect.addEventListener('change', function() {
        // If form is already submitted, don't allow changes
        if (formSubmitted) {
            alert('Form has already been submitted. Please refresh the page to submit again.');
            this.value = formData.location; // Reset to previous value
            return;
        }
        
        formData.location = this.value;
        updateSubmitButtonVisibility();
    });
    
    feedbackRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            // If form is already submitted, don't allow changes
            if (formSubmitted) {
                alert('Form has already been submitted. Please refresh the page to submit again.');
                // Reset to previous selection
                feedbackRadios.forEach(r => {
                    r.checked = (r.value === formData.feedback);
                });
                return;
            }
            
            formData.feedback = this.value;
            updateSubmitButtonVisibility();
        });
    });
    
    // Show submit button only if all three questions are answered
    function updateSubmitButtonVisibility() {
        // Don't show submit if form is already submitted
        if (formSubmitted) {
            submitContainer.style.display = 'none';
            return;
        }
        
        // Check if all three form fields have values
        const allQuestionsAnswered = formData.age !== '' && 
                                     formData.location !== '' && 
                                     formData.feedback !== '';
        
        // Only show submit if all questions are answered
        submitContainer.style.display = allQuestionsAnswered ? 'block' : 'none';
        
        // Update media query positioning
        updateSubmitButtonPosition();
    }
    
    // Function to handle responsive positioning of the submit button
    function updateSubmitButtonPosition() {
        // Check if we need to adjust for mobile view
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            submitContainer.style.position = 'relative';
            submitContainer.style.left = 'auto';
            submitContainer.style.top = 'auto';
            submitContainer.style.transform = 'none';
            submitContainer.style.marginTop = '20px';
        } else {
            submitContainer.style.position = 'absolute';
            submitContainer.style.left = '-90px';
            submitContainer.style.top = '50%';
            submitContainer.style.transform = 'translateY(-50%)';
            submitContainer.style.margin = '0';
        }
    }
    
    // Call this on window resize too
    window.addEventListener('resize', updateSubmitButtonPosition);
    
    // Handle form submission
    submitButton.addEventListener('click', function(e) {
        // Prevent any default behavior
        e.preventDefault();
        e.stopPropagation();
        
        // If form is already submitted, don't allow resubmission
        if (formSubmitted) {
            alert('Form has already been submitted. Please refresh the page to submit again.');
            return;
        }
        
        console.log("Submit button clicked");
        
        // Use the form submission function
        sendToGoogleForm(formData);
        
        // Mark form as submitted
        formSubmitted = true;
        
        // Store submission state in local variable only, not in session storage
        // We're no longer using sessionStorage.setItem('formSubmitted', 'true');
        
        // Show thank you message and hide form elements
        showThankYouState();
    });
    
    // Function to show the thank you state
    function showThankYouState() {
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
        
        // Reset button colors
        ageButton.style.backgroundColor = '';
        locationButton.style.backgroundColor = '';
        feedbackButton.style.backgroundColor = '';
        
        // Disable all form elements
        ageInput.disabled = true;
        locationSelect.disabled = true;
        feedbackRadios.forEach(radio => radio.disabled = true);
        
        // Add this new code to refresh the chart after form submission
        const chartContainer = document.getElementById('lollipop-chart-container');
        if (chartContainer) {
            // Remove the rendered flag to allow re-rendering
            chartContainer.removeAttribute('data-chart-rendered');
            // Call the chart generation function
            if (window.generateAgeLollipopChart) {
                setTimeout(() => {
                    window.generateAgeLollipopChart('lollipop-chart-container');
                }, 1000); // Give time for the form data to be processed
            }
        }
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
        
        // Log the data being submitted
        console.log('Submitting form data:', data);
        
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

    // Initialize - hide all inputs
    ageContainer.style.display = 'none';
    locationContainer.style.display = 'none';
    feedbackContainer.style.display = 'none'
    submitContainer.style.display = 'none';
    thankYouMessage.style.display = 'none';
    
    // Initialize the button position based on screen size
    updateSubmitButtonPosition();

    
});