
function watchSubmit(){
	$('.js-search-form').submit(event => 
	{
		event.preventDefault();
		const numberQuery = $(event.currentTarget).find('.js-query').val();
		console.log("searching for " + numberQuery);
		//window.location.href = "https://stormy-tundra-36765.herokuapp.com/search/"+numberQuery;
		searchPhoneNumber(numberQuery,displaySearchData);
		//getDataFromListing(displaySearchData);
	});

	$('.js-submit-form').submit(event => 
	{
		event.preventDefault();
		const submitQuery = $(event.currentTarget).find('.js-query').val();
		const submitDescription = $(event.currentTarget).find('.js-query-submit').val();
		console.log("Submitting " + submitQuery);
		console.log("Description: " + submitDescription);
		
		addPhoneNumber(submitQuery,submitDescription);
		//Add phone number to database

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

function addPhoneNumber(number,description){
	
	// let query = {
	// 	//url: "https://stormy-tundra-36765.herokuapp.com/list",
	// 	url: `https://stormy-tundra-36765.herokuapp.com/list/`,
	// 	method: "POST",
	// 	phoneNumber: number,
	// 	description: description,
	// 	dataType: 'json'
	// 	//success: callback
	// }
	
	// $.post(`https://stormy-tundra-36765.herokuapp.com/list/`,
	// {
	// 	"phoneNumber":"7777777773",
	// 	"description":"IRS Scammerss!"
	// },
		
	// function(data, status){
	// 	alert("Data: " + data + "\nStatus: " + status);
	// });
	// console.log("Submitted phone number to db");

	$.ajax({
    url: 'https://stormy-tundra-36765.herokuapp.com/list',
    dataType: 'json',
    type: 'post',
    contentType: 'application/json',
    data: JSON.stringify( { "phoneNumber": "9999991111", "description": "IRS Scam!"} ),
    processData: false,
    	success: function( data, textStatus, jQxhr ){
        console.log("Success!");
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
		console.log("There's data!");
	}
	//console.log(data.phoneNumber);

	//***********    Concern -- DID NOT use data.map since the listing is an object and not an array
	//const results = data.phoneNumber.map((item,index) => renderResults(item,index));
	//console.log(`${results}`);
	const results = renderResults(data);
	$('.js-results').html(results);
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
		commentList += `<p class ="comment">'${result.comments[i].content}'</p><p class ="comment">Posted by: ${result.comments[i].creator} on ${result.comments[i].created}</p>`;
	}
	console.log(commentList);
	//console.log(index);
	return `<p>Showing results for - ${result["phoneNumber"]}</p><p>This number has been flagged ${result["flags"]} time(s). </p><h3>Comments (${result["comments"].length}): </h3><p>${result["description"]}</p>${commentList}`// <p>${result["comments"]}<p>;
}


//$('.js-results').html("test");
//getDataFromListing(displaySearchData);

//This calls the function, while using jQuery $ uses an event listener
//watchSubmit();
$(watchSubmit);


