class StudentsTask < ActiveRecord::Base
	
	belongs_to :assignment
	belongs_to :student

	validates :assignment_id, numericality: { only_integer: true }
	validates :student_id, numericality: { only_integer: true }
	validates :complete, :inclusion => {:in => [true, false] }
end