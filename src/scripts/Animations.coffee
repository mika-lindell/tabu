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

		# oldOverflow = container.css('overflow')
		# container.css('overflow', 'hidden')

		container.css('opacity', '0')
		container.show()
		targetHeight = container.height() + 'px'
		container.css('height', '0px')

		play = ()->
			
			container.css('height', targetHeight)
			container.css('opacity', '1')

		setTimeout(play, 10)

		cleanUp = ()->
			# container.css('overflow', oldOverflow)
			root.done()

		setTimeout(cleanUp, @duration * 1000)

	fadeOut: ()->
		console.log "Animation: I'll play fadeOut now."

		root = @
		container = @animate

		# oldOverflow = container.css('overflow')
		# container.css('overflow', 'hidden')

		container.css('height', '0px')
		container.css('opacity', '0')

		cleanUp = ()->
			container.hide()
			container.css('height', 'auto')
			# container.css('overflow', oldOverflow)
			root.done()

		setTimeout(cleanUp, @duration * 1000)

	animateHeight: (from, to = null)->

		root = @
		container = @animate

		if not to?
			to = container.height()

		if not from?
			from = container.height()

		container.css('height', from + 'px')

		play = ()->
			console.log "Animation: I'll animate height now.", from, to
			container.css('height', to + 'px')

		setTimeout(play, 0)
		
		cleanUp = ()->
			container.css('height', 'auto')
			root.done()

		setTimeout(cleanUp, @duration * 1000)

	animateWidth: (from, to = null)->
		
		root = @
		container = @animate

		if not to?
			to = container.width()

		if not from?
			from = container.width()

		container.css('width', from + 'px')

		play = ()->
			console.log "Animation: I'll animate width now.", from, to
			container.css('width', to + 'px')

		setTimeout(play, 0)
		
		cleanUp = ()->
			#container.css('width', 'auto')
			root.done()

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

		container.show()

		cleanUp = ()->
			container.removeClass('intro')
			root.done()

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
			container.hide()
			container.removeClass('outro')
			root.done.call()

		if not instant
			setTimeout(cleanUp, @duration * 1000)
		else
			cleanUp()


	done: ()->