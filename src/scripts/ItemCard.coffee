# Creates special list item containing a link.
#
class ItemCard extends HTMLElement

	@oldClientX = 0
	@container

	# Construct new card.
	#
	# @param [String] Title of the card
	# @param [String] Url of the link related to this card
	#
	constructor: (title, url, id = null)->
		super('li')
		@addClass('item-card')
		if id? then @attr('id', id)

		# Enable drag-n-drop
		@attr('draggable', 'true')
		@container = @parent()
		root = @
		@on('dragstart', ()->
			dragStart(event, root)
		)
		@on('dragover', ()->
			dragOver(event, root)
		)
		@on('dragend', ()->
			dragEnd(event, root)
		)

		color = new HexColor(url)
		url = new Url(url)

		link = new HTMLElement('a')
		link.attr('href', url.href)
		link.attr('draggable', 'false')
		
		link.addClass('item-card-link')

		if id? then link.attr('id', id + '-link')

		badge = new HTMLElement('span')
		badge.text(url.withoutPrefix().substring(0, 2) )
		badge.css('borderColor', color.url )
		badge.addClass('item-card-badge')

		labelContainer = new HTMLElement('div')
		labelContainer.addClass('item-card-label-container')

		labelTitle = new HTMLElement('span')
		labelTitle.text(title)
		labelTitle.addClass('item-card-label')

		lineBreak = new HTMLElement('br')

		labelUrl = new HTMLElement('span')
		labelUrl.text(url.hostname)
		labelUrl.addClass('item-card-label-secondary')

		link.append(badge)

		labelContainer.append(labelTitle)
		labelContainer.append(lineBreak)
		labelContainer.append(labelUrl)

		link.append(labelContainer)

		@append(link)

	dragStart = (ev, root)->

		root.parent().attr('data-dragged-item', root.attr('id'))
		root.addClass('dragged')
		
		ev.dataTransfer.setData('text/html', root.html())

		ghost = root.DOMElement.cloneNode(true)

		ev.dataTransfer.setDragImage(ghost, 0, 0)
		ev.dataTransfer.effectAllowed = "move"

	dragOver = (ev, root)->

		ev.preventDefault()
		ev.dataTransfer.dropEffect = "move"

		parent = root.parent()
		target = ev.target.closest('li')

		target.style.cursor = 'move'
		
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
		ev.preventDefault()
		console.log 'Drop'
		root.parent().removeAttr('data-dragged-item')
		root.removeClass('dragged')