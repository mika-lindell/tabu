# Store the data retrieved from chrome API
#
class DataStorage

	constructor: ()->

	topSites: new DataGetter(chrome.topSites.get)
	recentlyClosed: new DataGetter(chrome.sessions.getRecentlyClosed, 'history')
	otherDevices: new DataGetter(chrome.sessions.getDevices, 'devices')
	latestBookmarks: new DataGetter(chrome.bookmarks.getRecent, 'bookmarks')

	fetchAll: ()->
		@topSites.fetch()
		@recentlyClosed.fetch()
		@otherDevices.fetch()
		@latestBookmarks.fetch()