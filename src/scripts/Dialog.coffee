class Dialog extends HTMLElement

	@elements
	@buttons
	@body
	@animation
	@done

	constructor: ()->

		super('div')

		root = @

		@elements =
			overlay: new HTMLElement('div')
			cardContainer: new HTMLElement('div')
			cardContentContainer: new HTMLElement('div')
			cardContentTitle: new HTMLElement('span')
			cardContent: new HTMLElement('div')
			cardContentAction: new HTMLElement('div')

		@buttons = new Array()

		@body = new HTMLElement('body')
		@animation = new Animation(@elements.cardContainer)
		@done = null

		@addClass 'dialog-container'
		@elements.overlay.addClass 'dialog-overlay'
		@elements.cardContainer.addClass 'card'
		@elements.cardContainer.addClass 'dialog'
		@elements.cardContentContainer.addClass 'card-content'
		@elements.cardContentTitle.addClass 'card-title'
		@elements.cardContentAction.addClass 'card-action'

		@elements.overlay.on('click', ()->
			root.hideDialog()
		)

		@elements.cardContainer.append @elements.cardContentContainer
		@elements.cardContentContainer.append @elements.cardContentTitle
		@elements.cardContentContainer.append @elements.cardContent
		@elements.cardContainer.append @elements.cardContentAction

		@append @elements.overlay
		@append @elements.cardContainer

		@body.append @

		return @

	bindTo: (element)->
		root = @
		element.on('click', ()->
			root.showDialog()
		)

	setTitle: (title)->
		@elements.cardContentTitle.text(title)

	setContent: (content)->
		@elements.cardContent.html(content)

	addButton: (label, callback)->
		button = new HTMLElement('button')
		button.text label
		button.addClass 'btn'
		button.on('click', callback)

		@elements.cardContentAction.append button
		@buttons.push(button)

		return button

	loadContent: (template)->

		root = @

		xhttp = new XMLHttpRequest()

		xhttp.onreadystatechange = (response)->

			if (xhttp.readyState is 4 && xhttp.status is 200)
				root.elements.cardContent.html(xhttp.response)
				if root.done? then root.done()
				
		xhttp.open("GET", "/partials/_#{template}.html", true);
		xhttp.send();

	showDialog: ()->

		root = @

		root.show('flex')

		@animation.done = null
		@animation.moveIn()

		setTimeout(()->
			root.css('opacity', '1')
		, 0)

	hideDialog: ()->

		root = @

		@animation.done = ()->
			root.hide()

		root.css('opacity', '0')

		@animation.moveOut()