var links = $('a[href="#articles"]');
var articlesLoc = $('#articles');
$('.grid').masonry({
	itemSelector: '.list-group-item',
	gutter: 10
});
links.click(function() {
	var id = $(this).data("api-id");
	manipulateSources(this);
	loadData(id, function(articles) {
		placeData(articles);
	});

});

function manipulateSources(self) {
	var id = $(self).data("api-id");
	links.toggleClass("hidden");
	$(self).toggleClass("hidden");
	$(self).toggleClass("active");
	$(self).css({
		pointerEvents: "none"
	});
	var backButton = $('<a class="list-group-item list-group-item-danger" href="#">&laquo; Go Back to List</a>');
	backButton.click(function() {
		$(self).toggleClass("active");
		$(self).css({
			pointerEvents: "auto"
		});
		links.removeClass("hidden");
		$('.grid').masonry('remove', $(this)).masonry();
		$('.article-list').remove();
	});
	$(self).parent().prepend(backButton)
		.masonry('prepended', backButton)
		.masonry();
}

function loadData(id, callback) {
	$.ajax({
			url: "/news",
			data: {
				source: id
			}
		})
		.done(function(data) {
			if (data.success)
				callback(data.articles);
		});
	console.log(id);
}

function placeData(articles) {
	var articleLoc = $("#articles");
	var innerHtml = "<ul>";
	for (var i = 0; i < articles.length; i++) {
		innerHtml += "<li>";
		innerHtml += "<a href='" + articles[i].url + "'' title=''>";
		innerHtml += articles[i].title;
		innerHtml += "</a> <br/>";
		innerHtml += articles[i].description;
		innerHtml += " (Score: " + articles[i].score + ")";
	}
	innerHtml += "</ul>";
	var articleList = $('<div />', {
		"class": 'article-list jumbotron',
		html: innerHtml
	});
	articleLoc.append(articleList);
}