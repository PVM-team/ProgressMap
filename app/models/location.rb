class Location < ActiveRecord::Base
	
	belongs_to :assignment

	# validates :assignment_id, numericality: { only_integer: true }
	validates :x, numericality: { greater_than_or_equal_to: 0 }
	validates :y, numericality: { greater_than_or_equal_to: 0 }
end