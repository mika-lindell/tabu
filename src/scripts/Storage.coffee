# Manipulate Chrome local and synced cloud storage.
#
#
# Class interfacing with Chrome storage API.
# Save and retreive data locally and to cloud.
#
class Storage
	
	instance = null

	constructor: ()->
		# Make this singleton
		if not instance then instance = this
		return instance

	# Get key/value-pairs from local or cloud storage.
	#
	# @param [Mixed] String, array of strings, or object containing keys for the data to be retreived from storage.
	# @param [String] The storage area, where from the data will retreived. Can be 'cloud' or 'local', defaults to 'cloud'.
	# @param [boolean] The callback function returning the data when operation is complete. 
	#
	# @return [Object] Object containing found key/value-pairs. If no matching keys are found, empty object will be returned.
	#
	get: (key, area = 'cloud', callback = null)->

		console.log "Storage: I'm trying to get #{area} data", key

		done = (data)->
			console.log "Storage: Ok, got #{area} data ->", key, data
			callback(data)


		if not callback?  # if callback is undefined or null
			callback = getComplete

		if area is 'local'
			chrome.storage.local.get(key, done)
		else
			chrome.storage.sync.get(key, done)

	# Set key/value-pairs to local or cloud storage.
	#
	# @param [Object] Object containing key/value-pairs to be saved.
	# @param [String] The storage area, where from the data will be saved. Can be 'cloud' or 'local', defaults to 'cloud'.
	#
	set: (items, area = 'cloud')->

		console.log "Storage: I'm trying to save #{area} data...", items

		done = ()->
			console.log "Storage: Ok, saved #{area} data.", items

		if area is 'local'
			chrome.storage.local.set(items, done)
		else
			chrome.storage.sync.set(items, done)

	# Remove key/value-pairs to local or cloud storage.
	#
	# @param [Mixed] String, array of strings, or object containing keys containing key/value-pairs to be removed.
	# @param [String] The storage area, where from the data will be removed. Can be 'cloud' or 'local', defaults to 'cloud'.
	#
	remove: (items, area = 'cloud')->

		console.log "Storage: I'm trying to remove data from #{area} storage...", items

		removeComplete = (data)->
			console.log "Storage: Ok, removed data from #{area} storage.", items, data

		if area is 'local'
			chrome.storage.local.remove(items, removeComplete)
		else
			chrome.storage.sync.remove(items, removeComplete)

	# Delete all key/value-pairs from local or cloud storage 
	#
	# @param [String] The storage area, where from the data will be deleted. Can be 'cloud' or 'local', defaults to 'cloud'.
	#
	clear: (area = 'cloud')->

		console.log "Storage: I'm trying to delete all #{area} data..."

		clearComplete = ()->
			console.log "Storage: Ok, all #{area} data deleted."

		if area is 'local'
			chrome.storage.local.clear(clearComplete)
		else
			chrome.storage.sync.clear(clearComplete)

	# Shorthand for getting visibility -setting (are elements set visible or hidden?)
	#
	# @param [boolean] The callback function returning the data when operation is complete. 
	#
	getVisible: (callback)->
		@get('settingVisible', 'local', callback)

	# Shorthand for saving visibility -setting (are elements set visible or hidden?)
	#
	# @param [boolean] New value visibility -setting should be saved to.
	#
	setVisible: (newValue = true)->

		data =
			settingVisible: newValue

		@set(data, 'local')

	# Shorthand for getting view -setting (what data is show in the topmost list?)
	#
	# @param [boolean] The callback function returning the data when operation is complete. 
	#
	getView: (callback)->
		@get('settingView', 'cloud', callback)

	# Shorthand for saving view -setting (what data is show in the topmost list?)
	#
	# @param [boolean] New value visibility -setting should be saved to.
	#
	setView: (newValue = 'topSites')->

		data =
			settingView: newValue

		@set(data, 'cloud')


	getListItemCount: (callback)->
		@get("#{list}ItemCount", 'cloud', callback)

	setListItemCount: (newValue)->

		data =
			"#{list}ItemCount": newValue

		@set(data, 'cloud')


	getListItem: (list, index, callback)->
		@get("#{list}-item#{index}", 'cloud', callback)

	setListItem: (list, index, newValue)->
		data =
			"#{list}-item#{index}": newValue
		@set(data, 'cloud')

	getListItems: (list, callback)->

		getThese = new Array()

		for i in [0...20]
			getThese.push "#{list}-item#{i}"

		@get(getThese, 'cloud', callback)