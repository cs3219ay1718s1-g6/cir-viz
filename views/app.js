(function() {
    const svg = d3.select('svg');
    const width  = +svg.attr('width');
    const height = +svg.attr('height');

    const MAX_NODE_TEXT_LENGTH = 24

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const charge = d3.forceManyBody()
    charge.strength(-100)

    const simulation = d3.forceSimulation()
        .force('link', d3.forceLink().id(d => d.id))
        .force('charge', charge)
        .force('center', d3.forceCenter(width / 2, height  /2));

    
    const dragStarted = (d) => {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    const dragged = (d) => {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    const dragEnded = (d) => {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }


    d3.json(
        'http://localhost:3000/papers/web?count=2&title=Low-density%20parity%20check%20codes%20over%20GF(q)',
        (error, graph) => {
            if (error) throw error;

            let maxLevel = graph.nodes.map(n => n.level).reduce((a, v) => v > a ? v : a)

            let link = svg.append('g')
                .attr('class', 'links')
                .selectAll('line')
                .data(graph.links)
                .enter()
                .append('line')

            let node = svg.append('g')
                .attr('class', 'nodes')
                .selectAll('g.node')
                .data(graph.nodes)
                .enter()
                .append('g')
                .attr('class', 'node')
                .call(d3.drag()
                    .on('start', dragStarted)
                    .on('drag', dragged)
                    .on('end', dragEnded))

            node.append('circle')
                .attr('r', 15)
                .attr('fill', d => color(d.level))

            node.append('foreignObject')
                .attr('width', 30)
                .attr('height', 30)
                .attr('transform', 'translate(-15, -15)')
                .append('xhtml:body')
                .html(d => {
                    let title = d.title.trim()
                    if (title.length > MAX_NODE_TEXT_LENGTH) {
                        title = title.substring(0, MAX_NODE_TEXT_LENGTH) + '&hellip;'
                    }
                    return '<div>' + title + '</div>'
                })
      
            function collide(node) {
                var r = 0.1,
                    nx1 = node.x - r,
                    nx2 = node.x + r,
                    ny1 = node.y - r,
                    ny2 = node.y + r;
                return function (quad, x1, y1, x2, y2) {
                    if (quad.point && (quad.point !== node)) {
                        var x = node.x - quad.point.x,
                            y = node.y - quad.point.y,
                            l = Math.sqrt(x * x + y * y),
                            r = node.radius + quad.point.radius;
                        if (l < r) {
                            l = (l - r) / l * .5;
                            node.x -= x *= l;
                            node.y -= y *= l;
                            quad.point.x += x;
                            quad.point.y += y;
                        }
                    }
                    return x1 > nx2
                        || x2 < nx1
                        || y1 > ny2
                        || y2 < ny1;
                };
            }


            const ticked = () => {
                let q = d3.quadtree(graph.nodes)

                for (let node of graph.nodes) {
                    q.visit(collide(node))
                }

                link.attr('x1', d => d.source.x)
                    .attr('y1', d => d.source.y)
                    .attr('x2', d => d.target.x)
                    .attr('y2', d => d.target.y)

                node.attr('transform', d => `translate(${d.x}, ${d.y})`)
            }

            simulation.nodes(graph.nodes)
                .on('tick', ticked)

            simulation.force('link')
                .links(graph.links)

        })
})()