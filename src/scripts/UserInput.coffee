class UserInput extends HTMLElement

	@content
	@title
	@fields	
	@done
	@abort

	constructor: (id, title)->

		root = @

		@done = ()->
		@abort =  ()->

		super('form')
		@attr('id', id)
		@addClass('user-input')
		@addClass('card')

		@css('position', 'absolute')
		@css('top', '0')
		@css('left', '0')
		@css('width', '100%')

		@fields = new Array()

		@content = new HTMLElement('div')
		@content.addClass('card-content')

		@heading = new HTMLElement('span')
		@heading.addClass('card-title')
		@heading.text(title)

		@content.append @heading		
		@append @content

		@.on('submit', (ev)->
			ev.preventDefault()
			root.hide()
			root.done(root.fields)
		)

		body = new HTMLElement('body')
		body.on('keyup', (ev)->
			if ev.code is 'Escape' then root.hide()
		)
		

	addField: (name, type, label = null, value = null)->

		field =
		 element: new HTMLElement('input')
		 container: new HTMLElement('div')
		 value: ''

		field.container.addClass('input-field')

		field.element.attr('id', name)
		field.element.attr('name', name)
		field.element.attr('type', type)
		field.element.attr('tabindex', @fields.count + 1)

		if label?
			field.label = new HTMLElement('label')
			field.label.attr('for', name)
			field.label.text(label)

		if value?
			field.value = value
			field.element.value(value)

		field.element.on('change', ()->
			field.value = field.element.value()
			console.log field
		)

		if label? then field.container.append(field.label)
		field.container.append(field.element)
		@content.append(field.container)

		@fields.push field


	addOkCancel: (confirm = 'Ok', abort= 'Cancel')->

		root = @

		container =  new HTMLElement('div')
		container.addClass('card-action')

		cancel = new HTMLElement('input')
		ok = new HTMLElement('input')

		cancel.attr('type', 'button')
		cancel.attr('tabindex', @fields.count + 2)
		cancel.value(abort)
		cancel.addClass('btn')
		cancel.addClass('cancel')

		cancel.on('click', ()->
			root.abort()
			root.hide()
		)

		ok.attr('type', 'submit')
		ok.attr('tabindex', @fields.count + 1)
		ok.value(confirm)
		ok.addClass('btn')
		ok.addClass('submit')

		container.append(cancel)
		container.append(ok)

		@append(container)

	show: ()->
		super()
		@fields[0].element.focus()



