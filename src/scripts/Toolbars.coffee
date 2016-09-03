class Toolbars

	@speedDialContainer
	@topSitesContainer
	@contentContainer

	@speedDialSelect
	@topSitesSelect

	@storage

	instance = null

	constructor: ()->
		# Make this a singleton
		if not instance
			instance = this
		else
			return instance

		@shenanigans()

		@speedDialContainer = new HTMLElement('#speed-dial')
		@topSitesContainer = new HTMLElement('#top-sites')

		@contentContainer = new HTMLElement('#content-container')
		@storage = new Storage

		speedDialSelect = new Dropdown('#speed-dial-select')
		topSitesSelect = new Dropdown('#top-sites-select')

		root = @

		@setMode()

		speedDialSelect.addItem('Switch to Top Sites', 'menu-top-sites',()-> 
			root.topSites(root)
		, 'compare_arrows')

		speedDialSelect.addDivider()

		speedDialSelect.addItem('Add Link', 'menu-add-link', ()-> 
			return false
		, 'add', 'a')

		topSitesSelect.addItem('Switch to Speed Dial', 'menu-speed-dial', ()-> 
			root.speedDial(root)
		, 'compare_arrows')


		getSavedStatus = (data)->

			if data.settingView?

				if data.settingView is 'speedDial'
					root.speedDial(root, true)
				else
					root.topSites(root, true)

			else
				# Default to Top Sites
				root.topSites(root, true)

		@storage.getView(getSavedStatus) 

	speedDial: (root, instant = false, done = null)->

		if instant
			root.speedDialContainer.show()
			root.topSitesContainer.hide()
			root.setMode('speedDial')
			if typeof done is 'function' then done()
		else
			root.animateTransition(root.topSitesContainer, root.speedDialContainer, root.contentContainer, ()->
				root.setMode('speedDial')
				if typeof done is 'function' then done()
			)

		root.storage.setView('speedDial')

	topSites: (root, instant = false)->

		if instant
			root.speedDialContainer.hide()
			root.topSitesContainer.show()
			root.setMode('topSites')
		else
			root.animateTransition(root.speedDialContainer, root.topSitesContainer, root.contentContainer, ()->
				root.setMode('topSites')
			)

		root.storage.setView('topSites')

	animateTransition: (from, to, container, done = null)->

		console.log container

		anim = new Animation(container)

		complete = ()->
			from.hide()
			to.show()
			anim.intro()
			if typeof done is 'function' then done()

		anim.outro(false, complete)


	setMode: (mode = 'topSites')->
		@contentContainer.attr('data-mode', mode)

	shenanigans: ()->

		egg = new HTMLElement('#easter-egg')

		if not egg.DOMElement? then return

		currentStep = 0

		steps = [
			'anim-egg-rectangle'
			'anim-egg-flip'
			'anim-egg-rotate'
			'anim-egg-reset'
		]

		egg.on('click', ()->

			# Remove previously inserted class
			if typeof steps[currentStep-1] isnt 'undefined' then egg.removeClass(steps[currentStep-1])			
			# If we have started from beginning, remove the class that's last in the array if necessary.
			if currentStep is 0 then egg.removeClass(steps[steps.length-1])

			console.log steps[currentStep], steps[steps.length-1]

			egg.addClass(steps[currentStep])

			currentStep++
			currentStep = currentStep % steps.length
		)