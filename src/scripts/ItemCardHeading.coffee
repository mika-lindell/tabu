# Creates special list item containing a heading.
#
class ItemCardHeading extends HTMLElement

	@containingList

	# Construct new card heading.
	#
	# @param [String] Title of the card
	#
	constructor: (title, containingList ,id = null)->
		super('li')
		@addClass('item-card-heading')

		@containingList = containingList

		heading = new HTMLElement('h6')
		heading.text(title)
		if id?
			heading.attr('id', id)

		@append(heading)