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

		@speedDialContainer = new HTMLElement('#speed-dial')
		@topSitesContainer = new HTMLElement('#top-sites')

		@contentContainer = new HTMLElement('#content-container')
		@storage = new Storage

		speedDialSelect = new Dropdown('#speed-dial-select')
		topSitesSelect = new Dropdown('#top-sites-select')

		root = @

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
			if done? then done()
		else
			root.animateTransition(root.topSitesContainer, root.speedDialContainer, root.contentContainer, done)

		root.storage.setView('speedDial')

	topSites: (root, instant = false)->

		if instant
			root.speedDialContainer.hide()
			root.topSitesContainer.show()
		else
			root.animateTransition(root.speedDialContainer, root.topSitesContainer, root.contentContainer)

		root.storage.setView('topSites')

	animateTransition: (from, to, container, done = null)->

		console.log container

		anim = new Animation(container)

		complete = ()->
			from.hide()
			to.show()
			anim.intro()
			if done? then done()

		anim.outro(false, complete)



		# outro = new Animation(from)
		# intro = new Animation(to)

		# rest = new Animation(@secondaryContainer)

		# oldHeight = outro.animate.height()

		# done = ()->
		# 	intro.animateHeight(oldHeight, null, done)
		# 	intro.intro()
		# 	rest.intro()
		
		# outro.outro(false, done)
		# rest.outro()

