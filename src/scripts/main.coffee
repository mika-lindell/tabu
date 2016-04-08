
# Interface wrapper for standard HTML DOM Element.
#
#	HTMLElement.DOMElement - Standard DOM element object wrapped
#
class HTMLElement

	# Construct new element.
	#
	# @param [mixed] HTML tag name as string to create new element or standard element object to be wrapped. 
	#
	constructor: (element)->
		if element instanceof Element # Wrap the passed element
			@DOMElement = element
		else if element.charAt(0) is '#' # Use the passed id to wrap an element
			@DOMElement = document.getElementById(element.substr(1))
		else # Create new element to be wrapped
			@DOMElement = document.createElement(element)

	# Gets/sets the text inside an element
	#
	# @param [String] Text to be inserted
	#
	# @return [String]
	#
	text: (text = null)->
		if text?
			if @DOMElement
				return @DOMElement.textContent = text
		else
			return @DOMElement.textContent

	# Gets/sets an attribute of element
	#
	# @param [String] Attribute to be targeted
	# @param [String] New value for specified param
	#
	# @return [String]
	#
	attr: (attrName, newValue = null)->
		if newValue?
			return @DOMElement.setAttribute(attrName, newValue)
		else
			return @DOMElement.getAttribute(attrName)
	
	# Add child element as last item
	#
	# @param [HTMLElement] The element to be added
	#
	push: (element = null)->
		if element?
			if element instanceof HTMLElement
				return @DOMElement.appendChild(element.DOMElement)
			else
				return @DOMElement.appendChild(element)

# Used to retrieve data from async chrome API
#
class DataGetter

	# Construct new datablock
	#
	# @param [Function] The chrome API function´to be executed to get the data. E.g. chrome.topSites.get
	# @param [String] The structure type of this data. Can be links, bookmarks, devices or history
	#
	constructor: (api, dataType = 'links')->
		@api = api
		@limit = 20
		@dataType = dataType

	# Status of the operation.
	# Can be empty, loading or ready
	#	
	status: 'empty'

	# Retrieved data is stored in this variable
	#
	data: null

	# Get the data from chrome API
	#
	fetch: (api)->
		@status = 'loading'
		root = @ # Reference the class so we can access it in getter-function

		getter = (result)->

			if root.dataType is 'devices' or root.dataType is 'history' # If we are getting tabs, we need to flatten the object first
				root.data = root.flatten(result)
			else
				root.data = result

			root.status = 'ready'
			root.done()

		if @dataType is 'bookmarks' # If we are getting bookmarks, use limit
			@api(@limit, getter)
		else
			@api(getter) # Call the api referenced in constructor

	# The callback evoked when operation status changes to 'ready'
	#
	done: ()->

	# Flatten multidimensional devices and 'tabs'-array
	#
	# @param [array] The multidimensional array to be flattened
	#
	flatten: (source)->
		root = @
		result = []

		# Add items from array containing tabs
		addItems = (tabs)->
		if root.dataType is 'devices'
			for item, i in source
				result.push({ 'heading': item.deviceName }) # Add the device as heading
				for tab in item.sessions[0].window.tabs
					result.push({ 
						'title': tab.title
						'url': tab.url 
						}) # Add tabs from this session

		else if root.dataType is 'history'
			for item in source
				result.push({ 
					'title': item.tab.title
					'url': item.tab.url 
					}) # Add tabs from this session # Add tabs from this session

		return result

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

# Creates special list item containing a link.
#
class ItemCard extends HTMLElement

	# Construct new card.
	#
	# @param [String] Title of the card
	# @param [String] Url of the link related to this card
	#
	constructor: (title, url, id = null)->
		super('li')

		link = new HTMLElement('a')
		link.text(title)
		link.attr('href', url)
		if id?
			link.attr('id', id)

		@push(link)

# Creates special list item containing a link.
#
class ItemCardHeading extends HTMLElement

	# Construct new card heading.
	#
	# @param [String] Title of the card
	#
	constructor: (title, id = null)->
		super('li')

		heading = new HTMLElement('h5')
		heading.text(title)
		if id?
			heading.attr('id', id)

		@push(heading)

# Generate list of itemCards from DataGetter
#
class ItemCardList extends HTMLElement

	constructor: (dataGetter, baseId = 'card')->
		super('ul')

		@dataGetter = dataGetter
		@baseId = baseId

		@attr('id', "#{ @baseId }-list")
		@update()

	update: ()->	
		@fragment = document.createDocumentFragment()

		for item, i in @dataGetter.data

			cardId = "#{ @baseId }-#{ i }"

			if item.heading?
				card = new ItemCardHeading(item.heading, cardId)
			else
				card = new ItemCard(item.title, item.url, cardId)

			@fragment.appendChild(card.DOMElement)

		@push(@fragment) 


# Append UI elements
#
class Render 

	constructor: ()->

	itemCardList: ()->

# Responsible of generating content for this app and keeping it up-to-date
#
class App
	
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

	# Manage the display of most visited sites
###	mostVisited:
		items: []
		update: ()->
			parent = @
			list = new HTMLElement ('#most-visited')
			walker = (topSites)->
				parent.items = topSites
				for site, i in topSites
					card = new ItemCard(site.title, site.url, "most-visited-#{ i }")
					list.push(card) 

			chrome.topSites.get(walker)###


$newTab = new App

#newtab.mostVisited.update()
