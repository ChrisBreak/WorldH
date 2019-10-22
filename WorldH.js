//Stacked Chart
//Cristhian Sotelo
//October 20, 2019

//Global variables
let svg, width, height, countries, margin;
let factors = [
  {factor:"Dystopia Residual",color:"#4fdb2c"},
  {factor:"Trust Government",color:"#946025"},
  {factor:"Generosity",color:"#ff38af"},
  {factor:"Freedom",color:"#5c38ff"},
  {factor:"Life Expectancy",color:"#fff538"},
  {factor:"Family",color:"#69b3a2"},
  {factor:"GDP/Capita",color:"#f57b25"}];

//Create the graph after the window is loaded
window.onload = function(){
    setupChart();
}

//Initialize global variables
function initialize(data) {
  svg = d3.select("#vis");
  width = svg.attr("width");
  height = svg.attr("height");
  margin = {top: 60, right: 20, bottom: 90, left: 80};
  countries = [];
  for(var i = 0; i < data.length; i++) {
    countries.push(data[i].Country);
  }
  //console.log(countries);
}

function convertToNumber(data) {
  // Convert strings to numbers.
  data.forEach(function(d) {
    d.GDPPC = +d.GDPPC;
    d.Family = +d.Family;
    d.LifeExpectancy = +d.LifeExpectancy;
    d.Freedom = +d.Freedom;
    d.Generosity = +d.Generosity;
    d.DystopiaResidual = +d.DystopiaResidual;
    d.TrustGovernment = +d.TrustGovernment;
    d.HappinessScore = +d.HappinessScore;
  });
  //console.log(data);
  return data
}

function displayTooltip(country, bgDist, titleDist, titleText, valueDist, valueText) {
  svg.select(".tooltipBG")
    .attr("visibility", "visible")
    .attr('x', country-109)
    .attr('y', bgDist);
  svg.select(".tooltipTitle")
    .attr("visibility", "visible")
    .attr('x', country-103)
    .attr('y', titleDist)
    .text(titleText);
  svg.select(".tooltipValue")
    .attr("visibility", "visible")
    .attr('x', country-30)
    .attr('y', valueDist)
    .text(valueText);
}

function hideTooltip() {
  svg.select(".tooltipTitle")
    .attr("visibility", "hidden");
  svg.select(".tooltipBG")
    .attr("visibility", "hidden");
  svg.select(".tooltipValue")
    .attr("visibility", "hidden");
}


function setupChart(){
  d3.csv("WorldA2Data.csv").then((data) => {
    data = convertToNumber(data);
    data.sort(function(a, b){
      return a.Country > b.Country;
    });
    //console.log(data);
    initialize(data);

    // init x axis
    var x = d3.scaleBand()
      .domain(countries)
      .range([margin.left,width - margin.right]);

    // init y axis
    var y = d3.scaleLinear()
      .domain([0, 10])
      .rangeRound([height - margin.bottom, margin.top]);

    // add x axis to svg
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)      // This controls the position of the Axis
      .call(d3.axisBottom(x))
      .selectAll("text")
        .attr("transform", "translate(-10,10)rotate(-45)")
        .style("text-anchor", "end");

    // add y axis to svg
    svg.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft()
        .scale(y)
        .tickSize(-width))
      .attr("transform", `translate(${margin.left},0)`);

    // Y axis label
    svg.append("text")
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-90)")
      .attr("y", margin.left - 40)
      //.attr("x", -margin.bottom - 100)
      .attr("x", -height/3)
      .text("Happiness Score");

    // X axis label
    svg.append("text")
      .attr("text-anchor", "end")
      .attr("x", width/2 + margin.left)
      .attr("y", 30)
      .text("Country");

    /*
    svg.selectAll()
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (s) => x(s.Country)+7)
      .attr('y', (s) => y(s.HappinessScore))
      .attr('height', (s) => height - y(s.HappinessScore) - margin.bottom)
      .attr('width', x.bandwidth()-14);
      //.style("fill", "#69b3a2");*/

    // add GDP/Capita bars
    svg.selectAll()
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (s) => x(s.Country)+7)
      .attr('y', (s) => y(s.GDPPC))
      .attr('height', (s) => height - y(s.GDPPC) - margin.bottom)
      .attr('width', x.bandwidth()-14)
      .style("fill", "#f57b25")
      .on('mouseover', (s) => {
        let country = x(s.Country);
        let bgDist = y(s.GDPPC-0.2);
        let titleDist = y(s.GDPPC-0.45);
        let titleText = "GDP/Capita:";
        let valueDist = y(s.GDPPC-0.68);
        let valueText = s.GDPPC.toFixed(4);
        displayTooltip(country, bgDist, titleDist, titleText, valueDist, valueText);
      })
      .on('mouseout', (s) => {
        hideTooltip();
      });

    // add Family bars
    svg.selectAll()
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (s) => x(s.Country)+7)
      .attr('y', (s) => y(s.Family+s.GDPPC-0.01))
      .attr('height', (s) => height - y(s.Family) - margin.bottom)
      .attr('width', x.bandwidth()-14)
      .style("fill", "#69b3a2")
      .on('mouseover', (s) => {
        let country = x(s.Country);
        let bgDist = y(s.Family+s.GDPPC-0.2);
        let titleDist = y(s.Family+s.GDPPC-0.45);
        let titleText = "Family:";
        let valueDist = y(s.Family+s.GDPPC-0.68);
        let valueText = s.Family.toFixed(4);
        displayTooltip(country, bgDist, titleDist, titleText, valueDist, valueText);
      })
      .on('mouseout', (s) => {
        hideTooltip();
      });

    // add Life Expectancy bars
    svg.selectAll()
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (s) => x(s.Country)+7)
      .attr('y', (s) => y(s.LifeExpectancy+s.Family+s.GDPPC-0.015))
      .attr('height', (s) => height - y(s.LifeExpectancy) - margin.bottom)
      .attr('width', x.bandwidth()-14)
      .style("fill", "#fff538")
      .on('mouseover', (s) => {
        let country = x(s.Country);
        let bgDist = y(s.LifeExpectancy+s.Family+s.GDPPC-0.2);
        let titleDist = y(s.LifeExpectancy+s.Family+s.GDPPC-0.45);
        let titleText = "Life Expectancy:";
        let valueDist = y(s.LifeExpectancy+s.Family+s.GDPPC-0.68);
        let valueText = s.LifeExpectancy.toFixed(4);
        displayTooltip(country, bgDist, titleDist, titleText, valueDist, valueText);
      })
      .on('mouseout', (s) => {
        hideTooltip();
      });

    // add Freedom bars
    svg.selectAll()
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (s) => x(s.Country)+7)
      .attr('y', (s) => y(s.Freedom+s.LifeExpectancy+s.Family+s.GDPPC-0.02))
      .attr('height', (s) => height - y(s.Freedom) - margin.bottom)
      .attr('width', x.bandwidth()-14)
      .style("fill", "#5c38ff")
      .on('mouseover', (s) => {
        let country = x(s.Country);
        let bgDist = y(s.Freedom+s.LifeExpectancy+s.Family+s.GDPPC-0.2);
        let titleDist = y(s.Freedom+s.LifeExpectancy+s.Family+s.GDPPC-0.45);
        let titleText = "Freedom:";
        let valueDist = y(s.Freedom+s.LifeExpectancy+s.Family+s.GDPPC-0.68);
        let valueText = s.Freedom.toFixed(4);
        displayTooltip(country, bgDist, titleDist, titleText, valueDist, valueText);
      })
      .on('mouseout', (s) => {
        hideTooltip();
      });

    // add Generosity bars
    svg.selectAll()
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (s) => x(s.Country)+7)
      .attr('y', (s) => y(s.Generosity+s.Freedom+s.LifeExpectancy+s.Family+s.GDPPC-0.028))
      .attr('height', (s) => height - y(s.Generosity) - margin.bottom)
      .attr('width', x.bandwidth()-14)
      .style("fill", "#ff38af")
      .on('mouseover', (s) => {
        let country = x(s.Country);
        let bgDist = y(s.Generosity+s.Freedom+s.LifeExpectancy+s.Family+s.GDPPC-0.2);
        let titleDist = y(s.Generosity+s.Freedom+s.LifeExpectancy+s.Family+s.GDPPC-0.45);
        let titleText = "Generosity:";
        let valueDist = y(s.Generosity+s.Freedom+s.LifeExpectancy+s.Family+s.GDPPC-0.68);
        let valueText = s.Generosity.toFixed(4);
        displayTooltip(country, bgDist, titleDist, titleText, valueDist, valueText);
      })
      .on('mouseout', (s) => {
        hideTooltip();
      });

    // add Trust Government bars
    svg.selectAll()
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (s) => x(s.Country)+7)
      .attr('y', (s) => y(s.TrustGovernment+s.Generosity+s.Freedom+s.LifeExpectancy+s.Family+s.GDPPC-0.034))
      .attr('height', (s) => height - y(s.TrustGovernment) - margin.bottom)
      .attr('width', x.bandwidth()-14)
      .style("fill", "#946025")
      .on('mouseover', (s) => {
        let country = x(s.Country);
        let bgDist = y(s.TrustGovernment+s.Generosity+s.Freedom+s.LifeExpectancy+s.Family+s.GDPPC-0.2);
        let titleDist = y(s.TrustGovernment+s.Generosity+s.Freedom+s.LifeExpectancy+s.Family+s.GDPPC-0.45);
        let titleText = "Trust Government:";
        let valueDist = y(s.TrustGovernment+s.Generosity+s.Freedom+s.LifeExpectancy+s.Family+s.GDPPC-0.68);
        let valueText = s.TrustGovernment.toFixed(4);
        displayTooltip(country, bgDist, titleDist, titleText, valueDist, valueText);
      })
      .on('mouseout', (s) => {
        hideTooltip();
      });

    // add Dystopia Residual bars
    svg.selectAll()
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (s) => x(s.Country)+7)
      .attr('y', (s) => y(s.DystopiaResidual+s.TrustGovernment+s.Generosity+s.Freedom+s.LifeExpectancy+s.Family+s.GDPPC-0.04))
      .attr('height', (s) => height - y(s.DystopiaResidual) - margin.bottom)
      .attr('width', x.bandwidth()-14)
      .style("fill", "#4fdb2c")
      .on('mouseover', (s) => {
        let country = x(s.Country);
        let bgDist = y(s.DystopiaResidual+s.TrustGovernment+s.Generosity+s.Freedom+s.LifeExpectancy+s.Family+s.GDPPC-0.2);
        let titleDist = y(s.DystopiaResidual+s.TrustGovernment+s.Generosity+s.Freedom+s.LifeExpectancy+s.Family+s.GDPPC-0.45);
        let titleText = "Dystopia Residual:";
        let valueDist = y(s.DystopiaResidual+s.TrustGovernment+s.Generosity+s.Freedom+s.LifeExpectancy+s.Family+s.GDPPC-0.68);
        let valueText = s.DystopiaResidual.toFixed(4);
        displayTooltip(country, bgDist, titleDist, titleText, valueDist, valueText);
      })
      .on('mouseout', (s) => {
        hideTooltip();
      });

    // add legend white background
    svg.append('rect')
    .attr('x', width - 180)
    .attr('y', 0)
    .attr('height', 180)
    .attr('width', 180)
    .style("fill", "white");

    // add legend title
    svg.append("text")
      .attr("font-size", 13)
      .attr("x", width - 150)
      .attr("y", 18)
      .text("Factors:");

    // add legend colored squares
    svg.selectAll()
      .data(factors)
      .enter()
      .append('rect')
      .attr('x', width - 150)
      .attr('y', (d, i) => (i * 16) + 25)
      .attr('height', 12)
      .attr('width', 16)
      .style("fill", (f) => f.color);

    // add legend text
    svg.selectAll()
      .data(factors)
      .enter()
      .append('text')
      .attr("font-size", 11)
      .attr('x', width - 130)
      .attr('y', (d, i) => (i * 16) + 35)
      .text((f) => f.factor);

    // add tooltip background
    svg.append('rect')
      .attr("class", "tooltipBG")
      .attr("visibility", "hidden")
      .attr('x', 0)
      .attr('y', 0)
      .attr('height', 28)
      .attr('width', 115)
      .style("fill", "#555")

    // add tooltip title
    svg.append("text")
      .attr("class", "tooltipTitle")
      .attr("visibility", "hidden")
      .attr("x", 0)
      .attr("y", 0)
      .attr("font-size", 9)
      .style("fill", "white")
      .text("");

    // add tooltip value
    svg.append("text")
      .attr("class", "tooltipValue")
      .attr("visibility", "hidden")
      .attr("text-anchor", "end")
      .attr("x", 0)
      .attr("y", 0)
      .attr("font-size", 9)
      .style("fill", "white")
      .text("");

  });
}
