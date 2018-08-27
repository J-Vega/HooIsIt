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
