class StudentsTask < ActiveRecord::Base
	
	belongs_to :assignment
	belongs_to :user

	validates :assignment_id, numericality: { only_integer: true }
	validates :user_id, numericality: { only_integer: true }
end