var map_data_url = "data/judicialdistricts.json",
    districts,
    $graphic1 = $("#graphic1"),
    $graphic2 = $("#graphic2"),
    $graphic3 = $("#graphic3");

var chart_aspect_height = 1.75;
var margin = {
    top: 10,
    right: 15,
    bottom: 25,
    left: 25
};

var width = $graphic1.width() - margin.left - margin.right,
    height = 500;
console.log($graphic1.width(), width);

function graph1() {

    $graphic1.empty();

    var svg = d3.select("#graphic1").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("id", "svg1")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var gs = graphScroll()
        .container(d3.select('#container1'))
        .graph(d3.selectAll('#graphic1'))
        .sections(d3.selectAll('#section1 > div'))
        .on('active', function (i) {
            console.log("section1 " + i);
            d3.select("#svg1").selectAll("text")
                .remove();

            d3.select("#svg1").append("text")
                .attr("x", width / 2)
                .attr("y", height / 2)
                .attr("fill", "#000000")
                .html("section1 " + i);
        });
}

function graph2() {
    $graphic2.empty();

    var svg2 = d3.select("#graphic2").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("id", "svg2")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var gs2 = graphScroll()
        .container(d3.select('#container2'))
        .graph(d3.selectAll('#graphic2'))
        .sections(d3.selectAll('#section2 > div'))
        .on('active', function (i) {
            console.log("section2 " + i);
            d3.select("#svg2").selectAll("text")
                .remove();

            d3.select("#svg2").append("text")
                .attr("x", width / 2)
                .attr("y", height / 2)
                .attr("fill", "#000000")
                .html("section2 " + i);
        });
}

function graph3() {
    $graphic3.empty();

    var svg3 = d3.select("#graphic3").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("id", "svg3")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var gs3 = graphScroll()
        .container(d3.select('#container3'))
        .graph(d3.selectAll('#graphic3'))
        .sections(d3.selectAll('#section3 > div'))
        .on('active', function (i) {
            console.log("section3 " + i);
            d3.select("#svg3").selectAll("text")
                .remove();

            d3.select("#svg3").append("text")
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
        d3.json(map_data_url, function (json) {
            districts = json;
            drawgraphs();
            window.onresize = drawgraphs();
        });
    }
});