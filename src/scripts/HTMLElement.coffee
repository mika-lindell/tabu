# Interface wrapper for standard HTML DOM Element.
#
#	HTMLElement.DOMElement - Standard DOM element object wrapped
#
class HTMLElement

	@DOMElement
	@bound = false

	# Construct new element.
	#
	# @param [mixed] HTML tag name as string to create new element or standard element object to be wrapped. 
	#
	constructor: (element)->
	  # TODO: Check if element? is defined and if not, then raise error
	  
		if element instanceof Element # Wrap the passed element
			@DOMElement = element
		else if element.charAt? and element.charAt(0) is '#' # Use the passed id to wrap an element
			@DOMElement = document.getElementById(element.substr(1))
		else if element is 'body' # Use the passed id to wrap an element
			@DOMElement = document.getElementsByTagName(element)[0]
		else # Create new element to be wrapped
			@DOMElement = document.createElement(element)

	# Gets/sets the text inside an element
	#
	# @return [HTMLElement] The parent element or null if element has no parent
	#
	parent: ()->
		parent = @DOMElement.parentElement

		if parent?
			return new HTMLElement(parent)
		else
			return null

	# Gets/sets the text inside an element
	#
	# @param [String] Text to be inserted
	#
	# @return [String]
	#
	text: (text = null)->
		if text?
			if @DOMElement
				return @DOMElement.textContent = text
		else
			return @DOMElement.textContent

	# Gets/sets the HTML inside an element
	#
	# @param [String] HTML to be inserted
	#
	# @return [String]
	#
	html: (html = null)->
		if html?
			if @DOMElement
				return @DOMElement.innerHTML = html
		else
			return @DOMElement.innerHTML

	# Gets/sets an attribute of an element
	#
	# @param [String] Attribute to be targeted
	# @param [String] New value for specified attribute
	#
	# @return [String]
	#
	attr: (attrName, newValue = null)->
		if newValue?
			return @DOMElement.setAttribute(attrName, newValue)
		else
			return @DOMElement.getAttribute(attrName)


	value: (newValue = null)->
		if newValue?
			@DOMElement.value = newValue
		else
			return @DOMElement.value


	# Tests if element has specified attribute
	#
	# @param [String] Attribute to be tested
	#
	# @return [Boolean]
	#
	hasAttr: (attrName)->
		if attrName?
			return @DOMElement.hasAttribute(attrName)
		else
			return false
			
	# Removes an attribute from an element
	#
	# @param [String] Attribute to be removed
	#
	removeAttr: (attrName)->
		if attrName?
			return @DOMElement.removeAttribute(attrName)

	# Gets/sets a style rule of an element.
	# NOTE: rule border-color is borderColor etc.
	#
	# @param [String] Rule to be targeted
	# @param [String] New value for specified rule
	#
	# @return [String]
	#
	css: (ruleName, newValue = null)->
		if newValue?
			return @DOMElement.style[ruleName] = newValue
		else
			return @DOMElement.style[ruleName]

	# Add CSS class to an element
	#
	# @param [String] List of classes to be added (separated with space)
	#
	addClass: (className = null)->
		if className? and not @DOMElement.classList.contains(className)		
			@DOMElement.classList.add(className)

	# Remove CSS class from an element
	#
	# @param [String] Class to be removed
	#
	removeClass: (className = null)->
		if className? and @DOMElement.classList.contains(className)
			@DOMElement.classList.remove(className)

	# Test if element has specified CSS class
	#
	# @param [String] Class to be tested
	#
	# @return [Boolean]
	# 
	removeClass: (className = null)->
		if className?
			return @DOMElement.classList.remove(className)
		else
			return false

	# Set event listener to an event
	#
	# @param [String] Name of the event
	# @param [Function] Function to be called when the event is fired
	#
	on: (name = null, listener = null)->
		if name? and listener?
			return @DOMElement.addEventListener(name, listener)

	# Add child element as first item
	#
	# @param [HTMLElement] The element to be added
	#
	prepend: (element = null)->
		if element?
			if @firstChild()?
				@insert(element, @firstChild())
			else
				@append(element)

	# Add child element as last item
	#
	# @param [HTMLElement] The element to be added
	#
	append: (element = null)->
		if element?
			if element instanceof HTMLElement
				return @DOMElement.appendChild(element.DOMElement)
			else
				return @DOMElement.appendChild(element)

	# Add child element before or after specified child
	#
	# @param [HTMLElement] The element to be added
	# @param [Mixed] The element at the insertion point
	#
	insert: (element = null, target = null, beforeOrAfter = 'before')->
		if element? and target?

			if element instanceof HTMLElement
				elementDOM = element.DOMElement
			else
				elementDOM = element

			if target instanceof HTMLElement
				targetDOM = target.DOMElement
			else
				targetDOM = target

			if beforeOrAfter is 'before'
				@DOMElement.insertBefore(elementDOM, targetDOM)
			else
				if targetDOM.nextSibling?
					@DOMElement.insertBefore(elementDOM,targetDOM.nextSibling)

	children: ()->

		orig = @DOMElement.children
		children = []

		for i in orig
			children.push(new HTMLElement(i))

		return children

	firstChild: ()->
		return new HTMLElement(@DOMElement.firstChild)

	childCount: ()->
		return @DOMElement.childElementCount

	top: (unit = null)->
		top = @DOMElement.offsetTop
		return if unit? then "#{top}px" else top

	left: (unit = null)->
		left = @DOMElement.offsetLeft
		return if unit? then "#{left}px" else left

	width: (unit = null)->

		display = @css('display')

		if display is 'none' then @show()
		width = @DOMElement.offsetWidth
		if display is 'none' then @hide()
		return if unit? then "#{width}px" else width

	height: (unit = null)->

		display = @css('display')

		if display is 'none' then @show()
		height = @DOMElement.offsetHeight
		if display is 'none' then @hide()
		return if unit? then "#{height}px" else height

	clone: ()->
		return new HTMLElement(@DOMElement.cloneNode(true))

	hide: ()->
		@css('display', 'none')

	show: (display = 'block')->
		@css('display', display)

	focus: ()->
		@DOMElement.focus()

	removeFromDOM: ()->
		@DOMElement.outerHTML = ''
