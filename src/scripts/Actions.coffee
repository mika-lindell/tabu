# Class to misc startup initializations
#
class Actions

	@bookmarks
	@history
	@downloads
	@apps
	@incognito

	constructor: (bookmarks = '#view-bookmarks', history = '#view-history', downloads = '#view-downloads', apps = '#apps',incognito = '#go-incognito')->
		
		# Bind functionality to action buttons
		@bookmarks = new HTMLElement(bookmarks).on('click', @viewBookmarks)
		@history = new HTMLElement(history).on('click', @viewHistory)
		@downloads = new HTMLElement(downloads).on('click', @viewDownloads)
		# @apps = new HTMLElement(apps).on('click', @viewApps)
		@incognito = new HTMLElement(incognito).on('click', @goIncognito)

	# Navigate to bookmarks-page. Have to use script, as local resources cannot be opened by links.
	#
	viewBookmarks: ()->
		chrome.tabs.update { url: 'chrome://bookmarks/#1' }

	# Navigate to history-page. Have to use script, as local resources cannot be opened by links.
	#	
	viewHistory: ()->
		chrome.tabs.update { url: 'chrome://history/' }

	# Navigate to downloads-page. Have to use script, as local resources cannot be opened by links.
	#	
	viewDownloads: ()->
		chrome.tabs.update { url: 'chrome://downloads/' }

	# Navigate to apps-page. Have to use script, as local resources cannot be opened by links.
	#	
	viewApps: ()->
		chrome.tabs.update { url: 'chrome://apps/' }

	# Open new window in Incognito-mode
	#
	goIncognito: ()->
		chrome.windows.create {'incognito': true}