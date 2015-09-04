class MainController < ApplicationController
	
	def map
		course = Course.first

		if course

			@participants = course.participants
			@assignments = course.assignments
			@locations = []

			@assignments.each { |assignment| @locations << assignment.location }
		end
	end
end