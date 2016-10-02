$(document).ready(function() {
	var articleData = [];
	var links = $('a[href="#articles"]');
	var articlesLoc = $('#articles');
	$(".hideBox").val(localStorage.badWords);
	$('.grid').masonry({
		itemSelector: '.list-group-item',
		gutter: 10
	});
	links.click(function() {
		var id = $(this).data("api-id");
		manipulateSources(this);
		loadData(id, function(articles) {
			articleData = articles;
			placeData(filterArticles($(".hideBox").val()));
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
				if (data.success) {
					callback(data.articles);
				}
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
		articleLoc.html(articleList);
	}

	$(".hideBox").keyup(function() {
		localStorage.setItem('badWords', $(this).val());
		placeData(filterArticles($(this).val()));
	});

	function filterArticles(text) {
		if (text.length > 3) {
			var badWords = text.replace(", ", ",").split(",");
			console.log(badWords);
			var temp = articleData;
			temp = temp.filter(function(ele) {
				foundWord = false;
				for (var i = 0; i < badWords.length; i++) {
					var inTitle = ele.title.toLowerCase().indexOf(badWords[i].toLowerCase()) > -1;
					var inDescrip = ele.description.toLowerCase().indexOf(badWords[i].toLowerCase()) > -1;
					foundWord = foundWord || (inTitle || inDescrip);
				}
				return !foundWord;
			});
			return temp;
		} else {
			return articleData;
		}
	}
});