class MapController < ApplicationController
	
	def action_init
		init
	end

	def init
		course = Course.find_by id: params[:course_id]
		student = Student.find_by id: params[:student_id]
		@course = []
		@current_student = []

		if course
			@course << course
			@students = course.students
			@assignments = course.assignments
		end

		@current_student << student if student
	end
end