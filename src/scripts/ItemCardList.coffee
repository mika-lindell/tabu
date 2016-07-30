# Generate list of itemCards from DataGetter
#
class ItemCardList extends HTMLElement

	@items
	@container
	@dataGetter
	@baseId
	@editable
	@userInput
	@draggedItem
	@ghost

	constructor: (container, dataGetter)->

		super('ul')
		
		@container = new HTMLElement (container)
		@items = new Array()
		
		@dataGetter = dataGetter
		@baseId = container.replace('#', '')
		@editable = false
		@ghost = null
		@userInput = null

		root = @

		@addClass('item-card-list')
		@attr('id', "#{ @baseId }-list")

	create: ()->

		for item, i in @dataGetter.data

			if item.heading?
				@addHeading(item.heading)
			else
				@addItem(item.title, item.url)

		count = @dataGetter.data.length

		# Add some information about the list to DOM as attributes, so we can target with CSS selectors
		if count is 0
			parent = @parent()
			if parent? then parent.attr('data-has-empty-list-as-child', '') # To parent element that it's has empty list as child
		
		@attr('data-list-count', count) # To list the count of children

		@container.append @ 

	addHeading: (title, position = 'last')->

		item = 
			element: null
			type: 'heading'

		item.element = new ItemCardHeading(@, item, title)

		if position is 'last'
			@items.push item
			@append item.element
		else
			@items.unshift item
			@prepend item.element

	addItem: (title = null, url = null, position = 'last')->

		item = 
			element: null
			type: 'link'

		if not title? or not url?
			item.element = new ItemCard(@, item)
		else
			item.element = new ItemCard(@, item, title, url)

		if position is 'last'
			@items.push item
			@append item.element
		else
			@items.unshift item
			@prepend item.element

		return item

	removeItem: (item, done = null)->

		root = @
		index = @getIndex(item)

		if index isnt -1
			root.removeChild(item.element)
			@items.splice(index, 1)

	getIndex: (item)->
		return @items.indexOf(item)

	getItemForElement: (DOMElement)->

		for item, i in @items

			if item.element.DOMElement is DOMElement
				return item

		return null

	enableEditing: ->
		
		@editable = true
		root = @

		@userInput = new UserInput('user-input-add-new', 'Add Link')
		@userInput.addField('title', 'text', 'Title')
		@userInput.addField('url', 'text', 'Web Address')
		@userInput.addOkCancel('Add Link')

		new HTMLElement('#menu-add-link').on('click', (ev)-> 
			root.addItemByUserInput(root)
		)

		@attr('data-list-editable', '')

		# This will update the cursor during DragOver, as throttlig this operation would cause flicker
		@on('dragover', ()->
			dragOverUpdateCursor(event, root)
		)
		# Human hand-eye-coordination only need things to be updated at ~ 100ms interval for the action to feel responsive
		# Hence throttle execution of this event handler to save resources
		@on('dragover', new Throttle(()->
			dragOver(event, root)
		, 80))

		@on('drop', ()->
			drop(event, root)
		)

		@on('dragend', ()->
			dragEnd(event, root)
		)

		# So that the DnD ghost is updated outside the containing element
		body = new HTMLElement('body')

		body.on('dragover', (ev)->
			ev.preventDefault()
			ev.dataTransfer.dropEffect = "move"

			if ev.dataTransfer.types.indexOf('text') isnt -1 or ev.dataTransfer.types.indexOf('text/uri-list') isnt -1
				root.removeItem(root.draggedItem)
				root.draggedItem = null				
			else
				root.updateGhost(ev, root)


		)

		# body.on('dragend', ()->
		# 	root.dragEnd(event, root)
		# )

	addItemByUserInput: (root)->

		#if not root.userInput.active

		empty = root.addItem(null, null, 'first')

		root.showUserInputForItem(empty)

	showUserInputForItem: (item, title = null, url = null)->

		root = @

		if title? then @userInput.fields[0].element.value(title)
		if url? then @userInput.fields[1].element.value(url)

		item.element.append(@userInput)
		
		item.element.addClass('empty')
		item.element.removeClass('dragged')
		item.element.attr('draggable', 'false')		

		@userInput.done = (fields)->
			item.element.setTitle(fields[0].element.value())
			item.element.setUrl(fields[1].element.value())
			item.element.removeClass('empty')
			item.element.attr('draggable', 'true')
			item.element.addClass('anim-highlight')

			setTimeout(()->
				item.element.removeClass('anim-highlight')
			, 2000)

			root.userInput.hide()

		root.userInput.abort = ()->
			root.userInput.hide()
			root.removeItem(item)

		root.userInput.show()

	setOrientation: (orientation = 'horizontal')->

		if orientation is 'horizontal'
			@container.addClass('horizontal-list')
		else
			@container.removeClass('horizontal-list')


	createGhost: (ev, from)->

		if from?
			@ghost = from.clone()
			@ghost.attr('id', 'ghost')
			@ghost.css('position', 'fixed')
			@ghost.css('width', from.width('px'))
			@updateGhost(ev, null, @ghost)
			@append(@ghost)

	updateGhost: (ev, root = null, ghost = null)->

		if not ghost?
			ghost = new HTMLElement('#ghost')

		if ghost.DOMElement?
			ghost.css('left', ev.clientX + 20  + 'px')
			ghost.css('top', ev.clientY + 'px')

	dragOverUpdateCursor = (ev, root)->

		ev.preventDefault()
		ev.stopPropagation()

		ev.dataTransfer.dropEffect = "copyLink"

		root.updateGhost(ev)

	dragOver = (ev, root)->

		ev.preventDefault()

		parent = root
		target = root.getItemForElement(ev.target.closest('li'))

		if not root.draggedItem?
			if ev.dataTransfer.types.indexOf('text') isnt -1 or ev.dataTransfer.types.indexOf('text/uri-list') isnt -1
				item = root.addItem('Add Link', 'New')
				root.draggedItem = item
				root.draggedItem.element.addClass('dragged')
				root.draggedItem.element.addClass('empty')

		if target? then target = target.element

		if target isnt root.draggedItem.element and target? and target.containingList is parent and root.draggedItem?
			
			# Insert as last item if dragging: 
			# - over last child
			if target.DOMElement is parent.DOMElement.lastElementChild
				console.log 'DragOver: Append'
				parent.append(root.draggedItem.element)
			
			else if target.top() < root.draggedItem.element.top() or target.left() < root.draggedItem.element.left()
				# InsertBefore has to be first option for this to work
				# Insert before if dragging:
				# - Up
				# - Left
				console.log 'DragOver: insertBefore'
				parent.insert(root.draggedItem.element, target)

			else if target.top() > root.draggedItem.element.top() or target.left() > root.draggedItem.element.left()
				# Insert after if dragging:
				# - Down
				# - Right				
				console.log 'DragOver: insertAfter'
				if target.DOMElement.nextSibling
					parent.insert(root.draggedItem.element, target, 'after')

	drop = (ev, root)->

		ev.preventDefault()
		ev.stopPropagation()

		title = ev.dataTransfer.getData('text')
		url = ev.dataTransfer.getData('text/uri-list')

		if title is '' then title = null
		if url is '' then url = null
		if url? then title = null

		if title? or url?
			root.showUserInputForItem(root.draggedItem, title, url)

		root.draggedItem = null

		console.log  'Drop', title, url


	dragEnd = (ev, root)->

		console.log 'DragEnd'

		ev.preventDefault()
		#ev.stopPropagation()
		
		target = new HTMLElement(ev.target.closest('li'))

		root.removeAttr('data-dragged-item')
		target.removeClass('dragged')
		
		root.ghost.removeFromDOM()
		root.ghost = null

		root.draggedItem = null
