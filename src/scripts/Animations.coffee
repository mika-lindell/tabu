# Controls animations in the UI
#
class Animations
	
	@duration # Duration of animations

	constructor: (duration = 0.3)->
		@duration = duration

	# Plays the intro animation by adding .intro-class to container element.
	# Hence there needs to be CSS working in tandem with this script.	
	#
	intro: (instant = false)->

		console.log "Animations: I'll play intro now.", 'Instant?', instant

		container = new HTMLElement('#content-container')

		if not instant
			container.removeClass('outro')
			container.addClass('intro')

		container.css('display', 'block')


	# Plays the outro animation by adding .outro-class to´container element.
	# Hence there needs to be CSS working in tandem with this script.	
	#
	outro: (instant = false)->

		console.log "Animations: I'll play outro now.", 'Instant?', instant

		container = new HTMLElement('#content-container')

		if not instant
			container.removeClass('intro')
			container.addClass('outro')

		setDisplay = ()->
			container.css('display', 'none')

		if not instant
			setTimeout(setDisplay, @duration * 1000)
		else
			setDisplay()