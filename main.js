// Add your JavaScript code here
const MAX_WIDTH = Math.max(1080, window.innerWidth);
const MAX_HEIGHT = 720;
const margin = {top: 40, right: 100, bottom: 40, left: 175};

// Assumes the same graph width, height dimensions as the example dashboard. Feel free to change these if you'd like
let graph_1_width = MAX_WIDTH / 1.5, graph_1_height = 250;
let graph_2_width = 400, graph_2_height = 300;
let graph_3_width = MAX_WIDTH / 1.5, graph_3_height = 275;


//Graph 1
let svg = d3.select("#graph1")
    .append("svg")
    .attr("width", graph_1_width +100)     // HINT: width
    .attr("height", graph_1_height)     // HINT: height
    .append("g")
    .attr("transform", `translate(${margin.left +60}, ${margin.top})`)

let x = d3.scaleLinear()
    .range([0, graph_1_width - margin.left - margin.right]);
let y = d3.scaleBand()
    .range([0, graph_1_height - margin.bottom - margin.top])
    .padding(0.1);  // Improves readability

let countRef = svg.append("g");
let y_axis_label = svg.append("g");

svg.append("text")
    .attr("transform", `translate(50, ${graph_1_height/1.2})`)       // HINT: Place this at the bottom middle edge of the graph
    .style("text-anchor", "middle")
    .text("Sales (in millions)");

let y_axis_text = svg.append("text")
    .attr("transform", `translate(-200, ${graph_1_height/3})`)       // HINT: Place this at the center left edge of the graph
    .style("text-anchor", "middle");

    let title = svg.append("text")
    .attr("transform", `translate(${graph_1_width/4}, -20)`)       // HINT: Place this at the top middle edge of the graph
    .style("text-anchor", "middle")
    .style("font-size", 15);


function setData1(year) {
    d3.csv("/../data/video_games.csv").then(function(data) {
    // TODO: Clean and strip desired amount of data for barplot
        //If 0, do all time. Else filter by year
        if (year != '0') {
            data = data.filter(function (d) { return d["Year"] === year})
        }

        data = d3.nest()
            .key(function (d) {return d.Name})
            .rollup(function (v) { return d3.sum(v, function (d) { return d.Global_Sales})}).entries(data)
        
        data = cleanData(
            data, 
            function(x, y) { return y.value - x.value}, 
            10)
        console.log(data)
        /*data = cleanData(
            data, 
            function(x, y) { return parseInt(y["Global_Sales"], 10) - parseInt(x["Global_Sales"], 10)}, 
            10)
        console.log(data)*/
        x.domain([0, d3.max(data, function(d) {return parseInt(d.value)})]);

        y.domain(data.map(function(d) { return d.key}));
        
        console.log("updated x and y axes")
        // TODO: Render y-axis label
        y_axis_label.call(d3.axisLeft(y).tickSize(0).tickPadding(10));

        let bars = svg.selectAll("rect").data(data);
        let color = d3.scaleOrdinal()
        .domain(data.map(function(d) { return d.key }))
        .range(d3.quantize(d3.interpolateHcl("#66A0E2", "#81C2C3"), 10));

        bars.enter()
        .append("rect")
        .merge(bars)
        .attr("fill", function(d) { return color(d.key) })
        .transition()
        .duration(1000)
        .attr("x", x(0))
        .attr("y", function(d) { return y(d.key)})               // HINT: Use function(d) { return ...; } to apply styles based on the data point
        .attr("width", function(d) { return x(d.value)})
        .attr("height",  y.bandwidth());        // HINT: y.bandwidth() makes a reasonable display height
        console.log("bars");

        let counts = countRef.selectAll("text").data(data);
        
        // TODO: Render the text elements on the DOM
        counts.enter()
            .append("text")
            .merge(counts)
            .transition()
            .duration(1000)
            .attr("x", function (d) {
                return x(d.value) + 5;
            })       // HINT: Add a small offset to the right edge of the bar, found by x(d.count)
            .attr("y", function (d) {
                return y(d.key) +10 ;
            })       // HINT: Add a small offset to the top edge of the bar, found by y(d.artist)
            .style("text-anchor", "start")
            .text(function (d) {return d.value.toFixed(2)});           // HINT: Get the count of the artist
        y_axis_text.text("Name");
        title.text("Top Games Based on Global Sales Over Time");
        // Remove elements not in use if fewer groups in new dataset
        bars.exit().remove();
        counts.exit().remove();
    });
}


// Graph 2
var svg2 = d3.select("#graph2")
    .append("svg")
    .attr("width", graph_2_width +85)
    .attr("height", graph_2_height);

// Map and projection
var projection = d3.geoMercator()
    .center([2, 47])                // GPS of location to zoom on
    .scale(70)                       // This is like the zoom
    .translate([ graph_2_width/2, graph_2_height/2 ])

svg2
.append("text")
  .attr("text-anchor", "end")
  .style("fill", "black")
  .attr("x", graph_2_width - 10)
  .attr("y", graph_2_height -290)
  .attr("width", 90)
  .html("Most Popular Genre in Each Region Based on Sales")
  .style("font-size", 14)
// Create data for circles:

best_genre_per_region = {}

d3.csv("/../data/video_games.csv").then(function(data) {
    NA_data = d3.nest()
    .key(function (d) {return d.Genre})
    .rollup(function (v) {
        return d3.sum(v, function (d) { return d['NA_Sales']})})
    .entries(data)

    NA_data = cleanData(
        NA_data, 
        function(x, y) {
            return parseFloat(y.value) - parseFloat(x.value)}, 
        11)
        
    best_NA_genre = NA_data[0]
    best_genre_per_region['NA'] = best_NA_genre

    JP_data = d3.nest()
    .key(function (d) {return d.Genre})
    .rollup(function (v) {
        return d3.sum(v, function (d) { return d['JP_Sales']})})
    .entries(data)

    JP_data = cleanData(
        JP_data, 
        function(x, y) {
            return parseFloat(y.value) - parseFloat(x.value)}, 
        11)
    best_JP_genre = JP_data[0]
    best_genre_per_region['JP'] = best_JP_genre

    EU_data = d3.nest()
    .key(function (d) {return d.Genre})
    .rollup(function (v) {
        return d3.sum(v, function (d) { return d['EU_Sales']})})
    .entries(data)

    EU_data = cleanData(
        EU_data, 
        function(x, y) {
            return parseFloat(y.value) - parseFloat(x.value)}, 
        11)
        
    best_EU_genre = EU_data[0]
    best_genre_per_region['EU'] = best_EU_genre

    OTHER_data = d3.nest()
    .key(function (d) {return d.Genre})
    .rollup(function (v) {
        return d3.sum(v, function (d) { return d['OTHER_Sales']})})
    .entries(data)

    OTHER_data = cleanData(
        OTHER_data, 
        function(x, y) {
            return parseFloat(y.value) - parseFloat(x.value)}, 
        11)
        
    best_OTHER_genre = OTHER_data[0]
    best_genre_per_region['OTHER'] = best_OTHER_genre
    
    console.log(best_genre_per_region['NA'])
    var markers = [
        {long: -97.000, lat: 38.090, group: "NA", genre: best_genre_per_region['NA'].key, size: best_genre_per_region['NA'].value/15}, 
        {long: 15.255, lat: 54.526, group: "EU", genre: best_genre_per_region['EU'].key,size: best_genre_per_region['EU'].value/15}, 
        {long: 138.2529, lat: 36.2048, group: "JP", genre: best_genre_per_region['JP'].key,size: best_genre_per_region['JP'].value/15}, 
        {long: 0, lat: -50, group: "OTHER", genre: best_genre_per_region['OTHER'].key,size: best_genre_per_region['OTHER'].value/15}
    ];

    // Load external data and boot
    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson").then(function(data1){

        
        // Create a color scale
        var color2 = d3.scaleOrdinal()
        .domain(["NA", "EU", "JP", "OTHER" ])
        .range([ "#402D54", "#D18975", "#8FD175", "#9932CC"])

        // Add a scale for bubble size
        var size = d3.scaleLinear()
        .domain([1,100])  // What's in the data
        .range([ 4, 50])  // Size in pixel

        // -1- Create a tooltip div that is hidden by default:
        var tooltip = d3.select("#graph2")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("background-color", "black")
            .style("border-radius", "5px")
            .style("padding", "10px")
            .style("color", "white")

        // -2- Create 3 functions to show / update (when mouse move but stay on same circle) / hide the tooltip
        var showTooltip = function(d) {
        tooltip
            .transition()
            .duration(200)
        tooltip
            .style("opacity", 1)
            .html("Region: " + d.group + ", Genre: " +d.genre)
            .style("left", (d3.mouse(this)[0]) + "px")
            .style("top", (d3.mouse(this)[1]) + "px")
        }
        var moveTooltip = function(d) {
        tooltip
            .style("left", (d3.mouse(this)[0]) + "px")
            .style("top", (d3.mouse(this)[1]) + "px")
        }
        var hideTooltip = function(d) {
        tooltip
            .transition()
            .duration(200)
            .style("opacity", 0)
        }

        // Draw the map
        svg2.append("g")
            .selectAll("path")
            .data(data1.features)
            .enter()
            .append("path")
            .attr("fill", "#b8b8b8")
            .attr("d", d3.geoPath()
                .projection(projection)
            )
            .style("stroke", "black")
            .style("opacity", .3)

        // Add circles:
        let circles = svg2
        .selectAll("myCircles")
        .data(markers)
        .enter()
        .append("circle")
            .attr("cx", function(d){ return projection([d.long, d.lat])[0] })
            .attr("cy", function(d){ return projection([d.long, d.lat])[1] })
            .attr("r", function(d){ return size(d.size) })
            .style("fill", function(d){ return color2(d.group) })
            .attr("stroke", function(d){ return color2(d.group) })
            .attr("stroke-width", 3)
            .attr("fill-opacity", .4)
        // -3- Trigger the functions
        .on("mouseover", showTooltip )
        .on("mousemove", moveTooltip )
        .on("mouseleave", hideTooltip )
        })

})

//Graph 3
let svg3 = d3.select("#graph3")
    .append("svg")
    .attr("width", graph_3_width+100)     // HINT: width
    .attr("height", graph_3_height)     // HINT: height
    .append("g")
    .attr("transform", `translate(${margin.left +60}, ${margin.bottom})`)

let x3 = d3.scaleLinear()
    .range([0, graph_3_width - margin.left - margin.right]);
let y3 = d3.scaleBand()
    .range([0, graph_3_height - margin.bottom - margin.top])
    .padding(0.1);  // Improves readability

let countRef3 = svg3.append("g");
let y_axis_label3 = svg3.append("g");

svg3.append("text")
    .attr("transform", `translate(50, ${graph_3_height/1.2})`)       // HINT: Place this at the bottom middle edge of the graph
    .style("text-anchor", "middle")
    .text("Sales (in millions)");

let y_axis_text3 = svg3.append("text")
    .attr("transform", `translate(-200, ${graph_3_height/3})`)       // HINT: Place this at the center left edge of the graph
    .style("text-anchor", "middle");

    let title3 = svg3.append("text")
    .attr("transform", `translate(${graph_3_width/4}, 0)`)       // HINT: Place this at the top middle edge of the graph
    .style("text-anchor", "middle")
    .style("font-size", 15);


function setData3(genre) {
    d3.csv("/../data/video_games.csv").then(function(data) {
    // TODO: Clean and strip desired amount of data for barplot
        
        data = data.filter(function (d) { return d["Genre"] === genre})
        data = d3.nest()
            .key(function (d) {return d.Publisher})
            .rollup(function (v) { return d3.sum(v, function (d) { return d.Global_Sales})}).entries(data)
        
        data = cleanData(
            data, 
            function(x, y) { return y.value - x.value}, 
            10)
        console.log(data)
        x3.domain([0, d3.max(data, function(d) {return d.value})]);

        y3.domain(data.map(function(d) { return d.key}));
        
        console.log("updated x and y axes")
        // TODO: Render y-axis label
        y_axis_label3.call(d3.axisLeft(y3).tickSize(0).tickPadding(10));

        let bars3 = svg3.selectAll("rect").data(data);
        let color3 = d3.scaleOrdinal()
        .domain(data.map(function(d) { return d.key }))
        .range(d3.quantize(d3.interpolateHcl("#66A0E2", "#81C2C3"), 10));

        bars3.enter()
        .append("rect")
        .merge(bars3)
        .attr("fill", function(d) { return color3(d.key) })
        .transition()
        .duration(1000)
        .attr("x", x3(0))
        .attr("y", function(d) { return y3(d.key)})               // HINT: Use function(d) { return ...; } to apply styles based on the data point
        .attr("width", function(d) { return x3(d.value) })
        .attr("height",  y3.bandwidth());        // HINT: y.bandwidth() makes a reasonable display height
        console.log("bars");

        let counts3 = countRef3.selectAll("text").data(data);
        
        // TODO: Render the text elements on the DOM
        counts3.enter()
            .append("text")
            .merge(counts3)
            .transition()
            .duration(1000)
            .attr("x", function (d) {
                return x3(d.value) + 5;
            })       // HINT: Add a small offset to the right edge of the bar, found by x(d.count)
            .attr("y", function (d) {
                return y3(d.key) +10 ;
            })       // HINT: Add a small offset to the top edge of the bar, found by y(d.artist)
            .style("text-anchor", "start")
            .text(function (d) {return d.value.toFixed(2)});           // HINT: Get the count of the artist
        y_axis_text3.text("Publisher");
        title3.text("Top Publisher per Genre Based on Global Sales");
        // Remove elements not in use if fewer groups in new dataset
        bars3.exit().remove();
        counts3.exit().remove();
    });
}

/**
 * Cleans the provided data using the given comparator then strips to first numExamples
 * instances
 */
function cleanData(data, comparator, numExamples) {
    // TODO: sort and return the given data with the comparator (extracting the desired number of examples)
      // Sort the array based on the second element
      data = data.sort(comparator);

      
      // Create a new array with only numExamples
      return data.slice(0, numExamples);
}