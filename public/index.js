

//If user is signed in, hide the sign in section, and show the user info section in the nav
if(sessionStorage.token != null){
	$('.js-signin-form').hide();
	$('.signup-link').hide();
	$('.help-notification').show();
	$('.signin-notification').hide();
	document.getElementById("js-user-name").innerHTML = sessionStorage.userName;
}
else{
	$('.js-user-info').hide();
	$('.js-signin-form').show();
	$('.signup-link').show();
	$('.help-notification').hide();
	$('.signin-notification').show();
}

function watchSubmit(){
	$('.js-search-form').submit(event => 
	{
		event.preventDefault();
		const numberQuery = $(event.currentTarget).find('.js-query').val();
		console.log("searching for " + numberQuery);
		window.location.href = `listing.html?${numberQuery}`;
		//searchPhoneNumber(numberQuery,displaySearchData);
		//getDataFromListing(displaySearchData);
	});

	$('.js-submit-form').submit(event => 
	{
		event.preventDefault();
		const submitCreator = sessionStorage.userName;//$(event.currentTarget).find('.js-submit-name').val();
		const submitQuery = window.location.search.slice(1); //$(event.currentTarget).find('.js-submit-number').val();
		const category = $(event.currentTarget).find('.js-submit-category').val();
		const comment = $(event.currentTarget).find('.js-submit-comment').val();
		//Change description in schema to category
		const submitData = {
			"phoneNumber": submitQuery, 
			"description": category,
			"comments": [{
				"content": comment,
				"creator": submitCreator
			}],
		};

		console.log("Creator " + submitCreator);
		console.log("Submitting " + submitQuery);
		console.log("Description: " + category);
		console.log("Initial comment: " + comment);
		
		addPhoneNumber(submitData);//,submitDescription);
		$('.post-response').show();
		//Add phone number to database
	});	

	//Register New User
	$('.js-register-form').submit(event => 
	{
		event.preventDefault();

		const newUser = {
			"firstName": $(event.currentTarget).find('.js-register-first-name').val(),
			"lastName": $(event.currentTarget).find('.js-register-last-name').val(),
			"userName": $(event.currentTarget).find('.js-register-user-name').val(),
			"email": $(event.currentTarget).find('.js-register-email').val(),
			"password": $(event.currentTarget).find('.js-register-password').val()
		
		};
		console.log("Registering: " +newUser.firstName);
		console.log("Registering: " +newUser.lastName);
		console.log("Registering: " +newUser.userName);
		console.log("Registering: " +newUser.email);
		registerUser(newUser);
		//$('.js-success-message').show();
		console.log("Registered new user!");
	});

	function registerUser(userData){
	$.ajax({
    url: '/users/',
    dataType: 'json',
    type: 'post',
    contentType: 'application/json',
    data: JSON.stringify( userData ),
    	//{ "phoneNumber": `${number}`, "description": `${description}`} ),
    processData: false,
    	success: function( data, textStatus, jQxhr ){
        console.log("Successfully posted data.");
        //$('#response pre').html( JSON.stringify( data ) );
    	},
    	error: function( jqXhr, textStatus, errorThrown ){
        console.log( errorThrown );
    	}
		});
	
	}

	$('.js-signin-form').submit(event => 
	{
		event.preventDefault();
		const userName = $(event.currentTarget).find('#js-signin-username').val();
		const password = $(event.currentTarget).find('#js-signin-password').val();

		signInUser(userName,password);
	
	});

	$('.js-logout-button').on('click', function() {   
	 	logOutUser();
    });

	$('.signup-link').on('click', function() {   
		 	$('.js-signup-popup-window').show(300);
	    });
	$('.register-link').on('click', function() { 
		 	$('.js-signup-popup-window').show(300);
	    });

	$('.cancel-signup').on('click', function() {   
		$('.js-signup-popup-window').hide(300);
	});

	$('.js-add-comment-form').submit(event => 
	{ 
		event.preventDefault();
		const commentAuthor = sessionStorage.userName; //$(event.currentTarget).find('.js-add-comment-name').val();
		const newComment = $(event.currentTarget).find('.js-add-comment-content').val();
		
		console.log(`${commentAuthor} said: "${newComment}"`);

		//PUT request for phone number posting
		addComment(commentAuthor,newComment);

	});
	    
}

function searchPhoneNumber(searchTerm,callback){
	let query = {
		//url: "https://stormy-tundra-36765.herokuapp.com/list",
		url: `https://stormy-tundra-36765.herokuapp.com/search/${searchTerm}`,
		dataType: 'json'
		//success: callback
	}
	console.log(query.url);
	$.getJSON(query,callback);
}

function addPhoneNumber(data){//number,description){
	
	$.ajax({
    url: '/list',
    dataType: 'json',
    type: 'post',
    contentType: 'application/json',
    data: JSON.stringify( data ),
    	//{ "phoneNumber": `${number}`, "description": `${description}`} ),
    processData: false,
    	success: function( data, textStatus, jQxhr ){
        console.log("Successfully posted data.");
        //$('#response pre').html( JSON.stringify( data ) );
    	},
    	error: function( jqXhr, textStatus, errorThrown ){
        console.log( errorThrown );
    	}
	});
}

//Get function to list all phone numbers 
function getDataFromListing(callback){
	let query = {
		url: "https://stormy-tundra-36765.herokuapp.com/list",
		dataType: 'json'
		//success: callback
	}
	
	$.getJSON(query,callback);
};

function displaySearchData(data){
	if(data == null){
		console.log("No data!");
	}
	else{
		//***********    Concern -- DID NOT use data.map since the listing is an object and not an array
		//const results = data.phoneNumber.map((item,index) => renderResults(item,index));
		//console.log(`${results}`);
		console.log("There's data!");
		const results = renderResults(data);
		$('.js-results').html(results);
	}
}

function renderResults(result){
	console.log(result["phoneNumber"]);
	console.log(result["flags"]);
	console.log(result["description"]);
	console.log(result["comments"]);
	//Converts all comments and comment info into one large string of html content to add onto final results.
	let commentList = "";//result.comments[0].content;
	console.log(commentList);
	for(i = 0; i < result["comments"].length; i++){
		console.log(result.comments[i].content);
		let newComment = `<div class ="commentBlock"><p class ="comment">'${result.comments[i].content}'</p><p class ="comment">Posted by: ${result.comments[i].creator} on ${result.comments[i].created}</p></div>`;
		commentList += newComment;
	}
	console.log(commentList);
	//console.log(index);
	return `<p>Showing results for - ${result["phoneNumber"]}</p><p class= "comment-header">Comments (${result["comments"].length}): </h3><p>${result["description"]}</p>${commentList}`// <p>${result["comments"]}<p>;
}
function addCommentToUser(){
	$.ajax({
    url: '/users/',
    dataType: 'json',
    type: 'post',
    contentType: 'application/json',
    data: JSON.stringify( userData ),
    	//{ "phoneNumber": `${number}`, "description": `${description}`} ),
    processData: false,
    	success: function( data, textStatus, jQxhr ){
        console.log("Successfully posted data.");
        //$('#response pre').html( JSON.stringify( data ) );
    	},
    	error: function( jqXhr, textStatus, errorThrown ){
        console.log( errorThrown );
    	}
	});	
}

// function registerUser(userData){
// 	$.ajax({
//     url: '/users/',
//     dataType: 'json',
//     type: 'post',
//     contentType: 'application/json',
//     data: JSON.stringify( userData ),
//     	//{ "phoneNumber": `${number}`, "description": `${description}`} ),
//     processData: false,
//     	success: function( data, textStatus, jQxhr ){
//         console.log("Successfully posted data.");
//         //$('#response pre').html( JSON.stringify( data ) );
//     	},
//     	error: function( jqXhr, textStatus, errorThrown ){
//         console.log( errorThrown );
//     	}
// 	});
// }

function signInUser(userName, password){
	
	console.log("Starting sign in post request");

	var settings = {
		"async": true,
	  	"crossDomain": true,
	  	"url": "/auth/login",
	  	"method": "POST",
	  	"headers": {
	    	"Content-Type": "application/json",
	    	"Cache-Control": "no-cache",
	    	"Postman-Token": "a84b2ea0-684a-4a57-9d3e-236418c81321"
		},
  		"processData": false,
  		"data": "{\n\t\"username\":\""+userName+"\",\n\t\"password\":\""+password+"\"\n}"
	}

	$.ajax(settings).done(function (res) {
		//console.log("User name: " + userName);
		console.log(res);
		sessionStorage.setItem('userName', userName);
		sessionStorage.setItem('token', res.authToken);
		sessionStorage.setItem('id', res);
		console.log(res);
		window.location.reload();
		
	});
}

function logOutUser(){
	console.log("Logging out..."); 
    sessionStorage.clear();
    window.location.reload();
}

$('.js-success-message').hide();
$('.js-signup-popup-window').hide();
$('.post-response').hide();
$(watchSubmit);

