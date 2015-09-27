class AssignmentsController < ApplicationController

	def create
		@course = Course.find(params[:course_id])
		@assignment = []

		if @course
			location = define_location_of_the_inserted_assignment(@course)
			number = define_number_of_the_inserted_assignment(@course)

			assignment = Assignment.create number: number, location: location

			@course.assignments << assignment

			@assignment << assignment
		end

		render 'assignments/show.json.jbuilder'
	end

	def destroy
		assignment = Assignment.find params[:id]
		assignment.destroy if assignment

		render plain: "Assignment deleted"
	end
end

def define_location_of_the_inserted_assignment(course)
	location = Location.new x: 10, y: 10

	last_assignment = @course.assignments[@course.assignments.length - 1]

	if last_assignment
		last_assignment_loc = last_assignment.location

		if last_assignment_loc
			location = Location.new x: (last_assignment_loc.x + 10), y: (last_assignment_loc.y + 10)
		end
	end

	location
end

def define_number_of_the_inserted_assignment(course)
	number = 1

	last_assignment = course.assignments[course.assignments.length - 1]

	if last_assignment
		last_assignment_number = last_assignment.number

		number = last_assignment_number + 1 if last_assignment_number
	end

	number
end