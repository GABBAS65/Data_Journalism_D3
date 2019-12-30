// selecting scatter plot
var width = parseInt(d3.select("#scatter").style("width"));

var height = width - width / 3.9;

var margin = 20;

var labelArea = 110;

var txtBotPad = 40;
var txtLeftPad = 40;

var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("class", "chart");

var radius_circle;
function circleRad() {
  if (width <= 530) {
    radius_circle = 5;
  }
  else {
    radius_circle = 10;
  }
}
circleRad();

svg.append("g").attr("class", "xText");
var xText = d3.select(".xText");

function cha() {
  xText.attr(
    "transform",
    "translate(" +
      ((width - labelArea) / 2 + labelArea) +
      ", " +
      (height - margin - txtBotPad) +
      ")"
  );
}
cha();
// Viewing results when clicking the 3 options in the X axis
// 1. Poverty
xText
  .append("text")
  .attr("y", -26)
  .attr("data-name", "poverty")
  .attr("data-axis", "x")
  .attr("class", "aText active x")
  .text("In Poverty (%)");
// 2. Age
xText
  .append("text")
  .attr("y", 0)
  .attr("data-name", "age")
  .attr("data-axis", "x")
  .attr("class", "aText inactive x")
  .text("Age (Median)");
// 3. Income
xText
  .append("text")
  .attr("y", 26)
  .attr("data-name", "income")
  .attr("data-axis", "x")
  .attr("class", "aText inactive x")
  .text("Household Income (Median)");

//  Left Axis
var leftTextX = margin + txtLeftPad;
var leftTextY = (height + labelArea) / 2 - labelArea;

// Viewing results for 3 options in Y axis

svg.append("g").attr("class", "yText");

var yText = d3.select(".yText");

function yTextRefresh() {
  yText.attr(
    "transform",
    "translate(" + leftTextX + ", " + leftTextY + ")rotate(-90)"
  );
}
yTextRefresh();

// 1. Obesity
yText
  .append("text")
  .attr("y", -26)
  .attr("data-name", "obesity")
  .attr("data-axis", "y")
  .attr("class", "aText active y")
  .text("Obese (%)");

// 2. Smokes
yText
  .append("text")
  .attr("x", 0)
  .attr("data-name", "smokes")
  .attr("data-axis", "y")
  .attr("class", "aText inactive y")
  .text("Smokes (%)");

// 3. Lacks Healthcare
yText
  .append("text")
  .attr("y", 26)
  .attr("data-name", "healthcare")
  .attr("data-axis", "y")
  .attr("class", "aText inactive y")
  .text("Lacks Healthcare (%)");

// import csv file using d3

d3.csv("assets/data/data.csv").then(function(data) {

  show(data);
});

function show(plotData) {

  var changeXaxis = "poverty";
  var changeYaxis = "obesity";

  var xMin;
  var xMax;
  var yMin;
  var yMax;

  var toolTip = d3
    .tip()
    .attr("class", "d3-tip")
    .offset([40, -60])
    .html(function(d) {
      console.log(d)
      var theX;
      var theState = "<div>" + d.state + "</div>";
      var theY = "<div>" + changeYaxis + ": " + d[changeYaxis] + "%</div>";
      if (changeXaxis === "poverty") {
        theX = "<div>" + changeXaxis + ": " + d[changeXaxis] + "%</div>";
      }
      else {
     
        theX = "<div>" +
          changeXaxis +
          ": " +
          parseFloat(d[changeXaxis]).toLocaleString("en") +
          "</div>";
      }
      return theState + theX + theY;
    });
  svg.call(toolTip);

  function xMinMax() {
    xMin = d3.min(plotData, function(d) {
      return parseFloat(d[changeXaxis]) * 0.90;
    });

    xMax = d3.max(plotData, function(d) {
      return parseFloat(d[changeXaxis]) * 1.10;
    });
  }

  function yMinMax() {
    yMin = d3.min(plotData, function(d) {
      return parseFloat(d[changeYaxis]) * 0.90;
    });

    yMax = d3.max(plotData, function(d) {
      return parseFloat(d[changeYaxis]) * 1.10;
    });
  }

  function labelChange(axis, clickedText) {
    d3
      .selectAll(".aText")
      .filter("." + axis)
      .filter(".active")
      .classed("active", false)
      .classed("inactive", true);

    clickedText.classed("inactive", false).classed("active", true);
  }

  // Instantiate the Scatter Plot
  xMinMax();
  yMinMax();

  var xScale = d3
    .scaleLinear()
    .domain([xMin, xMax])
    .range([margin + labelArea, width - margin]);
  var yScale = d3
    .scaleLinear()
    .domain([yMin, yMax])
    .range([height - margin - labelArea, margin]);

  var xAxis = d3.axisBottom(xScale);
  var yAxis = d3.axisLeft(yScale);

  function tickCount() {
    if (width <= 500) {
      xAxis.ticks(5);
      yAxis.ticks(5);
    }
    else {
      xAxis.ticks(10);
      yAxis.ticks(10);
    }
  }
  tickCount();

  svg
    .append("g")
    .call(xAxis)
    .attr("class", "xAxis")
    .attr("transform", "translate(0," + (height - margin - labelArea) + ")");
  svg
    .append("g")
    .call(yAxis)
    .attr("class", "yAxis")
    .attr("transform", "translate(" + (margin + labelArea) + ", 0)");

  var plotCircles = svg.selectAll("g plotCircles").data(plotData).enter();

  plotCircles
    .append("circle")
    .attr("cx", function(d) {
      return xScale(d[changeXaxis]);
    })
    .attr("cy", function(d) {
      return yScale(d[changeYaxis]);
    })
    .attr("r", radius_circle)
    .attr("class", function(d) {
      return "stateCircle " + d.abbr;
    })
    .on("mouseover", function(d) {
      toolTip.show(d, this);
      d3.select(this).style("stroke", "#323232");
    })
    .on("mouseout", function(d) {
      toolTip.hide(d);
      d3.select(this).style("stroke", "#e3e3e3");
    });
 
  plotCircles
    .append("text")
    .text(function(d) {
      return d.abbr;
    })
    .attr("dx", function(d) {
      return xScale(d[changeXaxis]);
    })
    .attr("dy", function(d) {

      return yScale(d[changeYaxis]) + radius_circle / 2.5;
    })
    .attr("font-size", radius_circle)
    .attr("class", "stateText")
    .on("mouseover", function(d) {
      toolTip.show(d);
      d3.select("." + d.abbr).style("stroke", "#323232");
    })
    .on("mouseout", function(d) {
      toolTip.hide(d);
      d3.select("." + d.abbr).style("stroke", "#e3e3e3");
    });

  d3.selectAll(".aText").on("click", function() {

    var self = d3.select(this);

    if (self.classed("inactive")) {
      var axis = self.attr("data-axis");
      var name = self.attr("data-name");

      if (axis === "x") {
        changeXaxis = name;

        xMinMax();

        xScale.domain([xMin, xMax]);

        svg.select(".xAxis").transition().duration(300).call(xAxis);

        d3.selectAll("circle").each(function() {

          d3
            .select(this)
            .transition()
            .attr("cx", function(d) {
              return xScale(d[changeXaxis]);
            })
            .duration(300);
        });

        d3.selectAll(".stateText").each(function() {
          d3
            .select(this)
            .transition()
            .attr("dx", function(d) {
              return xScale(d[changeXaxis]);
            })
            .duration(300);
        });

        labelChange(axis, self);
      }
      else {

        changeYaxis = name;

        yMinMax();

        yScale.domain([yMin, yMax]);

        svg.select(".yAxis").transition().duration(300).call(yAxis);

        d3.selectAll("circle").each(function() {

          d3
            .select(this)
            .transition()
            .attr("cy", function(d) {
              return yScale(d[changeYaxis]);
            })
            .duration(300);
        });

        d3.selectAll(".stateText").each(function() {
          d3
            .select(this)
            .transition()
            .attr("dy", function(d) {
              return yScale(d[changeYaxis]) + radius_circle / 3;
            })
            .duration(300);
        });

        labelChange(axis, self);
      }
    }
  });

  d3.select(window).on("resize", resize);

  function resize() {
    width = parseInt(d3.select("#scatter").style("width"));
    height = width - width / 3.9;
    leftTextY = (height + labelArea) / 2 - labelArea;

    svg.attr("width", width).attr("height", height);

    xScale.range([margin + labelArea, width - margin]);
    yScale.range([height - margin - labelArea, margin]);

    svg
      .select(".xAxis")
      .call(xAxis)
      .attr("transform", "translate(0," + (height - margin - labelArea) + ")");

    svg.select(".yAxis").call(yAxis);

    tickCount();

    cha();
    yTextRefresh();

    circleRad();

    d3
      .selectAll("circle")
      .attr("cy", function(d) {
        return yScale(d[changeYaxis]);
      })
      .attr("cx", function(d) {
        return xScale(d[changeXaxis]);
      })
      .attr("r", function() {
        return radius_circle;
      });

    d3
      .selectAll(".stateText")
      .attr("dy", function(d) {
        return yScale(d[changeYaxis]) + radius_circle / 3;
      })
      .attr("dx", function(d) {
        return xScale(d[changeXaxis]);
      })
      .attr("r", radius_circle / 3);
  }
}