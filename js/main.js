var map_data_url = "data/judicialdistricts.json",
    main_data_url = "data/data.json",
    data_main,
    data,
    VALUE,
    districts,
    $mobilegrowth = $("#mobilegrowth"),
    $graphic1 = $("#graphic1"),
    $graphic2 = $("#graphic2"),
    $graphic3 = $("#graphic3");
var drug2014 = 95305;
var MANDMINLABELS = ["Sentenced with mandatory minimum", "Granted relief at sentencing", "Not subject to mandatory minimum"];
var circleradius = 10;
var blue5 = ["#b0d5f1", "#82c4e9", "#1696d2", "#00578b", "#00152A"];
var BREAKS = [1000, 1500, 2000, 3000];
var LEGENDBREAKS = [250, 1000, 1500, 2000, 3000, 13000];
var GROWTHTYPE = "total";
var FOOTNOTE = "The total federal prison population includes a small share of special populations, including pretrial holds and those convicted of DC code felonies.This feature focuses on the federally sentenced population, examining the years
for which we have data, 1994– 2014.";

var dispatch = d3.dispatch("rescaleXAxis", "rescaleYAxis", "rescaleStandingLine", "changeGrowthLines", "intoChBars", "changeChBars", "intoSecurityBars", "changeSecurityBars");

d3.selection.prototype.moveToFront = function () {
    return this.each(function () {
        this.parentNode.appendChild(this);
    });
};

//capitalize first letter for labels
String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

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

// use radio buttons to change offense type on a few graphs
// line chart of population vs admissions over time
$('input:radio[name="radio-growth"]').change(function () {
    //console.log($(this).val());
    GROWTHTYPE = $(this).val();
    if (GROWTHTYPE != "total") {
        d3.select(".graph0.standing.chartline")
            .attr("opacity", 0)
    }
    dispatch.changeGrowthLines($(this).val());
});

//bar chart of criminal history
$('input:radio[name="radio-ch"]').change(function () {
    //console.log($(this).val());
    dispatch.changeChBars($(this).val());

});
//bar chart of prison security
$('input:radio[name="radio-security"]').change(function () {
    console.log($(this).val());
    dispatch.changeSecurityBars($(this).val());

});

function graph1() {

    var margin = {
        top: 60,
        right: 15,
        bottom: 75,
        left: 70
    };

    var width = $graphic1.width() - margin.left - margin.right,
        height = 450;

    //VALUE = "pop_total";

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

    // years axis used in first three charts
    // it zooms in on the second & third one to a different domain
    var x = d3.scale.linear()
        .range([0, width])
        .domain([1980, 2016]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .ticks(8)
        .tickFormat(function (d) {
            return d;
        })
        .orient("bottom");

    var gx = svg.append("g")
        .attr("class", "x axis-show axisyears")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    //change the X axis years domain
    dispatch.on("rescaleXAxis", function (startyear, stopyear) {
        x.domain([startyear, stopyear]);

        d3.select(".axisyears")
            .transition()
            .duration(1000)
            .ease("cubic-in-out")
            .call(xAxis);
    });

    //initial graph
    function init0() {
        var LINEVARS = ["standing", "pop_total"];
        var LABELS = ["Federally sentenced population", "Total federal prison population"];

        data = data_main.growth;

        //line chart

        var x = d3.scale.linear()
            .range([0, width])
            .domain(d3.extent(data, function (d) {
                return d.year;
            }));

        var y = d3.scale.linear()
            .range([height, 0])
            .domain([0, 220000])

        //footnote
        svg.append("text")
            .attr("class", "footnote graph0")
            .attr("text-anchor", "start")
            .attr("x", 0)
            .attr("y", height + 30)
            .text(FOOTNOTE)
            .call(wrap2, width + 40, -40)
            .attr("opacity", 1);

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
        lines0.append("text")
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
            .attr("opacity", 1);

        dispatch.on("rescaleStandingLine", function (startyear, stopyear) {
            x.domain([startyear, stopyear]);

            d3.select(".graph0.standing.chartline")
                .attr("opacity", 1)
                .transition()
                .duration(1000)
                .attr("d", function (d) {
                    return line1(d.values);
                });
        });

    }

    function init1() {
        //line chart - standing population vs admissions over time, with a toggle for offense type
        data = data_main.sentences.filter(function (d) {
            return d.offense == "total";
        });

        var LINEVARS = ["standing", "admissions"];
        var LABELS = ["Federally sentenced population", "Admissions"];

        var y = d3.scale.linear()
            .domain([0, 220000])
            .range([height, 0], .1);

        var x = d3.scale.linear()
            .domain(d3.extent(data, function (d) {
                return d.year;
            }))
            .range([0, width]);

        /*var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .tickFormat(function (d) {
                return d;
            })
            .ticks(10);

        var gx = svg.append("g")
            .attr("class", "x axis-show axis1")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);*/

        var line1 = d3.svg.line()
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

        var lines = svg.selectAll(".lines")
            .data(types, function (d) {
                return d.name;
            })
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
            .attr("class", "pointlabel graph1")
            .attr("text-anchor", "end")
            .attr("x", x(2014))
            .attr("y", function (d) {
                return y(d.values[d.values.length - 1]["number"]) - 20;
            })
            .text(function (d, i) {
                return LABELS[i];
            })
            .attr("opacity", 0);

        dispatch.on("changeGrowthLines", function (type) {
            //switch offense type in lines

            data = data_main.sentences.filter(function (d) {
                return d.offense == type;
            });

            types = LINEVARS.map(function (name) {
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

            lines.selectAll("path")
                .data(types, function (d) {
                    return d.name;
                })
                .transition()
                .duration(500)
                .attr("d", function (d) {
                    return line1(d.values);
                });

            lines.selectAll("text")
                .data(types, function (d) {
                    return d.name;
                })
                .transition()
                .duration(500)
                .attr("y", function (d) {
                    return y(d.values[d.values.length - 1]["number"]) - 20;
                });

        });
    }

    function init2() {
        //stacked area chart - population by offense over time
        data = data_main.sentences;

        VALUE = "standing";
        var ORDER = ["other", "drug", "weapon", "immigration", "sex"]

        var y = d3.scale.linear()
            .domain([0, 220000])
            .range([height, 0], .1);

        var x = d3.scale.linear()
            .domain(d3.extent(data, function (d) {
                return d.year;
            }))
            .range([0, width]);

        /*var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .tickFormat(function (d) {
                return d;
            })
            .ticks(10);*/

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
            .attr("class", function (d) {
                return d.name + " pointlabel graph2";
            })
            .attr("text-anchor", "end")
            .attr("x", function (d) {
                return x(d.value.year) - 10;
            })
            .attr("y", function (d) {
                return y(d.value.y0 + d.value.y * 0.5);
            })
            .text(function (d) {
                return (d.name).capitalize();
            })
            .attr("opacity", 0);

    }

    //graph 3 - circle grid 
    function init3() {

        //data from 0-99, ydig is 1s position, xdig is 10s position
        var cellsdt = d3.range(100).map(function (d) {
            return {
                d: +d,
                ydig: +(d.toString().slice(-1)),
                xdig: +(d3.format("02d")(d)).slice(0, 1),
                group: d < 59 ? "applied" : (d >= 59 & d < 78 ? "notapplied" : "notapplicable")
            }
        });

        var cells = svg.append("g")
            .attr("class", "cells")
            .selectAll("g")
            .data(cellsdt)
            .enter().append("g")
            .attr("class", "cell");

        /*var cells = svg.selectAll(".cell")
            .data(cellsdt)
            .enter()
            .append("g")
            .attr("class", "cell");*/

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
            .text("19%")
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
            .text("22%")
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
            .attr("class", "axistitle graph4")
            .attr("text-anchor", "start")
            .attr("x", 0)
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
    init2();
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

                d3.selectAll(".graph0, .axisyears, .linesaxis")
                    .transition()
                    .duration(500)
                    .attr("opacity", 1)

                dispatch.rescaleXAxis(1980, 2016);
                dispatch.rescaleStandingLine(1980, 2016);

            } else if (i == 1) {

                d3.selectAll(" .graph2, graph4, .circle, .mandminlabel, .graph0:not(standing)")
                    .transition()
                    .duration(0)
                    .attr("opacity", 0)

                d3.selectAll(".graph1, .axis1, .linesaxis, .axisyears")
                    .transition()
                    .duration(500)
                    .attr("opacity", 1)

                if (GROWTHTYPE != "total") {
                    d3.select(".graph0.standing.chartline")
                        .attr("opacity", 0)
                }

                dispatch.rescaleXAxis(1994, 2014);
                dispatch.rescaleStandingLine(1994, 2014);

            } else if (i == 2) {

                d3.selectAll(".graph0, .graph1, .graph3, .graph4, .circle, .mandminlabel")
                    .transition()
                    .duration(0)
                    .attr("opacity", 0)

                d3.selectAll(".graph2, .linesaxis, .axis1, .axisyears")
                    .transition()
                    .duration(500)
                    .attr("opacity", 1)

            } else if (i == 3) {

                d3.selectAll(".graph0, .graph1, .graph2, .axis1, .axisyears, .linesaxis, .graph4")
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

                d3.selectAll(".graph0, .graph1, .graph2, .axis1, .axisyears, .linesaxis, .graph3")
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
    var margin = {
        top: 60,
        right: 15,
        bottom: 75,
        left: 70
    };

    var width = $graphic1.width() - margin.left - margin.right,
        height = 450;


    $graphic2.empty();

    var svg = d3.select("#graphic2").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //Y axis used in race, criminal history, security charts (all but map)
    var y = d3.scale.linear()
        .range([height, 0])
        .domain([0, 220000]);

    svg.append("text")
        .attr("class", "axistitle fedpop")
        .attr("text-anchor", "middle")
        .attr("x", 0)
        .attr("y", -5)
        .text("Federal prison population")
        .attr("opacity", 0);

    var yAxis = d3.svg.axis()
        .scale(y)
        .tickSize(-width)
        .ticks(5)
        .orient("left");

    var gy = svg.append("g")
        .attr("class", "y axis fedpop")
        .call(yAxis);

    gy.selectAll("text")
        .attr("dx", -8);

    gy.selectAll("g").filter(function (d) {
            return d;
        })
        .classed("minor", true);

    dispatch.on("rescaleYAxis", function (ymax) {
        y.domain([0, ymax]);

        yAxis = d3.svg.axis()
            .scale(y)
            .tickSize(-width)
            .ticks(5)
            .tickFormat(function (d) {
                return d3.format(",")(d);
            })
            .orient("left");

        d3.selectAll(".axis.fedpop")
            .transition()
            .duration(1000)
            .ease("cubic-in-out")
            .call(yAxis)
            .each('interrupt', function () {
                console.log("yikes fedpop axis");
            });

        gy.selectAll("text")
            .attr("dx", -8);

        gy.selectAll("g").filter(function (d) {
                return d;
            })
            .classed("minor", true);
    });

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

        var dt = data_main.districtsentences;
        var complexes = data_main.complexzips;
        var zbd = data_main.zipsbydistrict;

        //no Virgin Islands, Guam, Puerto Rico districts or prisons
        dt = dt.filter(function (d) {
            return d.districtcode != "VI" & d.districtcode != "GU" & d.districtcode != "PR";
        });

        complexes = complexes.filter(function (d) {
            return d.zip != "00965";
        });

        zbd = zbd.filter(function (d) {
            return d.districtcode != "VI" & d.districtcode != "GU" & d.districtcode != "PR" & d.zip != "00965" & d.zip != "";
        });

        //make an array for the district centroid coordinates and zip complex coordinates
        zbd.forEach(function (d) {
            d.sentences = +d.sentences;
            var position = projection(d);
            d.complex = projection([+d.zip_long, +d.zip_lat]);
            d.district = projection([+d.centroid_long, +d.centroid_lat]);
        })

        //nest by district
        var zdt = d3.nest()
            .key(function (d) {
                return d.districtcode;
            })
            .sortKeys(d3.ascending)
            .entries(zbd);

        dt.forEach(function (d) {
            d.sentences = +d.sentences;
            d[0] = +d.longitude;
            d[1] = +d.latitude;
            var position = projection(d);
            d.centroidx = position[0];
            d.centroidy = position[1];
            d.lines = zdt.filter(function (district) {
                return district.key == d.districtcode;
            })[0];
        })

        complexes.forEach(function (d) {
            d.sentences = +d.sentences;
            d[0] = +d.longitude;
            d[1] = +d.latitude;
            var position = projection(d);
            d.complexx = position[0];
            d.complexy = position[1];
        });

        //judicial districts boundaries
        svg.append("g")
            .attr("class", "districts graphmap")
            .selectAll("path")
            .data(topojson.feature(districts, districts.objects.JudicialDistricts_Final).features)
            .enter().append("path")
            .attr("d", path)
            .attr("class", "district")
            .attr("code", function (d) {
                return d.properties.code;
            })
            .attr("fill", function (d) {
                return color(d.properties.sentences);
            })
            .on("mouseover", function (d) {
                if (d.properties.code != "AK") {
                    d3.selectAll(".hovered")
                        .classed("hovered", false);
                    d3.selectAll("." + d3.select(this).attr("code"))
                        .classed("hovered", true);
                    d3.select(this).classed("hovered", true);
                    //d3.select(this).moveToFront();
                } else {
                    //Alaska is being a special browser crashing snowflake with this.classed
                    d3.select(this).attr("fill", "#fdbf11")
                    d3.selectAll(".AK")
                        .classed("hovered", true);
                }
            })
            .on("mouseout", function (d) {
                d3.select(this).attr("fill", function (d) {
                    return color(d.properties.sentences);
                });
                d3.selectAll(".hovered")
                    .classed("hovered", false);
            })

        //prison complexes
        var complex = svg.append("g")
            .attr("class", "complexes graphmap")
            .selectAll("g")
            .data(complexes.sort(function (a, b) {
                return b.sentences - a.sentences;
            }))
            .enter().append("g")
            .attr("class", "complex");

        complex.append("circle")
            .attr("cx", function (d) {
                return d.complexx;
            })
            .attr("cy", function (d) {
                return d.complexy;
            })
            .attr("r", function (d, i) {
                return Math.sqrt(d.sentences) / 10;
            })
            .attr("class", function (d) {
                return "zip_" + d.zip
            });

        //district centroids - don't draw, but that's where the lines emanate from
        var centroid = svg.append("g")
            .attr("class", "centroids graphmap")
            .selectAll("g")
            .data(dt)
            .enter().append("g")
            .attr("class", function (d) {
                return d.districtcode + " centroid";
            })
            .attr("temp", function (d) {
                return d.lines.key;
            })

        centroid.append("g")
            .attr("class", function (d) {
                return d.districtcode + " sentence-arcs graphmap";
            })
            .selectAll("path")
            .data(function (d) {
                return d.lines.values;
            })
            .enter().append("line")
            .attr("zip", function (d) {
                d3.select("circle.zip_" + d.zip)
                    .classed(d.districtcode, true)
                return d.zip;
            })
            .attr("x1", function (d) {
                return d.district[0];
            })
            .attr("y1", function (d) {
                return d.district[1];
            })
            .attr("x2", function (d) {
                return d.complex[0];
            })
            .attr("y2", function (d) {
                return d.complex[1];
            })

        //we want one region to be selected by default for users to see
        d3.selectAll(".KS, [code='KS']").classed("hovered", true);

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
            .text("Number of people sentenced");
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

        /*var yAxis = d3.svg.axis()
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
            .classed("minor", true);*/

        /*svg.append("text")
            .attr("class", "axistitle graphrace")
            .attr("text-anchor", "middle")
            .attr("x", 0)
            .attr("y", -5)
            .text("Federal prison population");*/

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
            .attr("class", function (d) {
                return d.name + " pointlabel graphrace";
            })
            .attr("text-anchor", "end")
            .attr("x", function (d) {
                return x(d.value.year) - 10;
            })
            .attr("y", function (d) {
                return y(d.value.y0 + d.value.y * 0.5) + 2;
            })
            .text(function (d) {
                return (d.name).capitalize();
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

        var y = d3.scale.linear()
            .range([height, 0])
            .domain([0, d3.max(data, function (d) {
                return d.number;
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
                return d;
            })
            .orient("bottom");

        console.log(y(0.5))

        var bars = svg.selectAll(".chbar")
            .data(data, function (d) {
                return d.category;
            })
            .enter()
            .append("g")
            .attr("class", "chbar");

        bars.append("rect")
            .attr("class", "graphch bar")
            .attr("x", function (d) {
                return x(d.category);
            })
            .attr("width", x.rangeBand())
            .attr("y", function (d) {
                return y(d.number);
            })
            .attr("height", function (d) {
                return height - y(d.number);
            })
            .attr("opacity", 0);

        /*bars.append("text")
            .attr("class", "pointlabel graphch")
            .attr("y", function (d) {
                return y(d.number) - 8;
            })
            .attr("x", function (d) {
                return x(d.category) + x.rangeBand() / 2;
            })
            .attr("text-anchor", "middle")
            .text(function (d) {
                return d3.format(",.0f")(d.number);
            })
            .attr("opacity", 0);*/

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

        dispatch.on("changeChBars", function (type) {
            //reset bars to a different offense type, based on radio button value
            //transition axis too
            data = data_main.histories.filter(function (d) {
                return d.offense == type;
            });

            y = d3.scale.linear()
                .range([height, 0])
                .domain([0, d3.max(data, function (d) {
                    return d.number;
                })]);

            bars.selectAll("rect")
                .data(data, function (d) {
                    return d.category;
                })
                .transition()
                .duration(500)
                .attr("y", function (d) {
                    return y(d.number);
                })
                .attr("height", function (d) {
                    return height - y(d.number);
                })
                .each('interrupt', function () {
                    console.log("yikes bars");
                });

            /*bars.selectAll("text")
                .data(data, function (d) {
                    return d.category;
                })
                .transition()
                .duration(500)
                .attr("y", function (d) {
                    return y(d.number) - 8;
                })
                .text(function (d) {
                    return d3.format(",.0f")(d.number);
                })*/

            dispatch.rescaleYAxis(d3.max(data, function (d) {
                return d.number;
            }));

        });

        dispatch.on("intoChBars", function () {
            var chtype = d3.select('label[name="radio-ch"].active').attr("value");

            var maxy = d3.max(data_main.histories.filter(function (d) {
                return d.offense == chtype;
            }), function (d) {
                return d.number;
            });
            console.log(maxy);

            var graphOn = d3.selectAll("rect.graphch").attr("height");

            if (graphOn == height / 2) {
                //approaching from the bottom

                d3.selectAll(".graphmap, .graphrace")
                    .transition()
                    .duration(0)
                    .attr("opacity", 0)

                //make the previous bars into one rectangle half height
                d3.selectAll("rect.graphsecurity")
                    .transition()
                    .duration(500)
                    .attr("opacity", 1)
                    .transition()
                    .duration(1000)
                    .attr("width", width / 4)
                    .attr("y", height / 2)
                    .attr("height", height / 2)
                    .transition()
                    .duration(500)
                    .attr("opacity", 0);

                //then emerge the new bars from that
                d3.selectAll("rect.graphch")
                    .transition()
                    .delay(1000)
                    .duration(500)
                    .attr("opacity", 1)
                    .transition()
                    .duration(1000)
                    .attr("width", x.rangeBand())
                    .attr("y", function (d) {
                        return y(d.number);
                    })
                    .attr("height", function (d) {
                        return height - y(d.number);
                    })
                    .each('interrupt', function () {
                        console.log("yikes intoChBars");
                    });

                dispatch.rescaleYAxis(maxy);

                //disappear old labels
                d3.selectAll(".axistitle.graphsecurity, .axis-show.graphsecurity, .pointlabel.graphsecurity, .axis.graphsecurity")
                    .transition()
                    .delay(500)
                    .duration(500)
                    .attr("opacity", 0)

                //make new labels visible
                d3.selectAll(".axistitle.graphch, .axis-show.graphch, .pointlabel.graphch, .axis.graphch")
                    .transition()
                    .delay(2000)
                    .duration(500)
                    .attr("opacity", 1)
            } else {
                d3.selectAll(".graphmap, .graphrace, .graphsecurity")
                    .transition()
                    .duration(0)
                    .attr("opacity", 0)

                d3.selectAll(".graphch, .fedpop")
                    .transition()
                    .duration(500)
                    .attr("opacity", 1)

                dispatch.rescaleYAxis(maxy);
            }
        })
    }

    function initSecurity() {
        //bar chart of prison type
        data = data_main.security.filter(function (d) {
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
            .data(data, function (d) {
                return d.security;
            })
            .enter()
            .append("g")
            .attr("class", "securitybar");

        securitybars.append("rect")
            .attr("class", "graphsecurity bar")
            .attr("x", function (d) {
                return x(d.security);
            })
            /*.attr("width", x.rangeBand())
            .attr("y", function (d) {
                return y(d[VALUE]);
            })
            .attr("height", function (d) {
                return height - y(d[VALUE]);
            })*/
            .attr("width", width / 5)
            .attr("y", height / 2)
            .attr("height", height / 2)
            .attr("opacity", 0);

        /*securitybars.append("text")
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
            .attr("opacity", 0);*/

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

        dispatch.on("changeSecurityBars", function (type) {
            //reset bars to a different offense type, based on radio button value
            data = data_main.security.filter(function (d) {
                return d.offense == type;
            });

            y = d3.scale.linear()
                .range([height, 0])
                .domain([0, d3.max(data, function (d) {
                    return d.number;
                })]);

            securitybars.selectAll("rect")
                .data(data, function (d) {
                    return d.security;
                })
                .transition()
                .duration(500)
                .attr("y", function (d) {
                    return y(d.number);
                })
                .attr("height", function (d) {
                    return height - y(d.number);
                });

            dispatch.rescaleYAxis(d3.max(data, function (d) {
                return d.number;
            }));

        });

        dispatch.on("intoSecurityBars", function () {
            var sectype = d3.select('label[name="radio-security"].active').attr("value");

            var maxy = d3.max(data_main.security.filter(function (d) {
                return d.offense == sectype;
            }), function (d) {
                return d.number;
            });
            console.log(maxy);

            d3.selectAll(".graphmap, .graphrace")
                .transition()
                .duration(0)
                .attr("opacity", 0)

            //make the previous bars into one rectangle half height
            d3.selectAll("rect.graphch")
                .transition()
                .duration(500)
                .attr("opacity", 1)
                .transition()
                .duration(1000)
                .attr("width", width / 6)
                .attr("y", height / 2)
                .attr("height", height / 2)
                .transition()
                .duration(500)
                .attr("opacity", 0);

            //then emerge the new bars from that
            d3.selectAll("rect.graphsecurity")
                .transition()
                .delay(1000)
                .duration(500)
                .attr("opacity", 1)
                .transition()
                .duration(1000)
                .attr("width", x.rangeBand())
                .attr("y", function (d) {
                    return y(d.number);
                })
                .attr("height", function (d) {
                    return height - y(d.number);
                })
                .each('interrupt', function () {
                    console.log("yikes intoSecurityBars");
                });


            dispatch.rescaleYAxis(maxy);

            //disappear old labels
            d3.selectAll(".axistitle.graphch, .axis-show.graphch, .pointlabel.graphch, .axis.graphch")
                .transition()
                .delay(500)
                .duration(500)
                .attr("opacity", 0)

            //make new labels visible
            d3.selectAll(".axistitle.graphsecurity, .axis-show.graphsecurity, .pointlabel.graphsecurity, .axis.graphsecurity")
                .transition()
                .delay(2000)
                .duration(500)
                .attr("opacity", 1)
        })
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

                d3.selectAll(".graphrace, .graphch, .graphsecurity, .fedpop")
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

                d3.selectAll(".graphrace, .fedpop")
                    .transition()
                    .duration(500)
                    .attr("opacity", 1)

                if (y.domain()[1] != 220000) {
                    dispatch.rescaleYAxis(220000);
                }

            } else if (i == 2) {

                dispatch.intoChBars();


            } else if (i == 3) {

                dispatch.intoSecurityBars();

            }
        });
}

function graph3() {
    var margin = {
        top: 60,
        right: 15,
        bottom: 75,
        left: 70
    };

    var width = $graphic1.width() - margin.left - margin.right,
        height = 450;

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

$('document').ready(function () {
    console.log("window width is " + $(window).width());

    if ($(window).width() <= 768) {
        function drawgraphs() {
            console.log("I'm on mobile!");
            mobileGrowth();
        }

    } else {


        function drawgraphs() {
            graph1();
            graph2();
            graph3();
        }
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
});