let debug;


function watchSubmit(){
	$('.js-search-form').submit(event => 
	{
		console.log('clicked');
		event.preventDefault();
		const numberQuery = $(event.currentTarget).find('.js-query').val();
		console.log("searching for " + numberQuery);
		searchPhoneNumber(numberQuery,displaySearchData);
		//getDataFromListing(displaySearchData);
	});
}

function searchPhoneNumber(searchTerm,callback){
	let query = {
		//url: "https://stormy-tundra-36765.herokuapp.com/search/"+searchTerm,
		url: "localhost:8080/search/"+searchTerm,
		dataType: 'json'
		//success: callback
	}
	
	$.getJSON(query,callback);
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
	//console.log(data);
	debug = data;
	const results = 
		data.map((item,index) => renderResults(item,index));
	//console.log(`${results}`);
	$('.js-results').html(results);
}

function renderResults(result,index){
	//console.log(result);
	//console.log(index);
	return `<p>${result["phoneNumber"]}<p><p>${result["flags"]}</p><p>${result["description"]}<p><p>${result["comments"]}<p>`;
}
console.log("Hello world");

//$('.js-results').html("test");
//getDataFromListing(displaySearchData);

watchSubmit();