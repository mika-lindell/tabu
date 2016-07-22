# Generate list of itemCards from DataGetter
#
class ItemCardList extends HTMLElement

	@dataGetter
	@baseId
	@fragment

	constructor: (dataGetter, baseId = 'card')->
		super('ul')
		@addClass('item-card-list')

		@dataGetter = dataGetter
		@baseId = baseId

		@attr('id', "#{ @baseId }-list")

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