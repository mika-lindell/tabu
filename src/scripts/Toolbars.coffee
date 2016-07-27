class Toolbars

	@recommendedContainer
	@customContainer

	@recommendedButton
	@customButton
	@addButton

	constructor: ()->

		@recommendedContainer = new HTMLElement('#top-sites-recommended')
		@customContainer = new HTMLElement('#top-sites-custom')

		@recommendedButton = new HTMLElement('#show-top-sites-recommended')
		@customButton = new HTMLElement('#show-top-sites-custom')
		@addButton = new HTMLElement('#add-new')

		root = @

		@customButton.on('click', ()->
			root.showMyPicks(root)
		)

		@recommendedButton.on('click', ()->
			root.showRecommended(root)
		)

	showMyPicks: (root)->
		root.animateTransition(root.recommendedContainer, root.customContainer)

	showRecommended: (root)->
		root.animateTransition(root.customContainer, root.recommendedContainer)

	animateTransition: (from, to)->
		outro = new Animation(from)
		intro = new Animation(to)

		oldHeight = outro.animate.height()

		outro.done = ()->
			intro.heightFrom(oldHeight)
			intro.intro()

		outro.outro(true)
