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
    
    // Improved button click handlers with better event delegation
    function handleButtonClick(button, container, sectionName) {
        return function(e) {
            e.preventDefault(); // Prevent default behavior
            e.stopPropagation(); // Stop event bubbling
            
            // Get computed style to check visibility reliably
            const computedStyle = window.getComputedStyle(container);
            const isVisible = computedStyle.display !== 'none';
            
            // Toggle visibility with reliable checks
            if (isVisible) {
                container.style.display = 'none';
                sectionsVisible[sectionName] = false;
                button.style.backgroundColor = '';
            } else {
                container.style.display = 'block';
                sectionsVisible[sectionName] = true;
                button.style.backgroundColor = '#2a9d8f';
            }
            
            // Update submit button visibility
            updateSubmitButtonVisibility();
        };
    }
    
    // Use improved event handlers with proper binding
    ageButton.addEventListener('click', handleButtonClick(ageButton, ageContainer, 'age'));
    locationButton.addEventListener('click', handleButtonClick(locationButton, locationContainer, 'location'));
    feedbackButton.addEventListener('click', handleButtonClick(feedbackButton, feedbackContainer, 'feedback'));
    
    // Add touchstart event listeners for mobile devices
    ageButton.addEventListener('touchstart', handleButtonClick(ageButton, ageContainer, 'age'));
    locationButton.addEventListener('touchstart', handleButtonClick(locationButton, locationContainer, 'location'));
    feedbackButton.addEventListener('touchstart', handleButtonClick(feedbackButton, feedbackContainer, 'feedback'));
    
    // Update form data when inputs change with proper validation
    ageInput.addEventListener('input', function() {
        formData.age = this.value.trim();
        updateSubmitButtonVisibility();
    });
    
    locationSelect.addEventListener('change', function() {
        formData.location = this.value;
        updateSubmitButtonVisibility();
    });
    
    // Improved radio button handling
    feedbackRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            formData.feedback = this.value;
            updateSubmitButtonVisibility();
        });
    });
    
    // Show submit button only if all visible sections are answered
    function updateSubmitButtonVisibility() {
        // Initialize flags for validation
        let ageValid = true;
        let locationValid = true;
        let feedbackValid = true;
        
        // Only validate sections that are visible
        if (sectionsVisible.age) {
            ageValid = formData.age !== '';
        }
        
        if (sectionsVisible.location) {
            locationValid = formData.location !== '';
        }
        
        if (sectionsVisible.feedback) {
            feedbackValid = formData.feedback !== '';
        }
        
        // Show submit button if all visible sections are valid AND at least one section is visible
        const anySectionVisible = sectionsVisible.age || sectionsVisible.location || sectionsVisible.feedback;
        const allVisibleSectionsValid = ageValid && locationValid && feedbackValid;
        
        submitContainer.style.display = (anySectionVisible && allVisibleSectionsValid) ? 'block' : 'none';
    }
    
    // Function to send data to Google Form
    function sendToGoogleForm(data) {
        // Only send data for visible sections
        const dataToSend = {};
        
        if (sectionsVisible.age) {
            dataToSend.age = data.age;
        }
        
        if (sectionsVisible.location) {
            dataToSend.location = data.location;
        }
        
        if (sectionsVisible.feedback) {
            dataToSend.feedback = data.feedback;
        }
        
        // Form submission URL
        const formUrl = "https://docs.google.com/forms/d/10hTG8qn5GtfG18Tg_b7isYTZ1spRt21vNSyqSt1rbwk/formResponse";
        
        // Create a FormData object with the correct entry IDs
        const formData = new FormData();
        
        // Only append fields that have values
        if (dataToSend.age) {
            formData.append('entry.168865574', dataToSend.age);
        }
        
        if (dataToSend.location) {
            formData.append('entry.2085059612', dataToSend.location);
        }
        
        if (dataToSend.feedback) {
            formData.append('entry.2116187728', dataToSend.feedback);
        }
        
        // Create an invisible iframe to submit the form (avoids CORS issues)
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        
        // Set up form in iframe with error handling
        iframe.onload = function() {
            try {
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
                console.log('Form submitted!', dataToSend);
                
                // Clean up after submission
                setTimeout(() => {
                    document.body.removeChild(iframe);
                }, 1000);
            } catch (error) {
                console.error('Form submission error:', error);
                // Still show thank you message even if there's an error
                showThankYouMessage();
            }
        };
        
        // Handle iframe loading errors
        iframe.onerror = function() {
            console.error('Form iframe loading error');
            // Still show thank you message even if there's an error
            showThankYouMessage();
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
                try {
                    window.generateAgeLollipopChart('lollipop-chart-container');
                    console.log('Chart update triggered after form submission');
                } catch (error) {
                    console.error('Chart update error:', error);
                }
            }
        }, 1500); // 1.5 seconds delay to allow time for Google Form submission to update the sheet
        
        // Show thank you message
        showThankYouMessage();
    }
    
    // Function to show thank you message and reset form
    function showThankYouMessage() {
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
    }

    // Handle form submission with debounce to prevent double-clicks
    let isSubmitting = false;
    submitButton.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Prevent multiple submissions
        if (isSubmitting) return;
        
        isSubmitting = true;
        
        // Use the form submission handler
        handleFormSubmission(formData);
        
        // Reset submission state after a delay
        setTimeout(() => {
            isSubmitting = false;
        }, 2000);
    });
    
    // Add touchstart event for mobile devices
    submitButton.addEventListener('touchstart', function(e) {
        if (!isSubmitting) {
            e.preventDefault();
            submitButton.click();
        }
    });

    // Initialize - hide all inputs and ensure proper state
    ageContainer.style.display = 'none';
    locationContainer.style.display = 'none';
    feedbackContainer.style.display = 'none';
    submitContainer.style.display = 'none';
    thankYouMessage.style.display = 'none';
    
    // Reset any lingering button colors on page load
    ageButton.style.backgroundColor = '';
    locationButton.style.backgroundColor = '';
    feedbackButton.style.backgroundColor = '';
});