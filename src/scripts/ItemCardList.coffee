# Generate list of itemCards from DataGetter
#
class ItemCardList extends HTMLElement

	@dataGetter
	@baseId
	@fragment
	@ghost

	constructor: (dataGetter, baseId = 'card')->
		super('ul')
		@addClass('item-card-list')

		@dataGetter = dataGetter
		@baseId = baseId

		@attr('id', "#{ @baseId }-list")

		@attr('draggable', 'true')
		root = @

		@on('dragover', ()->
			dragOver(event, root)
		)
		@on('dragend', ()->
			dragEnd(event, root)
		)

	update: ()->	
		# Create document fragment for not to cause reflow when appending elements (better performance)
		@fragment = document.createDocumentFragment()

		for item, i in @dataGetter.data

			cardId = "#{ @baseId }-#{ i }"

			if item.heading?
				card = new ItemCardHeading(item.heading, cardId)
			else
				card = new ItemCard(item.title, item.url, cardId)

			@fragment.appendChild(card.DOMElement)


		count = @dataGetter.data.length

		# Add some information about the list to DOM as attributes, so we can target with CSS selectors
		if count is 0
			parent = @parent()
			if parent? then parent.attr('data-has-empty-list-as-child', '') # To parent element that it's has empty list as child
		
		@attr('data-list-count', count) # To list the count of children

		@append(@fragment) 

	updateGhost = (ev, ghost = null)->

		if not ghost?
			ghost = new HTMLElement('#ghost')

		if ghost.DOMElement?
			ghost.css('left', ev.clientX + 20  + 'px')
			ghost.css('top', ev.clientY + 'px')

	dragOver = (ev, root)->

		ev.preventDefault()
		#ev.stopPropagation()

		ev.dataTransfer.effectAllowed = "move"

		updateGhost(ev)

		parent = root
		target = ev.target.closest('li')

		draggedItem = new HTMLElement('#' + parent.attr('data-dragged-item'))
		
		if target isnt draggedItem.DOMElement and target? and target.parentNode is parent.DOMElement
			# Insert as last item if dragging: 
			# - over last child
			
			if target is parent.DOMElement.lastElementChild
				console.log 'DragOver: Append'
				parent.append(draggedItem)
			
			else if target.offsetTop < draggedItem.top() or target.offsetLeft < draggedItem.left()
				# InsertBefore has to be first option for this to work
				# Insert before if dragging:
				# - Up
				# - Left
				console.log 'DragOver: insertBefore'
				parent.insert(draggedItem, target)

			else if target.offsetTop > draggedItem.top() or target.offsetLeft > draggedItem.left()
				# Insert after if dragging:
				# - Down
				# - Right				
				console.log 'DragOver: insertAfter'
				if target.nextSibling
					parent.insert(draggedItem, target, 'after')

	dragEnd = (ev, root)->

		console.log 'Drop'

		ev.preventDefault()
		
		parent = root
		target = new HTMLElement(ev.target.closest('li'))
		ghost = new HTMLElement('#ghost')

		parent.removeAttr('data-dragged-item')
		target.removeClass('dragged')
		
		ghost.DOMElement.outerHTML = ''