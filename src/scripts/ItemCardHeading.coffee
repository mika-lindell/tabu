# Creates special list item containing a heading.
#
class ItemCardHeading extends HTMLElement

	# Construct new card heading.
	#
	# @param [String] Title of the card
	#
	constructor: (title, id = null)->
		super('li')

		heading = new HTMLElement('h5')
		heading.text(title)
		if id?
			heading.attr('id', id)

		@push(heading)