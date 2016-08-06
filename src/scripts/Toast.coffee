class Toast

	constructor: (msg, buttonLabel = null, buttonIcon = null, buttonCallback = null,  duration = 5.0)->

		container = new HTMLElement('div')
		body = new HTMLElement('body')
		# animation = new Animation(container)

		container.addClass 'toast'
		container.addClass 'anim-toast-in'
		container.text msg

		if buttonLabel? and buttonCallback?
			button = new HTMLElement('button')
			button.addClass 'btn'
			button.text	buttonLabel

			if buttonIcon?
				console.log  buttonIcon
				icon = new HTMLElement('i')
				icon.addClass 'material-icons'
				icon.addClass 'left'
				icon.text buttonIcon
				button.append icon

			button.on('click', buttonCallback)
			container.append button

		body.append container

		# Outro and cleanup
		setTimeout ()->

			container.removeClass 'anim-toast-in'
			container.addClass 'anim-toast-out'

			setTimeout ()->
				body.removeChild container
			, 500

		, duration * 1000

