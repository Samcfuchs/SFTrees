//console.log("Hello!")

const MARGIN = {top: 10, bottom: 10, left: 10, right: 10}
var svg = d3.select("svg#viz")
const width = svg.attr('width')
const height = svg.attr('height')
const m_width = width - (MARGIN.left + MARGIN.right)
const m_height = height - (MARGIN.top + MARGIN.bottom)
const map = svg.append('g').attr("transform",`translate(${MARGIN.left}, ${MARGIN.top})`);

console.log(svg)

const requestData = async function() {
    const sf = await d3.csv("Street_Tree_List-2022-01-30_FILTERED.csv")
    const context = await d3.json("SF-Neighborhoods.geo.json")
    const neighborhoods = topojson.feature(context, context.objects.SFNeighborhoods)
    

    console.log(sf)

    // Map stuff
    var projection = d3.geoMercator().fitSize([m_width, m_height], neighborhoods)
    var path = d3.geoPath().projection(projection)

    map.selectAll("path.hood").data(neighborhoods.features)
        .join("path")
        .attr("class", "hood")
        .attr("d", path)

        .attr('fill', '#fff')
        .attr('stroke', 'coral');
    
    sf.forEach(function(d) { d.position = projection([d.Longitude, d.Latitude])})

    map.selectAll("circle.point").data(sf)
        .join("circle")
        .attr("class", "point")
        .attr('r', 1)
        .attr('fill', '#000')
        .attr('opacity', 0.25)
        .attr('cx', d => d.position[0])
        .attr('cy', d => d.position[1])
    // Old isometric stuff
    var x_scale = d3.scaleLinear().domain(d3.extent(sf, d => d.Longitude))
        .range([width - (MARGIN.left + MARGIN.right), 0]);
    var y_scale = d3.scaleLinear().domain(d3.extent(sf, d => d.Latitude))
        .range([height - (MARGIN.top + MARGIN.bottom), 0]);
    
    d3.axisLeft(y_scale)
    d3.axisBottom(x_scale)

    /*
    map.selectAll("circle.point").data(sf)
        .join("circle")
        .attr("class", "point")
        .attr('r', 1)
        .attr('fill', '#000000')
        .attr('opacity', 0.25)
        .attr('cx', d => x_scale(d.Longitude))
        .attr('cy', d => y_scale(d.Latitude))
    */

}
requestData()
//d3.scaleLinear().domain(extent).range(0,width)
