console.log(sessionStorage);

function watchSubmit(){
	console.log('hi');
}

function getProfileData(searchTerm,callback){
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

function renderUserData(result){
	console.log(result);
	return `<p>First name: ${result.firstName}</p><p>Last name: ${result.lastName}</p><p>User name: ${result.userName}</p>`;
}
console.log("hello from profile.js");

if(sessionStorage.userName != null){
	$('.profile-signin-notification').hide();
	$('.account-info-header').show();
	getProfileData(sessionStorage.userName,displayUserData);
}
else {
	$('.profile-signin-notification').show();
	$('.account-info-header').hide();
}

$(watchSubmit);
