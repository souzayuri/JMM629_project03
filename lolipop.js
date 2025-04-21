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
    
    // ================ FORM SUBMISSION SECTION ================
    
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
        // Use the new form submission function
        sendToGoogleForm(formData);
        
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

    // Initialize - hide all inputs
    ageContainer.style.display = 'none';
    locationContainer.style.display = 'none';
    feedbackContainer.style.display = 'none';
    submitContainer.style.display = 'none';
    thankYouMessage.style.display = 'none';
    
    // ================ DATA VISUALIZATION SECTION ================
    
    // If there's a chart container on the page, initialize the visualization
    const chartContainer = document.getElementById('lollipop-chart-container');
    if (chartContainer) {
        generateAgeLollipopChart('lollipop-chart-container');
    }

    // Function to fetch data from the published Google Spreadsheet
    async function fetchSpreadsheetData() {
        // Get the spreadsheet ID from your Google Sheet URL
        const sheetId = '1AESSj7qTgwxMaYQZi2XbIwcoarOMBTGwUc_g_2Oi8wM';
        
        // This assumes you've published your sheet to the web (File > Share > Publish to web)
        const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const csvText = await response.text();
            
            // Parse CSV
            return parseCSV(csvText);
        } catch (error) {
            console.error('Error fetching spreadsheet data:', error);
            return null;
        }
    }
    
    // Parse CSV data
    function parseCSV(csvText) {
        // Simple CSV parser
        const rows = csvText.split('\n');
        const headers = rows[0].split(',').map(header => header.replace(/"/g, '').trim());
        
        return rows.slice(1).map(row => {
            const values = row.split(',').map(value => value.replace(/"/g, '').trim());
            const entry = {};
            
            headers.forEach((header, index) => {
                entry[header] = values[index];
            });
            
            return entry;
        });
    }
    
    // Process data for visualization
    function processDataForLollipopChart(data) {
        // Group data by country
        const countrySummary = {};
        
        data.forEach(entry => {
            const country = entry.location;
            const age = parseInt(entry.age);
            
            if (!isNaN(age) && country) {
                if (!countrySummary[country]) {
                    countrySummary[country] = {
                        ages: [],
                        avgAge: 0,
                        minAge: Infinity,
                        maxAge: -Infinity,
                        count: 0
                    };
                }
                
                countrySummary[country].ages.push(age);
                countrySummary[country].minAge = Math.min(countrySummary[country].minAge, age);
                countrySummary[country].maxAge = Math.max(countrySummary[country].maxAge, age);
                countrySummary[country].count++;
            }
        });
        
        // Calculate average ages and prepare final data
        const chartData = Object.keys(countrySummary).map(country => {
            const summary = countrySummary[country];
            const avgAge = summary.ages.reduce((sum, age) => sum + age, 0) / summary.count;
            
            return {
                country: country,
                avgAge: parseFloat(avgAge.toFixed(1)),
                minAge: summary.minAge,
                maxAge: summary.maxAge,
                ageRange: summary.maxAge - summary.minAge,
                count: summary.count
            };
        });
        
        // Sort data by average age
        return chartData.sort((a, b) => b.avgAge - a.avgAge);
    }
    
    // Create the lollipop chart SVG
    function createLollipopChart(chartData) {
        // SVG dimensions and margins
        const width = 800;
        const height = 600;
        const margin = { top: 40, right: 120, bottom: 60, left: 150 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;
        
        // Only take top 15 countries if there are many
        const displayData = chartData.slice(0, 15);
        
        // SVG container
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        
        // Define scales
        const xMax = Math.max(...displayData.map(d => d.maxAge), 100);
        const xScale = innerWidth / xMax;
        
        const yScale = innerHeight / displayData.length;
        
        // Add title
        const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        title.setAttribute('x', width / 2);
        title.setAttribute('y', 30);
        title.setAttribute('text-anchor', 'middle');
        title.setAttribute('font-size', '18px');
        title.setAttribute('font-weight', 'bold');
        title.textContent = 'Age Ranges by Country';
        svg.appendChild(title);
        
        // Create a group for the chart content
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', `translate(${margin.left}, ${margin.top})`);
        svg.appendChild(g);
        
        // Add X axis
        const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        xAxis.setAttribute('transform', `translate(0, ${innerHeight})`);
        
        // X axis line
        const xAxisLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        xAxisLine.setAttribute('x1', 0);
        xAxisLine.setAttribute('y1', 0);
        xAxisLine.setAttribute('x2', innerWidth);
        xAxisLine.setAttribute('y2', 0);
        xAxisLine.setAttribute('stroke', '#000');
        xAxisLine.setAttribute('stroke-width', '1');
        xAxis.appendChild(xAxisLine);
        
        // X axis ticks and labels
        for (let i = 0; i <= xMax; i += 10) {
            const tickX = i * xScale;
            
            // Tick line
            const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            tick.setAttribute('x1', tickX);
            tick.setAttribute('y1', 0);
            tick.setAttribute('x2', tickX);
            tick.setAttribute('y2', 5);
            tick.setAttribute('stroke', '#000');
            tick.setAttribute('stroke-width', '1');
            xAxis.appendChild(tick);
            
            // Tick label
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', tickX);
            label.setAttribute('y', 20);
            label.setAttribute('text-anchor', 'middle');
            label.setAttribute('font-size', '12px');
            label.textContent = i;
            xAxis.appendChild(label);
        }
        
        // X axis label
        const xLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        xLabel.setAttribute('x', innerWidth / 2);
        xLabel.setAttribute('y', 50);
        xLabel.setAttribute('text-anchor', 'middle');
        xLabel.setAttribute('font-size', '14px');
        xLabel.textContent = 'Age';
        xAxis.appendChild(xLabel);
        
        g.appendChild(xAxis);
        
        // Create lollipops for each country
        displayData.forEach((d, i) => {
            const yPos = i * yScale + yScale / 2;
            
            // Lollipop stick (line representing the age range)
            const stick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            stick.setAttribute('x1', d.minAge * xScale);
            stick.setAttribute('y1', yPos);
            stick.setAttribute('x2', d.maxAge * xScale);
            stick.setAttribute('y2', yPos);
            stick.setAttribute('stroke', '#2a9d8f');
            stick.setAttribute('stroke-width', '2');
            g.appendChild(stick);
            
            // Average age marker (the lollipop circle)
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', d.avgAge * xScale);
            circle.setAttribute('cy', yPos);
            circle.setAttribute('r', Math.min(10, Math.max(5, d.count * 2))); // Size based on count, with limits
            circle.setAttribute('fill', '#e76f51');
            
            // Tooltip on hover
            circle.setAttribute('data-tooltip', `${d.country}: Avg Age ${d.avgAge}, Range ${d.minAge}-${d.maxAge}, Count: ${d.count}`);
            g.appendChild(circle);
            
            // Country label
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', -10);
            label.setAttribute('y', yPos);
            label.setAttribute('text-anchor', 'end');
            label.setAttribute('alignment-baseline', 'middle');
            label.setAttribute('font-size', '12px');
            label.textContent = d.country;
            g.appendChild(label);
            
            // Age range label
            const rangeLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            rangeLabel.setAttribute('x', d.maxAge * xScale + 10);
            rangeLabel.setAttribute('y', yPos);
            rangeLabel.setAttribute('alignment-baseline', 'middle');
            rangeLabel.setAttribute('font-size', '12px');
            rangeLabel.textContent = `${d.minAge}-${d.maxAge} (avg: ${d.avgAge})`;
            g.appendChild(rangeLabel);
        });
        
        return svg;
    }
    
    // Main function to generate the chart
    async function generateAgeLollipopChart(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container with ID "${containerId}" not found.`);
            return;
        }
        
        // Show loading message
        container.innerHTML = 'Loading data...';
        
        try {
            // Fetch and process data
            const data = await fetchSpreadsheetData();
            if (!data || data.length === 0) {
                container.innerHTML = 'No data available or error fetching data.';
                return;
            }
            
            const chartData = processDataForLollipopChart(data);
            
            // Create and append the chart
            const chartSvg = createLollipopChart(chartData);
            
            // Clear the container and add the chart
            container.innerHTML = '';
            container.appendChild(chartSvg);
            
            // Add simple tooltip functionality
            document.querySelectorAll('[data-tooltip]').forEach(element => {
                element.addEventListener('mouseover', function(e) {
                    const tooltip = document.createElement('div');
                    tooltip.className = 'tooltip';
                    tooltip.textContent = this.getAttribute('data-tooltip');
                    tooltip.style.position = 'absolute';
                    tooltip.style.left = `${e.pageX + 10}px`;
                    tooltip.style.top = `${e.pageY + 10}px`;
                    tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
                    tooltip.style.color = 'white';
                    tooltip.style.padding = '5px 10px';
                    tooltip.style.borderRadius = '4px';
                    tooltip.style.zIndex = '1000';
                    document.body.appendChild(tooltip);
                    
                    this.addEventListener('mousemove', function(e) {
                        tooltip.style.left = `${e.pageX + 10}px`;
                        tooltip.style.top = `${e.pageY + 10}px`;
                    });
                    
                    this.addEventListener('mouseout', function() {
                        document.body.removeChild(tooltip);
                    }, { once: true });
                });
            });
            
        } catch (error) {
            console.error('Error generating chart:', error);
            container.innerHTML = 'Error generating chart. Please check console for details.';
        }
    }
});