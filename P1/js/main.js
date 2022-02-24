// Initialize helper function to convert date strings to date objects
const parseTime = d3.timeParse("%Y-%m-%d");

let timeline, data;

//Load data from CSV file asynchronously and render chart
d3.csv('data/disaster_costs.csv').then(_data => {
  data = _data;
  data.forEach(d => {
    d.cost = +d.cost;
    d.year = +d.year;
    d.date = parseTime(d.mid);
    // Optional: other data preprocessing steps
  });

  const radiusScaleExtent = d3.extent(data, d=>d.cost);

  timeline = new Timeline({
    parentElement: '#chart',
      radiusScaleExtent: radiusScaleExtent,
    // Optional: other configurations
  }, data);
  
  timeline.updateVis();
});


function filter(selectedCategories) {
    if (selectedCategories.length === 0){
      timeline.data = data;
    }else{
      timeline.data = data.filter(d => selectedCategories.includes(d.category));
    }

    timeline.updateVis();
}