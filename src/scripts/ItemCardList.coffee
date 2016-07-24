# Generate list of itemCards from DataGetter
#
class ItemCardList extends HTMLElement

	@dataGetter
	@baseId
	@draggable
	@ghost
	@fragment


	constructor: (dataGetter, baseId = 'card')->
		super('ul')
		@addClass('item-card-list')

		@dataGetter = dataGetter
		@baseId = baseId
		@draggable = false
		@ghost = null

		@attr('id', "#{ @baseId }-list")

	update: ()->	
		# Create document fragment for not to cause reflow when appending elements (better performance)
		@fragment = document.createDocumentFragment()

		for item, i in @dataGetter.data

			cardId = "#{ @baseId }-#{ i }"

			if item.heading?
				card = new ItemCardHeading(item.heading, @, cardId)
			else
				card = new ItemCard(item.title, item.url, @, cardId)

			item.card = card
			@fragment.appendChild(card.DOMElement)

		console.log @dataGetter.data


		count = @dataGetter.data.length

		# Add some information about the list to DOM as attributes, so we can target with CSS selectors
		if count is 0
			parent = @parent()
			if parent? then parent.attr('data-has-empty-list-as-child', '') # To parent element that it's has empty list as child
		
		@attr('data-list-count', count) # To list the count of children

		@append(@fragment) 

	getItemForDOMElement: (DOMElement)->

		for item, i in @dataGetter.data

			if item.card.DOMElement is DOMElement
				return item.card

		return null

	enableDragDrop: ->
		
		@draggable = true
		root = @

		@attr('data-list-draggable', '')

		@on('dragover', ()->
			dragOver(event, root)
		)
		@on('dragend', ()->
			dragEnd(event, root)
		)

		# So that the DnD ghost is updated outside the containing element
		body = new HTMLElement('body')
		body.on('dragover', @updateGhost)

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

	dragOver = (ev, root)->

		ev.preventDefault()
		#ev.stopPropagation()

		ev.dataTransfer.effectAllowed = "move"

		root.updateGhost(ev)

		parent = root
		target = root.getItemForDOMElement(ev.target.closest('li'))

		draggedItem = root.getItemForDOMElement(document.getElementById(parent.attr('data-dragged-item')))
		
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