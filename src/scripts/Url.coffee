class Url

	@url
	@protocol
	@hostname
	@pathname
	@port
	@search
	@hash

	constructor: (url)->

		parser = document.createElement('a')
		parser.href = url

		@url = parser.href
		@protocol = parser.protocol
		@hostname = parser.hostname
		@pathname = parser.pathname
		@port = parser.port
		@search = parser.search
		@hash = parser.hash

		parser = null

	noPrefix: ()->
		# This will remove www. prefixes from url, but will keep subdomains.
		searchPattern = '^w+\\d*\\.'
		rx = new RegExp(searchPattern, 'gim')
		replacePattern = ''
		return @hostname.replace(rx, replacePattern)