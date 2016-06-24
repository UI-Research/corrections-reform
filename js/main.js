var map_data_url = "data/judicialdistricts.json",
    main_data_url = "data/data.json",
    data_main,
    data,
    VALUE,
    districts,
    $graphic1 = $("#graphic1"),
    $graphic2 = $("#graphic2"),
    $graphic3 = $("#graphic3");
var drug2014 = 95305;
var MANDMINLABELS = ["Sentenced with mandatory minimum", "Granted relief at sentencing", "Not subject to mandatory minimum"];
var circleradius = 10;
var blue5 = ["#b0d5f1", "#82c4e9", "#1696d2", "#00578b", "#00152A"];
var BREAKS = [1000, 1500, 2000, 3000];
var LEGENDBREAKS = [250, 1000, 1500, 2000, 3000, 13000];

var margin = {
    top: 60,
    right: 15,
    bottom: 75,
    left: 70
};

var width = $graphic1.width() - margin.left - margin.right,
    height = 450;
console.log($graphic1.width(), width);

function wrap2(text, width, startingx) {
    text.each(function () {
        var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            y = text.attr("y"),
            dy = lineHeight * 1.2
            //dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", startingx).attr("y", y).attr("dy", dy + "em");
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan").attr("x", startingx).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
            }
        }
    });
}

function graph1() {

    VALUE = "pop_total";

    $graphic1.empty();

    var svg = d3.select("#graphic1").append("svg")
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
        .attr("text-anchor", "middle")
        .attr("x", 0)
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

    //initial graph
    function init0() {
        data = data_main.growth;

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
            .attr("class", "x axis-show axis0")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        var line0 = d3.svg.line()
            .interpolate("cardinal")
            .x(function (d) {
                return x(d.year);
            })
            .y(function (d) {
                return y(d[VALUE]);
            });

        svg.append("path")
            .datum(data)
            .attr("class", "chartline graph0 standing")
            .attr("d", line0)
            .attr("opacity", 1);
    }

    //stacked area chart -> two lines chart
    function init1() {
        data = data_main.sentences;

        //chart 2
        VALUE = "standing";
        var ORDER = ["other", "drug", "weapon", "immigration", "sex"]

        //chart 1
        var LINEVARS = ["standing", "admissions"];
        var LABELS = ["Standing population", "Admissions"];

        var y = d3.scale.linear()
            .domain([0, 220000])
            .range([height, 0], .1);

        var x = d3.scale.linear()
            .domain(d3.extent(data, function (d) {
                return d.year;
            }))
            .range([0, width]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .tickFormat(function (d) {
                return d;
            })
            .ticks(10);

        //chart 1
        var nest = d3.nest()
            .key(function (d) {
                return d.offense;
            })
            .sortKeys(function (a, b) {
                return ORDER.indexOf(a) - ORDER.indexOf(b);
            })

        var stack = d3.layout.stack()
            .offset("zero")
            .values(function (d) {
                return d.values;
            })
            .x(function (d) {
                return d.year;
            })
            .y(function (d) {
                return d.standing;
            });

        var layers = stack(nest.entries(data.filter(function (d) {
            return d.offense != "total";
        })));

        var area = d3.svg.area()
            .interpolate("cardinal")
            .x(function (d) {
                return x(d.year);
            })
            .y0(function (d) {
                return y(d.y0);
            })
            .y1(function (d) {
                return y(d.y0 + d.y);
            });

        var line2 = d3.svg.line()
            .interpolate("cardinal")
            .x(function (d) {
                return x(d.year);
            })
            .y(function (d) {
                return y(d.y + d.y0);
            });

        var segments = svg.selectAll(".segment")
            .data(layers)
            .enter().append("g")
            .attr("class", "segment");

        segments.append("path")
            .attr("class", function (d) {
                return d.key + " layer graph2";
            })
            .attr("d", function (d) {
                return area(d.values);
            })
            .attr("opacity", 0);

        segments.append("path")
            .attr("class", function (d) {
                return d.key + " chartline graph2";
            })
            .attr("d", function (d) {
                return line2(d.values);
            })
            .attr("opacity", 0);

        segments.append("text")
            .datum(function (d) {
                return {
                    name: d.key,
                    value: d.values[d.values.length - 1]
                };
            })
            .attr("class", "pointlabel graph2")
            .attr("text-anchor", "end")
            .attr("x", function (d) {
                return x(d.value.year) - 10;
            })
            .attr("y", function (d) {
                return y(d.value.y0 + d.value.y * 0.5);
            })
            .text(function (d) {
                return d.name;
            })
            .attr("opacity", 0);

        var line1 = d3.svg.line()
            .interpolate("cardinal")
            .x(function (d) {
                return x(d.year);
            })
            .y(function (d) {
                return y(d.number);
            });

        //chart 2
        var types = LINEVARS.map(function (name) {
            return {
                name: name,
                values: (data.filter(function (d) {
                    return d.offense == "total";
                })).map(function (d) {
                    return {
                        year: d.year,
                        number: +d[name]
                    };
                })
            };
        });

        var lines = svg.selectAll(".lines")
            .data(types)
            .enter().append("g")
            .attr("class", "lines");

        lines.append("path")
            .attr("class", function (d) {
                return d.name + " graph1 chartline";
            })
            .attr("d", function (d) {
                return line1(d.values);
            })
            .attr("opacity", 0);

        //direct line labels
        lines.append("text")
            .datum(function (d) {
                return {
                    name: d.name,
                    value: d.values[d.values.length - 1]
                };
            })
            .attr("class", "pointlabel graph1")
            .attr("text-anchor", "end")
            .attr("x", function (d) {
                return x(d.value.year);
            })
            .attr("y", function (d) {
                return y(d.value.number) - 20;
            })
            .text(function (d, i) {
                return LABELS[i];
            })
            .attr("opacity", 0);

        var gx = svg.append("g")
            .attr("class", "x axis-show axis1")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);
    }

    //graph 3 - circle grid 
    function init3() {

        //data from 0-99, ydig is 1s position, xdig is 10s position
        var cellsdt = d3.range(100).map(function (d) {
            return {
                d: +d,
                ydig: +(d.toString().slice(-1)),
                xdig: +(d3.format("02d")(d)).slice(0, 1),
                group: d < 59 ? "applied" : (d >= 59 & d < 80 ? "notapplied" : "notapplicable")
            }
        });

        var cells = svg.selectAll(".cell")
            .data(cellsdt)
            .enter()
            .append("g")
            .attr("class", "cell");

        cells.append("rect")
            .attr("class", function (d) {
                return d.group + " circle";
            })
            .attr("x", function (d) {
                return d.xdig * (width / 10);
            })
            .attr("width", 20)
            .attr("height", 20)
            .attr("y", function (d) {
                return d.ydig * (height / 10) - 20;
            })
            .attr("rx", 2 * circleradius)
            .attr("ry", 2 * circleradius)
            .attr("opacity", 0);

        //category labels
        svg.append("text")
            .attr("class", "catvalue mandminlabel applied")
            .attr("text-anchor", "start")
            .attr("x", 0)
            .attr("y", height + 4)
            .text("59%")
            .attr("opacity", 0);

        svg.append("text")
            .attr("class", "graphtitle mandminlabel")
            .attr("text-anchor", "start")
            .attr("x", 0)
            .attr("y", height + 10)
            .text(MANDMINLABELS[0])
            .call(wrap2, width * 0.4, 0)
            .attr("opacity", 0);

        svg.append("text")
            .attr("class", "catvalue mandminlabel notapplied")
            .attr("text-anchor", "start")
            .attr("x", width * 0.6)
            .attr("y", height + 4)
            .text("21%")
            .attr("opacity", 0);

        svg.append("text")
            .attr("class", "graphtitle mandminlabel")
            .attr("text-anchor", "start")
            .attr("x", width * 0.6)
            .attr("y", height + 10)
            .text(MANDMINLABELS[1])
            .call(wrap2, width * 0.18, width * 0.6)
            .attr("opacity", 0);

        svg.append("text")
            .attr("class", "catvalue mandminlabel notapplicable")
            .attr("text-anchor", "start")
            .attr("x", width * 0.8)
            .attr("y", height + 4)
            .text("20%")
            .attr("opacity", 0);

        svg.append("text")
            .attr("class", "graphtitle mandminlabel")
            .attr("text-anchor", "start")
            .attr("x", width * 0.8)
            .attr("y", height + 10)
            .text(MANDMINLABELS[2])
            .call(wrap2, width * 0.18, width * 0.8)
            .attr("opacity", 0);
    }

    //time served bars
    function init4() {
        data = data_main.mandmin_drug;
        var LABELS = ["Applied", "Not applied", "Not applicable"];

        var x = d3.scale.linear()
            .range([0, width])
            .domain([0, 1]);

        var y = d3.scale.linear()
            .range([height - 20, 0])
            .domain([0, d3.max(data, function (d) {
                return d.years;
            })]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .ticks(0)
            .outerTickSize(0)
            .orient("bottom");

        svg.append("text")
            .attr("class", "axistitle linesaxis")
            .attr("text-anchor", "middle")
            .attr("x", 0)
            .attr("y", -5)
            .text("Federal prison population");

        svg.append("text")
            .attr("class", "graphtitle graph4")
            .attr("text-anchor", "middle")
            .attr("x", width / 2)
            .attr("y", -30)
            .text("Average expected years served")
            .attr("opacity", 0);

        var bars = svg.selectAll(".rect")
            .data(data)
            .enter()
            .append("g")
            .attr("class", "rect");

        var gx = svg.append("g")
            .attr("class", "x axis-show graph4")
            .attr("transform", "translate(0," + (height - 20) + ")")
            .call(xAxis);


        bars.append("rect")
            .attr('class', function (d) {
                return d.mm_status + " graph4";
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
            })
            .attr("opacity", 0);

        bars.append("text")
            .attr('class', "pointlabel graph4")
            .attr("x", function (d) {
                return x(d.share_cum - 0.5 * d.share);
            })
            .attr("y", function (d) {
                return y(d.years) - 10;
            })
            .text(function (d) {
                return d3.format(".1f")(d.years) + " years";
            })
            .attr("text-anchor", "middle")
            .attr("opacity", 0);

    }

    init0();
    init1();
    init3();
    init4();

    var gs = graphScroll()
        .container(d3.select('#container1'))
        .graph(d3.selectAll('#graphic1'))
        .sections(d3.selectAll('#section1 > div'))
        .on('active', function (i) {

            if (i == 0) {

                d3.selectAll(".graph2, .graph1, .axis1, .graph4, .circle, .mandminlabel")
                    .transition()
                    .duration(0)
                    .attr("opacity", 0)

                d3.selectAll(".graph0, .axis0, .linesaxis")
                    .transition()
                    .duration(500)
                    .attr("opacity", 1)

            } else if (i == 1) {

                d3.selectAll(".graph0, .graph2, .axis0, .graph4, .circle, .axis0, .mandminlabel")
                    .transition()
                    .duration(0)
                    .attr("opacity", 0)

                d3.selectAll(".graph1, .axis1, .linesaxis")
                    .transition()
                    .duration(500)
                    .attr("opacity", 1)

            } else if (i == 2) {

                d3.selectAll(".graph0, .graph1, .graph3, .graph4, .circle, .axis0, .mandminlabel")
                    .transition()
                    .duration(0)
                    .attr("opacity", 0)

                d3.selectAll(".graph2, .linesaxis, .axis1")
                    .transition()
                    .duration(500)
                    .attr("opacity", 1)

            } else if (i == 3) {

                d3.selectAll(".graph0, .graph1, .graph2, .axis1, .axis0, .linesaxis, .graph4")
                    .transition()
                    .duration(0)
                    .attr("opacity", 0)

                d3.selectAll(".graph3, .mandminlabel")
                    .transition()
                    .duration(500)
                    .attr("opacity", 1)

                d3.selectAll(".circle")
                    .transition()
                    .duration(500)
                    .attr("opacity", 1)
                    .transition()
                    .duration(1000)
                    .attr("rx", 2 * circleradius)
                    .attr("ry", 2 * circleradius)
                    .attr("width", 20)
                    .attr("height", 20);

            } else if (i == 4) {

                d3.selectAll(".graph0, .graph1, .graph2, .axis1, .axis0, .linesaxis, .graph3")
                    .transition()
                    .duration(0)
                    .attr("opacity", 0)

                d3.selectAll(".circle")
                    .transition()
                    .duration(1000)
                    .attr("rx", 0)
                    .attr("ry", 0)
                    .attr("width", width / 10)
                    .attr("height", height / 10)
                    .transition()
                    .duration(500)
                    .attr("opacity", 0);

                d3.selectAll(".graph4, .mandminlabel")
                    .transition()
                    .delay(1000)
                    .duration(500)
                    .attr("opacity", 1)
            }
        });
}

function graph2() {

    $graphic2.empty();

    var svg = d3.select("#graphic2").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    function initMap() {

        //map setup
        var projection = d3.geo.albersUsa()
            .scale(width * 1.4)
            .translate([width / 2, height / 2]);

        var color = d3.scale.linear()
            .domain(BREAKS)
            .range(blue5);

        var path = d3.geo.path()
            .projection(projection);

        //map of judicial districts
        svg.append("g")
            .attr("class", "districts graphmap")
            .selectAll("path")
            .data(topojson.feature(districts, districts.objects.JudicialDistricts_Final).features)
            .enter().append("path")
            .attr("d", path)
            .attr("districtcode", function (d) {
                return d.properties.code;
            })
            .attr("fill", function (d) {
                return color(d.properties.sentences);
            });

        var lp_w = width / 2,
            ls_w = 40,
            ls_h = 20;

        var legend = svg.selectAll("g.legend")
            .data(LEGENDBREAKS)
            .enter().append("g")
            .attr("class", "legend");

        legend.append("text")
            .data(LEGENDBREAKS)
            .attr("class", "pointlabel graphmap")
            .attr("x", function (d, i) {
                return (i * ls_w) + lp_w - 2;
            })
            .attr("y", 50)
            .attr("text-anchor", "middle")
            .text(function (d) {
                return d3.format(",")(d);
            });

        legend.append("rect")
            .data(blue5)
            .attr("class", "graphmap")
            .attr("x", function (d, i) {
                return (i * ls_w) + lp_w;
            })
            .attr("y", 15)
            .attr("width", ls_w)
            .attr("height", ls_h)
            .style("fill", function (d, i) {
                return blue5[i];
            })

        svg.append("text")
            .attr("class", "axistitle graphmap")
            .attr("text-anchor", "start")
            .attr("x", lp_w)
            .attr("y", 10)
            .text("Number of sentences");
    }

    function initRace() {
        data = data_main.race;

        var ORDER = ["other", "white", "black", "hispanic"]

        var y = d3.scale.linear()
            .domain([0, 220000])
            .range([height, 0], .1);

        var x = d3.scale.linear()
            .domain(d3.extent(data, function (d) {
                return d.year;
            }))
            .range([0, width]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .tickFormat(function (d) {
                return d;
            })
            .ticks(10);

        var yAxis = d3.svg.axis()
            .scale(y)
            .tickSize(-width)
            .ticks(5)
            .orient("left");

        var gy = svg.append("g")
            .attr("class", "y axis graphrace")
            .call(yAxis);

        gy.selectAll("text")
            .attr("dx", -8);

        gy.selectAll("g").filter(function (d) {
                return d;
            })
            .classed("minor", true);
        svg.append("text")
            .attr("class", "axistitle graphrace")
            .attr("text-anchor", "middle")
            .attr("x", 0)
            .attr("y", -5)
            .text("Federal prison population");

        var nest = d3.nest()
            .key(function (d) {
                return d.race;
            })
            .sortKeys(function (a, b) {
                return ORDER.indexOf(a) - ORDER.indexOf(b);
            })

        var stack = d3.layout.stack()
            .offset("zero")
            .values(function (d) {
                return d.values;
            })
            .x(function (d) {
                return d.year;
            })
            .y(function (d) {
                return d.pop_total;
            });

        var layers = stack(nest.entries(data));

        var area = d3.svg.area()
            .interpolate("cardinal")
            .x(function (d) {
                return x(d.year);
            })
            .y0(function (d) {
                return y(d.y0);
            })
            .y1(function (d) {
                return y(d.y0 + d.y);
            });

        var line1 = d3.svg.line()
            .interpolate("cardinal")
            .x(function (d) {
                return x(d.year);
            })
            .y(function (d) {
                return y(d.y + d.y0);
            });

        var racegroups = svg.selectAll(".racegroup")
            .data(layers)
            .enter().append("g")
            .attr("class", "racegroup");

        racegroups.append("path")
            .attr("class", function (d) {
                return d.key + " layer graphrace";
            })
            .attr("d", function (d) {
                return area(d.values);
            })
            .attr("opacity", 0);

        racegroups.append("path")
            .attr("class", function (d) {
                return d.key + " chartline graphrace";
            })
            .attr("d", function (d) {
                return line1(d.values);
            })
            .attr("opacity", 0);

        racegroups.append("text")
            .datum(function (d) {
                return {
                    name: d.key,
                    value: d.values[d.values.length - 1]
                };
            })
            .attr("class", "pointlabel graphrace")
            .attr("text-anchor", "end")
            .attr("x", function (d) {
                return x(d.value.year) - 10;
            })
            .attr("y", function (d) {
                return y(d.value.y0 + d.value.y * 0.5);
            })
            .text(function (d) {
                return d.name;
            })
            .attr("opacity", 0);

        var gx = svg.append("g")
            .attr("class", "x axis-show graphrace")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);
    }

    function initCh() {
        //bar chart of criminal histories
        data = data_main.histories.filter(function (d) {
            return d.offense == "drug";
        });
        VALUE = "number";

        var y = d3.scale.linear()
            .range([height, 0])
            .domain([0, d3.max(data, function (d) {
                return d[VALUE];
            })]);

        var x = d3.scale.ordinal()
            .rangeRoundBands([0, width], .1)
            .domain(data.map(function (d) {
                return d.category;
            }));

        var xAxis = d3.svg.axis()
            .scale(x)
            .tickSize(0)
            .tickFormat(function (d, i) {
                //return MONEY_MOBILE[i];
                return d;
            })
            .orient("bottom");

        var bars = svg.selectAll(".bar")
            .data(data)
            .enter()
            .append("g")
            .attr("class", "bar");

        bars.append("rect")
            .attr("class", "graphch")
            .attr("x", function (d) {
                return x(d.category);
            })
            .attr("width", x.rangeBand())
            .attr("y", function (d) {
                return y(d[VALUE]);
            })
            .attr("height", function (d) {
                return height - y(d[VALUE]);
            })
            .attr("opacity", 0);

        bars.append("text")
            .attr("class", "pointlabel graphch")
            .attr("y", function (d) {
                return y(d[VALUE]) - 8;
            })
            .attr("x", function (d) {
                return x(d.category) + x.rangeBand() / 2;
            })
            .attr("text-anchor", "middle")
            .text(function (d) {
                return d3.format(",.0f")(d[VALUE]);
            })
            .attr("opacity", 0);

        var gx = svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .attr("class", "x axis-show graphch")
            .call(xAxis);

        svg.append("text")
            .attr("class", "axistitle graphch")
            .attr("text-anchor", "middle")
            .attr("x", width / 2)
            .attr("y", height + 30)
            .text("Criminal history category")
            .attr("opacity", 0);

        svg.append("text")
            .attr("class", "axis graphch")
            .attr("text-anchor", "middle")
            .attr("x", 0)
            .attr("y", height + 10)
            .text("No or minimal criminal history")
            .call(wrap2, x.rangeBand(), x.rangeBand() / 2)
            .attr("opacity", 0);

        svg.append("text")
            .attr("class", "axis graphch")
            .attr("text-anchor", "middle")
            .attr("x", width)
            .attr("y", height + 10)
            .text("Most criminal history")
            .call(wrap2, x.rangeBand(), width - x.rangeBand() / 2)
            .attr("opacity", 0);
    }

    function initSecurity() {
        //bar chart of prison type
        data = data_main.security_drug;
        VALUE = "number";

        var y = d3.scale.linear()
            .range([height, 0])
            .domain([0, d3.max(data, function (d) {
                return d[VALUE];
            })]);

        var x = d3.scale.ordinal()
            .rangeRoundBands([0, width], .1)
            .domain(data.map(function (d) {
                return d.security;
            }));

        var xAxis = d3.svg.axis()
            .scale(x)
            .tickSize(0)
            .tickFormat(function (d, i) {
                //return MONEY_MOBILE[i];
                return d;
            })
            .orient("bottom");

        var securitybars = svg.selectAll(".securitybar")
            .data(data)
            .enter()
            .append("g")
            .attr("class", "securitybar");

        securitybars.append("rect")
            .attr("class", "graphsecurity bar")
            .attr("x", function (d) {
                return x(d.security);
            })
            .attr("width", x.rangeBand())
            .attr("y", function (d) {
                return y(d[VALUE]);
            })
            .attr("height", function (d) {
                return height - y(d[VALUE]);
            })
            .attr("opacity", 0);

        securitybars.append("text")
            .attr("class", "pointlabel graphsecurity")
            .attr("y", function (d) {
                return y(d[VALUE]) - 8;
            })
            .attr("x", function (d) {
                return x(d.security) + x.rangeBand() / 2;
            })
            .attr("text-anchor", "middle")
            .text(function (d) {
                return d3.format(",.0f")(d[VALUE]);
            })
            .attr("opacity", 0);

        var gx = svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .attr("class", "x axis-show graphsecurity")
            .call(xAxis);

        svg.append("text")
            .attr("class", "axistitle graphsecurity")
            .attr("text-anchor", "middle")
            .attr("x", width / 2)
            .attr("y", height + 30)
            .text("Security type")
            .attr("opacity", 0);


    }

    initMap();
    initRace();
    initCh();
    initSecurity();

    var gs2 = graphScroll()
        .container(d3.select('#container2'))
        .graph(d3.selectAll('#graphic2'))
        .sections(d3.selectAll('#section2 > div'))
        .on('active', function (i) {

            if (i == 0) {

                d3.selectAll(".graphrace, .graphch, .graphsecurity")
                    .transition()
                    .duration(0)
                    .attr("opacity", 0)

                d3.selectAll(".graphmap")
                    .transition()
                    .duration(0)
                    .attr("opacity", 1)

            } else if (i == 1) {

                d3.selectAll(".graphmap, .graphch, .graphsecurity")
                    .transition()
                    .duration(0)
                    .attr("opacity", 0)

                d3.selectAll(".graphrace")
                    .transition()
                    .duration(500)
                    .attr("opacity", 1)

            } else if (i == 2) {
                d3.selectAll(".graphmap, .graphrace, .graphsecurity")
                    .transition()
                    .duration(0)
                    .attr("opacity", 0)

                d3.selectAll(".graphch")
                    .transition()
                    .duration(500)
                    .attr("opacity", 1)


            } else if (i == 3) {
                d3.selectAll(".graphmap, .graphrace, .graphch")
                    .transition()
                    .duration(0)
                    .attr("opacity", 0)

                d3.selectAll(".graphsecurity")
                    .transition()
                    .duration(500)
                    .attr("opacity", 1)
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

    data = data_main.jointimpact;

    var LINEVARS = ["pop_baseline", "pop_jointimpact"];
    var LABELS = ["No policy changes", "All recommended interventions"];

    var y = d3.scale.linear()
        .domain([0, 220000])
        .range([height, 0], .1)

    var x = d3.scale.linear()
        .domain(d3.extent(data, function (d) {
            return d.year;
        }))
        .range([0, width]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .tickFormat(function (d) {
            return d;
        })
        .ticks(10);

    var yAxis = d3.svg.axis()
        .scale(y)
        .tickSize(-width)
        .ticks(5)
        .orient("left");

    var gy = svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    gy.selectAll("text")
        .attr("dx", -8);

    gy.selectAll("g").filter(function (d) {
            return d;
        })
        .classed("minor", true);

    svg.append("text")
        .attr("class", "axistitle")
        .attr("text-anchor", "middle")
        .attr("x", 0)
        .attr("y", -5)
        .text("Federal prison population");

    var gx = svg.append("g")
        .attr("class", "x axis-show")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    var line = d3.svg.line()
        .interpolate("cardinal")
        .x(function (d) {
            return x(d.year);
        })
        .y(function (d) {
            return y(d.number);
        });

    var types = LINEVARS.map(function (name) {
        return {
            name: name,
            values: data.map(function (d) {
                return {
                    year: d.year,
                    number: +d[name]
                };
            })
        };
    });

    var lines = svg.selectAll(".chartline")
        .data(types)
        .enter().append("g")
        .attr("class", "chartline");

    lines.append("path")
        .attr("class", function (d) {
            return d.name;
        })
        .attr("d", function (d) {
            return line(d.values);
        });

    //direct line labels
    lines.append("text")
        .datum(function (d) {
            return {
                name: d.name,
                value: d.values[d.values.length - 1]
            };
        })
        /*.attr("transform", function (d) {
            return "translate(" + x(d.value.year) + "," + y(d.value.number) + ")";
        })*/
        /*.attr("x", 3)
        .attr("dy", ".35em")*/
        .attr("class", "pointlabel")
        .attr("text-anchor", "end")
        .attr("x", function (d) {
            return x(d.value.year);
        })
        .attr("y", function (d) {
            return y(d.value.number) - 15;
        })
        .text(function (d, i) {
            return LABELS[i];
        });

    var gs3 = graphScroll()
        .container(d3.select('#container3'))
        .graph(d3.selectAll('#graphic3'))
        .sections(d3.selectAll('#section3 > div'))
        .on('active', function (i) {});
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