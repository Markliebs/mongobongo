$(document).ready(function () {
	$("button").on('click', "#submit", function () {
		//console.log($(this).val());
		$.ajax({
		    type: "GET",
		    url: '/submit',
		    dataType: 'JSON',
		  })
			.done(function (data) {
				console.log(data);
				console.log("test");
				//can build out wells here in a for loop or use handlebars helper function
			});
		return false;
	});

	$("button").on('click', "#addComment", function (event) {
		//console.log($(this).val());
		event.preventDefault();
		$.ajax({
		    type: "POST",
		    url: '/addComment',
		    dataType: 'json',
		    data: {
		      id: $(this).val(),
		      user: $('#user').val().trim(),
		      comment: $('#comment').val().trim(),
		      created: Date.now()
		    }
		  })
			.done(function (data) {
				console.log(data);
				$('#user').val("");
				$('#comment').val("");
				$('.comments').append("<p>" + data.user + ": " + data.comment + "</p>");
			});
		return false;
	});

	$("button").on('click', "#delete", function () {
		$.ajax({
		    type: "POST",
		    url: '/delete',
		    dataType: 'json',
		    data: {
		      id: $(this).parent().parent().val(),
		      user: $('#user').val().trim(),
		      comment: $('#comment').val().trim(),
		      created: $(this).val(),
		    }
		  })
			.done(function (response) {
				console.log(response);
			});
		return false;
	});
})