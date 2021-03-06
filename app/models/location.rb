class Location < ActiveRecord::Base
	
	belongs_to :assignment

	validates :x, numericality: { greater_than_or_equal_to: 0 }
	validates :y, numericality: { only_integer: true }

	def to_s
		{ 'x': self.x, 'y': self.y }
	end
end