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
		else if element.charAt(0) is '#' # Use the passed id to wrap an element
			@DOMElement = document.getElementById(element.substr(1))
		else if element is 'body' # Use the passed id to wrap an element
			@DOMElement = document.getElementsByTagName(element)[0]
		else # Create new element to be wrapped
			@DOMElement = document.createElement(element)

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
		if className?
			@DOMElement.className += " #{className}"

	# Remove CSS class from an element
	#
	# @param [String] Class to be removed
	#
	removeClass: (className = null)->
		if className?
			@DOMElement.className = @DOMElement.className.replace(' ' + className, '')
			@DOMElement.className = @DOMElement.className.replace(className, '')

	# Set event listener to an event
	#
	# @param [String] Name of the event
	# @param [Function] Function to be called when the event is fired
	#
	on: (name = null, listener = null)->
		if name? and listener?
			return @DOMElement.addEventListener(name, listener)

	# Add child element as last item
	#
	# @param [HTMLElement] The element to be added
	#
	push: (element = null)->
		if element?
			if element instanceof HTMLElement
				return @DOMElement.appendChild(element.DOMElement)
			else
				return @DOMElement.appendChild(element)

	# Bind element to variable
	#
	# @param [mixed] a variable the element is bound to. Can be int, float, str, array or object 
	#
	bind: (variable)->

	# Remove variable binding
	#
	unbind: ()->