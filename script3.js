/************************************/
/* 1. CONSTANTS AND CONFIGURATION   */
/************************************/

// Import D3.js library
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// Constants and configuration
const biomeData = {
    "atlantic-forest": { 
        name: "Atlantic Forest", 
        color: "#2E8B57",
        colorFinger: "#2e8b5799",
        index: 0,
        path: "M267.37,118.71c44.44,6.18,80.76,34.38,82.96,54.47,3.26,29.68-36.8,59.52-85.8,71.49-38.65,9.44-75.65-19.83-75.65-59.95s33.81-72.23,78.48-66.01Z",
        labelX: 258,
        labelY: 185
    },
    "pantanal": { 
        name: "Pantanal", 
        color: "#806D43",
        colorFinger: "#806d4399",
        index: 1,
        path: "M171.67,244.19c41.58,7.99,70.07,33.91,70.07,63.04s-18.78,32.78-61.93,28.44c-50.07-5.04-80.63-12.3-80.63-41.43s29.9-58.24,72.48-50.06Z",
        labelX: 170,
        labelY: 270
    },
    "cerrado": { 
        name: "Cerrado", 
        color: "#CD853F",
        colorFinger: "#cd853f99",
        index: 2,
        path: "M203.52,17.6c47.21-8.65,72.3-10.58,72.3,20.97s-28.17,68.47-75.56,74.51c-49.78,6.35-88.59-25.66-83.3-56.52,3.24-18.85,41.35-30.68,86.56-38.96Z",
        labelX: 200,
        labelY: 90
    }
};

const biomeIds = Object.keys(biomeData);
const biomeElements = {};


// Establish a centralized event system to handle synchronization
const TapirEventSystem = {
    // Store the current selection state
    currentSelection: {
        "atlantic-forest": { type: "none", value: "none" },
        "pantanal": { type: "none", value: "none" },
        "cerrado": { type: "none", value: "none" }
    },
    
    // Event listeners
    listeners: [],
    
    // Add a listener function
    addListener: function(callback) {
        this.listeners.push(callback);
    },
    
    // Update selection and notify all listeners
    updateSelection: function(biomeId, type, value) {
        this.currentSelection[biomeId] = { type, value };
        this.notifyListeners(biomeId, type, value);
    },
    
    // Notify all registered listeners about selection changes
    notifyListeners: function(biomeId, type, value) {
        this.listeners.forEach(listener => {
            listener(biomeId, type, value, this.currentSelection);
        });
    }
};


/************************************/
/* 2. D3 VISUALIZATION CODE         */
/************************************/


// Main container setup
const container = d3.select("#chart-container");
const fingerLabels = {};

// Create SVG structure for tapir selector
const selectorContainer = container.append("div").attr("class", "tapir-selector-container");
const selectorSvg = selectorContainer.append("svg")
    .attr("viewBox", "50 45 330 270")
    .attr("width", "100%")
    .attr("height", "100%");

// Create shadow filter
const defs = selectorSvg.append("defs");
defs.append("filter")
    .attr("id", "shadow")
    .attr("x", "-20%")
    .attr("y", "-20%")
    .attr("width", "140%")
    .attr("height", "140%")
    .append("feDropShadow")
    .attr("dx", "4")
    .attr("dy", "4")
    .attr("stdDeviation", "4")
    .attr("flood-color", "rgba(0, 0, 0, 0.1)");


/************************************/
/* TUTORIAL GUIDANCE SYSTEM         */
/************************************/

// Create tutorial elements
const tutorialContainer = container.append("div").attr("class", "tutorial-container");

// Add initial Start Tutorial button
tutorialContainer.append("button")
    .attr("class", "restart-btn")
    .text("Start Tutorial")
    .style("opacity", "1")
    .on("click", function() {
        // Remove this button when clicked
        d3.select(this).remove();
        // Start the tutorial
        startTutorial();
    });

// Get random name from the document if possible
function getRandomTapirName() {
    // First try to use the random-name element if it exists
    const randomNameElement = document.getElementById('random-name');
    if (randomNameElement && randomNameElement.textContent) {
        return randomNameElement.textContent;
    }
    
    // If we can't find the element, return a default name
    return "Esperta";
}

// Define text boxes but don't add them to the document yet
const textBoxes = [
    {
        id: "box-1",
        text: "Each of my toes represents<br>a biome allowing you<br>to select a tapir.<br>Let's use myself as an example.",
        position: { top: "5vh", left: "20vw" }
    },
    {
        id: "box-2",
        text: "You'll see<br>the tapir's track on the map.<br>If you click on the line,<br>it'll display some information<br>about the tapir",
        position: { top: "5vh", left: "60vw" }
    },
    {
        id: "box-3",
        text: "You'll also be able to<br>visualize the total distance<br> walked for each hour throughout the day over the sampled time.",
        position: { bottom: "12vh", left: "23vw" }
    },
    {
        id: "box-4",
        text: "You can also switch<br>the map mode to a satellite view<br>by clicking on the satellite button <span class='icon-example'>🛰️</span><br>or return to the default view.<br>Use the home button <span class='icon-example'>⌂</span> to reset the map view.",
        position: { top: "20vh", left: "80vw" }
    }
];

// Function to start the tutorial
function startTutorial() {
    // Get the random name right when the tutorial starts
    const randomTapirName = getRandomTapirName();
    
    // Update the first text box with the random name
    textBoxes[0].text = `Each of my toes represents<br>a biome allowing you<br>to select a tapir.<br>Let's select myself as an example: ${randomTapirName}.`;
    
    // Create text boxes now that tutorial is starting
    textBoxes.forEach((box, index) => {
        const textBox = tutorialContainer.append("div")
            .attr("class", `text-box ${box.id}`)
            .attr("id", box.id)
            .style("opacity", "0")
            .style("transform", "translateY(20px)")
            .html(box.text);
        
        // Apply positioning
        Object.entries(box.position).forEach(([key, value]) => {
            textBox.style(key, value);
        });
        
        // Add sequential animation timing
        setTimeout(() => {
            textBox.style("opacity", "1")
                .style("transform", "translateY(0)");
        }, 500 + (index * 500)); // Stagger the animations
    });
    
    // Add exit button
    const exitButton = tutorialContainer.append("button")
        .attr("class", "restart-btn")
        .text("Exit Tutorial")
        .style("opacity", "0");
        
    exitButton.on("click", function() {
        // Hide and remove all text boxes
        tutorialContainer.selectAll(".text-box")
            .style("opacity", "0")
            .style("transform", "translateY(20px)")
            .remove();
        
        // Remove exit button
        d3.select(this).remove();
        
        // Reset any selections
        biomeIds.forEach(id => {
            const dropdown = biomeElements[id].dropdown;
            dropdown.property("value", "none");
            const fingerElement = biomeElements[id].finger;
            fingerElement.attr("fill", "#d1d1d1");
            fingerLabels[id].text(biomeData[id].name);
            TapirEventSystem.updateSelection(id, "none", "none");
        });
        
        // Update the visualization
        updatePlot();
        
        // Reset map view to original position
        if (typeof map !== 'undefined') {
            map.flyTo({
                center: [-54.2, -21.5],
                zoom: 7.5,
                bearing: 0,
                pitch: 60,
                duration: 1500
            });
            
            // Also reset any highlights on the map
            if (typeof resetHighlights === 'function') {
                resetHighlights();
            }
        }
        
        // Show a new "Start Tutorial" button
        tutorialContainer.append("button")
            .attr("class", "restart-btn")
            .text("Start Tutorial")
            .style("opacity", "1")
            .on("click", function() {
                d3.select(this).remove(); // Remove this button
                startTutorial(); // Start the tutorial
            });
    });
    
    // Show exit button after all boxes are shown
    setTimeout(() => {
        exitButton.style("opacity", "1");
    }, 500 + (textBoxes.length * 500));
    
    // Auto-select the random tapir as part of the tutorial
    // We need to wait for the data to be loaded first
    const checkDataInterval = setInterval(() => {
        if (csvDataLoaded) {
            clearInterval(checkDataInterval);
            
            // Try to find and select the random tapir
            let tapirFound = false;
            
            biomeIds.forEach(id => {
                const dropdown = biomeElements[id].dropdown;
                const options = Array.from(dropdown.node().options);
                
                const tapirOption = options.find(option => 
                    option.text.toLowerCase().includes(randomTapirName.toLowerCase())
                );
                
                if (tapirOption && !tapirFound) {
                    tapirFound = true;
                    // Set the dropdown value to the selected tapir
                    dropdown.property("value", tapirOption.value);
                    // Update finger appearance
                    const fingerElement = biomeElements[id].finger;
                    fingerElement.attr("fill", biomeData[id].colorFinger);
                    // Update label text
                    fingerLabels[id].text(tapirOption.text);
                    // Update event system
                    TapirEventSystem.updateSelection(id, "individual", tapirOption.value);
                    // Update the visualization
                    updatePlot();
                }
            });
            
            // If random tapir not found, pick the first available one
            if (!tapirFound) {
                console.warn(`Could not find tapir named: ${randomTapirName}`);
                
                // Get a random biome ID
                const randomBiomeIndex = Math.floor(Math.random() * biomeIds.length);
                const randomBiomeId = biomeIds[randomBiomeIndex];
                
                const dropdown = biomeElements[randomBiomeId].dropdown;
                const options = Array.from(dropdown.node().options);
                
                // Skip "None" and "All" options (first two)
                if (options.length > 2) {
                    // Get a random individual option (excluding None and All)
                    const randomOptionIndex = 2 + Math.floor(Math.random() * (options.length - 2));
                    const randomOption = options[randomOptionIndex];
                    
                    // Set the dropdown value
                    dropdown.property("value", randomOption.value);
                    // Update finger appearance
                    const fingerElement = biomeElements[randomBiomeId].finger;
                    fingerElement.attr("fill", biomeData[randomBiomeId].colorFinger);
                    // Update label text
                    fingerLabels[randomBiomeId].text(randomOption.text);
                    // Update event system
                    TapirEventSystem.updateSelection(randomBiomeId, "individual", randomOption.value);
                    // Update the visualization
                    updatePlot();
                }
            }
        }
    }, 500);
}

// Add CSS for tutorial elements
const tutorialStyle = document.createElement('style');
tutorialStyle.innerHTML = `
.tutorial-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1000;
}


.text-box {
    position: absolute;
    background-color: rgba(162, 152, 179, 0.9);
    color: #fff;
    padding: 10px;
    border-radius: 5px;
    min-width: 250px;
    min-height: 50px;
    border: 1px solid #ccc;
    font-size: 20px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    transition: opacity 0.5s ease, transform 0.5s ease;
    pointer-events: none;
    line-height: 1.4;
    font-family: "Caveat Brush", cursive;
}

.restart-btn {
    position: absolute;
    top: -5vh;
    left: 50vw;
    padding: 10px 15px;
    background-color:rgba(162, 152, 179, 0.9);
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 25px;
    pointer-events: auto;
    transition: opacity 0.5s ease;
    z-index: 1001;
    font-family: "Caveat Brush", cursive;
    animation: pulse 1.5s infinite;
    box-shadow: 0 0 0 rgba(133, 114, 98, 0.4);
}

@keyframes pulse {
    0% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(133, 114, 98, 0.7);
    }
    
    70% {
        transform: scale(1.05);
        box-shadow: 0 0 0 10px rgba(133, 114, 98, 0);
    }
    
    100% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(133, 114, 98, 0);
    }
}

/* Mobile styles */
@media screen and (max-width: 767px) {
    .text-box {
        position: static !important;
        margin: 10px auto !important;
        width: 90% !important;
        max-width: 400px !important;
        transform: none !important;
        display: block !important;
        font-size: 14px !important;
        min-height: auto !important;
    }
    
    .box-1, .box-2, .box-3, .box-4 {
        left: auto !important;
        right: auto !important;
        top: auto !important;
        bottom: auto !important;
        transform: none !important;
    }
    
    .restart-btn {
        bottom: 20px;
        top: auto;
    }
}
`;
document.head.appendChild(tutorialStyle);

/************************************/
// TAPIR PAWS SELECTOR
/************************************/

// Create tapir structure
const tapirGroup = selectorSvg.append("g").attr("transform", "scale(0.8) translate(50, 50)");

// Main body with message
tapirGroup.append("path")
    .attr("d", "M92.6,299.04c1.27.22,2.42-.8,2.4-2.09-.07-5.69-.08-7.62.17-10.11,2.44-24.69,18.69-50.57,62.06-50.57,1.97,0,5.82.2,12.59,1.84,2.17.52,4.37.93,6.59,1.19s4.46.46,6.61.56c8.2.38,13.71-8.3,9.91-15.57-15.45-29.5-14.5-34.24-14.95-42.79-.41-7.75,1.87-19.66,14.85-38.95,5.84-8.68.66-20.5-9.7-21.94-3.75-.52-8.77-1.08-15.83-1.9-10.62-1.23-26.19-7.66-34.41-14.49-11.7-9.73-19.12-21.13-23.48-35.47-.94-3.11-2.74-3.85-4.61-3.89-6.09-.11-22.33,4.94-27.44,7.52C35.11,93.71,1.56,131.04.52,182.47c-1.3,64.57,56.07,101.49,79.56,111.35.12.05.23.1.35.17,1.19.63,8.3,4.38,12.16,5.05Z")
    .attr("class", "tapir-body")
    .attr("filter", "url(#shadow)");

// Add message text to main body
tapirGroup.append("text")
    .attr("x", 90)
    .attr("y", 180)
    .attr("class", "tapir-message")
    .append("tspan")
    .text("Pick up a tapir:")
    .attr("x", 87)
    .attr("dy", 0)
    .append("tspan")
    .text("Select a toe")
    .attr("x", 95)
    .attr("dy", "1.2em");

// Create each finger and store references
biomeIds.forEach(id => {
    const data = biomeData[id];
    
    // Create finger element
    const finger = tapirGroup.append("path")
        .attr("d", data.path)
        .attr("class", `tapir-finger ${id}-finger`)
        .attr("fill", "#d1d1d1")
        .attr("filter", "url(#shadow)")
        .on("click", event => {
            event.stopPropagation();
            openBiomeSelector(id);
        });
    
    // Store in biomeElements for later reference
    biomeElements[id] = {
        finger: finger,
        dropdown: null
    };
    
    // Add label
    const labelContainer = selectorSvg.append("g")
        .attr("class", "tapir-finger-label")
        .attr("data-biome", id)
        .on("click", event => {
            event.stopPropagation();
            openBiomeSelector(id);
        });
    
    // Add text element
    const textElement = labelContainer.append("text")
        .attr("x", data.labelX)
        .attr("y", data.labelY)
        .attr("class", "finger-label-text")
        .text(data.name);
    
    // Store label reference
    fingerLabels[id] = textElement;
});

// Create hidden dropdowns and modal
const dropdownsContainer = container.append("div").attr("class", "hidden-dropdowns");
const modalContainer = container.append("div").attr("class", "biome-modal");
const modalTitle = modalContainer.append("h3").attr("class", "modal-title");
const selectionList = modalContainer.append("div").attr("class", "selection-list");

// Create dropdowns for each biome
biomeIds.forEach(id => {
    const dropdown = dropdownsContainer.append("div")
        .attr("class", "dropdown-container")
        .append("select")
        .attr("id", `${id}-select`);
    
    // Store dropdown reference
    biomeElements[id].dropdown = dropdown;
});

// Function to open biome selector
function openBiomeSelector(biomeId) {
    const biomeName = biomeData[biomeId].name;
    const dropdown = biomeElements[biomeId].dropdown;
    const fingerElement = biomeElements[biomeId].finger;
    
    // Check if modal is already open for this biome
    if (modalContainer.style("display") === "block" && 
        modalContainer.attr("data-current-biome") === biomeId) {
        closeModal();
        return;
    }
    
    // Set modal title and current biome
    modalTitle.text(biomeName);
    modalContainer.attr("data-current-biome", biomeId);
    
    // Clear previous options
    selectionList.html("");
    
    // Create standard options
    ["None", "All"].forEach(option => {
        const value = option.toLowerCase();
        selectionList.append("div")
            .attr("class", "selection-option")
            .classed("selected", dropdown.property("value") === value)
            .text(option)
            .on("click", event => {
                event.stopPropagation();
                dropdown.property("value", value);
                fingerElement.attr("fill", value === "none" ? "#d1d1d1" : biomeData[biomeId].colorFinger);
                fingerLabels[biomeId].text(biomeName);
                closeModal();
                
                // Notify event system about the selection change
                TapirEventSystem.updateSelection(biomeId, option.toLowerCase(), option.toLowerCase());
                
                // Dispatch change event for the internal visualization update
                dropdown.dispatch("change");
            });
    });
    
    // Get options from dropdown - skip None and All
    const options = Array.from(dropdown.node().options).slice(2);
    
    // Add individual options
    options.forEach(option => {
        selectionList.append("div")
            .attr("class", "selection-option")
            .classed("selected", dropdown.property("value") === option.value)
            .text(option.text)
            .on("click", event => {
                event.stopPropagation();
                dropdown.property("value", option.value);
                fingerElement.attr("fill", biomeData[biomeId].colorFinger);
                fingerLabels[biomeId].text(option.text);
                closeModal();
                
                // Notify event system about the selection change
                TapirEventSystem.updateSelection(biomeId, "individual", option.value);
                
                // Dispatch change event for the internal visualization update
                dropdown.dispatch("change");
            });
    });
    
    // Show modal
    modalContainer.style("display", "block");
}

// Function to close modal
function closeModal() {
    modalContainer.style("display", "none");
}

// Create main chart container and SVG
const chartDiv = container.append("div").attr("id", "main-chart");
const svg = chartDiv.append("svg")
    .attr("width", 400)
    .attr("height", 400);

// Define variables that will be needed outside the CSV loading scope
let tapirs = [];
let groupedTapirs;
let biomeGroups = {};

// Update plot function - moved outside the d3.csv callback
// Update plot function
function updatePlot() {
    svg.selectAll("*").remove();
    
    // Collect selected data
    const selectedData = [];
    
    biomeIds.forEach(id => {
        const biomeName = biomeData[id].name;
        const dropdown = biomeElements[id].dropdown;
        const selection = dropdown.property("value");
        const fingerElement = biomeElements[id].finger;
        
        // Update finger color
        fingerElement.attr("fill", selection !== "none" ? 
            biomeData[id].colorFinger : "#d1d1d1");
        
        // Update label text
        fingerLabels[id].text(selection === "none" || selection === "all" ? 
            biomeName : selection);
        
        // Add to selected data
        if (selection === "all") {
            biomeGroups[biomeName].forEach(([individual, data]) => {
                selectedData.push({
                    individual,
                    biome: biomeName,
                    data: data.sort((a, b) => a.hour - b.hour)
                });
            });
        } else if (selection !== "none") {
            const data = groupedTapirs.get(selection);
            selectedData.push({
                individual: selection,
                biome: biomeName,
                data: data.sort((a, b) => a.hour - b.hour)
            });
        }
        
        // Update the event system's current selection (without triggering more events)
        TapirEventSystem.currentSelection[id] = {
            type: selection === "none" ? "none" : (selection === "all" ? "all" : "individual"),
            value: selection
        };
    });
    
    // Draw visualization
    if (selectedData.length === 0) {
        drawEmptyClockStructure();
    } else {
        drawMultiCircularLinePlot(selectedData);
    }
}

// Load dataset
d3.csv('data/results_distance_join.csv', d3.autoType)
    .then(data => {
        // Store data in the global variable
        tapirs = data;
        
        // Ensure numeric values
        tapirs.forEach(d => {
            d.hour = +d.hour;
            d.count = +d.distance_per_point_meters;
        });

        // Group data by individual_name (make sure this is the correct field)
        groupedTapirs = d3.group(tapirs, d => d.individual_name);
        
        // Initialize biomeGroups for each biome
        Object.values(biomeData).forEach(data => biomeGroups[data.name] = []);
        
        // Add some debugging
        console.log("Initialized biomeGroups:", biomeGroups);
        console.log("Grouped tapirs entries:", Array.from(groupedTapirs.entries()).slice(0, 3));
        
        // Group by biome
        Array.from(groupedTapirs.entries()).forEach(([individual, data]) => {
            // Check if data is valid
            if (!data || data.length === 0) {
                console.warn(`No data for individual: ${individual}`);
                return;
            }
            
            const biome = data[0].Biome;
            console.log(`Individual: ${individual}, Biome: ${biome}`);
            
            // Check if this biome exists in our biomeGroups
            if (biomeGroups[biome]) {
                biomeGroups[biome].push([individual, data]);
            } else {
                console.warn(`Unknown biome: ${biome}. Available biomes:`, Object.keys(biomeGroups));
            }
        });
        
        console.log("Final biomeGroups:", biomeGroups);

        // Populate dropdowns
        biomeIds.forEach(id => {
            const dropdown = biomeElements[id].dropdown;
            const biomeName = biomeData[id].name;
            
            // Add None and All options
            dropdown.append("option").attr("value", "none").text("None");
            dropdown.append("option").attr("value", "all").text("All");
            
            // Safely handle biomeGroups entry
            if (!biomeGroups[biomeName] || !Array.isArray(biomeGroups[biomeName])) {
                console.warn(`No valid data for biome: ${biomeName}`);
                biomeGroups[biomeName] = [];
            }
            
            // Get individuals for this biome safely
            const biomeIndividuals = biomeGroups[biomeName] || [];
            console.log(`Biome ${biomeName} has ${biomeIndividuals.length} individuals`);
            
            // Add individuals sorted alphabetically
            const sortedIndividuals = [...biomeIndividuals].sort((a, b) => 
                a[0].localeCompare(b[0])
            );
            
            sortedIndividuals.forEach(([individual, _]) => {
                dropdown.append("option")
                    .attr("value", individual)
                    .text(individual);
            });
            
            // Add change listener
            dropdown.on("change", function() {
                const value = dropdown.property("value");
                const type = value === "none" ? "none" : (value === "all" ? "all" : "individual");
                
                // Update event system when dropdown changes directly
                TapirEventSystem.updateSelection(id, type, value);
                
                // Let the regular update happen
                updatePlot();
            });
        });
        
        // Initialize synchronization after data is loaded
        initSynchronization();
        
        // Initial plot
        updatePlot();
    })
    .catch(error => console.error("Error loading CSV:", error));

// Function to draw circular line plot
function drawMultiCircularLinePlot(selectedData) {
    const width = 400, height = 400;
    const radius = Math.min(width, height) / 2 - 60;
    
    // Create centered group
    const g = svg.append("g").attr("transform", `translate(${width / 2}, ${height / 2})`);
    
    // Set up scales
    const angleScale = d3.scaleLinear().domain([0, 24]).range([0, 2 * Math.PI]);
    const adjustedAngle = hour => angleScale(hour) - Math.PI/2;
    
    // Find maximum count
    const maxCount = d3.max(selectedData, item => d3.max(item.data, d => d.count));
    const radiusScale = d3.scaleLinear().domain([0, maxCount]).range([0, radius]);
    
    // Draw boundary and grid
    drawClockStructure(g, radius, adjustedAngle, maxCount, radiusScale);
    
    // Draw data lines
    const lineGenerator = d3.line();
    
    selectedData.forEach(item => {
        const biomeId = Object.keys(biomeData).find(id => biomeData[id].name === item.biome);
        const fillColor = biomeData[biomeId].color;
        const safeId = item.individual.replace(/\s+/g, '-');
        
        // Create line points
        const linePoints = item.data.map(d => {
            const angle = adjustedAngle(d.hour);
            const r = radiusScale(d.count);
            return [r * Math.cos(angle), r * Math.sin(angle)];
        });
        
        // Close the path
        if (linePoints.length > 0) {
            linePoints.push(linePoints[0]);
        }
        
        // Draw filled area
        g.append("path")
            .attr("class", `radar-area-${safeId}`)
            .attr("d", lineGenerator(linePoints))
            .attr("fill", fillColor)
            .attr("fill-opacity", 0.2);
        
        // Create hover detection area
        g.append("path")
            .attr("class", `radar-hover-${safeId}`)
            .attr("d", lineGenerator(linePoints))
            .attr("fill", "none")
            .attr("stroke", "transparent")
            .attr("stroke-width", 15)
            .style("pointer-events", "stroke")
            .on("mouseover", function() {
                d3.select(`.radar-line-${safeId}`).attr("stroke-width", 4);
                d3.select(".tooltip")
                    .style("visibility", "visible")
                    .html(`<strong>${item.individual}</strong><br>Biome: ${item.biome}`);
            })
            .on("mousemove", function(event) {
                // Get coordinates
                const [mouseX, mouseY] = d3.pointer(event, svg.node());
                const centerX = width / 2;
                const centerY = height / 2;
                const dx = mouseX - centerX;
                const dy = mouseY - centerY;
                
                // Convert to polar coordinates
                const angle = Math.atan2(dy, dx);
                let hour = (angle + Math.PI/2) / (2 * Math.PI) * 24;
                hour = (hour + 24) % 24;
                
                // Find closest point
                const sortedData = [...item.data].sort((a, b) => 
                    Math.abs(a.hour - hour) - Math.abs(b.hour - hour)
                );
                const closestPoint = sortedData[0];
                
                // Update tooltip
                d3.select(".tooltip")
                    .html(`<strong>${item.individual}</strong> (${item.biome})<br>` +
                         `Hour: ${Math.round(closestPoint.hour)}:00<br>` +
                         `Distance: ${closestPoint.count.toFixed(1)}`)
                    .style("top", `${event.pageY - 30}px`)
                    .style("left", `${event.pageX + 10}px`);
            })
            .on("mouseout", function() {
                d3.select(`.radar-line-${safeId}`).attr("stroke-width", 2);
                d3.select(".tooltip").style("visibility", "hidden");
            });
        
        // Draw visible line
        g.append("path")
            .attr("class", `radar-line-${safeId}`)
            .attr("d", lineGenerator(linePoints))
            .attr("fill", "none")
            .attr("stroke", fillColor)
            .attr("stroke-width", 2);
    });
    
    // Add tooltip if needed
    if (d3.select("body").select(".tooltip").empty()) {
        d3.select("body").append("div").attr("class", "tooltip");
    }
}

// Function to draw clock structure for both empty and data views
function drawClockStructure(g, radius, adjustedAngle, maxCount, radiusScale) {
    // Draw boundary circle
    g.append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", radius)
        .attr("class", "boundary-circle");
    
    // Draw grid lines
    if (maxCount && radiusScale) {
        const gridStep = maxCount / 5;
        for (let i = gridStep; i <= maxCount; i += gridStep) {
            // Draw circular grid
            g.append("circle")
                .attr("class", "circular-grid-line")
                .attr("cx", 0)
                .attr("cy", 0)
                .attr("r", radiusScale(i));
            
            // Add scale label
            g.append("text")
                .attr("class", "scale-label")
                .attr("x", 0)
                .attr("y", -radiusScale(i))
                .attr("dy", "3px")
                .text(Math.round(i));
        }
    } else {
        // Draw empty grid circles
        [0.2, 0.4, 0.6, 0.8, 1.0].forEach(step => {
            g.append("circle")
                .attr("class", "circular-grid-line")
                .attr("cx", 0)
                .attr("cy", 0)
                .attr("r", radius * step);
        });
    }
    
    // Draw radial lines
    g.selectAll(".radial-grid-line")
        .data(d3.range(0, 24, 3))
        .enter().append("line")
        .attr("class", "radial-grid-line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", d => radius * Math.cos(adjustedAngle(d)))
        .attr("y2", d => radius * Math.sin(adjustedAngle(d)));
    
    // Define time labels
    const hourToLabel = {
        0: "Midnight",
        6: "Dawn",
        12: "Noon",
        18: "Dusk"
    };
    
    // Add hour labels
    g.selectAll(".hour-label")
        .data(d3.range(0, 24, 3))
        .enter().append("text")
        .attr("class", "hour-label")
        .attr("x", d => (radius + 25) * Math.cos(adjustedAngle(d)))
        .attr("y", d => (radius + 20) * Math.sin(adjustedAngle(d)))
        .text(d => hourToLabel[d] || `${d}:00`);
}

// Function to draw empty clock structure
function drawEmptyClockStructure() {
    const width = 400, height = 400;
    const radius = Math.min(width, height) / 2 - 60;
    
    // Create centered group
    const g = svg.append("g").attr("transform", `translate(${width / 2}, ${height / 2})`);
    
    // Set up angle scale
    const angleScale = d3.scaleLinear().domain([0, 24]).range([0, 2 * Math.PI]);
    const adjustedAngle = hour => angleScale(hour) - Math.PI/2;
    
    // Draw clock structure
    drawClockStructure(g, radius, adjustedAngle);
}



/* ============================= */
/* ====== MODIFIED MAPBOX CODE ====== */
/* ============================= */


// Function to generate a unique color for each individual
const getColorForID = (id) => {
    const colors = [
        '#d93636', '#d94336', '#d95136', '#d95e36', '#d96b36', '#d97836', '#d98536',
        '#d99236', '#d9a036', '#d9ad36', '#d9ba36', '#d9c736', '#d9d436', '#d0d936',
        '#c3d936', '#b6d936', '#a8d936', '#9bd936', '#8ed936', '#81d936', '#74d936',
        '#67d936', '#59d936', '#4cd936', '#3fd936', '#36d93b', '#36d948', '#36d955',
        '#36d962', '#36d96f', '#36d97c', '#36d98a', '#36d997', '#36d9a4', '#36d9b1',
        '#36d9be', '#36d9cc', '#36d9d9', '#36ccd9', '#36bed9', '#36b1d9', '#36a4d9',
        '#3697d9', '#368ad9', '#367cd9', '#366fd9', '#3662d9', '#3655d9', '#3648d9',
        '#363bd9', '#3f36d9', '#4c36d9', '#5936d9', '#6736d9', '#7436d9', '#8136d9',
        '#8e36d9', '#9b36d9', '#a836d9', '#b636d9', '#c336d9', '#d036d9', '#d936d4',
        '#d936c7', '#d936ba', '#d936ad', '#d936a0', '#d93692', '#d93685', '#d93678',
        '#d9366b', '#d9365e', '#d93651', '#d93643'
    ];
    const hash = [...id].reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length]; // Assign color based on hash value
};


// Create a style toggle control
// Modify the StyleToggleControl class to handle preserving highlighted tracks
class StyleToggleControl {
    onAdd(map) {
        this._map = map;
        this._container = document.createElement('div');
        this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
        
        // Create satellite button
        const satelliteButton = document.createElement('button');
        satelliteButton.className = 'mapboxgl-ctrl-icon satellite-toggle';
        satelliteButton.type = 'button';
        satelliteButton.title = 'Toggle satellite view';
        satelliteButton.innerHTML = '<span class="mapboxgl-ctrl-icon">🛰️</span>';
        satelliteButton.setAttribute('aria-label', 'Toggle Satellite View');
        
        // Initial state tracking
        this._currentStyle = 'outdoors';
        
        // Toggle between styles
        satelliteButton.addEventListener('click', () => {
            this._currentStyle = this._currentStyle === 'outdoors' ? 'satellite' : 'outdoors';
            
            // Store the current camera position
            const currentCenter = this._map.getCenter();
            const currentZoom = this._map.getZoom();
            const currentBearing = this._map.getBearing();
            const currentPitch = this._map.getPitch();
            
            // Store the current highlight state
            const currentHighlightState = { 
                highlightedFeature,
                mapControllerState: JSON.parse(JSON.stringify(MapController.highlightedTracks))
            };
            
            // Change the style
            this._map.setStyle(styles[this._currentStyle]);
            
            // When style loads, restore 3D terrain and camera position
            this._map.once('styledata', () => {
                if (this._map.getSource('mapbox-dem') === undefined) {
                    this._setupTerrain();
                }
                
                // Restore camera position
                this._map.jumpTo({
                    center: currentCenter,
                    zoom: currentZoom,
                    bearing: currentBearing,
                    pitch: currentPitch
                });
                
                // Re-add movement tracks after style has loaded
                addMovementTracksToMap();
                
                // Wait for tracks to be added, then restore highlights
                setTimeout(() => {
                    this._restoreHighlights(currentHighlightState);
                }, 200);
            });
        });
        
        this._container.appendChild(satelliteButton);
        return this._container;
    }
    
    _restoreHighlights(state) {
        // Restore highlighted track if it exists
        if (state.highlightedFeature) {
            highlightSelectedTrack(state.highlightedFeature);
        }
        
        // Restore MapController highlights
        Object.keys(state.mapControllerState).forEach(biomeId => {
            const tracks = state.mapControllerState[biomeId];
            
            if (tracks && tracks.length > 0) {
                // Only recalculate tracks if they exist
                // First get the biome name for filtering
                const biomeName = biomeData[biomeId].name;
                
                // Now find all tracks that match this biome
                const allTracks = movementTracks.slice();
                
                // For each track that was previously highlighted
                tracks.forEach((prevTrack, index) => {
                    // Try to find the matching track in the new movementTracks array
                    const matchingTrack = allTracks.find(track => 
                        track.properties.individual === prevTrack.properties?.individual
                    );
                    
                    if (matchingTrack) {
                        MapController.highlightTrack(biomeId, matchingTrack, index);
                        // Add to MapController's state
                        MapController.highlightedTracks[biomeId].push(matchingTrack);
                    }
                });
            }
        });
    }
    
    _setupTerrain() {
        // Add 3D terrain
        this._map.addSource('mapbox-dem', {
            'type': 'raster-dem',
            'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
            'tileSize': 512,
            'maxzoom': 14
        });
        
        // Add the DEM source as a terrain layer with exaggerated height
        this._map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 2 });
        
        // Add sky layer for realistic environment
        this._map.addLayer({
            'id': 'sky',
            'type': 'sky',
            'paint': {
                'sky-type': 'atmosphere',
                'sky-atmosphere-sun': [0.0, 0.0],
                'sky-atmosphere-sun-intensity': 15
            }
        });
        
        // Optional: Add 3D buildings if the zoom level is appropriate
        if (this._map.getZoom() >= 15) {
            this._addBuildings();
        }
    }
    
    _addBuildings() {
        if (!this._map.getLayer('3d-buildings')) {
            this._map.addLayer({
                'id': '3d-buildings',
                'source': 'composite',
                'source-layer': 'building',
                'filter': ['==', 'extrude', 'true'],
                'type': 'fill-extrusion',
                'minzoom': 15,
                'paint': {
                    'fill-extrusion-color': '#aaa',
                    'fill-extrusion-height': [
                        'interpolate', ['linear'], ['zoom'],
                        15, 0,
                        15.05, ['get', 'height']
                    ],
                    'fill-extrusion-base': [
                        'interpolate', ['linear'], ['zoom'],
                        15, 0,
                        15.05, ['get', 'min_height']
                    ],
                    'fill-extrusion-opacity': 0.6
                }
            });
        }
    }
    
    onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
    }
}


// Create a reset view control using Mapbox's custom control class
class ResetViewControl {
    onAdd(map) {
        this._map = map;
        this._container = document.createElement('div');
        this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
        
        const button = document.createElement('button');
        button.className = 'mapboxgl-ctrl-icon';
        button.type = 'button';
        button.title = 'Reset view';
        button.setAttribute('aria-label', 'Reset View');
        
        // Use a "home" icon from Mapbox's sprite sheet
        button.innerHTML = '<span class="mapboxgl-ctrl-icon" aria-hidden="true" style="display:inline-block;width:20px;height:20px;">⌂</span>';
        
        button.addEventListener('click', () => {
            this._map.flyTo({
                center: [-54.2, -21.5],
                zoom: 7.5,
                bearing: 0,
                pitch: 60,
                duration: 1500  // Animation duration in milliseconds
            });
            
            // Also reset any highlights
            resetHighlights();
        });
        
        this._container.appendChild(button);
        return this._container;
    }
    
    onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
    }
}

// Replace with your actual Mapbox Access Token
mapboxgl.accessToken = 'pk.eyJ1IjoieXVyaXNzb3V6YSIsImEiOiJjbThncGNkbWowb2FjMmpvOXc2ejhmdnAzIn0.9WvDM-DlIVcXImsxIPKeXw';

// Initialize Mapbox map with 3D settings
const map = new mapboxgl.Map({
    container: 'map', // ID of the div where the map will be displayed
    style: 'mapbox://styles/mapbox/outdoors-v12',
    center: [-54.2, -21.5], // Adjust to match Tapir locations
    zoom: 7.5,
    bearing: 0, // Add some rotation for better 3D perspective
    pitch: 60,   // Tilt the map for 3D view (0-60 degrees)
});

// Add a Map Controller to handle map-side synchronization
const MapController = {
    // Store references to highlighted tracks by biome
    highlightedTracks: {
        "atlantic-forest": [],
        "pantanal": [],
        "cerrado": []
    },
    
    // Initialize the controller
    init: function() {
        // Wait for both the map and CSV data to be ready
        const checkReady = () => {
            if (map.loaded() && csvDataLoaded) {
                this.setupEventListener();
            } else {
                setTimeout(checkReady, 100);
            }
        };
        
        checkReady();
    },
    
    // Set up listener for the event system
    setupEventListener: function() {
        TapirEventSystem.addListener((biomeId, type, value, allSelections) => {
            this.handleSelectionChange(biomeId, type, value);
        });
    },
    
    // Handle selection changes
    handleSelectionChange: function(biomeId, type, value) {
        // Clear previous highlights for this biome
        this.clearBiomeHighlights(biomeId);
        
        // Get the biome name for filtering
        const biomeName = biomeData[biomeId].name;
        
        if (type === "none") {
            // No need to highlight anything
            return;
        }
        
        if (!map.getSource("movement-tracks")) {
            console.warn("Map source not ready yet");
            return;
        }
        
        // Get all movement tracks
        const allTracks = movementTracks.slice();
        
        // Filter tracks based on selection type
        let tracksToHighlight = [];
        
        if (type === "all") {
            // Select all tracks from this biome
            tracksToHighlight = allTracks.filter(track => {
                const individualData = individualDataLookup.get(track.properties.individual);
                if (!individualData || !individualData.points || individualData.points.length === 0) {
                    return false;
                }
                return individualData.points[0].Biome === biomeName;
            });
        } else if (type === "individual") {
            // Select specific individual - make sure this matches the field used in movementTracks
            tracksToHighlight = allTracks.filter(track => 
                track.properties.individual === value
            );
        }
        
        // Highlight each selected track
        tracksToHighlight.forEach((track, index) => {
            this.highlightTrack(biomeId, track, index);
        });
        
        // Store highlighted tracks
        this.highlightedTracks[biomeId] = tracksToHighlight;
        
        // If any tracks were highlighted, zoom to fit them
        if (tracksToHighlight.length > 0) {
            this.zoomToTracks(tracksToHighlight);
        }
    },
    
    // Highlight a single track
    highlightTrack: function(biomeId, track, index) {
        const sourceId = `highlighted-${biomeId}-${index}`;
        const layerId = `highlighted-layer-${biomeId}-${index}`;
        
        // Add source if it doesn't exist
        if (!map.getSource(sourceId)) {
            map.addSource(sourceId, {
                type: 'geojson',
                data: track
            });
        } else {
            // Update existing source
            map.getSource(sourceId).setData(track);
        }
        
        // Add layer if it doesn't exist
        if (!map.getLayer(layerId)) {
            map.addLayer({
                id: layerId,
                type: 'line',
                source: sourceId,
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                paint: {
                    'line-color': biomeData[biomeId].color,
                    'line-width': 4,
                    'line-opacity': 0.8,
                }
            });
        }
    },
    
    // Clear highlights for a specific biome
    clearBiomeHighlights: function(biomeId) {
        const previousTracks = this.highlightedTracks[biomeId] || [];
        
        previousTracks.forEach((_, index) => {
            const layerId = `highlighted-layer-${biomeId}-${index}`;
            const sourceId = `highlighted-${biomeId}-${index}`;
            
            if (map.getLayer(layerId)) {
                map.removeLayer(layerId);
            }
            
            if (map.getSource(sourceId)) {
                map.removeSource(sourceId);
            }
        });
        
        this.highlightedTracks[biomeId] = [];
    },
    
    // Zoom map to show all highlighted tracks
    zoomToTracks: function(tracks) {
        if (tracks.length === 0) return;
        
        // Create a bounds object
        let bounds = new mapboxgl.LngLatBounds();
        
        // Extend bounds with each track's coordinates
        tracks.forEach(track => {
            track.geometry.coordinates.forEach(coord => {
                bounds.extend(coord);
            });
        });
        
        // Fit map to these bounds
        map.fitBounds(bounds, {
            padding: 100,
            duration: 1000,
            pitch: 60,
        });
    }
};

// Add a listener to the map's movement lines for selection in the opposite direction
function setupMapSelectionEvents() {
    if (!map.getLayer('movement-lines')) {
        setTimeout(setupMapSelectionEvents, 100);
        return;
    }
    
    map.on('click', 'movement-lines', (e) => {
        // The original click handler still works, but we add functionality
        
        // Get properties of the clicked line
        const features = map.queryRenderedFeatures(e.point, { layers: ['movement-lines'] });
        if (!features.length) return;
        
        const feature = features[0];
        const { individual } = feature.properties;  // Make sure this matches your data
        
        // Find which biome this individual belongs to
        const individualData = individualDataLookup.get(individual);
        if (!individualData || !individualData.points || individualData.points.length === 0) {
            console.warn("No data found for individual:", individual);
            return;
        }
        
        const biomeName = individualData.points[0].Biome;
        console.log(`Clicked on individual: ${individual} from biome: ${biomeName}`);
        
        // Find the biome ID
        const biomeId = Object.keys(biomeData).find(id => 
            biomeData[id].name === biomeName
        );
        
        if (!biomeId) {
            console.warn(`Could not find biome ID for biome name: ${biomeName}`);
            return;
        }
        
        // Update the dropdown
        const dropdown = biomeElements[biomeId].dropdown;
        dropdown.property('value', individual);
        
        // Update finger and label
        const fingerElement = biomeElements[biomeId].finger;
        fingerElement.attr("fill", biomeData[biomeId].colorFinger);
        fingerLabels[biomeId].text(individual);
        
        // Update the event system (this will trigger other UI updates)
        TapirEventSystem.updateSelection(biomeId, "individual", individual);
        
        // Update the visualization
        updatePlot();
    });
}


// Call this when loading the d3.csv is complete
function initSynchronization() {
    // Initialize the map controller
    MapController.init();
    
    // Set up map click handlers
    setupMapSelectionEvents();
}

// Add a CSS class for highlighted elements
const highlightStyle = document.createElement('style');
highlightStyle.innerHTML = `
.highlighted-track {
    stroke-width: 4px;
    opacity: 0.8;
}
`;
document.head.appendChild(highlightStyle);

// Wait for map to load before adding 3D features
map.on('load', () => {
    // Add 3D terrain
    map.addSource('mapbox-dem', {
        'type': 'raster-dem',
        'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
        'tileSize': 512,
        'maxzoom': 8
    });
    
    // The rest of your 3D terrain setup code...
});

// Define available styles
const styles = {
    outdoors: 'mapbox://styles/mapbox/outdoors-v12',
    satellite: 'mapbox://styles/mapbox/satellite-streets-v12'
};

// Store movement data globally so it can be reapplied after style changes
let movementTracks = [];
let individualDataLookup = new Map();
let csvDataLoaded = false;
// Variable to store the currently highlighted feature
let highlightedFeature = null;

// Function to add movement tracks to the map
function addMovementTracksToMap() {
    if (!csvDataLoaded || movementTracks.length === 0) return;
    
    // Only add if the source doesn't already exist
    if (!map.getSource("movement-tracks")) {
        map.addSource("movement-tracks", {
            type: "geojson",
            data: {
                type: "FeatureCollection",
                features: movementTracks
            }
        });

        // Add movement lines layer
        map.addLayer({
            id: "movement-lines",
            type: "line",
            source: "movement-tracks",
            paint: {
                "line-color": ["get", "color"],
                "line-width": 1,
                "line-opacity": 0.5
            }
        });

        // Handle click events on lines
        map.on('click', 'movement-lines', (e) => {
            // Get properties of the clicked line
            const features = map.queryRenderedFeatures(e.point, { layers: ['movement-lines'] });
            if (!features.length) return;
            
            const feature = features[0];
            const { individual, startTime, endTime } = feature.properties;
            const coords = e.lngLat;
            
            // Get additional data from our lookup
            const individualData = individualDataLookup.get(individual);
            
            // Get the point closest to where the user clicked
            const clickPoint = [coords.lng, coords.lat];
            
            // Find the closest point in the track to display relevant data
            let closestPointData = individualData.points[0];
            let minDistance = Infinity;
            
            individualData.points.forEach(point => {
                const pointCoords = [point.Longitude, point.Latitude];
                const distance = Math.sqrt(
                    Math.pow(pointCoords[0] - clickPoint[0], 2) + 
                    Math.pow(pointCoords[1] - clickPoint[1], 2)
                );
                
                if (distance < minDistance) {
                    minDistance = distance;
                    closestPointData = point;
                }
            });
            
            // Create popup with requested columns in specified order
            new mapboxgl.Popup()
                .setLngLat(coords)
                .setHTML(`
                    <strong>Name:</strong> ${closestPointData.individual_name}<br>
                    <strong>Sex:</strong> ${closestPointData.sex}<br>
                    <strong>Age:</strong> ${closestPointData.age}<br>
                    <strong>Biome:</strong> ${closestPointData.Biome}<br>
                    <strong>Timestamp:</strong> ${closestPointData.timestamp}<br>
                    <strong>Latitude:</strong> ${closestPointData.Latitude.toFixed(6)}<br>
                    <strong>Longitude:</strong> ${closestPointData.Longitude.toFixed(6)}<br>
                    <strong>Record ID:</strong> ${closestPointData.Record_ID}
                `)
                .addTo(map);
            
            // Highlight the selected movement line
            highlightSelectedTrack(feature);
            
            // Zoom to the bounds of the selected track
            zoomToTrack(feature);
        });
        
        // Change cursor when hovering over lines
        map.on('mouseenter', 'movement-lines', () => {
            map.getCanvas().style.cursor = 'pointer';
        });
        
        map.on('mouseleave', 'movement-lines', () => {
            map.getCanvas().style.cursor = '';
        });
    }
}

// Function to highlight the selected track
function highlightSelectedTrack(feature) {
    // Store the currently highlighted feature
    highlightedFeature = feature;
    
    // Check if we already have a highlighted layer and remove it
    if (map.getLayer('highlighted-track')) {
        map.removeLayer('highlighted-track');
    }
    
    if (map.getSource('highlighted-track-source')) {
        map.removeSource('highlighted-track-source');
    }
    
    // Add a new source and layer for the highlighted track
    map.addSource('highlighted-track-source', {
        type: 'geojson',
        data: feature
    });
    
    map.addLayer({
        id: 'highlighted-track',
        type: 'line',
        source: 'highlighted-track-source',
        layout: {
            'line-join': 'round',
            'line-cap': 'round'
        },
        paint: {
            'line-color': feature.properties.color,
            'line-width': 4,
            'line-opacity': 0.5,
        }
    });
}

// Function to zoom to the bounds of a track
// Function to zoom to the bounds of a track
function zoomToTrack(feature) {
    try {
        // Make sure coordinates exist and are valid
        const coordinates = feature.geometry.coordinates;
        
        if (!coordinates || coordinates.length < 2) {
            console.warn("Not enough valid coordinates to create bounds");
            return;
        }
        
        // Filter out any invalid coordinates before creating the bounds
        const validCoordinates = coordinates.filter(coord => 
            Array.isArray(coord) && 
            coord.length >= 2 && 
            !isNaN(coord[0]) && 
            !isNaN(coord[1]) &&
            Math.abs(coord[0]) <= 180 && 
            Math.abs(coord[1]) <= 90
        );
        
        if (validCoordinates.length < 2) {
            console.warn("Not enough valid coordinates after filtering");
            return;
        }
        
        // Create a bounding box from the valid track coordinates
        const bounds = validCoordinates.reduce((bounds, coord) => {
            try {
                return bounds.extend(coord);
            } catch (e) {
                console.warn("Could not extend bounds with coordinate:", coord);
                return bounds;
            }
        }, new mapboxgl.LngLatBounds(validCoordinates[0], validCoordinates[0]));
        
        // Zoom to the track with some padding and smooth animation
        map.fitBounds(bounds, {
            padding: 100, // Add some padding around the bounds
            duration: 1500, // Animation duration in milliseconds
            pitch: 30, // Maintain 3D view
            bearing: map.getBearing(), // Maintain current bearing
            zoom: 8
        });
    } catch (error) {
        console.error("Error zooming to track:", error);
    }
}

// Function to reset highlights
function resetHighlights() {
    if (map.getLayer('highlighted-track')) {
        map.removeLayer('highlighted-track');
    }
    
    if (map.getSource('highlighted-track-source')) {
        map.removeSource('highlighted-track-source');
    }
    
    highlightedFeature = null;
}

// Define the coordinates and colors for the three biomes
const biomeLocations = [
    { name: "Atlantic Forest", coordinates: [-52.18, -22.5], class: "atlantic-forest", color: "#2E8B57" },  
    { name: "Cerrado", coordinates: [-53.76, -21.47], class: "cerrado", color: "#CD853F"  },  
    { name: "Pantanal", coordinates: [-55.78, -19.2], class: "pantanal", color: "#806D43"  }  
];

// Add biome markers with permanent labels to the map
biomeLocations.forEach(biome => {
    // Add the marker (color can remain in JavaScript since it's specific to mapboxgl.Marker)
    new mapboxgl.Marker({ color: biome.color })
        .setLngLat(biome.coordinates)
        .addTo(map);
    
    // Create a custom HTML element for the permanent label
    const el = document.createElement('div');
    el.className = `biome-label ${biome.class}`;
    el.innerHTML = biome.name;
    
    // Add the permanent label slightly above the marker
    new mapboxgl.Marker(el, { anchor: 'bottom', offset: [0, -45] })
        .setLngLat(biome.coordinates)
        .addTo(map);
});



// Add controls specifically useful for 3D navigation
map.addControl(new mapboxgl.NavigationControl({
    visualizePitch: true  // Shows pitch control in the navigation control
}));

// Add the style toggle control
map.addControl(new StyleToggleControl(), 'top-right');

// Add the reset view control to the top-right corner
map.addControl(new ResetViewControl(), 'top-right');

// Load CSV data
d3.csv('data/df_merged_na_coord3.csv', d3.autoType).then(data => {
    console.log("✅ Loaded CSV Data:", data);

    // Filter valid coordinate points
    const validData = data.filter(d => !isNaN(d.Longitude) && !isNaN(d.Latitude));

    if (validData.length === 0) {
        console.error("❌ No valid coordinates found.");
        return;
    }

    console.log(`📍 Found ${validData.length} valid points`);

    // Group data by individual
    const groupedIndividuals = d3.group(validData, d => d["individual_name"]);

    // Process movement tracks (lines)
    movementTracks = []; // Clear any existing tracks
    individualDataLookup = new Map(); // Clear existing lookup

    groupedIndividuals.forEach((individualData, individual) => {
        // Sort each individual's data by timestamp
        individualData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        // Extract coordinates for movement tracking
        const coordinates = individualData.map(d => [d.Longitude, d.Latitude]);

        if (coordinates.length > 1) {
            // Store track data for popup display
            individualDataLookup.set(individual, {
                coordinates,
                points: individualData.map(point => ({
                    Record_ID: point.ID || point.Record_ID || '',
                    timestamp: point.timestamp || '',
                    Longitude: point.Longitude || '',
                    Latitude: point.Latitude || '',
                    Biome: point.Biome || '',
                    sex: point.sex || '',
                    age: point.age || '',
                    individual_name: point.individual_name || point.individual_local_identifier || ''
                }))
            });

            movementTracks.push({
                type: "Feature",
                properties: { 
                    individual,
                    color: getColorForID(individual),
                    startTime: individualData[0].timestamp,
                    endTime: individualData[individualData.length-1].timestamp
                },
                geometry: {
                    type: "LineString",
                    coordinates
                }
            });
        }
    });

    // Set flag indicating CSV data is loaded
    csvDataLoaded = true;
    
    // Add movement tracks to the map
    addMovementTracksToMap();

}).catch(error => {
    console.error("❌ Error loading CSV:", error);
});


// Add some CSS to style the satellite button
const style = document.createElement('style');
style.innerHTML = `
.satellite-toggle span {
    font-size: 16px;
    display: inline-block;
    width: 20px;
    height: 20px;
    line-height: 20px;
    text-align: center;
}
`;

document.head.appendChild(style);


/************************************/
/* 4. EVENT HANDLERS                */
/************************************/

// Add click handler to close modal when clicking outside
document.addEventListener('click', event => {
    if (modalContainer.style("display") !== 'none') {
        const modalElement = modalContainer.node();
        if (!modalElement.contains(event.target)) {
            const isTapirPart = 
                event.target.classList.contains('tapir-finger') ||
                event.target.classList.contains('tapir-finger-label') ||
                (event.target.parentNode && 
                 event.target.parentNode.classList && 
                 event.target.parentNode.classList.contains('tapir-finger-label'));
            
            if (!isTapirPart) {
                closeModal();
            }
        }
    }
});

// Event handler for video containers
document.querySelectorAll('.video-container').forEach(container => {
    container.addEventListener('mouseenter', () => {
        document.querySelectorAll('video').forEach(video => video.play());
    });
});