class Membership < ActiveRecord::Base
	
	belongs_to :course
	belongs_to :user

	validates :course_id, numericality: { only_integer: true }
	validates :user_id, numericality: { only_integer: true }
end