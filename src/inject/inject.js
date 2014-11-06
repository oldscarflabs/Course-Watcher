var tooltips = [];

/**
 * Success handler for AJAX call
 * Adds the new watch into Local Storage
 * @param {JSON}
 * @returns {void}
 */
function successHandler(data){
	var localKeys;
	chrome.extension.sendMessage({method: "getLocalStorage"}, function(response){
		localKeys = response.keys;

		if(localKeys == null){
			localKeys = {
				"keys": [

				]
			}
		}
		else{
			localKeys = JSON.parse(localKeys);
		}

		localKeys['keys'].push({'watch_id': data['watch_id'], 'department': data['department'], 'course': data['course'], 'section': data['section'], 'index': data['index'], 'title':data['title'], 'authentication':data['authentication']});
		chrome.extension.sendMessage({method: "setLocalStorage", data: JSON.stringify(localKeys)}, function(response){});
	});
}
/**
 * Inserts "WATCH" header with Eye Icon into Rutgers course page
 * @returns {void}
 */
function sectionsHaveLoaded(){
	var count = 0;
	$("<span>WATCH</span>").insertAfter(".indexNumberColumnHeader");
	$("div.sectionHeaders span").css('padding-right', '0px');

    $( ".sectionData" ).each(function(){
		var appendString = $('<div style="display: inline-block" id="snipe" count="' + count + '"><img src="' + chrome.extension.getURL('/icons/eyecon.png') + ' " style="cursor:pointer")></div>');
		var email = localStorage.getItem("email");

		appendString.insertAfter($(this).find('.sectionIndexNumber'));

		if(email == null){
			email = '';
		}

		var formObject = $("<form id='emailForm'><div style='text-align:center'>Watch This Course</div> <br> Email: <input type='email' id='email' value='" + email + "'></input><button type='button' class='submitSnipe' count='" + count + "'>Watch!</button></form>");

		appendString.tooltipster({
			triggger: 'click',
			interactive: 'true',
        	content: formObject
    	});

    	tooltips.push(appendString);
    	count = count + 1;
	});

	$("#numCoursesFoundDivSpan").attr('id',''); //preps for changing department

	/**
	 * Click handler for Tooltip
	 * Posts course data to database via Old Scarf Labs API
	 * Saves email in Local Storage
	 * @returns {void}
	 */
	$('html').on('click', '.submitSnipe', function(){
		var number = $(this).attr('count');
		var snipe = $('#snipe[count="' + number + '"]');
		var email = $("#email").val();
		var sectionData = snipe.closest(".sectionData").attr('id');
		var res = sectionData.split(".");
		var courseNumber = res[0];
		var sectionNumber = res[2].replace('section', '');
		var deptAndCourseNums = courseNumber.split(':');
		var departmentNum = deptAndCourseNums[1];
		var courseNum = deptAndCourseNums[2];
		var index = snipe.prev().text();
		var title = snipe.closest('.courseData').siblings('.courseInfo').children('.courseTitleAndCredits').children('.courseTitle').children('.highlighttext').text();

		var postData = {"DepartmentNumber": departmentNum,  "CourseNumber": courseNum,  "Email":email, "SectionNumber": sectionNumber, "Index": index, "Title" : title};

		if(email == ""){
			alert("Don't forget to put an email!");
			return;
		}
		if(email.indexOf("@") == -1 || email.length <= 3 || email.indexOf(".") == -1){
			alert("Something seems wrong with your email. Please check it again.");
			return;
		}

		localStorage.setItem("email",email);

		/**
		 * AJAX call to Old Scarf Labs API to add a "watch" on a course
		 * @returns {JSON}
		 */
		$.ajax({
			type: "POST",
			url: "https://oldscarflabs.me/coursewatcher_dev/addSnipe.php",
			data: postData,
			success: function(data){
				successHandler(data);
			},
			error: function(data){
				console.log('POST to Old Scarf Lab API failed with data response:');
				console.log(data);
				alert("Something went wrong. Sorry! Please refresh the page and try again.");
			}
		});

		var changeTooltip = tooltips[parseInt(number)];
		changeTooltip.tooltipster('content', 'You are watching this course!');
	});
	/*$('.input').keypress(function(e) {
    	if(e.which == 13) {
        	jQuery(this).blur();
        	jQuery('#submit').focus().click();
    	}
	});*/
}



/**
 * Checks for a change of department
 * Sets an 0.01 second interval to check for loaded sections
 * @return {void}
*/
window.onhashchange = function () {
	setInterval(function() {
		if($("#numCoursesFoundDivSpan").length > 0){
			sectionsHaveLoaded();
			return;
		}
	},10);
}

/**
 * Sets an 0.01 second interval to check for loaded sections
 * @return {void}
*/
var p = setInterval(function() {
	if($("#numCoursesFoundDivSpan").length > 0){
			tooltips=[];
			sectionsHaveLoaded();
			return;
	}
},10);
