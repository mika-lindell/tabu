# Store the data retrieved from chrome API
#
class DataStorage

	@topSites
	@latestBookmarks
	@recentlyClosed
	@otherDevices

	constructor: ()->
		@topSites = new DataGetter(chrome.topSites.get)
		@latestBookmarks = new DataGetter(chrome.bookmarks.getRecent, 'latestBookmarks')
		@recentlyClosed = new DataGetter(chrome.sessions.getRecentlyClosed, 'recentlyClosed')
		@otherDevices = new DataGetter(chrome.sessions.getDevices, 'otherDevices')
	

	fetchAll: ()->
		@topSites.fetch()
		@latestBookmarks.fetch()
		@recentlyClosed.fetch()
		@otherDevices.fetch()
		