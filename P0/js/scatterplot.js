class Scatterplot {
    constructor(data, config){
        this.colname = config.colname;
        this.rowname = config.rowname;
        this.svg = config.svg;
        this.height = config.height;
        this.width = config.width;
        this.parent = config.parent;
        this.margin = {top: 15, bottom: 15, left: 50, right: 50};
        this.data = data;
        this.initVis();
    }

    initVis(){
        let vis = this;
        //widthM and heightM = width & height cropped by the margin amount
        vis.widthM = vis.width - vis.margin.left - vis.margin.right;
        vis.heightM = vis.height - vis.margin.top - vis.margin.bottom;

        // add a little bit of spacing between the end of the scale & the right svg margin
        vis.xScale = d3.scaleLinear()
            .range([0, vis.widthM -8]);

        vis.yScale = d3.scaleBand()
            .range([0, vis.heightM]);

        // draw ticks that are the height of the chart minus the margin
        vis.xAxis = d3.axisBottom(vis.xScale)
            .ticks(6)
            .tickPadding(5)
            .tickSize(vis.heightM*-1 + vis.margin.top);

        // no ticks
        vis.yAxis = d3.axisLeft(vis.yScale)
            .tickPadding(10)
            .tickSize(0);

        vis.svg = d3.select(vis.parent)
            .attr('width', vis.width)
            .attr('height', vis.height);

        vis.chart = vis.svg.append('g')
            .attr('transform', `translate(${vis.margin.left},${vis.margin.top})`);

        vis.xAxisGroup = vis.chart.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0, ${vis.heightM})`);

        vis.yAxisGroup = vis.chart.append('g')
            .attr('class', 'axis y-axis')
            .attr('transform', `translate(0, 8)`);
    }

    updateVis(){
        let vis = this;
        vis.updateData();

        vis.xValue = (d) => d.accuracy;
        vis.yValue = (d) => `Trial ${d.trial}`

        //use nice to attempt to draw the first and last tick, esp. 0.0
        vis.xScale.domain([d3.min(vis.data, vis.xValue), d3.max(vis.data, vis.xValue)]).nice();
        vis.yScale.domain(vis.data.map(vis.yValue));
        vis.renderVis();
    }

    updateData(){
        let vis = this;
        // build an array of arrays which contains the averages for each trial.
        vis.averages = d3.rollups(vis.data, mean=> Math.round(d3.mean(mean, d=>d.accuracy) * 100)/100, d=>d.trial);
        // grab the number of trials based on the size of the array
        vis.numTrials = vis.averages.length;
        // Convert each inner element of the array into objects containing a trial number and its associated average
        vis.averages = Array.from(vis.averages, ([trial, mean]) => ({trial, mean}));
        // offset calculated based on the number of trials
        vis.offset = (vis.height/vis.numTrials)/2
    }


    renderVis(){
        let vis = this;

        // draw each point based on the data contained in the dataset
        vis.chart.selectAll('.point')
            .data(vis.data)
            .enter()
            .append("circle")
            .attr('class', 'point')
            .attr('cx', d => vis.xScale(vis.xValue(d)))
            .attr('cy', d => vis.yScale(vis.yValue(d)) + vis.offset +4)

        //draw the text labels to place at the right of the chart
        vis.chart.selectAll('.means')
            .data(vis.averages)
            .enter()
            .append("text")
            .attr('class', 'means')
            .attr('x', vis.widthM)
            .attr('y', d => vis.yScale(vis.yValue(d)) + vis.offset +8)
            .text(d=> `${d.mean}`);

        // add a title for the mean accuracy
        vis.chart.append("text")
            .attr('id', 'avgLabel')
            .attr('x', vis.width - vis.margin.right)
            .attr('y', vis.margin.top - 8)
            .text("Accuracy (mean)");

        // make the ticks 50% opaque to make them appear lighter
        // displays both x & y axis
        // The domain of each axis is hidden in style.css
        vis.xAxisGroup.call(vis.xAxis).selectAll(".tick").attr("opacity", "0.5");
        vis.yAxisGroup.call(vis.yAxis);
    }
}