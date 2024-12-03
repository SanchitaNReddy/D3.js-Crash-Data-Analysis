 /*
NOTICE: "#region" and "#endregion" provide existing code and variables that will be used in the visualisation. Avoid modifying unless absolutely necessary!
*/

//// #region: load external resources
// load the legend function (ref:  https://github.com/yingyangvis )
const functionURL = "https://gist.githubusercontent.com/yingyangvis/7d10d41d9767e3f21c70cb7a4cb06d31/raw/d4b502f40e9cb6b4926d44002f0ee232f40cd303/colour_legend.js";
const response = await fetch(functionURL);
const blobObject = new Blob([(await response.text())], { type: "text/javascript" });
const legend = (await import(URL.createObjectURL(blobObject))).legend;

// load the roads hierarchy data
const hierarchyDataPath = "https://raw.githubusercontent.com/imdatavis/fit5147/39aca24d3e2e2d054b05945929758f524f7691e3/PE3_roads_hierarchy.json";
const treeData = await d3.json(hierarchyDataPath);
//// #endregion

//// #region: define a global variable to store the accident data with global access
// let accidentDataPointer = null;
//// #endregion

//// #region: define basic variables of the visualisation
// set the dimensions and margins of the diagram
const margin = { top: 20, right: 50, bottom: 40, left: 50 },
  width = 1150 - margin.left - margin.right,
  height = 800 - margin.top - margin.bottom;

// set the interval and length of the timeline
const interval = 50,
  length = 7 * interval;

// set the radius of nodes
const r = 30;

// append a svg object to the body of the page
const svg = d3.select("#canvas").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom),
  // append a group to the svg object to hold all the visualisation elements
  svgGroup = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
//// #endregion

//// #region: define the timeline
// create a scale for the timeline
const WeekDays = ["", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const timelineScale = d3.scalePoint()
  .domain(WeekDays)
  .range([0, length]);

// add the scale to an axis
const x_axis = d3.axisBottom()
  .scale(timelineScale)
  .tickSizeInner(-height);

// append a group element to the svg group and insert the axis object
svgGroup.append("g")
  .call(x_axis)
  .call(customiseAxis)
  .attr("transform", "translate(" + (width - length + r) + "," + height + ")");

// customise the axis
function customiseAxis(selection) {
  selection.selectAll(".tick text")
    .attr("transform", "translate(" + (-interval / 2) + ",0)")
    .attr("fill", "grey");
  selection.selectAll(".tick line")
    .attr("stroke-dasharray", "4,4")
    .attr("stroke", "#ccc");
  selection.selectAll(".domain")
    .attr("stroke", "#ccc");
}
//// #endregion

//// #region: process the hierarchy data for visualisation
// declare a tree layout and assign the size
const treemap = d3.tree()
  .size([height, width - length]);

//  assign the data to a hierarchy using parent-child relationships
let root = d3.hierarchy(treeData, d => d.children);

// map the hierarchy data to the tree layout
root = treemap(root);

// add the links between the nodes
const link = svgGroup.selectAll(".link")
  .data(root.descendants().slice(1))
  .join("path")
  .attr("class", "link")
  .attr("d", d =>
    "M" + d.y + "," + d.x
    + "C" + (d.y + d.parent.y) / 2 + "," + d.x
    + " " + (d.y + d.parent.y) / 2 + "," + d.parent.x
    + " " + d.parent.y + "," + d.parent.x
  );

// add each node as a group for the circle and label elements that you will add below
const node = svgGroup.selectAll(".node")
  .data(root.descendants())
  .join("g")
  .attr("transform", d => "translate(" + d.y + "," + d.x + ")");
//// #endregion

/*
ADD YOUR CODE HERE FOLLOWING THE INSTRUCTION
*/
// Add a shape/symbol to the node
// NOTE you can add visual variables to the node if needed. You can also use internal_node and leaf_node classes if they make sense in your design.
node.append("ellipse")
.attr("class", d => d.children ? "internal_node" : "leaf_node")
.attr("rx", d => d.depth === 0 ? 40 : 30) // horizontal radius
.attr("ry", d => d.depth === 0 ? 30 : 20); // vertical radius

/*
ADD YOUR CODE HERE FOLLOWING THE INSTRUCTION
*/
// add the label to the node
node.append("text")
  .attr("class", "label")
  .attr("text-anchor", "middle") // Anchor the text to the middle
  .attr("dy", ".35em") // Adjust vertical alignment
  .text(d => d.data.name);

node.filter(d => !d.children)
  .append("text")
  .attr("class", "label")
  .attr("text-anchor", "middle")
  .attr("dy", ".35em")
  .text(d => d.data.Year);

// the path of the accident data
const accidentDataPath = "https://raw.githubusercontent.com/imdatavis/fit5147/39aca24d3e2e2d054b05945929758f524f7691e3/PE3_accident_data.csv";

/*
ADD YOUR CODE HERE FOLLOWING THE INSTRUCTION
*/
// read the accident data from the path

// Capturing the CSV file that was previously read
const accidentData = await d3.csv(accidentDataPath);

/*
ADD YOUR CODE HERE FOLLOWING THE INSTRUCTION
*/
// keep a reference to the accident data in accidentDataPointer variable

// Creating a pointer to access the data
const accidentDataPointer = accidentData;

// Hover and highlighting pointers:
// function for tooltip position
function calculateTooltipPosition(activity) {

  // Fetch the viewport width and height
  const width_view = window.innerWidth;
  const height_view = window.innerHeight;

  // Fetching the dimensions of the tooltip container
  const tool_text_Width = d3.select("#tooltip-container").node().offsetWidth;
  const tool_text_Height = d3.select("#tooltip-container").node().offsetHeight;

  // Calculating the initial position of the tooltip container based on the mouse coordinates
  let left_placement = activity.pageX + 10; 
  let top_placement = activity.pageY + 10; 

  // Adjusting the position of the container if it overflows
  if (left_placement + tool_text_Width > width_view) {
      // Move tooltip to the left
      left_placement = width_view - tool_text_Width - 40; 
  }

  if (top_placement + tool_text_Height > height_view) {
    top_placement = height_view - tool_text_Height; 
  }

  return {
      top: top_placement,
      left: left_placement
  };
}

// Hover the mouse on the leaf nodes to show the year and total number of accidents of that year and speed zone on the tooltip, 
// you can use the css rule of tooltip defined in the style sheet in this file.
const tooltip = d3.select("#tooltip-container")


// Identify the leaf nodes and add functionalities
node.filter(d => d.children)
    .each(function (leafData) {
        // For the current hovering
        const leaf_node = d3.select(this);

        // Taking count of children nodes
        const countOfChildren = leafData.children.length;

        // Mouse active on leaf nodes
        leaf_node.on("mouseenter", function (activity) {
            // Dimentions of the screen
            const { top, left } = calculateTooltipPosition(activity)

            // Tooltip information
            tooltip.transition()
                .style("display", "inline")
                .style("left", left + "px")
                .style("top", top + "px")
                .style("opacity", 0.9);
            
            tooltip.html(
              `<p id="tooltip-text">Number of Children Nodes: ${countOfChildren}</p>`
            );

            // Highlight the node
            leaf_node.attr("class", "node-highlighted")
        }).on("mouseleave", function () {
            // Deselect the node
            tooltip.transition()
                .style("opacity", 0)
                .style("display", "none");

            leaf_node.attr("class", "notpicked_node");
        });
    });

// Capture all nodes
var all_nodes = node.filter(d => !d.children)

// Filter for leaf nodes
node.filter(d => !d.children)
    .each(function (leafData) {
      // Fetch the current node
      var leaf_node = d3.select(this)

      // Filter for each node - speed zones and year
      var selectedSpeedZone = leafData.parent.data.name
      var selectedYear = leafData.data.Year

      // The accident count for the year
      var Yearaccidents = accidentDataPointer.filter(data =>
        data.SpeedZone === selectedSpeedZone && data.Year === selectedYear
        ).map(d => +d.AccidentCount)

      // Aggregating
      var aggYearaccidents = Yearaccidents.reduce((acc, curr) => {return acc + curr}, 0);

      // Hover on leaf nodes
      leaf_node.on("mouseenter", function (activity) {
        // Fetch the viewport width and height
        const { top, left } = calculateTooltipPosition(activity)

        // Display the tooltip with relevant information
        tooltip.transition()
          .style("display", "inline")
          .style("left", left + "px")
          .style("top", top + "px")
          .style("opacity", 0.7);

        tooltip.html(
          `<p id="tooltip-text">Speed Zone: ${selectedSpeedZone}</p>` +
          `<p id="tooltip-text">Year: ${selectedYear}</p>` +
          `<p id="tooltip-text"># Accidents: ${aggYearaccidents}</p>`
        );

        // Highlight the node
        d3.select(this)
          .attr("class", "node-highlighted")

        // Filter other nodes
        var nonleafNodes = [];
        const yearSelected = d3.select(this)._groups[0]
        nonleafNodes.push(all_nodes.filter(function () { return this.__data__.data.Year !== leaf_node.node().__data__.data.Year }))

        // Links that are focused/highlighted
        var focus_links = [];
        focus_links.push(link.filter(function () {
          if (this.__data__.data.Year === leaf_node.node().__data__.data.Year) {
            return this
          } 
          else if (this.__data__.parent.data.name === leaf_node.node().__data__.parent.parent.data.name) {
            return this
          }
        // Apply transparency to other nodes
        nonleafNodes[0]._groups[0].forEach(function (activity) {
          activity.classList.add("timeline-bar-transparent")
        })
        }))

        // Apply css to highlighted links
        focus_links[0]._groups[0].forEach(function (activity) {
          activity.classList.add("link-highlighted")
        })
      }).on("mouseleave", function () {
        // deselecting the node
        tooltip.transition()
          .style("display", "none")
          .style("opacity", 0);
        
        // going back to original highlights
        d3.select(this)
          .attr("class", "notpicked_node");

        // Remove transparency from other nodes
        var nonleafNodes = []
        const yearSelected = d3.select(this)._groups[0]
        nonleafNodes.push(all_nodes.filter(function () { return this.__data__.data.Year !== leaf_node.node().__data__.data.Year }))
        nonleafNodes[0]._groups[0].forEach(function (activity) {
          activity.classList.remove("timeline-bar-transparent")
        })

        // Remove highlight from links
        var focus_links = []
        focus_links.push(link.filter(() => {
            if (this.__data__.data.Year === leaf_node.node().__data__.data.Year) {
              return this
            } 
            else if (this.__data__.parent.data.name === leaf_node.node().__data__.parent.parent.data.name) {
              return this
            }
        }))
        focus_links[0]._groups[0].forEach( function (activity) {
          activity.classList.remove("link-highlighted")
        })
      })
  });

    // Hover the mouse on the non-leaf nodes to show the number of their children on the tooltip, highlight the node with an outline or fill. 
// Identifying all nodes other than leaf
node.filter(d => d.children && d.parent)
    .each(function (data) {

      // Fetching the current node
      var selectedNode = d3.select(this);

      selectedNode.on("mouseenter", function (item) {

          // Indentifying links for hover operation 
          var focus_Links = []

          focus_Links.push(link.filter(function (link_activity) {
              // Capturing the link if it matches the hover
              if (this.__data__.data.name === selectedNode.node().__data__.data.name) {
                  return this;
              }
              // Capturing the link of the parent node matches the hover
              else if (this.__data__.parent.data.name === selectedNode.node().__data__.data.name) {
                  return this;
              }
          }))

          // Applying the CSS to highlight the link
          focus_Links[0]._groups[0].forEach(function (event) {
              event.classList.add("link-highlighted")
          })

          // Applying the transparency on all the other nodes which are not highlighted
          all_nodes.filter(function () {
              return this.__data__.parent.data.name !== selectedNode.node().__data__.data.name;
          }).attr("class", "timeline-bar-transparent");

        }).on("mouseleave", function () {

          // Removing the transparency CSS applied on the node
          all_nodes.filter(function () {
              return this.__data__.parent.data.name !== selectedNode.node().__data__.data.name;
          }).attr("class", "timeline-bar-highlighted");

          // going back to original highlights
          d3.select(this)
            .attr("class", "notpicked_node");

          // Removing the highlight CSS on the links
          var focus_Links = []

          focus_Links.push(link.filter(function () {
              // Capturing the link if it matches the hover
              if (this.__data__.data.name === selectedNode.node().__data__.data.name) {
                  return this;
              }
              // Capturing the link of the parent node matches the hover
              else if (this.__data__.parent.data.name === selectedNode.node().__data__.data.name) {
                  return this;
              }
          }))

          // Removing the highlight from the link
          focus_Links[0]._groups[0].forEach(function (activity) {
            activity.classList.remove("link-highlighted");
          })

          // Removing the tooltip container
          tooltip.transition()
            .attr("display", "none")
            .style("opacity", 0);

      });
    })

/*
ADD YOUR CODE HERE FOLLOWING THE INSTRUCTION
*/
// Calculate the data range for the accident data
let accident_min = Infinity;
let accident_max = 0;

accidentDataPointer.forEach(data => {
    accident_min = Math.min(accident_min, +data.AccidentCount);
    accident_max = Math.max(accident_max, +data.AccidentCount);
});

/*
ADD YOUR CODE HERE FOLLOWING THE INSTRUCTION
*/
// Mapping the data value to scalar range

// Define a scale to map accident count to a scalar range
const accidentCountScale = d3.scaleLinear()
    .domain([accident_min, accident_max])
    .range([0, 1]);

// Define the color scale for the timeline bar
const colorScale = d3.scaleSequential(d3.interpolateSinebow);

/*
ADD YOUR CODE HERE FOLLOWING THE INSTRUCTION
*/
// draw the colour legend

// Define parameters for the legend
const legendParams = {
    color: d3.scaleSequential([0, 1], colorScale),
    title: "Accident Count",
    ticks: 0,
    width: 400,
    height: 70,
    marginTop: margin.top + 20,
    marginLeft: margin.left
};

// Draw the color legend
legend(legendParams);

// Mapping the bars for days of the week
node.filter(d => !d.children)
  .each(function (leafData) {
    // the chosen node
    var leaf_node = d3.select(this);
    //slicing the days introduced
    WeekDays.slice(1).forEach((day, i) => {
      //identifying the positions
      const xPosition = parseFloat(timelineScale(day))
      //count of accidents for each node
      var selectedYear = leafData.data.Year
      var selectedSpeedZone = leafData.parent.data.name
      var dayaccidents = accidentDataPointer.filter(data => data.SpeedZone == selectedSpeedZone && data.DayofWeek == day && data.Year == selectedYear)[0].AccidentCount

      //Appending the bar
      var bar = leaf_node.append("line")
        .attr("x1", xPosition - interval / 2.5)
        .attr("y1", 0)
        .attr("x2", xPosition + interval - 40)
        .attr("y2", 0)
        .style("stroke", function() {
          return colorScale(accidentCountScale(dayaccidents));
        })
        .attr("stroke-width", 10);
        

      //hovering function
      bar.on("mouseenter", function (activity) {
        activity.stopPropagation();

        //using view port
        const { top, left } = calculateTooltipPosition(activity);

        // tooltip display
        tooltip.transition()
          .style("opacity", 0.7)
          .style("display", "inline");

        //displaying the content
        tooltip.html(
          `<p id="tooltip-text">Year: ${selectedYear}</p>` +
          `<p id="tooltip-text">Speed Zone: ${selectedSpeedZone}</p>` +
          `<p id="tooltip-text">Day: ${day}</p>` +
          `<p id="tooltip-text"># Accidents: ${dayaccidents}</p>`
        )
          .style("left", left + "px")
          .style("top", top + "px");

        //highlighting the bars
        d3.select(this)
          .attr("class", "timeline-bar-highlighted");
      }).on("mouseout", function () {
        tooltip.transition()
          .style("opacity", 0);
        d3.select(this)
          .attr("class", "bar-not-highlighted");
      });
    });
  });
