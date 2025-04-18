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
    
    // Toggle sections when buttons are clicked
    ageButton.addEventListener('click', function() {
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
    
    // Handle form submission
    submitButton.addEventListener('click', function() {
        // Send all data to Google Sheets
        sendToGoogleSheets(formData);
        
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
    });
    
    // Function to send data to Google Sheets
    function sendToGoogleSheets(data) {
        // In a real implementation, you would use Google Apps Script with a Web App deployment
        // Example: Using fetch to send data to a Google Apps Script Web App
        
        const url = "https://script.google.com/macros/s/AKfycbzAbct47a4VvdX0liwHmXIDSLxzJOZMwe5hlt-HdLACIy-hgQI0FYPbCPVaOzpAaRxZzQ/exec"; // Your deployed Google Apps Script URL
        
        fetch(url, {
            method: 'POST',
            mode: 'no-cors',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json',
            },
            redirect: 'follow',
            body: JSON.stringify(data)
        })
        .then(response => console.log('Success!'))
        .catch(error => console.error('Error:', error));
        
        // Log the data for now
        console.log('Data to send to Google Sheets:', data);
    }

    // Initialize - hide all inputs
    ageContainer.style.display = 'none';
    locationContainer.style.display = 'none';
    feedbackContainer.style.display = 'none';
    submitContainer.style.display = 'none';
    thankYouMessage.style.display = 'none';
});