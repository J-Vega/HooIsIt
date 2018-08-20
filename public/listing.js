
//This script is only called from listing.html
//	and is used to do a GET request of whatever phone number is being searched / listed
//js-phone-number

//html5 
//.com/search/23423423235

//.com/search/?var=334445555

let phoneNumber = window.location.search.slice(1); 
let phoneId = "";

function watchSubmit(){
	$('.js-add-comment-form').submit(event => 
	{ 
		event.preventDefault();
		const commentAuthor = $(event.currentTarget).find('.js-add-comment-name').val();
		const newComment = $(event.currentTarget).find('.js-add-comment-content').val();
		
		console.log(`${commentAuthor} said: "${newComment}"`);

		//PUT request for phone number posting
		addComment(commentAuthor,newComment);

	});	
}

function getNumberData(number, callback){
	
	//let numberFromUrl = number.slice(1);
	//console.log(numberFromUrl);
	document.getElementById("js-phone-number-1").innerHTML = number;
	console.log(`Searching for phone number ${number}`);
	
	let query = {
		//url: "https://stormy-tundra-36765.herokuapp.com/list",
		url: `https://stormy-tundra-36765.herokuapp.com/search/${number}`,
		dataType: 'json'
		//success: callback
	}
	console.log("getting json data from - " + query.url);
	$.getJSON(query,callback);
}

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

		//Since there is data for that phone number, display the comment form so users can add one
		$(".addCommentForm").show();
	}
}

//js-results is where listing info is returned
function renderResults(result){
	console.log(result);
	let commentList = "";//result.comments[0].content;
	for(i = 0; i < result["comments"].length; i++){
		// console.log(result.comments[i].content);
		commentList += `<p class ="comment">'${result.comments[i].content}'</p><p class ="commentCreator">Posted by: ${result.comments[i].creator} on ${result.comments[i].created}</p>`;
	}
	// console.log(commentList);
	//console.log(index);
	savePostId(result["_id"]);

	return `	
				<h3>Previous reports for - ${result["phoneNumber"]}</h3>
				<h3>Type of call: ${result["description"]}</h3>
				
				<h4>Comments (${result["comments"].length}): </h4><p>${commentList}</p>
			`
			// Most likely going to get rid of 'flags'
			// <h3>This number has been flagged ${result["flags"]} time(s). </h3>
	}

function savePostId(id){
	// console.log(id);
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
        url: `https://stormy-tundra-36765.herokuapp.com/list/${phoneId}`,

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
//document.getElementById("js-phone-number").innerHTML = phoneNumber;
console.log(window.location.search);
$(watchSubmit);
hideCommentForm();
getNumberData(phoneNumber, displaySearchData);

//End