class MapController < ApplicationController
	
	def index
		course = nil
		@course = []

		begin
			course = Course.find(params[:course_id])
		rescue ActiveRecord::RecordNotFound => e
		end

		if course
			@course << course

			@participants = course.participants
			@assignments = course.assignments
			@locations = []

			@assignments.each { |assignment| @locations << assignment.location }
		end
	end
end