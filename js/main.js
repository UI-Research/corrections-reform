var map_data_url = "data/judicialdistricts.json",
    main_data_url = "data/data.json",
    data_main,
    data,
    VALUE,
    districts,
    $graphic1 = $("#graphic1"),
    $graphic2 = $("#graphic2"),
    $graphic3 = $("#graphic3");

var margin = {
    top: 30,
    right: 15,
    bottom: 25,
    left: 70
};

var width = $graphic1.width() - margin.left - margin.right,
    height = 450;
console.log($graphic1.width(), width);

function graph1() {

    $graphic1.empty();

    var svg = d3.select("#graphic1").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var gs = graphScroll()
        .container(d3.select('#container1'))
        .graph(d3.selectAll('#graphic1'))
        .sections(d3.selectAll('#section1 > div'))
        .on('active', function (i) {

            console.log("section1 " + i);
            if (i == 0) {
                data = data_main.growth;

                svg.selectAll("*")
                    .remove();


                //line chart
                VALUE = "pop_total";
                var x = d3.scale.linear()
                    .range([0, width])
                    .domain(d3.extent(data, function (d) {
                        return d.year;
                    }));

                var y = d3.scale.linear()
                    .range([height, 0])
                    .domain([0, d3.max(data, function (d) {
                        return d[VALUE];
                    })]);

                var xAxis = d3.svg.axis()
                    .scale(x)
                    .ticks(6)
                    .tickFormat(function (d) {
                        return d;
                    })
                    .orient("bottom");

                var gx = svg.append("g")
                    .attr("class", "x axis-show")
                    .attr("transform", "translate(0," + height + ")")
                    .call(xAxis);

                var yAxis = d3.svg.axis()
                    .scale(y)
                    .ticks(6)
                    .orient("left");

                var gy = svg.append("g")
                    .attr("class", "y axis-show")
                    .call(yAxis);

                svg.append("text")
                    .attr("class", "axistitle")
                    .attr("text-anchor", "middle")
                    .attr("x", 0)
                    .attr("y", -5)
                    .text("Federal prison population");

                var line = d3.svg.line()
                    //.interpolate("cardinal")
                    .x(function (d) {
                        return x(d.year);
                    })
                    .y(function (d) {
                        return y(d[VALUE]);
                    });

                svg.append("path")
                    .datum(data)
                    .attr("class", "chartline")
                    .attr("d", line);

                /*var dots = svg.selectAll(".dot")
                    .data(data)
                    .enter()
                    .append("g")
                    .attr("class", "dot");

                dots.append("circle")
                    .attr("r", 3)
                    .attr("cx", function (d) {
                        return x(d.year);
                    })
                    .attr("cy", function (d) {
                        return y(d[VALUE]);
                    });*/


            } else if (i == 1) {
                data = (data_main.sentences).filter(function (d) {
                    return d.offense == "drug";
                });

                console.log(data);
                svg.selectAll("*")
                    .remove();


                //line chart
                VALUE = "pop_total";
                var x = d3.scale.linear()
                    .range([0, width])
                    .domain(d3.extent(data, function (d) {
                        return d.year;
                    }));

                var y = d3.scale.linear()
                    .range([height, 0])
                    .domain([0, d3.max(data, function (d) {
                        return d[VALUE];
                    })]);

                var xAxis = d3.svg.axis()
                    .scale(x)
                    .ticks(6)
                    .tickFormat(function (d) {
                        return d;
                    })
                    .orient("bottom");

                var gx = svg.append("g")
                    .attr("class", "x axis-show")
                    .attr("transform", "translate(0," + height + ")")
                    .call(xAxis);

                var yAxis = d3.svg.axis()
                    .scale(y)
                    .ticks(6)
                    .orient("left");

                var gy = svg.append("g")
                    .attr("class", "y axis-show")
                    .call(yAxis);

                var line = d3.svg.line()
                    //.interpolate("cardinal")
                    .x(function (d) {
                        return x(d.year);
                    })
                    .y(function (d) {
                        return y(d[VALUE]);
                    });

                svg.append("path")
                    .datum(data)
                    .attr("class", "chartline")
                    .attr("d", line);
            } else if (i == 3) {
                svg.selectAll("*")
                    .remove();

                data = data_main.mandmin_drug;
                console.log(data);
                svg.selectAll("*")
                    .remove();

                svg.append("text")
                    .attr("class", "graphtitle")
                    .attr("text-anchor", "middle")
                    .attr("x", width / 2)
                    .attr("y", -10)
                    .text("This will be a real grid of circles");
                
                var x = d3.scale.linear()
                    .range([0, width])
                    .domain([0, 1]);

                var y = d3.scale.linear()
                    .range([height, 0])
                    .domain([0, d3.max(data, function (d) {
                        return d.years;
                    })]);

                var bars = svg.selectAll(".bar")
                    .data(data)
                    .enter()
                    .append("g")
                    .attr("class", "bar");

                bars.append("rect")
                    .attr('class', function (d) {
                        return d.mm_status;
                    })
                    .attr("x", function (d) {
                        return x(d.share_cum - d.share);
                    })
                    .attr("width", function (d) {
                        return x(d.share);
                    })
                    .attr("height", y(0) - 0)
                    .attr("y", 0);

                var xAxis = d3.svg.axis()
                    .scale(x)
                    .tickSize(height)
                    .tickFormat("")
                    .orient("bottom")
                    .ticks(10);

                var yAxis = d3.svg.axis()
                    .scale(y)
                    .tickSize(width)
                    .tickFormat("")
                    .orient("right");

                var gx = svg.append("g")
                    .attr("class", "x axis")
                    .call(xAxis);

                var gy = svg.append("g")
                    .attr("class", "y axis")
                    .call(yAxis);

                gx.selectAll("g").filter(function (d) {
                        return d;
                    })
                    .classed("minor", true);

                gy.selectAll("g").filter(function (d) {
                        return d;
                    })
                    .classed("minor", true);

            } else if (i == 4) {
                svg.selectAll("*")
                    .remove();

                data = data_main.mandmin_drug;
                console.log(data);
                svg.selectAll("*")
                    .remove();
                var x = d3.scale.linear()
                    .range([0, width])
                    .domain([0, 1]);

                var y = d3.scale.linear()
                    .range([height, 0])
                    .domain([0, d3.max(data, function (d) {
                        return d.years;
                    })]);

                var xAxis = d3.svg.axis()
                    .scale(x)
                    .ticks(6)
                    .tickFormat(d3.format("%"))
                    .orient("bottom");

                var gx = svg.append("g")
                    .attr("class", "x axis-show")
                    .attr("transform", "translate(0," + height + ")")
                    .call(xAxis);

                var yAxis = d3.svg.axis()
                    .scale(y)
                    .ticks(6)
                    .orient("left");

                var gy = svg.append("g")
                    .attr("class", "y axis-show")
                    .call(yAxis);

                svg.append("text")
                    .attr("class", "graphtitle")
                    .attr("text-anchor", "middle")
                    .attr("x", width / 2)
                    .attr("y", -10)
                    .text("Average expected time served");

                var bars = svg.selectAll(".bar")
                    .data(data)
                    .enter()
                    .append("g")
                    .attr("class", "bar");

                bars.append("rect")
                    .attr('class', function (d) {
                        return d.mm_status;
                    })
                    .attr("x", function (d) {
                        return x(d.share_cum - d.share);
                    })
                    .attr("width", function (d) {
                        return x(d.share);
                    })
                    .attr("height", function (d) {
                        return y(0) - y(d.years);
                    })
                    .attr("y", function (d) {
                        return y(d.years);
                    });

            } else {
                svg.selectAll("*")
                    .remove();

            }
        });
}

function graph2() {

    //map setup
    var projection = d3.geo.albersUsa()
        .scale(width * 1.2)
        .translate([width / 2, height / 2]);

    var path = d3.geo.path()
        .projection(projection);

    $graphic2.empty();

    var svg = d3.select("#graphic2").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var gs2 = graphScroll()
        .container(d3.select('#container2'))
        .graph(d3.selectAll('#graphic2'))
        .sections(d3.selectAll('#section2 > div'))
        .on('active', function (i) {
            console.log("section2 " + i);

            if (i == 0) {
                //map of judicial districts
                svg.append("g")
                    .attr("class", "districts")
                    .selectAll("path")
                    .data(topojson.feature(districts, districts.objects.JudicialDistricts_Final).features)
                    .enter().append("path")
                    .attr("d", path)
                    .attr("districtcode", function (d) {
                        return d.properties.code;
                    });
            } else {
                svg.selectAll("g, text")
                    .remove();

                svg.append("text")
                    .attr("x", width / 2)
                    .attr("y", height / 2)
                    .attr("fill", "#000000")
                    .html("section2 " + i);
            }
        });
}

function graph3() {
    $graphic3.empty();

    var svg = d3.select("#graphic3").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var gs3 = graphScroll()
        .container(d3.select('#container3'))
        .graph(d3.selectAll('#graphic3'))
        .sections(d3.selectAll('#section3 > div'))
        .on('active', function (i) {
            console.log("section3 " + i);
            svg.selectAll("text")
                .remove();

            svg.append("text")
                .attr("x", width / 2)
                .attr("y", height / 2)
                .attr("fill", "#000000")
                .html("section3 " + i);
        });
}


function drawgraphs() {
    graph1();
    graph2();
    graph3();
}
$(window).load(function () {
    if (Modernizr.svg) { // if svg is supported, draw dynamic chart
        d3.json(main_data_url, function (json) {
            d3.json(map_data_url, function (mapjson) {
                data_main = json;
                districts = mapjson;
                drawgraphs();
                window.onresize = drawgraphs();
            });
        });
    }
});