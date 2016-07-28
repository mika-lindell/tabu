# Controls the loader overlay, which displays the loading progress
#
class Loader

	@element # The container for the loader
	@duration # Animation duration seconds

	constructor: (elementId = '#loader', duration = 0.3)->
		@duration = duration
		@element = new HTMLElement (elementId)
		@element.css("transition", "opacity #{@duration}s")

	# Hide the loader with animation
	# TODO: Move this to animations -class
	#
	hide: ()->
		root = @
		@element.css('opacity', '0')

		setDisplay = ()->
			root.element.hide()

		# Use timeout so the transition has time to finish before hiding the element
		setTimeout(setDisplay, @duration * 1000)


