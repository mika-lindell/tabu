# Store the data retrieved from chrome API
#
class DataStorage

	constructor: ()->

	mostVisited: new DataGetter(chrome.topSites.get)
	recentlyClosed: new DataGetter(chrome.sessions.getRecentlyClosed, 'history')
	otherDevices: new DataGetter(chrome.sessions.getDevices, 'devices')
	recentBookmarks: new DataGetter(chrome.bookmarks.getRecent, 'bookmarks')

	fetchAll: ()->
		@mostVisited.fetch()
		@recentlyClosed.fetch()
		@otherDevices.fetch()
		@recentBookmarks.fetch()