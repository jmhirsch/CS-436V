/**
 * Load data from CSV file asynchronously and render charts
 */

let data, scatterplot, barchart, filteredData;

let selectedIDs = [];

d3.csv('data/leaderlist.csv').then(_data => {

  data = _data;
  // Convert columns to numerical values
  data.forEach(d => {
    Object.keys(d).forEach(attr => {
      if (attr == 'pcgdp') {
        d[attr] = (d[attr] == 'NA') ? null : +d[attr];
      } else if (attr != 'country' && attr != 'leader' && attr != 'gender') {
        d[attr] = +d[attr];
      }
    });
  });

  data.sort((a,b) => a.label - b.label);

  barchart = new BarChart({
    parentElement: '#bar-chart'
  }, data);


   scatterplot = new ScatterPlot({
    parentElement: '#scatter-plot'
  }, data, 'all');

   menuEventListener();

});


function menuEventListener() {
  let selected = document.getElementById("country-selector").value;
  updateData(selected);
}


function updateData(filter) {

  if (filter === 'G7'){
    filter = 'gseven';
  }else if (filter === 'G20 (without EU)'){
    filter = 'gtwenty';
  }

  filteredData = data.filter(d=>d[filter] === 1);
  barchart.data = filteredData;
  scatterplot.data = filteredData;
  barchart.updateVis();
  updateCharts();
}

function updateGender(gender){
  if (gender !== 'all'){
    selectedIDs = selectedIDs.filter(d=>d.gender === gender);
  }
  scatterplot.gender = gender;
  updateCharts();
}

function clearSelectedID(){
  selectedIDs = [];
  updateCharts();
}

function isSelected(d){
  return selectedIDs.includes(d);
}

function addDataToList(d){
  selectedIDs.push(d);
  updateCharts();
}

function removeDataFromList(d){
  let index = selectedIDs.indexOf(d);
  if (index >= 0) {
    selectedIDs.splice(index, 1);
  }
 updateCharts();
}

function updateCharts(){
  scatterplot.updateVis();
}
