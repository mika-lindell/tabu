# Generate list of itemCards from DataGetter
#
class ItemCardList extends HTMLElement

	@dataGetter
	@baseId
	@fragment

	constructor: (dataGetter, baseId = 'card')->
		super('ul')

		@dataGetter = dataGetter
		@baseId = baseId

		@attr('id', "#{ @baseId }-list")
		@update()

	update: ()->	
		# Create document fragment for not to reflow when appending elements (better performance)
		@fragment = document.createDocumentFragment()

		for item, i in @dataGetter.data

			cardId = "#{ @baseId }-#{ i }"

			if item.heading?
				card = new ItemCardHeading(item.heading, cardId)
			else
				card = new ItemCard(item.title, item.url, cardId)

			@fragment.appendChild(card.DOMElement)

		@push(@fragment) 