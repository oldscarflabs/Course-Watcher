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
			+ department + ":" + courseNumber + "</div> <div id='register_" + department + "_" + courseNumber + "_" + section + "'style='display:none'><a class='register_"+ department + "_" + courseNumber + "_" + section +"' href='#' id='"+index+"'>REGISTER!</a></div>"
			+"</td><td><div id='addwatch' class='"+ course['watch_id'] +"'><img src='../../icons/eyecon.png' height='10px'></td></tr>";
			
			$('.course-table').append(appendRow);
	}
	
	$("#addwatch").on('click', function(){
		//find watch id in local storage. move it back into real local storage
		//change back to 0 in database with ajax call
		for(var i =0; i<subKeys.length; i++){
			var course = subKeys[i];
			if(course['watch-id'] == this.class()){
				//nothing was here...
			}
		}
	}); 
	
});