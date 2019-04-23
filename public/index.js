

//If user is signed in, hide the sign in section, and show the user info section in the nav


function watchSubmit() {
	//Formats number - adds dashes automatically and prevents symbols
	$('.js-query').on('input', event => {
		addDashes(event.target);
	})

	$('.js-search-form').submit(event => {
		event.preventDefault();
		const numberQuery = $(event.currentTarget).find('.js-query').val();
		const parsedQuery = numberQuery.replace(/-/g, '');
		window.location.href = `listing.html?${parsedQuery}`;
	});

	$('.js-submit-form').submit('click', event => {
		event.preventDefault();
		if (sessionStorage.token != null) {
			const submitCreator = sessionStorage.userName;
			const submitQuery = window.location.search.slice(1);
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

			addPhoneNumber(submitData);
			$('.post-response').show();
		}
		else {
			alert("Please Sign In to post a comment.");
		}
	});
	$('.js-add-comment-form').submit(event => {
		event.preventDefault();
		const submitCreator = sessionStorage.userName;
		const comment = $(event.currentTarget).find('.js-submit-comment').val();

		var r = confirm(`Post Comment? \n\nYou can't change it after this (not yet)!\n\n ${comment}`);
		if (r == true) {
			addComment(sessionStorage.userName, comment);
		}
		else {
		}

		$('.post-response').show();

	});

	$('.js-register-form').submit(event => {
		event.preventDefault();

		const newUser = {
			"firstName": $(event.currentTarget).find('.js-register-first-name').val(),
			"lastName": $(event.currentTarget).find('.js-register-last-name').val(),
			"userName": $(event.currentTarget).find('.js-register-user-name').val(),
			"email": $(event.currentTarget).find('.js-register-email').val(),
			"password": $(event.currentTarget).find('.js-register-password').val()

		};

		registerUser(newUser);

	});

	$('.js-signin-form').submit(event => {
		event.preventDefault();
		const userName = $(event.currentTarget).find('#js-signin-username').val();
		const password = $(event.currentTarget).find('#js-signin-password').val();

		signInUser(userName, password);

	});

	$('.js-logout-button').on('click', function () {
		logOutUser();
	});

	$('.signup-link').on('click', function () {
		$('.js-signup-popup-window').show(300);
		$('.js-signin-popup-window').hide();
		$('.backFade').show();
	});
	$('.signin-link').on('click', function () {
		$('.js-signin-popup-window').show(300);
		$('.js-signup-popup-window').hide();
		$('.backFade').show();
	});
	$('.register-link').on('click', function () {
		$('.js-signup-popup-window').show(300);
		$('.backFade').show();
	});

	$('.cancel').on('click', function () {
		$('.js-signup-popup-window').hide(300);
		$('.js-signin-popup-window').hide(300);
		$('.backFade').hide();
	});

	$('.js-delete-user').click(event => {

		var r = confirm("Are you sure you want to delete your account?\n This will also delete ALL of your comments!");
		if (r == true) {
			deleteUser();
			console.log("Deleted!");
		} else {
			console.log("Never mind!");
		}

	})

}

function addDashes(f) {
	console.log(f.value);
	var r = /(\D+)/g,
		npa = '',
		nxx = '',
		last4 = '';
	f.value = f.value.replace(r, '');
	npa = f.value.substr(0, 3);
	nxx = f.value.substr(3, 3);
	last4 = f.value.substr(6, 4);
	if (nxx.length >= 1) {
		f.value = npa + '-' + nxx;
		if (last4.length > 0) {
			f.value = npa + '-' + nxx + '-' + last4;
		}
	}
}

function registerUser(userData) {
	$.ajax({
		url: '/users/',
		dataType: 'json',
		type: 'post',
		contentType: 'application/json',
		data: JSON.stringify(userData),

		processData: false,
		success: function (data, textStatus, jQxhr) {
			window.alert("Successfully registered! Now sign in with your info!");
			window.location.reload();
		},
		error: function (jqXhr, textStatus, errorThrown) {
			window.alert("Uh oh... something went wrong. Please try again later.");
		}
	});

}

function searchPhoneNumber(searchTerm, callback) {
	let query = {
		url: `https://stormy-tundra-36765.herokuapp.com/list/${searchTerm}`,
		type: 'get',
		dataType: 'json'
	}
	$.getJSON(query, callback);
}

function addPhoneNumber(data) {

	$.ajax({
		url: '/list',
		dataType: 'json',
		type: 'post',
		contentType: 'application/json',
		data: JSON.stringify(data),
		processData: false,
		success: function (data, textStatus, jQxhr) {
			window.location.reload();

		},
		error: function (jqXhr, textStatus, errorThrown) {
		}
	});
}

//Get function to list all phone numbers 
function getDataFromListing(callback) {
	let query = {
		url: "https://stormy-tundra-36765.herokuapp.com/list",
		dataType: 'json'
	}

	$.getJSON(query, callback);
};

function displaySearchData(data) {
	if (data == null) {
		console.log("No data!");
	}
	else {
		//***********    Concern -- DID NOT use data.map since the listing is an object and not an array
		//const results = data.phoneNumber.map((item,index) => renderResults(item,index));
		//console.log(`${results}`);
		console.log("There's data!");
		const results = renderResults(data);
		$('.js-results').html(results);
	}
}

function renderResults(result) {
	console.log(result["phoneNumber"]);
	console.log(result["flags"]);
	console.log(result["description"]);
	console.log(result["comments"]);
	//Converts all comments and comment info into one large string of html content to add onto final results.
	let commentList = "";
	console.log(commentList);
	for (i = 0; i < result["comments"].length; i++) {
		console.log(result.comments[i].content);
		let newComment = `
			<div class ="commentBlock">
				<p class ="comment">'${result.comments[i].content}'</p>
				<p class ="commenter">Posted by: ${result.comments[i].creator} on ${result.comments[i].created}</p>
			</div>
			`;
		commentList += newComment;
	}

	return `<p>Showing results for - ${result["phoneNumber"]}</p><p class= "comment-header">Comments (${result["comments"].length}): </h3><p>${result["description"]}</p>${commentList}`// <p>${result["comments"]}<p>;
}
function addCommentToUser() {
	$.ajax({
		url: '/users/',
		dataType: 'json',
		type: 'post',
		contentType: 'application/json',
		data: JSON.stringify(userData),
		processData: false,
		success: function (data, textStatus, jQxhr) {
		},
		error: function (jqXhr, textStatus, errorThrown) {
			console.log(errorThrown);
		}
	});
}

function signInUser(userName, password) {

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
		success: function (data, textStatus, jQxhr) {
			console.log("Success!");

		},
		error: function (jqXhr, textStatus, errorThrown) {
			alert("Incorrect log in info.");
			console.log(errorThrown);
		},
		"data": "{\n\t\"username\":\"" + userName + "\",\n\t\"password\":\"" + password + "\"\n}",

	}

	$.ajax(settings).done(function (res) {

		//Adds user name and JWT to session storage, 
		//	to update pages appropriately when they are logged in.
		sessionStorage.setItem('userName', userName);
		sessionStorage.setItem('token', res.authToken);
		window.location.reload();
	});
}

function logOutUser() {
	sessionStorage.clear();
	window.location.reload();
}

function deleteUser() {
	console.log("deleting user: " + sessionStorage.userName);
	let query = {
		url: `/users/${sessionStorage.userName}`,
		dataType: 'json'
	}
	console.log("getting json data from - " + query.url);
	$.getJSON(query, removeFromDb);
}

function removeFromDb(data) {
	$.ajax({

		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
		url: `/users/${data._id}`,

		type: 'DELETE',

		processData: false,
		success: function (data, textStatus, jQxhr) {
			console.log("Success!");

		},
		error: function (jqXhr, textStatus, errorThrown) {
			console.log(errorThrown);
		}
	});
	sessionStorage.clear();
	window.location.reload();

}

//Changes page html depending on whether the user is signed in, 
//	or if the search results has data.
function toggleHtml() {
	if (sessionStorage.token != null) {
		$('.js-signin-form').hide();
		$('.js-user-info').show();
		$('.js-add-comment-form').show();
		$('.guest-info').hide();
		$('.help-notification').show();
		$('.signin-notification').hide();
		$('.toggle-logged-in').show();
		document.getElementById("js-user-name").innerHTML = sessionStorage.userName;
	}
	else {
		$('.js-user-info').hide();
		$('.js-signin-form').show();
		$('.js-add-comment-form').hide();
		$('.guest-info').show();
		$('.help-notification').hide();
		$('.js-submit-form').hide();
		$('.toggle-logged-in').hide();
		$('.signin-notification').show();
	}
}

$('.backFade').hide();
$('.js-success-message').hide();
$('.js-signup-popup-window').hide();
$('.js-signin-popup-window').hide();
$('.post-response').hide();

toggleHtml();
$(watchSubmit);

