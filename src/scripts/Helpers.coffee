# Misc helper functions. Singleton class.
#
#
class Helpers
	
	instance = null

	constructor: ()->
		if not instance then instance = this
		return instance
		
	# Get the operating system this extension is running on
	#
	# @return [String] 
	#
	getOs: ()->

		if (navigator.appVersion.indexOf("Win") isnt -1) then return "Windows"
		if (navigator.appVersion.indexOf("Mac") isnt -1) then return "MacOS"
		if (navigator.appVersion.indexOf("X11") isnt -1) then return "UNIX"
		if (navigator.appVersion.indexOf("Linux") isnt -1) then return "Linux"

	# Get localised version of the title of new tab page.
	#
	# @param [Function] The function to be called when the operation is complete
	#
	#
	getLocalisedTitle: (callback)->
		chrome.tabs.getSelected(null, (tab)-> # null defaults to current window
			console.log tab.title
			if tab.title?
				callback(tab.title)
			else
				callback('New Tab')
		)


