(function(bnvis) {

    function drawMap(url) {
        d3.select("#visualization svg")
            .remove();

        d3.json(url, function (error, data) {
            var width = parseInt($('#visualization').css('width'), 10),
                height = 500,
                radius = height / 2.5;
        
            var edgecolors = d3.scale.category10();
            var nodecolors = d3.scale.ordinal().range(colorbrewer.Accent[8]);
            var radiusscale = d3.scale.linear().domain([0, 12]).range([4, 12]).clamp(true);
        
            var boxwidth = width * 0.8;
            var boxheight = height * 0.8;
            for (var ii = 0; ii < data.records.length; ii++) {
                data.records[ii].x = width / 2;
                data.records[ii].y = height / 2;
            }
            if (typeof data.landmarks !== 'undefined') {
                for (var ii = 0; ii < data.landmarks.length; ii++) {
                    data.records[data.recmap[data.landmarks[ii]]].x = 0.1 * width + (boxwidth / 2) + (boxwidth / 2) * Math.cos((2 * Math.PI / data.landmarks.length) * ii);
                    data.records[data.recmap[data.landmarks[ii]]].y = 0.1 * height + (boxheight / 2) + (boxheight / 2) * Math.sin((2 * Math.PI / data.landmarks.length) * ii);
                    data.records[data.recmap[data.landmarks[ii]]].fixed = true;
                }
            }
        
            var current;
            var opacity = 0.3;
            var linkopacity = 0;
        
            var svg = d3.select("#visualization").append("svg")
                .attr("width", width)
                .attr("height", height);
        
            var force = d3.layout.force()
                .charge(-800)
                .distance(60)
                .size([width, height])
                .nodes(data.records)
                .links(data.edges)
                .start();
        
            var drag = force.drag()
                .on("dragstart", dragstart);
        
            var link = svg.selectAll(".map-link")
                .data(data.edges)
                .enter().append("line")
                .attr("class", "link")
                .style("stroke", function (d) { return edgecolors(d._label); })
                .style("stroke-opacity", linkopacity);
        
            var node = svg.selectAll(".map-node")
                .data(data.records)
                .enter().append("g")
                .attr("class", "node")
                .style("stroke-opacity", opacity)
                .style("fill-opacity", opacity)
                .call(drag)
                .on("mouseover", mouseover)
                .on("mouseout", mouseout);
        
            node.append("circle")
                .attr("r", function (d) { return radiusscale(d.weight); })
                .style("stroke-width", "2px")
                .style("stroke", function (d) { return nodecolors(d.recordtype); });
        
            node.append("title")
                .text(function(d) { return d.key; });
        
            node.append("text")
                .attr("x", 12)
                .attr("dy", ".35em")
                .text(function(d) { return d.key; });
        
        
            force.on("tick", function() {
                link.attr("x1", function(d) { return d.source.x; })
                    .attr("y1", function(d) { return d.source.y; })
                    .attr("x2", function(d) { return d.target.x; })
                    .attr("y2", function(d) { return d.target.y; });
        
                node.attr("cx", function(d) { return d.x = Math.max(15, Math.min(width - 15, d.x)); })
                    .attr("cy", function(d) { return d.y = Math.max(15, Math.min(height - 15, d.y)); })
                    .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
            });
        
            function dragstart(d) {
                d.fixed = true;
                d3.select(this).classed("fixed", true);
            }
        
            function mouseover(d) {
                /*d3.select(this).select("circle").transition()
                      .duration(750)
                      .attr("r", 16);*/
                current = d;
                highlight();
            }
        
            function mouseout(d) {
                /*d3.select(this).select("circle").transition()
                      .duration(750)
                      .attr("r", 8);*/
                current = null;
                highlight();
            }
        
            function neighboring(a, b) {
                if (a && b) {
                    for (var ii = 0; ii < data.edges.length; ii++) {
                        if ((data.edges[ii].source === a && data.edges[ii].target === b)
                                || (data.edges[ii].source === b && data.edges[ii].target === a)) {
                            return true;
                        }
                    }
                }
                return false;
            }
        
            function highlight() {
                node.style("stroke-opacity", function (d) {
                    return (neighboring(current, d) || current === d ? 1 : opacity);
                })
                .style("fill-opacity", function (d) {
                    return (neighboring(current, d) || current === d ? 1 : opacity);
                });
                link.style("stroke-opacity", function (d) {
                    return d.source === current || d.target === current ? 1 : linkopacity;
                });
            }
        });
    }

    bnvis.landmarks = function (landmarks) {
        var url = "/map?";
        landmarks.forEach(function (landmark) {
            url += 'landmark=' + landmark + '&';
        });
        drawMap(url);
    }   

    bnvis.searchmap = function (search) {
        if (search.indexOf('?') === -1) {
            search += '?';
        } else {
            search += '&';
        }
        search += 'format=map';
        drawMap(search);
    }
}( window.bnvis = window.bnvis || {}));
