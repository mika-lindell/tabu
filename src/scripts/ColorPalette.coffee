# Convert arbitrary string to color in hexadecimal format
#
#
class ColorPalette
	
	instance = null
	@parser
	


	constructor: ()->

		if not instance
			instance = this
		else
			return instance

		@palette = [
			# RED
			{
				r: 244
				g: 67
				b: 54
			}
			# PINK	
			{
				r: 233
				g: 30
				b: 99
			}
			# PURPLE
			{
				r: 156
				g: 39
				b: 176
			}
			# BLUE
			{
				r: 33
				g: 150
				b: 243
			}
			# CYAN
			{
				r: 0
				g: 188
				b: 212
			}
			# TEAL
			{
				r: 0
				g: 150
				b: 136
			}
			# GREEN
			{
				r: 76
				g: 175
				b: 80
			}
			# ORANGE
			{
				r: 255
				g: 152
				b: 0
			}
			# BROWN
			{
				r: 121
				g: 85
				b: 72
			}
			# DEEP ORANGE
			{
				r: 255
				g: 87
				b: 34
			}
			# INDIGO
			{
				r: 63
				g: 81
				b: 181
			}
			# DEEP PURPLE
			{
				r: 103
				g: 58
				b: 183
			}
			# LIGHT GREEN DARKEN 4
			{
				r: 51
				g: 105
				b: 30
			}
		]

		return instance

	# use Euclidian distance to find closest color
	# send in the rgb of the pixel to be substituted
	# http://stackoverflow.com/questions/16087529/limit-canvas-colors-to-a-specific-array

	mapColorToPalette: (hex) ->

		rgb = @hexToRgb(hex)

		color = undefined
		diffR = undefined
		diffG = undefined
		diffB = undefined
		diffDistance = undefined
		mappedColor = undefined
		distance = 25000
		i = 0

		while i < @palette.length

			color = @palette[i]
			diffR = color.r - rgb.r
			diffG = color.g - rgb.g
			diffB = color.b - rgb.b
			diffDistance = diffR * diffR + diffG * diffG + diffB * diffB

			if diffDistance < distance
				distance = diffDistance
				mappedColor = @palette[i]
			i++

		if typeof mappedColor is 'undefined' then mappedColor = @palette[0]
		return mappedColor

	hexToRgb: (hex) ->
		# Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
		shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
		hex = hex.replace(shorthandRegex, (m, r, g, b) ->
			r + r + g + g + b + b
		)
		result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
		if result 
			return {
				r: parseInt(result[1], 16)
				g: parseInt(result[2], 16)
				b: parseInt(result[3], 16) 
			}
		else 
			return null

	rgbToHex: (r, g, b) ->
		return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)

	# Generate hexadecimal color from url
	# Ignores protocols and web prefixeses to create unique color for every address
	#
	# @param [String] the url to be converted
	#
	# @return [String] color hexadecimal format
	#	
	fromUrl: (url)->

		if url instanceof Url
			urlParser = url
		else
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
		rgb = @mapColorToPalette(colour)
		return @rgbToHex(rgb.r, rgb.g, rgb.b)

	# # Works, kind of. Not exactly as it should tho -> the max value affects in funny ways
	# getWithMaxBrightness: (hexCode, max)->

	# 	from = getBrightness(hexCode)

	# 	change = Math.round((max - from) * 100) / 100 

	# 	if change >= 0
	# 		return hexCode
	# 	else
	# 		return setLuminance(hexCode, change)

	# # http://www.webmasterworld.com/forum88/9769.htm
	# getBrightness = (hexCode) ->
	#   # strip off any leading #
	#   hexCode = hexCode.replace('#', '')
	#   c_r = parseInt(hexCode.substr(0, 2), 16)
	#   c_g = parseInt(hexCode.substr(2, 2), 16)
	#   c_b = parseInt(hexCode.substr(4, 2), 16)
	#   brightness = (c_r * 299 + c_g * 587 + c_b * 114) / 1000 / 255
	#   return Math.round(brightness * 100) / 100


	# #https://www.sitepoint.com/javascript-generate-lighter-darker-color/
	# setLuminance = (hexCode, lum) ->
	#   # validate hexCode string
	#   hexCode = String(hexCode).replace(/[^0-9a-f]/gi, '')
	#   if hexCode.length < 6
	#     hexCode = hexCode[0] + hexCode[0] + hexCode[1] + hexCode[1] + hexCode[2] + hexCode[2]
	#   lum = lum or 0
	#   # convert to decimal and change luminosity
	#   rgb = '#'
	#   c = undefined
	#   i = undefined
	#   i = 0
	#   while i < 3
	#     c = parseInt(hexCode.substr(i * 2, 2), 16)
	#     c = Math.round(Math.min(Math.max(0, c + c * lum), 255)).toString(16)
	#     rgb += ('00' + c).substr(c.length)
	#     i++
	#   return rgb

  
