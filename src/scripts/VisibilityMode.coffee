class Visibility

	@controllers # References to button controlling functionality in this class
	@enabled # Current status of the visibility mode: true or false?
	@animations # Holds reference to class, which controls animations

	constructor: (enable = true)->

		root = @ # For the class to be accessible beyond this scope (and in the eventListener)

		@controllers = 
			enabler: new HTMLElement('#visibility-on')
			disabler: new HTMLElement('#visibility-off')
	
		@enabled = enable

		@animations = new Animations

		# This function needs to be here for the sake of scope in eventListener below
		toggleStatus = ()->

			if root.enabled
				root.disable()
			else
				root.enable()

		@controllers.enabler.on('click', toggleStatus)
		@controllers.disabler.on('click', toggleStatus)

	enable: ()->

		@animations.intro()

		@controllers.enabler.css('display', 'none')
		@controllers.disabler.css('display', 'block')

		@enabled = true
		console.log "Visibility: On"

	disable: ()->

		root = @

		@animations.outro()

		@controllers.enabler.css('display', 'block')
		@controllers.disabler.css('display', 'none')

		@enabled = false
		console.log "Visibility: Off"

