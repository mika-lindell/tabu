class Animations
	
	@duration # Duration of animations

	constructor: (duration = 0.3)->
		@duration = duration

	intro: ()->
		container = new HTMLElement('#content-container')
		container.removeClass('outro')
		container.addClass('intro')
		container.css('display', 'block')

	outro: ()->

		container = new HTMLElement('#content-container')
		container.removeClass('intro')
		container.addClass('outro')

		setDisplay = ()->
			container.css('display', 'none')

		setTimeout(setDisplay, @duration * 1000)