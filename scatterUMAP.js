d3.csv("Doc_Embeddings_with_PCA_and_UMAP.csv", function (error, data) {
  if (error) throw error;
  // Define the sizes and margins for our canvas.
  var margin = { top: 20, right: 20, bottom: 30, left: 40 },
    width = window.innerWidth * 0.70 - margin.left - margin.right,
    height = window.innerHeight * 0.45 - margin.top - margin.bottom;

  // Cast my values as numbers and determine ranges.
  var minmax = { UMAP1: { min: 0, max: 0 }, UMAP2: { min: 0, max: 0 } };
  data.forEach(function (d) {
    d.UMAP1 = +d.UMAP1;
    d.UMAP2 = +d.UMAP2;
    minmax.UMAP1.min = Math.min(d.UMAP1, minmax.UMAP1.min);
    minmax.UMAP1.max = Math.max(d.UMAP1, minmax.UMAP1.max);
    minmax.UMAP2.min = Math.min(d.UMAP2, minmax.UMAP2.min);
    minmax.UMAP2.max = Math.max(d.UMAP2, minmax.UMAP2.max);
  });

  // Set-up my x scale.
  var x = d3.scale
    .linear()
    .range([0, width])
    .domain([Math.floor(minmax.UMAP1.min), Math.ceil(minmax.UMAP1.max)]);

  // Set-up my y scale.
  var y = d3.scale
    .linear()
    .range([height, 0])
    .domain([4, Math.ceil(minmax.UMAP2.max)]);

  // Create my x-axis using my scale.
  var xAxis = d3.svg.axis().scale(x).orient("bottom");

  // Create my y-axis using my scale.
  var yAxis = d3.svg.axis().scale(y).orient("left");

  // Set-up my colours/groups.
  var color = d3.scale.ordinal().range(["#ff595e", "#6a994e"]);
  var groups = {};
  data.forEach(function (d) {
    groups[d.contains_answer] = d.contains_answer;
  });

  // Create my tooltip creating function.
  var tip = d3
    .tip()
    .attr("class", "d3-tip")
    .offset([-10, 0])
    .html(function (d) {
      if (d.question) {
        return "<strong> QUESTION:" + d.question + "</strong>";
      } else if (d.answer) {
        return "<strong> ANSWER:" + d.answer + "</strong>";
      }
      return (
        "<strong>" +
        d.document +
        "</strong> (page=" +
        parseInt(d.page + 1) +
        ")"
      );
    });

  // Actually create my canvas.
  var svg = d3
    .select("body")
    .append("svg")
    .attr("width", width + margin.left + margin.right + 30)
    .attr("height", height + margin.top + margin.bottom)
    .attr("display", "block")
    .attr("padding", "100")
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Initialize my tooltip.
  svg.call(tip);

  // Draw my x-axis.
  svg
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + y(+4) + ")")
    .call(xAxis)
    .append("text")
    .attr("class", "label")
    .attr("x", width)
    .attr("y", -6)
    .style("text-anchor", "end")
    .text("UMAP1");

  // Draw my y-axis.
  svg
    .append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(" + x(0) + ",0)")
    .call(yAxis)
    .append("text")
    .attr("class", "label")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("UMAP2");

  // Filter out regular data points (non-questions and non-answers)
  var regularData = data.filter(function (d) {
    return !d.question && !d.answer;
  });

  // Create separate selections for questions and answers
  var questions = svg
    .selectAll(".question")
    .data(
      data.filter(function (d) {
        return d.question;
      })
    )
    .enter()
    .append("polygon") // Use polygon for questions
    .attr("class", "question")
    .attr("points", function (d) {
      // Define points for the triangle
      var x1 = x(d.UMAP1),
        y1 = y(d.UMAP2);
      return (
        x1 -
        7 +
        "," +
        (y1 + 7) +
        " " +
        (x1 + 7) +
        "," +
        (y1 + 7) +
        " " +
        x1 +
        "," +
        (y1 - 7)
      );
    })
    .style("fill", "#6a4c93") // Set color for questions
    .on("mouseover", tip.show)
    .on("mouseout", tip.hide);

  var answers = svg
    .selectAll(".answer")
    .data(
      data.filter(function (d) {
        return d.answer;
      })
    )
    .enter()
    .append("polygon") // Use polygon for answers
    .attr("class", "answer")
    .attr("points", function (d) {
      // Define points for the triangle
      var x1 = x(d.UMAP1),
        y1 = y(d.UMAP2);
      return (
        x1 -
        7 +
        "," +
        (y1 + 7) +
        " " +
        (x1 + 7) +
        "," +
        (y1 + 7) +
        " " +
        x1 +
        "," +
        (y1 - 7)
      );
    })
    .style("fill", "#1982c4") // Set color for answers
    .on("mouseover", tip.show)
    .on("mouseout", tip.hide);

  // Create all the data points :-D.
  svg
    .selectAll(".dot")
    .data(regularData)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("r", function(d){
      return (d.contains_answer == "True")? 5 : 2;
    })
    .attr("cx", function (d) {
      return x(d.UMAP1);
    })
    .attr("cy", function (d) {
      return y(d.UMAP2);
    })
    .style("stroke", function (d) {
      if (d.question) {
        return "#6a4c93";
      } else if (d.answer) {
        return "#1982c4";
      } else return color(groups[d.contains_answer]);
    })
    .style("fill", function (d) {
      if (d.question) {
        return "#6a4c93";
      } else if (d.answer) {
        return "#1982c4";
      } else return color(groups[d.contains_answer]);
    })
    .on("mouseover", tip.show)
    .on("mouseout", tip.hide);

  // Create the container for the legend if it doesn't already exist.
  var legend = svg
    .selectAll(".legend")
    .data(color.domain().concat(["Question", "Answer"])) // Add "Question" and "Answer" to the legend data
    .enter()
    .append("g")
    .attr("class", "legend")
    .attr("transform", function (d, i) {
      return "translate(0," + i * 20 + ")";
    });

  // Draw the coloured rectangles for the legend.
  legend
    .append("rect")
    .attr("x", width - 18)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", function (d) {
      // Set color for "Question" and "Answer"
      return d === "Question"
        ? "#6a4c93"
        : d === "Answer"
        ? "#1982c4"
        : color(d);
    });

  // Draw the labels for the legend.
  legend
    .append("text")
    .attr("x", width + 6) // Add the width of the square (18) plus some padding (6)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "start") // Change text-anchor to start
    .text(function (d) {
      return d;
    });

  // Define the title text
  var titleText = "UMAP - 2D";

  // Append the title to the SVG
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", 0)
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .style("text-decoration", "underline")
    .text(titleText);
});
