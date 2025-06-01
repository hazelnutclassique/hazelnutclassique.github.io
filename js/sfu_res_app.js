
/**************** GENERAL NOTE ON VISUALIZATION ****************/
// The order of the columns in the file matter, 
// I sorted them manually based on the latest year 
// (no way to do it with D3 stack)

/**************** MARGINS AND DIMENSIONS ****************/
// Setup SVG's dimensions
var viewportWidth = window.innerWidth;
var viewportHeight = window.innerHeight;
var margin = {top: viewportHeight*0.2, right: viewportWidth*0.2, bottom: viewportHeight*0.2, left: 0.2*viewportWidth},
    width = viewportWidth, // TRY: viewportWidth or enter a custom width
    height = viewportHeight; 
    legendPadding = 40;

// Setup graph's dimnesions
const graphWidth = width - margin.left - margin.right;
const graphHeight = height - margin.top - margin.bottom;


/**************** AXES/TOOLTIP TEXT FORMATTING FUNCTIONS ****************/
format = d3.format('.3s');
formatTotal = d3.format('.4s');
formatAxis = d3.format('.2s');
formatComma = d3.format(',');


/**************** APPEND MAIN SVG TO DOM ****************/
var svg = d3.select("body")
  .append("svg")
  .attr('width', '100%')
  .attr('height', '100%')
  .attr("viewBox", `0 0 ${width} ${height}`)
  .attr("preserveAspectRatio", "xMinYMin");

/**************** Graph Title ****************/
svg.append('text')
  .attr('fill', '#3f3f3f')
  .attr('x', graphWidth/2 + margin.left)
  .attr('y', margin.top*3/5)
  .text('SFU Research Performance')
  .style("text-anchor", "middle")
  .attr('font-size','20')
  .attr("font-weight", "700");  

/**************** CREATE GRAPH, GRID AND LEGEND GROUPS ****************/
// 'grid' has the underlying grid and axes appended
// to it first, so that sits in the background
const grid = svg.append('g')
  .attr('width', graphWidth)
  .attr('height', graphHeight)
  .attr('transform', `translate(${margin.left},${margin.top})`);

// 'graph' has the underlying grid and axes appended
// to it after, so that sits in the foreground
const graph = svg.append('g')
  .attr('width', graphWidth)
  .attr('height', graphHeight)
  .attr('transform', `translate(${margin.left},${margin.top})`);

// The legend can be added in any arbitrary order, 
// since it does not overlap. It is set the the right side here
const legend = svg.append('g')
  .attr('width', margin.right)
  .attr('height', graphHeight)
  .attr('transform', `translate(${margin.left+graphWidth+legendPadding},${margin.top})`);


/**************** LOAD DATA ****************/
// Workflow for multiple visualizations in one graph,
// currently unused (only one promise loaded)
var bucket = {};
var promises = [d3.csv("../data/SFU_research_income_by_broad_category_2000-2020.csv")];

// Import Data as an array of Promises
myDataPromises = Promise.all(promises);

// Asynchronous rendering of data once loaded
myDataPromises.then(function(data){
  data[0].forEach(d => d.Year = +d.Year);
  bucket.first = data[0];
  chart(data[0]);
});


/**************** FUNCTION RENDERING VISUALIZATION ****************/
const chart = data => {

  /**************** KEYS ****************/
  var keys = Object.keys(data[0]);
  keys.shift();
  console.log(data);
  console.log(keys);
  
  /**************** SCALES ****************/
  // Create x scale based on year
  const x = d3.scaleBand()
    .domain(data.map(d => d.Year))
    .range([0,graphWidth])
    .paddingInner(0.3) // between bars
    .paddingOuter(0.3); // vertical edge paddings

  // Create y scale based on the max values of the sum of categories per year
  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d3.sum(keys, k => +d[k]))]).nice()
    .range([graphHeight, 0]);

  /**************** AXES & GRIDS ****************/
  // Create and call the axes
  const xAxis = d3.axisBottom(x).scale(x).tickSize(10);
  const yAxis = d3.axisLeft(y).scale(y).tickSize(10)
    .ticks(10) 
    .tickFormat(d => "$" + formatAxis(d)); 
  
  // Create and append yAxis grid
  const yAxisGrid = d3.axisLeft(y).tickSize(-graphWidth)
    .tickFormat('')
    .ticks(10);
  grid.append('g')
    .attr('class', 'y axis grid')
    .call(yAxisGrid)  
  
  const xAxisGroup = grid.append('g')
    .attr('transform', `translate(0,${graphHeight})`);
  const yAxisGroup = grid.append('g');

  // Apply to axes category
  xAxisGroup.call(xAxis);
  yAxisGroup.call(yAxis); 
  
  xAxisGroup.selectAll('text')
    .attr('font-size','10')
    .attr('color', '#777777')
    .attr('font-weight', '600')
    .attr('transform', `translate(-16,25) rotate(-90)`) // combine transforms
    .attr('text-anchor', 'middle'); // choose anchor to rotate on, 

  yAxisGroup.selectAll('text')
    .attr('font-size','10')
    .attr('color', '#777777')
    .attr('font-weight', '600')
    .attr('transform', `translate(-10,0)`);

  /**************** yAxis, xAxis Title ****************/
  xAxisGroup.append('text')
    .attr('fill', '#3f3f3f')
    .attr('x', graphWidth/2)
    .attr('y', margin.bottom/1.2)
    .text('Fiscal Year')
    .style("text-anchor", "middle")
    .attr('font-size','15')
    .attr("font-weight", "700"); 
  
  yAxisGroup.append('text')
    .attr('fill', '#3f3f3f')
    .text('Performance in Millions ($)')
    .style("text-anchor", "middle")
    .attr('transform', `translate(${-margin.left/1.4},${graphHeight/2}) rotate(-90)`)
    .attr('font-size','15')
    .attr("font-weight", "700"); 

  grid.selectAll('line')
    .attr('stroke','#e5e5e5')


  /**************** COLOURS ****************/
  var colors = ['#5D0D16','#a6192e','#d31e32','#c4c4c4','#eaeaea'];
  // var colors = d3.schemeReds[5];
  // var colors = d3.schemeTableau10;
  /*
    ***** Try these individually for alternate color schemes ******
        var colors = d3.schemeReds[5];
        var colors = d3.schemeTableau10;
        var colors = d3.schemeSet3;
        var colors = d3.schemeSet1;
        colors.reverse();
        colors = []
        for (var i = 0; i< keys.length; i++) {
          ratio = (i/(keys.length));
          colors.push(d3.interpolateMagma(ratio))
        }
        var colors = ["#ff7e67","#2a3d66", "#5d54a4", "#9d65c9", "#d789d7","#3b2e5a","#394989",
          "#4ea0ae","#fff48f","#1b262c","#0f4c75","#3282b8","#bbe1fa","#1e5f74","#ffc93c","#206a5d",
          "#557571","#d49a89","#f7d1ba","#1a1a2e","#7d0633","#16213e","#0f3460","#e94560","#ff7171",
          "#ffa372",];
  */

  // Map colours to keys
  var getGroupColour = d3.scaleOrdinal()
    .domain(keys)
    .range(colors);

  /**************** STACKS & CATEGORIES ****************/
  // Create stack generator function
  var stack = d3.stack()
    .keys(keys)
    .order(d3.stackOrderDescending)
    .offset(d3.stackOffsetNone);
  
  // Generate stack and assign to series var
  var series = stack(data);
  console.log(series)
  
  // Get the highest total value all-time
  const maxValue = d3.max(data, d => d3.sum(keys, k => +d[k]))

  // Get the stacked height of all rectangles of the current year
  /*
        Use this list of numbers instead of "maxValue"
        in case you wish to have the line stop at each category
        for the year 2020
        'curr_year_stacked' values indicate the actual height of the top of 
        each rect. 'curr_year_values' indicate the value of individual categories.
        
        As well, use "curr_year_stacked[4]" instead of maxValue if the 
        highest sum of revenue no longer belongs to the latest year
  */
  // var curr_year_stacked = []
  // for (i = 0; i < series.length; i++) {
  //   curr_year_idx = series[0].length-1;
  //   stacked_value = series[i][curr_year_idx][1]
  //   curr_year_stacked.push(stacked_value)
  // } 
  // var curr_year_values = []
  // for (i = 0; i < series.length; i++) {
  //   curr_year_idx = series[0].length-1;
  //   stacked_value = series[i][curr_year_idx][1]-series[i][curr_year_idx][0]
  //   curr_year_values.push(stacked_value)
  // } 


  // Attach series data to graph as "category"
  var category = graph.selectAll("g")
    .data(series)
    .enter()
    .append("g")
    .style('fill', '#e5e5e5')
    .attr("key", (d,i,n) => keys[i]);
  
  /**************** BARS ****************/
  // Handle enter, update, exit selections, animation and events
  var rects = category.selectAll("rect")
    .data(d => d)
    .enter()
    .append("rect")
    .attr("x", (d, i, n) => (x(d["data"].Year)))
    .attr("y", graphHeight)
    .attr("height", 0)
    .attr("width", x.bandwidth())
    .on("mouseover", event => tooltip.style("display", "block"))
    .on("mouseout", event => tooltip.style("display", "none"))
    .on("mousemove", function(event,d) { 
      tooltip.attr("transform", `translate(${event.pageX-100},${event.pageY-50})`);
      tooltip.selectAll("text.value")
        .text("$"+format(d[1]-d[0]));
      tooltip.selectAll("text.source")
        .text(d3.select(this.parentNode).attr("key"));
    })
    .transition().delay((d,i,n) => i*50).duration(500)
      .attr("y", d => y(d[1]))
      .attr("height", d => y(d[0])-y(d[1]))
      .attr("width", x.bandwidth())
    .transition().delay(function(d,i,n) {
        key = this.parentNode.getAttribute('key');
        return keys.indexOf(key)*500+50*(n.length-i)}).duration(300)
    .style('fill', function (d,i,n) {
      key = this.parentNode.getAttribute('key');
      return getGroupColour(key);
    }); 
     
    /**************** LEGEND ****************/
    const squares = legend.selectAll('rect')
      .data(keys.reverse());

    squares.enter()
      .append('rect')
        .attr('width', 15)
        .attr('height', 15)
        .attr('stroke','#3f3f3f')
        .attr('stroke-width',1)
        .attr('y', (d,i,n) => (i*-18)+(n.length*18))
        .attr('fill', (d,i,n) => getGroupColour(keys[i]));
    
    squares.enter()
      .append('text')
        .attr('fill', 'black')
        .attr('x',25)
        .attr('y', (d,i,n) => (n.length*18)+(-18*i)+10)
        .text((d,i,n) => {
          return keys[i]})
        .attr('font-size','10');
    
    /************* RUNNING SUM LINE ****************/
    // Add group to show the running sum
    var lineLength = graphWidth + 5;

    var maxLine = svg.append("g")
      .data(data)
      .attr('class','maxline')
      .attr('transform',`translate(${margin.left},${margin.top+graphHeight})`)
    
    // Add a circle to the running sum group
    maxLine.append('circle')
      .attr('r', '4')
      .attr('fill', 'blue')
      .attr('cx', lineLength)

    // Add and animate text of the current running sum
    maxLine.append("text")
      .classed('maxvalue', true)
      .attr('font-weight', '600')   
      .attr('font-size','14')
      .attr('transform',`translate(${0},${-4})`)
      .style('fill','blue')
    .transition().delay((d,i,n) => (n.length)*50).duration(keys.length*550)
      .tween("text", function(d) {
        console.log(maxValue)
        var i = d3.interpolate(this.textContent,maxValue);
        return function(t) {
            running_sum = Math.round(i(t))
            if (running_sum < 100000000){
              return this.textContent = format(running_sum);
            }
            return this.textContent = formatTotal(running_sum);
        };
      })

    // Add and animate line of the current running sum
    maxLine.append('line')
      .attr('x1',0)
      .attr('x2',lineLength)
      .attr('y1',0)
      .attr('y2',0)
      .attr('stroke', '#e5e5e5')
      .attr('stroke-width','0.5')
      .style('stroke-dasharray',`${0},${lineLength}`)
    .transition().delay(1500).duration(1500)
      .style('stroke','#777777')
      .style('stroke-width','1')
      .style('stroke-dasharray',`${lineLength},${lineLength}`)
      .style('stroke','blue')
    
    // Animate the movement of the running sum group
    maxLine.transition().delay((d,i,n) => (n.length)*50).duration(keys.length*550)
      .attr('transform',`translate(${margin.left},${y(maxValue)+margin.top})`)

    /************* TOOLTIP ****************/
    var tooltip = svg.append("g")
      .data(data)
      .attr("class", "tooltip")
      .style("display", "none");
        
    tooltip.append("rect")
      .attr("width", 150)
      .attr("x", -60)
      .attr("y", -20)
      .attr("height", 50)
      .attr("fill", "white")
      .attr("stroke","#ff4301")
      .attr("stroke-width","0.5")
      .style("opacity", 0.9);
    
    tooltip.append("text")
      .classed("source", true)
      .attr("x", 15)
      .attr("dy", "0em")
      .style("text-anchor", "middle")
      .attr("font-size", "10px")
      .attr("font-weight", "bold");  

    tooltip.append("text")
      .classed("value", true)
      .attr("x", 15)
      .attr("dy", "1.4em")
      .style("text-anchor", "middle")
      .attr("font-size", "14px");    
};
