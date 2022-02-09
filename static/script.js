//console.log("Hello!")

const MARGIN = {top: 10, bottom: 20, left: 40, right: 10}
var svg = d3.select("svg#viz")
const width = svg.attr('width')
const height = svg.attr('height')
const m_width = width - (MARGIN.left + MARGIN.right)
const m_height = height - (MARGIN.top + MARGIN.bottom)
//const map = svg.append('g').attr("transform",`translate(${MARGIN.left}, ${MARGIN.top})`);
const chart = svg.append('g').attr("transform",`translate(${MARGIN.left}, ${MARGIN.top})`);

console.log(svg)

const requestData = async function() {
    const sf = await d3.csv("Street_Tree_List-2022-01-30_FILTERED.csv")
    const context = await d3.json("SF-Neighborhoods.geo.json")
    const neighborhoods = topojson.feature(context, context.objects.SFNeighborhoods)

    const datefmt = "%m/%d/%y %H:%M"
    var dateparser = d3.timeParse(datefmt)

    // parse dates
    let n = 0
    sf.forEach(d => {
        let date = dateparser(d.PlantDate);

        if (date != null) { 
            let year = date.getFullYear()
            if (year > 2022) { date.setFullYear(year - 100) }
            d.date = date
        } else { d.date = new Date(1965, 0, 1); n++; }

    })

    console.log(sf)
    console.log("Number of missing dates: " + n)

    console.log(dateparser)
    var x_scale = d3.scaleTime()
        .domain(d3.extent(sf, d => d.date))
        .range([width - (MARGIN.left + MARGIN.right), 0])
    //var y_scale = d3.scaleLog()
    var y_scale = d3.scaleLinear()
        .domain(d3.extent(sf, d => d.DBH))
        .range([width - (MARGIN.left + MARGIN.right), 0])
    
    chart.selectAll("circle.tree").data(sf)
        .join("circle")
        .attr("class", "tree")
        .attr("fill", "#000")
        .attr("opacity", 0.2)
        .attr("r", 2)
        .attr('cx', d => x_scale(d.date))
        .attr('cy', d => y_scale(d.DBH));

    x_axis = d3.axisBottom().scale(x_scale)
    y_axis = d3.axisLeft().scale(y_scale)

    let axes = chart.append("g").attr("class", 'axes');
        axes.append('g').call(x_axis).attr('transform',`translate(0,${m_height})`)
        axes.append('g').call(y_axis)
    /*
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
    */
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
