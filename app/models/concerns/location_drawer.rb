module LocationDrawer

  BORDER_SIZE = 1000 / 40
  BLOCK_SIZE = 1000 / 5
  ASSIGNMENTS_PER_LEVEL = 1000 / (2 * BORDER_SIZE + BLOCK_SIZE)

  def self.next_location(i, prev_location, assignment_count)
  	direction = "right"
  	direction = "left" if i % (2 * ASSIGNMENTS_PER_LEVEL) >= ASSIGNMENTS_PER_LEVEL

    level_amount = (1.0 * assignment_count / ASSIGNMENTS_PER_LEVEL).ceil

  	self.draw_location(i, prev_location, direction, level_amount)
  end

  private

  	def self.draw_location(i, prev_location, direction, level_amount)
  		x_start = self.define_X_start(i, direction)
  		y_start = self.define_Y_start(i, level_amount)

  		location = Location.new x: self.get_random_position(x_start), y: self.get_random_position(y_start)

  		while ! self.drawn_location_valid(location, prev_location)
  			location = Location.new x: self.get_random_position(x_start), y: self.get_random_position(y_start)
  		end

  		location
  	end

  	def self.define_X_start(i, direction)
        border = 50 + 2 * BORDER_SIZE # 50 pixeliä otettaan huomioon reunaa varten
        relative_starting_position = (i & ASSIGNMENTS_PER_LEVEL) * (2 * BORDER_SIZE + BLOCK_SIZE)

        return border + relative_starting_position if direction == 'right'

        border - relative_starting_position + (ASSIGNMENTS_PER_LEVEL - 1) * (2 * BORDER_SIZE + BLOCK_SIZE)
  	end

  	def self.define_Y_start(i, level_amount)
  		level = (level_amount - (1.0 * i / ASSIGNMENTS_PER_LEVEL)).ceil - 1

        50 + 2 * BORDER_SIZE + level * (2 * BORDER_SIZE + BLOCK_SIZE) # 50 pikselin lisäreunus ylös
  	end

  	def self.get_random_position(start)
  		((rand * BLOCK_SIZE) + start).floor
  	end

    def self.drawn_location_valid(location, prev_location)
    	return true unless prev_location
    	distance_between_locations(location, prev_location) >= 120
    end

    def self.distance_between_locations(location1, location2)
    	Math.sqrt((location1.x - location2.x) ** 2 + (location1.y - location2.y) ** 2)
    end
end