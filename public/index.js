
let baseUrl = "https://stormy-tundra-36765.herokuapp.com/";

function watchSubmit(){
	$('.js-search-form').submit(event => 
	{
		event.preventDefault();
		const numberQuery = $(event.currentTarget).find('.js-query').val();
		console.log("searching for " + numberQuery);
		window.location.href = `listing.html?${numberQuery}`;//`${baseUrl}/search/`+numberQuery;
		//searchPhoneNumber(numberQuery,displaySearchData);
		//getDataFromListing(displaySearchData);
	});

	$('.js-submit-form').submit(event => 
	{
		event.preventDefault();
		const submitCreator = $(event.currentTarget).find('.js-submit-name').val();
		const submitQuery = $(event.currentTarget).find('.js-submit-number').val();
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
    url: 'https://stormy-tundra-36765.herokuapp.com/list',
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
		commentList += `<div class ="commentBlock"><p class ="comment">'${result.comments[i].content}'</p><p class ="comment">Posted by: ${result.comments[i].creator} on ${result.comments[i].created}</p></div>`;
	}
	console.log(commentList);
	//console.log(index);
	return `<p>Showing results for - ${result["phoneNumber"]}</p><p>This number has been flagged ${result["flags"]} time(s). </p><h3>Comments (${result["comments"].length}): </h3><p>${result["description"]}</p>${commentList}`// <p>${result["comments"]}<p>;
}

function registerUser(userData){
	$.ajax({
    url: 'https://stormy-tundra-36765.herokuapp.com/users/',
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
$('.js-success-message').hide();
$('.post-response').hide();
$(watchSubmit);

