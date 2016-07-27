class Dropdown extends HTMLElement

	@dropdown
	@items
	@animation
	@trap
	@active

	constructor: (parentId)->
		super(parentId)

		@dropdown = new HTMLElement('ul')
		@animation = new Animation(@dropdown, 0.2)
		@active = false

		root = @
		body = new HTMLElement('body')
		
		@dropdown.addClass('dropdown-content')
		@dropdown.addClass('layer-dialog')
		@dropdown.css('display', 'none')
		@dropdown.css('min-width', @width() + 'px')

		body.on('click', (ev)->
			root.hide(ev, root)
		)
		body.append(@dropdown)

		@items = new Array()

		@on('click', (ev)->
			root.toggleDropdown(ev, root)
		)

	toggleDropdown: (ev, root = null)->

		if not root? then root = @

		if root.dropdown.css('display') is 'none'
			root.show(ev, root)
		else
			root.hide(ev, root)


	show: (ev, root = null)->
		ev.stopPropagation()

		root.dropdown.css('top', @top() + @height() + 'px')
		root.dropdown.css('left', @left() + 'px')

		root.addClass('active')
		root.animation.fadeIn()
		root.active = true

	hide: (ev, root = null)->
		if root.active
			root.removeClass('active')
			root.animation.fadeOut()
			root.active = false

	addItem: (title, callback)->

		item = new HTMLElement('li')
		link = new HTMLElement('a')

		link.text(title)
		item.append(link)

		item.on('click', ()->
			callback.call()
		)

		@dropdown.append(item)
		@items.push(item)

	addDivider: ()->
		divider = new HTMLElement('li')
		divider.addClass('divider')

		@dropdown.append(divider)
		@items.push(divider)

	addTitle: (title)->
		divider = new HTMLElement('li')
		divider.addClass('title')
		divider.text(title)

		@dropdown.append(divider)
		@items.push(divider)

	# createClickTrap = (root = null)->

	# 	if not root? then root = @

	# 	root.trap = new HTMLElement('div')
	# 	root.trap.addClass('overlay')
	# 	root.addClass('layer-dialog')
		
	# 	root.trap.on('click', ()->
	# 		root.toggleDropdown(root)
	# 	)

	# 	body = new HTMLElement('body')
	# 	body.append(root.trap)

	# removeClickTrap = (root = null)->

	# 	if not root? then root = @

	# 	root.dropdown.removeClass('layer-dialog')
	# 	root.trap.removeFromDOM()
	# 	root.trap = null



		