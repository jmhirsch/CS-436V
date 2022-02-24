class BarChart {

  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 230,
      containerHeight: 290,
      margin: {top: 15, right: 15, bottom: 20, left: 40}
    }
    this.data = _data
    this.initVis();
  }

  initVis() {
    let vis = this;

    // Calculate inner chart size. Margin specifies the space around the actual chart.
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    vis.xScale = d3.scaleBand()
        .range([10, vis.width])
        .paddingInner(0.1);

    vis.yScale = d3.scaleLinear()
        .range([vis.height, 30]);

    vis.xAxis = d3.axisBottom(vis.xScale)
        .tickSizeOuter(0)
        .tickSize(0)
        .tickPadding(8);


    vis.yAxis = d3.axisLeft(vis.yScale)
        .tickSize(-vis.width)
        .ticks(6)
        .tickSizeOuter(0);

    vis.svg = d3.select(vis.config.parentElement).append('svg')
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);

    vis.border = vis.svg.append('rect')
        .attr('x', 0)
        .attr('class', 'border')
        .attr('y', vis.config.margin.top - 10)
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight - 5)


    vis.chart = vis.svg.append('g')
        .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    vis.xAxisG = vis.chart.append('g')
        .attr('class', 'axis x-axis bar-x-axis bar-axis')
        .attr('transform', `translate(0,${vis.height})`);

    vis.yAxisG = vis.chart.append('g')
        .attr('class', 'axis y-axis bar-y-axis bar-axis');


    vis.svg.append('text')
        .attr('class', 'axis-title')
        .attr('x', 0)
        .attr('y', 1)
        .attr('dx', '.2em')
        .attr('dy', '1.4em')
        .text('Gender')
  }

  updateVis() {
    let vis = this;


    vis.yValue = (d) => d.count;
    vis.xValue = (d) => d.gender;

    vis.localData = d3.rollups(vis.data,  d=>d.length, d=>d.gender);
    vis.localData = Array.from(vis.localData, ([gender, count]) => ({gender, count}))

    vis.xScale.domain(vis.localData.map(vis.xValue));
    vis.yScale.domain([0, d3.max(vis.localData, vis.yValue)]).nice();

    vis.renderVis();
  }

  renderVis() {
    let vis = this;

    vis.chart.selectAll('.bar')
        .data(vis.localData, vis.xValue)
        .join('rect')
        .attr('class', 'bar')
        .attr('fill', '#aeaeca')
        .attr('x', d=>vis.xScale(vis.xValue(d)))
        .attr('width', vis.xScale.bandwidth())
        .attr('height', d=> vis.height - vis.yScale(vis.yValue(d)))
        .attr('stroke-width', 0)
        .attr('y', d=> vis.yScale(vis.yValue(d)))
        .attr('active', false)
        .on('mouseover', function(event, d) {
          d3.select(this).attr('stroke-width', 1.5);
        })
        .on('mouseleave', function(event, d) {
          d3.select(this).attr('stroke-width', 0);
        })
        .on('click', function(event, d) {
          const isActive = d3.select(this).classed('active');

          let bars = d3.selectAll('.bar');
          bars.attr('fill', '#aeaeca');
          bars.classed('active', false);
          

          d3.select(this).classed('active', !isActive);
          if (d3.select(this).classed('active')) {
            d3.select(this).attr('fill', '#6c6b86')
            updateGender(d.gender);
          }else{
            updateGender('all');
          }
        });


    vis.yAxisG.call(vis.yAxis);
    vis.xAxisG.call(vis.xAxis);
  }
}