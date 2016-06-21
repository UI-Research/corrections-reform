var map_data_url = "data/judicialdistricts.json",
    main_data_url = "data/data.json",
    data_main,
    data,
    VALUE,
    districts,
    $graphic1 = $("#graphic1"),
    $graphic2 = $("#graphic2"),
    $graphic3 = $("#graphic3");
var ORDER = ["drug", "weapon", "immigration", "sex", "other"];

var margin = {
    top: 60,
    right: 15,
    bottom: 45,
    left: 70
};

var width = $graphic1.width() - margin.left - margin.right,
    height = 450;
console.log($graphic1.width(), width);

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
            .attr("class", "chartline standing graph0")
            .attr("d", line);
    }

    function init1() {
        data = (data_main.sentences).filter(function (d) {
            return d.offense != "total";
        });

        VALUE = "standing";
        var ORDER = ["drug", "weapon", "immigration", "sex", "other"]

        //line chart

        var y = d3.scale.linear()
            .domain([0, 220000])
            .range([height, 0], .1);

        var x = d3.scale.linear()
            .domain(d3.extent(data, function (d) {
                return d.year;
            }))
            .range([0, width]);

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
                return d[VALUE];
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

        var line = d3.svg.line()
            .interpolate("cardinal")
            .x(function (d) {
                return x(d.year);
            })
            .y(function (d) {
                return y(d.y + d.y0);
            });

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .tickFormat(function (d) {
                return d;
            })
            .ticks(10);

        var segments = svg.selectAll(".segment")
            .data(layers)
            .enter().append("g")
            .attr("class", "segment");

        segments.append("path")
            .attr("class", function (d) {
                return d.key + " layer graph1";
            })
            .attr("d", function (d) {
                return area(d.values);
            })
            .attr("opacity", 0);

        segments.append("path")
            .attr("class", function (d) {
                return d.key + " chartline graph1";
            })
            .attr("d", function (d) {
                return line(d.values);
            })
            .attr("opacity", 0);

        segments.append("text")
            .datum(function (d) {
                return {
                    name: d.key,
                    value: d.values[d.values.length - 1]
                };
            })
            .attr("class", "pointlabel graph1")
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
            .attr("class", "x axis-show axis1")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);
    }

    function init2() {
        data = (data_main.sentences).filter(function (d) {
            return d.offense == "total";
        });

        var y = d3.scale.linear()
            .domain([0, 220000])
            .range([height, 0], .1);

        var x = d3.scale.linear()
            .domain(d3.extent(data, function (d) {
                return d.year;
            }))
            .range([0, width]);

        var LINEVARS = ["standing", "admissions"];
        var LABELS = ["Standing population", "Admissions"];

        var line = d3.svg.line()
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
            .data(types)
            .enter().append("g")
            .attr("class", "lines");

        lines.append("path")
            .attr("class", function (d) {
                return d.name + " graph2 chartline";
            })
            .attr("d", function (d) {
                return line(d.values);
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
            .attr("class", "pointlabel graph2")
            .attr("text-anchor", "end")
            .attr("x", function (d) {
                return x(d.value.year);
            })
            .attr("y", function (d) {
                return y(d.value.number) + 15;
            })
            .text(function (d, i) {
                return LABELS[i];
            })
            .attr("opacity", 0);

    }

    init0();
    init1();
    init2();

    var gs = graphScroll()
        .container(d3.select('#container1'))
        .graph(d3.selectAll('#graphic1'))
        .sections(d3.selectAll('#section1 > div'))
        .on('active', function (i) {

            console.log("section1 " + i);
            if (i == 0) {

                d3.selectAll(".graph2, .graph1, .axis1")
                    .transition()
                    .duration(0)
                    .attr("opacity", 0)

                d3.select(".graph0, .axis0")
                    .transition()
                    .duration(500)
                    .attr("opacity", 1)

            } else if (i == 1) {

                d3.selectAll(".graph0, .graph2, .axis0")
                    .transition()
                    .duration(0)
                    .attr("opacity", 0)

                d3.selectAll(".graph1, .axis1")
                    .transition()
                    .duration(500)
                    .attr("opacity", 1)

            } else if (i == 2) {

                d3.selectAll(".graph0, .graph1")
                    .transition()
                    .duration(0)
                    .attr("opacity", 0)

                d3.selectAll(".graph2")
                    .transition()
                    .duration(1)
                    .attr("opacity", 1)

            } else if (i == 3) {
                svg.selectAll("*")
                    .remove();

                data = data_main.mandmin_drug;

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
            } else if (i == 2) {
                svg.selectAll("*")
                    .remove();

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

                var bars = svg.selectAll(".bar")
                    .data(data)
                    .enter()
                    .append("g")
                    .attr("class", "bar");

                bars.append("rect")
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

                var xAxis = d3.svg.axis()
                    .scale(x)
                    .tickSize(0)
                    .tickFormat(function (d, i) {
                        //return MONEY_MOBILE[i];
                        return d;
                    })
                    .orient("bottom");

                var gx = svg.append("g")
                    .attr("transform", "translate(0," + height + ")")
                    .attr("class", "x axis-show")
                    .call(xAxis);

                var barlabels = svg.selectAll(".point-label")
                    .data(data)
                    .enter()
                    .append("g")
                    .attr("class", "pointlabel");

                barlabels.append("text")
                    .attr("y", function (d) {
                        return y(d[VALUE]) - 8;
                    })
                    .attr("x", function (d) {
                        return x(d.category) + x.rangeBand() / 2;
                    })
                    .attr("text-anchor", "middle")
                    .text(function (d) {
                        return d3.format(",.0f")(d[VALUE]);
                    });

                svg.append("text")
                    .attr("class", "graphtitle")
                    .attr("text-anchor", "middle")
                    .attr("x", width / 2)
                    .attr("y", -10)
                    .text("Average expected time served");

                svg.append("text")
                    .attr("class", "axistitle")
                    .attr("text-anchor", "start")
                    .attr("x", 0)
                    .attr("y", height + 30)
                    .text("No criminal history");

                svg.append("text")
                    .attr("class", "axistitle")
                    .attr("text-anchor", "end")
                    .attr("x", width)
                    .attr("y", height + 30)
                    .text("Most criminal history");

            } else if (i == 3) {
                svg.selectAll("*")
                    .remove();

                //bar chart of criminal histories
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

                var bars = svg.selectAll(".bar")
                    .data(data)
                    .enter()
                    .append("g")
                    .attr("class", "bar");

                bars.append("rect")
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

                var xAxis = d3.svg.axis()
                    .scale(x)
                    .tickSize(0)
                    .tickFormat(function (d, i) {
                        //return MONEY_MOBILE[i];
                        return d;
                    })
                    .orient("bottom");

                var gx = svg.append("g")
                    .attr("transform", "translate(0," + height + ")")
                    .attr("class", "x axis-show")
                    .call(xAxis);

                var barlabels = svg.selectAll(".point-label")
                    .data(data)
                    .enter()
                    .append("g")
                    .attr("class", "pointlabel");

                barlabels.append("text")
                    .attr("y", function (d) {
                        return y(d[VALUE]) - 8;
                    })
                    .attr("x", function (d) {
                        return x(d.security) + x.rangeBand() / 2;
                    })
                    .attr("text-anchor", "middle")
                    .text(function (d) {
                        return d3.format(",.0f")(d[VALUE]);
                    });

                /*svg.append("text")
                    .attr("class", "graphtitle")
                    .attr("text-anchor", "middle")
                    .attr("x", width / 2)
                    .attr("y", -10)
                    .text("Average expected time served");
                
                svg.append("text")
                    .attr("class", "axistitle")
                    .attr("text-anchor", "start")
                    .attr("x", 0)
                    .attr("y", height + 30)
                    .text("Little or no criminal history");

                svg.append("text")
                    .attr("class", "axistitle")
                    .attr("text-anchor", "end")
                    .attr("x", width)
                    .attr("y", height + 30)
                    .text("Most criminal history");*/

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

    data = data_main.jointimpact;

    var LINEVARS = ["pop_baseline", "pop_jointimpact"];
    var LABELS = ["No policy changes", "All recommended interventions"];

    var y = d3.scale.linear()
        .domain([0, d3.max(data, function (d) {
            return d.pop_baseline;
        })])
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
        .orient("left")
        .ticks(6);

    var gy = svg.append("g")
        .attr("class", "y axis-show")
        .call(yAxis);

    var gx = svg.append("g")
        .attr("class", "x axis-show")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    var line = d3.svg.line()
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
            return y(d.value.number) + 15;
        })
        .text(function (d, i) {
            return LABELS[i];
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