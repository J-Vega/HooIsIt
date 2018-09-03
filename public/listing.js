
//This script is only called from listing.html
//	and is used to do a GET request of whatever phone number is being searched / listed
//js-phone-number

//html5 
//.com/search/23423423235

//.com/search/?var=334445555
$('.no-data').hide();
$('.has-data').hide();

let phoneNumber = window.location.search.slice(1); 
let phoneId = "";

function watchSubmit(){
	$('.js-listing-search').submit(event => 
	{ 
		event.preventDefault();

		const numberQuery = $(event.currentTarget).find('.js-navSearch').val();
		
		
		window.location.href = `listing.html?${numberQuery}`;

	});	
}

function getNumberData(number, callback){
	
	//let numberFromUrl = number.slice(1);
	//console.log(numberFromUrl);
	document.getElementById("js-phone-number-1").innerHTML = number;
	console.log(`Searching for phone number ${number}`);
	
	let query = {
		//url: "https://stormy-tundra-36765.herokuapp.com/list",
		url: `/search/${number}`,
		dataType: 'json'
		//success: callback
	}
	console.log("getting json data from - " + query.url);
	$.getJSON(query,callback);
}

function displaySearchData(data){
	console.log("Displaying data");
	if(data == null){
		console.log("No data!");
		
		$('.no-data').show();
		$('.js-results').html("<p>There are currently no comments.</p>");
	}
	else{
		//***********    Concern -- DID NOT use data.map since the listing is an object and not an array
		//const results = data.phoneNumber.map((item,index) => renderResults(item,index));
		//console.log(`${results}`);
		console.log("There's data!");
		$('.has-data').show();
		
		const results = renderListing(data);
		$('.js-results').html(results);

		//Since there is data for that phone number, display the comment form so users can add one
		$(".addCommentForm").show();
	}
}

//js-results is where listing info is returned
function renderListing(result){
	console.log(result);
	// Reverses comments, so most recent is rendered first.
	result["comments"].reverse();
	let commentList = "";//result.comments[0].content;
	for(i = 0; i < result["comments"].length; i++){
		// console.log(result.comments[i].content);
		commentList += `
		<div class = "commentBlock"><p class ="comment">'${result.comments[i].content}'</p>
		<p class ="commenter">Posted by: ${result.comments[i].creator} 
			on ${result.comments[i].created.slice(0,10)}</p></div>`;
	}
	// console.log(commentList);
	//console.log(index);
	savePostId(result["_id"]);
	console.log(result["_id"]);
	return `	
				<h3>Previous reports for - ${result["phoneNumber"]}</h3>
				<h3>Type of call: ${result["description"]}</h3>
				
				<h4>Comments (${result["comments"].length}): </h4><p>${commentList}</p>
			`
			// Most likely going to get rid of 'flags'
			// <h3>This number has been flagged ${result["flags"]} time(s). </h3>
	}

function savePostId(id){
	console.log(id);
	phoneId = id;
}

function hideCommentForm(){
	$(".addCommentForm").hide();
}
 
function addComment(author,comment){
	console.log("Adding comment to post id - "+ phoneId);
	$.ajax({

		headers: { 
        'Accept': 'application/json',
        'Content-Type': 'application/json' 
    	},
        url: `/list/${phoneId}`,

        type: 'PUT',

        data: JSON.stringify({

        	"id":`${phoneId}`,
			"creator":`${author}`,
			"comments":`${comment}`
        }),

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

$(watchSubmit);
hideCommentForm();
getNumberData(phoneNumber, displaySearchData);

//End