class Toolbars

	@speedDialContainer
	@topSitesContainer

	@speedDialSelect
	@topSitesSelect

	@storage

	constructor: ()->

		@speedDialContainer = new HTMLElement('#speed-dial')
		@topSitesContainer = new HTMLElement('#top-sites')
		speedDialSelect = new Dropdown('#speed-dial-select')
		topSitesSelect = new Dropdown('#top-sites-select')
		@storage = new Storage

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

	speedDial: (root, instant = false)->

		if instant
			root.speedDialContainer.show()
			root.topSitesContainer.hide()
		else
			root.animateTransition(root.topSitesContainer, root.speedDialContainer)

		root.storage.setView('speedDial')

	topSites: (root, instant = false)->

		if instant
			root.speedDialContainer.hide()
			root.topSitesContainer.show()
		else
			root.animateTransition(root.speedDialContainer, root.topSitesContainer)

		root.storage.setView('topSites')

	animateTransition: (from, to)->
		outro = new Animation(from)
		intro = new Animation(to)

		oldHeight = outro.animate.height()

		outro.done = ()->
			intro.animateHeight(oldHeight)
			intro.intro()

		outro.outro(true)
