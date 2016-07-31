# Creates special list item containing a heading.
#
class ItemCardHeading extends HTMLElement

	# TODO: Create baseclass Item (or Card?) which extends HTMLElement and has shared functionality between ItemCardHeading and itemCard
	@containingList
	@containingItem
	@id
	@index

	# Construct new card heading.
	#
	# @param [String] Title of the card
	#
	constructor: (containingList, containingItem = null, title, id = null)->
		super('li')
		@addClass('item-card-heading')

		@containingList = containingList
		@containingItem = containingItem

		@index = @containingList.childCount()
		@id = "#{ @containingList.baseId }-#{ @index }"

		heading = new HTMLElement('h6')
		heading.text(title)
		heading.attr('id', @id)

		@append(heading)