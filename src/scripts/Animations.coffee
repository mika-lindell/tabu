# Controls animations in the UI
#
class Animations
	
	@duration # Duration of animations

	constructor: (duration = 0.3)->
		@duration = duration

	# Plays the intro animation by adding .intro-class to container element.
	# Hence there needs to be CSS working in tandem with this script.	
	#
	# @param [boolean] Shall we skip the animation and just hide the element?
	#
	intro: (instant = false)->

		console.log "Animations: I'll play intro now.", 'Instant?', instant

		container = new HTMLElement('#content-container')

		if not instant
			container.removeClass('outro')
			container.addClass('intro')

		container.css('display', 'block')

		cleanUp = ()->
			container.removeClass('intro')

		if not instant
			setTimeout(cleanUp, @duration * 1000)
		else
			cleanUp()


	# Plays the outro animation by adding .outro-class to´container element.
	# Hence there needs to be CSS working in tandem with this script.	
	#
	# @param [boolean] Shall we skip the animation and just hide the element?
	#
	outro: (instant = false)->

		console.log "Animations: I'll play outro now.", 'Instant?', instant

		container = new HTMLElement('#content-container')

		if not instant
			container.removeClass('intro')
			container.addClass('outro')

		cleanUp = ()->
			container.css('display', 'none')
			container.removeClass('outro')

		if not instant
			setTimeout(cleanUp, @duration * 1000)
		else
			cleanUp()