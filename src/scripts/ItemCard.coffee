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
		@addClass('item-card')

		color = new HexColor(url)

		link = new HTMLElement('a')
		link.attr('href', url)
		link.addClass('item-card-link')
		if id? then link.attr('id', id)

		hostname = link.DOMElement.hostname

		# This will remove www. prefixes from url, but will keep subdomains.
		searchPattern = '^w+\\d*\\.'
		rx = new RegExp(searchPattern, 'gim')
		replacePattern = ''
		parsedHostname = hostname.replace(rx, replacePattern)

		badge = new HTMLElement('span')
		badge.text( parsedHostname.substring(0, 2) )
		badge.css('borderColor', color.url )
		badge.addClass('item-card-badge')

		labelContainer = new HTMLElement('div')
		labelContainer.addClass('item-card-label-container')

		label = new HTMLElement('span')
		label.text(title)
		label.addClass('item-card-label')

		lineBreak = new HTMLElement('br')

		labelUrl = new HTMLElement('span')
		labelUrl.text(hostname)
		labelUrl.addClass('item-card-label-secondary')

		link.push(badge)

		labelContainer.push(label)
		labelContainer.push(lineBreak)
		labelContainer.push(labelUrl)

		link.push(labelContainer)

		@push(link)