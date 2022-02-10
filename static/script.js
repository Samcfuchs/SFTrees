//console.log("Hello!")

const MARGIN = {top: 10, bottom: 50, left: 60, right: 10}
var svg = d3.select("svg#viz")
const width = svg.attr('width')
const height = svg.attr('height')
const m_width = width - (MARGIN.left + MARGIN.right)
const m_height = height - (MARGIN.top + MARGIN.bottom)
//const map = svg.append('g').attr("transform",`translate(${MARGIN.left}, ${MARGIN.top})`);
const chart = svg.append('g').attr("transform",`translate(${MARGIN.left}, ${MARGIN.top})`);

const map_margin = {top:20, bottom:20, left:20, right:20}
const map = d3.select('svg#map').append('g')
    .attr('transform', `translate(${map_margin.left}, ${map_margin.top})`);
const map_width = d3.select('svg#map').attr('width') - (map_margin.left + map_margin.right)
const map_height = d3.select('svg#map').attr('height') - (map_margin.top + map_margin.bottom)

console.log(svg)

let dateDiff = function(date1, date2) {
    let yearDiff = date2.getFullYear() - date1.getFullYear();
    let monthDiff = date2.getMonth() - date1.getMonth();
    return (yearDiff * 12) + monthDiff
}

const requestData = async function() {
    let  sf = await d3.csv("Street_Tree_List-2022-01-30_FILTERED.csv")
    let  sf_withyear = sf.filter(d => d.PlantDate != "")

    const datefmt = "%m/%d/%y %H:%M"
    var dateparser = d3.timeParse(datefmt)

    // parse dates
    sf = sf_withyear
    let n = 0
    let now = new Date()
    sf.forEach(d => {
        let date = dateparser(d.PlantDate);

        if (date != null) { 
            let year = date.getFullYear()
            if (year > 2022) { date.setFullYear(year - 100) }
            d.date = date
            d.age_months = dateDiff(date, now)
        } else { 
            d.date = new Date(1965, 0, 1);
            n++;
            d.age_months = 0
        }

        d.age_yrs = d.age_months / 12

    })

    console.log(sf)
    console.log("Number of missing dates: " + n)

    console.log(dateparser)
    var x_scale_time = d3.scaleTime()
        .domain(d3.extent(sf, d => d.date))
        .range([width - (MARGIN.left + MARGIN.right), 0])
    var x_scale = d3.scaleLinear()
        .domain(d3.extent(sf, d => d.age_months))
        .range([0, m_width])
    //var y_scale = d3.scaleLog()
    var y_scale = d3.scaleLinear()
        .domain(d3.extent(sf, d => d.DBH))
        .range([m_height, 0])
    
    let points = chart.append('g').attr('class','points');
    points.selectAll("circle.tree").data(sf)
        .join("circle")
        .attr("class", "tree")
        .attr("opacity", 0.2)
        .attr("r", 4)
        //.attr('cx', d => x_scale(d.date))
        .attr('cx', d => x_scale(d.age_months))
        .attr('cy', d => y_scale(d.DBH));

    // Make a version of x_scale that's in years
    let x_scale_yrs = x_scale
    let domain = x_scale.domain()
    x_scale_yrs.domain([domain[0]/12, domain[1] / 12])

    // Create visual axes
    x_axis = d3.axisBottom().scale(x_scale_yrs)
    y_axis = d3.axisLeft().scale(y_scale)

    // Add axes to the svg
    let axes = chart.append("g").attr("class", 'axes');
        axes.append('g').call(x_axis).attr('transform',`translate(0,${m_height})`)
        axes.append('g').call(y_axis)
    
    // Add axis labels
    let axis_labels = chart.append('g').attr('class','label')
    axis_labels.append('text').text('Tree age (years)')
        .attr('x', m_width / 2)
        .attr('y', y_scale(0) + 40)
        .attr('text-anchor', 'middle')
    axis_labels.append('text').text('Tree Diameter')
        .attr('x', x_scale(-4))
        .attr('y', m_height / 2)
        .attr('text-anchor', 'middle')
        .attr('transform', `rotate(-90, ${x_scale(-4)},${m_height/2})`);
    
    // Overlay line plot
    const line_gen = d3.line()
        .x( d => x_scale_yrs(d.years) )
        .y( d => y_scale(d.mean) )
        .curve(d3.curveMonotoneX);

    // Generate data for line plot
    let lineData = []
    let ext =  d3.extent(sf, d => d.age_yrs)

    for (let i = 0; i <= ext[1]; i++) {
        lineData.push({years: i, n: 0, sum: 0})
    }

    sf.forEach(d => {
        let age = Math.floor(d.age_yrs)
        lineData[age].n++;
        lineData[age].sum += parseFloat(d.DBH);
    })

    lineData.forEach(d_yr => {
        d_yr.mean = d_yr.sum / d_yr.n;
        if (isNaN(d_yr.mean)) { console.log(d_yr.mean); d_yr.mean = 0 }
    })

    lineData = lineData.filter(d => d.n > 0)

    console.log(lineData)

    
    let line = chart.append("path").datum(lineData)
        .attr('class', 'line')
        .attr('fill', 'none')
        .attr('d', line_gen)

    console.log(line)


    // MAP CODE BELOW


    const context = await d3.json("SF-Neighborhoods.geo.json")
    const neighborhoods = topojson.feature(context, context.objects.SFNeighborhoods)
    const size_cutoff = 40
    // Map stuff
    var projection = d3.geoMercator().fitSize([map_width, map_height], neighborhoods)
    var path = d3.geoPath().projection(projection)

    map.selectAll("path.hood").data(neighborhoods.features)
        .join("path")
        .attr("class", "hood")
        .attr("d", path)
        .attr('fill', '#fff')
        .attr('stroke', '#999');
    
    sf.forEach(function(d) { d.position = projection([d.Longitude, d.Latitude])})

    map.selectAll("circle.point").data(sf.filter(d => d.DBH >= size_cutoff))
        .join("circle")
        .attr("class", "point")
        .attr('r', 3)
        .attr('fill', '#383')
        .attr('opacity', 0.9)
        .attr('cx', d => d.position[0])
        .attr('cy', d => d.position[1])

    
    // DETAIL STUFF


    let svg = d3.select('svg#detail')
    new_size_cutoff = 25
    let sf_f = sf.filter(d => d.DBH < new_size_cutoff)
    const d_margin = {bottom: 50, left: 60, top:20, right: 20}
    const d_width = svg.attr('width') - (d_margin.left + d_margin.right)
    const d_height = svg.attr('height') - (d_margin.top + d_margin.bottom)
    const inset = svg.append('g').attr("transform",`translate(${d_margin.left}, ${d_margin.top})`);

    var x_scale = d3.scaleLinear()
        .domain(d3.extent(sf_f, d => d.age_months))
        .range([0, d_width])
    var y_scale = d3.scaleLinear()
        .domain([0, new_size_cutoff])
        .range([d_height, 0])
    
    console.log("y range " + y_scale.domain())
    
    points = inset.append('g').attr('class','points');
    points.selectAll("circle.tree").data(sf_f)
        .join("circle")
        .attr("class", "tree")
        .attr("opacity", 0.2)
        .attr("r", 2)
        .attr('cx', d => x_scale(d.age_months))
        .attr('cy', d => y_scale(d.DBH));

    // Make a version of x_scale that's in years
    x_scale_yrs = x_scale
    domain = x_scale.domain()
    x_scale_yrs.domain([domain[0]/12, domain[1] / 12])

    // Create visual axes
    x_axis = d3.axisBottom().scale(x_scale_yrs)
    y_axis = d3.axisLeft().scale(y_scale)

    // Add axes to the svg
    axes = inset.append("g").attr("class", 'axes');
        axes.append('g').call(x_axis).attr('transform',`translate(0,${d_height})`)
        axes.append('g').call(y_axis)
    
    // Add axis labels
    axis_labels = inset.append('g').attr('class','label')
    axis_labels.append('text').text('Tree age (years)')
        .attr('x', d_width / 2)
        .attr('y', y_scale(0) + 40)
        .attr('text-anchor', 'middle')
    axis_labels.append('text').text('Tree Diameter')
        .attr('x', x_scale(-7))
        .attr('y', d_height / 2)
        .attr('text-anchor', 'middle')
        .attr('transform', `rotate(-90, ${x_scale(-7)},${d_height/2})`);

    const line_gen_inset = d3.line()
        .x( d => x_scale_yrs(d.years) )
        .y( d => y_scale(d.mean) )
        .curve(d3.curveBundle.beta(0.3));

    inset.append("path").datum(lineData)
        .attr('class', 'line')
        .attr('fill', 'none')
        .attr('d', line_gen_inset)
}
requestData()
//d3.scaleLinear().domain(extent).range(0,width)
