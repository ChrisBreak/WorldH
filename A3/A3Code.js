let svg, color, fertilityById, path, tooltip, zoomed = false, width, height, cdata, clickedCode = "XXX", clickedCountry = "";

//this function makes all the tooltip components visible with the information passed
function showTooltip(country, lifeF, lifeM) {

  tooltip.html(country+'<br>'+'Life Expectancy:<br>'+'F: '+lifeF+'  M:'+lifeM)
    .style('visibility', 'visible')
    .style('left', (d3.event.pageX+8) + 'px')
    .style('top', (d3.event.pageY+8) + 'px')
    .style('width', () => {
      if ((country.length * 6) < 100) {
        return 100+'px';
      }
      return country.length * 6 + 'px';
    });
}

function hideTooltip() {
  tooltip.style('visibility', 'hidden');
}

//this function enlarges the country when dot is clicked
function performInteraction(id, country, area) {

  //calculate size to enlarge country according to its surface area
  let countryFeat = cdata.features.filter(d => d.properties.name === country);
  let coordinates, scale = 200;
  if (area < 100000) scale = 1700;
  else if (area < 300000) scale = 1300;
  else if (area < 400000) scale = 850;
  else if (area < 600000) scale = 650;
  else if (area < 800000) scale = 300;

  //find country coordinates to center country on screen
  if (countryFeat[0].geometry.type === "MultiPolygon") {
    coordinates = countryFeat[0].geometry.coordinates;
    coorIndex = Math.round(coordinates.length/2);
    if (id === "RUS") coorIndex = coorIndex+2;
    coordinates = getCoordinates(coordinates[coorIndex]);
  }
  else {
    coordinates = getCoordinates(countryFeat[0].geometry.coordinates);
  }

  let projection = d3.geoMercator()
      .scale(scale)
      .center(coordinates)
      .translate( [width/2, height/4.2]);

  let newPath = d3.geoPath().projection(projection);
  let countryName = country;
  if (country.includes(" ")) country = country.split(" ")[0];

  if (clickedCode === id) {
    zoomed = false;
    shrinkCountry(id);
    colorCountry(id, color(fertilityById[id]));
    clickedCode = "XXX";
    clickedCountry = "";
    showCountries();
    hideCountryTitle();
  }
  else if (clickedCode !== "XXX") {
    shrinkCountry(clickedCode);
    dimCountries();
    colorCountry(clickedCode, color(fertilityById[id]));
    svg.select('.COUNTRY-CODE-'+id)
      .style('fill', '#ff5900')
      .style('opacity', 0.8);
    colorCountry(id, '#ff5900');
    clickedCode = id;
    clickedCountry = country;
    expandCountry(id, newPath);
    showCountryTitle(countryName);
  }
  else {
    dimCountries();
    svg.select('.COUNTRY-CODE-'+id)
      .style('fill', '#ff5900')
      .style('opacity', 0.8);
    colorCountry(id, '#ff5900');
    clickedCode = id;
    clickedCountry = country;
    expandCountry(id, newPath);
    showCountryTitle(countryName);
    zoomed = true;
  }

}

function dimCountries() {
  svg.select('.countries').selectAll('path')
    .style('opacity', 0.2);
}

function showCountries() {
  svg.select('.countries').selectAll('path')
    .style('opacity', 0.8);
}

function expandCountry(id, newPath) {
  svg.selectAll('.countries')
    .selectAll('path')
    .sort( (d) => {
      if (d.id !== id) return -1;
      else return 1;
    });

  svg.select('.COUNTRY-CODE-'+id)
    .transition()
    .duration(2000)
    .attr('d', newPath);
}

function shrinkCountry(id) {
  svg.select('.COUNTRY-CODE-'+id)
    .transition()
    .duration(2000)
    .attr('d', path)
    .style('fill', color(fertilityById[id]));
}

function showCountryTitle(country) {
  svg.select('.country-title')
    .attr('visibility', 'visible')
    .text(country);
}

function hideCountryTitle() {
  svg.select('.country-title')
    .attr('visibility', 'hidden');
}

//get coordinates of country for centering on screen
function getCoordinates(d) {
  if (d[0].constructor === Array) {
    return getCoordinates(d[0]);
  }
  return d;
}

function colorCountry(id, color) {
  svg.select('.COUNTRY-CODE-'+id)
    .style('fill', color);
  svg.select('.COUNTRY-DOT-'+id)
    .style('fill', color);
}

window.onload = function() {

  const margin = {top: 20, right: 20, bottom: 20, left: 20};
  width = 1040 - margin.left - margin.right;
  height = 940 - margin.top - margin.bottom;

  color = d3.scaleThreshold()
      .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ])
      .range(['rgb(247,251,255)', 'rgb(222,235,247)', 'rgb(198,219,239)', 'rgb(158,202,225)', 'rgb(107,174,214)',
                'rgb(66,146,198)', 'rgb(33,113,181)', 'rgb(8,81,156)', 'rgb(8,48,107)', 'rgb(3,19,43)']);

  svg = d3.select('svg')
      .attr('width', width)
      .attr('height', height);

  const map = svg
      .append('g')
      .attr('class', 'map');

  const scatterplot = svg
      .append('g')
      .attr('class', 'scatterplot')
      .attr("transform", "translate(180,480)");

  const projection = d3.geoMercator()
      .scale(130)
      .translate( [width / 2, height / 1.5/2]);

  path = d3.geoPath().projection(projection);
  tooltip = d3.select('.tooltip');

  queue()
      .defer(d3.json, 'world_countries.json')
      .defer(d3.tsv, 'world_population.tsv')
      .defer(d3.csv, 'who.csv')
      .await(ready);

  function ready(error, data, population, who) {
    cdata = data;
    fertilityById = {};

        population.forEach(d => {
            var res = who.find(e => {
                return e.Country == d.name;
            });
            if(typeof res !== 'undefined') {
                res.id = d.id;
            }
        });

        who.forEach(d => { fertilityById[d.id] = +d['Total fertility rate (per woman)']; });
        data.features.forEach(d => { d.population = fertilityById[d.id] });

        svg.append('g')
        .attr('class', 'countries')
        .selectAll('path')
        .data(data.features)
        .enter().append('path')
                .attr("class", d => { return "COUNTRY-CODE-"+d.id;} )
        .attr('d', path)
        .style('fill', d => color(fertilityById[d.id]))
        .style('stroke', 'white')
        .style('opacity', 0.8)
        .style('stroke-width', 0.3)
        .on('mouseover',function(d) {
          var fem = who.filter(c => c.id === d.id);
          var male = who.filter(c => c.id === d.id);
          if (!zoomed) colorCountry(d.id, '#ff5900');
          showTooltip(d.properties.name, xValue(fem[0]), yValue(male[0]));
        })
        .on('mouseout', function(d){
          if (!zoomed) colorCountry(d.id, color(fertilityById[d.id]));
          hideTooltip();
        });

    svg.append('path')
        .datum(topojson.mesh(data.features, (a, b) => a.id !== b.id))
        .attr('class', 'names')
        .attr('d', path);

        // setup x
        var xValue = function(d) { return d["Life expectancy at birth (years) female"];}, // data -> value
            xScale = d3.scaleLinear().range([0, height/2-100]), // value -> display
            xMap = function(d) { return xScale(xValue(d));}, // data -> display
            xAxis = d3.axisBottom().scale(xScale);

        // setup y
        var yValue = function(d) { return d["Life expectancy at birth (years) male"];}, // data -> value
            yScale = d3.scaleLinear().range([height/2-120, 0]), // value -> display
            yMap = function(d) { return yScale(yValue(d));}, // data -> display
            yAxis = d3.axisLeft().scale(yScale);

        // don't want dots overlapping axis, so add in buffer to data domain
        xScale.domain([35, 90]);
        yScale.domain([35, 85]);

        // x-axis
        scatterplot.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + (height/2-120) + ")")
            .call(xAxis)
            .append("text")
              .attr("x", 100)
              .attr("y", 36)
              .style('font-size', '15px')
              .style("text-anchor", "start")
              .style('fill', 'black')
              .text("Female Life Expectancy");

        // y-axis
        scatterplot.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
              .attr("transform", "rotate(-90)")
              .attr("x", -60)
              .attr("y", -40)
              .style('font-size', '15px')
              .style("text-anchor", "end")
              .style('fill', 'black')
              .text("Male Life Expectancy");

        // draw dots
        scatterplot.selectAll(".dot")
            .data(who)
            .enter().append("circle")
            .attr("class", d => { return "dot COUNTRY-DOT-"+d.id; } )
            .attr("r", 3.5)
            .attr("cx", xMap)
            .attr("cy", yMap)
            .style("fill", function(d) { return color(fertilityById[d.id]);})
            .on("mouseover", function(d) {
              colorCountry(d.id, '#ff5900');
              showTooltip(d.Country, xValue(d), yValue(d));
            })
            .on("mouseout", function(d) {
              if (clickedCode !== d.id) colorCountry(d.id, color(fertilityById[d.id]));
              hideTooltip();
            })
            .on('click', (d) => {
              //console.log(d);
              performInteraction(d.id, d.Country, +d['Surface_area']);
            });

        //append country name to show when it is enlarged
        svg.append("text")
          .attr("class", "country-title")
          .attr("visibility", "hidden")
          .attr("font-size", 40)
          .style("font-weight", "bold")
          .style("fill", "#4d7f5a")
          .attr('x', (width/2)-40)
          .attr('y', 50)
          .attr('text-anchor', 'middle');

        svg.append("text")
          .attr("font-size", '15px')
          .style("fill", "black")
          .attr('x', (width-320))
          .attr('y', 560)
          .text('Total Fertility Rate / Woman');

        // draw legend
        var legend = scatterplot.selectAll(".legend")
            .data(color.domain())
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) { return "translate("+(i*20)+",50)"; });

        // draw legend colored rectangles
        legend.append("rect")
            .attr("x", width/2)
            .attr('y', 50)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", color);

        // draw legend text
        legend.append("text")
            .attr("x", width/2 + 6)
            .attr("y", 80)
            .attr("dy", ".35em")
            .style("text-anchor", "start")
            .text(function(d) { return d;})
    };
}
