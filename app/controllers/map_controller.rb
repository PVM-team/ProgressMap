class MapController < ApplicationController
	
	def init
		course = Course.find_by id: params[:course_id]
		@course = []

		if course
			@course << course

			@participants = course.participants
			@assignments = course.assignments
			@locations = []

			@assignments.each { |assignment| @locations << assignment.location }
		end
	end

	def view_as_user
		user = User.find_by id: params[:user_id]
		course = Course.find_by id: params[:course_id]

		@current_user = []
		@done_assignments = []
		@done_assignment_locations = []

		if user and course
			@current_user << user
			@done_assignments = user.completed_assignments(course)

			@done_assignments.each { |assignment| @done_assignment_locations << assignment.location }
		end
	end	
end