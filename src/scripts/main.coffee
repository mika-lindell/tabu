#walker = (sites)->
#	console.log sites #site for site in sites

#chrome.topSites.get(walker)


Class Element
	
	constructor: (tagName)->
		@fragment = document.createDocumentFragment()
		@DOMElement = @fragment.createElement(tagName)



