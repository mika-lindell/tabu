# Creates special list item containing a heading.
#
class ItemCardHeading extends HTMLElement

	@containingList
	@id

	# Construct new card heading.
	#
	# @param [String] Title of the card
	#
	constructor: (containingList, title, id = null)->
		super('li')
		@addClass('item-card-heading')

		@containingList = containingList
		@id = "#{ @containingList.baseId }-#{ @containingList.childCount() }"

		heading = new HTMLElement('h6')
		heading.text(title)
		heading.attr('id', @id)

		@append(heading)