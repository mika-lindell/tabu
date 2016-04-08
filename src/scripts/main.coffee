
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
			return @DOMElement.appendChild(element.DOMElement)

# Used to retrieve data from async chrome API
#
class DataGetter

	# Construct new datablock
	#
	# @param [fn] The chrome API function´to be executed to get the data. E.g. chrome.topSites.get
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
			root.data = result
			root.status = 'ready'
			root.done()

		if @dataType is 'bookmarks'
			@api(@limit, getter)
		else
			@api(getter) # Call the api referenced in constructor

	# The callback evoked when operation status changes to 'ready'
	done: ()->


# Store the data retrieved from chrome API
#
class DataStorage

	constructor: ()->

	mostVisited: new DataGetter(chrome.topSites.get)
	recentlyClosed: new DataGetter(chrome.sessions.getRecentlyClosed)
	otherDevices: new DataGetter(chrome.sessions.getDevices)
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

		@push link

# Generate list of itemCards from DataGetter
#
class ItemCardList extends HTMLElement

	constructor: (data)->
		super('ul')
		@data = data
		@update()

	update: ()->	
		@fragment = document.createDocumentFragment()

		for item, i in @data
			card = new ItemCard(item.title, item.url, "most-visited-#{ i }")
			@fragment.appendChild(card.DOMElement)

		@DOMElement.appendChild(@fragment) 


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
		@DataStorage = new DataStorage
		@DataStorage.mostVisited.done = ()->
			container = new HTMLElement ('#most-visited')
			list = new ItemCardList(root.DataStorage.mostVisited.data)
			container.push list
		@DataStorage.fetchAll() 

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
