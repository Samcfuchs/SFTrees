//console.log("Hello!")

const MARGIN = {top: 10, bottom: 10, left: 10, right: 10}
var svg = d3.select("svg#viz")
const width = svg.attr('width')
const height = svg.attr('height')
const map = svg.append('g').attr("transform",`translate(${MARGIN.left}, ${MARGIN.top})`);

console.log(svg)

const requestData = async function() {
    const sf = await d3.csv("Street_Tree_List-2022-01-30_FILTERED.csv")
    console.log(sf)

    var x_scale = d3.scaleLinear().domain(d3.extent(sf, d => d.Longitude))
        .range([width - (MARGIN.left + MARGIN.right), 0]);
    var y_scale = d3.scaleLinear().domain(d3.extent(sf, d => d.Latitude))
        .range([height - (MARGIN.top + MARGIN.bottom), 0]);
    
    console.log(y_scale)
    
    d3.axisLeft(y_scale)
    d3.axisBottom(x_scale)

    map.selectAll("circle.point").data(sf)
        .join("circle")
        .attr("class", "point")
        .attr('r', 1)
        .attr('fill', '#000000')
        .attr('opacity', 0.25)
        .attr('cx', d => x_scale(d.Longitude))
        .attr('cy', d => y_scale(d.Latitude))

}
requestData()
//d3.scaleLinear().domain(extent).range(0,width)
