# Generate list of itemCards from given data
#
class ItemCardList extends HTMLElement
	
	@baseId
	
	@items
	@data
	@storage

	@editable
	@editActions
	@userInput

	@draggedItem
	@ghost

	@container
	@noItems
	@body
	

	constructor: (container, data, empty = "I looked, but I couldn't find any.")->

		super('ul')

		root = @

		@baseId = container.replace('#', '')

		@items = new Array()
		@data = data
		@storage = null

		@editable = false

		@editActions =
			container: null
			edit: null
			delete: null
		@userInput = 
			link: null

		@draggedItem = null
		@ghost = 
			element: null
			initialX: null
			initialY: null

		@container = new HTMLElement (container)
		@noItems = new HTMLElement('p')
		
		@addClass('item-card-list')
		@attr('id', "#{ @baseId }-list")

		@noItems.addClass('no-items')
		@noItems.attr('draggable', 'false')
		# icon = new HTMLElement('i')
		# icon.addClass('material-icons')
		# icon.addClass('left')
		# icon.text('sentiment_neutral')
		
		@noItems.html(empty.replace(' ', '&nbsp;'))
		# @noItems.prepend(icon)

	create: ()->

		for i of @data
			if @data[i].heading
				item = @addHeading(@data[i].heading)
			else
				item = @addItem(@data[i].title, @data[i].url)

			item.element.index = i

		@container.append @
		@ifTheListHasNoItems()

	enableEditing: ->

		root = @

		@storage = new Storage()

		@editable = true
		
		# This will update the cursor during DragOver, as throttlig this operation would cause flicker
		@on('dragover', ()->
			dragOverUpdateCursor(event, root)
		)
		# Human hand-eye-coordination only need things to be updated at ~ 100ms interval for the action to feel responsive
		# Hence throttle execution of this event handler to save resources
		@on('dragover', new Throttle(()->
			dragOverHandler(event, root)
		, 80))

		@on('drop', ()->
			dropHandler(event, root)
		)

		@on('dragend', ()->
			dragEndHandler(event, root)
		)

		# So that the DnD ghost is updated outside the containing element
		@body = new HTMLElement('body')

		@body.on('dragover', ()->
			bodyDragOverHandler(event, root)
		)

		@userInput.link = new UserInput('user-input-add-link', '')
		@userInput.link.addField('title', 'text', 'Title')
		@userInput.link.addField('url', 'text', 'Web Address')
		@userInput.link.addOkCancel('')

		@editActions.container = new HTMLElement('ul')
		@editActions.container.addClass('edit-actions')

		@editActions.edit = new HTMLElement('li')
		@editActions.edit.addClass('edit-actions-edit')
		@editActions.edit.text('Edit')
		initDragOverEffect @editActions.edit

		@editActions.delete = new HTMLElement('li')
		@editActions.delete.addClass('edit-actions-delete')
		@editActions.delete.text('Delete')
		initDragOverEffect @editActions.delete

		@editActions.container.append @editActions.edit
		@editActions.container.append @editActions.delete
		
		@editActions.container.on('dragover', ()->
			actionsDragOverHandler(event, root)
		)

		@editActions.edit.on('drop', ()->
			editDropHandler(event, root)
		)

		@editActions.delete.on('drop', ()->
			deleteDropHandler(event, root)
		)

		@body.append @editActions.container

		new HTMLElement('#menu-add-link').on('click', (ev)-> 
			root.addItemByUserInput(root)
		)

		@attr('data-list-editable', '')


	showEditActions: ()->
		new Animation(@editActions.container, 0.2).slideIn()

	hideEditActions: ()->
		new Animation(@editActions.container, 0.2).slideOut()

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

		@ifTheListHasNoItems()
		return item

	addItem: (title = null, url = null, position = 'last', save = true)->

		item = 
			element: null
			type: 'link'

		if not title? or not url?
			item.element = new ItemCard(@, item)
		else
			item.element = new ItemCard(@, item, title, url)

		if position is 'last'

			item.element.index = @items.length
			@items.push item
			@append item.element

		else if  position is 'first'

			item.element.index = 0
			@items.unshift item
			@prepend item.element
			@updateNewItemPosition null, 0
			
		else # assume it is numeric position

			if position >= @items.length
				@append item.element
			else
				@insert(item.element, @items[position].element)

			@items.splice(position, 0, item)
			@updateNewItemPosition null, position
			
		@ifTheListHasNoItems()
		return item

	save: ()->

		saveThis = new Array()

		for i of @items

			data =
				url: @items[i].element.url.href

			if @items[i].type is 'heading'
				data.heading = @items[i].element.title
			else
				data.title = @items[i].element.title

			saveThis.push data

		@storage.setList(@baseId, saveThis)

	removeItem: (item, allowUndo = false)->

		root = @

		@removeChild(item.element)
		@items.splice(item.element.index, 1)
		@updateNewItemPosition(null, 0)
		@ifTheListHasNoItems()
		root.save()

		if allowUndo
			new Toast("Deleted <strong>#{item.element.title}</strong>", 'delete_forever' ,'Undo', ()->
				result = root.addItem(item.element.title, item.element.url.href, item.element.origIndex)
				root.save()
				new Animation(result.element, 1).highlight()
			)

	getIndexOf: (item)->
		return @items.indexOf(item)

	getItemForElement: (DOMElement)->

		for item, i in @items

			if item.element.DOMElement is DOMElement
				return item

		return null

	addItemByUserInput: (root)->

		# Make sure only one at a time can be added
		if root.userInput.link.active is false

			empty = root.addItem(null, null, 'first')

			root.showUserInputForItem(empty)

	showUserInputForItem: (item, action='addLink', title = null, url = null)->

		root = @
		userInput = @userInput.link	

		if userInput?

			if action is 'addLink'
				userInput.setTitle('Add Link')
				userInput.setOkLabel('Add Link')
			else if action is 'editLink'
				userInput.setTitle('Edit Link')
				userInput.setOkLabel('Save')

			if title?
				userInput.fields[0].element.value(title)
				userInput.fields[0].element.DOMElement.select()

			if url?
				userInput.fields[1].element.value(url)

			if action is 'editLink'
				userInput.addClass('centered')
				root.body.append(userInput)
			else
				item.element.append(userInput)
			
			if action is 'addLink'
				item.element.addClass('empty')

			root.addClass('edit-in-progress')
			item.element.addClass('editing')

			item.element.removeClass('dragged')
			item.element.attr('draggable', 'false')		

			userInput.done = (fields)->

				item.element.setTitle(fields[0].element.value())
				item.element.setUrl(fields[1].element.value())

				root.removeClass('edit-in-progress')
				item.element.removeClass('editing')

				if action is 'addLink'
					item.element.removeClass('empty')
					# new Toast "Added '#{item.element.title}'.", null, null, 2
				else if action is 'editLink'
					userInput.removeClass('centered')
					# new Toast "Updated '#{item.element.title}'.", null, null, 2

				item.element.attr('draggable', 'true')

				new Animation(item.element, 1).highlight()

				root.save()
				userInput.hide()

			userInput.abort = ()->

				userInput.hide()

				root.removeClass('edit-in-progress')
				item.element.removeClass('editing')

				if action is 'addLink'
					root.removeItem(item)
				else if action is 'editLink'
					item.element.attr('draggable', 'true')
					userInput.removeClass('centered')

			userInput.show()

	setOrientation: (orientation = 'horizontal')->

		if orientation is 'horizontal'
			@container.addClass('horizontal-list')
		else
			@container.removeClass('horizontal-list')

	ifTheListHasNoItems: ()->

		messageVisible = @container.hasChild(@noItems)

		if @items.length is 0
			if not messageVisible
				@container.insert(@noItems, @container.firstChild(), 'after')
		else
			if messageVisible then @container.removeChild(@noItems)

	updateNewItemPosition: (item, newIndex)->

		if item?
			# Remove from old position
			@items.splice(item.element.index, 1)
			# Insert to new position
			@items.splice(newIndex, 0, item)

		for i of @items
			@items[i].element.index = i

		# log = new Array()

		# for i of @items
		# 	log.push "#{@items[i].element.index}: #{@items[i].element.title}"

		# console.log 'updateNewItemPosition', log

	acceptFromOutsideSource: (ev)->

		if ev.dataTransfer.types.indexOf('text/plain') isnt -1 or 
		ev.dataTransfer.types.indexOf('text/html') isnt -1 or
		ev.dataTransfer.types.indexOf('text/uri-list') isnt -1 or
		ev.dataTransfer.types.indexOf('text/json') isnt -1

			return true
		else
			return false

	createGhost: (ev, from)->

		if from?
			@ghost.element = from.clone()
			@ghost.element.attr('id', 'ghost')
			@ghost.element.css('position', 'fixed')
			@ghost.element.css('width', from.width('px'))

			@ghost.element.css('left', ev.clientX + 20  + 'px')
			@ghost.element.css('top', ev.clientY + 'px')

			# Make sure animations or transitions doesn't sffect the ghost
			@ghost.element.css('transition', 'none')
			@ghost.element.css('animation', 'none')

			@ghost.initialX = ev.clientX
			@ghost.initialY = ev.clientY

			@updateGhost(ev)
			@body.append(@ghost.element)

	updateGhost: (ev)->

		if @ghost.element? 
			x = ev.clientX - @ghost.initialX
			y = ev.clientY - @ghost.initialY

			@ghost.element.css('left', ev.clientX + 20 + 'px')
			@ghost.element.css('top', ev.clientY + 20 + 'px')

	deleteGhost: ()->
		if @ghost.element?
			@body.removeChild(@ghost.element)
			@ghost.element = null

	initDragOverEffect = (element)->

		element.on('dragenter',()->
			element.addClass('drag-over')
		)

		element.on('dragleave',()->
			element.removeClass('drag-over')
		)

		element.on('drop',()->
			element.removeClass('drag-over')
		)

	dragOverUpdateCursor = (ev, root)->

		ev.preventDefault()
		ev.stopPropagation()

		# Disable all DnD if currently have add link dialog open
		if root.userInput.active 
			ev.dataTransfer.dropEffect = "none"
		else
			ev.dataTransfer.dropEffect = "copyLink"

		root.updateGhost(ev)

	dragOverHandler = (ev, root)->

		ev.preventDefault()
		ev.stopPropagation()

		# Disable all DnD if currently have add link dialog open
		if root.userInput.active then return

		target = root.getItemForElement(ev.target.closest('li'))
		changed = false

		if not root.draggedItem?

			if root.acceptFromOutsideSource(ev)

				item = root.addItem('Add Link', 'New')
				root.draggedItem = item
				root.draggedItem.element.addClass('dragged')
				root.draggedItem.element.addClass('empty')
				root.addClass('drag-in-progress')

		if target is null and ev.target is root.DOMElement

			last = root.lastChild()
			rect = last.rect() # Get the absolute position relative to document, not to the offset, as we are comparing to mouse coords 

			if root.draggedItem.element.DOMElement isnt last.DOMElement and rect.left < ev.clientX and rect.top < ev.clientY
				# Insert as last item if dragging: 
				# - over empty space at the end of list
				console.log 'dragOverHandler: Append, empty space'
				root.append(root.draggedItem.element)
				changed = true
		
		else if target? and root.draggedItem? and target.element isnt root.draggedItem.element and target.element.containingList is root

			# Insert as last item if dragging: 
			# - over last child
			if target.element.DOMElement is root.DOMElement.lastElementChild
				console.log 'dragOverHandler: Append'
				root.append(root.draggedItem.element)
				changed = true
			
			else if target.element.top() < root.draggedItem.element.top() or target.element.left() < root.draggedItem.element.left()
				# InsertBefore has to be first option for this to work
				# Insert before if dragging:
				# - Up
				# - Left
				console.log 'dragOverHandler: insertBefore'
				root.insert(root.draggedItem.element, target.element)
				changed = true

			else if target.element.top() > root.draggedItem.element.top() or target.element.left() > root.draggedItem.element.left()
				# Insert after if dragging:
				# - Down
				# - Right				
				console.log 'dragOverHandler: insertAfter'
				if target.element.DOMElement.nextSibling
					root.insert(root.draggedItem.element, target.element, 'after')
					changed = true
			
		if changed and target? then root.updateNewItemPosition(root.draggedItem, target.element.index)			

	dropHandler = (ev, root)->

		ev.preventDefault()
		ev.stopPropagation()

		data =
			title: null
			url: null

		if ev.dataTransfer.types.indexOf('text/json') isnt -1
			data = JSON.parse(ev.dataTransfer.getData('text/json'))

		if data.title? and data.url?
			title = data.title
			url = data.url
		else
			temp = new Url(ev.dataTransfer.getData('text/uri-list'))
			title = temp.withoutPrefix()
			url = temp.href
		

		if url isnt window.location.href
			root.showUserInputForItem(root.draggedItem, 'addLink', title, url)

		root.draggedItem = null

		console.log 'dropHandler', title, url


	dragEndHandler = (ev, root)->

		console.log 'dragEndHandler'

		ev.preventDefault()
		
		target = root.getItemForElement(ev.target.closest('li'))

		root.removeClass('drag-in-progress')
		target.element.removeClass('dragged')
		
		dragDropCleanUp(root)

		root.save()

	actionsDragOverHandler = (ev, root)->

		ev.preventDefault()
		ev.stopPropagation()
		ev.dataTransfer.dropEffect = "move"
		root.updateGhost(ev)

	editDropHandler = (ev, root)->

		console.log 'editDropHandler'

		ev.preventDefault()
		ev.stopPropagation()

		ev.dataTransfer.dropEffect = "move"

		origIndex = root.draggedItem.element.origIndex

		# Operation is to edit content, undo all position changes

		if parseInt(origIndex) is 0
			root.prepend(root.draggedItem.element)
		else
			root.insert(root.draggedItem.element, root.items[origIndex].element, 'after')

		root.updateNewItemPosition(root.draggedItem, origIndex)

		root.showUserInputForItem(root.draggedItem, 'editLink', root.draggedItem.element.title, root.draggedItem.element.url.href)

	deleteDropHandler = (ev, root)->

		console.log 'deleteDropHandler'

		ev.preventDefault()
		ev.stopPropagation()

		ev.dataTransfer.dropEffect = "move"

		root.removeItem(root.draggedItem, true)

		dragDropCleanUp(root)

		root.save()
		
	bodyDragOverHandler = (ev, root)->

		ev.preventDefault()
		ev.dataTransfer.dropEffect = "none"

		# Make sure the placeholder items are removed when dragging from outside source and focus leaves editable list
		if root.acceptFromOutsideSource(ev) and root.draggedItem?
			root.removeItem(root.draggedItem)
			root.removeClass('drag-in-progress')
			root.draggedItem = null				
		else
			root.updateGhost(ev)

	dragDropCleanUp = (root)->

		root.deleteGhost()

		root.draggedItem = null
		root.hideEditActions()






