function openHistory(){
	window.open('page-downloads.html','_blank');
}
	
function init() {	
	document.getElementById("open_urls").addEventListener('click', openHistory);
}

document.addEventListener('DOMContentLoaded', init);
