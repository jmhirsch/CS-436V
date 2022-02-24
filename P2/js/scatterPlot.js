class ScatterPlot {

  constructor(_config, _data, _gender) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 770,
      containerHeight: 290,
      margin: {top: 15, right: 15, bottom: 40, left: 40},
      tooltipPadding: 15
    }
    this.data = _data
    this.gender = _gender
    this.initVis();
  }

  initVis() {
    let vis = this;

    // Calculate inner chart size. Margin specifies the space around the actual chart.
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    vis.xScale = d3.scaleLinear()
        .range([0, vis.width - 30]);

    vis.yScale = d3.scaleLinear()
        .range([vis.height, 30]);

    vis.xAxis = d3.axisBottom(vis.xScale)
        .tickSizeOuter(20)
        .tickSize(-vis.height)
        .tickPadding(8)
        .ticks(6);


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
          .on('click', () => {
              clearSelectedID();
          });

    vis.chart = vis.svg.append('g')
        .attr('class', 'chart')
        .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top +10})`);

     

    vis.xAxisG = vis.chart.append('g')
        .attr('class', 'axis x-axis plot-x-axis plot-axis')
        .attr('transform', `translate(0,${vis.height})`);

    vis.yAxisG = vis.chart.append('g')
        .attr('class', 'axis y-axis plot-y-axis plot-axis');


    vis.svg.append('text')
        .attr('class', 'axis-title')
        .attr('x', 0)
        .attr('y', 1)
        .attr('dx', '.2em')
        .attr('dy', '1.4em')
        .text('Age')

    vis.svg.append('text')
        .attr('class', 'axis-title')
        .attr('x', vis.width)
        .style('text-anchor', 'end')
        .attr('y', vis.height)
        .attr('dx', '3.2em')
        .attr('dy', '1em')
        .text('GDP Per Capita (US$)')
  }

  updateVis() {
    let vis = this;
    vis.format = d3.format(".0f");


    vis.yValue = (d) => d.start_age;
    vis.xValue = (d) => d.pcgdp;

    vis.localData = vis.data.filter(d=> d.pcgdp !== null && d.pcgdp !== 0);
    vis.localData = Array.from(vis.localData);
    
    vis.xScale.domain([0, d3.max(vis.localData, vis.xValue)]).nice();
    vis.yScale.domain(d3.extent(vis.localData, vis.yValue)).nice();

    vis.renderVis();
  }

  renderVis() {
    let vis = this;

    vis.chart.selectAll('.point')
        .data(vis.localData)
        .join('circle')
        .attr('class', 'point')
        .attr('cx', d=> vis.xScale(vis.xValue(d)) + 5)
        .attr('cy', d=> vis.yScale(vis.yValue(d)))
        .attr('active', d=>selectedIDs.includes(d))
        .attr('fill', d=> selectedIDs.includes(d)? '#f1c813': '#5c5b71')
        .attr('fill-opacity', d=> {
            if (vis.genderMatches(d, vis.gender)) {
                return '70%'
            }
            return '20%'
        })
        .attr('stroke-width', 0.3)
        .on('click', function (event, d) {
          const isActive = isSelected(d);
          if (!isActive){
              addDataToList(d)
              //console.log(selectedIDs);
          } else{
              removeDataFromList(d)
          }
          
          event.stopPropagation();
    })
        .on('mouseover', function (event, d) {
            let elem = d3.select(this);
            
        if (vis.genderMatches(d, vis.gender)) {
            elem.attr('stroke-width', 1.2);
            let pcgdp = d.pcgdp === 0 || d.pcgdp === null? d.pcgdp = 'No Info': d.pcgdp;
            d3.select('#tooltip')
                .style('display', 'block')
                .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')
                .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
                .html(`
              <div class="tooltip-title">${d.leader}</div>
              <div><i>${d.country}, ${d.start_year} - ${d.end_year}</i></div>
              <ul>
                <li>Age at inauguration: ${d.start_age}</li>
                <li>Time in office: ${d.duration} years</li>
                <li>GDP/capita: ${vis.format(pcgdp)}</li>
              </ul>
            `);
        }
        })
        .on('mouseleave', function (event, d) {
          d3.select('#tooltip').style('display', 'none');
          d3.select(this).attr('stroke-width', 0.3);
        });
    
    vis.yAxisG.call(vis.yAxis);
    vis.xAxisG.call(vis.xAxis);
  }

  genderMatches(d, currGender) {
      return currGender === 'all' || d.gender === currGender;
  }
}