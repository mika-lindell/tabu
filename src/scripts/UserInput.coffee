class UserInput extends HTMLElement

	@active

	@content
	@heading
	@actions

	@animation

	@fields

	@done
	@abort

	constructor: (id, title)->

		super('form')

		root = @

		@active = false
		@content = new HTMLElement('div')
		@heading = new HTMLElement('span')
		@actions =
			ok: null
			cancel: null

		@animation = new Animation(@)

		@fields = new Array()

		@done = ()->
		@abort =  ()->

		@attr('id', id)
		@addClass('user-input')
		@addClass('card')

		@content.addClass('card-content')

		@heading.addClass('card-title')
		@heading.text(title)

		@content.append @heading
		@append @content

		@.on('submit', (ev)->
			ev.preventDefault()
			root.onConfirm()
		)

		@.on('dragover', @dragOver)
		@.on('drop', @drop)

		body = new HTMLElement('body')
		body.on('keyup', (ev)->
			if ev.code is 'Escape'
				root.onAbort()
		)


	addField: (name, type, label = null, value = null, required = true)->

		field =
			element: new HTMLElement('input')
			container: new HTMLElement('div')

		field.container.addClass('input-field')

		field.element.attr('id', name)
		field.element.attr('name', name)
		field.element.attr('type', type)
		if required then field.element.attr('required', '')
		field.element.attr('tabindex', @fields.lenght)

		if label?
			field.label = new HTMLElement('label')
			field.label.attr('for', name)
			field.label.text(label)

		if value?
			field.value = value
			field.element.value(value)

		if label? then field.container.append(field.label)
		field.container.append(field.element)
		@content.append(field.container)

		@fields.push field

	clearFields: ()->

		for field in @fields
			field.element.value('')

	addOkCancel: (confirm = 'Ok', abort= 'Cancel')->

		root = @

		container =  new HTMLElement('div')
		container.addClass('card-action')

		@actions.cancel = new HTMLElement('input')
		@actions.ok = new HTMLElement('input')

		@actions.cancel.attr('type', 'button')
		@actions.cancel.attr('tabindex', @fields.lenght)
		@actions.cancel.value(abort)
		@actions.cancel.addClass('btn')
		@actions.cancel.addClass('cancel')

		@actions.cancel.on('click', ()->
			root.onAbort()
		)

		@actions.ok.attr('type', 'submit')
		@actions.ok.attr('tabindex', @fields.lenght)
		@actions.ok.value(confirm)
		@actions.ok.addClass('btn')
		@actions.ok.addClass('submit')

		container.append(@actions.cancel)
		container.append(@actions.ok)

		@append(container)

	setTitle: (title)->
		@heading.text(title)

	setOkLabel: (label)->
		@actions.ok.attr('value', label)

	show: (display)->
		# super(display)
		@animation.slideIn(null, display)
		@fields[0].element.focus()
		@active = true

	hide: ()->
		# super()
		@animation.slideOut()
		@active = false

	onAbort: ()->
		@hide()
		@abort(@fields)
		@clearFields()

	onConfirm: ()->
		@hide()
		@done(@fields)
		@clearFields()


	dragOver: (ev)->
		# ev.preventDefault()
		ev.stopPropagation()
		# console.log 'Drag', ev
		# ev.dataTransfer.dropEffect = 'copyLink'

	drop: (ev)->
		# ev.preventDefault()
		ev.stopPropagation()
		# console.log 'Drop', ev
		# data = ev.dataTransfer.getData("text")
		# uri = ev.dataTransfer.getData("text/uri-list")

		# for field in root.fields
		# 	if field.name is 'url'

		# console.log data, uri



