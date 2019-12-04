let width, clickedCountries;
let height = 1200;
let bColours =  ["#ff00bf", "#ff842b", "#589428", "#d32655",
                "#727275"];
let mColours = ["#efed37", "#ff8e0f", "#f2080d"];

let buttons = [{label: "Scatterplot", class: "compare"},
                {label: "Development Status", class: "dev-status"},
                {label: "Happiness Score", class: "happy"},
                {label: "Cost of Living Index", class: "livindex"},
                {label: "Reset", class: "reset"}];

var legend, hoverData, legendTitle;
var nullColour = '#ffffff';
var nullLabel = ["No Data"];
var HappyLabel = ["Happy"];
var Unhappy = ["Unhappy"];
var ExpensiveLabel = ["Expensive"];
var CheapLabel = ["Cheap"];

var prevColours;

window.onload = function() {

width = document.body.clientWidth;
clickedCountries = [];
prevColours = [];

var nullC = ["AFG", "ATA", "BLZ", "BEN","BMU","BTN","BOL","BIH","BRN","BFA","BDI","CMR","CAF","TCD","CUB","COD","DJI","TLS","GNQ",
            "ERI","FLK","FJI","GUF","ATF","GAB","GMB","GRL","GIN","GNB","GUY","HTI","HND","CIV","KGZ","LAO","LSO","LBR","LBY","MDG",
            "MWI","MLI","MRT","MDA","MNE","MAR","MMR","NCL","NIC","NER","PRK","OMN",'PNG',"PRI","SRB","COG","SEN","SLE","SLB","SOM",
            "KOR","SSD","SDN","SUR","SWZ","SYR","TWN","TJK","BHS","TGO","TTO","TKM","TZA","VUT","VNM","PSE","ESH","YEM"];

  let svg = d3.select("svg")
    .attr('width', width)
    .attr('height', height)
        .style("background-color","#7d9dd7");


  var projection = d3.geoMercator().translate([width/2.1, height-(height/3)]).scale(width/11);
  var path = d3.geoPath().projection(projection);
  var g = svg.append('g');

  var bigText = g.append('text')
      .attr('x', 20)
      .attr('y', 50);

  var bigText1 = g.append('text')
      .attr('x', 20)
      .attr('y', 100);

  var mapLayer = g.append('g')
      .classed('map-layer', true);

  var colorScale = d3.scaleThreshold()
      .domain([100000, 1000000, 10000000, 30000000, 100000000, 500000000])
      .range(d3.schemeGreens[7]);

  var tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

  var instructRect = d3.select("body").append("div")
      .attr("class", "instructDiv")
      .html("Click on the countries you want to compare" + "<br />" + "and hit the Scatterplot button below to fire" +
          "<br />" + " a new vis, or click on " +
          "the other buttons" + "<br />" + "and see how the map changes")
      .style('top', 800+'px')
      .style('left', 20+'px');

  var data = d3.map();

  var dev = ["Developed", "Developing", "Underdeveloped"];

  const colorDevelop = d3.scaleThreshold()
        .domain(["Developed", "Developing", "Underdeveloped"]) //3 Colours
        .range(["#ffffff","#efed37", "#ff8e0f", "#f2080d"]);

    const colorHappy = d3.scaleThreshold()
      .domain([3 , 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5]) //10 Colours
      .range(['#250000', '#3d100a', '#542210', '#5f3d0f', '#206500', '#267d0a', '#2c9513', '#2fae19', '#2fc81c', '#27e319', '#00ff00']);

  const colorLiving = d3.scaleThreshold()
      .domain([20 , 30, 40, 50, 60, 70, 80, 90, 100, 110, 120]) //12 Colours
      .range(['#ffffb9', '#ffe490', '#ffc773', '#ffa85f',
          '#f78c53', '#ea7049', '#da5640', '#c63d35',
          '#b02628', '#961017', '#7a0000']);

  // load data
  var worldmap = d3.json("Geo-Data.geojson");

  Promise.all([worldmap]).then(function (values) {

    document.getElementById("searchForm").onsubmit = search;

    svg.selectAll('.button')
      .data(buttons)
      .enter()
      .append('rect')
        .attr('class', d => 'button-'+d.class)
        .attr('x', 30)
        .attr('y', (d, i) => {
          return (i*50) + 800;
        })
        .attr('height', 40)
        .attr('width', 210)
        .attr('rx', 6)
        .attr('ry', 6)
        .style("stroke", "black")
        .style("stroke-width", 2)
        .style('cursor', 'pointer')
        .style("fill", (d, i) => {
          return bColours[i];
        } )
        .on("mouseover", (d) => {
          svg.select('.button-'+d.class)
            .style('opacity', 1.0)
        })
        .on("mouseleave", (d) => {
          svg.select('.button-'+d.class)
            .style('opacity', 1.0);
        })
        .on('click', (d, i) => {
          filterMap(d, i);
        });

    svg.selectAll('.button')
      .data(buttons)
      .enter()
      .append('text')
        .attr('x', 40)
        .attr('y', (d, i) => {
          return (i*50) + 825;
        })
        .attr("font-size", '22px')
        .style("font-weight", "bold")
        .style('cursor', 'pointer')
        .text(d => d.label)
        .on("mouseover", (d) => {
          svg.select('.button-'+d.class)
            .style('opacity', 1.0)
        })
        .on("mouseleave", (d) => {
          svg.select('.button-'+d.class)
            .style('opacity', 1.0);
        })
        .on('click', (d, i) => {
          filterMap(d, i);
        });

    function countryName(d) {
        return d && d.properties ? d.properties.name : null;
    }

    function continentName(d) {
        return d && d.properties ? d.properties.continent : null;
    }

    function developmentStatus(d) {
        return d && d.properties ? d.properties.developStatus : null;
    }

    function mouseOver(d) {
        d3.select(this)
          .transition()
          .duration(200)
          .style("opacity", 1)
          .style('stroke-width', 3.5);

        addText(countryName(d), continentName(d));

        var happy = +d.properties.happiness;
        var living = +d.properties.livingIndex;
        let happy1, living1;

        if(happy == 0)
            happy1 = "No Data"
        else
            happy1 = happy.toFixed(2)

        if(living == 0)
            living1 = "No Data"
        else
            living1 = living.toFixed(2)


        tooltip.transition()
          .duration(100)
          .style("opacity", 0.9);

        tooltip.html(d.properties.name +  "<br />" + "Cost of Living Index: " + living1 +
              "<br />" + "Happiness Score: " +  happy1)
          .style("left", (d3.event.pageX) + "px")
          .style("font-size", "17px")
          .style("font-weight", "bold")
          .style("top", (d3.event.pageY - 28) + "px");
    }


    function mouseLeave() {
        svg.selectAll('path')
            .transition()
            .duration(200)
            .style("opacity", (d) => {
              if (clickedCountries.includes(d.id)) return 1.0;
              return 0.6;
            })
            .style('stroke-width', 0.5);
      //Clear province name
      bigText.text('');
      bigText1.text('');
     //remove tooltip
      tooltip.transition()
        .duration(200)
        .style("opacity", 0);
    }


    function clicked(d, i){
        if (clickedCountries.includes(d.id)) {
          d3.select(this)
              .style("fill", () => {
                return prevColours[clickedCountries.indexOf(d.id)];
              })
              .style("opacity", 0.6)
              .style('stroke-width', 0.5);
          var i = clickedCountries.indexOf(d.id);
          clickedCountries.splice(i, 1);
          prevColours.splice(i, 1);
        }
        else {
            if(nullC.includes(d.id))
                alert("Not enough data from this country for the scatterplot");
            else {
                prevColours.push(d3.select(this).style('fill'));
                d3.select(this)
                    .style("fill", "#ff00bf")
                    .style("opacity", 1.0).style('stroke', '#000000').style('stroke-width', 3);
                clickedCountries.push(d.id);
            }
        }
    }

    function search(e) {
      e.preventDefault();
      let countryName = document.getElementById("countryN").value.toLowerCase();
      let d = svg.selectAll('path')
        .filter((d) => {
          return d.properties.name.toLowerCase() === countryName;
        }).data();
      let dPath = svg.selectAll('path')
        .filter((d) => {
          return d.properties.name.toLowerCase() === countryName;
        });
            if (d.length > 0) {
                d = d[0];
                svg.select('.continent-'+d.id)
                  .transition()
                  .duration(200)
                  .style("opacity", 1)
                  .style('stroke-width', 3.5);
            }
    }

    // draw map
    svg.selectAll("path")
      .data(values[0])
      .enter()
      .append("path")
        .attr("class", d => "continent-" + d.id)
        .attr("d", path)
        .attr("fill", function (d) {
          if (developmentStatus(d) == "Developed") {
            d3.select(this).classed("Developed", true)
          }
          if (developmentStatus(d) == "Developing") {
            d3.select(this).classed("Developing", true)
          }
          if (developmentStatus(d) == "Underdeveloped") {
            d3.select(this).classed("Underdeveloped", true)
          }

        })
        .on("mouseover", mouseOver)
        .on("mouseleave", mouseLeave)
        .on("click", clicked)
        .style("stroke", "black")
        .style("stroke-width", 0.5)
        .style("opacity", 0.6);

    d3.selectAll('path').style('fill', bColours[4]);

    function filterMap(button, index) {
      if (button.class !== "compare") {
        d3.selectAll('path').style('fill', bColours[4]).style('opacity', 0.6).style("stroke-width", 0.5);
        clickedCountries = [];
        prevColours = [];
      }
      if (button.class === "dev-status") {
        svg.selectAll('.Developed').style('fill', mColours[0]);
        svg.selectAll('.Developing').style('fill', mColours[1]);
        svg.selectAll('.Underdeveloped').style('fill', mColours[2]);
      }

      else if (button.class === "happy") {
        d3.selectAll("path").style('fill', (d) => {
           if(d.properties.happiness == 0)
               return nullColour;
            else
               return colorHappy(d.properties.happiness);
        });
      }
      else if (button.class === "livindex") {
        d3.selectAll("path").style('fill', function (d) {
            if(d.properties.livingIndex == 0)
                return nullColour;
            else
                return colorLiving(d.properties.livingIndex);
        });
      }

      else if(button.class === "compare"){
        showScatterplot(clickedCountries);
      }
    }

    function addText(text, text1) {
        bigText
            .style('font-family', "Arial")
            .classed('bigText', true)
            .text(text);

        bigText1
            .style('font-family', "Arial")
            .classed('bigText', true)
            .text(text1);
    }


      // draw legend Happiness
    var legend = svg.selectAll(".legend")
        .data(colorHappy.domain())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(-120," + i * 26 + ")"; });

    // draw legend colored rectangles
    legend.append("rect")
        .attr("x", width - 58)
        .attr("y", 450)
        .attr("width", 24)
        .attr("height", 24)
        .style("fill", colorHappy);

    // draw legend text
    legend.append("text").attr("class", "text1")
        .attr("x", width)
        .attr("y", 458)
        .attr("dy", ".65em")
        .style("text-anchor", "end")
        .text(function(d) { return d;})

    // draw legend Cost living index
    var legend1 = svg.selectAll(".legend1")
        .data(colorLiving.domain())
        .enter().append("g")
        .attr("class", "legend1")
        .attr("transform", function(d, i) { return "translate(-120," + i * 26 + ")"; });

    // draw legend colored rectangles
    legend1.append("rect")
        .attr("x", width - 58)
        .attr("y", 50)
        .attr("width", 24)
        .attr("height", 24)
        .style("fill", colorLiving);

    // draw legend text
    legend1.append("text").attr("class", "text1")
        .attr("x", width)
        .attr("y", 64)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { return d;})


      //legend title cost of living
    var legendTitle = g.append("text").attr("class", "text2")
        .attr("x", width - 70)
        .attr("y", 16)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text("Cost of Living Index");

      //legend title happiness
    var legendTitle1 = g.append("text").attr("class", "text2")
        .attr("x", width - 80)
        .attr("y", 420)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text("Happiness Score");

      // draw legend Develop Status
      var legend = svg.selectAll(".legend2")
          .data(dev)
          .enter().append("g")
          .attr("class", "legend2")
          .attr("transform", function(d, i) { return "translate(-120," + i * 26 + ")"; });

      // draw legend colored rectangles
      legend.append("rect")
          .attr("x", width - 58)
          .attr("y", 820)
          .attr("width", 24)
          .attr("height", 24)
          .style("fill", colorDevelop);

      // draw legend text
      legend.append("text").attr("class", "text1")
          .attr("x", width - 68)
          .attr("y", 828)
          .attr("dy", ".65em")
          .style("text-anchor", "end")
          .text(function(d) { return d;})

      var legendTags = svg.selectAll(".legendTag")
          .data(Unhappy)
          .enter().append("g")
          .attr("class", "legendTag")
          .attr("transform", function(d, i) { return "translate(-120," + i * 26 + ")"; });

      var legendTags1 = svg.selectAll(".legendTag1")
          .data(HappyLabel)
          .enter().append("g")
          .attr("class", "legendTag")
          .attr("transform", function(d, i) { return "translate(-120," + i * 26 + ")"; });

      var legendTags2 = svg.selectAll(".legendTag2")
          .data(CheapLabel)
          .enter().append("g")
          .attr("class", "legendTag")
          .attr("transform", function(d, i) { return "translate(-120," + i * 26 + ")"; });

      var legendTags3 = svg.selectAll(".legendTag3")
          .data(ExpensiveLabel)
          .enter().append("g")
          .attr("class", "legendTag")
          .attr("transform", function(d, i) { return "translate(-120," + i * 26 + ")"; });

      legendTags2.append("text").attr("class", "text1")
          .attr("x", width - 65)
          .attr("y", 58)
          .attr("dy", ".65em")
          .style("text-anchor", "end")
          .text(function(d) { return d;})

      legendTags3.append("text").attr("class", "text1")
          .attr("x", width - 65)
          .attr("y", 317)
          .attr("dy", ".65em")
          .style("text-anchor", "end")
          .text(function(d) { return d;})


      legendTags1.append("text").attr("class", "text1")
          .attr("x", width - 65)
          .attr("y", 690)
          .attr("dy", ".65em")
          .style("text-anchor", "end")
          .text(function(d) { return d;})


      legendTags.append("text").attr("class", "text1")
          .attr("x", width - 65)
          .attr("y", 458)
          .attr("dy", ".65em")
          .style("text-anchor", "end")
          .text(function(d) { return d;})

      //legend title Develop Status
      var legendTitle2 = g.append("text").attr("class", "text2")
          .attr("x", width - 100)
          .attr("y", 790)
          .attr("dy", ".35em")
          .style("text-anchor", "end")
          .text("Develop Status");

      var legendNull = svg.selectAll(".legendNull")
          .data(nullLabel)
          .enter().append("g")
          .attr("class", "legendNull")
          .attr("transform", function(d) { return "translate(-120," + 26 + ")"; });

      var legendNull2 = legendNull;

      // draw legend colored rectangles
      legendNull.append("rect")
          .attr("x", width - 58)
          .attr("y", 686)
          .attr("width", 24)
          .attr("height", 24)
          .style("fill", nullColour);

      // draw legend text
      legendNull.append("text").attr("class", "text1")
          .attr("x", width - 64)
          .attr("y", 696)
          .attr("dy", ".65em")
          .style("text-anchor", "end")
          .text(function(d) { return d;})

      // draw legend colored rectangles
      legendNull2.append("rect")
          .attr("x", width - 58)
          .attr("y", 312)
          .attr("width", 24)
          .attr("height", 24)
          .style("fill", nullColour);

      // draw legend text
      legendNull2.append("text").attr("class", "text1")
          .attr("x", width - 64)
          .attr("y", 320)
          .attr("dy", ".65em")
          .style("text-anchor", "end")
          .text(function(d) { return d;})


      svg.append('g')
          .attr('class', 'scatter')
          .style('visibility', 'hidden')
          .append('rect')
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', width)
          .attr('height', height)
          .style('fill', 'black')
          .style('opacity', 0.8);

    });
}
