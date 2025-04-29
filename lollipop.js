document.addEventListener('DOMContentLoaded', function() {
    console.log("Lollipop chart script loaded");
    
    // Register a MutationObserver to watch for changes to the chart container visibility
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && 
                (mutation.attributeName === 'style' || mutation.attributeName === 'class')) {
                const chartContainer = document.getElementById('lollipop-chart-container');
                if (chartContainer && isElementVisible(chartContainer) && 
                    !chartContainer.hasAttribute('data-chart-rendered')) {
                    console.log("Chart container is now visible, rendering chart");
                    generateAgeLollipopChart('lollipop-chart-container');
                    chartContainer.setAttribute('data-chart-rendered', 'true');
                }
            }
        });
    });
    
    // Also check on window resize as this can trigger layout changes
    window.addEventListener('resize', function() {
        const chartContainer = document.getElementById('lollipop-chart-container');
        if (chartContainer && isElementVisible(chartContainer)) {
            console.log("Chart container resized, re-rendering chart");
            // Remove the data-chart-rendered attribute to allow re-rendering
            chartContainer.removeAttribute('data-chart-rendered');
            generateAgeLollipopChart('lollipop-chart-container');
            chartContainer.setAttribute('data-chart-rendered', 'true');
        }
    });
    
    // Check if step visibility changes (for scrollytelling)
    document.querySelectorAll('.step').forEach(function(step) {
        observer.observe(step, { attributes: true });
    });
    
    // Function to check if an element is visible
    function isElementVisible(element) {
        if (!element) return false;
        const style = window.getComputedStyle(element);
        if (style.display === 'none') return false;
        if (style.visibility === 'hidden') return false;
        if (parseFloat(style.opacity) === 0) return false;
        
        // Check if element has dimensions
        const rect = element.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return false;
        
        return true;
    }
    
    // Check for the chart container on initial load
    const chartContainer = document.getElementById('lollipop-chart-container');
    if (chartContainer) {
        if (isElementVisible(chartContainer)) {
            console.log("Chart container visible on initial load, rendering immediately");
            generateAgeLollipopChart('lollipop-chart-container');
            chartContainer.setAttribute('data-chart-rendered', 'true');
        } else {
            console.log("Chart container exists but not visible yet, will render when visible");
            // Also set up a backup timeout in case other detection methods fail
            setTimeout(function() {
                if (!chartContainer.hasAttribute('data-chart-rendered')) {
                    console.log("Rendering chart via timeout fallback");
                    generateAgeLollipopChart('lollipop-chart-container');
                    chartContainer.setAttribute('data-chart-rendered', 'true');
                }
            }, 2000); // 2 second fallback
        }
    }
    
    // Make the function globally available
    window.generateAgeLollipopChart = generateAgeLollipopChart;
    
    // Function to fetch data from the published Google Spreadsheet
    async function fetchSpreadsheetData() {
        // Add cache-busting parameter to prevent caching
        const cacheBuster = new Date().getTime();
        
        // Get the spreadsheet ID from your Google Sheet URL
        const sheetId = '1AESSj7qTgwxMaYQZi2XbIwcoarOMBTGwUc_g_2Oi8wM';
        
        // This assumes you've published your sheet to the web (File > Share > Publish to web)
        const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&cacheBuster=${cacheBuster}`;
        
        try {
            console.log("Fetching spreadsheet data from:", url);
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const csvText = await response.text();
            console.log("Received CSV data length:", csvText.length);
            
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
        console.log("CSV rows found:", rows.length);
        
        if (rows.length <= 1) {
            console.warn("CSV data appears to be empty or malformed");
            return [];
        }
        
        const headers = rows[0].split(',').map(header => header.replace(/"/g, '').trim());
        console.log("CSV headers:", headers);
        
        const data = rows.slice(1).map(row => {
            const values = row.split(',').map(value => value.replace(/"/g, '').trim());
            const entry = {};
            
            headers.forEach((header, index) => {
                entry[header] = values[index];
            });
            
            return entry;
        });
        
        console.log("Parsed CSV data items:", data.length);
        return data;
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
        
        console.log("Countries found:", Object.keys(countrySummary).length);
        
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
    
    // IMPROVED: Function to estimate text width more accurately
    function estimateTextWidth(text, fontSize) {
        // This is a more generous estimate based on the font characteristics
        // Increase the average character width multiplier for better accommodation
        const avgCharWidth = fontSize * 0.8; // Increased from 0.6 to 0.8
        // Add padding to account for varying character widths
        const padding = fontSize * 2; // Additional padding
        return text.length * avgCharWidth + padding;
    }
    
    // Create the lollipop chart SVG
    function createLollipopChart(chartData, containerWidth) {
        // Check if there's data to display
        if (!chartData || chartData.length === 0) {
            console.warn("No chart data available");
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('width', '100%');
            svg.setAttribute('height', '600');
            svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
            
            const noDataText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            noDataText.setAttribute('x', '50%');
            noDataText.setAttribute('y', '300');
            noDataText.setAttribute('class', 'no-data-text');
            noDataText.setAttribute('text-anchor', 'middle');
            noDataText.textContent = 'No data available yet. Submit the form to see results!';
            svg.appendChild(noDataText);
            
            return svg;
        }
        
        console.log("Creating chart with data:", chartData);
        
        // Base dimensions
        const baseWidth = containerWidth || 800; // Default to 800 if containerWidth is not provided
        
        // Calculate left margin based on longest country name
        const baseFontSize = baseWidth < 500 ? 12 : 14;
        const longestCountryName = chartData.reduce((longest, d) => 
            d.country.length > longest.length ? d.country : longest, "");
        console.log("Longest country name:", longestCountryName, "Length:", longestCountryName.length);
        
        // IMPROVED: Estimate text width of longest country name with more generous parameters
        const estimatedLabelWidth = estimateTextWidth(longestCountryName, baseFontSize);
        console.log("Estimated label width:", estimatedLabelWidth);
        
        // IMPROVED: Calculate required left margin
        const requiredLeftMargin = Math.max(120, estimatedLabelWidth + 40); // Increased minimum and padding
        
        // Now adjust overall SVG dimensions to maintain chart size despite larger margin
        // Add the difference between required margin and standard margin to maintain chart area
        const width = baseWidth + (requiredLeftMargin - 100); 
        const height = Math.min(600, Math.max(400, baseWidth * 0.75)); // Keep height based on original width
        
        console.log("Original width:", baseWidth, "Adjusted width:", width);
        
        // IMPROVED: Adjust margins based on screen size and longest country name with extra buffer
        const margin = { 
            top: Math.max(20, baseWidth * 0.05), 
            right: Math.max(60, baseWidth * 0.15), 
            left: requiredLeftMargin, // Use the calculated margin
            bottom: Math.max(40, baseWidth * 0.075) 
        };
        
        console.log("Calculated left margin:", margin.left);
        
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;
        
        // Determine how many countries to display based on available height
        const itemHeight = Math.min(30, Math.max(20, innerHeight / 15)); // Min 20px, max 30px per item
        const maxItems = Math.floor(innerHeight / itemHeight);
        
        // Only take top N countries based on available space
        const displayData = chartData.slice(0, maxItems);
        console.log(`Displaying top ${displayData.length} countries in ${innerHeight}px height`);
        
        // Recalculate inner height based on actual number of items
        const actualInnerHeight = displayData.length * itemHeight;
        
        // SVG container
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', height);
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        svg.setAttribute('preserveAspectRatio', 'xMinYMid meet'); // Changed from xMidYMid to xMinYMid to better align the chart
        svg.style.display = 'block'; // Ensure the SVG is displayed as block
        svg.style.margin = '0 auto'; // Center the SVG
        
        // Define scales
        const xMax = Math.max(...displayData.map(d => d.maxAge), 100);
        const xScale = innerWidth / xMax;
        
        const yScale = actualInnerHeight / displayData.length;
        
        // Create a group for the chart content
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', `translate(${margin.left}, ${margin.top})`);
        svg.appendChild(g);
        
        // *** NEW CODE: Add Tapir Lifespan Highlight ***
        // Define the tapir lifespan range
        const tapirMinAge = 25;
        const tapirMaxAge = 30;
        
        // Create a rectangle to highlight the tapir lifespan range
        const tapirRangeRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        tapirRangeRect.setAttribute('x', tapirMinAge * xScale);
        tapirRangeRect.setAttribute('y', 0);
        tapirRangeRect.setAttribute('width', (tapirMaxAge - tapirMinAge) * xScale);
        tapirRangeRect.setAttribute('height', actualInnerHeight);
        tapirRangeRect.setAttribute('class', 'tapir-range-highlight');
        tapirRangeRect.setAttribute('fill', 'rgba(75, 192, 192, 0.2)');
        tapirRangeRect.setAttribute('stroke', 'rgba(75, 192, 192, 0.5)');
        tapirRangeRect.setAttribute('stroke-dasharray', '5,5');
        
        // Add the highlight rectangle to the chart (before other elements so it's in the background)
        g.appendChild(tapirRangeRect);
        
        // Add Tapir lifespan label
        const tapirLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        tapirLabel.setAttribute('x', (tapirMinAge + (tapirMaxAge - tapirMinAge) / 2) * xScale);
        tapirLabel.setAttribute('y', -10); // Position above the chart
        tapirLabel.setAttribute('class', 'tapir-label');
        tapirLabel.setAttribute('text-anchor', 'middle');
        tapirLabel.setAttribute('font-size', '14px');
        tapirLabel.setAttribute('fill', 'rgba(75, 192, 192, 1)');
        tapirLabel.textContent = 'We tapirs live this long';
        
        // Create a small tapir icon/emoji
        const tapirIcon = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        tapirIcon.setAttribute('x', (tapirMinAge + (tapirMaxAge - tapirMinAge) / 2) * xScale);
        tapirIcon.setAttribute('y', 15); // Position below the label
        tapirIcon.setAttribute('class', 'tapir-icon');
        tapirIcon.setAttribute('text-anchor', 'middle');
        tapirIcon.setAttribute('font-size', '20px');
        
        // Add the tapir label and icon to the chart
        g.appendChild(tapirLabel);
        // *** END NEW CODE ***
        
        // Add X axis
        const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        xAxis.setAttribute('transform', `translate(0, ${actualInnerHeight})`);
        
        // X axis line
        const xAxisLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        xAxisLine.setAttribute('x1', 0);
        xAxisLine.setAttribute('y1', 0);
        xAxisLine.setAttribute('x2', innerWidth);
        xAxisLine.setAttribute('y2', 0);
        xAxisLine.setAttribute('class', 'axis-line');
        xAxis.appendChild(xAxisLine);
        
        // Determine tick spacing based on available width
        const tickSpacing = width < 500 ? 20 : 10; // Fewer ticks on smaller screens
        
        // X axis ticks and labels
        for (let i = 0; i <= xMax; i += tickSpacing) {
            const tickX = i * xScale;
            
            // Tick line
            const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            tick.setAttribute('x1', tickX);
            tick.setAttribute('y1', 0);
            tick.setAttribute('x2', tickX);
            tick.setAttribute('y2', 5);
            tick.setAttribute('class', 'axis-tick');
            xAxis.appendChild(tick);
            
            // Skip some labels on smaller screens
            if (width < 500 && i % 20 !== 0 && i !== 0) continue;
            
            // Tick label
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', tickX);
            label.setAttribute('y', 20);
            label.setAttribute('class', 'axis-label');
            label.setAttribute('text-anchor', 'middle');
            label.textContent = i;
            xAxis.appendChild(label);
        }
        
        // X axis label
        const xLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        xLabel.setAttribute('x', innerWidth / 2);
        xLabel.setAttribute('y', 50);
        xLabel.setAttribute('class', 'x-axis-title');
        xLabel.setAttribute('text-anchor', 'middle');
        xLabel.textContent = 'Age';
        xAxis.appendChild(xLabel);
        
        g.appendChild(xAxis);
        
        // Create a tooltip div that will be shared by all lollipops
        // This is a more efficient approach than creating tooltips for each item
        const tooltipDiv = document.createElement('div');
        tooltipDiv.className = 'tooltip';
        tooltipDiv.style.opacity = '0';
        tooltipDiv.style.position = 'absolute';
        tooltipDiv.style.pointerEvents = 'none';
        tooltipDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        tooltipDiv.style.color = 'white';
        tooltipDiv.style.padding = '5px';
        tooltipDiv.style.borderRadius = '4px';
        tooltipDiv.style.fontSize = '14px';
        tooltipDiv.style.zIndex = '1000';
        document.body.appendChild(tooltipDiv);
        
        // Create lollipops for each country
        displayData.forEach((d, i) => {
            const yPos = i * yScale + yScale / 2;
            
            // Lollipop stick (line representing the age range)
            const stick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            stick.setAttribute('x1', d.minAge * xScale);
            stick.setAttribute('y1', yPos);
            stick.setAttribute('x2', d.maxAge * xScale);
            stick.setAttribute('y2', yPos);
            stick.setAttribute('class', 'lollipop-stick');
            g.appendChild(stick);
            
            // Create a group for the lollipop circle and count display
            const circleGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            circleGroup.setAttribute('class', 'lollipop-group');
            
            // Set data attributes directly on the group element for hover events
            circleGroup.setAttribute('data-country', d.country);
            circleGroup.setAttribute('data-avg-age', d.avgAge);
            circleGroup.setAttribute('data-min-age', d.minAge);
            circleGroup.setAttribute('data-max-age', d.maxAge);
            circleGroup.setAttribute('data-count', d.count);
            
            g.appendChild(circleGroup);
            
            // Calculate circle size based on count and available space
            const baseSize = width < 500 ? 3 : 5;
            const maxSize = width < 500 ? 7 : 10;
            const circleSize = Math.min(maxSize, Math.max(baseSize, d.count * (width < 500 ? 0.75 : 1.5)));
            
            // Average age marker (the lollipop circle)
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', d.avgAge * xScale);
            circle.setAttribute('cy', yPos);
            circle.setAttribute('r', circleSize);
            circle.setAttribute('class', 'lollipop-circle');
            
            // *** NEW CODE: Check if the lollipop is within tapir lifespan range ***
            if (d.avgAge >= tapirMinAge && d.avgAge <= tapirMaxAge) {
                circle.setAttribute('fill', 'rgba(75, 192, 192, 1)'); // Highlight circles in range
                circle.setAttribute('stroke', 'rgba(75, 192, 192, 0.8)');
                circle.setAttribute('stroke-width', '2');
            }
            // *** END NEW CODE ***
            
            // Add the circle to the group
            circleGroup.appendChild(circle);
            
            // Create count display text that will be shown on hover
            const countText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            countText.setAttribute('x', d.avgAge * xScale);
            countText.setAttribute('y', yPos - circleSize - 5); // Position above the circle
            countText.setAttribute('text-anchor', 'middle');
            countText.setAttribute('class', 'count-text');
            countText.style.opacity = '0'; // Hidden by default
            countText.textContent = d.count;
            
            // Adjust font size for smaller screens
            if (width < 500) {
                countText.setAttribute('font-size', '14px');
            }
            
            // Create count background for better visibility
            const countBackground = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            const textWidth = String(d.count).length * (width < 500 ? 6 : 8) + 6; // Estimate text width
            const textHeight = width < 500 ? 12 : 16; // Estimate text height
            
            countBackground.setAttribute('x', d.avgAge * xScale - textWidth/2);
            countBackground.setAttribute('y', yPos - circleSize - 5 - textHeight/2);
            countBackground.setAttribute('width', textWidth);
            countBackground.setAttribute('height', textHeight);
            countBackground.setAttribute('rx', 3); // Rounded corners
            countBackground.setAttribute('class', 'count-background');
            countBackground.style.opacity = '0'; // Hidden by default
            
            // Insert background before text so text appears on top
            circleGroup.appendChild(countBackground);
            circleGroup.appendChild(countText);
            
            // Country label
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', -10);
            label.setAttribute('y', yPos);
            label.setAttribute('class', 'country-label');
            label.setAttribute('text-anchor', 'end');
            label.setAttribute('dominant-baseline', 'middle');
            label.textContent = d.country;
            
            // *** NEW CODE: Highlight countries in tapir range ***
            if (d.avgAge >= tapirMinAge && d.avgAge <= tapirMaxAge) {
                label.setAttribute('fill', 'rgba(75, 192, 192, 1)');
            }
            // *** END NEW CODE ***
            
            // Adjust font size for smaller screens
            if (width < 500) {
                label.setAttribute('font-size', '12px');
            }
            
            g.appendChild(label);
            
            // Age range label
            const rangeLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            rangeLabel.setAttribute('x', d.maxAge * xScale + 10);
            rangeLabel.setAttribute('y', yPos);
            rangeLabel.setAttribute('class', 'range-label');
            rangeLabel.setAttribute('dominant-baseline', 'middle');
            
            // For smaller screens, show simplified label
            if (width < 600) {
                rangeLabel.textContent = `avg: ${d.avgAge}`;
            } else if (width < 800) {
                rangeLabel.textContent = `${d.minAge}-${d.maxAge}`;
            } else {
                rangeLabel.textContent = `${d.minAge}-${d.maxAge} Years (avg: ${d.avgAge})`;
            }
            
            // *** NEW CODE: Highlight range labels in tapir range ***
            if (d.avgAge >= tapirMinAge && d.avgAge <= tapirMaxAge) {
                rangeLabel.setAttribute('fill', 'rgba(75, 192, 192, 1)');
            }
            // *** END NEW CODE ***
            
            // Adjust font size for smaller screens
            if (width < 500) {
                rangeLabel.setAttribute('font-size', '10px');
            }
            
            g.appendChild(rangeLabel);
            
            // Add hover events to the entire circle group for better interaction
            circleGroup.addEventListener('mouseenter', function(e) {
                // Show count text and background
                countText.style.opacity = '1';
                countBackground.style.opacity = '0.8';
                
                // Show tooltip with country data
                const country = this.getAttribute('data-country');
                const avgAge = this.getAttribute('data-avg-age');
                const minAge = this.getAttribute('data-min-age');
                const maxAge = this.getAttribute('data-max-age');
                const count = this.getAttribute('data-count');
                
                // Position tooltip near the cursor but not directly under it
                const svgRect = svg.getBoundingClientRect();
                const tooltipX = e.clientX + 15;
                const tooltipY = e.clientY - 15;
                
                tooltipDiv.innerHTML = `${country}: Avg Age ${avgAge}, Range ${minAge}-${maxAge}, Count: ${count}`;
                tooltipDiv.style.left = `${tooltipX}px`;
                tooltipDiv.style.top = `${tooltipY}px`;
                tooltipDiv.style.opacity = '1';
                
                // Highlight the circle
                circle.classList.add('active');
            });
            
            circleGroup.addEventListener('mousemove', function(e) {
                // Update tooltip position as mouse moves
                const tooltipX = e.clientX + 15;
                const tooltipY = e.clientY - 15;
                tooltipDiv.style.left = `${tooltipX}px`;
                tooltipDiv.style.top = `${tooltipY}px`;
            });
            
            circleGroup.addEventListener('mouseleave', function() {
                // Hide count text and background
                countText.style.opacity = '0';
                countBackground.style.opacity = '0';
                
                // Hide tooltip
                tooltipDiv.style.opacity = '0';
                
                // Remove highlight from circle
                circle.classList.remove('active');
            });
        });
        
        // Add last updated text directly to the SVG at the bottom of x-axis
        const now = new Date();
        const formattedDate = now.toLocaleDateString();
        const formattedTime = now.toLocaleTimeString();
        
        // Create last updated text
        const lastUpdatedText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        lastUpdatedText.setAttribute('class', 'last-updated-text');
        lastUpdatedText.setAttribute('text-anchor', 'end');
        
        // Adjust position based on screen size
        lastUpdatedText.setAttribute('x', innerWidth);
        lastUpdatedText.setAttribute('y', actualInnerHeight + 70); // Position below x-axis label
        
        // Adjust font size based on screen size
        if (width < 500) {
            lastUpdatedText.setAttribute('font-size', '10px');
        } else if (width < 800) {
            lastUpdatedText.setAttribute('font-size', '11px');
        } else {
            lastUpdatedText.setAttribute('font-size', '12px');
        }
        
        //lastUpdatedText.style.fontStyle = 'italic';
        lastUpdatedText.style.fill = '#fff1f17f';
        lastUpdatedText.textContent = `Last updated: ${formattedDate}, ${formattedTime}`;
        
        // Add the last updated text to the chart group
        g.appendChild(lastUpdatedText);
        
        console.log("Chart SVG created successfully");
        return svg;
    }
    
    // Main function to generate the chart
    async function generateAgeLollipopChart(containerId) {
        console.log("Starting chart generation for container:", containerId);
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container with ID "${containerId}" not found.`);
            return;
        }
        
        // Get the current container width
        const containerWidth = container.clientWidth;
        console.log("Container width:", containerWidth);
        
        // Show loading message
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading-indicator';
        loadingDiv.innerHTML = 'Loading data...';
        
        // Only replace content if there's no loading indicator already
        if (!container.querySelector('.loading-indicator')) {
            container.innerHTML = '';
            container.appendChild(loadingDiv);
        }
        
        try {
            // Fetch and process data
            const data = await fetchSpreadsheetData();
            if (!data || data.length === 0) {
                console.warn("No data returned from fetchSpreadsheetData");
                container.innerHTML = 'No data available or error fetching data.';
                return;
            }
            
            const chartData = processDataForLollipopChart(data);
            
            // Create and append the chart with current container width
            const chartSvg = createLollipopChart(chartData, containerWidth);
            
            // Clear the container and add the chart
            container.innerHTML = '';
            container.appendChild(chartSvg);
            
            // Clean up any existing tooltips on chart refresh
            const oldTooltips = document.querySelectorAll('.tooltip');
            oldTooltips.forEach(tooltip => {
                if (tooltip.parentNode) {
                    tooltip.parentNode.removeChild(tooltip);
                }
            });
            
            console.log("Chart generation complete");
            return true; // Indicate successful chart generation
            
        } catch (error) {
            console.error('Error generating chart:', error);
            container.innerHTML = 'Error generating chart. Please check console for details.';
            return false;
        }
    }
})