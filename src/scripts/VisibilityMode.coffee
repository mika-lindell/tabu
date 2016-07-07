class Visibility

	@controllers # References to button controlling functionality in this class
	@enabled # Current status of the visibility mode: true or false?

	constructor: (enable = true)->

		root = @ # For the class to be accessible beyond this scope (and in the eventListener)

		@controllers = 
			enabler: new HTMLElement('#visibility-on')
			disabler: new HTMLElement('#visibility-off')

		@container = new HTMLElement('#content-container')
	
		@enabled = enable

		# This function needs to be here for the sake of scope in eventListener below
		toggleStatus = ()->

			if root.enabled
				root.disable()
			else
				root.enable()

		@controllers.enabler.on('click', toggleStatus)
		@controllers.disabler.on('click', toggleStatus)

	enable: ()->

		@container.css('display', 'block')

		@controllers.enabler.css('display', 'none')
		@controllers.disabler.css('display', 'block')

		@enabled = true
		console.log "Visibility: On"

	disable: ()->

		@container.css('display', 'none')

		@controllers.enabler.css('display', 'block')
		@controllers.disabler.css('display', 'none')

		@enabled = false
		console.log "Visibility: Off"

