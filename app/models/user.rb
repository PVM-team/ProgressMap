class User < ActiveRecord::Base
	
	has_many :memberships, dependent: :destroy
	has_many :courses, through: :memberships
	
	has_many :students_tasks, dependent: :destroy
	has_many :assignments, through: :students_tasks

	def completed_assignments(course)
		completed_assignments = []

		self.assignments.each do |assignment|
			completed_assignments << assignment if assignment.course === course
		end

		completed_assignments
	end
end