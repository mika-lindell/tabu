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
				r: 229
				g: 115
				b: 115
			}
			# {
			# 	r: 239
			# 	g: 83
			# 	b: 80
			# }
			{
				r: 244
				g: 67
				b: 54
			}
			# PINK
			{
				r: 240
				g: 98
				b: 146
			}
			# {
			# 	r: 236
			# 	g: 64
			# 	b: 122
			# }
			{
				r: 230
				g: 30
				b: 99
			}
			# PURPLE
			{
				r: 186
				g: 104
				b: 200
			}
			# {
			# 	r: 171
			# 	g: 71
			# 	b: 188
			# }
			{
				r: 156
				g: 39
				b: 176
			}
			# DEEP-PURPLE
			{
				r: 149
				g: 117
				b: 205
			}
			# {
			# 	r: 126
			# 	g: 87
			# 	b: 194
			# }
			{
				r: 103
				g: 58
				b: 183
			}
			# INDIGO
			# {
			# 	r: 121
			# 	g: 134
			# 	b: 203
			# }
			# {
			# 	r: 92
			# 	g: 107
			# 	b: 192
			# }
			# {
			# 	r: 63
			# 	g: 81
			# 	b: 181
			# }
			# BLUE
			{
				r: 100
				g: 181
				b: 246
			}
			# {
			# 	r: 66
			# 	g: 165
			# 	b: 245
			# }
			{
				r: 33
				g: 150
				b: 243
			}
			# LIGHT BLUE
			{
				r: 79
				g: 195
				b: 247
			}
			# {
			# 	r: 41
			# 	g: 182
			# 	b: 246
			# }
			{
				r: 3
				g: 169
				b: 244
			}
			# CYAN
			{
				r: 77
				g: 208
				b: 225
			}
			# {
			# 	r: 38
			# 	g: 198
			# 	b: 218
			# }
			{
				r: 0
				g: 188
				b: 212
			}
			# GREEN
			{
				r: 129
				g: 199
				b: 132
			}
			# {
			# 	r: 102
			# 	g: 187
			# 	b: 106
			# }
			{
				r: 76
				g: 175
				b: 80
			}
			# LIGHT GREEN
			{
				r: 156
				g: 204
				b: 101
			}
			# {
			# 	r: 139
			# 	g: 195
			# 	b: 74
			# }
			{
				r: 124
				g: 179
				b: 66
			}
			# LIME

			{
				r: 192
				g: 202
				b: 51
			}
			# {
			# 	r: 175
			# 	g: 180
			# 	b: 43
			# }
			{
				r: 158
				g: 157
				b: 36
			}
			# YELLOW
			{
				r: 251
				g: 192
				b: 45
			}
			# {
			# 	r: 249
			# 	g: 168
			# 	b: 37
			# }
			{
				r: 245
				g: 127
				b: 23
			}
			# AMBER
			{
				r: 255
				g: 193
				b: 7
			}
			# {
			# 	r: 255
			# 	g: 179
			# 	b: 0
			# }
			{
				r: 255
				g: 160
				b: 0
			}

			# ORANGE
			{
				r: 255
				g: 183
				b: 77
			}
			# {
			# 	r: 255
			# 	g: 167
			# 	b: 38
			# }
			{
				r: 255
				g: 152
				b: 0
			}
			# DEEP ORANGE
			{
				r: 255
				g: 138
				b: 101
			}
			# {
			# 	r: 255
			# 	g: 112
			# 	b: 67
			# }
			{
				r: 255
				g: 87
				b: 34
			}
			# BROWN
			{
				r: 161
				g: 136
				b: 127
			}
			# {
			# 	r: 141
			# 	g: 110
			# 	b: 99
			# }
			{
			r: 121
			g: 85
			b: 72
			}
			# GREY & BLACK
			# {
			# r: 33
			# g: 33
			# b: 33
			# }
			# {
			# r: 117
			# g: 117
			# b: 117
			# }
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

  
