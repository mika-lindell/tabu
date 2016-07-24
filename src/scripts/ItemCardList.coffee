# Generate list of itemCards from DataGetter
#
class ItemCardList extends HTMLElement

	@container
	@dataGetter
	@baseId
	@editable
	@ghost
	@fragment


	constructor: (container, dataGetter)->
		super('ul')
		@addClass('item-card-list')

		@container = new HTMLElement (container)
		
		@dataGetter = dataGetter
		@baseId = container.replace('#', '')
		@editable = false
		@ghost = null

		@attr('id', "#{ @baseId }-list")

		@container.append @

	update: ()->	
		# Create document fragment for not to cause reflow when appending elements (better performance)
		@fragment = document.createDocumentFragment()

		for item, i in @dataGetter.data

			itemCardId = "#{ @baseId }-#{ i }"

			if item.heading?
				itemCard = new ItemCardHeading(item.heading, @, itemCardId)
			else
				itemCard = new ItemCard(item.title, item.url, @, itemCardId)

			item.itemCard = itemCard
			@fragment.appendChild(itemCard.DOMElement)

		count = @dataGetter.data.length

		# Add some information about the list to DOM as attributes, so we can target with CSS selectors
		if count is 0
			parent = @parent()
			if parent? then parent.attr('data-has-empty-list-as-child', '') # To parent element that it's has empty list as child
		
		@attr('data-list-count', count) # To list the count of children

		@append(@fragment) 

	getItemForElement: (DOMElement)->

		for item, i in @dataGetter.data

			if item.itemCard.DOMElement is DOMElement
				return item.itemCard

		return null

	enableEditing: ->
		
		@editable = true
		root = @

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
			@ghost.css('width', from.width() + 'px')
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
		ev.dataTransfer.dropEffect = "move"

		root.updateGhost(ev)

	dragOver = (ev, root)->
		ev.preventDefault()
		ev.dataTransfer.dropEffect = "move"

		parent = root
		target = root.getItemForElement(ev.target.closest('li'))

		draggedItem = root.getItemForElement(document.getElementById(parent.attr('data-dragged-item')))
		
		if target isnt draggedItem and target? and target.containingList is parent
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
		
		parent = root
		target = new HTMLElement(ev.target.closest('li'))

		parent.removeAttr('data-dragged-item')
		target.removeClass('dragged')
		
		root.ghost.DOMElement.outerHTML = ''
		root.ghost = null
