class Url

	@href
	@protocol
	@hostname
	@pathname
	@port
	@search
	@hash

	constructor: (url)->

		parser = document.createElement('a')
		parser.href = url

		@href = parser.href
		@protocol = parser.protocol
		@hostname = parser.hostname
		@pathname = parser.pathname
		@port = parser.port
		@search = parser.search
		@hash = parser.hash

		parser = null

	withoutPrefix: ()->
		# This will remove www. & m. prefixes from url, but will keep subdomains.
		searchPattern = '^(w+\\d*\\.|m\\.)'
		rx = new RegExp(searchPattern, 'gim')
		replacePattern = ''
		return @hostname.replace(rx, replacePattern)