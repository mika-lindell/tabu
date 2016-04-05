class Animal
  constructor: (@name) ->

  move: (meters) ->
    alert @name + " moved #{meters}m."

sam = new Snake "Sammy the Python"
tom = new Horse "Tommy the Palomino"

sam.move()
tom.move()