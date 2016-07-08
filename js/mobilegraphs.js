var mainyears = [1994, 1998, 2002, 2006, 2010, 2014];

function formatYear(d) {
    return "'" + d.toString().slice(-2);
}

function mobileGrowth(div) {
    var $div = $(div);

    var margin = {
        top: 30,
        right: 15,
        bottom: 35,
        left: 60
    };

    var width = $div.width() - margin.left - margin.right,
        height = Math.max(275 - margin.top - margin.bottom,
            Math.min(Math.ceil(width * 1.1) - margin.top - margin.bottom, windowHeight - 100 - margin.top - margin.bottom));

    $div.empty();

    var svg = d3.select(div).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //line chart common elements
    var y = d3.scale.linear()
        .range([height, 0])
        .domain([0, 220000]);

    svg.append("text")
        .attr("class", "axistitle")
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
        .attr("class", "y axis")
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
        .ticks(6)
        .tickFormat(function (d) {
            return formatYear(d);
        })
        .orient("bottom");

    var gx = svg.append("g")
        .attr("class", "x axis-show")
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
            return d.name + " chartline";
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
                return y(d.value.number) - 40;
            } else {
                //return y(d.value.number) + 70;
                return y(120000) + 15
            }
        })
        .text(function (d, i) {
            return LABELS[i];
        })
        .attr("opacity", 1)
        .call(wrap2, width * 0.5, width);

}

function mobileDrivers(div) {
    var $div = $(div);

    var margin = {
        top: 40,
        right: 15,
        bottom: 35,
        left: 60
    };

    var width = $div.width() - margin.left - margin.right,
        height = Math.max(275 - margin.top - margin.bottom,
            Math.min(Math.ceil(width * 1.1) - margin.top - margin.bottom, windowHeight - 100 - margin.top - margin.bottom));

    $div.empty();

    var svg = d3.select(div).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var y = d3.scale.linear()
        .range([height, 0])
        .domain([0, 220000]);

    svg.append("text")
        .attr("class", "axistitle")
        .attr("text-anchor", "start")
        .attr("x", -margin.left)
        .attr("y", -25)
        .text("Federal prison population");

    var yAxis = d3.svg.axis()
        .scale(y)
        .tickSize(-width)
        .ticks(5)
        .orient("left");

    var gy = svg.append("g")
        .attr("class", "y axis mobilelinesaxis")
        .call(yAxis);

    gy.selectAll("text")
        .attr("dx", -8);

    gy.selectAll("g").filter(function (d) {
            return d;
        })
        .classed("minor", true);

    data = data_main.sentences.filter(function (d) {
        return d.offense == "total";
    });

    var LINEVARS = ["standing", "admissions"];
    var LABELS = ["Federally sentenced population", "Admissions"];

    var x = d3.scale.linear()
        .domain(d3.extent(data, function (d) {
            return d.year;
        }))
        .range([0, width]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .tickFormat(function (d) {
            return formatYear(d);
        })
        .tickValues(mainyears);

    var gx = svg.append("g")
        .attr("class", "x axis-show")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

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
            return d.name + " chartline";
        })
        .attr("d", function (d) {
            return line1(d.values);
        });

    //direct line labels
    lines.append("text")
        .attr("class", "pointlabel")
        .attr("text-anchor", "end")
        .attr("x", x(2014))
        /*.attr("y", function (d) {
            return y(d.values[d.values.length - 1]["number"]) - 20;
        })*/
        .attr("y", function (d) {
            if (d.name == "standing") {
                return y(d.values[d.values.length - 1]["number"]) - 15;
            } else {
                return y(d.values[d.values.length - 1]["number"]) + 15;
            }
        })
        .text(function (d, i) {
            return LABELS[i];
        });

    dispatch.on("changeGrowthLines", function (type) {
        //switch offense type in lines

        data = data_main.sentences.filter(function (d) {
            return d.offense == type;
        });

        var ymax = type == "total" ? 220000 : d3.max(data, function (d) {
            return d.standing;
        });

        y = d3.scale.linear()
            .range([height, 0])
            .domain([0, ymax]);

        yAxis = d3.svg.axis()
            .scale(y)
            .tickSize(-width)
            .ticks(5)
            .tickFormat(function (d) {
                return d3.format(",")(d);
            })
            .orient("left");

        d3.selectAll(".mobilelinesaxis")
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
            /*.attr("y", function (d) {
                return y(d.values[d.values.length - 1]["number"]) - 20;
            });*/
            .attr("y", function (d) {
                if (d.name == "standing") {
                    return y(d.values[d.values.length - 1]["number"]) - 15;
                } else {
                    return y(d.values[d.values.length - 1]["number"]) + 15;
                }
            })

    });
}

function mobileOffense(div) {
    var $div = $(div);

    data = data_main.sentences;

    var ORDER = ["other", "drug", "weapon", "immigration", "sex"];

    var margin = {
        top: 20,
        right: 15,
        bottom: 35,
        left: 60
    };


    var width = $div.width() - margin.left - margin.right,
        height = Math.max(275 - margin.top - margin.bottom,
            Math.min(Math.ceil(width * 1.1) - margin.top - margin.bottom, windowHeight - 100 - margin.top - margin.bottom));

    $div.empty();

    var svg = d3.select(div).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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
            return formatYear(d);
        })
        .tickValues(mainyears);

    var gx = svg.append("g")
        .attr("class", "x axis-show")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

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
        .attr("text-anchor", "start")
        .attr("x", -margin.left)
        .attr("y", -5)
        .text("Federal prison population");

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
            return d.key + " layer";
        })
        .attr("d", function (d) {
            return area(d.values);
        });

    segments.append("path")
        .attr("class", function (d) {
            return d.key + " chartline";
        })
        .attr("d", function (d) {
            return line2(d.values);
        });

    var labels = svg.selectAll(".offenselabel")
        .data(layers)
        .enter().append("g")
        .attr("class", "offenselabel");

    labels.append("text")
        .datum(function (d) {
            return {
                name: d.key,
                value: d.values[d.values.length - 1]
            };
        })
        .attr("class", function (d) {
            return d.name + " pointlabel";
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
        });
}

function mobileMm(div) {
    circleradius = 7;
    var $div = $(div);

    var margin = {
        top: 20,
        right: 8,
        bottom: 80,
        left: 8
    };


    var width = $div.width() - margin.left - margin.right,
        height = Math.max(300 - margin.top - margin.bottom,
            Math.min(Math.ceil(width * 1.3) - margin.top - margin.bottom, windowHeight - 100 - margin.top - margin.bottom));

    $div.empty();

    var svg = d3.select(div).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


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

    cells.append("rect")
        .attr("class", function (d) {
            return d.group + " circle";
        })
        .attr("x", function (d) {
            return d.xdig * (width / 10);
        })
        .attr("width", 2 * circleradius)
        .attr("height", 2 * circleradius)
        .attr("y", function (d) {
            return d.ydig * (height / 10) - 20;
        })
        .attr("rx", 2 * circleradius)
        .attr("ry", 2 * circleradius)
        .attr("opacity", 1);

    //category labels
    svg.append("text")
        .attr("class", "catvalue mandminlabel applied")
        .attr("text-anchor", "start")
        .attr("x", 0)
        .attr("y", height + 4)
        .text("59%")
        .attr("opacity", 1);

    svg.append("text")
        .attr("class", "axis mandminlabel")
        .attr("text-anchor", "start")
        .attr("x", 0)
        .attr("y", height + 10)
        .attr("opacity", 1)
        .text(MANDMINLABELS[0])
        .call(wrap2, width * 0.4, 0);

    svg.append("text")
        .attr("class", "catvalue mandminlabel notapplied")
        .attr("text-anchor", "start")
        .attr("x", width * 0.5)
        .attr("y", height + 4)
        .text("19%")
        .attr("opacity", 1);

    svg.append("text")
        .attr("class", "axis mandminlabel")
        .attr("text-anchor", "start")
        .attr("x", width * 0.6)
        .attr("y", height + 10)
        .attr("opacity", 1)
        .text(MANDMINLABELS[1])
        .call(wrap2, width * 0.2, width * 0.5);

    svg.append("text")
        .attr("class", "catvalue mandminlabel notapplicable")
        .attr("text-anchor", "start")
        .attr("x", width * 0.75)
        .attr("y", height + 4)
        .text("22%")
        .attr("opacity", 1);

    svg.append("text")
        .attr("class", "axis mandminlabel")
        .attr("text-anchor", "start")
        .attr("x", width * 0.8)
        .attr("y", height + 10)
        .attr("opacity", 1)
        .text(MANDMINLABELS[2])
        .call(wrap2, width * 0.22, width * 0.75);
}

function mobileYears(div) {
    var $div = $(div);

    var margin = {
        top: 20,
        right: 15,
        bottom: 70,
        left: 15
    };


    var width = $div.width() - margin.left - margin.right,
        height = Math.max(300 - margin.top - margin.bottom,
            Math.min(Math.ceil(width * 1.3) - margin.top - margin.bottom, windowHeight - 100 - margin.top - margin.bottom));

    $div.empty();

    var svg = d3.select(div).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    data = data_main.mandmin_drug;

    /*var x = d3.scale.linear()
        .range([0, width])
        .domain([0, 1]);*/
    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1)
        .domain(data.map(function (d) {
            return d.mm_status;
        }));

    var y = d3.scale.linear()
        .range([height - 20, 0])
        .domain([0, d3.max(data, function (d) {
            return d.years;
        })]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .tickSize(0)
        .tickFormat(function (d, i) {
            return MANDMINLABELS[i];
        })
        .orient("bottom");

    svg.append("text")
        .attr("class", "axistitle")
        .attr("text-anchor", "start")
        .attr("x", 0)
        .attr("y", -30)
        .text("Average expected years served");

    var bars = svg.selectAll(".rect")
        .data(data)
        .enter()
        .append("g")
        .attr("class", "rect");

    /*bars.append("rect")
        .attr('class', function (d) {
            return d.mm_status + " graph4";
        })
        .attr("x", function (d) {
            return x(d.share_cum - d.share);
        })
        .attr("width", function (d) {
            return x.range;
        })
        .attr("height", function (d) {
            return y(0) - y(d.years);
        })
        .attr("y", function (d) {
            return y(d.years);
        });

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
        .attr("text-anchor", "middle");*/

    bars.append("rect")
        .attr("class", function (d) {
            return d.mm_status;
        })
        .attr("x", function (d) {
            return x(d.mm_status);
        })
        .attr("width", x.rangeBand())
        .attr("y", function (d) {
            return y(d.years);
        })
        .attr("height", function (d) {
            return height - y(d.years);
        });

    bars.append("text")
        .attr("class", "pointlabel")
        .attr("y", function (d) {
            return y(d.years) - 8;
        })
        .attr("x", function (d) {
            return x(d.mm_status) + x.rangeBand() / 2;
        })
        .attr("text-anchor", "middle")
        .text(function (d) {
            return d3.format(".1f")(d.years) + " years";
        });


    var gx = svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .attr("class", "x axis-show")
        .call(xAxis)
        .selectAll(".tick text")
        .call(wrap, x.rangeBand());

    //category labels
    /*svg.append("text")
        .attr("class", "catvalue mandminlabel applied")
        .attr("text-anchor", "start")
        .attr("x", 0)
        .attr("y", height + 4)
        .text("59%");

    svg.append("text")
        .attr("class", "graphtitle mandminlabel")
        .attr("text-anchor", "start")
        .attr("x", 0)
        .attr("y", height + 10)
        .text(MANDMINLABELS[0])
        .call(wrap2, width * 0.4, 0);

    svg.append("text")
        .attr("class", "catvalue mandminlabel notapplied")
        .attr("text-anchor", "start")
        .attr("x", width * 0.6)
        .attr("y", height + 4)
        .text("19%");

    svg.append("text")
        .attr("class", "graphtitle mandminlabel")
        .attr("text-anchor", "start")
        .attr("x", width * 0.6)
        .attr("y", height + 10)
        .text(MANDMINLABELS[1])
        .call(wrap2, width * 0.2, width * 0.5);

    svg.append("text")
        .attr("class", "catvalue mandminlabel notapplicable")
        .attr("text-anchor", "start")
        .attr("x", width * 0.8)
        .attr("y", height + 4)
        .text("22%");

    svg.append("text")
        .attr("class", "graphtitle mandminlabel")
        .attr("text-anchor", "start")
        .attr("x", width * 0.8)
        .attr("y", height + 10)
        .text(MANDMINLABELS[2])
        .call(wrap2, width * 0.22, width * 0.8);*/

}

function mobileMap(div) {
    var $div = $(div);
    var $legend = $("#mobilelegend");

    var margin = {
        top: 15,
        right: 20,
        bottom: 15,
        left: 20
    };


    var width = $div.width() - margin.left - margin.right,
        height = Math.ceil(width * 0.75) - margin.top - margin.bottom;

    $div.empty();
    $legend.empty();

    var svg = d3.select(div).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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
        .attr("class", "districts")
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
        .attr("class", "complexes")
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
        .attr("class", "centroids")
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
            return d.districtcode + " sentence-arcs";
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

    var legsvg = d3.select("#mobilelegend").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", 50 + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //legend in separate SVG
    var lp_w = 0,
        ls_w = width / 5,
        ls_h = 20;

    var legend = legsvg.selectAll("g.legend")
        .data(LEGENDBREAKS)
        .enter().append("g")
        .attr("class", "legend");

    legend.append("text")
        .data(LEGENDBREAKS)
        .attr("class", "pointlabel")
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
        .attr("x", function (d, i) {
            return (i * ls_w) + lp_w;
        })
        .attr("y", 15)
        .attr("width", ls_w)
        .attr("height", ls_h)
        .style("fill", function (d, i) {
            return blue5[i];
        })

    legsvg.append("text")
        .attr("class", "axistitle")
        .attr("text-anchor", "start")
        .attr("x", lp_w)
        .attr("y", 10)
        .text("Number of people sentenced");
}

function mobileRace(div) {
    var $div = $(div);

    data = data_main.race;

    var margin = {
        top: 20,
        right: 15,
        bottom: 35,
        left: 60
    };


    var width = $div.width() - margin.left - margin.right,
        height = Math.max(275 - margin.top - margin.bottom,
            Math.min(Math.ceil(width * 1.1) - margin.top - margin.bottom, windowHeight - 100 - margin.top - margin.bottom));

    $div.empty();

    var svg = d3.select(div).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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
            return formatYear(d);
        })
        .tickValues(mainyears);

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
        .attr("text-anchor", "start")
        .attr("x", -margin.left)
        .attr("y", -5)
        .text("Federal prison population");

    var nest = d3.nest()
        .key(function (d) {
            return d.race;
        })
        .sortKeys(function (a, b) {
            return RACEORDER.indexOf(a) - RACEORDER.indexOf(b);
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
            return d.key + " layer";
        })
        .attr("d", function (d) {
            return area(d.values);
        });

    racegroups.append("path")
        .attr("class", function (d) {
            return d.key + " chartline";
        })
        .attr("d", function (d) {
            return line1(d.values);
        });

    var labels = svg.selectAll(".racelabel")
        .data(layers)
        .enter().append("g")
        .attr("class", "racelabel");

    labels.append("text")
        .datum(function (d) {
            return {
                name: d.key,
                value: d.values[d.values.length - 1]
            };
        })
        .attr("class", function (d) {
            return d.name + " pointlabel";
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
        });

    var gx = svg.append("g")
        .attr("class", "x axis-show")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);
}

function mobileCh(div) {
    var $div = $(div);

    //bar chart of criminal histories
    data = data_main.histories.filter(function (d) {
        return d.offense == "drug";
    });

    var margin = {
        top: 30,
        right: 15,
        bottom: 65,
        left: 15
    };


    var width = $div.width() - margin.left - margin.right,
        height = Math.max(275 - margin.top - margin.bottom,
            Math.min(Math.ceil(width * 1.1) - margin.top - margin.bottom, windowHeight - 100 - margin.top - margin.bottom));

    $div.empty();

    var svg = d3.select(div).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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

    var bars = svg.selectAll(".bar")
        .data(data, function (d) {
            return d.category;
        })
        .enter()
        .append("g")
        .attr("class", "bar");

    bars.append("rect")
        .attr("class", "bar")
        .attr("x", function (d) {
            return x(d.category);
        })
        .attr("width", x.rangeBand())
        .attr("y", function (d) {
            return y(d.number);
        })
        .attr("height", function (d) {
            return height - y(d.number);
        });

    bars.append("text")
        .attr("class", "pointlabel")
        .attr("y", function (d) {
            return y(d.number) - 8;
        })
        .attr("x", function (d) {
            return x(d.category) + x.rangeBand() / 2;
        })
        .attr("text-anchor", "middle")
        .text(function (d) {
            return d3.format(",.0f")(d.number);
        });

    var gx = svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .attr("class", "x axis-show")
        .call(xAxis);

    svg.append("text")
        .attr("class", "axistitle")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + 30)
        .text("Criminal history category");

    svg.append("text")
        .attr("class", "axis")
        .attr("text-anchor", "middle")
        .attr("x", 0)
        .attr("y", height + 10)
        .text("No or minimal criminal history")
        .call(wrap2, x.rangeBand(), x.rangeBand() / 2);

    svg.append("text")
        .attr("class", "axis")
        .attr("text-anchor", "middle")
        .attr("x", width)
        .attr("y", height + 10)
        .text("Most criminal history")
        .call(wrap2, x.rangeBand(), width - x.rangeBand() / 2);

    dispatch.on("changeChBars", function (type) {
        //reset bars to a different offense type, based on dropdown value

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
            });

        bars.selectAll("text")
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
            });

    });
}

function mobileSecurity(div) {
    var $div = $(div);

    //bar chart of criminal histories
    data = data_main.security.filter(function (d) {
        return d.offense == "drug";
    });

    var margin = {
        top: 30,
        right: 15,
        bottom: 25,
        left: 15
    };


    var width = $div.width() - margin.left - margin.right,
        height = Math.max(275 - margin.top - margin.bottom,
            Math.min(Math.ceil(width * 1.1) - margin.top - margin.bottom, windowHeight - 100 - margin.top - margin.bottom));

    $div.empty();

    var svg = d3.select(div).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var y = d3.scale.linear()
        .range([height, 0])
        .domain([0, d3.max(data, function (d) {
            return d.number;
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
        .attr("class", "bar")
        .attr("x", function (d) {
            return x(d.security);
        })
        .attr("width", x.rangeBand())
        .attr("y", function (d) {
            return y(d.number);
        })
        .attr("height", function (d) {
            return height - y(d.number);
        });

    securitybars.append("text")
        .attr("class", "pointlabel")
        .attr("y", function (d) {
            return y(d.number) - 8;
        })
        .attr("x", function (d) {
            return x(d.security) + x.rangeBand() / 2;
        })
        .attr("text-anchor", "middle")
        .text(function (d) {
            return d3.format(",.0f")(d.number);
        });

    var gx = svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .attr("class", "x axis-show")
        .call(xAxis);

    dispatch.on("changeSecurityBars", function (type) {
        //reset bars to a different offense type, based on dropdown value

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

        securitybars.selectAll("text")
            .data(data, function (d) {
                return d.security;
            })
            .transition()
            .duration(500)
            .attr("y", function (d) {
                return y(d.number) - 8;
            })
            .text(function (d) {
                return d3.format(",.0f")(d.number);
            });

    });
}

function mobileConclusion(div) {
    var $div = $(div);

    var margin = {
        top: 20,
        right: 15,
        bottom: 35,
        left: 60
    };

    var width = $div.width() - margin.left - margin.right,
        height = Math.max(275 - margin.top - margin.bottom,
            Math.min(Math.ceil(width * 1.1) - margin.top - margin.bottom, windowHeight - 100 - margin.top - margin.bottom));

    $div.empty();

    var svg = d3.select(div).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    data = data_main.jointimpact;

    var LINEVARS = ["pop_baseline", "pop_jointimpact"];
    var LABELS = ["No policy changes", "All recommended reforms"];

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
            return formatYear(d);
        })
        .ticks(5);

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
        .attr("text-anchor", "start")
        .attr("x", -margin.left)
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
        .attr("class", "pointlabel")
        .attr("text-anchor", "end")
        .attr("x", function (d) {
            return x(d.value.year);
        })
        .attr("y", function (d) {
            if (d.name == "pop_baseline") {
                return y(d.value.number) - 15;
            } else {
                return y(d.value.number) + 15;
            }
        })
        .text(function (d, i) {
            return LABELS[i];
        });
}