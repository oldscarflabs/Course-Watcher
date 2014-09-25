var tooltips = [];

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
		
		localKeys['keys'].push({'watch_id': data['watch_id'], 'department': data['department'], 'course': data['course'], 'section': data['section'], 'index': data['index'], 'title':data['title']});
		chrome.extension.sendMessage({method: "setLocalStorage", data: JSON.stringify(localKeys)}, function(response){});
	});
}
	
function sectionsHaveLoaded(num){
	var count = 0;
	//iterates through each section
	$("<span>WATCH</span>").insertAfter(".indexNumberColumnHeader");
	$("div.sectionHeaders span").css( 'padding-right', '0px' )
    $( ".sectionData" ).each(function() {
		// Not getting rid of old initiations and not making new ones 
		//appendString is a jQuery object
		var appendString = $('<div style="display: inline-block" id="snipe" count="'+count+'"><img src="'+chrome.extension.getURL('/icons/eyecon.png')+' " style="cursor:pointer")></div>');			
		appendString.insertAfter($(this).find('.sectionIndexNumber'));
		
		var email = localStorage.getItem("email");
		
		if(email == null){
			email = '';
		}
		
		var formObject = $("<form id='emailForm'><div style='text-align:center'>Watch This Course</div> <br> Email: <input type='email' id='email' value='" + email + "'></input><button type='button' class='submitSnipe' count='"+count+"'>Watch!</button></form>");

		//initiates tooltip with appendString object
		appendString.tooltipster({
			triggger:'click',
			interactive: 'true',
        	content: formObject
    	});
    	tooltips.push(appendString);
    	count = count + 1;
	});
	
	//preps for changing department
	$("#numCoursesFoundDivSpan").attr('id','');
	
	//When they submit the form
	$('html').on('click', '.submitSnipe', function(){
		//find out which section they want
		var number = $(this).attr('count');
		var snipe = $('#snipe[count="'+number+'"]');
		var email = $("#email").val();
		
		localStorage.setItem("email",email);
		
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
		
		$.ajax({
			type:"POST",
			url:"http://aaronrosenheck.com/coursewatcher/addSnipe.php",
			data:postData,
			success: function(data){ 
				successHandler(data);
			},
			error: function(data){
				console.log('POST to Old Scarf Lab API failed with data response:');
				console.log(data);
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



//when they change department
window.onhashchange = function () {
	setInterval(function() {
		if($("#numCoursesFoundDivSpan").length > 0){
			sectionsHaveLoaded(1);
			return;
		}
	},10);
}

//Runs on initial load
var p = setInterval(function() {
	if($("#numCoursesFoundDivSpan").length > 0){
			tooltips=[];
			sectionsHaveLoaded(0);
			return;
	}
},10);
	








	