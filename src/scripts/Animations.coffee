# Controls animations in the UI
#
class Animation
	
	@animate
	@duration # Duration of animations

	constructor: (animate, duration = 0.3)->

		if animate instanceof HTMLElement
			@animate = animate
		else
			@animate = new HTMLElement(animate)

		@duration = duration

		@animate.css('transition', "all #{@duration}s")
		@animate.css('overflow', 'hidden')

	fadeIn: ()->
		console.log "Animation: I'll play fadeIn now."

		root = @
		container = @animate

		container.css('opacity', '0')
		container.css('display', 'block')

		targetHeight = container.height() + 'px'

		container.css('height', '0px')

		play = ()->
			container.css('height', targetHeight)
			container.css('opacity', '1')

		setTimeout(play, 10)

		cleanUp = ()->
			root.done.call()

		setTimeout(cleanUp, @duration * 1000)

	fadeOut: ()->
		console.log "Animation: I'll play fadeOut now."

		root = @
		container = @animate

		container.css('height', '0px')
		container.css('opacity', '0')

		cleanUp = ()->
			container.css('display', 'none')
			container.css('height', 'auto')
			root.done.call()

		setTimeout(cleanUp, @duration * 1000)

	heightFrom: (from)->
		console.log "Animation: I'll play heightFrom now."

		root = @
		container = @animate

		to = container.height()

		container.css('height', from + 'px')

		play = ()->
			container.css('height', to + 'px')

		setTimeout(play, 10)
		

		cleanUp = ()->
			container.css('height', 'auto')
			root.done.call()

		setTimeout(cleanUp, @duration * 1000)

	# Plays the intro animation by adding .intro-class to container element.
	# Hence there needs to be CSS working in tandem with this script.	
	#
	# @param [boolean] Shall we skip the animation and just hide the element?
	#
	intro: (instant = false)->

		console.log "Animation: I'll play intro now.", 'Instant?', instant

		root = @
		container = @animate

		if not instant
			container.removeClass('outro')
			container.addClass('intro')

		container.css('display', 'block')

		cleanUp = ()->
			container.removeClass('intro')
			root.done.call()

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

		console.log "Animation: I'll play outro now.", 'Instant?', instant

		root = @
		container = @animate

		if not instant
			container.removeClass('intro')
			container.addClass('outro')

		cleanUp = ()->
			container.css('display', 'none')
			container.removeClass('outro')
			root.done.call()

		if not instant
			setTimeout(cleanUp, @duration * 1000)
		else
			cleanUp()


	done: ()->