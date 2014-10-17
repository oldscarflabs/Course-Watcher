	/**
 * Sends a message to background.js to access previousKeys in Local Storage
 * Displays these courses in the "Previous" section of the dialog dropdown
 */
chrome.extension.sendMessage({method: "getPreviousLocalStorage"}, function(response){ 
		var listOfIds = [];
		localKeys = response.previouskeys;
		localKeys = JSON.parse(localKeys);
		var subKeys = localKeys['keys'];

		for(var i = 0; i< subKeys.length; i++){
			var course = subKeys[i];
			var department = course['department'];
			var courseNumber = course['course'];
			var section = course['section'];
			
			var index = course['index'];
			 
			listOfIds.push(course['watch_id']);
			 
			var courseTitle=course['title'];
			 
			var semester = '92014';
			var campus = 'NB';
			var level = 'U'	;
			 
			var appendRow =  "<tr><td id = '" + department + "_" + courseNumber + "_" + section + "' class='load-box'><div id='sectionNumber" +department + 
			"_" + courseNumber + "_" + section+ "' '>" + section + "</div>" + "</td><td id='className'><div>" + 
			courseTitle + "</div></td><td> <div id='number_"+ department + "_" + courseNumber + "_" + section +"'>"
			+ department + ":" + courseNumber + "</div> <div id='register_" + department + "_" + courseNumber + "_" + section + "'style='display:none'><a class='register_"+
			 department + "_" + courseNumber + "_" + section +"' href='#' id='"+index+"'>REGISTER!</a></div>"
			+"</td><td><div id='addwatch' clickFun = 'clickFun' class='"+ course['watch_id'] +"' style='cursor:pointer' ><img src='../../icons/eyecon.png' id='addwatch' height='10px'></div></td></tr>";
			
			$('.course-table').append(appendRow);
		}


	$('[clickFun=clickFun]').on('click', function(){
		//find watch id in local storage. move it back into real local storage
		//change back to 0 in database with ajax call

		var courses = response.previouskeys;
		console.log(courses);
		courses = JSON.parse(courses);
		var goodCourses = {"keys": []};
		var badCourses = {"keys": []};
		var postData;
		var watchid = $(this).attr('class');

			
		console.log(localStorage.getItem("keys"));

		if(localStorage.getItem("keys") != null){
			goodCourses = JSON.parse(localStorage.getItem("keys"));
			console.log("adsadsff");
		}

		for(var i = 0; i < subKeys.length; i++){
			if(subKeys[i]['watch_id'] == $(this).attr('class')) {
				goodCourses['keys'].push({'watch_id': subKeys[i]['watch_id'], 'department': subKeys[i]['department'], 'course': subKeys[i]['course'], 'section': subKeys[i]['section'], 'index': subKeys[i]['index'], 'title':subKeys[i]['title']});
				postData = {"watch_id": subKeys[i]['watch_id']};
				console.log(subKeys[i]['watch_id']);
			}    
			else{
				badCourses['keys'].push({'watch_id': subKeys[i]['watch_id'], 'department': subKeys[i]['department'], 'course': subKeys[i]['course'], 'section': subKeys[i]['section'], 'index': subKeys[i]['index'], 'title':subKeys[i]['title']});
			}
		}
		chrome.extension.sendMessage({method: "setLocalStorage", data: JSON.stringify(goodCourses)}, function(response){});
		chrome.extension.sendMessage({method: "setPreviousLocalStorage", data: JSON.stringify(badCourses)}, function(response){});	
		
		/**
	 	 * AJAX call to Old Scarf Labs API to re-add a "watch" on a course
	 	 * @returns {JSON}
		 */
		$.ajax({
			type: "POST",
			url: "https://oldscarflabs.me/coursewatcher/readdSnipe.php",
			data: postData,
			success: function(data){ 
				console.log(data);
				$("." + watchid).replaceWith("<div><img src='http://img1.wikia.nocookie.net/__cb20131125154354/roblox/images/5/57/Very-Basic-Checkmark-icon.png' id='addwatch' height='15px'></div>");
				//successHandler(data);
			},
			error: function(data){
				console.log('POST to Old Scarf Lab API failed with data response:');
				console.log(data);
			}
		});

	});

});



		


