class AssignmentsController < ApplicationController

	def create
		course = Course.find(params[:course_id])
		location_json = params[:location]
		number = params[:number]
		dependencies_json_array = params[:dependencies]

		@assignment = []

		if course
			assignment = Assignment.create number: number
			assignment.location = Location.create x: location_json[:x], y: location_json[:y]

			if dependencies_json_array
				dependencies_json_array.each do |dependency_json|
					dependency = Assignment.find_by id: dependency_json[:id]

					assignment.dependencies << dependency if dependency
				end
			end

			course.assignments << assignment

			@assignment << assignment
		end

		render 'assignments/show.json.jbuilder'
	end

	def destroy
		assignment = Assignment.find params[:id]
		assignment.destroy if assignment

		render plain: "Assignment deleted"
	end

    def edit_name
        assignment= Assignment.find params[:assignment_id]
        assignment.name = params[:name]
        assignment.save
        
        render 'assignments/show.json.jbuilder'
    end

    def decrease_numbers
        course = Course.find_by id: params[:course_id]
        prev_location = Location.new(x: params[:location][:x], y: params[:location][:y])

        number = params[:number]

        assignments = course.assignments.sort_by {|a| a.number }

        for i in number - 1..assignments.length - 1
            assignment = assignments[i]

            decrease_number(assignment)
            prev_location = set_location_to_previous_location(assignment, prev_location)
        end

        @assignment = course.assignments

        render 'assignments/show.json.jbuilder'
    end

    private

    def decrease_number(assignment)
        assignment.number = assignment.number - 1
        assignment.save
    end

    def set_location_to_previous_location(assignment, prev_location)
        location = assignment.location
        next_prev = Location.new(x: location.x, y: location.y)

        location.x = prev_location.x
        location.y = prev_location.y

        location.save

        next_prev
    end
end