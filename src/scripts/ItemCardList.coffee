# Generate list of itemCards from DataGetter
#
class ItemCardList extends HTMLElement

	@items
	@container
	@dataGetter
	@baseId
	@editable
	@userInput
	@ghost

	constructor: (container, dataGetter)->

		super('ul')
		
		@container = new HTMLElement (container)
		@items = new Array()
		
		@dataGetter = dataGetter
		@baseId = container.replace('#', '')
		@editable = false
		@ghost = null

		root = @

		@addClass('item-card-list')
		@attr('id', "#{ @baseId }-list")

		@userInput = new UserInput('user-input-add-new', 'Add Link')
		@userInput.addField('title', 'text', 'Title')
		@userInput.addField('url', 'text', 'Web Address')
		@userInput.addOkCancel('Add Link')

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

		item.element = new ItemCardHeading(@, title)

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
			item.element = new ItemCard(@)
		else
			item.element = new ItemCard(@, title, url)

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
			@items.splice(index, 1)
			root.removeChild(item.element)
			#item.element.addClass('anim-remove-item')

			# setTimeout(()->
			# 	root.removeChild(item.element)
			# 	item = null
			# 	if done? then done()
			# , 200)

	getIndex: (item)->
		return @items.indexOf(item)

	getItemForElement: (DOMElement)->

		for item, i in @items

			if item.element.DOMElement is DOMElement
				return item.element

		return null

	addItemByUserInput: (root)->

		if not root.userInput.active

			empty = root.addItem(null, null, 'first')
			empty.element.addClass('empty')
			empty.element.attr('draggable', 'false')
			empty.element.append(root.userInput)

			root.userInput.done = (fields)->
				empty.element.setTitle(fields[0].value)
				empty.element.setUrl(fields[1].value)
				empty.element.removeClass('empty')
				empty.element.attr('draggable', 'true')
				root.userInput.hide()

			root.userInput.abort = ()->
				
				root.removeItem(empty, ()->
					root.userInput.hide()
				)

			root.userInput.show()



	enableEditing: ->
		
		@editable = true
		root = @

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

		@on('dragend', ()->
			dragEnd(event, root)
		)

		# So that the DnD ghost is updated outside the containing element
		body = new HTMLElement('body')
		body.on('dragover', @updateGhost)

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
			@updateGhost(ev, @ghost)
			@append(@ghost)

	updateGhost: (ev, ghost = null)->

		if not ghost?
			ghost = new HTMLElement('#ghost')

		if ghost.DOMElement?
			ghost.css('left', ev.clientX + 20  + 'px')
			ghost.css('top', ev.clientY + 'px')

	dragOverUpdateCursor = (ev, root)->

		ev.preventDefault()
		ev.stopPropagation()
		
		ev.dataTransfer.dropEffect = "move"

		root.updateGhost(ev)

	dragOver = (ev, root)->

		ev.preventDefault()
		ev.stopPropagation()

		ev.dataTransfer.dropEffect = "move"

		parent = root
		target = root.getItemForElement(ev.target.closest('li'))

		draggedItem = root.getItemForElement(document.getElementById(parent.attr('data-dragged-item')))
		
		if target isnt draggedItem and target? and target.containingList is parent and draggedItem?
			# Insert as last item if dragging: 
			# - over last child
			
			if target.DOMElement is parent.DOMElement.lastElementChild
				console.log 'DragOver: Append'
				parent.append(draggedItem)
			
			else if target.top() < draggedItem.top() or target.left() < draggedItem.left()
				# InsertBefore has to be first option for this to work
				# Insert before if dragging:
				# - Up
				# - Left
				console.log 'DragOver: insertBefore'
				parent.insert(draggedItem, target)

			else if target.top() > draggedItem.top() or target.left() > draggedItem.left()
				# Insert after if dragging:
				# - Down
				# - Right				
				console.log 'DragOver: insertAfter'
				if target.DOMElement.nextSibling
					parent.insert(draggedItem, target, 'after')

	dragEnd = (ev, root)->

		console.log 'Drop'

		ev.preventDefault()
		ev.stopPropagation()
		
		parent = root
		target = new HTMLElement(ev.target.closest('li'))

		parent.removeAttr('data-dragged-item')
		target.removeClass('dragged')
		
		root.ghost.DOMElement.outerHTML = ''
		root.ghost = null
