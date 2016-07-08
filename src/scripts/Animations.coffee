# Controls animations in the UI
#
class Animations
	
	@duration # Duration of animations

	constructor: (duration = 0.3)->
		@duration = duration

	# Plays the intro animation by adding .intro-class to container element.
	# Hence there needs to be CSS working in tandem with this script.	
	#
	intro: ()->
		container = new HTMLElement('#content-container')
		container.removeClass('outro')
		container.addClass('intro')
		container.css('display', 'block')

	# Plays the outro animation by adding .outro-class to´container element.
	# Hence there needs to be CSS working in tandem with this script.	
	#
	outro: ()->
		container = new HTMLElement('#content-container')
		container.removeClass('intro')
		container.addClass('outro')

		setDisplay = ()->
			container.css('display', 'none')

		setTimeout(setDisplay, @duration * 1000)