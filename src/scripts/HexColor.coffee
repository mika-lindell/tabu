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

	getWithMaxBrightness: (hexCode, max)->

		from = getBrightness(hexCode)

		change = Math.round((max - from) * 100) / 100 

		console.log change, max, from

		if change is 0
			return hexCode
		else
			return setLuminance(hexCode, change)

	# http://www.webmasterworld.com/forum88/9769.htm
	getBrightness = (hexCode) ->
	  # strip off any leading #
	  hexCode = hexCode.replace('#', '')
	  c_r = parseInt(hexCode.substr(0, 2), 16)
	  c_g = parseInt(hexCode.substr(2, 2), 16)
	  c_b = parseInt(hexCode.substr(4, 2), 16)
	  brightness = (c_r * 299 + c_g * 587 + c_b * 114) / 1000 / 255
	  return Math.round(brightness * 100) / 100


	#https://www.sitepoint.com/javascript-generate-lighter-darker-color/
	setLuminance = (hexCode, lum) ->
	  # validate hexCode string
	  hexCode = String(hexCode).replace(/[^0-9a-f]/gi, '')
	  if hexCode.length < 6
	    hexCode = hexCode[0] + hexCode[0] + hexCode[1] + hexCode[1] + hexCode[2] + hexCode[2]
	  lum = lum or 0
	  # convert to decimal and change luminosity
	  rgb = '#'
	  c = undefined
	  i = undefined
	  i = 0
	  while i < 3
	    c = parseInt(hexCode.substr(i * 2, 2), 16)
	    c = Math.round(Math.min(Math.max(0, c + c * lum), 255)).toString(16)
	    rgb += ('00' + c).substr(c.length)
	    i++
	  return rgb

  
