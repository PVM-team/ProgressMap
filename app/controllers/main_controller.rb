class MainController < ApplicationController
	
	def index
		#@course = Course.first
		#@students = @course.users
		#@assignments = Course.assignments
		#@locations = []

		#@assignments.each do |assignment|
		#	@locations << assignment.location
		#end

		render :map
	end
end