class CoursesController < ApplicationController
    include LocationDrawer

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


    # Add possibility of giving names to assignments and possibly dependencies as well

    def create_from_outside
        params = JSON.parse(request.body.read.to_s)

        assignment_count = params["assignment_count"]
        name = params["course_name"]
        students = params["students"]

        @course = Course.new name: name

        if @course.valid? && validate_assignment_count(assignment_count) && validate_students(students)
            @course.save

            add_assignments_to_course_on_random_locations(assignment_count)
            add_students_to_course(students)

            render_json(201, "Course created successfully.", @course.token)

        elsif @course.invalid?
            render_json(400, "Invalid parameter for course_name: " + name + ".\nName must be at least 2 characters long.")

        elsif ! validate_assignment_count(assignment_count)
            render_json(400, "Invalid parameter for assignment_count: " + assignment_count.to_s + ".\nMust be between 1 and 500.")

        elsif ! validate_students(students)
            students.each do |student|
                s = Student.new student["firstName"], student["lastName"]

                render_json(400, "Array of given students is invalid!\nContains invalid student: " + student.to_s) if s.invalid?
            end

        else
            render_json(600, "Unexpected behavior from valid input.\nCourse was not created.")
        end
    end



    def create
        @course = Course.new(course_params)
        assignments = params[:assignments]

        if @course.valid? && validate_assignment_count(assignment_count)
            @course.save
            assignments.each { |assignment_json| add_assignment_to_course(assignment_json) }
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

        def validate_course_name(name)
            name.length >= 2
        end

        def validate_assignment_count(amount)
            amount >= 1 && amount < 500
        end

        def validate_students(students)
            students.each do |student|
                s = Student.new :firstName => student["firstName"], :lastName => student["lastName"]
                return false if s.invalid?
            end
            true
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

        def add_assignments_to_course_on_random_locations(assignment_count)
            prev_location = nil

            for i in 1..assignment_count do
                assignment = Assignment.create number: i
                assignment.location = LocationDrawer.next_location(i, prev_location, assignment_count)

                @course.assignments << assignment

                prev_location = assignment.location
            end
        end

        def add_students_to_course(students)
            students.each do |student|
                @course.students << (Student.create firstName: student["firstName"], lastName: student["lastName"])
            end
        end

        def render_json(code, message, token = nil)
          params = {:code => code, :message => message}
          params[:token] = token if token

          render json: params.to_json
        end
end