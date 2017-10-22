$(document).ready(function() {

	var colors = [ '#FE3F45', '#FE871A', '#FEBC41', '#98CE2C', '#0B99C9', '#36B5E4', '#d9d9d9', '#bdbdbd', '#969696', '#636363' ];

	var server_url = 'http://188.166.212.83:3000'

	/* bind dropdowns */
	bindDropDown('q1-top', 1, 10, 'Select Top Count');
	bindDropDown('q2-top', 1, 10, 'Select Top Count');
	bindDropDown('q5-top', 10, 100, 'Select Top Count', 10);

	/* click listeners */
	$('#q1-retrieve').on('click', function() { retrieveQ1(); });
	$('#q2-retrieve').on('click', function() { retrieveQ2(); });
	$('#q3-retrieve').on('click', function() { retrieveQ3(); });
	$('#q4-retrieve').on('click', function() { retrieveQ4(); });
	$('#q5-retrieve').on('click', function() { retrieveQ5(); });

	/* q1 */
	function retrieveQ1() {
		
		var venue = $('#q1-venue').val();
		var count = $('#q1-top').val();

		//validate before sending
		if(!venue || count === 'default') { 
			//alert("Please ensure that you have indicated venue and count, please try again!");
			sendError('q1-chart', 'Please ensure that you have indicated venue and count, please try again!');
			return; 
		}

		requestQ1(venue, count)
			.then((response)=> { handleQ1(response); })
			.catch((error) => { console.log('Error retrieving data for Q1.' + error); });
	};

	function requestQ1(venue, count) {

		var path = server_url + '/authors/top';
		return new Promise((resolve, reject) => {
		
			//send request to server to retrieve json
			$.ajax({ 
				type: "GET",
				url: path,
				data: { 'count': count, 'venue': venue },
				dataType: 'text',
				success: function(response) { resolve(response); },
				error: function(xhr, ajax_options, thrown_error) { reject(xhr); }
			});
		});
	}

	function handleQ1(response) {

	    var columns = {'author':'Author', 'percentage':'Percentage', 'count':"Total Documents" };
	    var variable = 'percentage';
	    var category = 'author';
	    response = JSON.parse(response);

	    var count = Object.keys(response).length;
	    if(count > 0) {
	    	console.log(response);
	    	drawDonut('q1-chart', response, variable, category, columns);
	    } else {
	    	sendError('q1-chart', 'Oh no! We are unable to find matching values!');
	    }
	}
	/* q1 */

	/* q2 */
	function retrieveQ2() {
		
		var venue = $('#q2-venue').val().trim();
		var count = $('#q2-top').val();

		//validate before sending
		if(!venue || count === 'default') { 
			sendError('q2-chart', 'Please ensure that you have indicated venue and count, please try again!');
			return; 
		}

		requestQ2(venue, count)
			.then((response)=> { handleQ2(response); })
			.catch((error) => { console.log('Error retrieving data for Q2.' + error); });
	};

	function requestQ2(venue, count) {

		var path = server_url + '/papers/top';
		return new Promise((resolve, reject) => {
			//send request to server to retrieve json
			$.ajax({ 
				type: "GET",
				url: path,
				data: { 'count': count, 'venue': venue },
				dataType: 'text',
				success: function(response) { resolve(response); },
				error: function(xhr, ajax_options, thrown_error) { reject(xhr); }
			});
		});
	}

	function handleQ2(response) {

	    response = JSON.parse(response);
	    var count = Object.keys(response).length;
	    if(count > 0) {
	    	
	    	var data = []; var current = 0;
	    	response.forEach(function(item) {
	    		var row = {};
	    		row.label = item.title;
	    		row.value = parseInt(item.citedIn);
	    		row.color = colors[current];
	    		data.push(row);
	    		current++;
	    	});
			drawBar('q2-chart', data);
	    } else {
	    	sendError('q2-chart', 'Oh no! We are unable to find matching values!');
	    }
	}
	/* q2 */

	/* q3 */
	function retrieveQ3() {
		
		var venue = $('#q3-venue').val().trim();

		//validate before sending
		if(!venue) { 
			sendError('q3-chart', 'Please ensure that you have indicated venue, please try again!');
			return; 
		}

		requestQ3(venue)
			.then((response)=> { handleQ3(response); })
			.catch((error) => { console.log('Error retrieving data for Q3.' + error); });
	}

	function requestQ3(venue) {
		var path = server_url + '/papers/trend';
		return new Promise((resolve, reject) => {
			//send request to server to retrieve json
			$.ajax({ 
				type: "GET",
				url: path,
				data: { 'venue': venue },
				dataType: 'text',
				success: function(response) { resolve(response); },
				error: function(xhr, ajax_options, thrown_error) { reject(xhr); }
			});
		});
	}

	function handleQ3(response) {

		response = JSON.parse(response);
	    var count = Object.keys(response).length;
	    if(count > 0) {
			lineChart('q3-chart', response);
	    } else {
	    	sendError('q3-chart', 'Oh no! We are unable to find matching values!');
	    }
	}

	function retrieveQ4() {
		var title = $('#q4-title').val().trim();

		//validate before sending
		if(!title) { 
			sendError('q4-chart', 'Please ensure that you have indicated the paper title, please try again!');
			return; 
		}

		requestQ4(title)
			.then((response)=> { handleQ4(response); })
			.catch((error) => { console.log('Error retrieving data for Q4.' + error); });
	}

	function requestQ4(title) {

		var path = server_url + '/papers/web';
		return new Promise((resolve, reject) => {
			//send request to server to retrieve json
			$.ajax({ 
				type: "GET",
				url: path,
				data: { 'count': 2, 'title': title },
				dataType: 'text',
				success: function(response) { resolve(response); },
				error: function(xhr, ajax_options, thrown_error) { reject(xhr); }
			});

			console.log(title);
		});
	}

	function handleQ4(response) {
		response = JSON.parse(response);
	    var count = Object.keys(response.nodes).length;
	    if(count > 0) {
			networkGraph('q4-chart', response);
	    } else {
	    	sendError('q4-chart', 'Oh no! We are unable to find matching values!');
	    }
	}

	function retrieveQ5() {
		var venue = $('#q5-venue').val().trim();
		var count = $('#q5-top').val();

		//validate before sending
		if(!venue || count === 'default') { 
			sendError('q5-chart', 'Please ensure that you have indicated venue and count, please try again!');
			return; 
		}

		requestQ5(venue, count)
			.then((response)=> { handleQ5(response); })
			.catch((error) => { console.log('Error retrieving data for Q5.' + error); });
	}

	function requestQ5(venue, count) {

		var path = server_url + '/phrases/top';
		return new Promise((resolve, reject) => {
			//send request to server to retrieve json
			$.ajax({ 
				type: "GET",
				url: path,
				data: { 'venue': venue, 'count':count },
				dataType: 'text',
				success: function(response) { resolve(response); },
				error: function(xhr, ajax_options, thrown_error) { reject(xhr); }
			});
		});
	}

	function handleQ5(response) {
		response = JSON.parse(response);
	    var count = Object.keys(response).length;
	    if(count > 0) {
			drawWordCloud('q5-chart', response);
	    } else {
	    	sendError('q5-chart', 'Oh no! We are unable to find matching values!');
	    }
	}

	/* quick hands */
	function bindDropDown(id, start, end, first, interval) {
		var dropdown = $('#' + id);
		dropdown.append('<option value="default">' + first + '</option>');
		for(var i = start; i <= end; i++) {
			dropdown.append('<option value="' + i + '">' + i + '</option>');
			if(interval) { i+= interval - 1; }
		}
	}

	function sendError(id, message) { 
		$('#' + id).html('<h2 class="error">' + message + '</h2>');
	}

	/* initialize bar */
	function drawBar(id, data) {
		var bar = barChart(id);
		bar.init(data);
	}

	/* initialize donut charts */
	function drawDonut(id, data, variable, category, columns) {

		var donut = donutChart()
	       .width(960)
	       .height(400)
	       .cornerRadius(3) // sets how rounded the corners are on each slice
	       .padAngle(0.015) // effectively dictates the gap between slices
	       .variable(variable)
	       .category(category);


    	// parse data to prepare percentage
    	var total = 0;
    	for(var key in data) {
    		if(data.hasOwnProperty(key)) {
    			var item = data[key];
    			total += item.count;
    		}
    		// filter columns to be printed out
    		item.columns = columns;
    	}

    	// add percentage to data
    	for(var key in data) {
    		if(data.hasOwnProperty(key)) {
    			var item = data[key];
    			var percentage = ((item.count / total)).toFixed(5).toString();
    			item.percentage = percentage;
    		}
    	}

    	// bind data and show chart
    	$('#' + id).empty();
    	d3.select('#' + id).datum(data).call(donut);
	}

	function drawWordCloud(id, data) {
		$('#' + id).empty();
	    var chart = wordCloud()
	        .container('#' + id)
	        .data({ values: data })
	        .responsive(true)
	        .run();
	}


});