(function () {

  // Margin convention
  const margin = { top: 30, right: 50, bottom: 50, left: 50 }
  const width = 600 - margin.left - margin.right
  const height = 425 - margin.top - margin.bottom

  const svg = d3.select("#chart").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")


  // Color scale based on price per unit
  const colorScale = d3.scaleLinear()
        .domain([157258,368287])
        .range(["#FF0000","#8F00FF"]) 

  // Set radius scale
  const radiusScale = d3.scaleSqrt()
    .domain([0, 1500000])
    .range([0, 100])

  // Define years
  const years = [2021]

  // Define x axis position
  const xPositionScale = d3.scalePoint()
    .domain(years)
    .range([140, width - 110])

  // Create tooltip
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "svg-tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden");
  
  // Force simulation and prevent overlap
  const forceX = d3.forceX(d => xPositionScale(d.year)).strength(1)
  const forceY = d3.forceY(150).strength(1)
  const forceCollide = d3.forceCollide((d => radiusScale(d.Size_SF) + 10))
  const simulation = d3.forceSimulation()
    .force("overlap", forceCollide)
    .force("y", forceY)
    .force("x", forceX)
    .force('charge', d3.forceManyBody().strength(-2250))

  d3.csv("2021_SF_industrial_leases_for_graphic.csv")
    .then(ready)
  function ready (datapoints) {
    datapoints.forEach(d => {
      d.x = xPositionScale(d.year);
      d.y = 0;
    })

  // Set position of circles
    svg.selectAll('circle')
      .data(datapoints)
      .join('circle')
      .attr("id", "circleBasicTooltip")
      .attr('r', d => radiusScale(d.Size_SF))
      .attr('cx', d => xPositionScale(d.year))
      .attr('fill', d => colorScale(d.Size_SF))
      .attr('cy', 200)
      .attr('stroke-width', 2)
      .attr("stroke", "black")

  // Trigger tooltip
    d3.selectAll("circle")
      .on("mouseover", function(e, d) {
        d3.select(this)
          .attr('stroke-width', '3')
          .attr("stroke", "black");
        tooltip
          .style("visibility", "visible")
          .attr('class','tooltipdiv')
          .html(`<h4><strong>${d.Tenant_Name}</strong></h4>` + 
                `<p><strong>Address</strong>: ${d.Address}<br />` +
                `<p><strong>City</strong>: ${d.City}<br />` +
                `<p><strong>Property Type</strong>: ${d.Property_Type}<br />` +
                `<p><strong>Business Park Name</strong>: ${d.Business_Park}<br />` +
                `<p><strong>Size SF</strong>: ${d.Size_SF}<br />` +
                `<p><strong>Lease Type</strong>: ${d.Lease_Type}<br />` +
                `<p><strong>Sign Date</strong>: ${d.Sign_Date}<br />` +
                `<p><strong>Submarket</strong>: ${d.Submarket}<br />`);
      })
      .on("mousemove", function(e) {
        tooltip
          .style("top", e.pageY - 10 + "px")
          .style("left", e.pageX + 10 + "px");
      })
      .on("mouseout", function() {
        d3.select(this).attr('stroke-width', 2);
          tooltip.style("visibility", "hidden");
    });


    simulation.nodes(datapoints)
      .on('tick', ticked)
    function ticked() {
      svg.selectAll('circle')
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)      
    }
  }
})();