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
		@animate.css('animationDuration',  "#{@duration}s")

		return @

	slideIn: ()->

		root = @
		container = @animate

		container.addClass('anim-slide-in')
		container.show()
		container.css('opacity', '1')

		cleanUp = ()->
			container.removeClass('anim-slide-in')
			root.done()

		setTimeout(cleanUp, @duration * 1000)

	slideOut: ()->

		root = @
		container = @animate

		container.css('opacity', '0')
		container.addClass('anim-slide-out')
		
		cleanUp = ()->
			container.hide()
			container.removeClass('anim-slide-out')
			root.done()

		setTimeout(cleanUp, @duration * 1000)

	animateHeight: (from, to = null)->

		root = @
		container = @animate

		container.css('overflow', 'hidden')

		if not to?
			to = container.height()

		if not from?
			from = container.height()

		container.css('height', from + 15 + 'px') # this 15px is just arbitraty number - need to understand why and fix it!

		play = ()->
			container.css('height', to + 'px')

		setTimeout(play, 10)
		
		cleanUp = ()->
			container.css('overflow', 'visible')
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
			container.css('width', to + 'px')

		setTimeout(play, 0)
		
		cleanUp = ()->
			root.done()

		setTimeout(cleanUp, @duration * 1000)

	# Plays the intro animation by adding .intro-class to container element.
	# Hence there needs to be CSS working in tandem with this script.	
	#
	# @param [boolean] Shall we skip the animation and just hide the element?
	#
	intro: (instant = false)->

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