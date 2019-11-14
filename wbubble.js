let bPoints = [{x:0, y:0}, {x:-5, y:15}, {x:5, y:25}, {x:0, y:40}];
var makeBallon = d3.line()
	.curve(d3.curveBasisClosed)
	.x(function(d) { return d.x })
  .y(function(d) { return d.y });

var makeString = d3.line()
	.curve(d3.curveBasis)
	.x(function(d) { return d.x })
  .y(function(d) { return d.y });


window.onload = function() {
	setupChart();
}

function setupChart(){
  d3.csv("world-data.csv").then((data) => {
		let svg = d3.select('svg');
		let width = document.body.clientWidth; // get width in pixels
		let height = +svg.attr('height');
		let centerX = width / 2;
		let centerY = height / 2;
		let strength = 0.05;
		let scaleColor = d3.scaleOrdinal(d3.schemeSet1);
		// use pack to calculate radius of the circles
		let pack = d3.pack()
			.size([width , height ])
			.padding(2);
		let forceCollide = d3.forceCollide(d => d.r + 1);
		// use the force
		let simulation = d3.forceSimulation()
			// .force('link', d3.forceLink().id(d => d.id))
			.force('charge', d3.forceManyBody())
			.force('collide', forceCollide)
			// .force('center', d3.forceCenter(centerX, centerY))
			.force('x', d3.forceX(centerX ).strength(strength))
			.force('y', d3.forceY(centerY ).strength(strength));

		let root = d3.hierarchy({ children: data })
			.sum(d => d.value);
		// we use pack() to automatically calculate radius conveniently only
		// and get only the leaves
		let nodes = pack(root).leaves().map(node => {
			//console.log('node:', node.x, (node.x - centerX) * 2);
			const data = node.data;
			return {
				x: centerX + (node.x - centerX) * 3, // magnify start position to have transition to center movement
				y: centerY + (node.y - centerY) * 3,
				r: 0, // for tweening
				radius: node.r, //original radius
				id: data.Continent + '.' + (data.Country),
				cat: data.Continent,
				name: data.Country,
				value: data.HappinessScore
			}
		});
		simulation.nodes(nodes).on('tick', ticked);
		svg.style('background-color', '#d2feff');
		let node = svg.selectAll('.node')
			.data(nodes)
			.enter().append('g')
			.attr('class', 'node')
			.call(d3.drag()
				.on('start', (d) => {
					if (!d3.event.active) simulation.alphaTarget(0.2).restart();
					d.fx = d.x;
					d.fy = d.y;
				})
				.on('drag', (d) => {
					d.fx = d3.event.x;
					d.fy = d3.event.y;
				})
				.on('end', (d) => {
					if (!d3.event.active) simulation.alphaTarget(0);
					d.fx = null;
					d.fy = null;
				}));

		node.append('path')
			.attr('d', makeString(bPoints))
			.attr('stroke', 'black')
			.attr('fill', 'none')
			.attr("transform", (d) => "translate(0," + (d.value * 6.5) + ")");

		node.append('path')
			.attr('d', (d) => {
				return makeBallon(
					[{x:(d.value * -8),y:(-d.value)},
					{x:0,y:(d.value * -10)},
					{x:(d.value * 8),y:(-d.value)},
					{x:0,y:(d.value * 11)}]);
			})
			.attr('fill', d => scaleColor(d.cat))
			.transition().duration(1700).ease(d3.easeElasticOut)
				.tween('circleIn', (d) => {
					let i = d3.interpolateNumber(0, d.value * 6.5);
					return (t) => {
						d.r = i(t);
						simulation.force('collide', forceCollide);
					}
				});

		node.append('text')
			.text(d => d.name)
			.attr('fill', (d) => {
				//console.log(scaleColor(d.cat));
				if (scaleColor(d.cat) == '#ffff33') {
					return '#5b646e';
				}
				return 'white';
			});

		node.append('title')
			.text(d => (d.name + '\n' + Number(d.value).toFixed(4)));
		let legendColors = d3.legendColor()
			.scale(scaleColor)
			.shape('circle');
		let legend = svg.append('g')
			.classed('legend-color', true)
			.attr('text-anchor', 'start')
			.attr('transform','translate(28,28)')
			.style('font-size','12px')
			.call(legendColors);
		let chartScale = d3.scaleOrdinal()
  			.domain(['Higher Happiness', 'Lower Happiness'])
  			.range([10, 5] );
		let legendSize = d3.legendSize()
			.scale(chartScale)
			.shape('circle')
			.shapePadding(10)
			.labelAlign('end');
		let legend2 = svg.append('g')
			.classed('legend-size', true)
			.attr('text-anchor', 'start')
			.attr('transform', 'translate('+(width-140)+', 20)')
			.style('font-size', '12px')
			.call(legendSize);

		function ticked() {
			node.attr('transform', d => `translate(${d.x},${d.y})`)
				.select('circle')
					.attr('r', d => {
						return d.r
					});
		}
	});
}
