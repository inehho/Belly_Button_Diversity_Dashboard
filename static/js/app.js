function buildMetadata(sample) {

  // @TODO: Complete the following function that builds the metadata panel

  // Use `d3.json` to fetch the metadata for a sample
  var url = `/metadata/${sample}`;
  d3.json(url).then(function (sample_data) {

    // Use d3 to select the panel with id of `#sample-metadata`
    var panel_sample = d3.select("#sample-metadata");
    // Use `.html("") to clear any existing metadata
    panel_sample.html("");
    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    Object.entries(sample_data).forEach(function ([key, value]) {
      panel_sample.append("h6").text(`${key}, ${value}`)
    });

    // BONUS: Build the Gauge Chart
    // buildGauge(data.WFREQ);
    //sample gauge code from
    //https://plot.ly/javascript/gauge-charts/ 
    var level = sample_data.WFREQ;
    // Trig to calc meter point
    var degrees = 180 - (level*20),
        radius = .7;
    var radians = degrees * Math.PI / 180;
    var x = radius * Math.cos(radians);
    var y = radius * Math.sin(radians);

    // Path: may have to change to create a better triangle
    var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
        pathX = String(x),
        space = ' ',
        pathY = String(y),
        pathEnd = ' Z';
    var path = mainPath.concat(pathX,space,pathY,pathEnd);  
    
    var data = [{ type: 'scatter',
        x: [0], y:[0],
        marker: {size: 28, color:'#ad05ad'},
        showlegend: false,
        name: 'wash frequency',
        text: level,
        hoverinfo: 'text+name'
    },
    {//number of pair in the values is the no of slices we want to have - 48/8 is its size; container 
      values: [48/8, 48/8, 48/8, 48/8, 48/8, 48/8, 48/8, 48/8, 48/8, 50],
      rotation: 90,
      text: ['8-9','7-8','6-7','5-6', '4-5', '3-4', '2-3',
             '1-2', '0-1',''],
      textinfo: 'text',
      textposition:'inside',
      marker: {colors:['#550384','#6028af','#7a0cce', '#8b07ef',
                          '#9907ef', '#b034f9','#cb34f9',
                          '#d25bf7','#eae0f8','rgba(255, 255, 255, 0)']},
      labels: ['8-9','7-8','6-7','5-6', '4-5', '3-4', '2-3',
      '1-2', '0-1',''],
      hoverinfo: 'label',
      hole: .5,
      type: 'pie',
      showlegend: false
 }];
  var layout = {
    shapes:[{
      type: 'path',
      path: path,
      margin: {t: 10},
      fillcolor: '#ad05ad',
      line: {
        color: '#ad05ad'
      }
    }],
  title: 'Belly Button Washing Frequency<br>(Scrubs per Week)',
  xaxis: {zeroline:false, showticklabels:false,
             showgrid: false, range: [-1, 1]},
  yaxis: {zeroline:false, showticklabels:false,
             showgrid: false, range: [-1, 1]}
    };

    Plotly.newPlot('gauge', data, layout);
  });
}

function buildCharts(sample) {

  var charts = "/samples/" + sample;
  d3.json(charts).then(function (chart_data) {
    // @TODO: Build a Bubble Chart using the sample data
    var bubblePlot = [{
      x: chart_data.otu_ids,
      y: chart_data.sample_values,
      text: chart_data.otu_labels,
      mode: "markers",
      marker: {
        size: chart_data.sample_values,
        color: chart_data.otu_ids,
        colorscale: "Viridis",
      }
    }];
    var bubbleLayout = {
      'title': "Relative Abundance of All Microbe Species by Operational Taxonomic Unit (OTU) ID Number",
      margin: {t: 100},
      hovermode: "closest",
      xaxis: {title: "OTU ID"},
      yaxis: {title: "Relative Abundance Value"}
    };
    Plotly.newPlot("bubble", bubblePlot, bubbleLayout)
    // @TODO: Build a Pie Chart
    // HINT: You will need to use slice() to grab the top 10 sample_values,
    // otu_ids, and labels (10 each).
    var pieData = [{
      values: chart_data.sample_values.slice(0,10),
      labels: chart_data.otu_ids.slice(0,10),
      hovertext: chart_data.otu_labels.slice(0,10),
      hoverinfo: 'label+percent',
      marker: {'colors': ["rgb(191, 128, 255)",
                          "rgb(153, 51, 255)",
                          "rgb(0, 134, 179)",
                          "rgb(102, 0, 255)",
                          "rgb(0, 179, 179)",
                          "rgb(0, 179, 179)",
                          "rgb(173, 133, 173)",
                          "rgb(254, 232, 90)",
                          "rgb(129, 180, 179)",
                          "rgb(215, 227, 85)"]},
      type: "pie"
    }];
    var pieLayout = {
      'title': "Top Ten Microbe Species by OTU ID Number",
      margin: {t: 100, l: 75, b: 100}
    };
    Plotly.newPlot("pie", pieData, pieLayout)
})}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample_name) => {
      selector
        .append("option")
        .text(sample_name)
        .property("value", sample_name);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();
