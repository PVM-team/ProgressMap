class CoursesController < ApplicationController

    def show
        course = Course.find_by id: params[:course_id]
        @course = []

        if course
            @assignments = course.assignments
            @participants = course.participants
            @all_users = User.all

            @course << course
        end

        render 'courses/show.json.jbuilder'
    end

    def create
        @course = Course.new(course_params)
        assignments = params[:assignments]
        participants = params[:participants]

        begin
            validate_course_name
            validate_assignment_count(assignments.length)

        rescue ValidationError => e # What now?

        else	# Validations OK
            try_to_create_course(assignments, participants)
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

        def try_to_create_course(assignments, participants)

            if @course.save

                for i in 0..assignments.length - 1
                    add_assignment_to_course(assignments[i])
                end

                if participants
                    participants.each do |p|
                        user = User.find_by id: p[:id]
                        @course.participants << user if user
                    end
                end
            end
        end

        def add_assignment_to_course(assignment_json)
            location_json = assignment_json[:location]
            dependencies_json = assignment_json[:dependencies]

            assignment = Assignment.create number: assignment_json[:number]
            assignment.location = (Location.create x: location_json[:x], y: location_json[:y])

            for i in 0..dependencies_json.length - 1
                dependency = Assignment.find_by id: dependencies_json[i][:id]
                assignment.dependencies << dependency if dependency
            end

            @course.assignments << assignment
        end
end