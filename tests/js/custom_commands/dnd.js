// Custom command to test DnD

// util = require('util')
// events = require('events')

// DnD = ()->
//   events.EventEmitter.call this
//   return

// util.inherits DnD, events.EventEmitter

// DnD::command = (source, dest, callback)->
//   self = this

//   @moveTo(source, 10, 10)
//   @mouseButtonDown(0)
//   @pause(500)
//   @moveTo(dest, 10, 10)
//   @mouseButtonUp(0)

//   # if we have a callback, call it right before the complete event
//   if callback
//     callback.call self.client.api

//   # Emit to signal that the command has completed
//   self.emit 'complete'

//   return this

// module.exports = DnD

// exports.command = (source, dest, callback) ->
//   self = @
//   console.log @.client.moveTo

//   @moveTo(source, 10, 10)
//   @mouseButtonDown(0)
//   @pause(500)
//   @moveTo(dest, 10, 10)
//   @mouseButtonUp(0)
//   return @

