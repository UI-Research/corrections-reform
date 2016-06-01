var width = 500,
    height = 600,
    r = 40

function graph1() {
    var svg = d3.select('#graphic1')
        .append('svg')
        .attr("id", "svg1")
        .attr({
            width: width,
            height: height
        });

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
graph1();

function graph2() {
    var svg2 = d3.select('#graphic2')
        .append('svg')
        .attr("id", "svg2")
        .attr({
            width: width,
            height: 600
        });

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
graph2();

function graph3() {
    var svg3 = d3.select('#graphic3')
        .append('svg')
        .attr("id", "svg3")
        .attr({
            width: width,
            height: 500
        });

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
graph3();