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

		color = new HexColor(url)
		url = new Url(url)

		link = new HTMLElement('a')
		link.attr('href', url.href)
		
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
		
		ev.dataTransfer.setData('text/html', root.html())
		#ev.dataTransfer.setData("text", root.html())
		#ev.dataTransfer.setDragImage(root.html(), 0, 0)
		ev.dataTransfer.effectAllowed = "move"

	dragOver = (ev, root)->
		ev.dataTransfer.dropEffect = "move"

		

		parent = root.parent()
		target = ev.target.closest('li')
		
		draggedItem = new HTMLElement('#' + parent.attr('data-dragged-item'))
		
		if target isnt draggedItem.DOMElement and target? and target.parentNode is parent.DOMElement
			# Insert as last item if dragging: 
			# - over last child
			
			if target is parent.DOMElement.lastElementChild
				console.log 'Append'
				parent.append(draggedItem)

			
			else if target.offsetTop < draggedItem.top() or target.offsetLeft < draggedItem.left()
				# InsertBefore has to be first for this to work
				# Insert before if dragging:
				# - Up
				# - Left
				console.log 'insertBefore'
				parent.insert(draggedItem, target)

			
			else if target.offsetTop > draggedItem.top() or target.offsetLeft > draggedItem.left()
				# Insert after if dragging:
				# - Down
				# - Right				
				console.log 'insertAfter'
				if target.nextSibling
					parent.insert(draggedItem, target, 'after')


		# parent = root.parent()

		# draggedItem = new HTMLElement('#' + parent.attr('data-dragged-item'))
		
		# if draggedItem?
	 #  	# If this list is horizontal, some special rules are needed to make dragging feel intuitive
		# 	if root.css('display') is 'inline-block'
		# 		# If we are moving left, move the dragger item before the item mouse is over
		# 		if ev.clientX < root.oldClientX
		# 			if ev.target # Are we actually over an element?
		# 				parent.insert draggedItem, ev.target.closest('li')
		# 		# If we are moving left, move the dragger item before the item mouse is over
		# 		else if ev.clientX > root.oldClientX
		# 			if ev.target.nextSibling # Are we actually over an element?
		# 				parent.insert draggedItem, ev.target.nextSibling.closest('li')
		# 	else # This list doesn't have horizontal layout, so we can just insert before all night long
		# 		parent.insert draggedItem, ev.target.closest('li')

	 #  root.oldClientX = ev.clientX
	 #  ev.preventDefault()
	  return