# Creates special list item containing a link.
#
class ItemCard extends HTMLElement

	@containingList

	# Construct new card.
	#
	# @param [String] Title of the card
	# @param [String] Url of the link related to this card
	
	constructor: (title, url, containingList ,id = null)->
		super('li')
		@addClass('item-card')
		if id? then @attr('id', id)

		color = new HexColor(url)
		url = new Url(url)
		root = @
		@containingList = containingList

		if @containingList.draggable
			# Enable drag-n-drop
			@attr('draggable', 'true')
			
			@on('dragstart', ()->
				dragStart(event, root)
			)

		link = new HTMLElement('a')
		link.attr('href', url.href)
		# Disable DnD for links to remove its default DnD behavior
		link.attr('draggable', 'false') 
		
		link.addClass('item-card-link')

		if id? then link.attr('id', id + '-link')

		dragHandle = new HTMLElement('i')
		dragHandle.text('more_vertmore_vert')
		dragHandle.addClass('drag-handle')

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

		link.append(dragHandle)
		link.append(badge)

		labelContainer.append(labelTitle)
		labelContainer.append(lineBreak)
		labelContainer.append(labelUrl)

		link.append(labelContainer)

		@append(link)


	dragStart = (ev, root)->

		ev.dataTransfer.effectAllowed = "move"

		root.containingList.attr('data-dragged-item', root.attr('id'))

		root.addClass('dragged')
		
		root.containingList.createGhost(ev, root)

		#ev.dataTransfer.setData('text/html', root.html())
		ev.dataTransfer.setDragImage(document.createElement('img'), 0, 0)
		