// Load static data
const data = d3.json("../data/flare.json").then(data => {
    // Convert to hierarchy
    root = d3.hierarchy(data)
        .sort((a, b) => d3.ascending(a.data.name, b.data.name));
    update(root);
})

// Create Margins and Dimensions
const viewportWidth = window.innerWidth;
const viewportHeight = window.innerHeight;
var margin = {top: viewportHeight*0.3, right: viewportWidth*0.1, bottom: viewportHeight*0.1, left: 0.1*viewportWidth};
var width = viewportWidth; // TRY: viewportWidth or enter a custom width
var height = viewportHeight; 

const graphWidth = viewportWidth - margin.left - margin.right;
const graphHeight = viewportHeight - margin.top - margin.bottom;
const legendPadding = 10;
const legendWidth = margin.right - legendPadding;
const radius = graphHeight < graphWidth ? graphHeight/2: graphWidth/2; // select radius based on smallest dimension

// Create and append svg to body
const svg = d3.select("body")
    .append('svg')
    .attr('width', '100%')
    .attr('height', '100%')
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMinYMin");

// Create graph group
const graph = svg.append('g')
    .attr('width', graphWidth)
    .attr('height', graphHeight)
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

// Add graph title
const title = svg.append('text')
    .attr('font-family', 'Helvetica')
    .attr('font-size','24')
    .attr('x', graphWidth/2 + margin.left)
    .attr('y', margin.top/3)
    .attr('font-weight', 'bold')
    .style('text-anchor', 'middle')
    .text('Flare Tree Radial Hierarchy Graph');

// Create tree group
const treeGroup = graph.append('g')

// Append group for links to svg
const links = treeGroup.append('g')
    .attr('fill', 'none')
    .attr('stroke', "#cdc9c3")
    .attr('stroke-opacity', 0.4)
    .attr('stroke-width', 1.5)

// Append end points
const nodes = treeGroup.append('g')

// Tree
tree = d3.tree()
    .size([2 * Math.PI, radius])
    .separation((a, b) => (a.parent == b.parent ? 1 : 2) / a.depth)

// Create names group
const names = treeGroup.append('g')

const t = svg.transition()
    .duration(750);

const update = root => {
    // Root
    var treeData = tree(root);

    links.selectAll("path").join(
        update => update 
        .call(update => update.transition().duration(500)
        .attr("stroke-dashoffset", function(d) { return d.totalLength})
        )
    )

    // Update links
    links.selectAll("path")
        .data(treeData.links())
        .join(
            enter => enter.append('path')
            .attr('d', d3.linkRadial()
                    .angle(d => d.x)
                    .radius(d => d.y))
            .each(function(d) { 
                d.totalLength, d._totalLength = this.getTotalLength();
                d.hidden = false })
            .attr("stroke-dasharray", function(d) { return d.totalLength + " " + d.totalLength})
            .attr("stroke-dashoffset", function(d) { return d.totalLength })
            .call(enter => enter.transition().duration(500)
                .attr('class', 'link')
                .attr("stroke-dashoffset", 0)),
            update => update
            // .call(update => update.transition().duration(500)
            .attr('d', d3.linkRadial()
                .angle(d => d.x)
                .radius(d => d.y))
            .each(function(d) { d.totalLength = this.getTotalLength(); })
            .attr("stroke-dasharray", function(d) { return d.totalLength + " " + d.totalLength})
            .each(function(d) { d._totalLength = this.getTotalLength(); })
            .call(update => update.transition().duration(500)
                .attr("stroke-dashoffset", function(d) { 
                    if (d.hidden) {
                        return d._totalLength;
                    } 
                    return 0;
                })),
            exit => exit
            .call(exit => exit.transition().duration(500)
                .attr("stroke-dashoffset", function(d) { return d.totalLength })
                .remove())
            );
                
    // Append end points
    circles = nodes.selectAll('circle')
        .data(treeData.descendants())
        .join(
            enter => enter.append('circle')
            .call(enter => enter.transition().duration(1000)
                .attr('class', 'node')
                .attr('transform', d => `
                rotate(${d.x * 180 / Math.PI - 90})     
                translate(${d.y},0)    
            `)
            .attr('fill', d => d.children ? "#A6192E" :  (d._children ? "#ffffff" : "#e8e8e8") )
            .attr('stroke', d => d.children ? "#ffffff" :  (d._children ? "#A6192E" : "#e8e8e8") )
            .attr('stroke-width', 1.5)
            .attr('r', 5)),
            update => update
            .call(update => update.transition().duration(1000)
                .attr('transform', d => `
                    rotate(${d.x * 180 / Math.PI - 90})     
                    translate(${d.y},0)    
                `)
                .attr('fill', d => d.children ? "#A6192E" : (d._children ? "#ffffff" : "#e8e8e8"))
                .attr('stroke', d => d.children ? "#ffffff" :  (d._children ? "#A6192E" : "#e8e8e8") )
                .attr('r', 5)),
            exit => exit
            .call(exit => exit.transition().duration(1000)
                .attr('transform', d => `
                    rotate(${d.x * 180 / Math.PI - 90})     
                    translate(${d.y},0)    
                `)
                .attr('r', 0)
                .remove())
            );
            

    // Interactivity on end points
    circles.on('click', function(event, d, i, n) {
            // console.log(root);
            click(d)
        });
    

    // Append names to points
    names.selectAll('text')
        .data(treeData.descendants())
        .join(
            enter => enter.append('text')
            .call(enter => enter.transition().duration(1000)
                .attr('class','text')
                .attr('font-family', 'sans-serif')
                .attr('font-size', 10)
                .attr('stroke-linejoin', 'round')
                .attr('stroke-width', 3)
                .attr('transform', d => `
                    rotate(${d.x * 180 / Math.PI - 90})
                    translate(${d.y},0)
                    rotate(${d.x >= Math.PI ? 180: 0})
                `)
                .attr('dy', "0.91em")
                .attr('text-anchor', d => d.x < Math.PI ? "start" : "end")
                .attr('y', d => d.y < Math.PI ? 7 : -7)
                .attr('x', d => d.x < Math.PI ? 10 : -10)
                .text(d => d.data.name)),
            // .clone(true).lower()
            //     .attr('stroke', 'white'),
            update => update
            .call(update => update.transition().duration(1000)
                .attr('transform', d => `
                    rotate(${d.x * 180 / Math.PI - 90})
                    translate(${d.y},0)
                    rotate(${d.x >= Math.PI ? 180: 0})
                `)
                .attr('dy', "0.91em")
                .attr('text-anchor', d => d.x < Math.PI ? "start" : "end")
                .attr('y', d => d.y < Math.PI ? 7 : -7)
                .attr('x', d => d.x < Math.PI ? 10 : -10)
                .text(d => d.data.name)),
            // .clone(true).lower()
            //     .attr('stroke', 'white'),
            exit => exit
            .call(exit => exit.transition().duration(1000)
                // .attr('transform', d => `
                //     rotate(${d.x * 180 / Math.PI - 90})
                //     translate(-${d.y},0)
                //     rotate(${d.x >= Math.PI ? 180: 0})
                // `)
                .attr('opacity', 0)
                .remove())
            );


    // Center treeGroup on graph
    treeGroup.attr('transform',`translate(${graphWidth/2},${graphHeight/2})`)
}

// Toggle children on click 
function click(d) {
    if (d.children) {
        d.hidden = true;
        d._children = d.children;
        d.children = null;
    } else {
        d.hidden = false;
        d.children = d._children;
        d._children = null;
    }
    update(root);
}