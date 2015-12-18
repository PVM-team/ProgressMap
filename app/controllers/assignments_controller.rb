class AssignmentsController < ApplicationController

	def create
		course = Course.find params[:course_id]
		location = params[:location]

    @assignment = []

		if course
			assignment = Assignment.create name: params[:name], number: params[:number]
			assignment.location = Location.create x: location[:x], y: location[:y]
      
      course.assignments << assignment
      add_dependencies(assignment, params[:dependencies])
			
      @assignment << assignment
		end

		render 'assignments/show.json.jbuilder'
  end

	def destroy
		assignment = Assignment.find params[:id]
		assignment.destroy if assignment

		render plain: "Assignment deleted"
	end

  def update
    assignment = Assignment.find params[:id]
    assignment.name = params[:name]
    assignment.number = params[:number]

    assignment.dependencies.destroy_all
    add_dependencies(assignment, params[:dependencies])

    assignment.save
    @assignment = [assignment]

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

  def add_dependencies(assignment, new_dependencies)
    course_assignments = assignment.course.assignments.sort_by {|a| a.number}

    if new_dependencies
      new_dependencies.each do |dependency|
        a = course_assignments[dependency["number"] - 1]
        assignment.dependencies << a
      end
    end
  end
end