
function getProfileData(searchTerm,callback){

	let query = {
		url: `/users/${searchTerm}`,
		dataType: 'json'
	}
	$.getJSON(query,callback);
}

function displayUserData(data){

	if(data == null){
		
		$('.no-data').show();
	}
	else{
		
		const results = renderUserData(data);
		$('.js-results').html(results);
	}
}

function getUserComments(userName,callback){
	let query = {
		url: `/comments/${userName}`,
		dataType: 'json'
	}
	
	$.getJSON(query,callback);
}

function displayComments(data){
	if(data == null){
		
		$('.no-data').show();
	}
	else{
		const results = renderComments(data);
		$('.user-comments').html(results);
	}
}

function renderComments(data){
	
	let commentList = [];
	for(i = 0; i < data.length; i++){
		

		for(j = 0; j < data[i].comments.length; j++){

			if(data[i].comments[j].creator === sessionStorage.userName){

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
	
	return `<p>${commentList}</p>`;
}

function renderUserData(result){

	return `<p class>First name: ${result.firstName}</p>
		<p>Last name: ${result.lastName}</p>
		<p>User name: ${result.userName}</p>
		`;
}


if(sessionStorage.userName != null){
	
	$('.profile-signin-notification').hide();
	$('.account-info-header').show();
	getProfileData(sessionStorage.userName,displayUserData);
	getUserComments(sessionStorage.userName,displayComments);
}
else {
	window.location.replace("/");
}

$('.delete-popup').hide();



