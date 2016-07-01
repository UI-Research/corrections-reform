function mobileGrowth() {
    var margin = {
        top: 20,
        right: 15,
        bottom: 35,
        left: 60
    };

    var width = $mobilegrowth.width() - margin.left - margin.right,
        height = Math.ceil(width * 1) - margin.top - margin.bottom;
    
    $mobilegrowth.empty();

    var svg = d3.select("#mobilegrowth").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //line chart common elements
    var y = d3.scale.linear()
        .range([height, 0])
        .domain([0, 220000]);

    svg.append("text")
        .attr("class", "axistitle linesaxis")
        .attr("text-anchor", "start")
        .attr("x", -margin.left)
        .attr("y", -5)
        .text("Federal prison population");

    var yAxis = d3.svg.axis()
        .scale(y)
        .tickSize(-width)
        .ticks(5)
        .orient("left");

    var gy = svg.append("g")
        .attr("class", "y axis linesaxis")
        .call(yAxis);

    gy.selectAll("text")
        .attr("dx", -8);

    gy.selectAll("g").filter(function (d) {
            return d;
        })
        .classed("minor", true);

    // years axis used in first three charts
    // it zooms in on the second & third one to a different domain
    var x = d3.scale.linear()
        .range([0, width])
        .domain([1980, 2016]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .ticks(5)
        .tickFormat(function (d) {
            return d;
        })
        .orient("bottom");

    var gx = svg.append("g")
        .attr("class", "x axis-show axisyears")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    var LINEVARS = ["standing", "pop_total"];
    var LABELS = ["Federally sentenced population", "Total federal prison population"];
    
    data = data_main.growth;

    var line1 = d3.svg.line()
        .interpolate("cardinal")
        .defined(function (d) {
            return d.number != null & d.number > 0;
        })
        .x(function (d) {
            return x(d.year);
        })
        .y(function (d) {
            return y(d.number);
        });

    var types = LINEVARS.map(function (name) {
        return {
            name: name,
            values: (data).map(function (d) {
                return {
                    year: d.year,
                    number: +d[name]
                };
            })
        };
    });

    var lines0 = svg.selectAll(".lines")
        .data(types)
        .enter().append("g")
        .attr("class", "lines0");

    lines0.append("path")
        .attr("class", function (d) {
            return d.name + " graph0 chartline";
        })
        .attr("d", function (d) {
            return line1(d.values);
        })
        .attr("opacity", 1);

    //direct line labels
    /*lines0.append("text")
        .datum(function (d) {
            return {
                name: d.name,
                value: d.values[d.values.length - 3]
            };
        })
        .attr("class", "pointlabel graph0")
        .attr("text-anchor", "end")
        .attr("x", x(2016))
        .attr("y", function (d) {
            if (d.name == "pop_total") {
                return y(d.value.number) - 20;
            } else {
                //return y(d.value.number) + 70;
                return y(150000) + 12
            }
        })
        .text(function (d, i) {
            return LABELS[i];
        })
        .attr("opacity", 1);*/

}