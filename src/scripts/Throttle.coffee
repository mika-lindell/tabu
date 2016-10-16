# Limit execution of same function during a period of time
# Useful for event handlers e.g
#
#
class Throttle

	# The function called when the class is created
	#
	# @param [Function] The function to be throttled 
	# @param [Integer]  The minimum time between funtion calls
	#
	constructor: (callback, limit) ->
		wait = false
		# Initially, we're not waiting
		return ()->
			# We return a throttled function
			if !wait
				# If we're not waiting
				callback.call()
				# Execute users function
				wait = true
				# Prevent future invocations
				setTimeout (()->
					# After a period of time
					wait = false
					# And allow future invocations
					return
				), limit
			return