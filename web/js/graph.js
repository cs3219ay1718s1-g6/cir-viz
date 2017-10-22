var colors = [ '#FE3F45', '#FE871A', '#FEBC41', '#98CE2C', '#0B99C9', '#36B5E4', '#d9d9d9', '#bdbdbd', '#969696', '#636363' ];

function donutChart() {
    var width,
        height,
        margin = {top: 0, right: 15, bottom: 15, left: 15},
        colour = d3.scaleOrdinal(colors), // colour scheme
        variable, // value in data that will dictate proportions on chart
        category, // compare data by
        padAngle, // effectively dictates the gap between slices
        floatFormat = d3.format('.4r'),
        cornerRadius, // sets how rounded the corners are on each slice
        percentFormat = d3.format(',.2%');

    function chart(selection){
        selection.each(function(data) {
            // generate chart

            // ===========================================================================================
            // Set up constructors for making donut. See https://github.com/d3/d3-shape/blob/master/README.md
            var radius = Math.min(width, height) / 2;

            // creates a new pie generator
            var pie = d3.pie()
                .value(function(d) { return floatFormat(d[variable]); })
                .sort(null);
                
            // contructs and arc generator. This will be used for the donut. The difference between outer and inner
            // radius will dictate the thickness of the donut
            var arc = d3.arc()
                .outerRadius(radius * 0.8)
                .innerRadius(radius * 0.6)
                .cornerRadius(cornerRadius)
                .padAngle(padAngle);

            // this arc is used for aligning the text labels
            var outerArc = d3.arc()
                .outerRadius(radius * 0.95)
                .innerRadius(radius * 0.95);

            var arcOver = d3.arc()
                .outerRadius(radius * 0.8 + 10)
                .innerRadius(radius * 0.6)
                .cornerRadius(cornerRadius)
                .padAngle(padAngle);

            // ===========================================================================================

            // ===========================================================================================
            // append the svg object to the selection
            var svg = selection.append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
              .append('g')
                .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');
            // ===========================================================================================

            // ===========================================================================================
            // g elements to keep elements within svg modular
            svg.append('g').attr('class', 'slices');
            svg.append('g').attr('class', 'labelName');
            svg.append('g').attr('class', 'lines');
            // ===========================================================================================

            // ===========================================================================================
            // add and colour the donut slices
            var path = svg.select('.slices')
                .datum(data).selectAll('path')
                .data(pie)
              .enter().append('path')
                .style("fill", function(d) { return colour(d.data[category]); })
                .transition().delay(function(d,i) {
                return i * 80; }).duration(100)
                .attrTween('d', function(d) {
                    var i = d3.interpolate(d.startAngle+0.1, d.endAngle);
                    return function(t) {
                        d.endAngle = i(t); 
                        return arc(d)
            }
        }); 
            // ===========================================================================================

            // ===========================================================================================
            // add text labels
            var label = svg.select('.labelName').selectAll('text')
                .data(pie)
              .enter().append('text')
                .attr('dy', '.35em')
                .html(function(d) {
                    // add "key: value" for given category. Number inside tspan is bolded in stylesheet.
                    return d.data[category] + ' <tspan>[' + percentFormat(d.data[variable]) + ']</tspan>';
                })
                .attr('transform', function(d) {

                    // effectively computes the centre of the slice.
                    // see https://github.com/d3/d3-shape/blob/master/README.md#arc_centroid
                    var pos = outerArc.centroid(d);

                    // changes the point to be on left or right depending on where label is.
                    pos[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
                    return 'translate(' + pos + ')';
                })
                .style('text-anchor', function(d) {
                    // if slice centre is on the left, anchor text to start, otherwise anchor to end
                    return (midAngle(d)) < Math.PI ? 'start' : 'end';
                });
            // ===========================================================================================

            // ===========================================================================================
            // add lines connecting labels to slice. A polyline creates straight lines connecting several points
            var polyline = svg.select('.lines')
                .selectAll('polyline')
                .data(pie)
              .enter().append('polyline')
                .attr('points', function(d) {

                    // see label transform function for explanations of these three lines.
                    var pos = outerArc.centroid(d);
                    pos[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
                    return [arc.centroid(d), outerArc.centroid(d), pos]
                });
            // ===========================================================================================

            // ===========================================================================================
            // add tooltip to mouse events on slices and labels
            d3.selectAll('.labelName text, .slices path').call(toolTip);
            // ===========================================================================================

            // ===========================================================================================
            // Functions

            // calculates the angle for the middle of a slice
            function midAngle(d) { return d.startAngle + (d.endAngle - d.startAngle) / 2; }

            // function that creates and adds the tool tip to a selected element
            function toolTip(selection) {

                // add tooltip (svg circle element) when mouse enters label or slice
                selection.on('mouseenter', function (data) {

                    svg.append('text')
                        .attr('class', 'toolCircle')
                        .attr('dy', -15) // hard-coded. can adjust this to adjust text vertical alignment in tooltip
                        .html(toolTipHTML(data)) // add text to the circle.
                        .style('font-size', '.9em')
                        .style('text-anchor', 'middle'); // centres text in tooltip

                    svg.append('circle')
                        .attr('class', 'toolCircle')
                        .attr('r', radius * 0.6) // radius of tooltip circle
                        .style('fill', colour(data.data[category])) // colour based on category mouse is over
                        .style('fill-opacity', 0.1);

                    d3.select(this).transition()
                        .duration(100)
                        .attr("d", arcOver);

                });

                // remove the tooltip when mouse leaves the slice/label
                selection.on('mouseout', function () {
                    d3.selectAll('.toolCircle').remove();
                    d3.select(this).transition()
                        .duration(500)
                        .attr("d", arc);
                 });
            }

            // function to create the HTML string for the tool tip. Loops through each key in data object
            // and returns the html string key: value
            function toolTipHTML(data) {

                var tip = '',
                    i   = 0,
                    columns = (data.data.columns) ? data.data.columns : null;

                
                for(var key in columns) {

                	if(columns.hasOwnProperty(key)) {

               			// if value is a decimal, format it as a percentage
               			var title = columns[key];
                		var value = data.data[key];
                		if(key === 'percentage') { value = percentFormat(value); }

                	 	// leave off 'dy' attr for first tspan so the 'dy' attr on text element works. The 'dy' attr on
                    	// tspan effectively imitates a line break.
	                    if (i === 0) tip += '<tspan x="0">' + title + ': ' + value + '</tspan>';
	                    else tip += '<tspan x="0" dy="1.2em">' + title + ': ' + value + '</tspan>';
	                    i++;
                	};
                };

                return tip;
            }
            // ===========================================================================================

        });
    }

    // getter and setter functions. See Mike Bostocks post "Towards Reusable Charts" for a tutorial on how this works.
    chart.width = function(value) {
        if (!arguments.length) return width;
        width = value;
        return chart;
    };

    chart.height = function(value) {
        if (!arguments.length) return height;
        height = value;
        return chart;
    };

    chart.margin = function(value) {
        if (!arguments.length) return margin;
        margin = value;
        return chart;
    };

    chart.radius = function(value) {
        if (!arguments.length) return radius;
        radius = value;
        return chart;
    };

    chart.padAngle = function(value) {
        if (!arguments.length) return padAngle;
        padAngle = value;
        return chart;
    };

    chart.cornerRadius = function(value) {
        if (!arguments.length) return cornerRadius;
        cornerRadius = value;
        return chart;
    };

    chart.colour = function(value) {
        if (!arguments.length) return colour;
        colour = value;
        return chart;
    };

    chart.variable = function(value) {
        if (!arguments.length) return variable;
        variable = value;
        return chart;
    };

    chart.category = function(value) {
        if (!arguments.length) return category;
        category = value;
        return chart;
    };

    return chart;
}

function barChart(id) {

     $('#' + id).empty(); 

    // set the dimensions and margins of the graph
    var margin = {top: 0, right: 60, bottom: 0, left: 40},
        viewboxWidth = 960;
        viewboxHeight = 400;
        width = viewboxWidth - margin.left - margin.right,
        height = viewboxHeight - margin.top - margin.bottom;

    // set the ranges
    var x = d3.scaleBand().range([0, width]).padding(0.1);
    var y = d3.scaleLinear().range([height, 0]);

    // append the svg object to the body of the page
    var svg = d3.select("#" + id).append("svg")
        .attr('preserveAspectRatio', 'none')
        .attr('viewBox', '0 0 ' + viewboxWidth + ' ' + viewboxHeight)
        .append("g")
        .attr("transform", 
              "translate(" + margin.left + "," + margin.top + ")");

    chart = function() { };
    
    chart.drawChart = function (data) {

      // Scale the range of the data in the domains
      x.domain(data.map(function(d) { return d.label; }));
      y.domain([0, d3.max(data, function(d) { return d.value; })]);
      // append the rectangles for the bar chart
      var bars = svg.selectAll(".bar")
          .data(data);
      
      bars.enter().append("rect")
          .attr("class", "bar")
          .attr("fill", function(d) { return d.color; });
      
      bars.exit()
        .transition()
        .duration(300)
        .ease(d3.easeExp)
          .attr("height", 0)
          .remove();
      
      bars.transition()
        .duration(1000)
        .ease(d3.easeQuad)
          .attr("x", function(d) { return x(d.label); })
          .attr("width", x.bandwidth())
          .attr("y", function(d) { return y(d.value); })
          .attr("height", function(d) { return height - y(d.value); });
      
      //append text labels
   /*   var labels = svg.selectAll(".label")
          .data(data)
          .enter()
          .append("text")
          .attr("class", "label")
          .attr("fill", function(d) {return '#FFF';})
          .text(function(d) {return d.label;})
          .attr("x", function(d) { return x(d.label) + (x.bandwidth()/2); })
          .attr("y", height + 10)
          .attr('textLength', x.bandwidth() - 10)
          .attr('lengthAdjust', 'spacingAndGlyphs')
          .exit()
          .remove();
*/
      // append amounts
      var amounts = svg.selectAll(".amount")
          .data(data);
      amounts.enter()
          .append("text")
          .attr("class", "amount");
      
      amounts.exit()
        .transition()
        .duration(1000)
        .ease(d3.easeExp)
            .attr("y", 0)
            .remove()
      
      var format = d3.format(",d");
      amounts.transition()
        .duration(1000)
        .ease(d3.easeQuad)
          .tween("text", function(d) {
                var that = d3.select(this),
                    i = d3.interpolateNumber(0, d.value);
                return function(t) { that.text(format(i(t))); };
              })
          .attr("fill", function(d) { return '#eeeeee';})
          .attr("x", function(d) { return x(d.label) + (x.bandwidth()/2); })
    };

    chart.init = function (data) {

      // Scale the range of the data in the domains
      x.domain(data.map(function(d) { return d.label; }));
      y.domain([0, d3.max(data, function(d) { return d.value; })]);
      // append the rectangles for the bar chart
      var bars = svg.selectAll(".bar")
          .data(data);
      
      bars.enter().append("rect")
          .attr("class", "bar")
          .attr("fill", function(d) { return d.color; })
          .attr("x", function(d) { return x(d.label); })
          .attr("width", x.bandwidth())
          .attr("y", height)
          .attr("height", "0")
          .exit()
          .remove();

      // append amounts
      var amounts = svg.selectAll(".amount")
          .data(data)
          .enter()
          .append("text")
          .text(0)
          .attr("class", "amount")
          .attr("fill", function(d) { return '#eeeeee';})
          .attr("x", function(d) { return (x.bandwidth()/2); })
          .attr('y', height - 25)
          .exit()
          .remove();
      
      chart.drawChart(data);
    };

    return chart;
}

function lineChart(id, data) {

    var parent = $('#' + id)
    parent.empty();

    data.forEach(function(item) {
      item.year = new Date(item.year.toString());
    });

    // set the dimensions and margins of the graph
    var margin = {top: 20, right: 50, bottom: 30, left: 10},
        width = 800 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;
    // parse the date / time
    var parseTime = d3.timeParse("%Y");
    // set the ranges
    var x = d3.scaleTime().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    // define the line
    var line = d3.line()
        .x(function(d, i) { return x(d.year); }) // set the x values for the line generator
        .y(function(d) { return y(d.count); }) // set the y values for the line generator 
        .curve(d3.curveMonotoneX) // apply smoothing to the line

    //define tooltip
    var div = d3.select("#" + id).append("div") 
      .attr("class", "tooltip")       
      .style("opacity", 0);

    // append the svg obgect to the body of the page
    // appends a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    var svg = d3.select("#" + id).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");

      // Scale the range of the data
      x.domain(d3.extent(data, function(d) { return d.year; }));
      y.domain([0, d3.max(data, function(d) { return d.count + 1; })]);
      // Add the valueline path.

      svg.append("path")
          .datum(data)
          .attr("class", "line")
          .attr("d", line);

      // Add the scatterplot
      svg.selectAll("dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("r", 5)
        .attr("cx", function(d) { return x(d.year); })
        .attr("cy", function(d) { return y(d.count); })
        .on("mouseover", function(d) {   
            div.transition()    
                .duration(200)    
                .style("opacity", .9);    
            div .html("Year: " + d.year.getFullYear() + "<br/> Count:"  + d.count)  
                .style("left", (d3.event.pageX) - parent.position().left + 100 + "px")    
                .style("top", (d3.event.pageY) - 1700 + "px"); 
            })          
        .on("mouseout", function(d) {   
            div.transition()    
                .duration(500)    
                .style("opacity", 0); 
        });
      
      // Add the X Axis
      svg.append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y")));
      // Add the Y Axis
      svg.append("g")
          .call(d3.axisLeft(y));

}

function wordCloud(params) {

    // exposed variables
    var attrs = {
      id: 'id' + Math.floor((Math.random() * 1000000)),
      svgWidth: 1240,
      svgHeight: 400,
      marginTop: 0,
      marginBottom: 0,
      marginRight: 0,
      marginLeft: 0,
      container: 'body',
      responsive: false,
      data: null
    };

    /*############### IF EXISTS OVERWRITE ATTRIBUTES FROM PASSED PARAM  #######  */

    var attrKeys = Object.keys(attrs);
    attrKeys.forEach(function (key) {
      if (params && params[key]) {
        attrs[key] = params[key];
      }
    })

    //innerFunctions which will update visuals
    var updateData;

    //main chart object
    var main = function (selection) {
      selection.each(function scope() {
        //get container
        var container = d3.select(this);

        if (attrs.responsive) {
          setDimensions();
        }
        //calculated properties
        var calc = {}
        calc.chartLeftMargin = attrs.marginLeft;
        calc.chartTopMargin = attrs.marginTop;
        calc.chartWidth = attrs.svgWidth - attrs.marginRight - calc.chartLeftMargin;
        calc.chartHeight = attrs.svgHeight - attrs.marginBottom - calc.chartTopMargin;
        calc.centerX = calc.chartWidth / 2;
        calc.centerY = calc.chartHeight / 2;
        calc.minMax = d3.extent(attrs.data.values, d => d.frequency);

        //drawing containers


        //#####################   SCALES  ###################
        var scales = {};
        scales.fontSize = d3.scaleSqrt()
          .range([10, 100])
          .domain(calc.minMax);

        scales.color = d3.scaleOrdinal(colors);


        //######################  LAYOUTS  #################
        var layouts = {};
        layouts.cloud = d3.layout.cloud()
          .timeInterval(Infinity)
          .size([calc.chartWidth, calc.chartHeight])
          .fontSize(function (d) {
            return scales.fontSize(+d.frequency);
          })
          .text(function (d) {
              return d.phrase;
          })
          .font('Impact')
          .spiral('archimedean')
          .stop()
          .words(attrs.data.values)
          .on("end", function (bounds) {

            var index = bounds ? Math.min(
              calc.chartWidth / Math.abs(bounds[1].x - calc.centerX),
              calc.chartWidth / Math.abs(bounds[0].x - calc.centerX),
              calc.chartHeight / Math.abs(bounds[1].y - calc.centerY),
              calc.chartHeight / Math.abs(bounds[0].y - calc.centerY)) / 2 : 1;

            var texts = patternify({ container: centerPoint, selector: 'texts', elementTag: 'text', data: attrs.data.values })

            texts.attr("text-anchor", "middle")
              .attr("transform", function (d) {
                return "translate(0,0)rotate( 0)";
              })
              .style("font-size", function (d) {
                return 2 + "px";
              })
              .style("opacity", 1e-6)
              .text(function (d) {
                return d.text;
              })
              .style("fill", function (d) {
                return scales.color(d.text.toLowerCase());
              })

            texts.transition()
              .duration(1000)
              .attr("transform", function (d) {
                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
              })
              .style("font-size", function (d) {
                return d.size + "px";
              })
              .style("opacity", 1)
              .style("font-family", function (d) {
                return d.font;
              })

          });



        //add svg
        var svg = patternify({ container: container, selector: 'svg-chart-container', elementTag: 'svg' })
        svg.attr('width', attrs.svgWidth)
          .attr('height', attrs.svgHeight)
        // .attr("viewBox", "0 0 " + attrs.svgWidth + " " + attrs.svgHeight)
        // .attr("preserveAspectRatio", "xMidYMid meet")

        //add container g element
        var chart = patternify({ container: svg, selector: 'chart', elementTag: 'g' })
        chart.attr('transform', 'translate(' + (calc.chartLeftMargin) + ',' + calc.chartTopMargin + ')');

        //add center point
        var centerPoint = patternify({ container: chart, selector: 'center-point', elementTag: 'g' })
          .attr('transform', `translate(${calc.centerX},${calc.centerY})`)


        layouts.cloud.start();


        // ##################   EVENT LISTENERS   ################
        d3.select(window).on('resize.' + attrs.id, function () {
          setDimensions();
          redraw();
        })

        // smoothly handle data updating
        updateData = function () {


        }




        //#########################################  UTIL FUNCS ##################################

        //enter exit update pattern principle
        function patternify(params) {
          var container = params.container;
          var selector = params.selector;
          var elementTag = params.elementTag;
          var data = params.data || [selector];
          if (!container) {
            debugger;
          }
          // pattern in action
          var selection = container.selectAll('.' + selector).data(data)
          selection.exit().remove();
          selection = selection.enter().append(elementTag).merge(selection)
          selection.attr('class', selector);
          return selection;
        }

        function setDimensions() {
          var width = container.node().getBoundingClientRect().width;
          main.svgWidth(width);
          // if width is too small, change attrs.fontSize too e.t.c
        }

        function redraw() {
          container.call(main);
        }

        function debug() {
          if (attrs.isDebug) {
            //stringify func
            var stringified = scope + "";

            // parse variable names
            var groupVariables = stringified
              //match var x-xx= {};
              .match(/var\s+([\w])+\s*=\s*{\s*}/gi)
              //match xxx
              .map(d => d.match(/\s+\w*/gi).filter(s => s.trim()))
              //get xxx
              .map(v => v[0].trim())

            //assign local variables to the scope
            groupVariables.forEach(v => {
              main['P_' + v] = eval(v)
            })
          }
        }

        debug();
      });
    };

    //dinamic functions
    Object.keys(attrs).forEach(key => {
      // Attach variables to main function
      return main[key] = function (_) {
        var string = `attrs['${key}'] = _`;
        if (!arguments.length) { return eval(` attrs['${key}'];`); }
        eval(string);
        return main;
      };
    });

    //set attrs as property
    main.attrs = attrs;

    //debugging visuals
    main.debug = function (isDebug) {
      attrs.isDebug = isDebug;
      if (isDebug) {
        if (!window.charts) window.charts = [];
        window.charts.push(main);
      }
      return main;
    }

    //exposed update functions
    main.data = function (value) {
      if (!arguments.length) return attrs.data;
      attrs.data = value;
      if (typeof updateData === 'function') {
        updateData();
      }
      return main;
    }

    // run  visual
    main.run = function () {
      d3.selectAll(attrs.container).call(main);
      return main;
    }

    return main;
  }



  // missing from d3.v4 so we just copying from v3
  // Copies a variable number of methods from source to target.
  d3.rebind = function (target, source) {
    var i = 1, n = arguments.length, method;
    while (++i < n) target[method = arguments[i]] = d3_rebind(target, source, source[method]);
    return target;
  };

  // Method is assumed to be a standard D3 getter-setter:
  // If passed with no arguments, gets the value.
  // If passed with arguments, sets the value and returns the target.
  function d3_rebind(target, source, method) {
    return function () {
      var value = method.apply(source, arguments);
      return value === source ? target : value;
    };
  }

  function d3_functor(v) {
    return typeof v === "function" ? v : function () { return v; };
  }

  d3.functor = d3_functor;

function networkGraph(id, data) {

    var parent = $('#' + id);
    parent.empty();
    parent.append('<svg width="960" height="600"></svg>');

    const svg = d3.select('#q4-chart svg');
    const width  = +svg.attr('width');
    const height = +svg.attr('height');

    const MAX_NODE_TEXT_LENGTH = 24

    const color = d3.scaleOrdinal([colors[0], colors[2], colors[4]]);

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
        'http://188.166.212.83:3000/papers/web?count=2&title=Low-density%20parity%20check%20codes%20over%20GF(q)',
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
}