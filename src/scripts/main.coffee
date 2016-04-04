app = ()->
	walker = (sites)->
		console.log site for site in sites

	chrome.topSites.get(walker)

app()

foobar = 'foobar'