# Class to make miscellanious calls to browser api
#
class Helpers

	constructor: ()->
		
		@bindClick '#go-incognito', @goIncognito
		@bindClick '#view-bookmarks', @viewBookmarks
		@bindClick '#view-history', @viewHistory


	# To add listener to click event
	#
	# @param id [String] id of the HTML element to add the listener to
	# @param listener [Function] the function to be called when the event is fired
	#	
	bindClick: (id, listener)->
		elem = new HTMLElement(id, listener)
		elem.on('click', listener)

	# Navigate to bookmarks-page. Have to use script, as local resources cannot be opened by links.
	#
	viewBookmarks: ()->
		chrome.tabs.update { url: 'chrome://bookmarks/#1' }

	# Navigate to bookmarks-page. Have to use script, as local resources cannot be opened by links.
	#	
	viewHistory: ()->
		chrome.tabs.update { url: 'chrome://history/' }

	# Open new window in Incognito-mode
	#
	goIncognito: ()->
		chrome.windows.create {'incognito': true}


