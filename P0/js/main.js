/**
 * Load data from CSV file asynchronously and visualize it
 */

d3.csv('data/experiment_data.csv')
  .then(data => {
      

  for (d of data) {
    d.trial = +d.trial;
    d.accuracy = +d.accuracy;
  }
  //sort the data by trial number and then by accuracy
   data.sort((a,b) => a.trial < b.trial? -1 : a.trial > b.trial? 1: a.accuracy > b.accuracy? 1: a.accuracy < b.accuracy? -1: 0);

  // grab the column names from the data
  const names = Object.getOwnPropertyNames(data[0]);

  let chart = new Scatterplot(data, {
      colname: names[0],
      rowname: names[1],
      parent: '#plot',
      height: 250,
      width: 500
    });
    chart.updateVis();
  })
  .catch(error => console.error(error));


