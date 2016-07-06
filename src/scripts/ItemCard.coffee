# Creates special list item containing a link.
#
class ItemCard extends HTMLElement

	# Construct new card.
	#
	# @param [String] Title of the card
	# @param [String] Url of the link related to this card
	#
	constructor: (title, url, id = null)->
		super('li')

		color = new HexColor(url)

		link = new HTMLElement('a')
		link.css('backgroundColor', color.url)
		link.text(title)
		link.attr('href', url)
		if id?
			link.attr('id', id)

		@push(link)