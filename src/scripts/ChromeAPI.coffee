# Used to retrieve data from async chrome API
#
class ChromeAPI

	@api
	@limit
	@dataType

	# The amount of retries & retry delay for fetching data
	# no retries by default
	#
	@retry

	# Status of the operation.
	# Can be empty, loading or ready
	#	
	@status = 'empty'

	# Retrieved data is stored in this variable
	#
	@data = null

	# Construct new datablock
	#
	# @param [api] The chrome API function to be executed to get the data. E.g. chrome.topSites.get
	# @param [String] The structure type of this data. Can be topSites, latestBookmarks, recentHistory, otherDevices or recentlyClosed
	#
	constructor: (dataType = 'topSites', limit = 18)->

		@limit = limit
		@dataType = dataType
		@retry = 
			i: 0
			tries: 0
			max: 0
			delay: 5000

		if dataType is 'topSites'
			@api = chrome.topSites.get
		else if dataType is 'latestBookmarks'
			@api = chrome.bookmarks.getRecent
		else if dataType is 'recentHistory'
		 	@api = chrome.history.search
		else if dataType is 'recentlyClosed'
			@api = chrome.sessions.getRecentlyClosed
		else if dataType is 'otherDevices'
			@api = chrome.sessions.getDevices

	# Get the data from chrome API
	#
	fetch: ()->

		root = @ # Reference the class so we can access it in getter-function

		root.status = 'loading'
		console.log "ChromeAPI: I'm calling to chrome API about #{@dataType}..."

		getter = (result)->

			if root.dataType is 'otherDevices' or root.dataType is 'recentlyClosed' # If we are getting tabs, we need to flatten the object first
				data = root.flatten(result)
			else if root.dataType is 'recentHistory'
				data = root.unique(result, 'url', 'title')
			else
				data = result

			if root.dataType is 'recentHistory' or root.dataType is 'recentlyClosed' or root.dataType is 'topSites'
				data = data.slice(0, root.limit) # Limit the amount of data stored
				
			root.data = data

			# Handle retries if empty data is received
			if root.data.length is 0 and root.retry.i < root.retry.max

				console.log "ChromeAPI: Got empty array, Retrying to get -> #{root.dataType}"
				root.retry.i = root.retry.i+1
				root.retry.tries = root.retry.i

				setTimeout(()->
					root.fetch()
				, root.retry.delay)
				
				root.done()

			else

				# Reset retry iterator
				root.retry.i = 0	

				# Set status to ready
				root.status = 'ready'
				root.done()

				console.log "ChromeAPI: Ok, got #{root.dataType} ->", root.data



		if root.dataType is 'latestBookmarks' # If we are getting bookmarks, use limit here also
			
			root.api(root.limit, getter)

		else if root.dataType is 'recentHistory' # If we are getting history, special call is needed
			
			# params for searching in browser history (no filter)
			#
			params =
				'text': ''
				'maxResults': root.limit * 2

			root.api(params, getter)

		else
			
			root.api(getter) # Call the api referenced in constructor

	# The callback evoked when operation status changes to 'ready'
	#
	done: ()->

	# Flatten multidimensional 'otherDevices' and 'tabs'-array (recentlyClosed)
	#
	# @param [array] The multidimensional array to be flattened
	#
	flatten: (source)->
		root = @
		result = []

		# Adds item to array to be returned
		addToResult = (title, url, result)->
			if url.indexOf('chrome://') is -1 and url.indexOf('file://') is -1 # Exclude system urls and files (local resources not allowed by chrome)
				result.push({ 
					'title': title
					'url': url 
					})

		if root.dataType is 'otherDevices'

			# Get counts for total items
			devicesCount = source.length

			for item, i in source

				result.push({ 'heading': item.deviceName }) # Add the device as heading

				for tab, i in item.sessions[0].window.tabs
					# Make sure all items aren't from one device, if there are sessions from multiple devices
					if i is Math.round(root.limit / devicesCount) then break
					addToResult tab.title, tab.url, result  # Add tabs from this session

		else if root.dataType is 'recentlyClosed'

			for item, i in source

				if item.window? # There are two kinds of objects in recentlyClosed: full sessions with multiple tabs and wiondows with single tab
					for tab in item.window.tabs # Handle multiple tabs
						addToResult tab.title, tab.url, result  # Add tabs from this session
				else # Handle single tab
					addToResult item.tab.title, item.tab.url, result

		return result

	# Remove duplicate urls and empty titles from history array (array of objects).
	#
	# @param [array] The array to be modified
	# @param [string] The name of the property which is compared to determine uniqueness
	# @param [string] Optional. The name of the property which is compared to determine if this item shouldn't be included.
	#
	# @return [array] Array with all 'undesirables' removed.
	#
	unique: (source)->

		walker = (mapItem) ->
			return mapItem['url']

		filter = (item, pos, array) ->
			return array.map(walker).indexOf(item['url']) == pos and item['title'] != ''

		source.filter filter