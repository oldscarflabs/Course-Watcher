/**
 * Uses data from Rutgers API to check if each class is open
 * Changes loading animation to red/green
 * @param {JSON}
 * @param {string}
 */
function successHandler(data, url){
	var start = url.indexOf("courseNumber");
	var sub = url.substring(start).split('&');
	var courseNumber = sub[0].substring(sub[0].indexOf("=")+1);
	var sectionNumber = sub[1].substring(sub[1].indexOf("=")+1);
	var department = data[0]['subject'];
	var course;

	for(var i = 0; i < data.length; i++){
		course = data[i];
		if(course['courseNumber'] == courseNumber){
			break;
		}
	}

	var sections = course['sections'];
	for(var j = 0; j < sections.length; j++){
		section = sections[j];
		if(section['number'] == sectionNumber){
			break;
		}
	}

	var isOpen = section['openStatus'];
	var tag = "." + department + "_" + courseNumber + "_" + sectionNumber;

	if(isOpen){
		$("#" + department + "_" + courseNumber + "_" + sectionNumber).attr('class','open-box');
		$("#register_" + department + "_" + courseNumber + "_" + sectionNumber).attr('style', 'font-weight: bold');
		$("#number_" + department + "_" + courseNumber + "_" + sectionNumber).attr('style', 'display: none');
	}
	$('#loadingGif' + department + "_" + courseNumber + "_" + sectionNumber).hide();
	$('#sectionNumber' + department + "_" + courseNumber + "_" + sectionNumber).attr('style','');

	$('.register_'+ department + "_" + courseNumber + "_" + sectionNumber).on('click',function(){
		var index = $('.register_'+ department + "_" + courseNumber + "_" + sectionNumber).attr('id');
		var theUrl = "https://sims.rutgers.edu/webreg/editSchedule.htm?login=cas&semesterSelection=92015&indexList=" + index;
		chrome.tabs.create({url: theUrl});
	});
}

/**
 * Moves a course from 'keys' to 'previousKeys' in Local Storage
 * @param {JSON}
 */
function deleteFromLocalStorage(data){
	var goodCourses = {"keys": []};
	var badCourses = {"keys": []};

	chrome.extension.sendMessage({method: "getPreviousLocalStorage"}, function(responseA){
		if(responseA.previouskeys != null){
			badCourses = JSON.parse(responseA.previouskeys);
		}
		chrome.extension.sendMessage({method: "getLocalStorage", name: "keys"}, function(response){
			var badIds = data['delete-ids'];
			var courses = response.keys;
			courses = JSON.parse(courses);
			courses2 = courses['keys'];

			for(var i = 0; i < courses2.length; i++){
				if(badIds.indexOf(String(courses2[i]['watch_id'])) == -1) {
					goodCourses['keys'].push({'watch_id': courses2[i]['watch_id'], 'department': courses2[i]['department'], 'course': courses2[i]['course'],
					'section': courses2[i]['section'], 'index': courses2[i]['index'], 'title': courses2[i]['title'], 'authentication':courses2[i]['authentication'] });
				}
				else{
					badCourses['keys'].push({'watch_id': courses2[i]['watch_id'], 'department': courses2[i]['department'], 'course': courses2[i]['course'],
					'section': courses2[i]['section'], 'index': courses2[i]['index'], 'title':courses2[i]['title'], 'authentication':courses2[i]['authentication']});
				}
			}
			chrome.extension.sendMessage({method: "setLocalStorage", data: JSON.stringify(goodCourses)}, function(response){});
			chrome.extension.sendMessage({method: "setPreviousLocalStorage", data: JSON.stringify(badCourses)}, function(response){});

		});
	});
}

function nothingThere(addBack){

  var appendRow =  "<tr><td colspan='2'>Add a course to watch at <br> the <a href = '#' class='soc'>schedule of classes.</a></td></tr>";

  $('.course-table').append(appendRow);

  if(!addBack){
    $('.course-table').append('<tr><td style="text-align:right"><a href = "home.html"><img src="oldscarflabs.png" height="20px" style="padding:5px;"></a></td></tr>');
  }
  else{
    $('.course-table').append('<tr> <td style = "text-align: left"> <a href="previousWatches.html"><img src="../../icons/previous.png" height="18px" style="padding:5px"> <td style="text-align:right"><a href = "home.html"><img src="oldscarflabs.png" height="20px" style="padding:5px;"></a></td></tr>');
  }


  $(".soc").on("click", function(){

    chrome.tabs.create({url: "https://sis.rutgers.edu/soc/#subjects%3Fsemester%3D92015%26campus%3DNB%26level%3DU"});
    return false;
  });

  return;
}

/**
 * Displays list of courses in the dialog dropdown
 * @returns {void}
 */
function displayCourses(){
	var localKeys;
  	var atLeastOne = false;

	chrome.extension.sendMessage({method: "getLocalStorage"}, function(response){
		var listOfIds = [];
		localKeys = response.keys;
		localKeys = JSON.parse(localKeys);

	    if(localKeys == null){
	      nothingThere(false);
	      return;
	    }

			var subKeys = localKeys['keys'];

	    if(subKeys.length == 0){
	      nothingThere(true);
	      return;
	    }



		for(var i = 0; i < subKeys.length; i++){
			var course = subKeys[i];
			var department = course['department'];
			var courseNumber = course['course'];
			var section = course['section'];
			var index = course['index'];
			var semester = '92015';
			var campus = 'NB';
			var level = 'U'	;
			var courseTitle = course['title'];

			listOfIds.push(course['watch_id']);

			var appendRow =  "<tr><td id = '" + department + "_" + courseNumber + "_" + section + "' class='load-box'>" + "<div id='loadingGif"+department +
			"_" + courseNumber + "_" + section+"'> <img src='../../icons/spinning_wheel.gif' height='30px'> </div><div id='sectionNumber" +department +
			"_" + courseNumber + "_" + section+ "' style='display:none;'>" + section + "</div>" + "</td><td id='className'><div>" +
			courseTitle + "</div></td><td> <div id='number_"+ department + "_" + courseNumber + "_" + section +"' class='number'>"
			+ department + ":" + courseNumber + "</div> <div id='register_" + department + "_" + courseNumber + "_" + section + "' class='register' style='display:none'><a class='register_"+ department + "_" + courseNumber + "_" + section +"' href='#' id='"+index+"'>REGISTER!</a></div>"
			 +"</td><td class='garbage' watch_id='" + course['watch_id'] + "' authentication='"+course['authentication']+"'><img src='../../icons/garbage_can.png' height='20px'></td></tr>";

			$('.course-table').append(appendRow);

			var requestData = {'subject': department, 'semester': semester, 'campus': campus, 'level': level, 'courseNumber':courseNumber, 'section':section};

			/**
			 * Ajax GET request to Rutgers API to get class information
			 * Calls successHandler() on success, and logs information on failure
			 */
			$.ajax({
				type: 'GET',
				url: 'http://sis.rutgers.edu/soc/courses.json',
				data: requestData,
				success: function(data){
					successHandler(JSON.parse(data), this.url);
				},
				error: function(data){
					console.log('AJAX GET request to Rutgers API has failed with data:');
					console.log(data);
				}
			});

		}

		$('.course-table').append('<tr><td><a href="previousWatches.html"><img src="../../icons/previous.png" height="18px" style="padding:5px"></a></td><td><a class="soc" href="url">Add Another Class! </a></td><td colspan="2" style="text-align:left"><a href = "home.html"><img src="oldscarflabs.png" height="20px" style="padding:5px;"></a></td></tr>');

		var ids = {'watch-ids': JSON.stringify(listOfIds)}; //checks to see if the courses have been marked as watched in database

		  $(".soc").on("click", function(){
		  	chrome.tabs.create({url: "https://sis.rutgers.edu/soc/"});
			return false;
		  });

		/**
		 * Ajax GET request to Old Scarf Labs API to sync the status of each course being watched
		 * Calls deleteFromLocalStorage() on success, and logs information on failure
		 */
		$.ajax({
				type: "GET",
				url: 'https://oldscarflabs.me/coursewatcher/syncStatus.php',
				data: ids,
				success: function(data){
					deleteFromLocalStorage(data);
				},
				error: function(data){
					console.log('GET from Old Scarf Labs API has failed with response:');
					console.log(data);
			}
		});
	});
}



$(document).on('click', '.garbage', function(){
		/**
			* AJAX call to Old Scarf Labs API to delete a "watch" on a course
			* @returns {JSON}
		*/
		var postData = {"watch_id": $(this).attr('watch_id'), "authentication": $(this).attr('authentication')};
		var row = $(this).closest('tr');
		var watch_id = $(this).attr('watch_id');

		$.ajax({
			type: "POST",
			url: "https://oldscarflabs.me/coursewatcher/removeSnipe.php",
			data: postData,
			success: function(data){
				row.css("background", "");
				row.css("color", "#757575");
				row.css("text-decoration", "line-through");
				row.find('.load-box').attr("class", "delete-box");
				row.find('.open-box').attr("class", "delete-box");
				row.find('.number').css("display", "inline");
				row.find('.register').css("display", "none");
        row.find('.garbage').html("<img src='../../icons/checkmark.png' height='15px'>");
				deleteFromLocalStorage({"delete-ids": [watch_id]});
			},
			error: function(data){
				console.log('POST to Old Scarf Lab API failed with data response:');
				console.log(data);
			}
		});
});

function parseAlerts(data){
	var alertsShown = localStorage.getItem("alertsShown");
	if(alertsShown == null){
		alertsShown = [];
		alertsShown = JSON.stringify(alertsShown);
	}

	alertNumsShown =  JSON.parse(alertsShown);

	var alerts = data.alerts;
	for(var i = 0; i < alerts.length; i++){
		var alertO = alerts[i];
		var number = alertO.Number;
		if(!alertO.Effective){
			continue;
		}
		if(alertNumsShown.indexOf(number) == -1){
			alert(alertO.Message);
			alertNumsShown.push(number);
		}
	}
	localStorage.setItem("alertsShown", JSON.stringify(alertNumsShown));

}

function checkForAlert(){
	$.ajax({
		type: 'GET',
		datatype: 'json',
		url: 'https://oldscarflabs.me/coursewatcher/alerts.json',
		success: function(data){
			parseAlerts(data);
		},
		error: function(data){
			console.log('AJAX GET request to OSL Alerts Feed has failed with data:');
			console.log(data);
		}
	});
}


displayCourses();
checkForAlert();


