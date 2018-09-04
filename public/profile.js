console.log(sessionStorage);

function getProfileData(searchTerm,callback){
	console.log("Searching user name " +searchTerm);
	let query = {
		//url: "https://stormy-tundra-36765.herokuapp.com/list",
		url: `/users/${searchTerm}`,
		dataType: 'json'
		//success: callback
	}
	console.log(query.url);
	$.getJSON(query,callback);
}

function displayUserData(data){
	console.log("Displaying data");
	if(data == null){
		console.log("No data!");
		$('.no-data').show();
	}
	else{
		console.log("There's data!");
		//$('.has-data').show();
		const results = renderUserData(data);
		$('.js-results').html(results);
		//Since there is data for that phone number, display the comment form so users can add one
		//$(".addCommentForm").show();
	}
}

function getUserComments(userName,callback){
	let query = {
		//url: "https://stormy-tundra-36765.herokuapp.com/list",
		url: `/comments/${userName}`,
		dataType: 'json'
		//success: callback
	}
	console.log(query.url);
	$.getJSON(query,callback);
}

function displayComments(data){
	if(data == null){
		console.log("No data!");
		$('.no-data').show();
	}
	else{
		console.log("There's data!");
		//$('.has-data').show();
		const results = renderComments(data);
		$('.user-comments').html(results);
		//Since there is data for that phone number, display the comment form so users can add one
		//$(".addCommentForm").show();
	}
}

function renderComments(data){
	console.log(data);
	let commentList = [];
	for(i = 0; i < data.length; i++){
		console.log(data[i].phoneNumber);

		for(j = 0; j < data[i].comments.length; j++){

			if(data[i].comments[j].creator === sessionStorage.userName){

			console.log(data[i].comments[j].creator);

			let newComment = `
			<div class ="commentBlock">
				<p class ="comment">'${data[i].comments[j].content}'</p>
				<a class ="profile-number" href ="listing.html?${data[i].phoneNumber}">${data[i].phoneNumber}</a>
			</div>
			`;

			commentList += newComment;
			}
		}
	
	}
	console.log(commentList);
	return `<p>${commentList}</p>`;
}

function renderUserData(result){
	console.log(result);
	return `<p class>First name: ${result.firstName}</p><p>Last name: ${result.lastName}</p><p>User name: ${result.userName}</p>`;
}
console.log("hello from profile.js");

if(sessionStorage.userName != null){
	console.log("Session storage not null... searching profile.")
	$('.profile-signin-notification').hide();
	$('.account-info-header').show();
	getProfileData(sessionStorage.userName,displayUserData);
	getUserComments(sessionStorage.userName,displayComments);
}
else {
	$('.profile-signin-notification').show();
	$('.account-info-header').hide();
}
$('.delete-popup').hide();
