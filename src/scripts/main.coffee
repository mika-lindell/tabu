
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

		@.push link

# Used to retrieve data from async chrome API
#
#
class DataGetter

	# Construct new datablock
	#
	# @param [fn] The chrome API function´to be executed to get the data. E.g. chrome.topSites.get
	#
	constructor: (api)->
		@api = api

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
		@.status = 'loading'
		root = @ # Reference the class so we can access it in getter-function

		getter = (result)->
			root.items = result
			root.status = 'ready'

		@api(getter) # Call the api referenced in constructor


# Store the data retrieved from chrome API
#
class DataStore

	constructor: ()->

	mostVisited: new DataGetter (chrome.topSites.get)
	recentlyClosed: new DataGetter (chrome.sessions.getRecentlyClosed)
	otherDevices: new DataGetter (chrome.sessions.getDevices)

	fetchAll: ()->
		@mostVisited.fetch()
		@recentlyClosed.fetch()
		@otherDevices.fetch()


# Append UI elements
#
class Render 

# Responsible of generating content for this app and keeping it up-to-date
#
class App
	
	# Construct new app
	#
	constructor: ()->

		@dataStore = new DataStore
		@dataStore.fetchAll() 

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


newtab = new App

#newtab.mostVisited.update()
