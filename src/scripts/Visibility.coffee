# Controls visibility of an element through Animations-class.
# The function which hides/unhides the content when user presses button
#
class Visibility

	@controller # References to button controlling functionality of this class.
	@enabler
	@disabler
	@enabled # Current status of the visibility mode: true or false?
	@animation # Holds reference to class, which controls animations.
	@storage # Holds refrence to storage interface this class will be using.	

	@executing # Whether or not we are running operation at the moment

	# Is executed when new class instance is created.
	#
	# @param [boolean] Sets whether all elements are visible or hidden at after this class has been initialized
	#
	constructor: (controller = '#visibility-toggle', enabler = '#visibility-on', disabler = '#visibility-off')->

		root = @ # For the class to be accessible beyond this scope (and in the eventListener)

		@controller = new HTMLElement(controller)
		@enabler = new HTMLElement(enabler)
		@disabler = new HTMLElement(disabler)
	
		@animation = 
			content: new Animation('#content-container')
			button: new Animation(@controller)

		@storage = new Storage

		@executing = false

		getSavedStatus = (data)->

			if data.settingVisible? # if not undefined or null

				# Get the saved status - should we display elements?
				setting = data.settingVisible

				# Enable the intro animation to start or hide elements (without animations)!
				if setting

					root.enable(true, true)

				else

					root.disable(true, true)
					
			else

				root.enable() # If no data is found, default to true.

		@storage.getVisible(getSavedStatus) 

		# Toggles container element status between visible/hidden
		# This function needs to be here for the sake of scope in eventListener below
		#
		toggleStatus = ()->

			if root.enabled
				root.disable()
			else
				root.enable()

		@controller.on('click', toggleStatus)

	# Makes container element visible via Animations-class.
	#
	# @param [boolean] Shall we skip the animation and just hide the element?
	#
	enable: (instantIntro = false, instantButton = false)->

		root = @

		if @executing then return
		@executing = true

		done = ()->
			root.executing = false

		@animation.content.intro(instantIntro, done)

		# @enabler.css('opacity', 0)
		# @disabler.css('opacity', 1)
		# @animation.button.animateWidth(40, 130)

		if not instantButton then @animation.button.flip()
		@enabler.hide()
		@disabler.show('inline-block')
		@enabled = true

		console.log "Visibility: On"
		@storage.setVisible(@enabled)

	# Hides container element via Animations-class.
	#
	# @param [boolean] Shall we skip the animation and just hide the element?
	#
	disable: (instantOutro = false, instantButton = false)->

		root = @

		if @executing then return
		@executing = true

		done = ()->
			root.executing = false

		@animation.content.outro(instantOutro, done)

		# @enabler.css('opacity', 1)
		# @disabler.css('opacity', 0)
		# @animation.button.animateWidth(110, 40)

		if not instantButton then @animation.button.flip()
		@enabler.show('inline-block')
		@disabler.hide()
		@enabled = false

		console.log "Visibility: Off"
		@storage.setVisible(@enabled)

		

