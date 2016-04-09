# Responsible of generating content for this app and keeping it up-to-date
#
class App
	
	console.log "App: Starting up..."

	@dataStorage
	
	# Construct new app
	#
	constructor: ()->
		root = @
		@dataStorage = new DataStorage
		@dataStorage.mostVisited.done = ()->
			container = new HTMLElement ('#most-visited')
			list = new ItemCardList(root.dataStorage.mostVisited, 'most-visited')
			container.push list
		@dataStorage.recentBookmarks.done = ()->
			container = new HTMLElement ('#recent-bookmarks')
			list = new ItemCardList(root.dataStorage.recentBookmarks, 'recent-bookmarks')
			container.push list
		@dataStorage.otherDevices.done = ()->
			container = new HTMLElement ('#other-devices')
			list = new ItemCardList(root.dataStorage.otherDevices, 'other-devices')
			container.push list
		@dataStorage.recentlyClosed.done = ()->
			container = new HTMLElement ('#recently-closed')
			list = new ItemCardList(root.dataStorage.recentlyClosed, 'recently-closed')
			container.push list
		@dataStorage.fetchAll() 
		console.log "App: Ready <3"