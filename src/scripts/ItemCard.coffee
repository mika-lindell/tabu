# Creates special list item containing a link.
#
class ItemCard extends HTMLElement

	@containingList
	@containingItem
	@elements

	@title
	@url
	@color

	@id

	# Construct new card.
	#
	# @param [String] Title of the card
	# @param [String] Url of the link related to this card
	#
	constructor: (containingList, containingItem = null,  title = null, url = null)->

		super('li')
		
		@containingList = containingList
		@containingItem = containingItem
		@elements = new Object
		@color = null
		@url = null
		@id = "#{ @containingList.baseId }-#{ @containingList.childCount() }"

		root = @

		@addClass('item-card')
		@attr('id', @id)

		if @containingList.editable
			# Enable drag-n-drop
			@attr('draggable', 'true')
			
			@on('dragstart', ()->
				dragStart(event, root)
			)

		@elements.link = new HTMLElement('a')
		
		# Disable DnD for links to remove its default DnD behavior
		@elements.link.attr('draggable', 'false') 
		@elements.link.addClass('item-card-link')
		@elements.link.attr('id', @id + '-link')

		@elements.dragHandle = new HTMLElement('i')
		@elements.dragHandle.text('more_vertmore_vert')
		@elements.dragHandle.addClass('drag-handle')

		@elements.badge = new HTMLElement('span')
		@elements.badge.text('NE')
		@elements.badge.addClass('item-card-badge')

		@elements.labelContainer = new HTMLElement('div')
		@elements.labelContainer.addClass('item-card-label-container')

		@elements.labelTitle = new HTMLElement('span')
		@elements.labelTitle.addClass('item-card-label')

		@elements.lineBreak = new HTMLElement('br')

		@elements.labelUrl = new HTMLElement('span')
		@elements.labelUrl.addClass('item-card-label-secondary')

		@elements.empty = new HTMLElement('div')
		@elements.empty.addClass('item-card-empty')
		@elements.empty.text('Add New Link')

		if title?
			@setTitle(title)

		if url?
			@setUrl(url)

		@elements.link.append(@elements.dragHandle)
		@elements.link.append(@elements.badge)

		@elements.labelContainer.append(@elements.labelTitle)
		@elements.labelContainer.append(@elements.lineBreak)
		@elements.labelContainer.append(@elements.labelUrl)

		@elements.link.append(@elements.labelContainer)

		@append(@elements.link)
		@append(@elements.empty)

	setTitle: (title)->
		@elements.labelTitle.text(title)

	setUrl: (url)->

		dirty = new Url(url)

		if dirty.hostname is window.location.hostname and dirty.protocol is 'chrome-extension:' 
			@url = new Url('http://' + url)
		else
			@url = dirty

		@color = new HexColor(@url)

		@elements.link.attr('href', @url.href)

		@elements.badge.text(@url.withoutPrefix().substring(0, 2) )
		@elements.badge.css('borderColor', @color.url )

		@elements.labelUrl.text(@url.hostname)

	dragStart = (ev, root)->

		ev.stopPropagation()

		ev.dataTransfer.effectAllowed = "move"

		if root.containingItem? 

			root.containingList.attr('data-dragged-item', root.attr('id'))
			root.addClass('dragged')
			root.containingList.createGhost(ev, root)

			root.containingList.draggedItem = root.containingItem



		#ev.dataTransfer.setData('text/html', root.html())
		ev.dataTransfer.setDragImage(document.createElement('img'), 0, 0)