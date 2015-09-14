class MapController < ApplicationController
	
	def init
		course = Course.find_by id: params[:course_id]
		user = User.find_by id: params[:user_id]
		@course = []
		@current_user = []

		if course
			@course << course
			@participants = course.participants
			@assignments = course.assignments
		end

		@current_user << user if user
	end
end