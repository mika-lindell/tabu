class Toolbars

	@speedDialContainer
	@topSitesContainer

	@speedDialSelect
	@topSitesSelect


	constructor: ()->

		@speedDialContainer = new HTMLElement('#speed-dial')
		@topSitesContainer = new HTMLElement('#top-sites')

		root = @

		speedDialSelect = new Dropdown('#speed-dial-select')
		topSitesSelect = new Dropdown('#top-sites-select')
		
		topSitesSelect.addItem('Switch to Speed Dial', ()-> 
			root.speedDial(root)
		, 'compare_arrows')

		speedDialSelect.addItem('Add Link', ()-> 
			console.log 'Add'
		, 'add')

		speedDialSelect.addDivider()

		speedDialSelect.addItem('Switch to Top Sites', ()-> 
			root.topSites(root)
		, 'compare_arrows')




		# @customButton.on('click', ()->
		# 	root.showMyPicks(root)
		# )

		# @recommendedButton.on('click', ()->
		# 	root.showRecommended(root)
		# )

	speedDial: (root)->
		root.animateTransition(root.topSitesContainer, root.speedDialContainer)

	topSites: (root)->
		root.animateTransition(root.speedDialContainer, root.topSitesContainer)

	animateTransition: (from, to)->
		outro = new Animation(from)
		intro = new Animation(to)

		oldHeight = outro.animate.height() + 20 

		outro.done = ()->
			intro.heightFrom(oldHeight)
			intro.intro()

		outro.outro(true)
