# Convert arbitrary string to color in hexadecimal format
#
#
class HexColor
	
	@parser
	@url # color from url
	@string # color from string

	constructor: (url)->

		if url instanceof Url then url = url.href

		@url = @fromUrl(url)
		@string = @fromString(url)

	# Generate hexadecimal color from url
	# Ignores protocols and web prefixeses to create unique color for every address
	#
	# @param [String] the url to be converted
	#
	# @return [String] color hexadecimal format
	#	
	fromUrl: (url)->

		urlParser = new Url(url)
		return @fromString(urlParser.withoutPrefix())

	# Generates hexadecimal color from arbitrary string
	# Courtesy of http://stackoverflow.com/questions/3426404/create-a-hexadecimal-colour-based-on-a-string-with-javascript
	#
	# @param [String] the string to be converted
	#
	# @return [String] color hexadecimal format
	#
	fromString: (string)->

		# string to hash
		i = 0
		hash = 0
		while i < string.length
		  hash = string.charCodeAt(i++) + (hash << 5) - hash

		# int/hash to hex
		x = 0
		colour = '#'
		while x < 3
	  	colour += ('00' + (hash >> x++ * 8 & 0xFF).toString(16)).slice(-2)

	  ###  
	  for (var i = 0, hash = 0; i < str.length; hash = str.charCodeAt(i++) + ((hash << 5) - hash)); 
	  for (var i = 0, colour = "#"; i < 3; colour += ("00" + ((hash >> i++ * 8) & 0xFF).toString(16)).slice(-2));
		###

		return colour;



  
