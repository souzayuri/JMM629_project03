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
        if (chartContainer && isElementVisible(chartContainer) && 
            !chartContainer.hasAttribute('data-chart-rendered')) {
            console.log("Chart container is now visible after resize, rendering chart");
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
    
    // Create the lollipop chart SVG
    function createLollipopChart(chartData) {
        // Check if there's data to display
        if (!chartData || chartData.length === 0) {
            console.warn("No chart data available");
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('width', 800);
            svg.setAttribute('height', 600);
            
            const noDataText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            noDataText.setAttribute('x', 400);
            noDataText.setAttribute('y', 300);
            noDataText.setAttribute('class', 'no-data-text');
            noDataText.setAttribute('text-anchor', 'middle');
            noDataText.textContent = 'No data available yet. Submit the form to see results!';
            svg.appendChild(noDataText);
            
            return svg;
        }
        
        console.log("Creating chart with data:", chartData);
        
        // SVG dimensions and margins
        const width = 800;
        const height = 600;
        const margin = { top: 40, right: 120, bottom: 60, left: 150 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;
        
        // Only take top 15 countries if there are many
        const displayData = chartData.slice(0, 15);
        console.log("Displaying top countries:", displayData.length);
        
        // SVG container
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        svg.style.display = 'block'; // Ensure the SVG is displayed as block
        svg.style.margin = '0 auto'; // Center the SVG
        
        // Define scales
        const xMax = Math.max(...displayData.map(d => d.maxAge), 100);
        const xScale = innerWidth / xMax;
        
        const yScale = innerHeight / displayData.length;
        
        // Chart title removed as requested
        
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
        xAxisLine.setAttribute('class', 'axis-line');
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
            tick.setAttribute('class', 'axis-tick');
            xAxis.appendChild(tick);
            
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
            g.appendChild(circleGroup);
            
            // Average age marker (the lollipop circle)
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', d.avgAge * xScale);
            circle.setAttribute('cy', yPos);
            circle.setAttribute('r', Math.min(10, Math.max(5, d.count * 1.5))); // Size based on count, with limits
            circle.setAttribute('class', 'lollipop-circle');
            circle.setAttribute('data-count', d.count);
            
            // Tooltip on hover - keep existing tooltip data
            circle.setAttribute('data-tooltip', `${d.country}: Avg Age ${d.avgAge}, Range ${d.minAge}-${d.maxAge}, Count: ${d.count}`);
            circleGroup.appendChild(circle);
            
            // Create count display text that will be shown on hover
            const countText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            countText.setAttribute('x', d.avgAge * xScale);
            countText.setAttribute('y', yPos - 15); // Position above the circle
            countText.setAttribute('text-anchor', 'middle');
            countText.setAttribute('class', 'count-text');
            countText.style.opacity = '0'; // Hidden by default
            countText.textContent = d.count;
            
            // Create count background for better visibility
            const countBackground = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            const textWidth = String(d.count).length * 8 + 6; // Estimate text width
            const textHeight = 16; // Estimate text height
            
            countBackground.setAttribute('x', d.avgAge * xScale - textWidth/2);
            countBackground.setAttribute('y', yPos - 15 - textHeight/2);
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
            g.appendChild(label);
            
            // Age range label
            const rangeLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            rangeLabel.setAttribute('x', d.maxAge * xScale + 10);
            rangeLabel.setAttribute('y', yPos);
            rangeLabel.setAttribute('class', 'range-label');
            rangeLabel.setAttribute('dominant-baseline', 'middle');
            rangeLabel.textContent = `${d.minAge}-${d.maxAge} (avg: ${d.avgAge})`;
            g.appendChild(rangeLabel);
            
            // Add hover events to show/hide count
            circleGroup.addEventListener('mouseenter', function() {
                countText.style.opacity = '1';
                countBackground.style.opacity = '0.8';
            });
            
            circleGroup.addEventListener('mouseleave', function() {
                countText.style.opacity = '0';
                countBackground.style.opacity = '0';
            });
        });
        
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
            
            // Create and append the chart
            const chartSvg = createLollipopChart(chartData);
            
            // Clear the container and add the chart
            container.innerHTML = '';
            container.appendChild(chartSvg);
            
            // No need to add CSS since you already have it in your stylesheet
            console.log("Using existing CSS stylesheet for chart styling");
            
            // Add simple tooltip functionality
            document.querySelectorAll('[data-tooltip]').forEach(element => {
                element.addEventListener('mouseover', function(e) {
                    const tooltip = document.createElement('div');
                    tooltip.className = 'tooltip';
                    tooltip.textContent = this.getAttribute('data-tooltip');
                    tooltip.style.left = `${e.pageX + 10}px`;
                    tooltip.style.top = `${e.pageY + 10}px`;
                    document.body.appendChild(tooltip);
                    
                    this.addEventListener('mousemove', function(e) {
                        tooltip.style.left = `${e.pageX + 10}px`;
                        tooltip.style.top = `${e.pageY + 10}px`;
                    });
                    
                    this.addEventListener('mouseout', function() {
                        if (document.body.contains(tooltip)) {
                            document.body.removeChild(tooltip);
                        }
                    }, { once: true });
                });
            });
            
            // Add a small indicator to show when the chart was last updated
            const updateIndicator = document.createElement('div');
            updateIndicator.id = 'chart-update-indicator';
            updateIndicator.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
            
            container.appendChild(updateIndicator);
            
            console.log("Chart generation complete");
            return true; // Indicate successful chart generation
            
        } catch (error) {
            console.error('Error generating chart:', error);
            container.innerHTML = 'Error generating chart. Please check console for details.';
            return false;
        }
    }
});