class CoursesController < ApplicationController

    def show
        course = Course.find_by id: params[:course_id]
        @course = []

        if course
            @assignments = course.assignments.order(:number)
            @students = course.students

            @course << course
        end

        render 'courses/show.json.jbuilder'
    end

    def create
        @course = Course.new(course_params)
        assignments = params[:assignments]

        begin
            validate_course_name
            validate_assignment_count(assignments.length)

        rescue ValidationError => e # What now?

        else	# Validations OK
            if @course.save
                assignments.each { |assignment_json| add_assignment_to_course(assignment_json) }
            end
        end

        render json: @course
    end

    def edit_name
        @course = Course.find params[:course_id]
        @course.name = params[:name]

        @course.save
        render 'courses/show.json.jbuilder'
    end


    private

        def course_params
            params.require(:course).permit(:name)
        end

        def validate_course_name
            raise ValidationError.new("Invalid course name: " + @course.name) if @course.name.length < 2
        end

        def validate_assignment_count(amount)
            raise ValidationError.new("Invalid amount of assignments: " + amount) if  amount < 1 or amount > 500
        end

        def add_assignment_to_course(assignment_json)
            location_json = assignment_json[:location]
            dependencies_json_array = assignment_json[:dependencies]

            assignment = Assignment.create number: assignment_json[:number]
            assignment.location = (Location.create x: location_json[:x], y: location_json[:y])

            if dependencies_json_array
                dependencies_json_array.each do |dependency_json|
                    dependency = Assignment.find_by id: dependency_json[:id]
                    assignment.dependencies << dependency if dependency
                end
            end

            @course.assignments << assignment
        end
end