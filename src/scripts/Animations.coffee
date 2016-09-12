# Controls animations in the UI
#
class Animation
	
	@animate
	@duration # Duration of animations
	@animParams

	constructor: (animate, duration = 0.3)->

		if animate instanceof HTMLElement
			@animate = animate
		else
			@animate = new HTMLElement(animate)

		@duration = duration

		@animParams =
			origTransition: @animate.css('transition')
			origAnimDuration: @animate.css('animationDuration') 
			transition: "all #{@duration}s"
			animDuration: "#{@duration}s"

		@done = null

		return @

	beforeAnimation: (animation = true, transition = true)->
		if animation then @animate.css('animationDuration',  @animParams.animDuration)
		if transition then @animate.css('transition',  @animParams.transition)

	afterAnimation: (animation = true, transition = true)->
		if animation then @animate.css('animationDuration',  @animParams.origAnimDuration)
		if transition then @animate.css('transition',  @animParams.origTransition)

	animationIn: (cssClass, done = null, display = 'block', withOpacity = true)->

		root = @
		container = @animate

		root.beforeAnimation()
		container.addClass(cssClass)

		if display then container.css('display', display)
		if withOpacity then container.css('opacity', '1')

		cleanUp = ()->
			container.removeClass(cssClass)
			root.afterAnimation()
			if done? then done()
			
		setTimeout(cleanUp, @duration * 1000)

	animationOut: (cssClass, done = null, withOpacity = true)->
		root = @
		container = @animate

		root.beforeAnimation()
		if withOpacity then container.css('opacity', '0')
		container.addClass(cssClass)
		
		cleanUp = ()->
			container.css('display', 'none')
			container.removeClass(cssClass)
			root.afterAnimation()
			if done? then done()
			
		setTimeout(cleanUp, @duration * 1000)

	flip: ()->
		@animationIn 'anim-flip', null, false, false

	highlight: ()->
		@animationIn 'anim-highlight', null, false, false

	moveIn: (done = null, display = 'block')->
		@animationIn 'anim-move-in', done, display

	moveOut: (done = null)->
		@animationOut 'anim-move-out', done

	slideIn: (done = null, display = 'block')->
		@animationIn 'anim-slide-in', done, display

	slideOut: (done = null)->
		@animationOut 'anim-slide-out', done


	animateHeight: (from, to = null, done = null)->

		root = @
		container = @animate

		root.beforeAnimation false, true
		container.css('overflow', 'hidden')

		if not to? or to is -1
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
			root.afterAnimation false, true
			if done? then done()
			
		setTimeout(cleanUp, @duration * 1000)

	animateWidth: (from, to = null, done = null)->
		
		root = @
		container = @animate

		root.beforeAnimation false, true

		if not to?
			to = container.width()

		if not from?
			from = container.width()

		container.css('width', from + 'px')

		play = ()->
			container.css('width', to + 'px')

		setTimeout(play, 0)
		
		cleanUp = ()->
			root.afterAnimation false, true
			if done? then done()

		setTimeout(cleanUp, @duration * 1000)

	# Plays the intro animation by adding .intro-class to container element.
	# Hence there needs to be CSS working in tandem with this script.	
	#
	# @param [boolean] Shall we skip the animation and just hide the element?
	#
	intro: (instant = false, done = null)->

		root = @
		container = @animate

		if not instant
			root.beforeAnimation true, false
			container.removeClass('outro')
			container.addClass('intro')

		container.show()

		cleanUp = ()->
			container.removeClass('intro')
			root.afterAnimation true, false
			if done? then done()
			
		if not instant
			setTimeout(cleanUp, @duration * 1000)
		else
			cleanUp()


	# Plays the outro animation by adding .outro-class to´container element.
	# Hence there needs to be CSS working in tandem with this script.	
	#
	# @param [boolean] Shall we skip the animation and just hide the element?
	#
	outro: (instant = false, done = null)->

		root = @
		container = @animate

		if not instant
			root.beforeAnimation true, false
			container.removeClass('intro')
			container.addClass('outro')

		cleanUp = ()->
			container.hide()
			container.removeClass('outro')
			root.afterAnimation true, false
			if done? then done()
			

		if not instant
			setTimeout(cleanUp, @duration * 1000)
		else
			cleanUp()


	done: ()->